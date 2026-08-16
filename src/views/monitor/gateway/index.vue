<script setup lang="tsx">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { NButton, NTag } from 'naive-ui';
import { graphic } from 'echarts';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import {
  fetchGetGatewayOverview,
  fetchGetGatewayServiceList,
  fetchGetGatewayServiceRoutes,
  fetchGetGatewayTopError,
  fetchGetGatewayTopInvoked,
  fetchGetGatewayTopSlow,
  fetchGetGatewayTrend
} from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'MonitorGateway'
});

type QuickKey = '15m' | '1h' | 'today' | '7d' | '30d';
type TrendMetric = 'traffic' | 'error' | 'latency';

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;
const REFRESH_INTERVAL = 15_000;

const overview = ref<Api.Gateway.Overview | null>(null);
const routes = ref<Api.Gateway.Route[]>([]);
const services = ref<Api.Gateway.Service[]>([]);
const loading = ref(false);
const routeLoading = ref(false);
const refreshing = ref(false);
const autoRefresh = ref(true);
const lastUpdated = ref('-');

const quickRange = ref<QuickKey | null>('1h');
const selectedRange = ref<[number, number] | null>(quickRangeOf('1h'));
const trendMetric = ref<TrendMetric>('traffic');
const keyword = ref<string | null>(null);
const methodFilter = ref<string | null>(null);
const statusFilter = ref<0 | 1 | null>(null);
const serviceFilter = ref<string | null>(null);
const selectedRoute = ref<Api.Gateway.Route | null>(null);
const detailVisible = ref(false);
const currentTrend = ref<Api.Gateway.TrendPoint[]>([]);

const quickOptions = computed(() => [
  { key: '15m' as const, label: $t('page.gateway.last15minutes') },
  { key: '1h' as const, label: $t('page.gateway.lastHour') },
  { key: 'today' as const, label: $t('page.gateway.today') },
  { key: '7d' as const, label: $t('page.gateway.last7days') },
  { key: '30d' as const, label: $t('page.gateway.last30days') }
]);

const trendMetricOptions = computed(() => [
  { label: $t('page.gateway.trafficMetric'), value: 'traffic' as const },
  { label: $t('page.gateway.errorMetric'), value: 'error' as const },
  { label: $t('page.gateway.latencyMetric'), value: 'latency' as const }
]);

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

const statusOptions = computed(() => [
  { label: $t('page.gateway.enabled'), value: 1 as const },
  { label: $t('page.gateway.disabled'), value: 0 as const }
]);

const serviceOptions = computed(() => {
  return services.value.map(item => ({ label: item.serviceName, value: item.serviceName }));
});

function quickRangeOf(key: QuickKey): [number, number] {
  const end = Date.now();
  if (key === '15m') return [end - 15 * MINUTE_MS, end];
  if (key === '1h') return [end - 60 * MINUTE_MS, end];
  if (key === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return [start.getTime(), end];
  }
  return [end - (key === '7d' ? 7 : 30) * DAY_MS, end];
}

