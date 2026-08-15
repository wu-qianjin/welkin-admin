<script setup lang="ts">
import { $t } from '@/locales';
import ApiResource from './modules/api-resource.vue';
import ButtonResource from './modules/button-resource.vue';

defineOptions({
  name: 'ResourceManage'
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NTabs type="line" animated class="flex-col-stretch flex-1-hidden">
      <NTabPane name="api" :tab="$t('page.manage.resource.apiTab')">
        <ApiResource />
      </NTabPane>
      <NTabPane name="button" :tab="$t('page.manage.resource.buttonTab')">
        <ButtonResource />
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped></style>
