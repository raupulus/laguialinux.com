import type { BlocksType } from "@/types/BlocksType"

export type ContentPageType = {
    id: number,
    content: BlocksType,
    title: string,
    slug: string,
    order?: number,
    has_image?: boolean,
    images?: ContentPageImageType,
}

export type ContentPageImageType = {
    medium: string,
    normal: string,
    large: string,
}