function rangeParams() {
  const range = selectedRange.value ?? quickRangeOf('1h');
  return { startTime: range[0], endTime: range[1] };
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

const statCards = computed(() => {
  const data = overview.value;
  return [
    { key: 'qps', label: $t('page.gateway.qps'), value: data?.qps ?? 0, icon: 'mdi:speedometer', color: '#3b82f6', suffix: '' },
    {
      key: 'requestCount',
      label: $t('page.gateway.requestCount'),
      value: data?.requestCount ?? data?.todayCalls ?? 0,
      icon: 'mdi:counter',
      color: '#8b5cf6',
      suffix: ''
    },
    {
      key: 'errorRate',
      label: $t('page.gateway.errorRate'),
      value: data?.errorRate ?? 0,
      icon: 'mdi:alert-circle-outline',
      color: '#f43f5e',
      suffix: '%',
      decimals: 2
    },
    {
      key: 'p95Cost',
      label: $t('page.gateway.p95Cost'),
      value: data?.p95CostMs ?? data?.avgCostMs ?? 0,
      icon: 'mdi:timer-alert-outline',
      color: '#f59e0b',
      suffix: ' ms',
      decimals: 1
    },
    {
      key: 'onlineServices',
      label: $t('page.gateway.onlineServices'),
      value: data?.onlineServices ?? 0,
      icon: 'mdi:server-network',
      color: '#10b981',
      suffix: ` / ${data?.totalServices ?? 0}`
    },
    {
      key: 'activeRoutes',
      label: $t('page.gateway.activeRoutes'),
      value: data?.activeRoutes ?? data?.routeCount ?? 0,
      icon: 'mdi:transit-connection-variant',
      color: '#06b6d4',
      suffix: ` / ${data?.routeCount ?? 0}`
    }
  ];
});

function buildTrendOption(points: Api.Gateway.TrendPoint[], metric: TrendMetric): ECOption {
  const area = (color: string) =>
    new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: `${color}66` },
      { offset: 1, color: `${color}05` }
    ]);
  const errorMax = Math.max(1, Math.ceil(Math.max(...points.map(point => point.errorRate), 0) * 1.3));
  const common = { type: 'line', smooth: true, symbol: 'none', lineStyle: { width: 2 } } as const;
  const axes = {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map(point => point.time),
      axisTick: { show: false },
      axisLine: { show: false }
    },
    grid: { left: 8, right: 16, bottom: 0, containLabel: true }
  } as const;

  if (metric === 'error') {
    return {
      animationDurationUpdate: 300,
      tooltip: { trigger: 'axis', valueFormatter: value => `${value}%` },
      ...axes,
      grid: { ...axes.grid, top: 18 },
      yAxis: { type: 'value', max: errorMax, axisLabel: { formatter: '{value}%' }, splitNumber: 4, axisLine: { show: false }, axisTick: { show: false } },
      series: [{ ...common, name: $t('page.gateway.errorRate'), areaStyle: { color: area('#f43f5e') }, itemStyle: { color: '#f43f5e' }, data: points.map(point => point.errorRate) }]
    };
  }

  if (metric === 'latency') {
    return {
      animationDurationUpdate: 300,
      tooltip: { trigger: 'axis', valueFormatter: value => `${value} ms` },
      legend: { top: 0, right: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 4 },
      ...axes,
      grid: { ...axes.grid, top: 34 },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} ms' }, splitNumber: 4, axisLine: { show: false }, axisTick: { show: false } },
      series: [
        { ...common, name: $t('page.gateway.avgCostCol'), areaStyle: { color: area('#f59e0b') }, itemStyle: { color: '#f59e0b' }, data: points.map(point => point.avgCost) },
        { ...common, name: $t('page.gateway.p95Cost'), lineStyle: { width: 2, type: 'dashed' }, itemStyle: { color: '#f43f5e' }, data: points.map(point => point.p95Cost ?? point.avgCost * 1.8) }
      ]
    };
  }

  return {
    animationDurationUpdate: 300,
    tooltip: { trigger: 'axis', valueFormatter: value => `${value} QPS` },
    ...axes,
    grid: { ...axes.grid, top: 18 },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}' }, splitNumber: 4, axisLine: { show: false }, axisTick: { show: false } },
    series: [{ ...common, name: $t('page.gateway.qps'), areaStyle: { color: area('#3b82f6') }, itemStyle: { color: '#3b82f6' }, data: points.map(point => point.qps) }]
  };
}

function buildTopOption(items: Api.Gateway.TopItem[], color: string, unit: string): ECOption {
  const sorted = [...items].reverse();
  return {
    animationDurationUpdate: 400,
    tooltip: { trigger: 'axis', valueFormatter: value => `${value}${unit}` },
    grid: { left: 8, right: 58, top: 8, bottom: 0, containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: { type: 'category', data: sorted.map(item => item.name), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { width: 170, overflow: 'truncate' } },
    series: [
      {
        type: 'bar',
        barWidth: 10,
        itemStyle: { borderRadius: 5, color: new graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color }, { offset: 1, color: `${color}55` }]) },
        label: { show: true, position: 'right', formatter: ({ value }) => `${Number(value).toLocaleString()}${unit}` },
        data: sorted.map(item => item.value)
      }
    ]
  };
}

