<script setup lang="ts">
/**
 * 用户详情已改为用户列表内的抽屉展示（user-detail-drawer.vue）。
 * 后端菜单表仍保留 auth_user-detail 路由，此组件仅作占位：
 * 旧链接/后端菜单未清理前访问该路由时重定向回用户列表，避免路由解析失败。
 */
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'ManageUserDetail' });

const router = useRouter();

onMounted(() => {
  router.replace('/auth/user');
});
</script>

<template>
  <div class="h-200px flex-center">
    <NSpin size="large" />
  </div>
</template>

<style scoped></style>
