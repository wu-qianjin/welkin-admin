<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { batchDeleteApi, deleteApi, fetchGetApiList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ApiOperateDrawer from './api-operate-drawer.vue';
import ApiResourceSearch from './api-resource-search.vue';

defineOptions({
  name: 'ApiResource'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.ApiResourceSearchParams>({
  current: 1,
  size: 10,
  apiName: null,
  apiPath: null,
  apiMethod: null,
  apiModule: null,
  status: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetApiList(searchParams.value),
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
      key: 'apiName',
      title: $t('page.manage.resource.api.apiName'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'apiPath',
      title: $t('page.manage.resource.api.apiPath'),
      minWidth: 220,
      ellipsis: { tooltip: true }
    },
    {
      key: 'apiMethod',
      title: $t('page.manage.resource.api.apiMethod'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<Api.SystemManage.ApiMethod, NaiveUI.ThemeColor> = {
          GET: 'info',
          POST: 'success',
          PUT: 'warning',
          DELETE: 'error'
        };

        return <NTag type={tagMap[row.apiMethod]}>{row.apiMethod}</NTag>;
      }
    },
    {
      key: 'apiModule',
      title: $t('page.manage.resource.api.apiModule'),
      align: 'center',
      minWidth: 110
    },
    {
      key: 'status',
      title: $t('page.manage.resource.status'),
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
      title: $t('page.manage.resource.remark'),
      minWidth: 120,
      ellipsis: { tooltip: true }
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
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
    await batchDeleteApi(checkedRowKeys.value);
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: string) {
  try {
    await deleteApi(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}
</script>

<template>
  <div class="flex-col-stretch gap-16px">
    <ApiResourceSearch v-model:model="searchParams" @search="getDataByPage" />

    <NCard :title="$t('page.manage.resource.apiTab')" :bordered="false" size="small" class="card-wrapper flex-1-hidden">
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
        :loading="loading"
        remote
        :scroll-x="1200"
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <ApiOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
