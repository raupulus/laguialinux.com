<template>
    <span style="right: 15px; margin: 0; padding: 0; position: absolute;">
        Creando contenido desde 2001
    </span>

    <NewsBanner />

    <Slide :slides="Array.from({ length: 9 }, (_, index) => ({ image: `/images/slides/home/${index + 1}.webp` }))"/>


    <GridSection />

    <!-- Banner para Destacados -->
    <section class="mt-2" style="width: 100%;">
        <SlideBanner :banners="[{title: 'title 1', excerpt: 'des1', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 2', excerpt: 'des2', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 3', excerpt: 'des3', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 4', excerpt: 'des4', image: '/images/banners/1.webp', url: '/about'}]" />
    </section>

    <!-- Últimas noticias slide -->
    <section class="mt-2" style="width: 100%;">
        <h2 class="text-center">Últimas noticias</h2>
        <SlideBlog :data="[{title: 'title 1', excerpt: 'des1', image: '/images/banners/1.webp', url: '/about', categories: ['cat1', 'cat2', 'cat3']}, {title: 'title 2', excerpt: 'des2', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 3', excerpt: 'des3', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 4', excerpt: 'des4', image: '/images/banners/1.webp', url: '/about'}]" />
    </section>

    <div class="section-separator"></div>

    <!-- Últimas entradas para el blog -->
    <section class="mt-1" style="width: 100%;">
        <h2 class="text-center">Últimas entradas en el blog</h2>
        <SlideBlog :data="[{title: 'title 1', excerpt: 'des1', image: '/images/banners/1.webp', url: '/about', categories: ['cat1', 'cat2', 'cat3']}, {title: 'title 2', excerpt: 'des2', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 3', excerpt: 'des3', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 4', excerpt: 'des4', image: '/images/banners/1.webp', url: '/about'}]" />
    </section>

    <div class="section-separator"></div>

    <!-- Cards SoftSkills -->
    <section class="mt-2">
        <div class="block text-center">
            <CardVertical background="#2F3239" title="Aprender, Compartir" tag="LGL"
                description="Creamos contenido para compartirlo a la vez que aprendemos">

                <NuxtImg src="/images/soft-skills/logotipo.webp" format="webp" width="250" height="250" quality="90"
                    title="Creamos contenido para compartirlo a la vez que aprendemos" alt="Creamos contenido para compartirlo a la vez que aprendemos" loading="lazy" />
            </CardVertical>

            <CardVertical background="#005db5" title="Actualidad y Eventos" tag="Noticias"
                description="Información sobre lo que ocurre en el mundo del software libre">
                <NuxtImg src="/images/soft-skills/logotipo.webp" format="webp" width="250" height="250" quality="90"
                    title="Backend Web Developer" alt="Backend Web Developer" loading="lazy" />
            </CardVertical>

            <CardVertical background="#EEB624" title="Libertad en lo Digital" tag="Open Source"
                description="Desarrollo publicando mis proyectos OSS Desde 2001 con software libre ">
                <NuxtImg src="/images/soft-skills/gnu_linux.webp" format="webp" width="250" height="250" quality="90"
                    title="Open Source Developer" alt="Open Source Developer" loading="lazy" />
            </CardVertical>
        </div>
    </section>

    <div class="section-separator"></div>

    <!-- Redes Sociales -->
    <section class="mt-2">
        <div class="block text-center">
            <div class="box-social-icons inline-block">
                <div class="inline-block">
                    <IconsYoutube size="80px" :decored="true" />
                </div>
            </div>

            <div class="box-social-icons inline-block">
                <div class="inline-block">
                    <IconsGitlab size="80px" :decored="true" />
                </div>
            </div>

            <div class="box-social-icons inline-block">
                <div class="inline-block">
                    <IconsGithub size="80px" :decored="true" />
                </div>

                <div class="inline-block">
                    <IconsMastodon size="80px" :decored="true" />
                </div>

                <div class="inline-block">
                    <IconsTwitter size="80px" :decored="true" />
                </div>
            </div>
        </div>
    </section>

    <div class="section-separator"></div>

    <!-- Grid Noticias destacadas -->
    <section class="mt-1" style="width: 100%;">
        <h2 class="text-center">Noticias Destacadas</h2>
        <GridBlog :data="[{title: 'title 1', excerpt: 'des1', image: '/images/banners/1.webp', url: '/about', categories: ['cat1', 'cat2', 'cat3']}, {title: 'title 2', excerpt: 'des2', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 3', excerpt: 'des3', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 4', excerpt: 'des4', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 5', excerpt: 'des5', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 6', excerpt: 'des6', image: '/images/banners/1.webp', url: '/about'}]" />
    </section>


    <!-- Grid Entradas destacadas -->
    <section class="mt-1" style="width: 100%;">
        <h2 class="text-center">Entradas destacadas</h2>
        <GridBlog :data="[{title: 'title 1', excerpt: 'des1', image: '/images/banners/1.webp', url: '/about', categories: ['cat1', 'cat2', 'cat3']}, {title: 'title 2', excerpt: 'des2', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 3', excerpt: 'des3', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 4', excerpt: 'des4', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 5', excerpt: 'des5', image: '/images/banners/1.webp', url: '/about'}, {title: 'title 6', excerpt: 'des6', image: '/images/banners/1.webp', url: '/about'}]" />
    </section>

    <div class="mt-5"></div>
</template>

<style scoped>
.box-my-history {
    display: grid;
    padding: 0 1.3rem;
    grid-gap: 50px;
    grid-template-columns: 1fr auto;
}

@media (max-width: 956px) {
    .box-my-history {
        grid-template-columns: 1fr;
        grid-auto-flow: dense;
    }

    .btn-group {
        text-align: center;
        margin: auto;
    }
}

.box-my-history-description {
    min-width: 300px;
}

.box-my-history-img {
    margin: auto;
    max-width: 450px;
    max-height: 250px;
    align-self: center;
}

.my-history-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.technolgy-element {
    margin: 2rem;
}

.technolgy-element img {
    padding: 6px;
    margin: auto;
    height: 28px;
    width: auto;
    text-align: right;
}

.box-social-icons>div {
    margin: 15px 1rem;

}

.btn-curriculum-icon-after {
    width: 0.8rem;
    height: 0.8rem;
}
</style>
