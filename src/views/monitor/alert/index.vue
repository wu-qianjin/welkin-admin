<script setup lang="tsx">
import { computed, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NButton, NPopconfirm, NTag, NSwitch } from 'naive-ui';
import {
  acknowledgeMonitorAlert,
  recoverMonitorAlert,
  createMonitorAlertRule,
  deleteMonitorAlertRules,
  deleteMonitorAlerts,
  fetchMonitorAlertList,
  fetchMonitorAlertRuleList,
  setMonitorAlertRuleStatus,
  updateMonitorAlertRule,
  type MonitorAlertItem,
  type MonitorAlertRuleItem
} from '@/service/api';
import { formatDateTime } from '@/utils/common';

defineOptions({ name: 'MonitorAlert' });
// Menu metadata is maintained in build/plugins/router.ts alongside the module boundary.

type AlertRow = Omit<MonitorAlertItem, 'level' | 'status'> & {
  level: '严重' | '警告' | '提示';
  status: '待处理' | '处理中' | '已恢复';
};
const alerts = ref<AlertRow[]>([]);
const alertTotal = ref(0);
const alertLoading = ref(false);
const keyword = ref('');
const level = ref<number | null>(null);
const status = ref<number | null>(null);
const pagination = ref({ page: 1, pageSize: 10 });
const stats = ref({ pending: 0, processing: 0, recovered: 0 });
const detailVisible = ref(false);
const detail = ref<AlertRow | null>(null);
const ruleVisible = ref(false);
type AlertRuleRow = Omit<MonitorAlertRuleItem, 'level'> & { level: '严重' | '警告' | '提示' };
const rules = ref<AlertRuleRow[]>([]);

/**
 * 后端等级约定与规则编辑器一致：1=提示、2=警告、3=严重；
 * 状态：1=待处理、2=处理中、3=已恢复。
 */
function adaptAlertItem(item: MonitorAlertItem): AlertRow {
  return {
    ...item,
    level: item.level >= 3 ? '严重' : item.level === 2 ? '警告' : '提示',
    status: item.status === 1 ? '待处理' : item.status === 2 ? '处理中' : '已恢复'
  };
}

async function loadAlerts() {
  alertLoading.value = true;
  try {
    const result = await fetchMonitorAlertList({
      current: pagination.value.page,
      size: pagination.value.pageSize,
      keyword: keyword.value || undefined,
      level: level.value ?? undefined,
      status: status.value ?? undefined
    });
    alerts.value = result.records.map(adaptAlertItem);
    alertTotal.value = result.total;
  } finally {
    alertLoading.value = false;
  }
}

/** 统计卡取各状态的过滤总数，避免只统计当前页 */
async function loadStats() {
  const [pending, processing, recovered] = await Promise.all([
    fetchMonitorAlertList({ current: 1, size: 1, status: 1 }).catch(() => null),
    fetchMonitorAlertList({ current: 1, size: 1, status: 2 }).catch(() => null),
    fetchMonitorAlertList({ current: 1, size: 1, status: 3 }).catch(() => null)
  ]);
  stats.value = {
    pending: pending?.total ?? 0,
    processing: processing?.total ?? 0,
    recovered: recovered?.total ?? 0
  };
}

function resetPageAndReload() {
  pagination.value.page = 1;
  void loadAlerts();
  void loadStats();
}

let keywordTimer: number | undefined;
watch(keyword, () => {
  window.clearTimeout(keywordTimer);
  keywordTimer = window.setTimeout(resetPageAndReload, 300);
});
watch([level, status], resetPageAndReload);
onBeforeUnmount(() => window.clearTimeout(keywordTimer));

const paginationProps = computed(() => ({
  page: pagination.value.page,
  pageSize: pagination.value.pageSize,
  itemCount: alertTotal.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.value.page = page;
    void loadAlerts();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
    void loadAlerts();
  }
}));

