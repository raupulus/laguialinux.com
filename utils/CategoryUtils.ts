import type { CategoryType } from "@/types/CategoryType";

export const prepareDataCategory = (cat: CategoryType) => {
    if (cat.parent) {
        //cat.url = `/${path}/${cat.parent ?? 'general'}/${cat.slug}`;
        cat.path = `${cat.parent ?? 'general'}/${cat.slug}`;
    } else {
        //cat.url = `/${path}/${cat.slug}`;
        cat.path = `${cat.slug}`;
    }

    cat.subcategories = cat.subcategories?.map((sub: CategoryType) => {
        return prepareDataCategory(sub);
    });

    return cat;
}
