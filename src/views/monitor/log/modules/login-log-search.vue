<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import { jsonClone } from '@sa/utils';
import { useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'LoginLogSearch'
});

interface Emits {
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.LoginLogSearchParams>('model', { required: true });
const dateRange = ref<[number, number] | null>(null);

const loginStatusOptions = computed(() => [
  { label: $t('page.manage.log.login.success'), value: '1' },
  { label: $t('page.manage.log.login.fail'), value: '2' }
]);

const defaultModel: Api.SystemManage.LoginLogSearchParams = jsonClone(toRaw(model.value));

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
    <NCollapse :default-expanded-names="['login-log-search']">
      <NCollapseItem :title="$t('common.search')" name="login-log-search">
        <NForm ref="formRef" :model="model" label-placement="left" :label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.log.login.userName')"
              path="userName"
              class="pr-24px"
            >
              <NInput v-model:value="model.userName" :placeholder="$t('page.manage.log.login.form.userName')" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" :label="$t('page.manage.log.login.ipaddr')" path="ipaddr" class="pr-24px">
              <NInput v-model:value="model.ipaddr" :placeholder="$t('page.manage.log.login.form.ipaddr')" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:6"
              :label="$t('page.manage.log.login.loginStatus')"
              path="status"
              class="pr-24px"
            >
              <NSelect
                v-model:value="model.status"
                :placeholder="$t('page.manage.log.login.form.status')"
                :options="loginStatusOptions"
                clearable
              />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:6" label="登录时间" class="pr-24px">
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
