<template>
  <div class="bg-white rounded-lg border p-4">
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-base">{{ resource.name }}</h3>
      <span
        class="text-xs px-2 py-0.5 rounded shrink-0 ml-2"
        :class="typeBadgeClass"
      >{{ typeLabel }}</span>
    </div>
    <div class="space-y-1.5">
      <div
        v-for="(ch, i) in resource.channels"
        :key="i"
        class="flex items-center gap-2 text-sm"
      >
        <a
          :href="ch.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 hover:underline truncate"
        >{{ ch.name }}</a>
        <span
          v-if="ch.status === 'valid'"
          class="text-xs text-green-600 shrink-0"
        >有效</span>
        <span
          v-else
          class="text-xs text-red-500 shrink-0"
        >失效</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resource: { type: Object, required: true },
})

const typeMap = {
  cet4: { label: '四级', class: 'bg-green-50 text-green-700 border border-green-200' },
  cet6: { label: '六级', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  ky: { label: '考研', class: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

const typeLabel = computed(() => typeMap[props.resource.type]?.label || props.resource.type)
const typeBadgeClass = computed(() => typeMap[props.resource.type]?.class || 'bg-gray-50 text-gray-700')
</script>
