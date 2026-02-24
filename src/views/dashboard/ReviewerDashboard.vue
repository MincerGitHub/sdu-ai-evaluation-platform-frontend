<template>
  <div class="reviewer-dashboard">
    <p>欢迎回来，{{ user?.name || '同学' }}！</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

</script>
