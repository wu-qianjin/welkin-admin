<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { operateTypeOptions } from '@/constants/business';
import { useNaiveForm } from '@/hooks/common/form';
import { translateOptions } from '@/utils/common';
import { $t } from '@/locales';

defineOptions({
  name: 'OperateLogSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.OperateLogSearchParams>('model', { required: true });
const dateRange = ref<[number, number] | null>(null);

const defaultModel: Api.SystemManage.OperateLogSearchParams = jsonClone(toRaw(model.value));

function resetModel() {
  Object.assign(model.value, defaultModel);
}

async function reset() {
  await restoreValidation();
  resetModel();
  dateRange.value = null;
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :bordered="false" size="small" class="card-wrapper">
    <NCollapse :default-expanded-names="['operate-log-search']">
      <NCollapseItem :title="$t('common.search')" name="operate-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.log.operate.title')" path="title" class="pr-24px">
              <NInput v-model:value="model.title" :placeholder="$t('page.manage.log.operate.form.title')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.log.operate.userName')"
              path="userName"
              class="pr-24px"
            >
              <NInput v-model:value="model.userName" :placeholder="$t('page.manage.log.operate.form.userName')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.log.operate.businessType')"
              path="businessType"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.businessType"
                :placeholder="$t('page.manage.log.operate.form.businessType')"
                :options="translateOptions(operateTypeOptions)"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="操作时间" class="pr-24px">
              <NDatePicker v-model:value="dateRange" type="datetimerange" clearable class="w-full" />
            </NFormItemGi>
            <NFormItemGi span="24 m:6" class="pr-24px">
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
