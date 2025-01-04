<template>
    <div class="blog-card">
        <NuxtImg :src="content.urlImageMedium" :alt="content.title" class="blog-card-image" loading="lazy" />

        <div class="blog-card-content">
            <h2 class="blog-card-title">{{ content.title }}</h2>

            <div class="blog-card-badges" v-if="content.categories && content.categories.length">

                <NuxtLink :to="`/${platform}/${subcategory.path}`" v-for="subcategory in content.subcategories"
                    :key="subcategory.slug" class="blog-card-badge-sub">
                    {{ subcategory.name }}
                </NuxtLink>

                <NuxtLink :to="`/${platform}/${category.path}`" v-for="category in content.categories"
                    :key="category.slug" class="blog-card-badge">
                    {{ category.name }}
                </NuxtLink>

            </div>

            <div class="blog-card-meta" v-if="content.created_at_human">
                <time :datetime="content.created_at_human">{{ content.created_at_human }}</time>
            </div>

            <p class="blog-card-excerpt">{{ content.excerpt }}</p>

            <div class="blog-card-footer">
                <span class="blog-card-comments">
                    <svg class="icon-comments" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="currentColor" width="16" height="16">
                        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7l-4 4v-4H5a2 2 0 0 1-2-2V5z" />
                    </svg>
                    {{ content.comments || 0 }}
                </span>

                <NuxtLink :to="content.url" class="blog-card-button">Leer artículo</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { type CategoryType } from '@/types/CategoryType';
import { type ContentType } from '@/types/ContentType';

const props = defineProps({
    content: {
        type: Object as PropType<ContentType>,
        required: true
    },
    platform: {
        type: String,
        required: true
    }
});
</script>

<style scoped>
.blog-card {
    position: relative;
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 16px;
    background-color: var(--white);
    color: var(--darkblue);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    width: 100%;
    min-height: 200px;
}

.blog-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.blog-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.blog-card-content {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
}

.blog-card-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: var(--blue);
}

.blog-card-badges {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row-reverse;
    gap: 8px;
}

.blog-card-badge {
    background-color: var(--blue);
    color: var(--white);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    text-decoration: none;
    font-weight: bold;
}

.blog-card-badge-sub {
    background-color: var(--danger);
    color: var(--white);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    text-decoration: none;
}

.blog-card-meta {
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 0.75rem;
    color: var(--gray);
    font-weight: 500;
    text-transform: capitalize;
    font-weight: bold;
}

.blog-card-excerpt {
    font-size: 1rem;
    color: var(--darkblue);
    line-height: 1.5;
    flex-grow: 1;
}

.blog-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.blog-card-comments {
    font-size: 0.875rem;
    color: var(--darkblue);
    display: flex;
    align-items: center;
    gap: 4px;
}

.blog-card-button {
    padding: 8px 16px;
    background-color: var(--primary);
    color: var(--white);
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.blog-card-button:hover {
    background-color: var(--danger);
}

@media (max-width: 768px) {
    .blog-card {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        border-radius: 8px;
    }

    .blog-card-image {
        height: 200px;
    }

    .blog-card-title {
        font-size: 1rem;
    }

    .blog-card-excerpt {
        font-size: 0.875rem;
    }
}
</style>
