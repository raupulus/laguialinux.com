<template>
  <nav aria-label="Breadcrumb" class="bg-[#1f2937] p-4 rounded-lg shadow-md">
    <ul class="breadcrumb">
      <li>
        <NuxtLink to="/" class="breadcrumb-item">Home</NuxtLink>
      </li>

      <li v-for="(crumb, index) in breadcrumbs" :key="index">
        <NuxtLink
          v-if="index < breadcrumbs.length - 1"
          :to="getPathTo(index)"
          class="breadcrumb-item">
          {{ crumb.name }}
        </NuxtLink>

        <span v-else class="breadcrumb-item breadcrumb-item-current">{{ crumb.name }}</span>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

type Breadcrumb = {
  name?: string;
  slug?: string;
}

const props = defineProps({
  breadcrumbs: {
    type: Array as () => Breadcrumb[],
    required: true
  }
})

const getPathTo = (index: number): string => {
  return '/' + props.breadcrumbs.slice(0, index + 1).map(crumb => crumb.slug).join('/')
}
</script>

<style scoped>
.breadcrumb {
  position: relative;
  list-style: none;
  display: flex;
  padding: 0;
  margin: 0;
  align-items: center;
  box-sizing: border-box;
}

.breadcrumb-item {
  position: relative;
  background: #2d3748;
  color: #fff;
  height: 30px;
  padding: 0 10px 0 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  font-size: 0.9rem;
  font-weight: 300;
  text-decoration: none;
  box-sizing: border-box
}

.breadcrumb-item-current {
  color: #485a71;
}

.breadcrumb-item::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 15px;
  background: #2d3748;
  top: 0;
  right: -0.5rem;
  z-index: 9;
  border-right: 3px solid #fff;
  transform: skewX(52deg);
}

.breadcrumb-item::before {
  content: '';
  position: absolute;
  width: 1rem;
  height: 15px;
  background: #2d3748;
  bottom: 0;
  right: -0.5rem;
  z-index: 9;
  border-right: 3px solid #fff;
  transform: skewX(-52deg);
}

.breadcrumb-item a {
  color: #fff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  color: var(--danger);
}
</style>
