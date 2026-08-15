<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { mockPermissionTree, mockRolePermissions } from '@/mock/admin';

defineOptions({ name: 'MenuAuthModal' });

interface Props {
  roleId: number;
}

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible', { default: false });
const title = computed(() => `编辑菜单权限 · 角色 #${props.roleId}`);
const tree = shallowRef(mockPermissionTree);
const checks = shallowRef<string[]>([]);
const home = shallowRef('home');
const pageSelectOptions = [
  { label: '首页', value: 'home' },
  { label: '系统管理', value: 'manage' },
  { label: '监控总览', value: 'monitor_runtime_overview' }
];

function init() {
  const permissions = mockRolePermissions[props.roleId];
  checks.value = [...(permissions?.menus ?? ['home'])];
  home.value = permissions?.menus.includes('monitor_runtime_overview') ? 'monitor_runtime_overview' : 'home';
}

function handleSubmit() {
  const current = mockRolePermissions[props.roleId] ?? { menus: [], buttons: [] };
  mockRolePermissions[props.roleId] = { ...current, menus: [...checks.value] };
  window.$message?.success('菜单权限已保存（Mock）');
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
