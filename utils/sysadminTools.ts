/**
 * utils/sysadminTools.ts
 * Suite de herramientas y motores de cálculo sysadmin 100% client-side para La Guía Linux
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

// ============================================================================
// 1. CALCULADORA DE PERMISOS CHMOD Y UMASK
// ============================================================================

export interface PermissionTriplet {
  read: boolean
  write: boolean
  execute: boolean
}

export interface PermissionSpecial {
  suid: boolean   // 4000
  sgid: boolean   // 2000
  sticky: boolean // 1000
}

export interface PermissionMatrix {
  user: PermissionTriplet
  group: PermissionTriplet
  others: PermissionTriplet
  special: PermissionSpecial
}

export interface ChmodResult {
  octal3: string           // "755"
  octal4: string           // "0755" o "4755"
  symbolic: string         // "-rwxr-xr-x"
  chmodCommand: string     // "chmod 755 <fichero_o_directorio>"
  suggestedUmask: string   // "0022"
  dirEffective: string     // "drwxr-xr-x"
  fileEffective: string    // "-rw-r--r--"
  humanExplanation: string
  securityWarning: string | null
}

export interface ChmodPreset {
  label: string
  octal: string
  description: string
  badge?: 'seguro' | 'común' | 'peligro'
}

export const CHMOD_PRESETS: ChmodPreset[] = [
  { label: '755', octal: '755', description: 'Scripts y binarios públicos. Propietario rwx; grupo y otros rx.', badge: 'seguro' },
  { label: '644', octal: '644', description: 'Archivos planos y configuración web. Propietario rw; otros solo lectura.', badge: 'común' },
  { label: '700', octal: '700', description: 'Privado para el propietario. Claves SSH privadas o scripts personales.', badge: 'seguro' },
  { label: '600', octal: '600', description: 'Archivos confidenciales (ej. .env, id_rsa). Solo propietario rw.', badge: 'seguro' },
  { label: '775', octal: '775', description: 'Directorios de colaboración en equipo con grupo compartido.', badge: 'común' },
  { label: '777', octal: '777', description: 'Acceso total para todos los usuarios. Peligro de seguridad.', badge: 'peligro' },
]

export function tripletToOctal(t: PermissionTriplet): number {
  return (t.read ? 4 : 0) + (t.write ? 2 : 0) + (t.execute ? 1 : 0)
}

export function octalToTriplet(val: number): PermissionTriplet {
  return {
    read: (val & 4) !== 0,
    write: (val & 2) !== 0,
    execute: (val & 1) !== 0,
  }
}

export function calculateChmod(matrix: PermissionMatrix): ChmodResult {
  let special = 0
  if (matrix.special.suid) special += 4
  if (matrix.special.sgid) special += 2
  if (matrix.special.sticky) special += 1

  const u = tripletToOctal(matrix.user)
  const g = tripletToOctal(matrix.group)
  const o = tripletToOctal(matrix.others)

  const octal3 = `${u}${g}${o}`
  const octal4 = `${special}${u}${g}${o}`

  // Formato simbólico
  const symChars = [
    matrix.user.read ? 'r' : '-',
    matrix.user.write ? 'w' : '-',
    matrix.special.suid ? (matrix.user.execute ? 's' : 'S') : (matrix.user.execute ? 'x' : '-'),
    matrix.group.read ? 'r' : '-',
    matrix.group.write ? 'w' : '-',
    matrix.special.sgid ? (matrix.group.execute ? 's' : 'S') : (matrix.group.execute ? 'x' : '-'),
    matrix.others.read ? 'r' : '-',
    matrix.others.write ? 'w' : '-',
    matrix.special.sticky ? (matrix.others.execute ? 't' : 'T') : (matrix.others.execute ? 'x' : '-'),
  ]
  const symbolic = `-${symChars.join('')}`

  // Cálculo inverso de umask a partir de máscara base 0777
  const umaskU = 7 - u
  const umaskG = 7 - g
  const umaskO = 7 - o
  const suggestedUmask = `0${umaskU}${umaskG}${umaskO}`

  // Permisos efectivos de directorio (base 0777 & ~umask) y archivo (base 0666 & ~umask)
  const umaskInt = parseInt(suggestedUmask, 8)
  const dirBits = 0o777 & ~umaskInt
  const fileBits = 0o666 & ~umaskInt

  const bitsToTripletString = (bits: number) => {
    const r = (bits & 4) ? 'r' : '-'
    const w = (bits & 2) ? 'w' : '-'
    const x = (bits & 1) ? 'x' : '-'
    return `${r}${w}${x}`
  }

  const dirEffective = `d${bitsToTripletString((dirBits >> 6) & 7)}${bitsToTripletString((dirBits >> 3) & 7)}${bitsToTripletString(dirBits & 7)}`
  const fileEffective = `-${bitsToTripletString((fileBits >> 6) & 7)}${bitsToTripletString((fileBits >> 3) & 7)}${bitsToTripletString(fileBits & 7)}`

  // Advertencias de seguridad y explicación
  let securityWarning: string | null = null
  if (u === 7 && g === 7 && o === 7) {
    securityWarning = 'Peligro (777): Cualquier usuario o proceso en el sistema puede modificar y ejecutar este archivo. No recomendado en producción.'
  } else if (matrix.special.suid && (matrix.others.write || matrix.group.write)) {
    securityWarning = 'Alerta SUID: El bit SUID activo con permisos de escritura para terceros presenta riesgo de escalada de privilegios a root.'
  } else if ((o & 2) !== 0) {
    securityWarning = 'Advertencia: El grupo "Otros" tiene permisos de escritura. Cualquier usuario no autenticado podría alterar el fichero.'
  }

  const humanExplanation = explainPermissions(special, u, g, o)

  return {
    octal3,
    octal4,
    symbolic,
    chmodCommand: `chmod ${special > 0 ? octal4 : octal3} <fichero_o_directorio>`,
    suggestedUmask,
    dirEffective,
    fileEffective,
    humanExplanation,
    securityWarning,
  }
}

export function octalToMatrix(rawOctal: string): PermissionMatrix {
  const clean = rawOctal.trim().replace(/^0+/, '')
  const padded = clean.padStart(3, '0')
  let special = 0
  let u = 0
  let g = 0
  let o = 0

  if (padded.length === 4) {
    special = parseInt(padded[0], 10) || 0
    u = parseInt(padded[1], 10) || 0
    g = parseInt(padded[2], 10) || 0
    o = parseInt(padded[3], 10) || 0
  } else {
    u = parseInt(padded[0], 10) || 0
    g = parseInt(padded[1], 10) || 0
    o = parseInt(padded[2], 10) || 0
  }

  return {
    user: octalToTriplet(u),
    group: octalToTriplet(g),
    others: octalToTriplet(o),
    special: {
      suid: (special & 4) !== 0,
      sgid: (special & 2) !== 0,
      sticky: (special & 1) !== 0,
    },
  }
}

export function symbolicToMatrix(symbolicStr: string): PermissionMatrix {
  let s = symbolicStr.trim()
  if (s.startsWith('-') || s.startsWith('d') || s.startsWith('l')) {
    s = s.substring(1)
  }
  s = s.padEnd(9, '-')

  const uExecChar = s[2]
  const gExecChar = s[5]
  const oExecChar = s[8]

  return {
    user: {
      read: s[0] === 'r',
      write: s[1] === 'w',
      execute: uExecChar === 'x' || uExecChar === 's',
    },
    group: {
      read: s[3] === 'r',
      write: s[4] === 'w',
      execute: gExecChar === 'x' || gExecChar === 's',
    },
    others: {
      read: s[6] === 'r',
      write: s[7] === 'w',
      execute: oExecChar === 'x' || oExecChar === 't',
    },
    special: {
      suid: uExecChar === 's' || uExecChar === 'S',
      sgid: gExecChar === 's' || gExecChar === 'S',
      sticky: oExecChar === 't' || oExecChar === 'T',
    },
  }
}

function explainPermissions(special: number, u: number, g: number, o: number): string {
  const parts: string[] = []

  const describeTriplet = (val: number) => {
    if (val === 7) return 'control total (lectura, escritura y ejecución)'
    if (val === 6) return 'lectura y escritura'
    if (val === 5) return 'lectura y ejecución'
    if (val === 4) return 'solo lectura'
    if (val === 3) return 'escritura y ejecución'
    if (val === 2) return 'solo escritura'
    if (val === 1) return 'solo ejecución'
    return 'acceso completamente denegado'
  }

  parts.push(`El propietario tiene ${describeTriplet(u)}.`)
  parts.push(`El grupo asignado tiene ${describeTriplet(g)}.`)
  parts.push(`El resto de usuarios (otros) tienen ${describeTriplet(o)}.`)

  if (special > 0) {
    const specialDetails: string[] = []
    if (special & 4) specialDetails.push('SUID (se ejecuta con los privilegios del propietario)')
    if (special & 2) specialDetails.push('SGID (se ejecuta con los privilegios del grupo)')
    if (special & 1) specialDetails.push('Sticky Bit (solo el creador puede borrar ficheros)')
    parts.push(`Bits especiales activos: ${specialDetails.join(', ')}.`)
  }

  return parts.join(' ')
}

// ============================================================================
// 2. GENERADOR, VALIDADOR Y TRADUCTOR DE CRONTAB
// ============================================================================

export interface CronSchedule {
  minute: string      // 0-59, *, */5
  hour: string        // 0-23, *, 1,2
  dayOfMonth: string  // 1-31, *
  month: string       // 1-12, *
  dayOfWeek: string   // 0-7, *
  command: string
}

