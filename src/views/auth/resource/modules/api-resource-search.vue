<script setup lang="ts">
import { toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { apiMethodOptions } from '@/constants/business';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ApiResourceSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.ApiResourceSearchParams>('model', { required: true });

const defaultModel: Api.SystemManage.ApiResourceSearchParams = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['api-resource-search']">
      <NCollapseItem :title="$t('common.search')" name="api-resource-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.resource.api.apiName')"
              path="apiName"
              class="pr-24px"
            >
              <NInput v-model:value="model.apiName" :placeholder="$t('page.manage.resource.api.form.apiName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.resource.api.apiPath')"
              path="apiPath"
              class="pr-24px"
            >
              <NInput v-model:value="model.apiPath" :placeholder="$t('page.manage.resource.api.form.apiPath')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.resource.api.apiMethod')"
              path="apiMethod"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.apiMethod"
                :placeholder="$t('page.manage.resource.api.form.apiMethod')"
                :options="apiMethodOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.resource.api.apiModule')"
              path="apiModule"
              class="pr-24px"
            >
              <NInput v-model:value="model.apiModule" :placeholder="$t('page.manage.resource.api.form.apiModule')" />
            </NFormItemGi>
            <NFormItemGi span="24 m:24" class="pr-24px">
              <NSpace class="w-full" justify="end">
                <NButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </NButton>
                <NButton type="primary" ghost @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </NButton>
              </NSpace>
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped></style>
