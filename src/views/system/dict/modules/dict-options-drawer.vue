<script setup lang="tsx">
import { computed, reactive, ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord, enableStatusOptions } from '@/constants/business';
import { translateOptions } from '@/utils/common';
import {
  addDictOption,
  batchDeleteDictOption,
  deleteDictOption,
  fetchGetDictOptionList,
  updateDictOption
} from '@/service/api';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'DictOptionsDrawer'
});

interface Props {
  /** the dict type whose options are managed */
  dictType?: Api.SystemManage.DictType | null;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const searchParams = reactive<{
  current: number;
  size: number;
  optionLabel: string | null;
  status: Api.Common.EnableStatus | null;
}>({
  current: 1,
  size: 10,
  optionLabel: null,
  status: null
});

const { columns, data, getData, getDataByPage, loading, pagination } = useNaivePaginatedTable({
  // the drawer is mounted (hidden) with the page, so the table auto-fetches once
  // on setup; skip the request until a real dict type is selected
  api: () => {
    const dictType = props.dictType?.dictType;
    if (!dictType) {
      return Promise.resolve({ records: [], current: 1, size: 10, total: 0 });
    }
    return fetchGetDictOptionList({ ...searchParams, dictType });
  },
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.current = params.page ?? 1;
    searchParams.size = params.pageSize ?? 10;
  },
  columns: () => [
    {
      key: 'optionLabel',
      title: $t('page.manage.dict.option.optionLabel'),
      align: 'center',
      minWidth: 120,
      render: row => (
        <NTag type={(row.colorTag as NaiveUI.ThemeColor) || 'default'}>{row.optionLabel}</NTag>
      )
    },
    {
      key: 'optionValue',
      title: $t('page.manage.dict.option.optionValue'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'sort',
      title: $t('page.manage.dict.option.sort'),
      align: 'center',
      width: 70
    },
    {
      key: 'status',
      title: $t('page.manage.dict.status'),
      align: 'center',
      width: 80,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'remark',
      title: $t('page.manage.dict.remark'),
      minWidth: 110,
      ellipsis: { tooltip: true }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 140,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => openEdit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ]
});

const { operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

async function handleDelete(id: string) {
  try {
    await deleteDictOption(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleBatchDelete() {
  try {
    await batchDeleteDictOption(checkedRowKeys.value);
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

function search() {
  getDataByPage();
}

function resetSearch() {
  searchParams.optionLabel = null;
  searchParams.status = null;
  getDataByPage();
}

// ---------------- option form modal ----------------
const modalVisible = ref(false);
const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const colorTagOptions: { label: string; value: Api.SystemManage.DictColorTag }[] = (
  ['default', 'primary', 'info', 'success', 'warning', 'error'] as Api.SystemManage.DictColorTag[]
).map(value => ({ label: value, value }));

const model = ref(createDefaultModel());

function createDefaultModel() {
  return {
    dictType: '',
    optionLabel: '',
    optionValue: '',
    sort: 1,
    colorTag: 'default' as Api.SystemManage.DictColorTag,
    status: '1' as Api.Common.EnableStatus,
    remark: ''
  };
}

const modalTitle = computed(() =>
  operateType.value === 'add' ? $t('page.manage.dict.option.addOption') : $t('page.manage.dict.option.editOption')
);

function handleInitModel() {
  model.value = createDefaultModel();
  model.value.dictType = props.dictType?.dictType || '';

  if (operateType.value === 'edit' && editingData.value) {
    Object.assign(model.value, JSON.parse(JSON.stringify(editingData.value)));
  }
}

async function handleSubmit() {
  await validate();

  try {
    if (operateType.value === 'add') {
      await addDictOption(model.value);
    } else {
      await updateDictOption({
        ...(editingData.value as Api.SystemManage.DictOption),
        ...model.value
      });
    }

    window.$message?.success($t('common.updateSuccess'));
    modalVisible.value = false;
    getDataByPage();
  } catch {
    // request errors are surfaced by the request layer
  }
}

watch(
  () => modalVisible.value,
  value => {
    if (value) {
      handleInitModel();
      restoreValidation();
    }
  }
);

// reload options each time the drawer opens for a (possibly different) dict type
watch(
  () => visible.value,
  value => {
    if (value) {
      searchParams.current = 1;
      searchParams.optionLabel = null;
      searchParams.status = null;
      getDataByPage();
    }
  }
);

function addOption() {
  handleAdd();
  modalVisible.value = true;
}

function openEdit(id: string) {
  handleEdit(id);
  modalVisible.value = true;
}
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="760">
    <NDrawerContent :title="`${$t('page.manage.dict.dictOptions')} - ${dictType?.dictName || ''}`" closable>
      <div class="flex-col gap-16px">
        <NCard :bordered="false" size="small">
          <div class="flex flex-wrap items-center gap-12px lt-sm:flex-col lt-sm:items-stretch">
            <!-- the width sits on the wrapper: naive-ui injects .n-input{width:100%} after unocss, which would otherwise stretch the input to the full row -->
            <div class="w-200px lt-sm:w-full">
              <NInput
                v-model:value="searchParams.optionLabel"
                :placeholder="$t('page.manage.dict.option.form.optionLabel')"
                clearable
                @keydown.enter="search"
              />
            </div>
            <NSelect
              v-model:value="searchParams.status"
              :placeholder="$t('page.manage.dict.form.status')"
              :options="translateOptions(enableStatusOptions)"
              clearable
              class="w-140px lt-sm:w-full"
            />
            <NButton type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              {{ $t('common.search') }}
            </NButton>
            <NButton quaternary @click="resetSearch">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.reset') }}
            </NButton>
            <div class="ml-auto flex-y-center gap-12px">
              <NButton type="primary" @click="addOption">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                {{ $t('common.add') }}
              </NButton>
              <NPopconfirm @positive-click="handleBatchDelete">
                <template #trigger>
                  <NButton type="error" ghost :disabled="checkedRowKeys.length === 0">
                    {{ $t('common.batchDelete') }}
                  </NButton>
                </template>
                {{ $t('common.confirmDelete') }}
              </NPopconfirm>
            </div>
          </div>
        </NCard>

        <NDataTable
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="data"
          size="small"
          :loading="loading"
          remote
          :row-key="row => row.id"
          :pagination="pagination"
        />
      </div>

      <NModal v-model:show="modalVisible" preset="card" class="w-460px" :title="modalTitle">
        <NForm
          ref="formRef"
          :model="model"
          :rules="{
            optionLabel: [defaultRequiredRule],
            optionValue: [defaultRequiredRule],
            sort: [defaultRequiredRule]
          }"
          label-placement="left"
          :label-width="90"
        >
          <NFormItem :label="$t('page.manage.dict.option.optionLabel')" path="optionLabel">
            <NInput v-model:value="model.optionLabel" :placeholder="$t('page.manage.dict.option.form.optionLabel')" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.dict.option.optionValue')" path="optionValue">
            <NInput v-model:value="model.optionValue" :placeholder="$t('page.manage.dict.option.form.optionValue')" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.dict.option.sort')" path="sort">
            <NInputNumber v-model:value="model.sort" class="w-full" :min="1" />
          </NFormItem>
          <NFormItem :label="$t('page.manage.dict.option.colorTag')" path="colorTag">
            <NSelect v-model:value="model.colorTag" :options="colorTagOptions" />
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
          <NSpace justify="end">
            <NButton @click="modalVisible = false">{{ $t('common.cancel') }}</NButton>
            <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
          </NSpace>
        </template>
      </NModal>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
