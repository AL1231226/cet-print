<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-1">真题资源</h1>
    <p class="text-gray-500 text-sm mb-6">四六级 / 考研英语真题资源索引</p>

    <ResourceFilter :options="filterOptions" :active="activeType" @change="onFilterChange" />

    <div v-if="filtered.length === 0" class="text-center py-12 text-gray-400">
      暂无匹配的资源
    </div>
    <div v-else class="space-y-3">
      <ResourceCard v-for="item in filtered" :key="item.id" :resource="item" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ResourceFilter from '../components/ResourceFilter.vue'
import ResourceCard from '../components/ResourceCard.vue'
import data from '../data/resources.json'

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'cet4', label: '四级' },
  { value: 'cet6', label: '六级' },
  { value: 'ky', label: '考研' },
]

const activeType = ref('all')

const filtered = computed(() => {
  if (activeType.value === 'all') return data.resources
  return data.resources.filter(r => r.type === activeType.value)
})

function onFilterChange(val) {
  activeType.value = val
}
</script>
