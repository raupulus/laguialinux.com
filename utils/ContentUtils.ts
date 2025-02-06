import type { MetadataType } from "@/types/MetadataType";
import type { CategoryType } from "@/types/CategoryType";
import type { ContentType } from "@/types/ContentType";
import { prepareDataCategory } from '@/utils/CategoryUtils';
import type { ContentFeaturedRequest } from "~/types/ContentFeaturedType";

function prepareContentDataMetadata(metadata: MetadataType) {
    const priority: (keyof MetadataType)[] = [
        'web', 'youtube_channel', 'youtube_video', 'youtube', 'gitlab', 'github',
        'twitter', 'linkedin', 'mastodon', 'twitch',
        'telegram_channel',
    ];

    let results: MetadataType = {};

    if (metadata) {
        priority.forEach(p => {
            if (((p === 'youtube_channel') || (p === 'youtube_video')) && metadata[p]) {
                results.youtube = metadata[p];
            } else if (metadata[p]) {
                results[p] = metadata[p];
            }
        });
    }

    return results;
}


export function prepareContentData(content: ContentType, contentType: string) {
    if (content.metadata) {
        content.metadata = prepareContentDataMetadata(content.metadata as MetadataType);
    }

    const contentCategorySlug = content.categories?.length ? content.categories[0].slug : 'general';
    let contentSubcategoryMain = content.subcategories?.find(sub => sub.is_main);

    if (!contentSubcategoryMain) {
        contentSubcategoryMain = content.categories?.length ? content.categories[0] : undefined;
    }

    const contentSubcategorySlug = contentSubcategoryMain ? contentSubcategoryMain.slug : 'misc';

    const isClient = process.client;
    let APP_URL: string = '';

    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        APP_URL = runtimeConfig.public.app.url;
    } else {
        APP_URL = process.env.APP_URL || '';
    }

    content.url = `${APP_URL}/${contentType}/${contentCategorySlug}/${contentSubcategorySlug}/${content.slug}`;
    content.path = `${contentCategorySlug}/${contentSubcategorySlug}/${content.slug}`;

    content.categories = content.categories?.map((cat: CategoryType) => {
        return prepareDataCategory(cat);
    });

    content.subcategories = content.subcategories?.map((cat: CategoryType) => {
        return prepareDataCategory(cat);
    })

    return content;
}


export function prepareContentFeatured(data: ContentFeaturedRequest | null) {
    if (! data) {
        return null;
    }

    const featured = data?.featured ?? null;
    const latest = data?.latest ?? null;
    const trend = data?.trend ?? null;

    if (featured) {
        featured.blog = featured.blog?.map((content) => prepareContentData(content, 'blog'));
        featured.news = featured.news?.map((content) => prepareContentData(content, 'news'));
        featured.guides = featured.guides?.map((content) => prepareContentData(content, 'guides'));
    }

    if (latest) {
        latest.blog = latest.blog?.map((content) => prepareContentData(content, 'blog'));
        latest.news = latest.news?.map((content) => prepareContentData(content, 'news'));
        latest.guides = latest.guides?.map((content) => prepareContentData(content, 'guides'));
    }

    if (trend) {
        trend.blog = trend.blog?.map((content) => prepareContentData(content, 'blog'));
        trend.news = trend.news?.map((content) => prepareContentData(content, 'news'));
        trend.guides = trend.guides?.map((content) => prepareContentData(content, 'guides'));
    }

    return {
        featured: featured,
        latest: latest,
        trend: trend,
    }
}
