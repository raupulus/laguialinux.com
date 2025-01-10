<template>
    <div class="box-share-social-horizontal">

        <div class="box-share-social-horizontal-title">
            <span>Compartir</span>
        </div>

        <div class="box-share-social-horizontal-links">
            <div>
                <IconsLinkedin :decored="true" title="Compartir en Linkedin" :url="`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${description}`" size="44px"/>
            </div>

            <div>
                <IconsMeneame :decored="true" title="Compartir en Menéame" :url="`https://meneame.net/submit.php?url=${url}&title=${title}`" size="44px"/>
            </div>

            <div>
                <IconsTwitter :decored="true" title="Compartir en Twitter" :url="`https://twitter.com/intent/tweet?url=${url}&text=${title}`" size="44px"/>
            </div>

            <!--
            <div>
                <IconsMastodon :decored="true" title="Compartir en Mastodon" url="#" size="44px"/>
            </div>
            -->

            <!--
            <div>
                <IconsBluesky :decored="true" title="Compartir en Bluesky" :url="`https://bsky.app/share?url=${url}`" size="44px"/>
            </div>
            -->

            <div>
                <IconsMail :decored="true" title="Compartir por email" :url="`mailto:?subject=Te comparto esta entrada: ${encodeURIComponent(title)}&body=${encodeURIComponent(description + 'Visto en ' + url)}`" size="44px"/>
            </div>

            <div>
                <IconsFacebook :decored="true" title="Compartir en Facebook" :url="`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${encodeURIComponent(title)}`" size="44px"/>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
})
</script>

<style scoped>
.box-share-social-horizontal {
    border: 1px solid var(--white);
    border-radius: 0.5rem;
    box-sizing: border-box;
    overflow: hidden;
}

.box-share-social-horizontal-title {
    padding: 0.5rem 1rem;
    color: var(--blue);
    font-weight: bold;
    font-size: 1.1rem;
    font-weight: bold;
    background-color: var(--white);
    box-sizing: border-box;
}

.box-share-social-horizontal-links {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--blue);
    box-sizing: border-box;
}
</style>
