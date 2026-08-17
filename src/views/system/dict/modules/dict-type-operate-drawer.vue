<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { addDictType, updateDictType } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DictTypeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.DictType | null;
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
    add: $t('page.manage.dict.addDictType'),
    edit: $t('page.manage.dict.editDictType')
  };
  return titles[props.operateType];
});

const model = ref(createDefaultModel());

function createDefaultModel(): Pick<Api.SystemManage.DictType, 'dictName' | 'dictType' | 'remark'> & {
  status: Api.Common.EnableStatus;
} {
  return {
    dictName: '',
    dictType: '',
    status: '1',
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  dictName: [defaultRequiredRule],
  dictType: [defaultRequiredRule],
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
      await addDictType(model.value);
    } else {
      await updateDictType({
        ...(props.rowData as Api.SystemManage.DictType),
        ...model.value
      });
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
        <NFormItem :label="$t('page.manage.dict.dictName')" path="dictName">
          <NInput v-model:value="model.dictName" :placeholder="$t('page.manage.dict.form.dictName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dict.dictType')" path="dictType">
          <NInput v-model:value="model.dictType" :placeholder="$t('page.manage.dict.form.dictType')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dict.status')" path="status">
          <NSwitch v-model:value="model.status" checked-value="1" unchecked-value="2" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dict.remark')" path="remark">
          <NInput
            v-model:value="model.remark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            :placeholder="$t('page.manage.dict.form.remark')"
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
