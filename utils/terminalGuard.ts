/**
 * utils/terminalGuard.ts
 * Motor de Detección de Comandos Destructivos y Limpieza de Prompts CLI
 * La Guía Linux — Ecosistema laguialinux.com
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

export type CopyMode = 'clean' | 'sudo' | 'single-line'
export type RiskLevel = 'danger' | 'critical'

export interface DestructiveCheckResult {
  isDestructive: boolean
  riskLevel?: RiskLevel
  reason?: string
  matchedPattern?: string
  matchedCommand?: string
}

/**
 * Catálogo exhaustivo de comandos y binarios comunes en GNU/Linux.
 * Permite discernir si un `# ` inicial corresponde a un prompt de root (# apt install)
 * o a un comentario explicativo (# Comentario de ayuda).
 */
export const COMMON_CLI_COMMANDS: string[] = [
  // Gestores de paquetes
  'apt', 'apt-get', 'apt-cache', 'dpkg', 'dnf', 'yum', 'rpm', 'pacman',
  'zypper', 'apk', 'flatpak', 'snap', 'pip', 'pip3', 'npm', 'pnpm', 'yarn', 'cargo',
  // Control de servicios y sistema
  'systemctl', 'service', 'journalctl', 'systemd', 'init', 'hostnamectl',
  'timedatectl', 'localectl', 'sysctl', 'loginctl',
  // Archivos y directorios
  'rm', 'cd', 'ls', 'mkdir', 'rmdir', 'cat', 'grep', 'egrep', 'fgrep',
  'chmod', 'chown', 'chgrp', 'echo', 'touch', 'nano', 'vim', 'vi', 'cp',
  'mv', 'ln', 'find', 'sed', 'awk', 'head', 'tail', 'less', 'more', 'tee',
  // Redes y cortafuegos
  'ip', 'ss', 'netstat', 'curl', 'wget', 'ping', 'traceroute', 'ufw',
  'iptables', 'nft', 'firewall-cmd', 'ssh', 'scp', 'rsync', 'dig', 'nslookup',
  // Discos y almacenamiento
  'dd', 'mount', 'umount', 'fdisk', 'parted', 'gdisk', 'wipefs', 'mkfs',
  'mkswap', 'swapon', 'swapoff', 'df', 'du', 'free', 'lsblk', 'blkid',
  'shred', 'badblocks', 'e2fsck', 'fsck',
  // Procesos y monitorización
  'ps', 'kill', 'pkill', 'killall', 'top', 'htop', 'btop', 'crontab', 'nohup',
  // Usuarios y permisos
  'useradd', 'usermod', 'userdel', 'groupadd', 'groupmod', 'groupdel',
  'passwd', 'su', 'sudo', 'id', 'whoami',
  // Módulos de kernel y arranque
  'modprobe', 'lsmod', 'rmmod', 'dmesg', 'uname', 'update-grub', 'grub-install',
  // Shell y entornos
  'export', 'source', 'env', 'alias', 'unalias', 'which', 'whereis',
  'tar', 'gzip', 'gunzip', 'bzip2', 'xz', 'unzip', 'zip', 'git', 'docker', 'podman'
]

// Expresión regular generada para prompts de root
const ESCAPED_CLI_COMMANDS = COMMON_CLI_COMMANDS.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
export const ROOT_CLI_PROMPT_REGEX = new RegExp(`^(\\s*)#\\s+(?=(?:${ESCAPED_CLI_COMMANDS})\\b)`, 'gm')

/**
 * Patrones de detección de operaciones de alto riesgo destructivo
 */
