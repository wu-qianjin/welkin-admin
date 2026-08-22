<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';

defineOptions({
  name: 'AuthAvatar'
});

const props = withDefaults(
  defineProps<{
    /** 鉴权预览路径（/v1/system/file/preview/...），为空或加载失败时显示文字兜底 */
    path?: string;
    /** 无头像时的兜底文字（通常取昵称/用户名首字符） */
    text?: string;
    color?: string;
    size?: number;
    round?: boolean;
  }>(),
  {
    path: '',
    text: '',
    color: undefined,
    size: 64,
    round: true
  }
);

const src = ref('');

/** 头像存的是鉴权预览路径，<img> 无法携带 Authorization 头，需 fetch 成 blob 再生成 objectURL；必须拼 serviceBaseURL，直连 /v1 会被 Vite SPA fallback 吞掉 */
async function load(path: string) {
  if (src.value) {
    URL.revokeObjectURL(src.value);
    src.value = '';
  }
  if (!path) return;
  try {
    const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
    const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);
    const token = localStg.get('token');
    const res = await fetch(`${baseURL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!res.ok) return;
    src.value = URL.createObjectURL(await res.blob());
  } catch {
    // 加载失败保持文字兜底
  }
}

watch(
  () => props.path,
  path => load(path),
  { immediate: true }
);

onBeforeUnmount(() => {
  if (src.value) URL.revokeObjectURL(src.value);
});
</script>

<template>
  <!-- naive-ui Avatar：默认插槽有内容时永远渲染文字分支，src 仅在插槽为空时生效，因此有头像时不渲染兜底文字 -->
  <NAvatar :size="size" :round="round" :color="color" :src="src || undefined">
    <template v-if="!src">{{ text }}</template>
  </NAvatar>
</template>

<style scoped></style>
