<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import WangEditor from 'wangeditor';

defineOptions({
  name: 'RichTextEditor'
});

const html = defineModel<string>('html', {
  default: ''
});

const domRef = ref<HTMLElement>();

let editor: WangEditor | null = null;

/** skip the echo write-back when the change originates from the editor itself */
let fromEditor = false;

onMounted(() => {
  editor = new WangEditor(domRef.value);

  editor.config.zIndex = 10;
  // wangeditor exposes the change callback only through its config, not addEventListener
  editor.config.onchange = () => {
    if (!editor) return;

    fromEditor = true;
    html.value = editor.txt.html() || '';
  };

  editor.create();

  if (html.value) {
    editor.txt.html(html.value);
  }
});

watch(html, value => {
  if (fromEditor) {
    fromEditor = false;
    return;
  }

  editor?.txt.html(value || '');
});

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="domRef" class="rich-text-editor bg-white dark:bg-dark"></div>
</template>

<style scoped>
:deep(.w-e-toolbar) {
  background: inherit !important;
  border-color: #999 !important;
}

:deep(.w-e-text-container) {
  background: inherit;
  border-color: #999 !important;
  min-height: 240px;
  max-height: 360px;
  overflow-y: auto;
}
</style>
