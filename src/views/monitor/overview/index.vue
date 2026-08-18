<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag } from 'naive-ui';
import dayjs from 'dayjs';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import {
  fetchGetGatewayOverview,
  fetchGetGatewayTrend,
  fetchGetGatewayServiceList,
  fetchGetServerList,
  fetchGetServerMetrics,
  fetchMonitorAlertList
} from '@/service/api';
import { formatDateTime } from '@/utils/common';
import { useRouter } from 'vue-router';

defineOptions({ name: 'MonitorOverview' });

const router = useRouter();
const refreshing = ref(false);
const lastUpdated = ref('刚刚');
const gatewayOverview = ref<Api.Gateway.Overview | null>(null);
const trendPoints = ref<Api.Gateway.TrendPoint[]>([]);
const services = ref<Api.Gateway.Service[]>([]);
const servers = ref<Api.Monitor.Server[]>([]);
const alerts = ref<import('@/service/api/monitor').MonitorAlertItem[]>([]);

const pendingAlertCount = computed(() => alerts.value.filter(item => item.status === 1 || item.status === 2).length);
const severeAlertCount = computed(() => alerts.value.filter(item => item.level >= 3 && item.status !== 3).length);

const healthCards = computed(() => {
  const overview = gatewayOverview.value;
  const online = overview?.onlineServices ?? 0;
  const total = overview?.totalServices ?? 0;
  return [
    {
      label: '服务实例',
      value: `${online} / ${total}`,
      detail: total && online < total ? `${total - online} 个实例异常` : '全部实例正常',
      icon: 'mdi:server',
      color: '#2563eb',
      status: total && online < total ? 'warning' : 'success'
    },
    {
      label: '网关错误率',
      value: `${(overview?.errorRate ?? 0).toFixed(2)}%`,
      detail: '当前时间范围错误率',
      icon: 'mdi:transit-connection-variant',
      color: '#16a34a',
      status: 'success'
    },
    {
      label: '平均响应',
      value: `${(overview?.avgCostMs ?? 0).toFixed(1)} ms`,
      detail: `P95 ${(overview?.p95CostMs ?? 0).toFixed(1)} ms`,
      icon: 'mdi:timer-outline',
      color: '#7c3aed',
      status: 'success'
    },
    {
      label: '数据库连接',
      value: '数据源未配置',
      detail: '数据库池指标待接入 Prometheus',
      icon: 'mdi:database-outline',
      color: '#d97706',
      status: 'warning'
    },
    {
      label: '今日请求',
      value: formatCompact(overview?.todayCalls ?? 0),
      detail: `当前 QPS ${(overview?.qps ?? 0).toFixed(1)}`,
      icon: 'mdi:chart-line',
      color: '#0891b2',
      status: 'success'
    },
    {
      label: '待处理告警',
      value: String(pendingAlertCount.value),
      detail: `${severeAlertCount.value} 严重 / ${Math.max(0, pendingAlertCount.value - severeAlertCount.value)} 其他`,
      icon: 'mdi:bell-alert-outline',
      color: '#dc2626',
      status: 'error'
    }
  ];
});

/** 逐实例 metrics 快照：server/list 缺少 cpuPercent 时（metrics 未接入）回落到 metrics 接口补齐 */
const serverMetrics = ref<Partial<Record<number, Api.Monitor.ServerMetrics>>>({});

/** 以网关发现的服务为准（与"基础依赖健康"同源），合并 monitor 上报的实例指标 */
const serviceHealth = computed(() =>
  services.value.map(service => {
    const server = servers.value.find(
      item => item.serviceName === service.serviceName || item.serviceCode === service.serviceName
    );
    const metrics = server ? serverMetrics.value[server.id] : undefined;
    const metricsAvailable =
      server !== undefined && server.metricsAvailable !== false && metrics?.metricsAvailable !== false;
    return {
      name: service.serviceName,
      code: server?.serviceCode || service.serviceName,
      host: server
        ? `${server.host}:${server.port}`
        : `健康实例 ${service.healthyInstanceCount}/${service.instanceCount}`,
      status: service.status === 1 ? '运行中' : '离线',
      metricsAvailable,
      metricsMessage: server?.metricsMessage || metrics?.metricsMessage || '',
      cpu:
        server?.metricsAvailable === false || metrics?.metricsAvailable === false
          ? null
          : (server?.cpuPercent ?? metrics?.cpuPercent ?? null),
      memory:
        server?.metricsAvailable === false || metrics?.metricsAvailable === false
          ? null
          : (server?.memPercent ?? metrics?.memPercent ?? null),
      routes: service.routeCount,
      version: server?.version || server?.goVersion || ''
    };
  })
);

const dependencies = computed(() =>
  services.value.map(service => ({
    name: service.serviceName,
    type: 'upstream',
    address: service.serviceName,
    status: service.status === 1 ? '正常' : '异常',
    latency: service.discoveryStatus === 'fresh' ? '已发现' : '待探测'
  }))
);