export interface CronPreset {
  label: string
  expression: string
  description: string
}

export interface CronParseResult {
  isValid: boolean
  expression: string
  command: string
  fullLine: string
  humanExplanation: string
  nextRuns: Date[]
  errors: string[]
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Cada minuto', expression: '* * * * *', description: 'Ejecutar continuamente cada 60 segundos' },
  { label: 'Cada 5 minutos', expression: '*/5 * * * *', description: 'Ejecutar cada 5 minutos' },
  { label: 'Cada 15 minutos', expression: '*/15 * * * *', description: 'Ejecutar al inicio de cada cuarto de hora' },
  { label: 'Cada hora en punto', expression: '0 * * * *', description: 'Al minuto cero de cada hora' },
  { label: 'Diario a medianoche', expression: '0 0 * * *', description: 'Todos los días a las 00:00 AM' },
  { label: 'Diario a las 02:00 AM', expression: '0 2 * * *', description: 'Madrugadas para tareas de backup' },
  { label: 'Lunes a Viernes a las 08:00 AM', expression: '0 8 * * 1-5', description: 'Días laborables por la mañana' },
  { label: 'Domingos a las 03:00 AM', expression: '0 3 * * 0', description: 'Mantenimiento semanal' },
  { label: 'Día 1 de cada mes a las 00:00', expression: '0 0 1 * *', description: 'Cierre mensual' },
]

