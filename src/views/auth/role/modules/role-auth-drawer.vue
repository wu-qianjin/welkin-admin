<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  fetchGetApiList,
  fetchGetButtonList,
  fetchGetMenuList,
  fetchGetMenuTree,
  fetchRolePermissions,
  updateRolePermissions
} from '@/service/api';
import { $t } from '@/locales';
import { fetchAllPages } from '@/utils/common';
import { useAuthStore } from '@/store/modules/auth';
import { useRouteStore } from '@/store/modules/route';

defineOptions({ name: 'RoleAuthDrawer' });

interface Props {
  roleId: string;
  roleName?: string;
  roleCode?: string;
}

interface MenuOption {
  key: string;
  label: string;
  children?: MenuOption[];
}

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible', { default: false });

const loading = ref(false);
const saving = ref(false);
const loadError = ref('');
const menuPattern = ref('');
const menuTree = ref<MenuOption[]>([]);
// 受控展开：default-expanded-names 仅在挂载瞬间读取（彼时菜单还在异步加载），
// 且 naive-ui 折叠内容在首次展开前不渲染，必须在数据就绪后显式展开。
const expandedMenuGroups = ref<Array<string | number>>([]);
const menuIds = ref<string[]>([]);
const apiIds = ref<string[]>([]);
const buttonIds = ref<string[]>([]);
const apiGroups = ref<Record<string, Api.SystemManage.ApiResource[]>>({});
const buttonGroups = ref<Record<string, Api.SystemManage.ButtonResource[]>>({});

const title = computed(() => `角色授权${props.roleName ? ` · ${props.roleName}` : ''}`);

/** 菜单分组项：叶子节点（含子目录），path 用于深层节点展示归属 */
interface MenuLeaf {
  id: string;
  label: string;
  path: string[];
}
interface MenuGroup {
  key: string;
  label: string;
  leaves: MenuLeaf[];
}

const menuGroups = computed<MenuGroup[]>(() =>
  menuTree.value.map(root => {
    const leaves: MenuLeaf[] = [];
    const walk = (nodes: MenuOption[], trail: string[]) => {
      for (const node of nodes) {
        const next = [...trail, node.label];
        leaves.push({ id: node.key, label: node.label, path: next });
        if (node.children?.length) walk(node.children, next);
      }
    };
    walk(root.children ?? [], [root.label]);
    // 顶级单页（如"关于"）没有子节点，分组内展示自身
    if (leaves.length === 0) leaves.push({ id: root.key, label: root.label, path: [root.label] });
    return { key: root.key, label: root.label, leaves };
  })
);

const filteredMenuGroups = computed(() => {
  const pattern = menuPattern.value?.trim();
  if (!pattern) return menuGroups.value;
  return menuGroups.value
    .map(group => ({
      ...group,
      leaves: group.leaves.filter(leaf => leaf.label.includes(pattern) || group.label.includes(pattern))
    }))
    .filter(group => group.leaves.length > 0);
});

const allMenuIds = computed(() => menuGroups.value.flatMap(group => group.leaves.map(leaf => leaf.id)));

// 搜索时自动展开命中分组；清空搜索时恢复全部展开
watch(menuPattern, value => {
  const pattern = value?.trim();
  expandedMenuGroups.value = pattern
    ? filteredMenuGroups.value.map(group => group.key)
    : menuGroups.value.map(group => group.key);
});
const selectedCount = computed(() => menuIds.value.length + apiIds.value.length + buttonIds.value.length);

function mapMenuTree(nodes: Api.SystemManage.MenuTree[]): MenuOption[] {
  return nodes.map(node => ({
    key: node.id,
    // 优先用 i18nKey 显示本地化标题，缺失时回落 menuName。
    label: node.i18nKey ? $t(node.i18nKey as App.I18n.I18nKey) : node.label,
    children: node.children?.length ? mapMenuTree(node.children) : undefined
  }));
}

