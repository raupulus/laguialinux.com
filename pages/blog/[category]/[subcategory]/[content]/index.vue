<template>
    <div>
        <BreadCrumb :breadcrumbs="breadcrumbs"/>

        <Loader :isLoading="loadingContents && currentContent ? true : false" />

        <section v-if="!loadingContents && currentContent">
            <!-- Título de la página -->
            <h1 class="page-h2-title">
                {{currentContent.title}}
            </h1>

            <!-- Categorías y subcategorías debajo del título -->
            <div class="box-categories">
                <!-- Categorías -->
                <ul v-if="currentContent.categories" class="categories">
                    <li v-for="category in currentContent.categories" class="category">
                        {{category.name}}
                    </li>
                </ul>

                <!-- Subcategorías -->
                <ul v-if="currentContent.subcategories" class="subcategories">
                    <li v-for="subcategory in currentContent.subcategories" class="subcategory">
                        {{subcategory.name}}
                    </li>
                </ul>
            </div>
        </section>

        <hr />

        <div class="box-columns" v-if="!loadingContents && currentContent">
            <!-- Contenido -->
            <div class="box-content">
                <!-- Avatar del autor -->
                <div class="box-content-autor">
                    <NuxtImg src="logo_128x128.webp" alt="Nombre del autor" width="35" height="35"/>
                        Por Raúl Caro Pastorino, {{currentContent?.created_at_human}}
                </div>

                <!-- Datos principales del contenido -->
                <div>
                    <NuxtImg v-if="currentContent?.has_image && currentContent?.urlImage" :src="currentContent?.urlImage" :alt="currentContent?.title" class="content-image"/>
                    <p>{{currentContent?.excerpt}}</p>

                    <!-- En caso de tener vídeo de youtube -->
                    <VideoYoutube v-if="currentContent.metadata?.youtube_video_id" :videoId="currentContent.metadata?.youtube_video_id" />
                </div>

                <!-- Páginas -->
                <section v-for="page in currentContentPages" class="box-page">
                    <h2 class="page-title">{{page.title}}</h2>

                    <NuxtImg v-if="page.has_image && page.images?.medium" :src="page.images.medium" :alt="page.title" class="content-image"/>

                    <ContentBlocksBlock v-for="block in page.content.blocks" :block="block" />

                    <!-- Publicidad -->
                    <div class="mt-1">
                        <Advertisement type="in-article"/>
                    </div>
                </section>

                <!-- Autor -->
                <div>
                    <h3>autor</h3>
                </div>
            </div>

            <!-- Barra lateral -->
            <aside class="box-aside">
                <!-- Botones para compartir contenido -->
                <div>
                    <ShareHorizontal v-if="currentContent" :title="currentContent.title" :description="currentContent.excerpt"
                    :url="currentContent?.url ?? '#'"/>
                </div>

                <!-- Listado de tags -->
                <div v-if="currentContent?.tags && currentContent.tags.length" class="box-tags mt-1">
                    <div class="box-tags-title">
                        Tags
                    </div>

                    <div class="box-tags-content">
                        <span v-for="tag in currentContent?.tags">
                            {{tag}}
                        </span>
                    </div>
                </div>

                <!-- Suscribirse a la newsletter -->
                <div class="mt-1">
                    <Newsletter />
                </div>

                <!-- Anuncio -->
                <div class="mt-1">
                    <Advertisement type="display" />
                </div>

                <!-- Lo más Leído -->
                <div class="mt-1">
                    Lo más Leído
                </div>

                <!-- Anuncio -->
                <div class="mt-1">
                    <Advertisement type="display" />
                </div>

                <!-- Contenido Relacionado -->
                <div class="mt-1">
                    Contenido Relacionado
                </div>
            </aside>
        </div>

        <!-- Contenido Relacionado -->
        <section style="background-color: green;">
            <h2>Contenido relacionado</h2>

            <br />
            &lt;Anterior - Sigiente &gt;
        </section>

        <!-- Anuncio -->
        <div class="mt-1">
            <Advertisement type="multiplex" />
        </div>

        <!-- Comentarios -->
        <section style="background-color: red;">
            <h2>Comentarios</h2>

            <br />
            user X - fecha X - comentario X
        </section>

        <!-- Anuncio -->
        <div class="mt-1">
            <Advertisement type="multiplex" />
        </div>

        <!-- Contenido Relacionado -->
        <section style="background-color: gray;">
            <h2>Contenido Recomendado</h2>

            <br />
            4 tarjetas verticales (imagen, título, fecha)
        </section>

        <!-- Anuncio -->
        <div class="mt-1">
            <Advertisement type="multiplex" />
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slugCategory = ref(route.params.category as string);
const slugSubCategory = ref(route.params.subcategory as string);
const slugContent = ref(route.params.content as string);