export function validateCronField(value: string, min: number, max: number, isDow = false): boolean {
  const v = value.trim()
  if (v === '*') return true

  // Manejo de listas separadas por coma
  if (v.includes(',')) {
    const parts = v.split(',')
    if (parts.some(sub => sub.trim() === '')) return false
    return parts.every(sub => validateCronField(sub, min, max, isDow))
  }

  // Manejo de pasos */X o 1-5/2
  if (v.includes('/')) {
    const parts = v.split('/')
    if (parts.length !== 2) return false
    const [range, stepStr] = parts
    if (!/^\d+$/.test(stepStr)) return false
    const step = parseInt(stepStr, 10)
    if (isNaN(step) || step <= 0) return false
    return range === '*' || validateCronField(range, min, max, isDow)
  }

  // Manejo de rangos X-Y
  if (v.includes('-')) {
    const parts = v.split('-')
    if (parts.length !== 2) return false
    const [startStr, endStr] = parts
    if (!/^\d+$/.test(startStr) || !/^\d+$/.test(endStr)) return false
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)
    if (isNaN(start) || isNaN(end)) return false
    return start >= min && end <= max && start <= end
  }

  // Número simple
  if (!/^\d+$/.test(v)) return false
  const num = parseInt(v, 10)
  return num >= min && num <= max
}

export function parseCronExpression(expression: string, command = '/usr/local/bin/tarea.sh'): CronParseResult {
  const fields = expression.trim().split(/\s+/)
  const errors: string[] = []

  if (fields.length !== 5) {
    return {
      isValid: false,
      expression,
      command,
      fullLine: `${expression} ${command}`,
      humanExplanation: 'Sintaxis inválida: una expresión cron estándar debe contener exactamente 5 campos.',
      nextRuns: [],
      errors: ['Se requieren exactamente 5 campos: minuto hora día-mes mes día-semana.'],
    }
  }

  const [min, hour, dom, month, dow] = fields

  if (!validateCronField(min, 0, 59)) errors.push(`Campo de minuto inválido: "${min}" (debe ser 0-59, *, */n o rango).`)
  if (!validateCronField(hour, 0, 23)) errors.push(`Campo de hora inválido: "${hour}" (debe ser 0-23, *, */n o rango).`)
  if (!validateCronField(dom, 1, 31)) errors.push(`Campo de día del mes inválido: "${dom}" (debe ser 1-31, * o rango).`)
  if (!validateCronField(month, 1, 12)) errors.push(`Campo de mes inválido: "${month}" (debe ser 1-12, * o rango).`)
  if (!validateCronField(dow, 0, 7, true)) errors.push(`Campo de día de la semana inválido: "${dow}" (debe ser 0-7, donde 0 o 7 es domingo).`)

  const isValid = errors.length === 0
  const humanExplanation = isValid ? humanizeCron(expression) : 'Expresión cron no válida.'
  const nextRuns = isValid ? calculateNextCronRuns(expression, 5) : []

  return {
    isValid,
    expression,
    command,
    fullLine: `${expression} ${command}`,
    humanExplanation,
    nextRuns,
    errors,
  }
}

export function humanizeCron(expr: string): string {
  const fields = expr.trim().split(/\s+/)
  if (fields.length !== 5) return 'Expresión desconocida'

  const [min, hour, dom, month, dow] = fields

  // Casos comunes exactos
  if (expr === '* * * * *') return 'Cada minuto de todos los días de forma continua.'
  if (expr === '*/5 * * * *') return 'Cada 5 minutos de forma ininterrumpida.'
  if (expr === '*/15 * * * *') return 'Cada 15 minutos en todos los días.'
  if (expr === '0 * * * *') return 'Cada hora en punto (minuto 00).'
  if (expr === '0 0 * * *') return 'Todos los días exactamente a medianoche (00:00).'
  if (expr === '0 2 * * *') return 'Todos los días a las 02:00 AM de la madrugada.'
  if (expr === '0 8 * * 1-5') return 'De lunes a viernes a las 08:00 AM en días laborales.'
  if (expr === '0 3 * * 0') return 'Todos los domingos a las 03:00 AM para tareas semanales.'
  if (expr === '0 0 1 * *') return 'El primer día de cada mes a medianoche (00:00).'

  // Síntesis gramatical en castellano
  let timeStr = ''
  if (min === '*' && hour === '*') {
    timeStr = 'cada minuto'
  } else if (min.startsWith('*/') && hour === '*') {
    timeStr = `cada ${min.replace('*/', '')} minutos`
  } else if (min === '0' && hour.startsWith('*/')) {
    timeStr = `cada ${hour.replace('*/', '')} horas en punto`
  } else if (!min.includes('*') && !hour.includes('*')) {
    const padMin = min.padStart(2, '0')
    const padHour = hour.padStart(2, '0')
    timeStr = `a las ${padHour}:${padMin}`
  } else {
    timeStr = `en el minuto ${min} y hora ${hour}`
  }

  let dayStr = ''
  if (dow === '1-5') {
    dayStr = 'de lunes a viernes'
  } else if (dow === '0' || dow === '7') {
    dayStr = 'los domingos'
  } else if (dow === '6') {
    dayStr = 'los sábados'
  } else if (dow !== '*') {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    dayStr = `los días de la semana (${dow.split(',').map(d => days[parseInt(d, 10)] || d).join(', ')})`
  }

  let domStr = ''
  if (dom !== '*') {
    domStr = `el día ${dom} del mes`
  }

  let monthStr = ''
  if (month !== '*') {
    const months = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    monthStr = `en ${month.split(',').map(m => months[parseInt(m, 10)] || m).join(', ')}`
  }

  const qualifiers = [timeStr, dayStr, domStr, monthStr].filter(Boolean)
  return `Se ejecuta ${qualifiers.join(', ')}.`
}

