<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetMenuTree, fetchRolePermissions, updateRolePermissions } from '@/service/api';

defineOptions({ name: 'MenuAuthModal' });

interface Props {
  roleId: string;
}

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible', { default: false });
const title = computed(() => `编辑菜单权限 · 角色 #${props.roleId}`);
interface TreeOption {
  key: string;
  label: string;
  children?: TreeOption[];
}
const tree = ref<TreeOption[]>([]);
const checks = ref<string[]>([]);
const home = ref('');
const permission = ref({ apiIds: [] as string[], buttonIds: [] as string[] });
const pageSelectOptions = computed(() => flatten(tree.value).map(item => ({ label: item.label, value: item.key })));

function flatten(nodes: TreeOption[]): TreeOption[] {
  return nodes.flatMap(node => [node, ...(node.children ? flatten(node.children) : [])]);
}

function mapTree(nodes: Api.SystemManage.MenuTree[]): TreeOption[] {
  return nodes.map(node => ({
    key: node.id,
    label: node.label,
    children: node.children ? mapTree(node.children) : undefined
  }));
}

async function init() {
  const [menuTree, permissions] = await Promise.all([fetchGetMenuTree(), fetchRolePermissions(props.roleId)]);
  tree.value = mapTree(menuTree);
  checks.value = [...permissions.menuIds];
  permission.value = { apiIds: permissions.apiIds, buttonIds: permissions.buttonIds };
  home.value = checks.value[0] ?? pageSelectOptions.value[0]?.value ?? '';
}

async function handleSubmit() {
  await updateRolePermissions(props.roleId, { menuIds: [...checks.value], ...permission.value });
  window.$message?.success('菜单权限已保存');
  visible.value = false;
}

watch(visible, value => {
  if (value) init();
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-520px">
    <div class="flex-y-center gap-16px pb-12px">
      <span>默认首页</span>
      <NSelect v-model:value="home" :options="pageSelectOptions" size="small" class="w-180px" />
    </div>
    <div class="mb-8px flex-y-center justify-between text-12px text-gray-5">
      <span>勾选后角色可以访问对应页面</span>
      <span>已选 {{ checks.length }} 项</span>
    </div>
    <NTree
      v-model:checked-keys="checks"
      :data="tree"
      key-field="key"
      checkable
      cascade
      default-expand-all
      block-line
      class="h-320px"
    />
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" @click="handleSubmit">保存授权</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