export const DESTRUCTIVE_COMMAND_PATTERNS: Array<{
  regex: RegExp
  riskLevel: RiskLevel
  description: string
}> = [
  {
    regex: /\brm\s+(?:-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*|-[a-zA-Z]*\s+-[a-zA-Z]*|--recursive\s+--force|--force\s+--recursive)\s+(?:--no-preserve-root\s+)?(?:\/|\/\*|\.|\.\/|\*)(?:\s|$)/i,
    riskLevel: 'critical',
    description: 'Borrado recursivo y forzado irreversible sobre la raíz o directorio actual (rm -rf).'
  },
  {
    regex: /\bdd\s+.*?\bof\s*=\s*\/dev\/(?:sd[a-z]\d*|nvme\d+n\d+(?:p\d+)?|hd[a-z]\d*|vd[a-z]\d*|xvd[a-z]\d*|mmcblk\d+(?:p\d+)?|mapper\/[a-zA-Z0-9_-]+|loop\d+)/i,
    riskLevel: 'critical',
    description: 'Escritura directa de bloques a disco físico o partición mediante dd.'
  },
  {
    regex: /\b(?:mkfs(?:\.[a-z0-9]+)?|mkswap)\s+.*?(?:\/dev\/)/i,
    riskLevel: 'critical',
    description: 'Creación de sistema de archivos o área swap destruyendo el contenido de la partición.'
  },
  {
    regex: /\b(?:wipefs|sgdisk|fdisk|parted|gdisk)\s+.*?(?:\/dev\/)/i,
    riskLevel: 'danger',
    description: 'Manipulación o aniquilación de la tabla de particiones del disco físico.'
  },
  {
    regex: /\bshred\s+.*?(?:\/dev\/(?:sd[a-z]\d*|nvme\d+n\d+(?:p\d+)?|hd[a-z]\d*|vd[a-z]\d*|xvd[a-z]\d*|mmcblk\d+(?:p\d+)?))/i,
    riskLevel: 'critical',
    description: 'Sobrescritura destructiva de bajo nivel (shred) sobre disco físico.'
  },
  {
    regex: /\b(?:lvremove|vgremove|pvremove)\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?/i,
    riskLevel: 'critical',
    description: 'Eliminación permanente o desmontaje forzado de volúmenes LVM.'
  },
  {
    regex: /\b(?:zpool\s+destroy|zfs\s+destroy(?:\s+-[a-zA-Z]*r[a-zA-Z]*)?)\b/i,
    riskLevel: 'critical',
    description: 'Destrucción completa e irreversible de pools o datasets ZFS.'
  },
  {
    regex: /\bbtrfs\s+(?:subvolume\s+delete|device\s+delete)\b/i,
    riskLevel: 'danger',
    description: 'Eliminación irreversible de subvolumen o dispositivo de almacenamiento Btrfs.'
  },
  {
    regex: /\bchmod\s+(?:-[a-zA-Z]*R[a-zA-Z]*|--recursive)\s+(?:0?777)\s+(?:\/|\/\*)(?:\s|$)/i,
    riskLevel: 'critical',
    description: 'Asignación masiva y recursiva de permisos 777 sobre la raíz del sistema.'
  },
  {
    regex: />\s*\/dev\/(?:sd[a-z]\d*|nvme\d+n\d+(?:p\d+)?|hd[a-z]\d*|vd[a-z]\d*|xvd[a-z]\d*|mmcblk\d+(?:p\d+)?)/i,
    riskLevel: 'critical',
    description: 'Redirección destructiva directa hacia un dispositivo de bloques.'
  },
  {
    regex: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
    riskLevel: 'critical',
    description: 'Fork-bomb clásica capaz de agotar la tabla de procesos del sistema.'
  }
]

/**
 * Limpia los prefijos de prompt interactivo de las líneas de comandos.
 * Preserva estrictamente comentarios bash (# comentario) y shebangs (#!/bin/bash).
 */
export function stripCliPrompts(command: string): string {
  if (!command || typeof command !== 'string') return ''

  return command
    // 1. Prompt estándar de usuario: $ comando
    .replace(/^\s*\$\s+/gm, '')
    // 2. Prompt completo usuario@host:~$ o usuario@host:/ruta#
    .replace(/^\s*[\w.-]+@[\w.-]+:[~/\w.-]*[$#]\s+/gm, '')
    // 3. Prompt de REPL interactivo: >>> comando
    .replace(/^\s*>>>(?:\s+|$)/gm, '')
    // 4. Prompt de root (# comando), únicamente si va seguido de un binario reconocido
    .replace(ROOT_CLI_PROMPT_REGEX, '$1')
}

/**
 * Evalúa si una cadena contiene algún comando de alto riesgo destructivo.
 * Ignora líneas de comentarios explicativos.
 */
export function isDestructiveCommand(command: string): DestructiveCheckResult {
  if (!command || typeof command !== 'string') {
    return { isDestructive: false }
  }

  const lines = command.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.trim()
    // Omitir líneas vacías o comentarios puros
    if (!line || line.startsWith('#')) {
      continue
    }

    for (const pattern of DESTRUCTIVE_COMMAND_PATTERNS) {
      if (pattern.regex.test(line)) {
        return {
          isDestructive: true,
          riskLevel: pattern.riskLevel,
          reason: pattern.description,
          matchedPattern: pattern.regex.source,
          matchedCommand: line
        }
      }
    }
  }

  return { isDestructive: false }
}

/**
 * Formatea un bloque de comandos según el modo de copiado seleccionado:
 * - 'clean': elimina prompts interactivos y limpia espacios.
 * - 'sudo': añade el prefijo 'sudo ' a las líneas ejecutables que no lo tengan, preservando comentarios.
 * - 'single-line': une comandos con ' && ', eliminando comentarios y líneas en blanco.
 */
export function formatCommand(rawText: string, mode: CopyMode = 'clean'): string {
  let clean = stripCliPrompts(rawText).trim()

  if (mode === 'sudo') {
    const lines = clean.split('\n').map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return line
      return trimmed.startsWith('sudo ') ? trimmed : `sudo ${trimmed}`
    })
    clean = lines.join('\n')
  } else if (mode === 'single-line') {
    const lines = clean
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'))
    clean = lines.join(' && ')
  }

  return clean
}
