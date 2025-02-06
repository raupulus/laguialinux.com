<template>
    <div v-if="loading">

    </div>

    <div class="box-nb" v-if="!loading && contents && contents?.featured">
        <div class="box-nb-banner" v-if="featuredItems.length && featuredItems[0]">
            <article class="nb-card" v-if="featuredItems.length && featuredItems[0]">
                <div class="nb-card-image">
                    <NuxtImg
                        :src="featuredItems[0]?.has_image ? featuredItems[0].urlImageMedium : '/images/banners/reading.webp'"
                        :alt="featuredItems[0].title" style="width: 100%;" />
                </div>

                <div class="nb-card-title">
                    <NuxtLink :to="featuredItems[0].url" :title="featuredItems[0].title">
                        <span class="nb-main-title">{{ featuredItems[0].title }}</span>
                    </NuxtLink>
                </div>
            </article>
        </div>

        <div class="box-nb-more-readers">
            <template v-for="(n, index) in featuredItems" :key="index">
                <article class="nb-card" v-if="n && index > 0">
                    <div class="nb-card-image">
                        <NuxtImg :src="n.has_image ? n.urlImageMedium : '/images/banners/reading.webp'" :alt="n.title" />
                    </div>

                    <div class="nb-card-title">
                        <NuxtLink :to="n.url" :title="n.title">
                            <span>{{ n.title }}</span>
                        </NuxtLink>
                    </div>
                </article>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ContentFeaturedData } from '~/types/ContentFeaturedType';

const props = defineProps({
    contents: {
        type: Object as PropType<ContentFeaturedData>,
        required: false,
        default: null,
    },
    loading: {
        type: Boolean,
        default: true,
    }
});

const featuredItems = computed(() => {
    const items = [];
    for (let i = 1; i <= 7; i++) {
        items.push(getDataByPos(i));
    }
    return items;
});


/**
 * Devuelve el contenido preparado por posición de forma que baraja los tipos de contenido
 * quedando prioridad noticia > blog > guía repitiendo este orden además ordenado según
 * cada tipo por el actualizado más recientemente.
 *
 * @param pos
 */
const getDataByPos = (pos: number) => {
    const arrays = [
        { data: props.contents?.featured?.news ?? [], priority: 'news' },
        { data: props.contents?.featured?.blog ?? [], priority: 'blog' },
        { data: props.contents?.featured?.guides ?? [], priority: 'guides' },
    ];

    const maxLength = Math.max(arrays[0].data.length, arrays[1].data.length, arrays[2].data.length);
    const allItems = [];

    for (let i = 0; i < maxLength; i++) {
        for (let j = 0; j < arrays.length; j++) {
            if (arrays[j].data.length > i) {
                allItems.push(arrays[j].data[i]);
            }
        }
    }

    // Compruebo si hay elementos en el array
    if (allItems.length === 0) {
        return null;
    }

    const index = (pos - 1) % allItems.length;
    return allItems[index];
};
</script>

<style scoped>
.box-nb {
    position: relative;
    margin: 0;
    padding: 1.3rem;
    width: 100%;
    background-color: var(--secondary);
    box-sizing: border-box;
}

.box-nb-banner {
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
}

.box-nb-more-readers {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    box-sizing: border-box;
}

.nb-card {
    position: relative;
    margin: 0;
    width: 100%;
    height: 100%;
    background-color: var(--blue);
    box-sizing: border-box;
    color: red;
    border: 5px solid #454a51;
}

.nb-card-image {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
}

.nb-card-image img {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    object-fit: cover;
}

.nb-card-title {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 1.2rem;
    font-weight: bold;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.5);
}

.nb-card-title a {
    display: grid;
    padding: 0 0.3rem;
    width: 100%;
    height: 100%;
    align-content: end;
    text-decoration: none;
    color: var(--white);
}

.nb-card-title a span {
    padding-bottom: 1rem;
}

.nb-main-title {
    font-size: 2.3rem;
}

@media (max-width: 768px) {
    .box-nb {
        padding: 0.5rem;
    }

    .box-nb-more-readers {
        grid-template-columns: 1fr;
    }
}
</style>
