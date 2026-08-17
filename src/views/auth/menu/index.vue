<script setup lang="tsx">
import { computed, reactive, ref } from 'vue';
import type { PaginationProps } from 'naive-ui';
import type { Ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { useBoolean } from '@sa/hooks';
import { yesOrNoRecord } from '@/constants/common';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { batchDeleteMenu, deleteMenu, fetchGetAllPages, fetchGetMenuList } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { useNaiveTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';
import MenuSearch from './modules/menu-search.vue';

const appStore = useAppStore();

const { bool: visible, setTrue: openModal } = useBoolean();

const wrapperRef = ref<HTMLElement | null>(null);

const searchParams = ref<Api.SystemManage.MenuSearchParams>({
  current: null,
  size: null,
  menuName: null,
  menuType: null,
  status: null
});

/** 后端分页 size 上限 100，循环取回全部菜单，前端建完整树后本地分页展示 */
async function fetchAllMenus(): Promise<Api.SystemManage.Menu[]> {
  const filters = {
    menuName: searchParams.value.menuName,
    menuType: searchParams.value.menuType,
    status: searchParams.value.status
  };
  const first = await fetchGetMenuList({ ...filters, current: 1, size: 100 });
  const records = [...first.records];
  const pages = Math.ceil(first.total / first.size);
  for (let page = 2; page <= pages; page += 1) {
    const rest = await fetchGetMenuList({ ...filters, current: page, size: 100 });
    records.push(...rest.records);
  }
  return records;
}

const { columns, columnChecks, data, getData, loading } = useNaiveTable({
  api: () => fetchAllMenus(),
  transform: menus => menus,
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: $t('page.manage.menu.id'),
      align: 'center'
    },
    {
      key: 'menuType',
      title: $t('page.manage.menu.menuType'),
      align: 'center',
      width: 80,
      render: row => {
        const tagMap: Record<Api.SystemManage.MenuType, NaiveUI.ThemeColor> = {
          1: 'default',
          2: 'primary'
        };

        const label = $t(menuTypeRecord[row.menuType]);

        return <NTag type={tagMap[row.menuType]}>{label}</NTag>;
      }
    },
    {
      key: 'menuName',
      title: $t('page.manage.menu.menuName'),
      align: 'center',
      minWidth: 120,
      render: row => {
        const { i18nKey, menuName } = row;

        const label = i18nKey ? $t(i18nKey) : menuName;

        return <span>{label}</span>;
      }
    },
    {
      key: 'icon',
      title: $t('page.manage.menu.icon'),
      align: 'center',
      width: 60,
      render: row => {
        const icon = row.iconType === '1' ? row.icon : undefined;

        const localIcon = row.iconType === '2' ? row.icon : undefined;

        return (
          <div class="flex-center">
            <SvgIcon icon={icon} localIcon={localIcon} class="text-icon" />
          </div>
        );
      }
    },
    {
      key: 'routeName',
      title: $t('page.manage.menu.routeName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'routePath',
      title: $t('page.manage.menu.routePath'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.menu.menuStatus'),
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
      key: 'hideInMenu',
      title: $t('page.manage.menu.hideInMenu'),
      align: 'center',
      width: 80,
      render: row => {
        const hide: CommonType.YesOrNo = row.hideInMenu ? 'Y' : 'N';

        const tagMap: Record<CommonType.YesOrNo, NaiveUI.ThemeColor> = {
          Y: 'error',
          N: 'default'
        };

        const label = $t(yesOrNoRecord[hide]);

        return <NTag type={tagMap[hide]}>{label}</NTag>;
      }
    },
    {
      key: 'order',
      title: $t('page.manage.menu.order'),
      align: 'center',
      width: 60
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 230,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          {row.menuType === '1' && (
            <NButton type="primary" ghost size="small" onClick={() => handleAddChildMenu(row)}>
              {$t('page.manage.menu.addChildMenu')}
            </NButton>
          )}
          <NButton type="primary" ghost size="small" onClick={() => handleEdit(row)}>
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

/** 本地分页：naive-ui 非 remote 模式按顶层行切片，子级随父行嵌套展示 */
const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onUpdatePage(page: number) {
    pagination.page = page;
  },
  onUpdatePageSize(pageSize: number) {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
}) as PaginationProps;

const mobilePagination = computed(() => {
  const p: PaginationProps = {
    ...pagination,
    pageSlot: appStore.isMobile ? 3 : 9,
    prefix: info => (appStore.isMobile ? undefined : $t('datatable.itemCount', { total: info.itemCount ?? 0 }))
  };

  return p;
});

/** 搜索条件变化后回到第 1 页再取数 */
async function handleSearch() {
  pagination.page = 1;
  await getData();
}

const { checkedRowKeys } = useTableOperate(data, 'id', getData);

type MenuTreeNode = Omit<Api.SystemManage.Menu, 'children'> & { children?: MenuTreeNode[] };

const treeData = computed<MenuTreeNode[]>(() => {
  const nodes = new Map<string, MenuTreeNode>();
  for (const item of data.value) nodes.set(item.id, { ...item, children: undefined });
  const roots: MenuTreeNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId && node.parentId !== '0' ? nodes.get(node.parentId) : undefined;
    if (parent) {
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (list: MenuTreeNode[]) => {
    list.sort(
      (a, b) => a.menuType.localeCompare(b.menuType) || (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
    );
    for (const node of list) {
      if (node.children?.length) {
        sortNodes(node.children);
      } else {
        delete node.children;
      }
    }
  };
  sortNodes(roots);
  return roots;
});

const operateType = ref<OperateType>('add');

function handleAdd() {
  operateType.value = 'add';
  openModal();
}

async function handleBatchDelete() {
	await batchDeleteMenu(checkedRowKeys.value);
	checkedRowKeys.value = [];
	await getData();
}

async function handleDelete(id: string) {
	await deleteMenu(id);
	await getData();
}

/** the edit menu data or the parent menu data when adding a child menu */
const editingData: Ref<Api.SystemManage.Menu | null> = ref(null);

function handleEdit(item: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...item };

  openModal();
}

function handleAddChildMenu(item: Api.SystemManage.Menu) {
  operateType.value = 'addChild';

  editingData.value = { ...item };

  openModal();
}

async function handleSubmitted(_row: Api.SystemManage.Menu) {
  await getData();
}

const allPages = ref<string[]>([]);

async function getAllPages() {
  try {
    const pages = await fetchGetAllPages();
    allPages.value = pages || [];
  } catch {
    // request errors are surfaced by the request layer
  }
}

function init() {
  getAllPages();
}

// init
init();
</script>

<template>
  <div ref="wrapperRef" class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <MenuSearch v-model:model="searchParams" @search="handleSearch" />
    <NCard :title="$t('page.manage.menu.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        :data="treeData"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="998"
        :loading="loading"
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :all-pages="allPages"
        @submitted="handleSubmitted"
      />
    </NCard>
  </div>
</template>

<style scoped></style>
