<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { jsonClone } from '@sa/utils';
import { noticeStatusOptions, noticeTypeOptions } from '@/constants/business';
import { addNotice, updateNotice } from '@/service/api';
import RichTextEditor from '@/components/custom/rich-text-editor.vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'NoticeOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.SystemNotice | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: $t('page.manage.notice.addNotice'),
    edit: $t('page.manage.notice.editNotice')
  };
  return titles[props.operateType];
});

type Model = Pick<Api.SystemManage.SystemNotice, 'title' | 'noticeType' | 'noticeStatus' | 'isTop' | 'content'>;

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    title: '',
    noticeType: '1',
    noticeStatus: '1',
    isTop: false,
    content: ''
  };
}

const rules: Record<string, App.Global.FormRule[]> = {
  title: [defaultRequiredRule],
  noticeType: [defaultRequiredRule],
  noticeStatus: [defaultRequiredRule],
  content: [defaultRequiredRule]
};

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model.value, jsonClone(props.rowData));
  }
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  try {
    if (props.operateType === 'add') {
      await addNotice(model.value);
    } else {
      await updateNotice({ ...(props.rowData as Api.SystemManage.SystemNotice), ...model.value });
    }

    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  } catch {
    // request errors are surfaced by the request layer
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="600">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
        <NFormItem :label="$t('page.manage.notice.noticeTitle')" path="title">
          <NInput v-model:value="model.title" :placeholder="$t('page.manage.notice.form.noticeTitle')" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.notice.noticeType')" path="noticeType">
          <NRadioGroup v-model:value="model.noticeType">
            <NRadio v-for="item in noticeTypeOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.notice.noticeStatus')" path="noticeStatus">
          <NRadioGroup v-model:value="model.noticeStatus">
            <NRadio v-for="item in noticeStatusOptions" :key="item.value" :value="item.value" :label="$t(item.label)" />
          </NRadioGroup>
        </NFormItem>
        <NFormItem :label="$t('page.manage.notice.top')" path="isTop">
          <NSwitch v-model:value="model.isTop" />
        </NFormItem>
        <NFormItem :label="$t('page.manage.notice.content')" path="content" :show-label="true">
          <RichTextEditor v-model:html="model.content" class="w-full" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
