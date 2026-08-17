<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { apiMethodOptions } from '@/constants/business';
import { addApi, updateApi } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ApiOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.ApiResource | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() =>
  props.operateType === 'add' ? $t('page.manage.resource.api.addApi') : $t('page.manage.resource.api.editApi')
);

const model = ref(createDefaultModel());

function createDefaultModel() {
  return {
    apiName: '',
    apiPath: '',
    apiMethod: 'GET' as Api.SystemManage.ApiMethod,
    apiModule: '',
    status: '1' as Api.Common.EnableStatus,
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  apiName: [defaultRequiredRule],
  apiPath: [defaultRequiredRule],
  apiMethod: [defaultRequiredRule],
  apiModule: [defaultRequiredRule],
  status: [defaultRequiredRule]
};

function handleInitModel() {
  model.value = createDefaultModel();
  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  try {
    if (props.operateType === 'add') {
      await addApi(model.value);
    } else {
      await updateApi({ ...(props.rowData as Api.SystemManage.ApiResource), ...model.value });
    }
    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch {
    // request errors are surfaced by the request layer
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="400">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="90">
        <NFormItem :label="$t('page.manage.resource.api.apiName')" path="apiName">
          <NInput v-model:value="model.apiName" :placeholder="$t('page.manage.resource.api.form.apiName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.api.apiPath')" path="apiPath">
          <NInput v-model:value="model.apiPath" :placeholder="$t('page.manage.resource.api.form.apiPath')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.api.apiMethod')" path="apiMethod">
          <NSelect v-model:value="model.apiMethod" :options="apiMethodOptions" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.api.apiModule')" path="apiModule">
          <NInput v-model:value="model.apiModule" :placeholder="$t('page.manage.resource.api.form.apiModule')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.status')" path="status">
          <NSwitch v-model:value="model.status" checked-value="1" unchecked-value="2" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('page.manage.resource.form.remark')"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
