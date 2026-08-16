<script setup lang="tsx">
import { ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { yesOrNoRecord } from '@/constants/common';
import { batchDeleteConfig, deleteConfig, fetchConfigHistory, fetchGetConfigList, type ConfigHistoryItem } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ConfigOperateDrawer from './modules/config-operate-drawer.vue';
import ConfigSearch from './modules/config-search.vue';

defineOptions({
  name: 'ConfigManage'
});

const appStore = useAppStore();
const historyVisible = ref(false);
const history = ref<ConfigHistoryItem[]>([]);

watch(historyVisible, async visible => {
  if (visible) {
    const result = await fetchConfigHistory();
    history.value = result.records;
  }
});

function displayConfigValue(row: Api.SystemManage.SystemConfig) {
  return /password|token|secret|key/i.test(row.paramKey) ? '••••••••' : row.paramValue;
}

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
      ellipsis: { tooltip: true },
      render: row => displayConfigValue(row)
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

function edit(id: string) {
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteConfig(checkedRowKeys.value);
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: string) {
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
        <NButton size="small" secondary class="mr-8px" @click="historyVisible = true">
          <template #icon><icon-mdi-history /></template>
          变更历史
        </NButton>
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
      <NModal v-model:show="historyVisible" preset="card" title="参数变更历史" class="w-900px">
        <NDataTable
          :data="history"
          :pagination="false"
          size="small"
          :columns="[
            { key: 'configName', title: '参数名称', minWidth: 150 },
            { key: 'paramKey', title: '参数键', minWidth: 180 },
            { key: 'beforeValue', title: '修改前', minWidth: 120 },
            { key: 'afterValue', title: '修改后', minWidth: 120 },
            { key: 'operator', title: '操作人', width: 90 },
            { key: 'operatedAt', title: '变更时间', width: 170 },
            { key: 'reason', title: '变更原因', minWidth: 150 }
          ]"
          :scroll-x="980"
        />
        <template #footer>
          <NSpace justify="end"><NButton type="primary" @click="historyVisible = false">关闭</NButton></NSpace>
        </template>
      </NModal>
    </NCard>
  </div>
</template>

<style scoped></style>
