<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import {
  batchDeleteDictType,
  deleteDictType,
  fetchGetDictTypeList
} from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import { formatDateTime } from '@/utils/common';
import DictOptionsDrawer from './modules/dict-options-drawer.vue';
import DictSearch from './modules/dict-search.vue';
import DictTypeOperateDrawer from './modules/dict-type-operate-drawer.vue';

defineOptions({
  name: 'DictManage'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.DictTypeSearchParams>({
  current: 1,
  size: 10,
  dictName: null,
  dictType: null,
  module: null,
  status: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetDictTypeList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'dictName',
      title: $t('page.manage.dict.dictName'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'dictType',
      title: $t('page.manage.dict.dictType'),
      align: 'center',
      minWidth: 160
    },
    {
      key: 'module',
      title: $t('page.manage.dict.module'),
      align: 'center',
      minWidth: 90,
      render: row => row.module || '-'
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
      minWidth: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: 'updateTime',
      title: $t('page.manage.dict.updateTime'),
      align: 'center',
      width: 170,
      render: row => formatDateTime(row.updateTime)
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 240,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          <NButton type="info" ghost size="small" onClick={() => openOptions(row)}>
            {$t('page.manage.dict.dictOptions')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function edit(id: string) {
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteDictType(checkedRowKeys.value);
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: string) {
  try {
    await deleteDictType(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

// dict options drawer
const optionsVisible = ref(false);
const optionsDictType = ref<Api.SystemManage.DictType | null>(null);

function openOptions(row: Api.SystemManage.DictType) {
  optionsDictType.value = row;
  optionsVisible.value = true;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DictSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.dict.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1100"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <DictTypeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <DictOptionsDrawer v-model:visible="optionsVisible" :dict-type="optionsDictType" />
    </NCard>
  </div>
</template>

<style scoped></style>
