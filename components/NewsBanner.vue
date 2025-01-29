<template>
    <div class="box-nb" v-if="data">
        <div class="box-nb-banner">
            <NuxtImg src="/images/banners/reading.png" alt="banner" style="width: 100%;"/>
        </div>


        <div class="box-nb-more-readers">
            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">
                        {{ featured1?.title }}
                    </NuxtLink>
                </div>
            </article>

            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">
                        {{ featured2?.title }}
                    </NuxtLink>
                </div>
            </article>

            <article class="nb-card">
                <div class="nb-card-image">
                    <NuxtImg src="/images/banners/reading.png" alt="banner"/>
                </div>

                <div class="nb-card-title">
                    <NuxtLink to="/" title="desc">
                        {{ featured3?.title }}
                    </NuxtLink>
                </div>
            </article>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { ContentFeatured} from '@/types/ContentFeaturedType';

const props = defineProps({
    data: {
        type: Object as PropType<ContentFeatured> || undefined,
        required: true,
    }
});

const getDataByPos = (pos: number) => {
    // Arrays con los datos a mezclar: news, posts, guides
    const arrays = [
        { data: props.data.news, priority: 'news' },
        { data: props.data.posts, priority: 'posts' },
        { data: props.data.guides, priority: 'guides' },
    ];

    // Filtramos los arrays para eliminar aquellos que están vacíos
    const availableArrays = arrays.filter(arr => arr.data.length > 0);

    // Buscamos el índice relativo en los arrays disponibles según la posición
    const adjustedPos = pos - 1; // Convertimos la posición de 1-based a 0-based

    // Comprobamos que la posición solicitada esté dentro del rango de los arrays disponibles
    if (adjustedPos < 0 || adjustedPos >= availableArrays.length) {
        return null; // Si no hay ningún array disponible para esa posición, devolvemos null
    }

    // Retornamos el primer elemento disponible en el orden de las prioridades
    const selectedArray = availableArrays[adjustedPos % availableArrays.length];

    return selectedArray.data[adjustedPos % selectedArray.data.length];
};

const featured1 = getDataByPos(1);
const featured2 = getDataByPos(2);
const featured3 = getDataByPos(3);
const featured4 = getDataByPos(4);


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
    box-sizing: border-box;
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

@media (max-width: 768px) {
    .box-nb {
        padding: 0.5rem;
    }

    .box-nb-more-readers {
        grid-template-columns: 1fr;
    }
}
</style>
