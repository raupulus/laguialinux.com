import { type MetadataType } from "@/types/MetadataType"
import { type TechnologyType } from "@/types/TechnologyType"
import type { CategoryType } from "./CategoryType"

export type ContentType = {
    title: string,
    slug: string,
    excerpt: string,
    is_featured?: string,
    urlImageSmall?: string,
    urlImageMedium: string,
    urlImage: string,
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
