<script setup lang="tsx">
import { computed, h, onMounted, ref } from 'vue';
import { NButton, NTag, NSwitch } from 'naive-ui';
import {
  acknowledgeMonitorAlert,
  recoverMonitorAlert,
  createMonitorAlertRule,
  fetchMonitorAlertList,
  fetchMonitorAlertRuleList,
  setMonitorAlertRuleStatus,
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
const keyword = ref('');
const level = ref<string | null>(null);
const status = ref<string | null>(null);
const detailVisible = ref(false);
const detail = ref<AlertRow | null>(null);
const ruleVisible = ref(false);
type AlertRuleRow = Omit<MonitorAlertRuleItem, 'level'> & { level: '严重' | '警告' | '提示' };
const rules = ref<AlertRuleRow[]>([]);

const filteredAlerts = computed(() =>
  alerts.value.filter(item => {
    const matchesKeyword = !keyword.value || `${item.title}${item.target}`.includes(keyword.value);
    return (
      matchesKeyword && (!level.value || item.level === level.value) && (!status.value || item.status === status.value)
    );
  })
);

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
    width: 190,
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
          : null
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
  row.status = row.status === '待处理' ? '处理中' : '已恢复';
  window.$message?.success(row.status === '处理中' ? '告警已确认，进入处理中' : '告警已标记为恢复');
}

async function toggleRule(rule: (typeof rules.value)[number]) {
  const next = !rule.enabled;
  await setMonitorAlertRuleStatus(rule.id, next);
  rule.enabled = next;
  window.$message?.success(rule.enabled ? '告警规则已启用' : '告警规则已停用');
}

async function addRule() {
  await createMonitorAlertRule({
    name: '新告警规则',
    target: '未指定服务',
    condition: '请编辑规则条件',
    level: 2,
    channels: '站内信',
    enabled: false
  });
  await loadRules();
  window.$message?.success('告警规则已创建，请继续完善条件');
}

async function loadAlerts() {
  const result = await fetchMonitorAlertList({ current: 1, size: 100 });
  alerts.value = result.records.map(item => ({
    ...item,
    level: item.level === 1 ? '严重' : item.level === 2 ? '警告' : '提示',
    status: item.status === 1 ? '待处理' : item.status === 2 ? '处理中' : '已恢复'
  }));
}

async function loadRules() {
  const result = await fetchMonitorAlertRuleList();
  rules.value = result.records.map(item => ({
    ...item,
    level: item.level >= 3 ? '严重' : item.level === 2 ? '警告' : '提示'
  }));
}

onMounted(async () => {
  await Promise.all([loadAlerts(), loadRules()]);
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
          <NButton @click="loadAlerts">
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
          <NStatistic label="待处理" :value="alerts.filter(item => item.status === '待处理').length">
            <template #prefix><icon-mdi-bell-alert-outline class="text-error" /></template>
          </NStatistic>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="处理中" :value="alerts.filter(item => item.status === '处理中').length">
            <template #prefix><icon-mdi-progress-alert class="text-warning" /></template>
          </NStatistic>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="今日已恢复" :value="alerts.filter(item => item.status === '已恢复').length">
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
              { label: '严重', value: '严重' },
              { label: '警告', value: '警告' },
              { label: '提示', value: '提示' }
            ]"
            class="w-120px"
          />
          <NSelect
            v-model:value="status"
            clearable
            placeholder="处理状态"
            :options="[
              { label: '待处理', value: '待处理' },
              { label: '处理中', value: '处理中' },
              { label: '已恢复', value: '已恢复' }
            ]"
            class="w-120px"
          />
        </NSpace>
      </template>
      <NDataTable
        :columns="alertColumns"
        :data="filteredAlerts"
        :pagination="{ pageSize: 10 }"
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

    <NModal v-model:show="ruleVisible" preset="card" title="告警规则" class="w-820px">
      <NDataTable
        :data="rules"
        :pagination="false"
        size="small"
        :columns="[
          { key: 'name', title: '规则名称', minWidth: 140 },
          { key: 'target', title: '监控对象', minWidth: 140 },
          { key: 'condition', title: '触发条件', minWidth: 200 },
          { key: 'level', title: '级别', width: 80 },
          { key: 'channels', title: '通知渠道', minWidth: 150 },
          {
            key: 'enabled',
            title: '状态',
            width: 80,
            render: row => h(NSwitch, { value: row.enabled, size: 'small', 'onUpdate:value': () => toggleRule(row) })
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
