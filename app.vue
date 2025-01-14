<template>
    <div id="app">
        <AppHeader />

        <div id="app-box-content">

            <NuxtPage />
        </div>

        <AppFooter />

        <CookieControl locale="es" />
    </div>
</template>

<script setup lang="ts">
const webTitle = 'La Guía Linux';
const webDescription = 'La Guía Linux es un proyecto que pretende compartir conocimiento sobre Software Libre y Tecnología';

useSeoMeta({
    description: webDescription,
    ogTitle: webTitle,
    ogDescription: webDescription,
    ogImage: '/logo_512x512.png',
    ogUrl: 'https://laguialinux.com',
    twitterTitle: webTitle,
    twitterDescription: webDescription,
    twitterImage: '/logo_512x512.png',
    twitterCard: 'summary'
})

useHead({
    htmlAttrs: {
        lang: 'es'
    },
    link: [
        {
            rel: 'icon',
            type: 'image/ico',
            href: '/favicon.ico'
        }
    ]
})

const scrollDisabled = useScrollDisabled();

/**
 * Deshabilita el scroll en el body
 *
 * @param {boolean} disabled
 */
function scrollToggle(disabled: boolean) {
    if (disabled) {
        document.body.classList.add('disable-scroll');
    } else {
        document.body.classList.remove('disable-scroll');
    }
}


watch(scrollDisabled, (current) => {
    //console.log('Valor actual: ', current);
    scrollToggle(current);
});



onNuxtReady(() => {
    usePlatformData()
})


/* Cookies */
const {
    cookiesEnabled,
    cookiesEnabledIds,
    isConsentGiven,
    isModalActive,
    moduleOptions,
} = useCookieControl()

watch(
    () => cookiesEnabledIds.value,
    (current, previous) => {
        //console.log('cambia cookes');
        if (
            !previous?.includes('google-analytics') &&
            current?.includes('google-analytics')
        ) {
            //console.log('se habilita google analytics');
            // cookie con id `google-analytics` se ha añadido
            //window.location.reload() // placeholder para tu manejador de cambios personalizado
            const { gtag, initialize } = useGtag()
            gtag('consent', 'update', {
                ad_user_data: 'granted',
                ad_personalization: 'granted',
                ad_storage: 'granted',
                analytics_storage: 'granted'
            })

            //initialize();
        }
    },
    { deep: true },
)
</script>

<style>
body.disable-scroll {
    height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
}

#app-box-content {
    height: 100%;
}
</style>
