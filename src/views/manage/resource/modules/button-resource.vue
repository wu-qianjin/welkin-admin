<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { enableStatusRecord } from '@/constants/business';
import { batchDeleteButton, deleteButton, fetchGetButtonList } from '@/service/api';
import { defaultTransform, useNaivePaginatedTable, useTableOperate } from '@/hooks/common/table';
import { $t } from '@/locales';
import ButtonOperateDrawer from './button-operate-drawer.vue';

defineOptions({
  name: 'ButtonResource'
});

const searchParams = ref<Api.SystemManage.ButtonResourceSearchParams>({
  current: 1,
  size: 10,
  buttonCode: null,
  buttonName: null,
  menuName: null,
  status: null
});

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetButtonList(searchParams.value),
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
      key: 'buttonCode',
      title: $t('page.manage.resource.button.buttonCode'),
      minWidth: 170,
      ellipsis: { tooltip: true }
    },
    {
      key: 'buttonName',
      title: $t('page.manage.resource.button.buttonName'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'menuName',
      title: $t('page.manage.resource.button.menuName'),
      align: 'center',
      minWidth: 120
    },
    {
      key: 'status',
      title: $t('page.manage.resource.status'),
      align: 'center',
      width: 80,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'remark',
      title: $t('page.manage.resource.remark'),
      minWidth: 160,
      ellipsis: { tooltip: true }
    },
    {
      key: 'createTime',
      title: $t('page.manage.resource.button.createTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
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

const { drawerVisible, operateType, editingData, handleAdd, handleEdit, checkedRowKeys, onBatchDeleted, onDeleted } =
  useTableOperate(data, 'id', getData);

function edit(id: number) {
  handleEdit(id);
}

async function handleBatchDelete() {
  try {
    await batchDeleteButton(checkedRowKeys.value.map(Number));
    onBatchDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleDelete(id: number) {
  try {
    await deleteButton(id);
    onDeleted();
  } catch {
    // request errors are surfaced by the request layer
  }
}
</script>

<template>
  <div class="flex-col-stretch gap-12px">
    <NCard :bordered="false" size="small">
      <div class="flex-y-center gap-12px lt-sm:flex-col lt-sm:items-stretch">
        <NInput
          v-model:value="searchParams.buttonCode"
          :placeholder="$t('page.manage.resource.button.form.buttonCode')"
          clearable
          class="w-180px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NInput
          v-model:value="searchParams.buttonName"
          :placeholder="$t('page.manage.resource.button.form.buttonName')"
          clearable
          class="w-150px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NInput
          v-model:value="searchParams.menuName"
          :placeholder="$t('page.manage.resource.button.form.menuName')"
          clearable
          class="w-140px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NButton type="primary" ghost @click="() => getDataByPage()">
          <template #icon>
            <icon-ic-round-search class="text-icon" />
          </template>
          {{ $t('common.search') }}
        </NButton>
        <NButton
          quaternary
          @click="
            () => {
              searchParams.buttonCode = null;
              searchParams.buttonName = null;
              searchParams.menuName = null;
              getDataByPage();
            }
          "
        >
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.reset') }}
        </NButton>
        <div class="ml-auto flex-y-center gap-12px">
          <NButton type="primary" @click="handleAdd">
            <template #icon>
              <icon-ic-round-plus class="text-icon" />
            </template>
            {{ $t('common.add') }}
          </NButton>
          <NPopconfirm @positive-click="handleBatchDelete">
            <template #trigger>
              <NButton type="error" ghost :disabled="checkedRowKeys.length === 0">
                {{ $t('common.batchDelete') }}
              </NButton>
            </template>
            {{ $t('common.confirmDelete') }}
          </NPopconfirm>
          <NButton quaternary @click="getData">
            <template #icon>
              <icon-ic-round-refresh class="text-icon" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
        </div>
      </div>
    </NCard>

    <NDataTable
      v-model:checked-row-keys="checkedRowKeys"
      :columns="columns"
      :data="data"
      size="small"
      :loading="loading"
      remote
      :scroll-x="1200"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />

    <ButtonOperateDrawer
      v-model:visible="drawerVisible"
      :operate-type="operateType"
      :row-data="editingData"
      @submitted="getDataByPage"
    />
  </div>
</template>

<style scoped></style>
