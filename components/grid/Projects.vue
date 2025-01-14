<template>
    <div class="box-grid-projects">
        <div v-for="project, key in projects" :key="project.slug"
            :class="isHorizontal(key) ? 'box-horizontal' : 'box-vertical'">

            <CardProjectHorizontal v-if="isHorizontal(key)" :data="project" />

            <CardProject v-else :data="project" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { ContentType } from '~/types/ContentType';

const props = defineProps({
    projects: {
        type: Array as PropType<Array<ContentType>>,
        default: [],
        required: false,
    }
});

function isHorizontal(pos: number) {
    return ((pos + 1) % 3) === 0
}
</script>

<style>
.box-grid-projects {
    margin: 0;
    padding: 0;
    display: grid;
    /*grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); */
    /*grid-template-columns: repeat(2, 1fr);*/
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1.3rem;
    align-items: top;
    box-sizing: border-box;
}

.box-horizontal {
    grid-column: 1 / span 2;
}

@media (max-width: 880px) {
    .box-grid-projects {
        grid-gap: 0.6rem;
    }

    .box-vertical {
        grid-column: 1 / span 2;
    }
}
</style>
