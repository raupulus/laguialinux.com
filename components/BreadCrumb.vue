<template>
  <nav class="box-breadcrumb">
      <div class="breadcrumb-item" v-for="(crumb, index) in breadcrumbs" :key="index">
          <NuxtLink v-if="index < breadcrumbs.length - 1" :to="getPathTo(index)" class="breadcrumb-content">
              {{ crumb.name }}
          </NuxtLink>

          <span v-else class="breadcrumb-content-current">{{ crumb.name }}</span>
      </div>
  </nav>
</template>

<script lang="ts" setup>
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
.box-breadcrumb {
  position: relative;
  width: 100%;
}


.breadcrumb-item {
  position: relative;
  height: 10px;
  display: inline-block;
  padding: 1px 10px 9px 25px;
  color: var(--white);
  background-color: #2d3748;
  font-size: 0.8rem;
  line-height: 1rem;
}

.breadcrumb-content {
  color: var(--white);
  text-decoration: none;
}

.breadcrumb-content-current {
  color: #485a71;
  font-weight: bold;
}

.breadcrumb-item::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 10px;
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
  height: 10px;
  background: #2d3748;
  bottom: 0;
  right: -0.5rem;
  z-index: 9;
  border-right: 3px solid #fff;
  transform: skewX(-52deg);
}
</style>
