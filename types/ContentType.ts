import { type MetadataType } from "@/types/MetadataType"
import { type TechnologyType } from "@/types/TechnologyType"
import type { CategoryType } from "./CategoryType"

export type ContentImages = {
    small?: string,
    medium?: string,
    large?: string,
}

export type ContentType = {
    title: string,
    slug: string,
    type: string,
    excerpt: string,
    content?: string,
    is_featured?: string,
    images?: ContentImages,
    has_image?: boolean,
    created_at?: string,
    updated_at?: string,
    created_at_human?: string,
    total_pages?: number,
    categories?: CategoryType[],
    subcategories?: CategoryType[],
    tags?: string[],
    metadata?: MetadataType,
    technologies?: TechnologyType[],
    pages_slug?: string[],
    url?: string,
    path?: string,
    comments?: number,
}
