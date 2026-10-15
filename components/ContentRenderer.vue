<!--
  components/ContentRenderer.vue
  Renderizador estructurado de bloques Editor.js y contenido técnico (API V2)
  La Guía Linux — Ecosistema laguialinux.com & raupulus.dev
  Licencia: GNU AGPLv3
-->

<script setup lang="ts">
import { computed } from 'vue'
import { normalizeContentBody } from '~/utils/contentParser'
import type { BlocksType } from '~/types/BlocksType'
import TerminalBlock from './TerminalBlock.vue'

const props = defineProps<{
  content: unknown
}>()

const parsedBlocks = computed<BlocksType>(() => {
  return normalizeContentBody(props.content)
})

const TABLE_HEADER_WORDS = new Set([
  'comandos', 'comando', 'command', 'commands',
  'instrucción', 'instruccion', 'sintaxis', 'syntax',
  'parámetro', 'parametro', 'opción', 'opcion', 'opciones',
  'descripción', 'descripcion', 'description', 'explicación', 'explicacion'
])

function sanitizeTableRows(content: unknown): string[][] {
  if (!Array.isArray(content)) return []
  return (content as string[][]).filter(row => {
    if (!Array.isArray(row)) return false
    return row.some(cell => String(cell || '').replace(/<[^>]+>/g, '').trim().length > 0)
  })
}

function isHeaderRow(row: string[], rIdx: number, withHeadings?: boolean): boolean {
  if (rIdx === 0 && withHeadings) return true
  const first = String(row[0] || '').replace(/<[^>]+>/g, '').trim().toLowerCase()
  return TABLE_HEADER_WORDS.has(first)
}
</script>

