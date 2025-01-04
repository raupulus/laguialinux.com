export type CategoryType = {
    slug: string,
    parent?: string,
    name: string,
    subcategories?: CategoryType[],
    description?: string,
    icon?: string,
    urlImageMicro?: string,
    urlImageSmall?: string,
    color?: string,
    is_main?: boolean,
    url?: string
    path?: string
}
