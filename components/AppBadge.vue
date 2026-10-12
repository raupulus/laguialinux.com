<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'emerald' | 'orange' | 'slate'
  }>(),
  {
    variant: 'emerald',
  }
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40': variant === 'emerald',
      'bg-orange-950/70 text-orange-400 border border-orange-800/40': variant === 'orange',
      'bg-slate-800/70 text-slate-300 border border-slate-700/40': variant === 'slate',
    }"
  >
    <slot />
  </span>
</template>