function mapMenuList(records: Api.SystemManage.Menu[]): Api.SystemManage.MenuTree[] {
  const nodes = new Map<string, Api.SystemManage.MenuTree>();
  records.forEach(record => {
    nodes.set(record.id, {
      id: record.id,
      label: record.menuName,
      i18nKey: record.i18nKey || undefined,
      pId: String(record.parentId || '0'),
      children: []
    });
  });

  const roots: Api.SystemManage.MenuTree[] = [];
  nodes.forEach(node => {
    const parent = nodes.get(node.pId);
    if (parent) {
      (parent.children ??= []).push(node);
    } else {
      roots.push(node);
    }
  });

  const stripEmptyChildren = (items: Api.SystemManage.MenuTree[]): Api.SystemManage.MenuTree[] =>
    items.map(item => {
      const children = item.children?.length ? stripEmptyChildren(item.children) : undefined;
      return children ? { ...item, children } : { id: item.id, label: item.label, pId: item.pId };
    });

  return stripEmptyChildren(roots);
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyOf(item).trim() || '未分组';
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
}

function groupSelected(ids: string[], items: Array<{ id: string }>) {
  return items.length > 0 && items.every(item => ids.includes(item.id));
}

function toggleGroup(ids: string[], items: Array<{ id: string }>, checked: boolean) {
  const groupIDs = new Set(items.map(item => item.id));
  const next = checked ? new Set([...ids, ...groupIDs]) : new Set(ids.filter(id => !groupIDs.has(id)));
  return [...next];
}

function selectAllMenus() {
  menuIds.value = [...allMenuIds.value];
}

function clearMenus() {
  menuIds.value = [];
}

async function loadAuthorization() {
  if (!props.roleId) return;

  loading.value = true;
  loadError.value = '';
  menuTree.value = [];
  menuIds.value = [];
  apiIds.value = [];
  buttonIds.value = [];
  try {
    let menus: Api.SystemManage.MenuTree[] = [];
    try {
      menus = await fetchGetMenuTree();
    } catch {
      // The flat list is a compatibility fallback for older gateway deployments.
      menus = [];
    }
    if (!menus.length) {
      const menuRecords = await fetchAllPages((current, size) => fetchGetMenuList({ current, size }));
      menus = mapMenuList(menuRecords);
    }

    menuTree.value = mapMenuTree(menus);
    expandedMenuGroups.value = menuGroups.value.map(group => group.key);

    // 后端分页 size 上限 100，资源需全量拉齐，否则第 100 条之后无法授权
    const [permissions, apiRecords, buttonRecords] = await Promise.all([
      fetchRolePermissions(props.roleId),
      fetchAllPages((current, size) => fetchGetApiList({ current, size })),
      fetchAllPages((current, size) => fetchGetButtonList({ current, size }))
    ]);
    menuIds.value = [...permissions.menuIds];
    apiIds.value = [...permissions.apiIds];
    buttonIds.value = [...permissions.buttonIds];
    apiGroups.value = groupBy(apiRecords, item => item.apiModule);
    buttonGroups.value = groupBy(buttonRecords, item => item.menuName);
    menuPattern.value = '';
  } catch {
    loadError.value = '授权数据加载失败，请刷新页面后重试。';
    window.$message?.error(loadError.value);
  } finally {
    loading.value = false;
  }
}

async function submit() {
  saving.value = true;
  try {
    await updateRolePermissions(props.roleId, {
      menuIds: [...new Set(menuIds.value)],
      apiIds: [...new Set(apiIds.value)],
      buttonIds: [...new Set(buttonIds.value)]
    });
    window.$message?.success('角色授权已保存');
    visible.value = false;
    await refreshSelfIfAffected();
  } finally {
    saving.value = false;
  }
}

/** 当前登录用户持有该角色时，热刷新其权限与菜单，避免改动需重新登录才生效 */
async function refreshSelfIfAffected() {
  const authStore = useAuthStore();
  if (!props.roleCode || !authStore.userInfo.roles.includes(props.roleCode)) return;

  const routeStore = useRouteStore();
  await Promise.all([authStore.refreshUserInfo(), routeStore.refreshAuthRoute()]);
  window.$message?.success('当前账号持有该角色，权限与菜单已刷新');
}