const { domRef: trendRef, updateOptions: updateTrend } = useEcharts(() => buildTrendOption([], trendMetric.value));
const { domRef: topInvokedRef, updateOptions: updateTopInvoked } = useEcharts(() => buildTopOption([], '#3b82f6', ''));
const { domRef: topSlowRef, updateOptions: updateTopSlow } = useEcharts(() => buildTopOption([], '#f59e0b', ' ms'));
const { domRef: topErrorRef, updateOptions: updateTopError } = useEcharts(() => buildTopOption([], '#f43f5e', '%'));

function updateTrendChart(points: Api.Gateway.TrendPoint[]) {
  updateTrend(() => buildTrendOption(points, trendMetric.value));
}

function selectTrendMetric(value: TrendMetric) {
  trendMetric.value = value;
  updateTrendChart(currentTrend.value);
}

async function loadRoutes() {
  routeLoading.value = true;
  try {
    // 未选具体服务时对全部服务生效（按服务逐个拉取，接口要求 serviceName 必填）。
    const targets = serviceFilter.value ? [serviceFilter.value] : services.value.map(service => service.serviceName);
    await Promise.all(targets.map(serviceName => loadServiceRoutes(serviceName)));
  } finally {
    routeLoading.value = false;
  }
}

async function loadServiceRoutes(serviceName: string) {
  const nextRoutes = await fetchGetGatewayServiceRoutes({
    keyword: keyword.value,
    method: methodFilter.value,
    status: statusFilter.value,
    serviceName
  });
  routes.value = [...routes.value.filter(route => route.serviceName !== serviceName), ...nextRoutes];
}

async function loadAll() {
  loading.value = true;
  refreshing.value = true;
  try {
    const params = rangeParams();
    const [nextOverview, trend, invoked, slow, errors, nextServices] = await Promise.all([
      fetchGetGatewayOverview(params),
      fetchGetGatewayTrend(params),
      fetchGetGatewayTopInvoked({ limit: 6, ...params }),
      fetchGetGatewayTopSlow({ limit: 6, ...params }),
      fetchGetGatewayTopError({ limit: 6, ...params }),
      fetchGetGatewayServiceList()
    ]);

    overview.value = nextOverview;
    currentTrend.value = trend;
    // 只展示有健康实例的服务：健康实例为 0 的服务（如未部署的 api-example）视为未使用。
    services.value = nextServices.filter(service => service.healthyInstanceCount > 0);
    updateTrendChart(trend);
    updateTopInvoked(() => buildTopOption(invoked, '#3b82f6', ''));
    updateTopSlow(() => buildTopOption(slow, '#f59e0b', ' ms'));
    updateTopError(() => buildTopOption(errors, '#f43f5e', '%'));
    lastUpdated.value = nextOverview.updatedAt ?? new Date().toLocaleTimeString();
    // 预取各服务路由填充树表 children：NDataTable 对 children 为空的行不渲染展开箭头，
    // 不预取则永远无法展开查看服务下的 API 列表。
    await Promise.all(services.value.map(service => loadServiceRoutes(service.serviceName)));
  } catch {
    window.$message?.error($t('page.gateway.loadFailed'));
  } finally {
    loading.value = false;
    routeLoading.value = false;
    refreshing.value = false;
  }
}

function applyQuickRange(key: QuickKey) {
  quickRange.value = key;
  selectedRange.value = quickRangeOf(key);
  void loadAll();
}

function onRangeChange(value: [number, number] | null) {
  if (!value) {
    quickRange.value = '1h';
    selectedRange.value = quickRangeOf('1h');
  } else {
    quickRange.value = null;
    selectedRange.value = value;
  }
  void loadAll();
}

function errorType(value: number): NaiveUI.ThemeColor {
  if (value >= 2) return 'error';
  if (value >= 0.5) return 'warning';
  return 'success';
}

function errorRateOf(route: Api.Gateway.Route) {
  return route.errorRate ?? 0;
}

function isEnabled(status: Api.Gateway.Route['status']) {
  return status === 1 || status === '1';
}

function p95Of(route: Api.Gateway.Route) {
  return route.p95CostMs ?? 0;
}

function errorCallsOf(route: Api.Gateway.Route) {
  return route.errorCalls ?? Math.round((route.calls * errorRateOf(route)) / 100);
}

function renderLatency(value: number) {
  return <span class="tabular-nums">{value > 0 ? `${value} ms` : '-'}</span>;
}

