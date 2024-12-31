export type CategoryType = {
    slug: string,
    parent?: string,
    name: string,
    subcategories?: CategoryType[],
    description?: string,
    icon?: string,
    color?: string,
}