function matchesFieldUnit(val: number, pattern: string, min: number, max: number, isDow = false): boolean {
  if (pattern === '*') return true

  if (pattern.includes(',')) {
    return pattern.split(',').some(p => matchesFieldUnit(val, p, min, max, isDow))
  }

  if (pattern.includes('/')) {
    const [range, stepStr] = pattern.split('/')
    const step = parseInt(stepStr, 10)
    if (range === '*') {
      return (val - min) % step === 0
    }
    const [startStr, endStr] = range.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)
    return val >= start && val <= end && (val - start) % step === 0
  }

  if (pattern.includes('-')) {
    const [startStr, endStr] = pattern.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)
    return val >= start && val <= end
  }

  const parsed = parseInt(pattern, 10)
  if (isDow && (parsed === 0 || parsed === 7) && (val === 0 || val === 7)) {
    return true
  }
  return val === parsed
}

export function calculateNextCronRuns(expr: string, count = 5, fromDate: Date = new Date()): Date[] {
  const fields = expr.trim().split(/\s+/)
  if (fields.length !== 5) return []

  const [minPat, hourPat, domPat, monthPat, dowPat] = fields
  const results: Date[] = []

  // Comenzar en el siguiente minuto completo
  const current = new Date(fromDate.getTime())
  current.setSeconds(0, 0)
  current.setMinutes(current.getMinutes() + 1)

  let iterations = 0
  const MAX_ITERATIONS = 120_000 // Máximo ~83 días hacia adelante para evitar bloqueos

  while (results.length < count && iterations < MAX_ITERATIONS) {
    iterations++

    const m = current.getMinutes()
    const h = current.getHours()
    const dom = current.getDate()
    const mon = current.getMonth() + 1
    const dow = current.getDay() // 0 = Domingo, 1 = Lunes

    const matchMon = matchesFieldUnit(mon, monthPat, 1, 12)
    if (!matchMon) {
      // Salto al siguiente mes si no coincide
      current.setMonth(current.getMonth() + 1, 1)
      current.setHours(0, 0, 0, 0)
      continue
    }

    const matchDom = matchesFieldUnit(dom, domPat, 1, 31)
    const matchDow = matchesFieldUnit(dow, dowPat, 0, 7, true)

    // En cron: si ambos están restringidos, coincide cualquiera de los dos (OR). Si uno es *, coincide el otro.
    let matchDay = false
    if (domPat === '*' && dowPat === '*') {
      matchDay = true
    } else if (domPat === '*') {
      matchDay = matchDow
    } else if (dowPat === '*') {
      matchDay = matchDom
    } else {
      matchDay = matchDom || matchDow
    }

    if (!matchDay) {
      // Salto al siguiente día
      current.setDate(current.getDate() + 1)
      current.setHours(0, 0, 0, 0)
      continue
    }

    const matchHour = matchesFieldUnit(h, hourPat, 0, 23)
    if (!matchHour) {
      // Salto a la siguiente hora
      current.setHours(current.getHours() + 1, 0, 0, 0)
      continue
    }

    const matchMin = matchesFieldUnit(m, minPat, 0, 59)
    if (matchMin) {
      results.push(new Date(current.getTime()))
    }

    current.setMinutes(current.getMinutes() + 1)
  }

  return results
}

// ============================================================================
// 3. BUSCADOR DE EQUIVALENCIAS WINDOWS ↔ LINUX
// ============================================================================

export interface SoftwareEquivalence {
  id: string
  windowsApp: string
  category: 'Ofimática' | 'Diseño Gráfico' | 'Desarrollo' | 'Multimedia' | 'Utilidades' | 'Internet'
  description: string
  linuxAlternatives: Array<{
    name: string
    isRecommended: boolean
    license: 'GPLv3' | 'GPLv2' | 'MIT' | 'Apache 2.0' | 'MPL 2.0' | 'LGPL' | 'Freeware'
    website: string
    installCommands: {
      apt?: string
      pacman?: string
      flatpak?: string
    }
    notes: string
  }>
}