watch(
  [visible, () => props.roleId],
  ([shown]) => {
    if (shown) void loadAuthorization();
  },
  // 抽屉由 v-if 挂载，首帧 visible 即为 true，watch 不会触发变化，必须 immediate。
  { immediate: true }
);
</script>

<template>
  <NDrawer v-model:show="visible" :width="920" placement="right">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div class="flex-col-stretch gap-16px pb-12px">
          <NAlert v-if="loadError" type="error" :bordered="false">
            {{ loadError }}
          </NAlert>
          <div class="auth-summary">
            <div>
              <div class="text-16px font-600">权限配置</div>
              <div class="mt-4px text-13px opacity-75">按菜单、接口和按钮分别授权；保存后立即按该角色生效。</div>
            </div>
            <div class="flex-y-center gap-8px">
              <NTag round type="primary">菜单 {{ menuIds.length }}</NTag>
              <NTag round type="info">接口 {{ apiIds.length }}</NTag>
              <NTag round type="success">按钮 {{ buttonIds.length }}</NTag>
            </div>
          </div>

          <NTabs type="segment" animated>
            <NTabPane name="menu" tab="菜单权限">
              <div class="mb-12px flex-y-center justify-between gap-12px">
                <NInput v-model:value="menuPattern" clearable placeholder="搜索菜单名称" class="max-w-360px" />
                <NSpace size="small">
                  <NButton size="small" @click="selectAllMenus">全选</NButton>
                  <NButton size="small" @click="clearMenus">清空</NButton>
                </NSpace>
              </div>
              <div class="permission-panel menu-panel">
                <NEmpty v-if="!filteredMenuGroups.length && !loading" description="暂无可分配菜单" size="small" />
                <NCheckboxGroup v-else v-model:value="menuIds" class="w-full">
                  <NCollapse v-model:expanded-names="expandedMenuGroups" display-directive="show">
                    <NCollapseItem v-for="group in filteredMenuGroups" :key="group.key" :name="group.key">
                      <template #header>
                        <div class="flex-y-center gap-8px">
                          <span class="font-600">{{ group.label }}</span>
                          <NTag size="small" round>{{ group.leaves.length }}</NTag>
                        </div>
                      </template>
                      <template #header-extra>
                        <NCheckbox
                          :checked="groupSelected(menuIds, group.leaves)"
                          @update:checked="checked => (menuIds = toggleGroup(menuIds, group.leaves, checked))"
                          @click.stop
                        >
                          全选
                        </NCheckbox>
                      </template>
                      <div class="menu-grid">
                        <NCheckbox v-for="leaf in group.leaves" :key="leaf.id" :value="leaf.id" class="menu-cell">
                          <NEllipsis>
                            <span v-if="leaf.path.length > 2" class="menu-chip-prefix">
                              {{ leaf.path[leaf.path.length - 2] }} /
                            </span>
                            {{ leaf.label }}
                          </NEllipsis>
                        </NCheckbox>
                      </div>
                    </NCollapseItem>
                  </NCollapse>
                </NCheckboxGroup>
              </div>
              <div class="mt-10px text-12px text-gray-5">
                已选择 {{ menuIds.length }} 项；勾选页面时会自动包含其上级目录。
              </div>
            </NTabPane>

            <NTabPane name="api" tab="接口权限">
              <div class="mb-12px text-13px text-gray-5">按业务模块选择可调用的后端接口。</div>
              <NCheckboxGroup v-model:value="apiIds" class="w-full">
                <NEmpty
                  v-if="!Object.keys(apiGroups).length && !loading"
                  description="暂无可分配接口"
                  size="small"
                  class="py-60px"
                />
                <NCollapse v-else :default-expanded-names="Object.keys(apiGroups)">
                  <NCollapseItem v-for="(items, group) in apiGroups" :key="group" :name="group">
                    <template #header>
                      <div class="flex-y-center gap-8px">
                        <span>{{ group }}</span>
                        <NTag size="small" round>{{ items.length }}</NTag>
                      </div>
                    </template>
                    <template #header-extra>
                      <NCheckbox
                        :checked="groupSelected(apiIds, items)"
                        @update:checked="checked => (apiIds = toggleGroup(apiIds, items, checked))"
                        @click.stop
                      >
                        全选
                      </NCheckbox>
                    </template>
                    <div class="permission-grid">
                      <NCheckbox v-for="item in items" :key="item.id" :value="item.id" class="permission-item">
                        <span class="block font-500">{{ item.apiName }}</span>
                        <span class="mt-3px block text-12px text-gray-5">{{ item.apiMethod }} {{ item.apiPath }}</span>
                      </NCheckbox>
                    </div>
                  </NCollapseItem>
                </NCollapse>
              </NCheckboxGroup>
            </NTabPane>

            <NTabPane name="button" tab="按钮权限">
              <div class="mb-12px text-13px text-gray-5">按页面动作选择新增、编辑、删除、导出等操作权限。</div>
              <NCheckboxGroup v-model:value="buttonIds" class="w-full">
                <NEmpty
                  v-if="!Object.keys(buttonGroups).length && !loading"
                  description="暂无可分配按钮"
                  size="small"
                  class="py-60px"
                />
                <NCollapse v-else :default-expanded-names="Object.keys(buttonGroups)">
                  <NCollapseItem v-for="(items, group) in buttonGroups" :key="group" :name="group">
                    <template #header>
                      <div class="flex-y-center gap-8px">
                        <span>{{ group }}</span>
                        <NTag size="small" round>{{ items.length }}</NTag>
                      </div>
                    </template>
                    <template #header-extra>
                      <NCheckbox
                        :checked="groupSelected(buttonIds, items)"
                        @update:checked="checked => (buttonIds = toggleGroup(buttonIds, items, checked))"
                        @click.stop
                      >
                        全选
                      </NCheckbox>
                    </template>
                    <div class="permission-grid">
                      <NCheckbox v-for="item in items" :key="item.id" :value="item.id" class="permission-item">
                        <span class="block font-500">{{ item.buttonName }}</span>
                        <NTag size="small" class="mt-4px" type="info" :bordered="false">{{ item.buttonCode }}</NTag>
                      </NCheckbox>
                    </div>
                  </NCollapseItem>
                </NCollapse>
              </NCheckboxGroup>
            </NTabPane>
          </NTabs>
        </div>
      </NSpin>
      <template #footer>
        <div class="flex-y-center justify-between">
          <span class="text-12px text-gray-5">共选择 {{ selectedCount }} 项权限</span>
          <NSpace>
            <NButton @click="visible = false">取消</NButton>
            <NButton type="primary" :loading="saving" @click="submit">保存授权</NButton>
          </NSpace>
        </div>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.auth-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  color: var(--n-text-color);
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 13%, transparent), transparent 70%);
  border: 1px solid color-mix(in srgb, var(--primary-color) 24%, transparent);
  border-radius: 10px;
}

.permission-panel {
  min-height: 420px;
  padding: 12px;
  overflow: auto;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.permission-item {
  display: block;
  min-height: 68px;
  padding: 10px 12px;
  margin: 0;
  background-color: var(--n-color-modal);
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
}

/* 菜单分组：固定 4 列网格，单元格等宽对齐；超长标题省略号截断（悬浮看全名） */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.menu-cell {
  min-width: 0;
  padding: 4px 10px;
  margin: 0;
  background-color: var(--n-color-modal);
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
}

.menu-cell :deep(.n-checkbox__label) {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}

.menu-chip-prefix {
  color: var(--n-text-color-disabled);
}

@media (max-width: 768px) {
  .permission-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .menu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