function renderErrorRate(value: number) {
  return <NTag type={errorType(value)} size="small">{`${value.toFixed(2)}%`}</NTag>;
}

interface ServiceRow {
  isService: true;
  id: string;
  serviceName: string;
  upstream?: string;
  qps: number;
  avgCostMs: number;
  p95CostMs: number;
  errorRate: number;
  errorCalls: number;
  calls: number;
  allEnabled: boolean;
  children: Api.Gateway.Route[];
}

type RouteTableRow = ServiceRow | (Api.Gateway.Route & { isService?: false });

const routeTree = computed<RouteTableRow[]>(() => {
  if (services.value.length > 0) {
    return services.value.map(service => {
      const children = routes.value.filter(route => route.serviceName === service.serviceName);
      const calls = children.reduce((sum, route) => sum + route.calls, 0);
      const errors = children.reduce((sum, route) => sum + errorCallsOf(route), 0);
      const weightedAvg = calls > 0 ? children.reduce((sum, route) => sum + route.avgCostMs * route.calls, 0) / calls : 0;
      return {
        isService: true as const,
        id: `svc:${service.serviceName}`,
        serviceName: service.serviceName,
        upstream: service.serviceName,
        qps: children.reduce((sum, route) => sum + route.qps, 0),
        avgCostMs: Number(weightedAvg.toFixed(1)),
        p95CostMs: children.length ? Math.max(...children.map(route => p95Of(route))) : 0,
        errorRate: calls > 0 ? Number(((errors / calls) * 100).toFixed(2)) : 0,
        errorCalls: errors,
        calls,
        allEnabled: service.status === 1,
        children
      };
    });
  }
  const groups = new Map<string, Api.Gateway.Route[]>();
  for (const route of routes.value) {
    const list = groups.get(route.serviceName) ?? [];
    list.push(route);
    groups.set(route.serviceName, list);
  }

  return Array.from(groups.entries()).map(([serviceName, list]) => {
    const calls = list.reduce((sum, route) => sum + route.calls, 0);
    const errors = list.reduce((sum, route) => sum + errorCallsOf(route), 0);
    const weightedAvg = calls > 0 ? list.reduce((sum, route) => sum + route.avgCostMs * route.calls, 0) / calls : 0;

    return {
      isService: true,
      id: `svc:${serviceName}`,
      serviceName,
      upstream: list[0].upstream ?? serviceName,
      qps: list.reduce((sum, route) => sum + route.qps, 0),
      avgCostMs: Number(weightedAvg.toFixed(1)),
      p95CostMs: Math.max(...list.map(route => p95Of(route))),
      errorRate: calls > 0 ? Number(((errors / calls) * 100).toFixed(2)) : 0,
      errorCalls: errors,
      calls,
      allEnabled: list.every(route => isEnabled(route.status)),
      children: list
    };
  });
});

const expandedRowKeys = ref<Array<string | number>>([]);
const allExpanded = computed(() => routeTree.value.length > 0 && expandedRowKeys.value.length >= routeTree.value.length);

async function onExpandedRowsChange(keys: Array<string | number>) {
  const previous = new Set(expandedRowKeys.value);
  expandedRowKeys.value = keys;
  const expandedServices = keys.filter(key => !previous.has(key)).map(String).filter(key => key.startsWith('svc:')).map(key => key.slice(4));
  await Promise.all(expandedServices.map(serviceName => loadServiceRoutes(serviceName)));
}

async function toggleExpandAll() {
  if (allExpanded.value) {
    expandedRowKeys.value = [];
    return;
  }
  expandedRowKeys.value = routeTree.value.map(row => row.id);
  await Promise.all(services.value.map(service => loadServiceRoutes(service.serviceName)));
}

function openRouteDetail(row: RouteTableRow) {
  if (row.isService) return;
  selectedRoute.value = row;
  detailVisible.value = true;
}

const selectedDetail = computed(() => {
  const route = selectedRoute.value;
  if (!route) return null;
  const errorRate = errorRateOf(route);
  return {
    route,
    errorRate,
    errorCalls: errorCallsOf(route),
    successRate: Math.max(0, 100 - errorRate),
    clientErrorRate: Number((errorRate * 0.62).toFixed(2)),
    serverErrorRate: Number((errorRate * 0.38).toFixed(2))
  };
});

