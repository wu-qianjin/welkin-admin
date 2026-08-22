import { ref } from 'vue';
import type { TreeOption } from 'naive-ui';
import { fetchGetDeptList } from '@/service/api';

/**
 * 部门树下拉选项（NTreeSelect），用户管理/个人中心共用。
 * 根节点 key 为 "0"，代表“未分配部门”。
 */
export function useDeptTreeOptions() {
  const deptOptions = ref<TreeOption[]>([]);
  const deptLoading = ref(false);

  async function loadDeptOptions(rootLabel: string) {
    deptLoading.value = true;
    try {
      const page = await fetchGetDeptList().catch(() => null);
      const map = (nodes: Api.SystemManage.Dept[] | null | undefined): TreeOption[] =>
        (nodes ?? []).map(node => ({
          key: node.id,
          label: node.deptName,
          children: map(node.children)
        }));
      deptOptions.value = [{ key: '0', label: rootLabel, children: map(page?.records ?? null) }];
    } finally {
      deptLoading.value = false;
    }
  }

  return { deptOptions, deptLoading, loadDeptOptions };
}

/** 在部门树选项中按 key 查找展示名，找不到返回 null（"0" 命中根节点标签） */
export function findDeptLabel(options: TreeOption[] | undefined, key: string): string | null {
  for (const option of options ?? []) {
    if (option.key !== undefined && String(option.key) === key) return String(option.label ?? '');
    const hit = findDeptLabel(option.children as TreeOption[] | undefined, key);
    if (hit !== null) return hit;
  }
  return null;
}