<template>
  <div class="content-renderer space-y-6">
    <template v-for="(block, idx) in parsedBlocks.blocks" :key="block.id || idx">
      
      <!-- 1. BLOQUE DE CÓDIGO Y COMANDOS (TERMINAL BLOCK INTERACTIVO) -->
      <TerminalBlock
        v-if="block.type === 'code'"
        :code="block.data?.code || ''"
        :language="block.data?.language || 'bash'"
        :title="`${block.data?.language || 'bash'} — terminal`"
        :show-line-numbers="block.data?.showlinenumbers ?? (block.data?.code || '').includes('\n')"
        :show-controls="true"
        :allow-copy-modes="true"
      />

      <!-- 2. PÁRRAFO -->
      <p
        v-else-if="block.type === 'paragraph'"
        :id="block.id"
        class="text-slate-300 leading-relaxed text-sm sm:text-base font-body my-4"
        v-html="block.data?.text || ''"
      />

      <!-- 3. ENCABEZADOS -->
      <h2
        v-else-if="block.type === 'header' && (block.data?.level === 1 || block.data?.level === 2)"
        :id="block.id"
        class="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading mt-8 mb-3 border-b border-slate-800 pb-2 scroll-mt-24"
        v-html="block.data?.text || ''"
      />
      <h3
        v-else-if="block.type === 'header' && block.data?.level === 3"
        :id="block.id"
        class="text-lg sm:text-xl font-bold text-slate-100 tracking-tight font-heading mt-6 mb-2 scroll-mt-24"
        v-html="block.data?.text || ''"
      />
      <h4
        v-else-if="block.type === 'header'"
        :id="block.id"
        class="text-base sm:text-lg font-semibold text-slate-200 tracking-tight font-heading mt-4 mb-2 scroll-mt-24"
        v-html="block.data?.text || ''"
      />

      <!-- 4. LISTAS (ORDENADAS, DESORDENADAS Y CHECKLIST) -->
      <div v-else-if="block.type === 'list'" :id="block.id" class="my-4 text-slate-300 text-sm sm:text-base">
        <ol v-if="block.data?.style === 'ordered'" class="list-decimal list-inside space-y-1.5 pl-2 leading-relaxed">
          <li
            v-for="(item, i) in block.data?.items"
            :key="i"
            v-html="typeof item === 'string' ? item : item.content"
          />
        </ol>
        <ul v-else-if="block.data?.style === 'checklist'" class="space-y-2 pl-1">
          <li
            v-for="(item, i) in block.data?.items"
            :key="i"
            class="flex items-start gap-2.5 leading-relaxed"
          >
            <span class="text-emerald-400 font-bold text-base shrink-0 mt-0.5">✓</span>
            <span v-html="typeof item === 'string' ? item : item.content" />
          </li>
        </ul>
        <ul v-else class="list-disc list-inside space-y-1.5 pl-2 leading-relaxed">
          <li
            v-for="(item, i) in block.data?.items"
            :key="i"
            v-html="typeof item === 'string' ? item : item.content"
          />
        </ul>
      </div>

      <!-- 5. ADVERTENCIAS Y ALERTAS -->
      <aside
        v-else-if="block.type === 'warning' || block.type === 'alert'"
        :id="block.id"
        class="my-6 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-slate-200 shadow-md"
      >
        <div class="flex items-start gap-3">
          <div class="text-amber-400 text-xl font-bold shrink-0 mt-0.5">⚠️</div>
          <div class="flex-1 min-w-0">
            <h4
              v-if="block.data?.title"
              class="font-bold text-amber-300 text-sm sm:text-base mb-1"
              v-html="block.data.title"
            />
            <div
              class="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-body"
              v-html="block.data?.message || block.data?.text || ''"
            />
          </div>
        </div>
      </aside>

      <!-- 6. CITAS -->
      <blockquote
        v-else-if="block.type === 'quote'"
        :id="block.id"
        class="my-6 p-4 border-l-4 border-emerald-500 bg-slate-900/60 rounded-r-2xl italic text-slate-300 text-sm sm:text-base leading-relaxed"
      >
        <p v-html="block.data?.text || ''" />
        <footer v-if="block.data?.caption" class="text-xs text-slate-500 not-italic mt-2">
          — {{ block.data.caption }}
        </footer>
      </blockquote>

      <!-- 7. TABLAS (SYSADMIN Y REFERENCIA TÉCNICA) -->
      <div v-else-if="block.type === 'table'" :id="block.id" class="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg">
        <table class="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="(row, rIdx) in sanitizeTableRows(block.data?.content)"
              :key="rIdx"
              :class="isHeaderRow(row, rIdx, block.data?.withHeadings)
                ? 'bg-slate-900/90 font-bold text-white text-xs uppercase tracking-wider'
                : 'hover:bg-slate-900/40 transition-colors'"
            >
              <td
                v-for="(cell, cIdx) in row"
                :key="cIdx"
                class="px-4 py-3 align-top"
                :class="[
                  isHeaderRow(row, rIdx, block.data?.withHeadings)
                    ? 'text-slate-200 font-bold font-mono text-xs'
                    : cIdx === 0
                      ? 'font-mono text-emerald-400 font-semibold text-xs'
                      : 'text-slate-300 font-body text-xs sm:text-sm'
                ]"
              >
                <!-- Si es celda de comando (columna 0 en fila de contenido), envolver con badge de terminal -->
                <code
                  v-if="!isHeaderRow(row, rIdx, block.data?.withHeadings) && cIdx === 0 && cell"
                  class="font-mono text-emerald-300 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 inline-block font-medium tracking-tight text-xs selection:bg-emerald-500/30"
                  v-html="cell"
                />
                <span v-else v-html="cell" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 8. IMÁGENES -->
      <figure
        v-else-if="block.type === 'image'"
        :id="block.id"
        class="my-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg"
      >
        <img
          :src="block.data?.file?.url || block.data?.url"
          :alt="block.data?.caption || 'Imagen explicativa'"
          class="w-full h-auto max-h-[500px] object-contain mx-auto"
          loading="lazy"
        />
        <figcaption
          v-if="block.data?.caption"
          class="p-2.5 text-center text-xs text-slate-400 bg-slate-900/80 border-t border-slate-800"
          v-html="block.data.caption"
        />
      </figure>

      <!-- 9. SEPARADOR HORIZONTAL -->
      <hr v-else-if="block.type === 'delimiter'" :id="block.id" class="my-8 border-slate-800" />

      <!-- 10. BLOQUES RAW / HTML LEGADO -->
      <div
        v-else-if="block.type === 'raw'"
        :id="block.id"
        class="my-4 text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
        v-html="block.data?.html || ''"
      />

    </template>
  </div>
</template>