const alertColumns = computed<NaiveUI.TableColumn<AlertRow>[]>(() => [
  {
    key: 'level',
    title: '级别',
    width: 90,
    render: row =>
      h(
        NTag,
        { type: row.level === '严重' ? 'error' : row.level === '警告' ? 'warning' : 'info', size: 'small' },
        { default: () => row.level }
      )
  },
  { key: 'title', title: '告警内容', minWidth: 220, ellipsis: { tooltip: true } },
  { key: 'target', title: '目标', minWidth: 180 },
  { key: 'value', title: '当前值', width: 100, align: 'center' },
  { key: 'threshold', title: '触发条件', width: 120, align: 'center' },
  {
    key: 'status',
    title: '状态',
    width: 100,
    render: row =>
      h(
        NTag,
        { type: row.status === '已恢复' ? 'success' : row.status === '处理中' ? 'warning' : 'error', size: 'small' },
        { default: () => row.status }
      )
  },
  { key: 'occurredAt', title: '发生时间', width: 170, render: row => formatDateTime(row.occurredAt) },
  {
    key: 'operate',
    title: '操作',
    width: 250,
    render: row =>
      h('div', { class: 'flex-center gap-6px' }, [
        h(
          NButton,
          { size: 'small', type: 'info', ghost: true, onClick: () => viewDetail(row) },
          { default: () => '详情' }
        ),
        row.status !== '已恢复'
          ? h(
              NButton,
              { size: 'small', type: 'primary', ghost: true, onClick: () => acknowledge(row) },
              { default: () => (row.status === '待处理' ? '确认处理' : '标记恢复') }
            )
          : null,
        h(
          NPopconfirm,
          { onPositiveClick: () => removeAlert(row) },
          {
            trigger: () => h(NButton, { size: 'small', type: 'error', ghost: true }, { default: () => '删除' }),
            default: () => '确认删除该告警？'
          }
        )
      ])
  }
]);

function viewDetail(row: AlertRow) {
  detail.value = row;
  detailVisible.value = true;
}

async function acknowledge(row: AlertRow) {
  if (row.status === '处理中') {
    await recoverMonitorAlert(row.id);
  } else {
    await acknowledgeMonitorAlert(row.id);
  }
  await Promise.all([loadAlerts(), loadStats()]);
  window.$message?.success(row.status === '待处理' ? '告警已确认，进入处理中' : '告警已标记为恢复');
}

async function removeAlert(row: AlertRow) {
  await deleteMonitorAlerts([row.id]);
  if (detail.value?.id === row.id) {
    detailVisible.value = false;
    detail.value = null;
  }
  await Promise.all([loadAlerts(), loadStats()]);
  window.$message?.success('告警已删除');
}

async function toggleRule(rule: (typeof rules.value)[number]) {
  const next = !rule.enabled;
  await setMonitorAlertRuleStatus(rule.id, next);
  rule.enabled = next;
  window.$message?.success(rule.enabled ? '告警规则已启用' : '告警规则已停用');
}

/** 规则编辑弹窗（新建/修改共用） */
const ruleEditVisible = ref(false);
const editingRuleId = ref<string | null>(null);
const ruleModel = ref({
  name: '',
  target: '',
  condition: '',
  level: 2 as 1 | 2 | 3,
  channels: '站内信',
  enabled: true
});
const levelOptions = [
  { label: '提示', value: 1 },
  { label: '警告', value: 2 },
  { label: '严重', value: 3 }
];

async function addRule() {
  editingRuleId.value = null;
  ruleModel.value = { name: '', target: '', condition: '', level: 2, channels: '站内信', enabled: true };
  ruleEditVisible.value = true;
}

function editRule(row: AlertRuleRow) {
  editingRuleId.value = row.id;
  ruleModel.value = {
    name: row.name,
    target: row.target,
    condition: row.condition,
    level: row.level === '严重' ? 3 : row.level === '警告' ? 2 : 1,
    channels: row.channels,
    enabled: row.enabled
  };
  ruleEditVisible.value = true;
}

