<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { yesOrNoRecord } from '@/constants/common';
import { batchDeleteConfig, deleteConfig, fetchGetConfigList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ConfigOperateDrawer from './modules/config-operate-drawer.vue';
import ConfigSearch from './modules/config-search.vue';

defineOptions({
  name: 'ConfigManage'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.SystemConfigSearchParams>({
  current: 1,
  size: 10,
  paramName: null,
  paramKey: null,
  status: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetConfigList(searchParams.value),
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
      key: 'paramName',
      title: $t('page.manage.config.paramName'),
      align: 'center',
      minWidth: 140
    },
    {
      key: 'paramKey',
      title: $t('page.manage.config.paramKey'),
      align: 'center',
      minWidth: 200,
      ellipsis: { tooltip: true }
    },
    {
      key: 'paramValue',
      title: $t('page.manage.config.paramValue'),
      minWidth: 160,
      ellipsis: { tooltip: true }
    },
    {
      key: 'builtIn',
      title: $t('page.manage.config.builtIn'),
      align: 'center',
      width: 80,
      render: row => {
        const tagMap: Record<CommonType.YesOrNo, NaiveUI.ThemeColor> = {
          Y: 'warning',
          N: 'default'
        };

        const label = $t(yesOrNoRecord[row.builtIn]);

        return <NTag type={tagMap[row.builtIn]}>{label}</NTag>;
      }
    },
    {
      key: 'status',
      title: $t('page.manage.config.paramStatus'),
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
      title: $t('page.manage.config.remark'),
      minWidth: 140,
      ellipsis: { tooltip: true }
    },
    {
      key: 'updateTime',
      title: $t('page.manage.config.updateTime'),
      align: 'center',
      width: 170
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
                <NButton type="error" ghost size="small" disabled={row.builtIn === 'Y'}>
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

function edit(id: number) {
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteConfig(checkedRowKeys.value.map(Number));
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: number) {
  try {
    await deleteConfig(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ConfigSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.config.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        :scroll-x="1200"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <ConfigOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
