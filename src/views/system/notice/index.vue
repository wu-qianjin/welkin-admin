<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import DOMPurify from 'dompurify';
import { noticeStatusRecord, noticeTypeRecord } from '@/constants/business';
import { batchDeleteNotice, deleteNotice, fetchGetNoticeList, updateNotice } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import NoticeOperateDrawer from './modules/notice-operate-drawer.vue';
import NoticeSearch from './modules/notice-search.vue';

defineOptions({
  name: 'NoticeManage'
});

const appStore = useAppStore();

const searchParams = ref<Api.SystemManage.SystemNoticeSearchParams>({
  current: 1,
  size: 10,
  title: null,
  noticeType: null,
  noticeStatus: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetNoticeList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
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
      key: 'title',
      title: $t('page.manage.notice.noticeTitle'),
      minWidth: 220,
      ellipsis: { tooltip: true },
      render: row => (
        <div class="flex-center justify-center gap-6px">
          {row.isTop && <NTag type="error" size="small">{$t('page.manage.notice.top')}</NTag>}
          <span>{row.title}</span>
        </div>
      )
    },
    {
      key: 'noticeType',
      title: $t('page.manage.notice.noticeType'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<Api.SystemManage.NoticeType, NaiveUI.ThemeColor> = {
          1: 'info',
          2: 'success'
        };

        const label = $t(noticeTypeRecord[row.noticeType]);

        return <NTag type={tagMap[row.noticeType]}>{label}</NTag>;
      }
    },
    {
      key: 'noticeStatus',
      title: $t('page.manage.notice.noticeStatus'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<Api.SystemManage.NoticeStatus, NaiveUI.ThemeColor> = {
          1: 'default',
          2: 'success',
          3: 'warning'
        };

        const label = $t(noticeStatusRecord[row.noticeStatus]);

        return <NTag type={tagMap[row.noticeStatus]}>{label}</NTag>;
      }
    },
    {
      key: 'createBy',
      title: $t('page.manage.notice.createBy'),
      align: 'center',
      width: 100
    },
    {
      key: 'createTime',
      title: $t('page.manage.notice.createTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'updateTime',
      title: $t('page.manage.notice.updateTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 300,
      render: row => (
        <div class="flex-center justify-end gap-8px">
          <NButton type="info" ghost size="small" onClick={() => viewContent(row)}>
            {$t('page.manage.notice.view')}
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </NButton>
          {row.noticeStatus === '2' ? (
            <NPopconfirm onPositiveClick={() => handleWithdraw(row)}>
              {{
                default: () => $t('page.manage.notice.confirmWithdraw'),
                trigger: () => (
                  <NButton type="warning" ghost size="small">
                    {$t('page.manage.notice.withdraw')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          ) : (
            <NPopconfirm onPositiveClick={() => handlePublish(row)}>
              {{
                default: () => $t('page.manage.notice.confirmPublish'),
                trigger: () => (
                  <NButton type="success" ghost size="small">
                    {$t('page.manage.notice.publish')}
                  </NButton>
                )
              }}
            </NPopconfirm>
          )}
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function edit(id: number) {
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteNotice(checkedRowKeys.value.map(Number));
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: number) {
  try {
    await deleteNotice(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handlePublish(row: Api.SystemManage.SystemNotice) {
  try {
    await updateNotice({ ...row, noticeStatus: '2' });
    window.$message?.success($t('page.manage.notice.publishSuccess'));
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleWithdraw(row: Api.SystemManage.SystemNotice) {
  try {
    await updateNotice({ ...row, noticeStatus: '3' });
    window.$message?.success($t('page.manage.notice.withdrawSuccess'));
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

const contentVisible = ref(false);
const contentHtml = ref('');
const contentTitle = ref('');

function viewContent(row: Api.SystemManage.SystemNotice) {
  contentTitle.value = row.title;
  contentHtml.value = DOMPurify.sanitize(row.content);
  contentVisible.value = true;
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NoticeSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.notice.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
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
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1300"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <NoticeOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <NModal v-model:show="contentVisible" preset="card" class="w-640px" :title="contentTitle">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="notice-content" v-html="contentHtml"></div>
      </NModal>
    </NCard>
  </div>
</template>

<style scoped>
.notice-content :deep(p) {
  margin: 0 0 8px;
  line-height: 1.7;
}

.notice-content :deep(ul),
.notice-content :deep(ol) {
  padding-left: 20px;
  margin: 0 0 8px;
}
</style>
