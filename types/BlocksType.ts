/**
 * Tipos de bloques Editor.js de la API V2 (Ecosistema La Guía Linux & raupulus.dev)
 * Licencia: GNU AGPLv3
 * Autor: Raúl Caro Pastorino (https://raupulus.dev)
 */

export type BlockTunesType = {
  textVariant?: string // citation, call-out, details
}

export type BlockType = {
  id?: string
  type: string
  tunes?: BlockTunesType
  data?: any
}

export type BlocksType = {
  time?: number
  blocks: BlockType[]
  version?: string
}

export type BlockRawType = BlockType & {
  type: 'raw'
  data: {
    html: string
  }
}

export type BlockParagraphType = BlockType & {
  type: 'paragraph'
  data: {
    text: string
  }
}

export type BlockHeaderType = BlockType & {
  type: 'header'
  data: {
    text: string
    level: number
  }
}

export type BlockCodeType = BlockType & {
  type: 'code'
  data: {
    code: string
    language?: string
    showlinenumbers?: boolean
  }
}

export type BlockWarningType = BlockType & {
  type: 'warning'
  data: {
    title: string
    message: string
  }
}

export type BlockAlertType = BlockType & {
  type: 'alert'
  data: {
    type?: string
    message: string
  }
}

export type BlockQuoteType = BlockType & {
  type: 'quote'
  data: {
    text: string
    caption?: string
    alignment?: string
  }
}

export type BlockListType = BlockType & {
  type: 'list'
  data: {
    style: 'ordered' | 'unordered' | 'checklist'
    meta?: {
      counterType?: string
      start?: number
    }
    items: Array<string | { content: string; meta?: { checked?: boolean }; items?: any[] }>
  }
}

export type BlockTableType = BlockType & {
  type: 'table'
  data: {
    withHeadings?: boolean
    content: string[][]
  }
}

export type BlockDelimiterType = BlockType & {
  type: 'delimiter'
}

export type BlockImageType = BlockType & {
  type: 'image'
  data: {
    file?: {
      url: string
    }
    url?: string
    caption?: string
    withBorder?: boolean
    withBackground?: boolean
    stretched?: boolean
  }
}