export const EQUIVALENCES_DATABASE: SoftwareEquivalence[] = [
  {
    id: 'eq-photoshop',
    windowsApp: 'Adobe Photoshop',
    category: 'Diseño Gráfico',
    description: 'Edición y retoque fotográfico avanzado, capas y diseño de mapa de bits.',
    linuxAlternatives: [
      {
        name: 'GIMP',
        isRecommended: true,
        license: 'GPLv3',
        website: 'https://www.gimp.org',
        installCommands: {
          apt: 'sudo apt install gimp',
          pacman: 'sudo pacman -S gimp',
          flatpak: 'flatpak install flathub org.gimp.GIMP',
        },
        notes: 'Editor raster histórico de GNU con capas, pinceles y soporte para scripts Python.',
      },
      {
        name: 'Krita',
        isRecommended: false,
        license: 'GPLv3',
        website: 'https://krita.org',
        installCommands: {
          apt: 'sudo apt install krita',
          pacman: 'sudo pacman -S krita',
          flatpak: 'flatpak install flathub org.kde.krita',
        },
        notes: 'Especializado en pintura e ilustración digital profesional, con soporte CMYK y PSD.',
      },
    ],
  },
  {
    id: 'eq-office',
    windowsApp: 'Microsoft Office (Word / Excel / PowerPoint)',
    category: 'Ofimática',
    description: 'Suite ofimática para documentos de texto, hojas de cálculo y presentaciones.',
    linuxAlternatives: [
      {
        name: 'LibreOffice',
        isRecommended: true,
        license: 'MPL 2.0',
        website: 'https://www.libreoffice.org',
        installCommands: {
          apt: 'sudo apt install libreoffice libreoffice-l10n-es',
          pacman: 'sudo pacman -S libreoffice-fresh libreoffice-fresh-es',
          flatpak: 'flatpak install flathub org.libreoffice.LibreOffice',
        },
        notes: 'La suite de referencia del software libre. Excelente compatibilidad con formatos DOCX, XLSX y PPTX.',
      },
      {
        name: 'OnlyOffice Desktop',
        isRecommended: false,
        license: 'GPLv3',
        website: 'https://www.onlyoffice.com',
        installCommands: {
          apt: 'sudo apt install onlyoffice-desktopeditors',
          flatpak: 'flatpak install flathub org.onlyoffice.desktopeditors',
        },
        notes: 'Interfaz moderna muy cercana a Microsoft 365 y compatibilidad casi perfecta con archivos OOXML.',
      },
    ],
  },
  {
    id: 'eq-notepadpp',
    windowsApp: 'Notepad++',
    category: 'Desarrollo',
    description: 'Editor de texto ligero y versátil con resaltado de sintaxis para múltiples lenguajes.',
    linuxAlternatives: [
      {
        name: 'Kate',
        isRecommended: true,
        license: 'LGPL',
        website: 'https://kate-editor.org',
        installCommands: {
          apt: 'sudo apt install kate',
          pacman: 'sudo pacman -S kate',
          flatpak: 'flatpak install flathub org.kde.kate',
        },
        notes: 'Editor del ecosistema KDE extremadamente rápido, con terminal embebida y soporte LSP.',
      },
      {
        name: 'Notepadqq',
        isRecommended: false,
        license: 'GPLv3',
        website: 'https://notepadqq.com',
        installCommands: {
          apt: 'sudo apt install notepadqq',
          pacman: 'sudo pacman -S notepadqq',
        },
        notes: 'Clon exacto de la apariencia y atajos de Notepad++ adaptado para Linux.',
      },
    ],
  },
  {
    id: 'eq-putty',
    windowsApp: 'PuTTY',
    category: 'Desarrollo',
    description: 'Cliente SSH y Telnet para conexión remota a servidores.',
    linuxAlternatives: [
      {
        name: 'OpenSSH (Nativo en Consola)',
        isRecommended: true,
        license: 'GPLv2',
        website: 'https://www.openssh.com',
        installCommands: {
          apt: 'sudo apt install openssh-client',
          pacman: 'sudo pacman -S openssh',
        },
        notes: 'Integrado de fábrica en la terminal: ejecuta "ssh usuario@servidor" sin necesidad de programas externos.',
      },
      {
        name: 'Remmina',
        isRecommended: false,
        license: 'GPLv2',
        website: 'https://remmina.org',
        installCommands: {
          apt: 'sudo apt install remmina remmina-plugin-rdp remmina-plugin-ssh',
          pacman: 'sudo pacman -S remmina',
          flatpak: 'flatpak install flathub org.remmina.Remmina',
        },
        notes: 'Gestor gráfico de conexiones remotas con soporte para SSH, RDP y VNC.',
      },
    ],
  },
  {
    id: 'eq-premiere',
    windowsApp: 'Adobe Premiere / Sony Vegas',
    category: 'Multimedia',
    description: 'Edición no lineal de vídeo profesional y montaje multipista.',
    linuxAlternatives: [
      {
        name: 'Kdenlive',
        isRecommended: true,
        license: 'GPLv3',
        website: 'https://kdenlive.org',
        installCommands: {
          apt: 'sudo apt install kdenlive',
          pacman: 'sudo pacman -S kdenlive',
          flatpak: 'flatpak install flathub org.kde.kdenlive',
        },
        notes: 'Editor de vídeo libre maduro con aceleración por hardware, soporte 4K y cientos de efectos.',
      },
      {
        name: 'DaVinci Resolve',
        isRecommended: false,
        license: 'Freeware',
        website: 'https://www.blackmagicdesign.com',
        installCommands: {
          apt: 'Descargar instalador oficial para Linux desde Blackmagic Design',
        },
        notes: 'Potencia cinematográfica estándar de la industria disponible de forma nativa en Linux.',
      },
    ],
  },
  {
    id: 'eq-totalcommander',
    windowsApp: 'Total Commander',
    category: 'Utilidades',
    description: 'Administrador de ficheros de doble panel optimizado para uso intensivo de teclado.',
    linuxAlternatives: [
      {
        name: 'Double Commander',
        isRecommended: true,
        license: 'GPLv2',
        website: 'https://doublecmd.sourceforge.io',
        installCommands: {
          apt: 'sudo apt install doublecmd-gtk',
          pacman: 'sudo pacman -S doublecmd-gtk2',
        },
        notes: 'Doble panel con pestañas, visor interno y herramientas de renombrado masivo.',
      },
      {
        name: 'Midnight Commander (mc)',
        isRecommended: false,
        license: 'GPLv3',
        website: 'https://midnight-commander.org',
        installCommands: {
          apt: 'sudo apt install mc',
          pacman: 'sudo pacman -S mc',
        },
        notes: 'El clásico gestor en modo texto/consola (TUI), perfecto para servidores remotos por SSH.',
      },
    ],
  },
  {
    id: 'eq-7zip',
    windowsApp: 'WinRAR / 7-Zip',
    category: 'Utilidades',
    description: 'Compresión y descompresión de archivos ZIP, RAR, 7Z y TAR.',
    linuxAlternatives: [
      {
        name: 'p7zip / File-Roller / Ark',
        isRecommended: true,
        license: 'LGPL',
        website: 'https://www.7-zip.org',
        installCommands: {
          apt: 'sudo apt install p7zip-full unrar tar gzip',
          pacman: 'sudo pacman -S p7zip unrar',
        },
        notes: 'Soporte universal para formatos comprimidos totalmente integrado en el gestor de archivos.',
      },
    ],
  },
  {
    id: 'eq-utorrent',
    windowsApp: 'uTorrent / BitTorrent',
    category: 'Internet',
    description: 'Cliente de descarga P2P mediante la red BitTorrent.',
    linuxAlternatives: [
      {
        name: 'Transmission',
        isRecommended: true,
        license: 'GPLv2',
        website: 'https://transmissionbt.com',
        installCommands: {
          apt: 'sudo apt install transmission-gtk',
          pacman: 'sudo pacman -S transmission-gtk',
          flatpak: 'flatpak install flathub com.transmissionbt.Transmission',
        },
        notes: 'Minimalista, ultraligero, sin publicidad ni consumo excesivo de memoria RAM.',
      },
      {
        name: 'qBittorrent',
        isRecommended: false,
        license: 'GPLv2',
        website: 'https://www.qbittorrent.org',
        installCommands: {
          apt: 'sudo apt install qbittorrent',
          pacman: 'sudo pacman -S qbittorrent',
          flatpak: 'flatpak install flathub org.qbittorrent.qBittorrent',
        },
        notes: 'Interfaz idéntica al uTorrent clásico original pero 100% código abierto y sin malware.',
      },
    ],
  },
  {
    id: 'eq-rufus',
    windowsApp: 'Rufus',
    category: 'Utilidades',
    description: 'Creación de memorias USB de arranque (bootables) a partir de imágenes ISO.',
    linuxAlternatives: [
      {
        name: 'BalenaEtcher',
        isRecommended: true,
        license: 'Apache 2.0',
        website: 'https://etcher.balena.io',
        installCommands: {
          flatpak: 'flatpak install flathub io.balena.etcher',
        },
        notes: 'Grabación de USB en 3 pasos con validación de escritura.',
      },
      {
        name: 'Ventoy',
        isRecommended: false,
        license: 'GPLv3',
        website: 'https://www.ventoy.net',
        installCommands: {
          pacman: 'sudo pacman -S ventoy',
        },
        notes: 'Permite arrastrar archivos ISO directamente al pendrive para arrancar en modo multiboot.',
      },
    ],
  },
]

