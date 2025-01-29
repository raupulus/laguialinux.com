import { type ContentType } from '@/types/ContentType';

export type ContentFeatured = {
    guides: Array<ContentType>,
    news: Array<ContentType>,
    posts: Array<ContentType>,
}

export type ContentFeaturedData = {
    featured?: ContentFeatured,
    latest?: ContentFeatured,
}

export type ContentFeaturedRequest = {
    status: string,
    featured?: ContentFeatured,
    latest?: ContentFeatured,
}
