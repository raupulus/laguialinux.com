import type { BlocksType, BlockType } from '~/types/BlocksType'

/**
 * Utilidades de normalización y extracción de contenidos Editor.js (API V2)
 * La Guía Linux & raupulus.dev
 * Licencia: GNU AGPLv3
 */

/**
 * Convierte un HTML plano en bloques Editor.js estructurados
 * separando párrafos y bloques de código <pre><code>...</code></pre>
 */
export function htmlToBlocks(html: string): BlocksType {
  const blocks: BlockType[] = []
  if (!html || typeof html !== 'string') {
    return { blocks }
  }

  // Regex para identificar bloques <pre><code>...</code></pre>
  const preRegex = /<pre[^>]*>[\s\S]*?<code(?:\s+data-language="([^"]*)")?[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = preRegex.exec(html)) !== null) {
    const matchIndex = match.index
    // Contenido previo al bloque de código
    const beforeHtml = html.substring(lastIndex, matchIndex).trim()
    if (beforeHtml) {
      blocks.push({
        id: `raw-${blocks.length}`,
        type: 'raw',
        data: { html: beforeHtml },
      })
    }

    const language = match[1] || 'bash'
    const rawCode = match[2] || ''
    // Desescapar entidades HTML en el código para el portapapeles y renderizado
    const cleanCode = rawCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .trim()

    blocks.push({
      id: `code-${blocks.length}`,
      type: 'code',
      data: {
        code: cleanCode,
        language,
        showlinenumbers: cleanCode.includes('\n'),
      },
    })

    lastIndex = matchIndex + match[0].length
  }

  // Contenido posterior al último bloque
  const remainingHtml = html.substring(lastIndex).trim()
  if (remainingHtml) {
    blocks.push({
      id: `raw-${blocks.length}`,
      type: 'raw',
      data: { html: remainingHtml },
    })
  }

  return { blocks }
}

/**
 * Normaliza el body de una página a un objeto estructurado de bloques Editor.js.
 * Compatible con:
 * 1. Objeto Editor.js { time, blocks: [...], version } de la API V2 (como en raupulus.dev).
 * 2. Cadena JSON de Editor.js (la parsea de forma segura).
 * 3. Cadena HTML tradicional (la segmenta en bloques párrafo y bloques código).
 */
export function normalizeContentBody(rawBody: unknown): BlocksType {
  if (!rawBody) {
    return { blocks: [] }
  }

  if (typeof rawBody === 'object' && rawBody !== null) {
    const obj = rawBody as any
    if (Array.isArray(obj.blocks)) {
      return obj as BlocksType
    }
  }

  if (typeof rawBody === 'string') {
    const trimmed = rawBody.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && Array.isArray(parsed.blocks)) {
          return parsed as BlocksType
        }
      } catch {
        // No es JSON válido, procesar como HTML
      }
    }
    return htmlToBlocks(rawBody)
  }

  return { blocks: [] }
}

/**
 * Extrae EXCLUSIVAMENTE los comandos y líneas de código de los bloques técnicos del paso.
 * - Bloques de código (block.type === 'code'): extrae el código íntegro.
 * - Tablas de comandos (block.type === 'table'): extrae únicamente la columna 0 (el comando),
 *   omitiendo cabeceras y NUNCA incluyendo descripciones ni explicaciones.
 * NUNCA extrae párrafos explicativos, encabezados ni texto descriptivo.
 */
export function extractCommandsFromContent(rawBody: unknown): string {
  if (!rawBody) return ''

  const blocksObj = normalizeContentBody(rawBody)
  const codeCommands: string[] = []

  const HEADER_WORDS = new Set([
    'comandos', 'comando', 'command', 'commands',
    'instrucción', 'instruccion', 'sintaxis', 'syntax',
    'parámetro', 'parametro', 'opción', 'opcion', 'opciones'
  ])

  for (const block of blocksObj.blocks) {
    if (block.type === 'code' && block.data?.code) {
      const codeStr = String(block.data.code).trim()
      if (codeStr) {
        codeCommands.push(codeStr)
      }
    } else if (block.type === 'table' && Array.isArray(block.data?.content)) {
      const rows = block.data.content as string[][]
      for (const row of rows) {
        if (!Array.isArray(row) || row.length === 0) continue
        const rawCol0 = String(row[0] || '').replace(/<[^>]+>/g, '').trim()
        if (!rawCol0) continue
        // Omitir filas de cabecera como "Comandos" o "Instrucción"
        if (HEADER_WORDS.has(rawCol0.toLowerCase())) continue

        // Extraer únicamente el comando limpio (columna 0)
        codeCommands.push(rawCol0)
      }
    }
  }

  return codeCommands.join('\n')
}
