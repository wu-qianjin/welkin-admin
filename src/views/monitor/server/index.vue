<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { graphic } from 'echarts';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import { fetchGetServerList, fetchGetServerMetricHistory, fetchGetServerMetrics } from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'MonitorServer'
});

const REFRESH_INTERVAL = 5000;

const loading = ref(false);
const servers = ref<Api.Monitor.Server[]>([]);
const selectedId = ref<number | null>(null);
const metrics = ref<Api.Monitor.ServerMetrics | null>(null);
const trendPoints = ref<Api.Monitor.MetricHistoryPoint[]>([]);
const autoRefresh = ref(true);

const selectedServer = computed(() => servers.value.find(item => item.id === selectedId.value) ?? null);

/** light vivid palette (emerald / amber / rose), shared by gauges and progress bars */
const levelColor = (value: number) => {
  if (value >= 80) return '#f43f5e';
  if (value >= 60) return '#f59e0b';
  return '#10b981';
};

function buildGaugeOption(label: string, value: number, detail: string): ECOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: '96%',
        center: ['50%', '58%'],
        itemStyle: { color: levelColor(value) },
        progress: { show: true, width: 13, roundCap: true },
        pointer: { show: false },
        axisLine: { roundCap: true, lineStyle: { width: 13, color: [[1, 'rgba(128, 128, 128, 0.18)']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { offsetCenter: [0, '38%'], fontSize: 13, color: 'inherit' },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-2%'],
          formatter: '{value} %',
          fontSize: 26,
          fontWeight: 600
        },
        data: [{ value, name: `${label}\n${detail}` }]
      }
    ]
  };
}

const gaugeCommon = {
  animationDurationUpdate: 600,
  tooltip: { trigger: 'none' }
} as const;

const { domRef: cpuGaugeRef, updateOptions: updateCpuGauge } = useEcharts(
  () => ({ ...gaugeCommon, ...buildGaugeOption($t('page.monitor.cpu'), 0, '') }) as ECOption
);
const { domRef: memGaugeRef, updateOptions: updateMemGauge } = useEcharts(
  () => ({ ...gaugeCommon, ...buildGaugeOption($t('page.monitor.memory'), 0, '') }) as ECOption
);
const { domRef: diskGaugeRef, updateOptions: updateDiskGauge } = useEcharts(
  () => ({ ...gaugeCommon, ...buildGaugeOption($t('page.monitor.disk'), 0, '') }) as ECOption
);

const { domRef: trendRef, updateOptions: updateTrend } = useEcharts(() => buildTrendOption([]));

function buildTrendOption(points: Api.Monitor.MetricHistoryPoint[]): ECOption {
  const mkArea = (color: string) =>
    new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: `${color}66` },
      { offset: 1, color: `${color}05` }
    ]);

  return {
    animationDurationUpdate: 400,
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 4 },
    grid: { left: 8, right: 16, top: 36, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: points.map(point => point.time),
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        name: $t('page.monitor.cpu'),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2 },
        areaStyle: { color: mkArea('#3b82f6') },
        itemStyle: { color: '#3b82f6' },
        data: points.map(point => point.cpu)
      },
      {
        name: $t('page.monitor.memory'),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2 },
        areaStyle: { color: mkArea('#10b981') },
        itemStyle: { color: '#10b981' },
        data: points.map(point => point.mem)
      },
      {
        name: $t('page.monitor.disk'),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        data: points.map(point => point.disk)
      }
    ]
  };
}

function renderMetrics(next: Api.Monitor.ServerMetrics) {
  metrics.value = next;

  updateCpuGauge(() => buildGaugeOption($t('page.monitor.cpu'), next.cpuPercent, ''));
  updateMemGauge(() =>
    buildGaugeOption($t('page.monitor.memory'), next.memPercent, `${next.memUsed} / ${next.memTotal} GB`)
  );
  updateDiskGauge(() =>
    buildGaugeOption($t('page.monitor.disk'), next.diskPercent, `${next.diskUsed} / ${next.diskTotal} GB`)
  );
}

function renderTrend(point?: Api.Monitor.MetricHistoryPoint) {
  if (point) {
    trendPoints.value.push(point);
    if (trendPoints.value.length > 60) trendPoints.value.shift();
  }
  updateTrend(() => buildTrendOption(trendPoints.value));
}

async function loadServers() {
  loading.value = true;
  try {
    servers.value = await fetchGetServerList();
    if (!selectedId.value && servers.value.length) {
      await selectServer(servers.value[0].id);
    }
  } finally {
    loading.value = false;
  }
}

async function loadMetrics() {
  if (selectedId.value === null) return;
  const next = await fetchGetServerMetrics({ serverId: selectedId.value });
  renderMetrics(next);
  renderTrend({ time: next.updateTime, cpu: next.cpuPercent, mem: next.memPercent, disk: next.diskPercent });

  // keep the selected card snapshot in sync
  const card = servers.value.find(item => item.id === selectedId.value);
  if (card) {
    card.cpuPercent = next.cpuPercent;
    card.memPercent = next.memPercent;
    card.diskPercent = next.diskPercent;
  }
}

