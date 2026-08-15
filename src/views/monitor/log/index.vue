<script setup lang="ts">
import { $t } from '@/locales';
import LoginLog from './modules/login-log.vue';
import OperateLog from './modules/operate-log.vue';

defineOptions({
  name: 'LogManage'
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NTabs type="line" animated class="flex-col-stretch flex-1-hidden">
      <NTabPane name="login" :tab="$t('page.manage.log.loginTab')">
        <LoginLog />
      </NTabPane>
      <NTabPane name="operate" :tab="$t('page.manage.log.operateTab')">
        <OperateLog />
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped></style>