export function searchEquivalences(query = '', category = ''): SoftwareEquivalence[] {
  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

  const q = normalize(query)

  return EQUIVALENCES_DATABASE.filter(item => {
    const matchCat = !category || item.category === category
    if (!matchCat) return false
    if (!q) return true

    const winNorm = normalize(item.windowsApp)
    const descNorm = normalize(item.description)
    const altNorm = item.linuxAlternatives.some(a =>
      normalize(a.name).includes(q) ||
      normalize(a.notes).includes(q) ||
      (a.installCommands.apt && normalize(a.installCommands.apt).includes(q))
    )

    return winNorm.includes(q) || descNorm.includes(q) || altNorm
  })
}

// ============================================================================
// 4. SELECTOR INTERACTIVO DE DISTRIBUCIONES ("DISTRO FINDER")
// ============================================================================

export interface DistroQuizAnswers {
  hardware: 'legacy' | 'standard' | 'modern'
  experience: 'novice' | 'intermediate' | 'sysadmin'
  purpose: 'desktop' | 'development' | 'gaming' | 'server'
  updateCycle: 'stable' | 'rolling' | 'immutable'
}

export interface DistroProfile {
  id: string
  name: string
  tagline: string
  badge: string
  desktopEnvironment: string
  packageManager: string
  officialSite: string
  downloadUrl: string
  guidesSlug: string
  highlights: string[];
  caveats: string[];
}

export interface DistroRecommendationResult {
  primary: {
    distro: DistroProfile
    matchScore: number
    reason: string
  }
  secondary: {
    distro: DistroProfile
    matchScore: number
    reason: string
  }
}

