<template>
  <div class="flex gap-2 mb-6 flex-wrap">
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="$emit('change', opt.value)"
      class="px-4 py-1.5 rounded-full text-sm border transition-colors"
      :class="active === opt.value
        ? 'bg-black text-white border-black'
        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  active: { type: String, default: 'all' },
})

defineEmits(['change'])
</script>