const alertRows = computed(() =>
  alerts.value.map(item => ({
    ...item,
    levelLabel: item.level >= 3 ? '严重' : item.level === 2 ? '警告' : '提示',
    statusLabel: item.status === 3 ? '已恢复' : item.status === 2 ? '已确认' : '待处理'
  }))
);

function formatCompact(value: number) {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : String(value);
}

const trendOption = (): ECOption => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0, right: 0 },
  grid: { left: 8, right: 16, top: 34, bottom: 8, containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendPoints.value.map(item => dayjs(item.time).format('YYYY-MM-DD HH:mm:ss'))
  },
  yAxis: { type: 'value', splitNumber: 4 },
  series: [
    {
      name: 'QPS',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: { opacity: 0.12 },
      data: trendPoints.value.map(item => item.qps)
    },
    {
      name: '错误率 %',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: trendPoints.value.map(item => item.errorRate)
    }
  ]
});

const { domRef: trendRef, updateOptions: updateTrend } = useEcharts(trendOption);

function levelColor(value: number) {
  if (value >= 80) return '#dc2626';
  if (value >= 60) return '#d97706';
  return '#16a34a';
}

function goAlerts() {
  router.push('/monitor/alert');
}

/** 各请求独立降级：单个数据源失败不拖垮整页 */
async function loadData() {
  const [overview, trend, serviceList, serverList, alertPage] = await Promise.all([
    fetchGetGatewayOverview().catch(() => null),
    fetchGetGatewayTrend({ startTime: Date.now() - 60 * 60 * 1000, endTime: Date.now() }).catch(() => null),
    fetchGetGatewayServiceList().catch(() => null),
    fetchGetServerList().catch(() => null),
    fetchMonitorAlertList({ current: 1, size: 20 }).catch(() => null)
  ]);
  gatewayOverview.value = overview;
  trendPoints.value = trend ?? [];
  services.value = serviceList ?? [];
  servers.value = serverList ?? [];
  alerts.value = alertPage?.records ?? [];
  lastUpdated.value = formatDateTime(overview?.updatedAt ?? Date.now());
  updateTrend(trendOption);
  await loadServerMetrics();
}

/** server/list 无指标快照时，逐实例拉取 metrics 补齐 CPU/内存 */
async function loadServerMetrics() {
  const missing = servers.value.filter(server => server.cpuPercent == null || server.memPercent == null);
  if (!missing.length) return;

  const results = await Promise.all(
    missing.map(server => fetchGetServerMetrics({ serverId: server.id }).catch(() => null))
  );

  const next: Partial<Record<number, Api.Monitor.ServerMetrics>> = { ...serverMetrics.value };
  missing.forEach((server, index) => {
    const metrics = results[index];
    if (metrics) {
      next[server.id] = metrics;
    }
  });
  serverMetrics.value = next;
}

async function refresh() {
  refreshing.value = true;
  try {
    await loadData();
  } catch {
    window.$message?.error('监控数据加载失败');
  } finally {
    refreshing.value = false;
    window.$message?.success('监控数据已刷新');
  }
}

