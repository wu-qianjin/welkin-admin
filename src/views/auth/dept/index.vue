<script setup lang="tsx">
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import type { DataTableRowKey } from 'naive-ui';
import { NButton, NEmpty, NIcon, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { batchDeleteDept, deleteDept, fetchGetDeptList } from '@/service/api';
import { $t } from '@/locales';
import DeptSearch from './modules/dept-search.vue';
import DeptOperateDrawer from './modules/dept-operate-drawer.vue';

defineOptions({
  name: 'DeptManage'
});

/** the type of the operate drawer: addChild / edit */
type DeptOperateType = 'addChild' | 'edit';

const loading = ref(false);
const deptTree = shallowRef<Api.SystemManage.Dept[]>([]);
const selectedId = ref<string | null>(null);

const searchParams = ref<Api.SystemManage.DeptSearchParams>({
  current: 1,
  size: 100,
  deptName: null,
  status: null
});

function handleSearch() {
  loadData();
}

function findDept(depts: Api.SystemManage.Dept[], id: string | null): Api.SystemManage.Dept | null {
  if (id === null) {
    return null;
  }

  for (const dept of depts) {
    if (dept.id === id) {
      return dept;
    }

    const found = findDept(dept.children ?? [], id);
    if (found) {
      return found;
    }
  }

  return null;
}

const selectedDept = computed(() => findDept(deptTree.value, selectedId.value));
const childRows = computed(() => selectedDept.value?.children ?? []);

interface DeptTreeNode {
  [key: string]: unknown;
  id: string;
  deptName: string;
  children?: DeptTreeNode[];
}

/** map api depts to tree nodes, dropping null children for the NTree option type */
function buildTreeNodes(depts: Api.SystemManage.Dept[]): DeptTreeNode[] {
  return depts.map(dept => {
    const children = dept.children?.length ? buildTreeNodes(dept.children) : undefined;
    return { id: dept.id, deptName: dept.deptName, ...(children ? { children } : {}) };
  });
}

const treeData = computed(() => buildTreeNodes(deptTree.value));

async function loadData() {
  loading.value = true;

  try {
    const list = await fetchGetDeptList(searchParams.value);
    deptTree.value = list.records;

    // keep the selection when possible, otherwise fall back to the first root dept
    if (!findDept(list.records, selectedId.value)) {
      selectedId.value = list.records[0]?.id ?? null;
    }

    expandAll();
  } catch {
    // request errors are surfaced by the request layer
  } finally {
    loading.value = false;
  }
}

const expandedKeys = ref<string[]>([]);

function collectDeptIds(depts: Api.SystemManage.Dept[], ids: string[] = []): string[] {
  depts.forEach(dept => {
    ids.push(dept.id);
    if (dept.children?.length) {
      collectDeptIds(dept.children, ids);
    }
  });
  return ids;
}

function expandAll() {
  expandedKeys.value = collectDeptIds(deptTree.value);
}

function collapseAll() {
  expandedKeys.value = [];
}

/** selecting a node expands it if needed, but never collapses an expanded one */
function handleTreeSelect(keys: string[]) {
  selectedId.value = keys[0] ?? null;

  if (selectedId.value !== null && !expandedKeys.value.includes(selectedId.value)) {
    expandedKeys.value.push(selectedId.value);
  }
}

onMounted(loadData);

const checkedRowKeys = ref<DataTableRowKey[]>([]);

watch(selectedId, () => {
  checkedRowKeys.value = [];
});

const columns: NaiveUI.TableColumn<Api.SystemManage.Dept>[] = [
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
    minWidth: 200,
    render: row => {
      const childCount = row.children?.length ?? 0;
      return (
        <div class="flex-y-center gap-8px">
          <span class="font-500">{row.deptName}</span>
          {childCount > 0 ? <NTag size="small" bordered>{childCount + $t('page.manage.dept.childCountSuffix')}</NTag> : null}
        </div>
      );
    }
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
        <NButton type="primary" ghost size="small" onClick={() => handleEdit(row)}>
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
];

const drawerVisible = ref(false);
const editingData = ref<Api.SystemManage.Dept | null>(null);
const deptOperateType = ref<DeptOperateType>('addChild');
const parentDept = ref<Api.SystemManage.Dept | null>(null);

const drawerTitle = computed(() => {
  const titles: Record<DeptOperateType, string> = {
    addChild: $t('page.manage.dept.addChildDept'),
    edit: $t('page.manage.dept.editDept')
  };
  return titles[deptOperateType.value];
});

function handleAddChild(dept: Api.SystemManage.Dept | null) {
  deptOperateType.value = 'addChild';
  parentDept.value = dept;
  editingData.value = null;
  drawerVisible.value = true;
}

function handleEdit(row: Api.SystemManage.Dept) {
  deptOperateType.value = 'edit';
  parentDept.value = null;
  editingData.value = row;
  drawerVisible.value = true;
}

async function handleDelete(id: string) {
  try {
    await deleteDept(id);
    window.$message?.success($t('common.deleteSuccess'));
    await loadData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleBatchDelete() {
  try {
    await batchDeleteDept(checkedRowKeys.value.map(String));
    checkedRowKeys.value = [];
    window.$message?.success($t('common.deleteSuccess'));
    await loadData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

const treeSelectedKeys = computed(() => (selectedId.value === null ? [] : [selectedId.value]));

function renderTreeSuffix({ option }: { option: unknown }) {
  const dept = option as DeptTreeNode;
  const count = dept.children?.length ?? 0;
  return count > 0 ? <span class="pl-4px text-12px text-gray-4">{count}</span> : null;
}
</script>

<template>
  <div class="min-h-500px flex gap-16px lt-md:flex-col">
    <NCard
      :title="$t('page.manage.dept.orgStructure')"
      :bordered="false"
      size="small"
      class="card-wrapper w-300px shrink-0"
    >
      <template #header-extra>
        <div class="flex-y-center gap-2px">
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton size="tiny" quaternary class="h-24px px-6px" @click="expandAll">
                <NIcon size="14"><icon-mdi-unfold-more-horizontal /></NIcon>
              </NButton>
            </template>
            {{ $t('page.manage.dept.expandAll') }}
          </NTooltip>
          <NTooltip trigger="hover">
            <template #trigger>
              <NButton size="tiny" quaternary class="h-24px px-6px" @click="collapseAll">
                <NIcon size="14"><icon-mdi-unfold-less-horizontal /></NIcon>
              </NButton>
            </template>
            {{ $t('page.manage.dept.collapseAll') }}
          </NTooltip>
        </div>
      </template>
      <NSpin :show="loading">
        <NTree
          v-if="deptTree.length"
          v-model:expanded-keys="expandedKeys"
          :data="treeData"
          key-field="id"
          label-field="deptName"
          children-field="children"
          :selected-keys="treeSelectedKeys"
          block-line
          :render-suffix="renderTreeSuffix"
          @update:selected-keys="handleTreeSelect"
        />
        <NEmpty v-else class="py-60px" :description="$t('page.manage.dept.noMatchDept')" />
      </NSpin>
    </NCard>

    <div class="min-w-0 flex-1 flex-col-stretch gap-16px">
      <DeptSearch v-model:model="searchParams" @search="handleSearch" />

      <NCard :bordered="false" size="small" class="card-wrapper">
        <template #header>
          <div class="flex-y-center gap-8px">
            <span>{{ selectedDept?.deptName ?? $t('page.manage.dept.deptName') }}</span>
            <span class="text-13px font-400 text-gray-4">{{ $t('page.manage.dept.childList') }}</span>
          </div>
        </template>
        <template #header-extra>
          <div class="flex-y-center gap-8px">
            <NButton size="small" ghost type="primary" :disabled="!selectedDept" @click="handleAddChild(selectedDept)">
              <template #icon>
                <NIcon><icon-ic-round-plus class="text-icon" /></NIcon>
              </template>
              {{ $t('page.manage.dept.addChildDept') }}
            </NButton>
            <NPopconfirm @positive-click="handleBatchDelete">
              <template #trigger>
                <NButton size="small" ghost type="error" :disabled="checkedRowKeys.length === 0">
                  <template #icon>
                    <NIcon><icon-ic-round-delete class="text-icon" /></NIcon>
                  </template>
                  {{ $t('common.batchDelete') }}
                </NButton>
              </template>
              {{ $t('common.confirmDelete') }}
            </NPopconfirm>
            <NButton size="small" :loading="loading" @click="loadData">
              <template #icon>
                <NIcon><icon-mdi-refresh class="text-icon" /></NIcon>
              </template>
              {{ $t('common.refresh') }}
            </NButton>
          </div>
        </template>

        <NDataTable
          v-if="childRows.length"
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="childRows"
          size="small"
          :scroll-x="1200"
          :row-key="row => row.id"
          :pagination="false"
        />
        <NEmpty v-else class="py-80px" :description="$t('page.manage.dept.noChildDept')">
          <template #extra>
            <NButton size="small" type="primary" ghost :disabled="!selectedDept" @click="handleAddChild(selectedDept)">
              {{ $t('page.manage.dept.addChildDept') }}
            </NButton>
          </template>
        </NEmpty>
      </NCard>
    </div>

    <DeptOperateDrawer
      v-model:visible="drawerVisible"
      :operate-title="drawerTitle"
      :is-edit="deptOperateType === 'edit'"
      :parent-dept="parentDept"
      :row-data="editingData"
      @submitted="loadData"
    />
  </div>
</template>

<style scoped></style>
