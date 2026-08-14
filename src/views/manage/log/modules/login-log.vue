<script setup lang="tsx">
import { ref } from 'vue';
import { NButton, NPopconfirm, NTag } from 'naive-ui';
import { clearLoginLog, deleteLoginLog, fetchGetLoginLogList } from '@/service/api';
import { defaultTransform, useNaivePaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({
  name: 'LoginLog'
});

const loginStatusOptions = [
  { label: $t('page.manage.log.login.success'), value: '1' },
  { label: $t('page.manage.log.login.fail'), value: '2' }
];

const searchParams = ref<Api.SystemManage.LoginLogSearchParams>({
  current: 1,
  size: 10,
  userName: null,
  ipaddr: null,
  status: null
});

const { columns, data, getData, getDataByPage, loading, mobilePagination } = useNaivePaginatedTable({
  api: () => fetchGetLoginLogList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.page;
    searchParams.value.size = params.pageSize;
  },
  columns: () => [
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.log.login.userName'),
      align: 'center',
      width: 100
    },
    {
      key: 'ipaddr',
      title: $t('page.manage.log.login.ipaddr'),
      align: 'center',
      width: 130
    },
    {
      key: 'loginLocation',
      title: $t('page.manage.log.login.loginLocation'),
      align: 'center',
      minWidth: 130
    },
    {
      key: 'browser',
      title: $t('page.manage.log.login.browser'),
      align: 'center',
      width: 120
    },
    {
      key: 'os',
      title: $t('page.manage.log.login.os'),
      align: 'center',
      width: 120
    },
    {
      key: 'status',
      title: $t('page.manage.log.login.loginStatus'),
      align: 'center',
      width: 90,
      render: row => {
        const tagMap: Record<'1' | '2', NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'error'
        };
        const label = row.status === '1' ? $t('page.manage.log.login.success') : $t('page.manage.log.login.fail');
        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    },
    {
      key: 'msg',
      title: $t('page.manage.log.login.msg'),
      minWidth: 180,
      ellipsis: { tooltip: true }
    },
    {
      key: 'loginTime',
      title: $t('page.manage.log.login.loginTime'),
      align: 'center',
      width: 170
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 90,
      render: row => (
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
      )
    }
  ]
});

async function handleDelete(id: number) {
  try {
    await deleteLoginLog(id);
    getData();
  } catch {
    // request errors are surfaced by the request layer
  }
}

async function handleClear() {
  try {
    await clearLoginLog();
    window.$message?.success($t('page.manage.log.clearSuccess'));
    getData();
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
          v-model:value="searchParams.userName"
          :placeholder="$t('page.manage.log.login.form.userName')"
          clearable
          class="w-160px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NInput
          v-model:value="searchParams.ipaddr"
          :placeholder="$t('page.manage.log.login.form.ipaddr')"
          clearable
          class="w-160px lt-sm:w-full"
          @keydown.enter="() => getDataByPage()"
        />
        <NSelect
          v-model:value="searchParams.status"
          :placeholder="$t('page.manage.log.login.form.status')"
          :options="loginStatusOptions"
          clearable
          class="w-120px lt-sm:w-full"
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
              searchParams.userName = null;
              searchParams.ipaddr = null;
              searchParams.status = null;
              getDataByPage();
            }
          "
        >
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.reset') }}
        </NButton>
        <NButton quaternary @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          {{ $t('common.refresh') }}
        </NButton>
        <div class="ml-auto">
          <NPopconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton type="error" ghost :disabled="data.length === 0">
                {{ $t('page.manage.log.clear') }}
              </NButton>
            </template>
            {{ $t('page.manage.log.confirmClear') }}
          </NPopconfirm>
        </div>
      </div>
    </NCard>

    <NDataTable
      :columns="columns"
      :data="data"
      size="small"
      :loading="loading"
      remote
      :scroll-x="1300"
      :row-key="row => row.id"
      :pagination="mobilePagination"
    />
  </div>
</template>

<style scoped></style>
