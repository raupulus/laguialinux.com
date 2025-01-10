<template>
    <div class="grid-container">
        <CardSection v-for="(card, index) in cards" :key="index" :title="card.title" :image="card.image"
            :text="card.text" :url="card.url" />
    </div>
</template>

<script>

export default {
    data() {
        return {
            cards: [
                {
                    title: 'Vídeo Tutoriales',
                    image: '/images/sections/youtube_440px.webp',
                    text: 'Guías en un formato más digerible',
                    url: '/video-tutorials'
                },
                {
                    title: 'Compromiso',
                    image: '/images/sections/about_440px.webp',
                    text: 'Descubre más sobre este proyecto.',
                    url: '/about'
                },
                {
                    title: 'Síguenos',
                    image: '/images/sections/social_440px.webp',
                    text: 'Mantente al día con nuestras redes.',
                    url: '/social'
                }
            ]
        };
    }
};
</script>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: repeat(1, 1fr);
    }
}
</style>