async function saveRule() {
  const model = ruleModel.value;
  if (!model.name || !model.target || !model.condition) {
    window.$message?.error('规则名称、监控对象、触发条件均为必填');
    return;
  }
  if (editingRuleId.value) {
    await updateMonitorAlertRule(editingRuleId.value, model);
  } else {
    await createMonitorAlertRule(model);
  }
  ruleEditVisible.value = false;
  await loadRules();
  window.$message?.success(editingRuleId.value ? '告警规则已更新' : '告警规则已创建');
}

async function removeRule(row: AlertRuleRow) {
  await deleteMonitorAlertRules([row.id]);
  await loadRules();
  window.$message?.success('告警规则已删除');
}

async function loadRules() {
  const result = await fetchMonitorAlertRuleList();
  rules.value = result.records.map(item => ({
    ...item,
    level: item.level >= 3 ? '严重' : item.level === 2 ? '警告' : '提示'
  }));
}

onMounted(async () => {
  await Promise.all([loadAlerts(), loadStats(), loadRules()]);
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <NCard :bordered="false" class="card-wrapper">
      <div class="flex items-center justify-between lt-sm:flex-col lt-sm:items-start lt-sm:gap-12px">
        <div>
          <h2 class="m-0 text-20px font-600">告警中心</h2>
          <div class="mt-6px text-13px text-gray-5">统一查看、确认和追踪系统异常，记录来自 api-monitor。</div>
        </div>
        <NSpace>
          <NButton
            @click="
              () => {
                void loadAlerts();
                void loadStats();
              }
            "
          >
            <template #icon><icon-mdi-refresh /></template>
            刷新
          </NButton>
          <NButton type="primary" @click="ruleVisible = true">
            <template #icon><icon-mdi-tune-variant /></template>
            告警规则
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <NGrid cols="1 s:3" responsive="screen" :x-gap="12" :y-gap="12">
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="待处理" :value="stats.pending">
            <template #prefix><icon-mdi-bell-alert-outline class="text-error" /></template>
          </NStatistic>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="处理中" :value="stats.processing">
            <template #prefix><icon-mdi-progress-alert class="text-warning" /></template>
          </NStatistic>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="已恢复" :value="stats.recovered">
            <template #prefix><icon-mdi-check-circle-outline class="text-success" /></template>
          </NStatistic>
        </NCard>
      </NGi>
    </NGrid>

    <NCard title="告警记录" :bordered="false" class="card-wrapper flex-1-hidden">
      <template #header-extra>
        <NSpace>
          <NInput v-model:value="keyword" clearable placeholder="搜索告警内容或目标" class="w-210px" />
          <NSelect
            v-model:value="level"
            clearable
            placeholder="告警级别"
            :options="[
              { label: '严重', value: 3 },
              { label: '警告', value: 2 },
              { label: '提示', value: 1 }
            ]"
            class="w-120px"
          />
          <NSelect
            v-model:value="status"
            clearable
            placeholder="处理状态"
            :options="[
              { label: '待处理', value: 1 },
              { label: '处理中', value: 2 },
              { label: '已恢复', value: 3 }
            ]"
            class="w-120px"
          />
        </NSpace>
      </template>
      <NDataTable
        :columns="alertColumns"
        :data="alerts"
        remote
        :pagination="paginationProps"
        :loading="alertLoading"
        :scroll-x="1100"
        size="small"
      />
    </NCard>

    <NCard title="告警处理建议" :bordered="false" class="card-wrapper">
      <NAlert type="info" title="建议建立最小可用告警闭环">
        告警规则负责发现问题，处理状态负责记录响应过程，恢复状态用于确认系统回到正常。接入后端时可将规则和通知渠道迁移到系统管理。
      </NAlert>
    </NCard>

    <NDrawer v-model:show="detailVisible" :width="520">
      <NDrawerContent title="告警详情" closable>
        <NDescriptions v-if="detail" bordered label-placement="left" :column="1" size="small">
          <NDescriptionsItem label="告警内容">{{ detail.title }}</NDescriptionsItem>
          <NDescriptionsItem label="目标">{{ detail.target }}</NDescriptionsItem>
          <NDescriptionsItem label="当前值">{{ detail.value }}</NDescriptionsItem>
          <NDescriptionsItem label="触发条件">{{ detail.threshold }}</NDescriptionsItem>
          <NDescriptionsItem label="发生时间">{{ formatDateTime(detail.occurredAt) }}</NDescriptionsItem>
          <NDescriptionsItem label="说明">{{ detail.description }}</NDescriptionsItem>
        </NDescriptions>
        <template #footer><NButton type="primary" @click="detailVisible = false">关闭</NButton></template>
      </NDrawerContent>
    </NDrawer>

    <NModal v-model:show="ruleVisible" preset="card" title="告警规则" class="w-900px">
      <NDataTable
        :data="rules"
        :pagination="false"
        size="small"
        :columns="[
          { key: 'name', title: '规则名称', minWidth: 130 },
          { key: 'target', title: '监控对象', minWidth: 120 },
          { key: 'condition', title: '触发条件', minWidth: 220, ellipsis: { tooltip: true } },
          { key: 'level', title: '级别', width: 70 },
          { key: 'channels', title: '通知渠道', minWidth: 100 },
          {
            key: 'enabled',
            title: '启用',
            width: 70,
            render: row => h(NSwitch, { value: row.enabled, size: 'small', 'onUpdate:value': () => toggleRule(row) })
          },
          {
            key: 'operate',
            title: '操作',
            width: 130,
            render: row =>
              h('div', { class: 'flex-center gap-6px' }, [
                h(
                  NButton,
                  { size: 'small', type: 'primary', ghost: true, onClick: () => editRule(row) },
                  { default: () => '编辑' }
                ),
                h(
                  NButton,
                  { size: 'small', type: 'error', ghost: true, onClick: () => removeRule(row) },
                  { default: () => '删除' }
                )
              ])
          }
        ]"
      />
      <template #footer>
        <NSpace justify="end">
          <NButton @click="ruleVisible = false">关闭</NButton>
          <NButton type="primary" @click="addRule">新增规则</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal
      v-model:show="ruleEditVisible"
      preset="card"
      :title="editingRuleId ? '编辑告警规则' : '新增告警规则'"
      class="w-560px"
    >
      <NForm :model="ruleModel" label-placement="left" :label-width="80">
        <NFormItem label="规则名称" required>
          <NInput v-model:value="ruleModel.name" placeholder="如：网关 QPS 过高" />
        </NFormItem>
        <NFormItem label="监控对象" required>
          <NInput v-model:value="ruleModel.target" placeholder="如：api-gateway QPS" />
        </NFormItem>
        <NFormItem label="触发条件" required>
          <NInput
            v-model:value="ruleModel.condition"
            type="textarea"
            :rows="2"
            placeholder="格式：PromQL 比较符 阈值，如 sum(rate(gateway_request_total[5m])) > 100"
          />
          <template #feedback>
            评估引擎按「PromQL 表达式 比较符(&gt; &gt;= &lt; &lt;= == !=) 阈值」解析，周期 30s
          </template>
        </NFormItem>
        <NFormItem label="告警级别">
          <NSelect v-model:value="ruleModel.level" :options="levelOptions" />
        </NFormItem>
        <NFormItem label="通知渠道">
          <NInput v-model:value="ruleModel.channels" placeholder="如：站内信" />
        </NFormItem>
        <NFormItem label="启用">
          <NSwitch v-model:value="ruleModel.enabled" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="ruleEditVisible = false">取消</NButton>
          <NButton type="primary" @click="saveRule">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.text-error {
  color: #dc2626;
}
.text-warning {
  color: #d97706;
}
.text-success {
  color: #16a34a;
}
</style>
