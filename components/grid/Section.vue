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
                    image: '/images/sections/youtube.png',
                    text: 'Descubre más sobre este proyecto.',
                    url: '/about'
                },
                {
                    title: 'Guías de software libre',
                    image: '/images/sections/guides.png',
                    text: 'Más detalles sobre el software.',
                    url: '/about'
                },
                {
                    title: 'Software Libre 3',
                    image: '/images/sections/youtube.png',
                    text: 'Explora este recurso.',
                    url: '/about'
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
