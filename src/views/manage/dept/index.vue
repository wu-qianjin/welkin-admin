<script setup lang="tsx">
import { computed, ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { batchDeleteDept, deleteDept, fetchGetDeptList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import DeptSearch from './modules/dept-search.vue';
import DeptOperateDrawer from './modules/dept-operate-drawer.vue';

defineOptions({
  name: 'DeptManage'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.DeptSearchParams>({
  current: 1,
  size: 10,
  deptName: null,
  status: null
});

/** the type of the operate drawer: add / addChild / edit */
type DeptOperateType = 'add' | 'addChild' | 'edit';

const deptOperateType = ref<DeptOperateType>('add');
const parentDept = ref<Api.SystemManage.Dept | null>(null);

const { columns, columnChecks, data, getData, getDataByPage, loading } = useNaivePaginatedTable({
  api: () => fetchGetDeptList(searchParams.value),
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
      key: 'deptName',
      title: $t('page.manage.dept.deptName'),
      minWidth: 200
    },
    {
      key: 'leader',
      title: $t('page.manage.dept.leader'),
      align: 'center',
      width: 100,
      render: row => row.leader || '-'
    },
    {
      key: 'phone',
      title: $t('page.manage.dept.phone'),
      align: 'center',
      width: 140,
      render: row => row.phone || '-'
    },
    {
      key: 'email',
      title: $t('page.manage.dept.email'),
      minWidth: 170,
      render: row => row.email || '-'
    },
    {
      key: 'order',
      title: $t('page.manage.dept.order'),
      align: 'center',
      width: 70
    },
    {
      key: 'status',
      title: $t('page.manage.dept.status'),
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
      key: 'createTime',
      title: $t('page.manage.dept.createTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 240,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          <NButton type="info" ghost size="small" onClick={() => handleAddChild(row)}>
            {$t('page.manage.dept.addChildDept')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t('page.manage.dept.confirmDelete'),
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

const { drawerVisible, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function edit(id: number) {
  deptOperateType.value = 'edit';
  parentDept.value = null;
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteDept(checkedRowKeys.value.map(Number));
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: number) {
  try {
    await deleteDept(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

const drawerTitle = computed(() => {
  const titles: Record<DeptOperateType, string> = {
    add: $t('page.manage.dept.addDept'),
    addChild: $t('page.manage.dept.addChildDept'),
    edit: $t('page.manage.dept.editDept')
  };
  return titles[deptOperateType.value];
});

function handleDeptAdd() {
  deptOperateType.value = 'add';
  parentDept.value = null;
  handleAdd();
}

function handleAddChild(row: Api.SystemManage.Dept) {
  deptOperateType.value = 'addChild';
  parentDept.value = row;
  handleAdd();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <DeptSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.dept.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          @add="handleDeptAdd"
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
        default-expand-all
        :row-key="row => row.id"
        :pagination="false"
        class="sm:h-full"
      />
      <DeptOperateDrawer
        v-model:visible="drawerVisible"
        :operate-title="drawerTitle"
        :is-edit="deptOperateType === 'edit'"
        :parent-dept="parentDept"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
