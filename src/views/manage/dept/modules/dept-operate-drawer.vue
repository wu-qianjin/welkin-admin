<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { enableStatusOptions } from '@/constants/business';
import { addDept, fetchGetDeptList, updateDept } from '@/service/api';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DeptOperateDrawer'
});

interface Props {
  /** the drawer title, distinguishes add / addChild / edit */
  operateTitle: string;
  /** whether it is an edit operation */
  isEdit: boolean;
  /** the parent dept preset when adding a child dept */
  parentDept?: Api.SystemManage.Dept | null;
  /** the edit row data */
  rowData?: Api.SystemManage.Dept | null;
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
const { defaultRequiredRule, patternRules } = useFormRules();

const model = ref(createDefaultModel());

function createDefaultModel() {
  return {
    deptName: '',
    parentId: 0,
    leader: '',
    phone: '',
    email: '',
    order: 1,
    status: '1' as Api.Common.EnableStatus
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  deptName: [defaultRequiredRule],
  order: [defaultRequiredRule],
  status: [defaultRequiredRule],
  phone: [patternRules.phone],
  email: [patternRules.email]
};

type TreeOption = { key: number; label: string; children?: TreeOption[] };

/** tree options of all depts for parent selection */
const deptTreeOptions = shallowRef<TreeOption[]>([]);

function buildTreeOptions(depts: Api.SystemManage.Dept[]): TreeOption[] {
  return depts.map(dept => ({
    key: dept.id,
    label: dept.deptName,
    children: dept.children?.length ? buildTreeOptions(dept.children) : undefined
  }));
}

async function getDeptTreeOptions() {
  try {
    const list = await fetchGetDeptList({ current: 1, size: 100 });
    deptTreeOptions.value = buildTreeOptions(list.records);
  } catch {
    // request errors are surfaced by the request layer
  }
}

/** when editing, disable the node itself and its descendants as parent options */
function disableSelfSubtree(options: TreeOption[], disabledId: number) {
  options.forEach(option => {
    if (option.key === disabledId) {
      option.children = undefined;
      return;
    }
    if (option.children) {
      disableSelfSubtree(option.children, disabledId);
    }
  });
}

const computedTreeOptions = ref<TreeOption[]>([]);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.isEdit && props.rowData) {
    const { children: _children, ...rest } = jsonClone(props.rowData);
    Object.assign(model.value, rest);
  } else if (props.parentDept) {
    model.value.parentId = props.parentDept.id;
  }

  const options = jsonClone(deptTreeOptions.value) as TreeOption[];
  if (props.isEdit && props.rowData) {
    disableSelfSubtree(options, props.rowData.id);
  }
  computedTreeOptions.value = [{ key: 0, label: $t('page.manage.dept.rootDept'), children: options }];
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  try {
    if (props.isEdit) {
      await updateDept({ ...(props.rowData as Api.SystemManage.Dept), ...model.value });
    } else {
      await addDept(model.value);
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
    getDeptTreeOptions();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="400">
    <NDrawerContent :title="operateTitle" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem :label="$t('page.manage.dept.parentDept')" path="parentId">
          <NTreeSelect
            v-model:value="model.parentId"
            :options="computedTreeOptions"
            key-field="key"
            label-field="label"
            children-field="children"
            :placeholder="$t('page.manage.dept.form.parentDept')"
            default-expand-all
          />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.deptName')" path="deptName">
          <NInput v-model:value="model.deptName" :placeholder="$t('page.manage.dept.form.deptName')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.leader')" path="leader">
          <NInput v-model:value="model.leader" :placeholder="$t('page.manage.dept.form.leader')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.phone')" path="phone">
          <NInput v-model:value="model.phone" :placeholder="$t('page.manage.dept.form.phone')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.email')" path="email">
          <NInput v-model:value="model.email" :placeholder="$t('page.manage.dept.form.email')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.order')" path="order">
          <NInputNumber v-model:value="model.order" class="w-full" :min="1" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.dept.status')" path="status">
          <NRadioGroup v-model:value="model.status">
            <NRadio v-for="item in enableStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
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
