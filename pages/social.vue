<template>
    <section>
        <div class="text-center">
            <h1>
                Nuestras
                <span class="text-primary font-bold">
                    Redes Sociales
                </span>
            </h1>
        </div>

        <div v-for="group in groups" class="box-group">
            <div class="box-group-title">
                <h2>{{ group.title }}</h2>
            </div>

            <div v-for="network in group.networks" class="box-service">
                <div class="box-image">
                    <NuxtImg :src="network.image" />
                </div>

                <div>
                    <h3 class="title">{{ network.title }}</h3>
                    <p>{{ network.description }}</p>
                </div>

                <div class="box-btns">
                    <BtnGeneric text="Ir" :title="network.title" :to="network.url" width="50px" target="_blank" />
                </div>

            </div>

        </div>
    </section>
</template>


<script setup lang="ts">
const config = useRuntimeConfig();

const url = config.public.app.url;
const title = 'Redes Sociales del proyecto La Guía Linux';
const description = 'Síguenos en nuestras redes sociales y mantente actualizado para las últimas noticias, guías y tutoriales sobre GNU/Linux';
const keywords = 'redes sociales, Raúl Caro Pastorino, desarrollador web, full stack, backend, LinkedIn, GitHub, Twitter, Instagram, linux, gnu, gnu/linux';

useHead({
    title: title,
    meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url + '/social' },
        { property: 'og:image', content: url + '/social/social.webp' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: url + '/social/social.webp' }
    ]
});

const groups = [
    {
        title: 'Social',
        networks: [
            {
                title: 'Twitter',
                image: '/images/icons/social/twitter.svg',
                description: 'Sigue mis publicaciones y mantente al tanto de mis actividades en Twitter, donde suelo estar más activo.',
                url: 'https://twitter.com/raupulus',
            },
            {
                title: 'Mastodon',
                image: '/images/icons/social/mastodon.svg',
                description: 'Conéctate conmigo en Mastodon para seguir mis publicaciones y actualizaciones.',
                url: 'https://mastodon.online/@raupulus',
            },
            {
                title: 'Facebook',
                image: '/images/icons/social/facebook.svg',
                description: 'Sigue mis publicaciones y actualizaciones en mi perfil de Facebook.',
                url: 'https://www.facebook.com/raupulus/',
            },
            {
                title: 'Instagram',
                image: '/images/icons/social/instagram.svg',
                description: 'Descubre mis publicaciones y fotografías en Instagram, donde comparto proyectos y algunas imágenes de mis cámaras.',
                url: 'https://www.instagram.com/raupulus/',
            },
            {
                title: 'Blue Sky',
                image: '/images/icons/social/bluesky.svg',
                description: 'Nuevo por esta red social pero me está encantando y actualmente estoy bastante activo en ella.',
                url: 'https://bsky.app/profile/raupulus.bsky.social',
            },

        ]
    },
    {
        title: 'Streaming y Vídeos',
        networks: [
            {
                title: 'Youtube (La Guía Linux)',
                image: '/images/icons/social/youtube.svg',
                description: 'Explora vídeos sobre software libre en mi canal de YouTube y suscríbete.',
                url: 'https://www.youtube.com/c/Laguialinux',
            },
            {
                title: 'Youtube (Raul Caro Pastorino)',
                image: '/images/icons/social/youtube.svg',
                description: 'Mira mis vídeos en mi canal de YouTube y suscríbete para contenido relacionado con programación, tecnología, diseño, y más.',
                url: 'https://www.youtube.com/@raupulus',
            },
            {
                title: 'Twitch',
                image: '/images/icons/social/twitch.svg',
                description: 'Únete a mis directos en Twitch y suscríbete para no perderte ningún stream.',
                url: 'https://www.twitch.tv/raupulus',
            }
        ]
    },
    {
        title: 'Difusión',
        networks: [
            {
                title: 'Telegram Canal La Guía Linux',
                image: '/images/icons/social/telegram.svg',
                description: 'Canal de Difusión oficial sobre Guías y vídeotutoriales GNU/Linux por el proyecto LaGuiaLinux LGL',
                url: 'https://t.me/laguialinux',
            },
            {
                title: 'Telegram Canal Raupulus Diffusion',
                image: '/images/icons/social/telegram.svg',
                description: 'Únete a mi canal personal de Telegram donde comparto todo relacionado con tecnología, software libre y GNU/Linux, además de los desarrollos en los que estoy involucrado.',
                url: 'https://t.me/raupulus_diffusion',
            },

        ]
    },
];

</script>

<style scoped>
.box-group-title {
    width: 70%;
    text-align: right;
    padding: 0.3rem 3rem;
    background-color: red;
    border-radius: 0 1.3rem 1.3rem 0;
    background-color: var(--primary);
    color: var(--white);
}

.box-service {
    display: grid;
    max-width: 80%;
    margin: 3rem auto;
    grid-template-columns: auto 1fr auto;
    gap: 5px;
    color: var(--black);
    padding: 10px;
    border-radius: 8px;
    background-color: #E6E6E6;
    align-items: center;
}

.box-image {
    margin: auto;
    padding: 0.3rem;
    width: 120px;
    text-align: center;
    box-sizing: border-box;
}

.box-image img {
    width: 100%;
}

.box-btns {
    text-align: center;
}

@media (max-width: 600px) {
    .box-service {
        display: grid;
        max-width: 90%;
        grid-template-columns: 1fr;
        gap: 0;
        padding: 5px;
        border-radius: 8px;
    }

    .title {
        text-align: center;
    }

    .box-btns {
        text-align: center;
    }
}
</style>
