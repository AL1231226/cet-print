<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center gap-6">
        <router-link to="/" class="font-bold text-lg">真题工具</router-link>
        <router-link to="/" class="text-sm text-gray-600 hover:text-black">资源</router-link>
        <router-link to="/tool" class="text-sm text-gray-600 hover:text-black">排版工具</router-link>
      </div>
    </nav>
    <router-view />
  </div>
</template>
