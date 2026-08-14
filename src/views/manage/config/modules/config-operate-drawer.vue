<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions } from '@/constants/business';
import { addConfig, updateConfig } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'ConfigOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.SystemConfig | null;
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

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.config.addConfig'),
    edit: $t('page.manage.config.editConfig')
  };
  return titles[props.operateType];
});

type Model = Pick<
  Api.SystemManage.SystemConfig,
  'paramName' | 'paramKey' | 'paramValue' | 'builtIn' | 'status' | 'remark'
>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    paramName: '',
    paramKey: '',
    paramValue: '',
    builtIn: 'N',
    status: '1',
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  paramName: [defaultRequiredRule],
  paramKey: [defaultRequiredRule],
  paramValue: [defaultRequiredRule],
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
      await addConfig(model.value);
    } else {
      await updateConfig({ ...(props.rowData as Api.SystemManage.SystemConfig), ...model.value });
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
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.config.paramName')" path="paramName">
          <NInput v-model:value="model.paramName" :placeholder="$t('page.manage.config.form.paramName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.config.paramKey')" path="paramKey">
          <NInput
            v-model:value="model.paramKey"
            :placeholder="$t('page.manage.config.form.paramKey')"
            :disabled="operateType === 'edit' && model.builtIn === 'Y'"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.config.paramValue')" path="paramValue">
          <NInput
            v-model:value="model.paramValue"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('page.manage.config.form.paramValue')"
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.config.builtIn')" path="builtIn">
          <NRadioGroup v-model:value="model.builtIn" :disabled="operateType === 'edit'">
            <NRadio value="N" :label="$t('common.yesOrNo.no')" />
            <NRadio value="Y" :label="$t('common.yesOrNo.yes')" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.config.paramStatus')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.config.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('page.manage.config.form.remark')"
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