export const DISTRO_CATALOG: Record<string, DistroProfile> = {
  debian: {
    id: 'debian',
    name: 'Debian GNU/Linux',
    tagline: 'El Sistema Operativo Universal. Máxima estabilidad probada.',
    badge: 'Estabilidad Roca',
    desktopEnvironment: 'GNOME / KDE / XFCE / MATE',
    packageManager: 'APT (deb)',
    officialSite: 'https://www.debian.org',
    downloadUrl: 'https://www.debian.org/distrib/',
    guidesSlug: 'administracion',
    highlights: ['Base de Ubuntu y cientos de derivadas', 'Estabilidad 24/7 sin sorpresas', 'Repositorio inmenso de más de 60.000 paquetes'],
    caveats: ['Paquetes en rama estable menos recientes que en rolling release'],
  },
  ubuntu: {
    id: 'ubuntu',
    name: 'Ubuntu LTS',
    tagline: 'El estándar del escritorio y la nube para todo tipo de usuarios.',
    badge: 'Popular y Soportado',
    desktopEnvironment: 'GNOME personalizado',
    packageManager: 'APT / Snap',
    officialSite: 'https://ubuntu.com',
    downloadUrl: 'https://ubuntu.com/download/desktop',
    guidesSlug: 'comandos',
    highlights: ['Instalación guiada muy sencilla', 'Excelente soporte de controladores privativos', 'La mayor comunidad de ayuda online en español'],
    caveats: ['Uso prioritario de paquetes Snap en ciertas utilidades'],
  },
  linuxmint: {
    id: 'linuxmint',
    name: 'Linux Mint',
    tagline: 'La mejor puerta de entrada para usuarios que migran desde Windows.',
    badge: 'Ideal Principiantes',
    desktopEnvironment: 'Cinnamon / MATE / XFCE',
    packageManager: 'APT / Flatpak',
    officialSite: 'https://linuxmint.com',
    downloadUrl: 'https://linuxmint.com/download.php',
    guidesSlug: 'comandos',
    highlights: ['Menú de inicio clásico y flujo familiar', 'Gestor de controladores con un clic', 'Flatpak habilitado de serie sin Snaps'],
    caveats: ['Ciclo basado en versiones LTS de Ubuntu'],
  },
  fedora: {
    id: 'fedora',
    name: 'Fedora Workstation',
    tagline: 'Vanguardia e innovación pura con las últimas tecnologías libres.',
    badge: 'Tecnología Puntera',
    desktopEnvironment: 'GNOME puro / KDE Spin',
    packageManager: 'DNF / RPM / Flatpak',
    officialSite: 'https://fedoraproject.org',
    downloadUrl: 'https://fedoraproject.org/workstation/download',
    guidesSlug: 'optimizacion-software',
    highlights: ['Wayland y Pipewire de vanguardia', 'Kernel Linux siempre reciente', 'Entorno upstream de desarrollo respaldado por Red Hat'],
    caveats: ['Ciclo de actualización rápido (cada 6 meses nueva versión)'],
  },
  arch: {
    id: 'arch',
    name: 'Arch Linux',
    tagline: 'Simplicidad, control total y actualización continua (Rolling Release).',
    badge: 'Rolling Release',
    desktopEnvironment: 'A elección del usuario',
    packageManager: 'Pacman (AUR)',
    officialSite: 'https://archlinux.org',
    downloadUrl: 'https://archlinux.org/download/',
    guidesSlug: 'comandos',
    highlights: ['El repositorio de usuarios AUR contiene prácticamente todo', 'El software más reciente en cuanto se publica', 'Configuración minimalista sin servicios innecesarios'],
    caveats: ['Requiere mantenimiento manual y conocimientos de consola'],
  },
  popos: {
    id: 'popos',
    name: 'Pop!_OS',
    tagline: 'Optimizado para creadores de contenido, gaming y hardware moderno.',
    badge: 'Gaming & Workstation',
    desktopEnvironment: 'COSMIC Desktop',
    packageManager: 'APT / Flatpak',
    officialSite: 'https://system76.com/pop',
    downloadUrl: 'https://system76.com/pop/download',
    guidesSlug: 'optimizacion-software',
    highlights: ['ISO con controladores NVIDIA preinstalados', 'Excelente gestión de energía en portátiles híbridos', 'Tiling window manager integrado'],
    caveats: ['Menor frecuencia de versiones mayores'],
  },
  zorinlite: {
    id: 'zorinlite',
    name: 'Zorin OS Lite',
    tagline: 'Devuelve la vida a ordenadores con hardware modesto o antiguo.',
    badge: 'Ligero y Familiar',
    desktopEnvironment: 'XFCE optimizado',
    packageManager: 'APT / Flatpak',
    officialSite: 'https://zorin.com/os/',
    downloadUrl: 'https://zorin.com/os/download/',
    guidesSlug: 'comandos',
    highlights: ['Consumo de RAM mínimo (< 800 MB en reposo)', 'Aspecto idéntico a Windows 7 o 10', 'Gran compatibilidad con apps clásicas'],
    caveats: ['Versión Pro con coste opcional (versión Lite y Core 100% libres)'],
  },
  rocky: {
    id: 'rocky',
    name: 'Rocky Linux / AlmaLinux',
    tagline: 'Compatibilidad binaria 100% con Red Hat Enterprise Linux para producción.',
    badge: 'Servidores Empresariales',
    desktopEnvironment: 'Headless (Consola) o GNOME Server',
    packageManager: 'DNF (RPM)',
    officialSite: 'https://rockylinux.org',
    downloadUrl: 'https://rockylinux.org/download',
    guidesSlug: 'administracion',
    highlights: ['10 años de soporte de ciclo de vida asegurado', 'Ideal para homelabs, Docker, Podman y Kubernetes', 'Ecosistema Enterprise'],
    caveats: ['No orientado a uso de escritorio diario ni gaming'],
  },
}

