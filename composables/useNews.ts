import { ref, computed } from 'vue';

export default function useNews() {
    const allNews = ref([
        { id: 1, title: 'Noticia 1', excerpt: 'Descripción 1', image: '/images/banners/1.webp', url: '/news/1', categories: ['cat-1'], topic: 'topic-1' },
        { id: 2, title: 'Noticia 2', excerpt: 'Descripción 2', image: '/images/banners/1.webp', url: '/news/2', categories: ['cat-2'], topic: 'topic-2' },
        { id: 3, title: 'Noticia 3', excerpt: 'Descripción 3', image: '/images/banners/1.webp', url: '/news/3', categories: ['cat-1'], topic: 'topic-1' },
        { id: 4, title: 'Noticia 4', excerpt: 'Descripción 4', image: '/images/banners/1.webp', url: '/news/4', categories: ['cat-3'], topic: 'topic-2' },
        { id: 5, title: 'Noticia 5', excerpt: 'Descripción 5', image: '/images/banners/1.webp', url: '/news/5', categories: ['cat-2'], topic: 'topic-3' },
        // Añade más datos hasta 20...
    ]);

    const filters = ref({
        category: '',
        topic: '',
        sort: 'recent',
    });

    const page = ref(1);
    const perPage = 4;

    const filteredNews = computed(() => {
        return allNews.value.filter((news) => {
            const categoryMatch = !filters.value.category || news.categories.includes(filters.value.category);
            const topicMatch = !filters.value.topic || news.topic === filters.value.topic;
            return categoryMatch && topicMatch;
        }).sort((a, b) => {
            if (filters.value.sort === 'recent') {
                return b.id - a.id;
            } else {
                return a.id - b.id;
            }
        });
    });

    const news = computed(() => {
        return filteredNews.value.slice(0, page.value * perPage);
    });

    const loadMore = () => {
        if (news.value.length < filteredNews.value.length) {
            page.value++;
        }
    };

    return { news, filters, loadMore };
}