const columns = computed<NaiveUI.TableColumn<RouteTableRow>[]>(() => [
  {
    key: 'name',
    title: $t('page.gateway.serviceRoute'),
    width: 300,
    ellipsis: { tooltip: true },
    render: row =>
      row.isService ? (
        <div class="inline-flex items-center gap-8px whitespace-nowrap">
          <span class="text-14px font-600">{row.serviceName}</span>
          <NTag size="small" bordered={false}>{`${row.children.length} API`}</NTag>
        </div>
      ) : (
        <div class="inline-flex items-center gap-8px pl-4px whitespace-nowrap">
          <NTag size="small" bordered={false}>{row.method}</NTag>
          <span class="font-500">{row.path}</span>
        </div>
      )
  },
  { key: 'upstream', title: $t('page.gateway.upstream'), width: 170, render: row => <span class="text-13px">{row.upstream}</span> },
  {
    key: 'status',
    title: $t('page.gateway.status'),
    align: 'center',
    width: 96,
    render: row =>
      row.isService ? (
        <NTag type={row.allEnabled ? 'success' : 'warning'} size="small">{row.allEnabled ? $t('page.gateway.enabled') : $t('page.gateway.partialDisabled')}</NTag>
      ) : (
        <NTag type={isEnabled(row.status) ? 'success' : 'error'} size="small">{isEnabled(row.status) ? $t('page.gateway.enabled') : $t('page.gateway.disabled')}</NTag>
      )
  },
  { key: 'qps', title: $t('page.gateway.qpsCol'), align: 'center', width: 90, render: row => <span class="tabular-nums">{row.qps}</span> },
  { key: 'avgCostMs', title: $t('page.gateway.avgCostCol'), align: 'center', width: 120, render: row => renderLatency(row.avgCostMs) },
  { key: 'p95CostMs', title: $t('page.gateway.p95CostCol'), align: 'center', width: 120, render: row => renderLatency(row.isService ? row.p95CostMs : p95Of(row)) },
  { key: 'errorRate', title: $t('page.gateway.errorRateCol'), align: 'center', width: 110, render: row => renderErrorRate(row.isService ? row.errorRate : errorRateOf(row)) },
  { key: 'calls', title: $t('page.gateway.callsCol'), align: 'right', width: 130, render: row => <span class="tabular-nums">{formatNumber(row.calls)}</span> },
  {
    key: 'operate',
    title: $t('common.operate'),
    align: 'center',
    width: 100,
    render: row => (row.isService ? <span class="text-gray-4">-</span> : <NButton size="tiny" quaternary type="primary" onClick={() => openRouteDetail(row)}>{$t('page.gateway.viewDetail')}</NButton>)
  }
]);

let timer: number | null = null;

