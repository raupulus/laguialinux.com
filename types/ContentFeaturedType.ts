import { type ContentType } from '@/types/ContentType';

export type ContentFeatured = {
    guides: ContentType[],
    news: ContentType[],
    blog: ContentType[],
}

export type ContentFeaturedData = {
    featured: ContentFeatured | null,
    latest: ContentFeatured | null,
    trend: ContentFeatured | null,
}

export type ContentFeaturedRequest = {
    status: string,
    featured: ContentFeatured | null,
    latest: ContentFeatured | null,
    trend: ContentFeatured | null,
}