onMounted(async () => {
  updateTrend(trendOption);
  try {
    await loadData();
  } catch {
    window.$message?.warning('监控数据源未配置');
  }
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <NCard :bordered="false" class="card-wrapper overflow-hidden">
      <div class="flex items-center justify-between lt-sm:flex-col lt-sm:items-start lt-sm:gap-12px">
        <div>
          <div class="flex-y-center gap-10px">
            <h2 class="m-0 text-20px font-600">监控总览</h2>
            <NTag type="success" round size="small">系统基本健康</NTag>
          </div>
          <div class="mt-6px text-13px text-gray-5">
            聚合服务、网关和基础设施的实时运行状态，最后更新：{{ lastUpdated }}
          </div>
        </div>
        <NSpace>
          <NButton type="warning" ghost @click="goAlerts">
            <template #icon><icon-mdi-bell-alert-outline /></template>
            告警中心
            <NBadge :value="pendingAlertCount" class="ml-6px" />
          </NButton>
          <NButton type="primary" :loading="refreshing" @click="refresh">
            <template #icon><icon-mdi-refresh /></template>
            刷新数据
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <NGrid cols="1 s:2 m:3 l:6" responsive="screen" :x-gap="12" :y-gap="12">
      <NGi v-for="item in healthCards" :key="item.label">
        <NCard :bordered="false" class="card-wrapper h-full">
          <div class="flex items-center justify-between">
            <span class="text-13px text-gray-5">{{ item.label }}</span>
            <div
              class="size-30px flex-center rounded-6px"
              :style="{ backgroundColor: `${item.color}18`, color: item.color }"
            >
              <SvgIcon :icon="item.icon" />
            </div>
          </div>
          <div class="mt-8px text-24px font-600" :style="{ color: item.color }">{{ item.value }}</div>
          <div class="mt-6px text-12px" :class="item.status === 'error' ? 'text-error' : 'text-gray-5'">
            {{ item.detail }}
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <NGrid cols="1 l:24" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi span="24 l:15">
        <NCard title="流量与错误率趋势" :bordered="false" class="card-wrapper h-full">
          <template #header-extra>
            <div class="flex-y-center gap-8px text-12px text-gray-5">
              <span class="size-8px rounded-full bg-primary" />
              请求量
              <span class="ml-8px size-8px rounded-full bg-error" />
              错误率
            </div>
          </template>
          <div ref="trendRef" class="h-300px lt-sm:h-240px" />
        </NCard>
      </NGi>
      <NGi span="24 l:9">
        <NCard title="基础依赖健康" :bordered="false" class="card-wrapper h-full">
          <NList hoverable>
            <NListItem v-for="dependency in dependencies" :key="dependency.name">
              <div class="flex-y-center gap-10px">
                <span
                  class="size-8px rounded-full"
                  :class="dependency.status === '正常' ? 'bg-success' : 'bg-warning'"
                />
                <div class="min-w-0 flex-1">
                  <div class="font-500">
                    {{ dependency.name }}
                    <span class="ml-6px text-12px text-gray-4">{{ dependency.type }}</span>
                  </div>
                  <div class="mt-4px truncate text-12px text-gray-5">{{ dependency.address }}</div>
                </div>
                <div class="text-right">
                  <div class="text-13px font-500">{{ dependency.latency }}</div>
                  <div class="mt-4px text-12px" :class="dependency.status === '正常' ? 'text-success' : 'text-warning'">
                    {{ dependency.status }}
                  </div>
                </div>
              </div>
            </NListItem>
          </NList>
        </NCard>
      </NGi>
    </NGrid>

    <NCard title="服务实例状态" :bordered="false" class="card-wrapper">
      <template #header-extra>
        <NButton text type="primary" @click="router.push('/monitor/runtime/server')">查看实例监控</NButton>
      </template>
      <NGrid cols="1 s:2 m:4" responsive="screen" :x-gap="12" :y-gap="12">
        <NGi v-for="service in serviceHealth" :key="service.code">
          <div class="rounded-8px border-1px border-gray-2 p-12px transition-all hover:border-primary:50">
            <div class="flex-y-center justify-between">
              <div class="flex-y-center gap-8px">
                <span
                  class="size-8px rounded-full"
                  :class="
                    service.status === '离线' ? 'bg-error' : service.status === '资源偏高' ? 'bg-warning' : 'bg-success'
                  "
                />
                <span class="font-500">{{ service.name }}</span>
              </div>
              <NTag
                size="small"
                :type="service.status === '离线' ? 'error' : service.status === '资源偏高' ? 'warning' : 'success'"
              >
                {{ service.status }}
              </NTag>
            </div>
            <div class="mt-6px text-12px text-gray-5">{{ service.code }} · {{ service.host }}</div>
            <div class="mt-12px flex flex-col gap-7px text-12px">
              <div class="flex-y-center gap-8px">
                <span class="w-40px text-gray-5">CPU</span>
                <NProgress
                  class="flex-1"
                  type="line"
                  :percentage="service.cpu ?? 0"
                  :show-indicator="false"
                  :color="levelColor(service.cpu ?? 0)"
                  :height="5"
                />
                <span class="w-56px text-right" :title="service.metricsMessage">
                  {{ service.metricsAvailable ? `${service.cpu ?? 0}%` : '未采集' }}
                </span>
              </div>
              <div class="flex-y-center gap-8px">
                <span class="w-40px text-gray-5">内存</span>
                <NProgress
                  class="flex-1"
                  type="line"
                  :percentage="service.memory ?? 0"
                  :show-indicator="false"
                  :color="levelColor(service.memory ?? 0)"
                  :height="5"
                />
                <span class="w-56px text-right" :title="service.metricsMessage">
                  {{ service.metricsAvailable ? `${service.memory ?? 0}%` : '未采集' }}
                </span>
              </div>
            </div>
            <div class="mt-10px flex-y-center justify-between text-12px text-gray-4">
              <span>{{ service.version || '-' }}</span>
              <span>{{ service.routes }} 路由</span>
            </div>
          </div>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="最近告警" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton text type="primary" @click="goAlerts">处理告警</NButton></template>
      <NDataTable
        :data="alertRows.slice(0, 3)"
        :pagination="false"
        size="small"
        :columns="[
          {
            key: 'level',
            title: '级别',
            width: 90,
            render: row =>
              h(
                NTag,
                {
                  type: row.levelLabel === '严重' ? 'error' : row.levelLabel === '警告' ? 'warning' : 'info',
                  size: 'small'
                },
                { default: () => row.levelLabel }
              )
          },
          { key: 'title', title: '告警内容', minWidth: 220 },
          { key: 'target', title: '目标', minWidth: 170 },
          { key: 'statusLabel', title: '状态', width: 100 },
          {
            key: 'occurredAt',
            title: '发生时间',
            width: 170,
            render: row => formatDateTime(row.occurredAt)
          }
        ]"
      />
    </NCard>
  </div>
</template>

<style scoped>
.text-success {
  color: #16a34a;
}
.text-warning {
  color: #d97706;
}
.text-error {
  color: #dc2626;
}
.bg-success {
  background: #16a34a;
}
.bg-warning {
  background: #d97706;
}
.bg-error {
  background: #dc2626;
}
</style>