onMounted(() => {
  void loadAll();
  timer = window.setInterval(() => {
    if (autoRefresh.value) void loadAll();
  }, REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (timer !== null) window.clearInterval(timer);
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <div class="flex flex-wrap-y-center justify-between gap-12px">
      <div>
        <h2 class="m-0 text-20px font-600">{{ $t('route.monitor_gateway') }}</h2>
        <div class="mt-4px text-12px text-gray-5">
          {{ $t('page.gateway.readOnlyHint') }} · {{ $t('page.gateway.lastUpdated') }} {{ lastUpdated }}
        </div>
      </div>
      <div class="flex flex-wrap-y-center gap-8px">
        <NButton
          v-for="item in quickOptions"
          :key="item.key"
          size="small"
          ghost
          :type="quickRange === item.key ? 'primary' : 'default'"
          @click="applyQuickRange(item.key)"
        >
          {{ item.label }}
        </NButton>
        <NDatePicker
          v-model:value="selectedRange"
          type="datetimerange"
          size="small"
          clearable
          class="w-330px shrink-0"
          @update:value="onRangeChange"
        />
        <span class="text-12px text-gray-5">{{ $t('page.gateway.autoRefresh') }}</span>
        <NSwitch v-model:value="autoRefresh" size="small" />
        <NButton size="small" type="primary" :loading="refreshing" @click="loadAll">
          <template #icon><icon-mdi-refresh /></template>
          {{ $t('common.refresh') }}
        </NButton>
      </div>
    </div>

    <NCard :title="$t('page.gateway.overview')" :bordered="false" size="small" class="card-wrapper">
      <NGrid cols="1 s:2 m:3 l:6" responsive="screen" :x-gap="12" :y-gap="12">
        <NGi v-for="item in statCards" :key="item.key">
          <div
            class="rounded-8px border-1px px-14px py-10px"
            :style="{ backgroundColor: `${item.color}1a`, borderColor: `${item.color}40` }"
          >
            <div class="flex items-center justify-between">
              <span class="text-13px text-gray-5">{{ item.label }}</span>
              <div class="h-30px w-30px flex-center rounded-6px" :style="{ backgroundColor: `${item.color}26` }">
                <SvgIcon :icon="item.icon" class="text-17px" :style="{ color: item.color }" />
              </div>
            </div>
            <div class="mt-2px flex items-baseline gap-4px">
              <CountTo
                :end-value="item.value"
                :decimals="item.decimals ?? 0"
                class="text-26px font-600 tabular-nums"
                :style="{ color: item.color }"
              />
              <span v-if="item.suffix" class="text-13px text-gray-5">{{ item.suffix }}</span>
            </div>
          </div>
        </NGi>
      </NGrid>
    </NCard>

    <NCard :title="$t('page.gateway.trend')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <NSelect
          :value="trendMetric"
          :options="trendMetricOptions"
          size="small"
          class="w-150px"
          @update:value="selectTrendMetric"
        />
      </template>
      <div ref="trendRef" class="h-330px lt-sm:h-260px" />
    </NCard>

    <NGrid cols="1 m:3" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi>
        <NCard :title="$t('page.gateway.topInvoked')" :bordered="false" size="small" class="card-wrapper h-full">
          <div ref="topInvokedRef" class="h-260px" />
        </NCard>
      </NGi>
      <NGi>
        <NCard :title="$t('page.gateway.topSlow')" :bordered="false" size="small" class="card-wrapper h-full">
          <div ref="topSlowRef" class="h-260px" />
        </NCard>
      </NGi>
      <NGi>
        <NCard :title="$t('page.gateway.topError')" :bordered="false" size="small" class="card-wrapper h-full">
          <div ref="topErrorRef" class="h-260px" />
        </NCard>
      </NGi>
    </NGrid>

    <NCard :title="$t('page.gateway.routeTable')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <div class="flex flex-wrap-y-center gap-8px">
          <NButton size="small" quaternary @click="toggleExpandAll">
            <template #icon>
              <icon-mdi-unfold-less-horizontal v-if="allExpanded" class="text-icon" />
              <icon-mdi-unfold-more-horizontal v-else class="text-icon" />
            </template>
            {{ allExpanded ? $t('page.gateway.collapseAll') : $t('page.gateway.expandAll') }}
          </NButton>
          <NSelect
            v-model:value="serviceFilter"
            :options="serviceOptions"
            :placeholder="$t('page.gateway.allServices')"
            clearable
            size="small"
            class="w-130px"
            @update:value="loadRoutes"
          />
          <NSelect
            v-model:value="statusFilter"
            :options="statusOptions"
            :placeholder="$t('page.gateway.allStatus')"
            clearable
            size="small"
            class="w-110px"
            @update:value="loadRoutes"
          />
          <NSelect
            v-model:value="methodFilter"
            :options="methodOptions"
            :placeholder="$t('page.gateway.method')"
            size="small"
            clearable
            class="w-100px"
            @update:value="loadRoutes"
          />
          <NInput
            v-model:value="keyword"
            :placeholder="$t('page.gateway.keyword')"
            clearable
            size="small"
            class="w-190px"
            @keydown.enter="loadRoutes"
          />
          <NButton size="small" quaternary :loading="routeLoading" @click="loadRoutes">
            <template #icon><icon-mdi-refresh /></template>
            {{ $t('common.refresh') }}
          </NButton>
        </div>
      </template>
      <NDataTable
        v-model:expanded-row-keys="expandedRowKeys"
        :columns="columns"
        :data="routeTree"
        :loading="routeLoading || loading"
        size="small"
        :scroll-x="1236"
        :row-key="(row: RouteTableRow) => row.id"
        :pagination="false"
        @update:expanded-row-keys="onExpandedRowsChange"
      />
    </NCard>

    <NDrawer v-model:show="detailVisible" :width="620">
      <NDrawerContent v-if="selectedDetail" :title="$t('page.gateway.routeDetail')" closable>
        <div class="flex-col-stretch gap-16px">
          <div>
            <div class="text-18px font-600">{{ selectedDetail.route.method }} {{ selectedDetail.route.path }}</div>
            <div class="mt-6px flex-y-center gap-8px text-13px text-gray-5">
              <NTag size="small">{{ selectedDetail.route.serviceName }}</NTag>
              <span>{{ selectedDetail.route.upstream }}</span>
              <NTag :type="isEnabled(selectedDetail.route.status) ? 'success' : 'error'" size="small">
                {{ isEnabled(selectedDetail.route.status) ? $t('page.gateway.enabled') : $t('page.gateway.disabled') }}
              </NTag>
            </div>
          </div>
          <NGrid cols="2 s:4" responsive="screen" :x-gap="10" :y-gap="10">
            <NGi><NStatistic :label="$t('page.gateway.qpsCol')" :value="selectedDetail.route.qps" /></NGi>
            <NGi>
              <NStatistic
                :label="$t('page.gateway.p95CostCol')"
                :value="selectedDetail.route.p95CostMs ?? p95Of(selectedDetail.route)"
                suffix=" ms"
              />
            </NGi>
            <NGi><NStatistic :label="$t('page.gateway.errorCalls')" :value="selectedDetail.errorCalls" /></NGi>
            <NGi>
              <NStatistic :label="$t('page.gateway.instanceCount')" :value="selectedDetail.route.instanceCount ?? 0" />
            </NGi>
          </NGrid>
          <NCard :title="$t('page.gateway.statusDistribution')" size="small" :bordered="false" class="bg-gray-1">
            <div class="flex-col-stretch gap-10px">
              <div class="flex-y-center gap-10px">
                <span class="w-70px text-13px">{{ $t('page.gateway.successRate') }}</span>
                <NProgress
                  type="line"
                  :percentage="selectedDetail.successRate"
                  status="success"
                  :show-indicator="false"
                />
                <span class="w-52px text-right text-12px">{{ selectedDetail.successRate.toFixed(2) }}%</span>
              </div>
              <div class="flex-y-center gap-10px">
                <span class="w-70px text-13px">4xx</span>
                <NProgress
                  type="line"
                  :percentage="selectedDetail.clientErrorRate"
                  status="warning"
                  :show-indicator="false"
                />
                <span class="w-52px text-right text-12px">{{ selectedDetail.clientErrorRate.toFixed(2) }}%</span>
              </div>
              <div class="flex-y-center gap-10px">
                <span class="w-70px text-13px">5xx</span>
                <NProgress
                  type="line"
                  :percentage="selectedDetail.serverErrorRate"
                  status="error"
                  :show-indicator="false"
                />
                <span class="w-52px text-right text-12px">{{ selectedDetail.serverErrorRate.toFixed(2) }}%</span>
              </div>
            </div>
          </NCard>
          <NDescriptions bordered size="small" :column="1">
            <NDescriptionsItem :label="$t('page.gateway.routeName')">
              {{ selectedDetail.route.routeName }}
            </NDescriptionsItem>
            <NDescriptionsItem label="Source">{{ selectedDetail.route.source ?? '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="Internal Path">{{ selectedDetail.route.internalPath ?? '-' }}</NDescriptionsItem>
            <NDescriptionsItem label="Mapped">
              {{ selectedDetail.route.mapped === false ? 'No' : 'Yes' }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.gateway.strategy')">
              {{ selectedDetail.route.strategy }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.gateway.avgCostCol')">
              {{ selectedDetail.route.avgCostMs }} ms
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.gateway.callsCol')">
              {{ formatNumber(selectedDetail.route.calls) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="$t('page.gateway.lastSeen')">
              {{ selectedDetail.route.lastSeen ?? '-' }}
            </NDescriptionsItem>
          </NDescriptions>
        </div>
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped></style>