const { categories, subcategories, currentCategory, currentSubcategory, categoryActions } = useFetchCategory(slugCategory.value, slugSubCategory.value);

const { currentContent, currentContentPages, loadingContents } = useFetchContentBySlug('blog', slugContent.value);

const breadcrumbs = ref([
    { name: 'Blog', slug: 'blog' },
    { name: currentCategory.value?.name, slug: currentCategory.value?.slug },
    { name: currentSubcategory.value?.name, slug: currentSubcategory.value?.slug },
    { name: currentContent.value?.title, slug: currentContent.value?.url },
]);


watch(currentCategory, (newVal) => {
    breadcrumbs.value[1] = { name: newVal?.name, slug: newVal?.slug };
});

watch(currentSubcategory, (newVal) => {
    breadcrumbs.value[2] = { name: newVal?.name, slug: newVal?.slug };
});

watch(currentContent, (newVal) => {
    breadcrumbs.value[3] = { name: newVal?.title, slug: newVal?.url };
});
</script>

<style scoped>
.page-h2-title {
    text-transform: capitalize;
    margin: 2rem 0 0 0;
}
.box-categories {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    box-sizing: border-box;
    padding-top: 1rem;
}

.categories {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.category {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--warning);
    padding: 0;
    border-radius: 0.5rem;
    box-sizing: border-box;
}

.subcategories {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.3rem;
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

.subcategory {
    background-color: var(--warning);
    color: var(--white);
    padding: 0.3rem 0.3rem;
    border-radius: 0.3rem;
    box-sizing: border-box;
    font-size: 0.9rem;
    font-weight: bold;
    box-shadow: 0 0 0.5rem var(--warning);
}

.box-columns {
    display: grid;
    padding-top: 1rem;
    grid-template-columns: 1fr 360px;
    gap: 1rem;
    box-sizing: border-box;
}

.box-content {
    display: flex;
    padding: 0.3rem;
    flex-direction: column;
    gap: 1rem;
    color: var(--black);
    background-color: var(--white);
    border-radius: 0.5rem;
    box-sizing: border-box;
    overflow: hidden;
}

.content-image {
    width: 100%;
    height: auto;
    border-radius: 0.5rem;
}

.box-content-autor {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    box-sizing: border-box;
    color: var(--danger);
    font-size: 0.9rem;
    font-weight: bold;
    font-style: italic;
}

.page-title {
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: var(--danger);
    text-transform: capitalize;
    margin: 2rem 0 0 0;
}

.box-aside {
    background-color: #2d3748;
    border-radius: 0.5rem;
    padding: 0.5rem;
}

.box-tags {
    margin-top: 1rem;
    background-color: var(--blue);
    border-radius: 0.5rem;
    border: 1px solid var(--white);
    box-sizing: border-box;
    overflow: hidden;
}

.box-tags-title {
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--blue);
    background-color: var(--white);
    box-sizing: border-box;

}

.box-tags-content {
    display: flex;
    padding: 0.5rem;
    flex-direction: row;
    gap: 0.5rem;
    flex-wrap: wrap;
    box-sizing: border-box;
}

.box-tags-content > span {
    padding: 0.3rem 0.5rem;
    font-size: 0.9rem;
    font-weight: bold;
    background-color: var(--black);
    border-radius: 0.5rem;
}

@media (max-width: 890px) {
    .box-columns {
        grid-template-columns: 1fr;
    }

    .box-categories {
        display: none;
    }
}
</style>
