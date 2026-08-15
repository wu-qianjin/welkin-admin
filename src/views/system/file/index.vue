<script setup lang="tsx">
import { computed, ref } from 'vue';
import type { UploadCustomRequestOptions } from 'naive-ui';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { fileTypeRecord } from '@/constants/business';
import { batchDeleteFile, deleteFile, fetchGetFileList, uploadFile } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import FileSearch from './modules/file-search.vue';

defineOptions({
  name: 'FileManage'
});

const appStore = useAppStore();
const storageVisible = ref(false);
const storageForm = ref({ provider: 'MinIO 对象存储', maxSize: 50, retentionDays: 90, publicAccess: false });

function saveStorageSettings() {
  storageVisible.value = false;
  window.$message?.success('存储设置已保存（Mock）');
}

const searchParams = ref<Api.SystemManage.SystemFileSearchParams>({
  current: 1,
  size: 10,
  fileName: null,
  fileType: null
});

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetFileList(searchParams.value),
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
      key: 'fileName',
      title: $t('page.manage.file.fileName'),
      minWidth: 200,
      ellipsis: { tooltip: true }
    },
    {
      key: 'fileType',
      title: $t('page.manage.file.fileType'),
      align: 'center',
      width: 100,
      render: row => {
        const tagMap: Record<Api.SystemManage.FileType, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'info',
          3: 'warning',
          4: 'default'
        };

        const label = $t(fileTypeRecord[row.fileType]);

        return <NTag type={tagMap[row.fileType]}>{label}</NTag>;
      }
    },
    {
      key: 'fileSize',
      title: $t('page.manage.file.fileSize'),
      align: 'center',
      width: 110,
      render: row => formatFileSize(row.fileSize)
    },
    {
      key: 'bizType',
      title: $t('page.manage.file.bizType'),
      align: 'center',
      minWidth: 110
    },
    {
      key: 'createBy',
      title: $t('page.manage.file.createBy'),
      align: 'center',
      width: 100
    },
    {
      key: 'createTime',
      title: $t('page.manage.file.createTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 200,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" disabled={row.fileType !== '1'} onClick={() => preview(row)}>
            {$t('page.manage.file.preview')}
          </NButton>
          <NButton type="info" ghost size="small" onClick={() => download(row)}>
            {$t('page.manage.file.download')}
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

const storageStats = computed(() => ({
  count: data.value.length,
  images: data.value.filter(item => item.fileType === '1').length,
  documents: data.value.filter(item => item.fileType === '2').length,
  totalSize: formatFileSize(data.value.reduce((sum, item) => sum + item.fileSize, 0))
}));

const { checkedRowKeys, onBatchDeleted, onDeleted } = useTableOperate(data, 'id', getData);

async function handleBatchDelete() {
  try {
    await batchDeleteFile(checkedRowKeys.value.map(Number));
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: number) {
  try {
    await deleteFile(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function getFileTypeByExtension(fileName: string): Api.SystemManage.FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return '1';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt', 'md', 'csv'].includes(ext)) return '2';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return '3';
  return '4';
}

/**
 * the mock environment only records the file metadata;
 * a real project replaces this with a multipart upload to the storage service
 */
async function handleUpload({ file, onFinish, onError }: UploadCustomRequestOptions) {
  const raw = file.file;

  if (!raw) {
    onError();
    return;
  }

  try {
    await uploadFile({
      fileName: raw.name,
      fileType: getFileTypeByExtension(raw.name),
      fileSize: raw.size,
      bizType: $t('page.manage.file.uploadSource')
    });
    window.$message?.success($t('page.manage.file.uploadSuccess'));
    await getDataByPage();
    onFinish();
  } catch {
    onError();
  }
}

const previewVisible = ref(false);
const previewFile = ref<Api.SystemManage.SystemFile | null>(null);
const previewSrc = ref('');

/** render an inline svg placeholder so the preview works fully offline */
function buildPreviewSrc(file: Api.SystemManage.SystemFile) {
  const text = file.fileName.replace(/[<>&]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320"><rect width="100%" height="100%" fill="#f0f2f5"/><text x="50%" y="46%" text-anchor="middle" fill="#646cff" font-size="20" font-family="sans-serif">${text}</text><text x="50%" y="56%" text-anchor="middle" fill="#999" font-size="14" font-family="sans-serif">${formatFileSize(file.fileSize)}</text></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function preview(row: Api.SystemManage.SystemFile) {
  previewFile.value = row;
  previewSrc.value = buildPreviewSrc(row);
  previewVisible.value = true;
}

function download(row: Api.SystemManage.SystemFile) {
  const blob = new Blob([`Mock file: ${row.fileName} (${formatFileSize(row.fileSize)})`], {
    type: 'application/octet-stream'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = row.fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <FileSearch v-model:model="searchParams" @search="getDataByPage" />
    <NCard :title="$t('page.manage.file.title')" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <div class="flex-y-center gap-12px">
          <NUpload :show-file-list="false" :custom-request="handleUpload">
            <NButton type="primary" ghost :loading="loading">
              <template #icon>
                <icon-mdi-tray-arrow-up class="text-icon" />
              </template>
              {{ $t('page.manage.file.upload') }}
            </NButton>
          </NUpload>
          <NButton size="small" secondary @click="storageVisible = true">
            <template #icon><icon-mdi-cog-outline /></template>
            存储设置
          </NButton>
          <TableHeaderOperation
            v-model:columns="columnChecks"
            :disabled-delete="checkedRowKeys.length === 0"
            :loading="loading"
            @delete="handleBatchDelete"
            @refresh="getData"
          />
        </div>
      </template>
      <NGrid cols="2 s:4" responsive="screen" :x-gap="12" :y-gap="12" class="mb-16px">
        <NGi>
          <div class="rounded-6px bg-primary:8 px-12px py-10px">
            <div class="text-12px text-gray-5">文件总数</div>
            <div class="mt-4px text-20px font-600 text-primary">{{ storageStats.count }}</div>
          </div>
        </NGi>
        <NGi>
          <div class="rounded-6px bg-success:8 px-12px py-10px">
            <div class="text-12px text-gray-5">图片文件</div>
            <div class="mt-4px text-20px font-600 text-success">{{ storageStats.images }}</div>
          </div>
        </NGi>
        <NGi>
          <div class="rounded-6px bg-info:8 px-12px py-10px">
            <div class="text-12px text-gray-5">文档文件</div>
            <div class="mt-4px text-20px font-600 text-info">{{ storageStats.documents }}</div>
          </div>
        </NGi>
        <NGi>
          <div class="rounded-6px bg-warning:8 px-12px py-10px">
            <div class="text-12px text-gray-5">当前列表大小</div>
            <div class="mt-4px text-20px font-600 text-warning">{{ storageStats.totalSize }}</div>
          </div>
        </NGi>
      </NGrid>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="1100"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
      <NModal v-model:show="previewVisible" preset="card" class="w-560px" :title="previewFile?.fileName">
        <div class="flex-center">
          <NImage :src="previewSrc" class="rounded-4px" />
        </div>
        <template #footer>
          <div class="text-12px text-#999">{{ $t('page.manage.file.previewPlaceholder') }}</div>
        </template>
      </NModal>
      <NModal v-model:show="storageVisible" preset="card" title="文件存储设置（Mock）" class="w-520px">
        <NAlert type="info" class="mb-16px">后端接入时可将存储适配到本地、MinIO、S3 或云对象存储。</NAlert>
        <NForm :model="storageForm" label-placement="left" label-width="100">
          <NFormItem label="存储提供方">
            <NSelect
              v-model:value="storageForm.provider"
              :options="[
                { label: 'MinIO 对象存储', value: 'MinIO 对象存储' },
                { label: '本地磁盘', value: '本地磁盘' },
                { label: 'S3 兼容存储', value: 'S3 兼容存储' }
              ]"
            />
          </NFormItem>
          <NFormItem label="单文件上限">
            <NInputNumber v-model:value="storageForm.maxSize" :min="1" :max="2048" class="w-full">
              <template #suffix>MB</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="自动清理">
            <NInputNumber v-model:value="storageForm.retentionDays" :min="0" class="w-full">
              <template #suffix>天未访问</template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="公开访问"><NSwitch v-model:value="storageForm.publicAccess" /></NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="storageVisible = false">取消</NButton>
            <NButton type="primary" @click="saveStorageSettings">保存设置</NButton>
          </NSpace>
        </template>
      </NModal>
    </NCard>
  </div>
</template>

<style scoped></style>
