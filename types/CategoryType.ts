export type CategoryType = {
    id?: number,
    slug: string,
    parent?: string,
    parent_id?: number,
    name: string,
    subcategories?: CategoryType[],
    description?: string,
    icon?: string,
    urlImageMicro?: string,
    urlImageSmall?: string,
    color?: string,
    is_main?: boolean,
    path?: string
}

export type CategoryTypeRequest = {
    status: string,
    categories: CategoryType[],
}
