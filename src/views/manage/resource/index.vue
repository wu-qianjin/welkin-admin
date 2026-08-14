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
    <NCard :title="$t('page.manage.resource.title')" :bordered="false" size="small" class="card-wrapper flex-1-hidden">
      <NTabs type="line" animated class="flex-col-stretch h-full">
        <NTabPane name="api" :tab="$t('page.manage.resource.apiTab')">
          <ApiResource />
        </NTabPane>
        <NTabPane name="button" :tab="$t('page.manage.resource.buttonTab')">
          <ButtonResource />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<style scoped></style>
