<template>
    <div>
        <h2 class="page-h2-title">Vídeo tutoriales</h2>

        <div class="box-channel">
            <div>
                <NuxtLink to="http://www.youtube.com/@LaGuiaLinux" target="_blank">
                    <NuxtImg src="/images/icons/social/youtube.svg" alt="youtube" width="100" height="100" />
                </NuxtLink>
            </div>

            <div>
                <NuxtLink to="http://www.youtube.com/@LaGuiaLinux" target="_blank" class="channel-link">
                    Puedes ver nuestro canal de youtube dónde publicamos los videotutoriales
                </NuxtLink>
            </div>
        </div>

        <p>
            También puedes acceder directamente a nuestras listas de reproducción
        </p>

        <div class="box-yt-lists">
            <div v-for="list in lists" :key="list.title" class="yt-list">
                <div class="yt-iframe">
                    <iframe
                        :src="`https://www.youtube.com/embed/videoseries?list=${getPlaylistId(list.url)}`"
                        width="100%"
                        height="315"
                        frameborder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>

                <div>
                    <NuxtLink :to="list.url" target="_blank" class="channel-link">{{ list.title }}</NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const lists = [
    {
        title: 'Debian',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_88_1_Xd17rXz50IbN4QNo',
    },
    {
        title: 'Solución a Errores GNU/Linux',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_pAISZI5UxlUodaO4BojbV',
    },
    {
        title: 'Raspberry Pi ',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9XvI9iHvt_5cJhMvqFslvm',
    },
    {
        title: 'Instalación Distribuciones Linux',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_S7cKs7qbnG5Y2Y2UWGOfp',
    },
    {
        title: 'Fedora',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9dAKVPIKZgSnGev96PT15g',
    },
    {
        title: 'Seguridad',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_pFEfsb1zsN0RVGiqT3snp',
    },
    {
        title: 'Hardware',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_Yi2jft8m4kQPwctQG6M9-',
    },
    {
        title: 'Ofimática',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI-hqNh5v-SF3gNBFOSdbTws',
    },
    {
        title: 'Multimedia',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_GBvUiH6JJa0ZIHlKtC29N',
    },
    {
        title: 'Diseño Gráfico',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI-d99YUX061KTfD_zzWRGFv',
    },
    {
        title: 'Edición de Vídeo',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI89Hidr4mQFQFbx1pxc9yTJ',
    },
    {
        title: 'Edición de Audio',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9-gk9_yefTT8BstwEnB-7b',
    },
    {
        title: 'Utilidadeds',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI-l5hVcabqE5WHfmd33nECe',
    },
    {
        title: 'Editores',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI-X9RLD4nvCjjwa00Tgo2f6',
    },
    {
        title: 'Terminal',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI8FI9aEXhJ06yF5iGV0BPok',
    },
    {
        title: 'Desarrollo',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI8MDkYXAEVM0G0ZJ_emd41r',
    },
    {
        title: 'Redes y Servidores',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9ZTqolKGPnr76tAx9Lvs4v',
    },
    {
        title: 'Mantenimiento y Optimización',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_hd_GlQ0DgUupFJghJopLW',
    },
    {
        title: 'General',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI8TbR_m61kB5fs-WZqyJ_a3',
    },
    {
        title: 'Cloud y Almacenamiento',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI8_kKeuf50SUzjrsOuej1w7',
    },
    {
        title: 'Juegos',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_Lcndljtoh3UvWvCo3yRKF',
    },
    {
        title: 'Solución a Problemas',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_pKb5zd6lmSGlNE1-V6Yo2',
    },
    {
        title: 'Scripts',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI93f43O-mcmEjlk6FPkW9kv',
    },
    {
        title: 'AI',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI98PEOH7IOtGS0OVeK3eS2G',
    },
    {
        title: 'Opinión',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9-ieys7VkQ7kIsbkQfQ2EV',
    },
    {
        title: 'Eventos',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI9LqCfoIMcFqfaU0EIESiaY',
    },
    {
        title: 'Actualidad',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI93yHzNbRuiljE-3n2wx1pO',
    },
    {
        title: 'Pentesting',
        url: 'https://www.youtube.com/playlist?list=PLdbtKUhOueI_3f0OGhWDVYCiZ7Kph6Gb_',
    },
]

// Helper function to extract the playlist ID from the URL
const getPlaylistId = (url: string): string => {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
}
</script>

<style scoped>
.box-channel {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    background-color: var(--white);
    color: var(--blue);
    border-radius: 0.5rem;
}

.channel-link {
    color: var(--blue);
    text-decoration: none;
}

.box-yt-lists {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Ensures responsive grid */
    gap: 1.3rem;
}

.yt-list {
    background-color: var(--white);
    color: var(--blue);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
}

.yt-iframe {
    width: 100%;
    height: auto;
}

@media (min-width: 768px) {
    .box-yt-lists {
        grid-template-columns: repeat(2, 1fr); /* 2 columns on larger screens */
    }
}

@media (max-width: 768px) {
    .box-yt-lists {
        grid-template-columns: 1fr; /* Single column on small screens */
    }
}
</style>