export function evaluateDistroRecommendation(answers: DistroQuizAnswers): DistroRecommendationResult {
  const scores: Record<string, number> = {
    debian: 20,
    ubuntu: 20,
    linuxmint: 20,
    fedora: 20,
    arch: 20,
    popos: 20,
    zorinlite: 20,
    rocky: 20,
  }

  // Factor 1: Hardware
  if (answers.hardware === 'legacy') {
    scores.zorinlite += 50
    scores.debian += 35
    scores.linuxmint += 25
    scores.fedora -= 20
    scores.popos -= 20
  } else if (answers.hardware === 'modern') {
    scores.popos += 35
    scores.fedora += 35
    scores.arch += 30
    scores.ubuntu += 20
  } else {
    // standard
    scores.linuxmint += 30
    scores.ubuntu += 25
    scores.debian += 20
    scores.fedora += 20
  }

  // Factor 2: Experiencia
  if (answers.experience === 'novice') {
    scores.linuxmint += 45
    scores.ubuntu += 40
    scores.zorinlite += 35
    scores.popos += 30
    scores.arch -= 40
    scores.rocky -= 25
  } else if (answers.experience === 'intermediate') {
    scores.fedora += 40
    scores.ubuntu += 30
    scores.debian += 30
    scores.popos += 30
    scores.arch += 20
  } else {
    // sysadmin / experto
    scores.arch += 45
    scores.debian += 40
    scores.rocky += 40
    scores.fedora += 30
    scores.linuxmint -= 20
  }

  // Factor 3: Propósito
  if (answers.purpose === 'gaming') {
    scores.popos += 50
    scores.fedora += 35
    scores.arch += 30
    scores.ubuntu += 25
    scores.rocky -= 40
    scores.debian -= 20
  } else if (answers.purpose === 'server') {
    scores.debian += 50
    scores.rocky += 50
    scores.ubuntu += 30
    scores.popos -= 35
    scores.linuxmint -= 35
  } else if (answers.purpose === 'development') {
    scores.fedora += 40
    scores.arch += 35
    scores.ubuntu += 30
    scores.debian += 25
  } else {
    // desktop general
    scores.linuxmint += 40
    scores.ubuntu += 35
    scores.zorinlite += 30
  }

  // Factor 4: Filosofía de Actualización
  if (answers.updateCycle === 'rolling') {
    scores.arch += 60
    scores.fedora += 20
    scores.debian -= 30
    scores.rocky -= 30
  } else if (answers.updateCycle === 'stable') {
    scores.debian += 40
    scores.rocky += 35
    scores.ubuntu += 30
    scores.linuxmint += 30
    scores.arch -= 40
  } else if (answers.updateCycle === 'immutable') {
    scores.fedora += 45 // Silverblue
    scores.popos += 20
  }

  // Ordenar distribuciones por puntuación
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const primaryId = sorted[0][0]
  const secondaryId = sorted[1][0]

  const primaryProfile = DISTRO_CATALOG[primaryId] || DISTRO_CATALOG.debian
  const secondaryProfile = DISTRO_CATALOG[secondaryId] || DISTRO_CATALOG.ubuntu

  // Normalizar porcentaje de afinidad (entre 75% y 98%)
  const topScore = sorted[0][1]
  const calcPercent = (sc: number) => Math.min(98, Math.max(75, Math.round((sc / (topScore || 1)) * 95)))

  const primaryReason = buildDistroReason(answers, primaryId)
  const secondaryReason = buildDistroReason(answers, secondaryId)

  return {
    primary: {
      distro: primaryProfile,
      matchScore: calcPercent(sorted[0][1]),
      reason: primaryReason,
    },
    secondary: {
      distro: secondaryProfile,
      matchScore: calcPercent(sorted[1][1]),
      reason: secondaryReason,
    },
  }
}

function buildDistroReason(answers: DistroQuizAnswers, distroId: string): string {
  if (distroId === 'linuxmint') {
    return 'Es la opción recomendada porque ofrece una transición perfecta y cómoda con escritorio tradicional, soporte de controladores con un clic y cero fricción para tareas diarias.'
  }
  if (distroId === 'debian') {
    return 'Destaca por su estabilidad monolítica y fiabilidad ininterrumpida, siendo la referencia para servidores y sistemas donde prima la solidez a largo plazo.'
  }
  if (distroId === 'popos') {
    return 'La elección idónea para tu hardware y gaming: incluye controladores gráficos NVIDIA/AMD preconfigurados y un entorno optimizado para alto rendimiento.'
  }
  if (distroId === 'fedora') {
    return 'Combina las tecnologías más recientes del kernel y entornos gráficos modernos con la solvencia del respaldo de ingeniería de Red Hat.'
  }
  if (distroId === 'arch') {
    return 'Proporciona control granular absoluto sobre cada paquete instalado y el acceso al mayor repositorio de software del mundo Linux (AUR) con actualizaciones continuas.'
  }
  if (distroId === 'zorinlite') {
    return 'Está optimizado para exprimir al máximo tu equipo con un consumo de recursos muy reducido y una interfaz limpia y ágil.'
  }
  if (distroId === 'rocky') {
    return 'Diseñado específicamente para despliegues empresariales y servidores de producción con soporte extendido de 10 años y compatibilidad RHEL.'
  }
  return 'Una distribución todoterreno con gran soporte comunitario y catálogo de paquetes inmenso.'
}
