<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions } from '@/constants/business';
import { addButton, updateButton } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ButtonOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.ButtonResource | null;
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
  props.operateType === 'add'
    ? $t('page.manage.resource.button.addButton')
    : $t('page.manage.resource.button.editButton')
);

const model = ref(createDefaultModel());

function createDefaultModel() {
  return {
    buttonCode: '',
    buttonName: '',
    menuName: '',
    status: '1' as Api.Common.EnableStatus,
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  buttonCode: [defaultRequiredRule],
  buttonName: [defaultRequiredRule],
  menuName: [defaultRequiredRule],
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
      await addButton(model.value);
    } else {
      await updateButton({ ...(props.rowData as Api.SystemManage.ButtonResource), ...model.value });
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
        <NFormItem :label="$t('page.manage.resource.button.buttonCode')" path="buttonCode">
          <NInput
            v-model:value="model.buttonCode"
            :placeholder="$t('page.manage.resource.button.form.buttonCode')"
            :disabled="operateType === 'edit'"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.button.buttonName')" path="buttonName">
          <NInput v-model:value="model.buttonName" :placeholder="$t('page.manage.resource.button.form.buttonName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.button.menuName')" path="menuName">
          <NInput v-model:value="model.menuName" :placeholder="$t('page.manage.resource.button.form.menuName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.resource.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
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
