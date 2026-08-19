<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { addDictType, fetchGetDictTypeList, updateDictType } from '@/service/api';
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
  module: string | null;
  status: Api.Common.EnableStatus;
} {
  return {
    dictName: '',
    dictType: '',
    module: null,
    status: '1',
    remark: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  dictName: [defaultRequiredRule],
  dictType: [defaultRequiredRule],
  status: [defaultRequiredRule]
};

/** module options sourced from existing dict types; new values can be typed in via the tag select */
const moduleOptions = ref<{ label: string; value: string }[]>([]);

async function loadModuleOptions() {
  const response = await fetchGetDictTypeList({ current: 1, size: 100 });
  const modules = new Set<string>();
  response.records.forEach(item => {
    if (item.module) {
      modules.add(item.module);
    }
  });
  moduleOptions.value = [...modules].sort().map(value => ({ label: value, value }));
}

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

  const payload = { ...model.value, module: model.value.module || '' };

  try {
    if (props.operateType === 'add') {
      await addDictType(payload);
    } else {
      await updateDictType({
        ...(props.rowData as Api.SystemManage.DictType),
        ...payload
      });
    }

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch {
    // request errors are surfaced by the request layer
  }
}

watch(visible, value => {
  if (value) {
    handleInitModel();
    restoreValidation();
    loadModuleOptions();
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
        <NFormItem :label="$t('page.manage.dict.module')" path="module">
          <NSelect
            v-model:value="model.module"
            :options="moduleOptions"
            :placeholder="$t('page.manage.dict.form.module')"
            filterable
            tag
            clearable
          />
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
