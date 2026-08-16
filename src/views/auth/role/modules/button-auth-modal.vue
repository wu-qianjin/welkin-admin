<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetButtonList, fetchRolePermissions, updateRolePermissions } from '@/service/api';

defineOptions({ name: 'ButtonAuthModal' });

interface Props {
  roleId: string;
}

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible', { default: false });
const title = computed(() => `编辑按钮权限 · 角色 #${props.roleId}`);
const checks = ref<string[]>([]);
const permission = ref({ menuIds: [] as string[], apiIds: [] as string[] });
const buttonTree = ref<{ key: string; label: string; code: string }[]>([]);

async function init() {
  const [buttons, permissions] = await Promise.all([
    fetchGetButtonList({ current: 1, size: 100 }),
    fetchRolePermissions(props.roleId)
  ]);
  buttonTree.value = buttons.records.map(item => ({ key: item.id, label: item.buttonName, code: item.buttonCode }));
  checks.value = [...permissions.buttonIds];
  permission.value = { menuIds: permissions.menuIds, apiIds: permissions.apiIds };
}

async function handleSubmit() {
  await updateRolePermissions(props.roleId, { ...permission.value, buttonIds: [...checks.value] });
  window.$message?.success('按钮权限已保存');
  visible.value = false;
}

watch(visible, value => {
  if (value) init();
});
</script>

<template>
  <NModal v-model:show="visible" :title="title" preset="card" class="w-560px">
    <div class="mb-8px flex-y-center justify-between text-12px text-gray-5">
      <span>按页面动作控制新增、编辑、导出和处置操作</span>
      <span>已选 {{ checks.length }} 项</span>
    </div>
    <NCheckboxGroup v-model:value="checks">
      <div class="flex flex-col gap-10px">
        <div
          v-for="item in buttonTree"
          :key="item.key"
          class="flex-y-center justify-between rounded-6px border-1px border-gray-2 px-12px py-10px"
        >
          <NCheckbox :value="item.key" :label="item.label" />
          <NTag size="small" bordered type="info">{{ item.code }}</NTag>
        </div>
      </div>
    </NCheckboxGroup>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="visible = false">取消</NButton>
        <NButton type="primary" @click="handleSubmit">保存授权</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped></style>