async function selectServer(id: number) {
  if (selectedId.value === id) return;
  selectedId.value = id;
  metrics.value = null;
  trendPoints.value = [];
  renderTrend();
  const history = await fetchGetServerMetricHistory({ serverId: id });
  trendPoints.value = history;
  renderTrend();
  await loadMetrics();
}

let timer: number | null = null;

function stopPolling() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}

function startPolling() {
  stopPolling();
  timer = window.setInterval(() => {
    if (autoRefresh.value) {
      loadMetrics();
    }
  }, REFRESH_INTERVAL);
}

onMounted(() => {
  loadServers();
  startPolling();
});

onUnmounted(stopPolling);

/** per-card snapshot bars */
function barItemsFor(item: Api.Monitor.Server) {
  return [
    { label: $t('page.monitor.cpu'), value: item.cpuPercent },
    { label: $t('page.monitor.memory'), value: item.memPercent },
    { label: $t('page.monitor.disk'), value: item.diskPercent }
  ];
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <NAlert v-if="metrics?.metricsAvailable === false" type="warning" :show-icon="true">
      {{ metrics.metricsMessage ?? '主机级指标数据源未配置，当前仅展示进程健康信息' }}
    </NAlert>
    <!-- gauges + realtime trend of the selected service -->
    <NGrid cols="1 l:24" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi span="24 l:13">
        <NCard
          :title="selectedServer?.serviceName ?? $t('page.monitor.gaugePanel')"
          :bordered="false"
          size="small"
          class="card-wrapper"
        >
          <NGrid cols="3" :x-gap="8">
            <NGi>
              <div ref="cpuGaugeRef" class="h-220px" />
            </NGi>
            <NGi>
              <div ref="memGaugeRef" class="h-220px" />
            </NGi>
            <NGi>
              <div ref="diskGaugeRef" class="h-220px" />
            </NGi>
          </NGrid>
        </NCard>
      </NGi>
      <NGi span="24 l:11">
        <NCard :title="$t('page.monitor.trend')" :bordered="false" size="small" class="card-wrapper h-full">
          <div ref="trendRef" class="h-250px lt-sm:h-220px" />
        </NCard>
      </NGi>
    </NGrid>

    <!-- service instance cards -->
    <NCard :title="$t('page.monitor.serverList')" :bordered="false" size="small" class="card-wrapper">
      <template #header-extra>
        <div class="flex-y-center gap-12px">
          <span class="text-12px">{{ $t('page.monitor.autoRefresh') }}</span>
          <NSwitch v-model:value="autoRefresh" size="small" />
          <NButton size="small" quaternary :loading="loading" @click="loadServers">
            <template #icon>
              <icon-mdi-refresh class="text-icon" />
            </template>
            {{ $t('common.refresh') }}
          </NButton>
        </div>
      </template>
      <NSpin :show="loading">
        <NGrid cols="1 s:2 m:3 l:6" responsive="screen" :x-gap="12" :y-gap="12">
          <NGi v-for="item in servers" :key="item.id">
            <div
              class="cursor-pointer rounded-6px border-1px p-12px transition-all-300"
              :class="item.id === selectedId ? 'border-primary bg-primary:8' : 'border-gray-2 hover:border-primary:50'"
              @click="selectServer(item.id)"
            >
              <div class="flex items-center justify-between">
                <span class="text-14px font-500">{{ item.serviceName }}</span>
                <NTag :type="item.status === '1' ? 'success' : 'error'" size="small" round>
                  {{ item.status === '1' ? $t('page.monitor.running') : $t('page.monitor.fault') }}
                </NTag>
              </div>
              <div class="mt-2px flex-y-center gap-6px text-12px text-gray-5">
                <icon-mdi-server class="text-icon" />
                {{ item.host }}:{{ item.port }}
              </div>
              <div class="mt-8px flex flex-col gap-4px">
                <div v-for="bar in barItemsFor(item)" :key="bar.label" class="flex-y-center gap-8px">
                  <span class="w-34px shrink-0 text-11px text-gray-5">{{ bar.label }}</span>
                  <NProgress
                    type="line"
                    :percentage="bar.value"
                    :height="5"
                    :show-indicator="false"
                    :color="levelColor(bar.value)"
                    class="flex-1"
                  />
                  <span class="w-36px shrink-0 text-right text-11px tabular-nums">{{ bar.value.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </NGi>
        </NGrid>
      </NSpin>
      <NEmpty v-if="!loading && !servers.length" class="h-120px" :description="$t('common.noData')" />
    </NCard>
  </div>
</template>

<style scoped></style>
