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
