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

/** 时间范围选择器是本地状态，搜索/重置时同步进请求参数（"YYYY-MM-DD HH:mm:ss"） */
function syncDateRange() {
  const [begin, end] = dateRange.value ?? [null, null];
  model.value.beginTime = begin ? formatTimestamp(begin) : null;
  model.value.endTime = end ? formatTimestamp(end) : null;
}

function formatTimestamp(value: number) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function reset() {
  await restoreValidation();
  resetModel();
  dateRange.value = null;
  syncDateRange();
}

async function search() {
  await validate();
  syncDateRange();
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
            <NFormItemGi span="24 m:24">
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
