<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { NTag } from 'naive-ui';
import type { ECOption } from '@/hooks/common/echarts';
import { useEcharts } from '@/hooks/common/echarts';
import { mockAlerts, mockDependencies } from '@/mock/admin';
import { useRouter } from 'vue-router';

defineOptions({ name: 'MonitorOverview' });

const router = useRouter();
const refreshing = ref(false);
const lastUpdated = ref('刚刚');
const alerts = ref(mockAlerts.map(item => ({ ...item })));

const healthCards = computed(() => [
  {
    label: '服务实例',
    value: '5 / 6',
    detail: '1 个实例异常',
    icon: 'mdi:server',
    color: '#2563eb',
    status: 'warning'
  },
  {
    label: '网关错误率',
    value: '0.86%',
    detail: '较昨日下降 0.12%',
    icon: 'mdi:transit-connection-variant',
    color: '#16a34a',
    status: 'success'
  },
  {
    label: '平均响应',
    value: '42 ms',
    detail: 'P95 128 ms',
    icon: 'mdi:timer-outline',
    color: '#7c3aed',
    status: 'success'
  },
  {
    label: '数据库连接',
    value: '78%',
    detail: '连接池使用率',
    icon: 'mdi:database-outline',
    color: '#d97706',
    status: 'warning'
  },
  {
    label: '今日请求',
    value: '2.84M',
    detail: '峰值 328 QPS',
    icon: 'mdi:chart-line',
    color: '#0891b2',
    status: 'success'
  },
  {
    label: '待处理告警',
    value: '2',
    detail: '1 严重 / 1 警告',
    icon: 'mdi:bell-alert-outline',
    color: '#dc2626',
    status: 'error'
  }
]);

const serviceHealth = [
  {
    name: '用户服务',
    code: 'user-svc',
    host: '10.0.1.21:9002',
    status: '运行中',
    cpu: 32,
    memory: 48,
    qps: 186,
    version: 'v2.4.1'
  },
  {
    name: '系统服务',
    code: 'system-svc',
    host: '10.0.1.22:9001',
    status: '运行中',
    cpu: 24,
    memory: 41,
    qps: 92,
    version: 'v2.4.1'
  },
  {
    name: '文件服务',
    code: 'file-svc',
    host: '10.0.1.23:9003',
    status: '资源偏高',
    cpu: 68,
    memory: 72,
    qps: 64,
    version: 'v1.8.0'
  },
  {
    name: '消息服务',
    code: 'message-svc',
    host: '10.0.1.24:9004',
    status: '运行中',
    cpu: 37,
    memory: 55,
    qps: 220,
    version: 'v2.0.3'
  },
  {
    name: '报表服务',
    code: 'report-svc',
    host: '10.0.1.25:9005',
    status: '运行中',
    cpu: 46,
    memory: 62,
    qps: 18,
    version: 'v1.4.6'
  },
  {
    name: '任务服务',
    code: 'job-svc',
    host: '10.0.1.26:9006',
    status: '离线',
    cpu: 0,
    memory: 0,
    qps: 0,
    version: 'v0.9.8'
  }
];

const trendOption = (): ECOption => ({
  tooltip: { trigger: 'axis' },
  legend: { top: 0, right: 0 },
  grid: { left: 8, right: 16, top: 34, bottom: 8, containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] },
  yAxis: { type: 'value', splitNumber: 4 },
  series: [
    {
      name: 'QPS',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: { opacity: 0.12 },
      data: [118, 96, 228, 286, 318, 248]
    },
    { name: '错误率 %', type: 'line', smooth: true, symbol: 'none', data: [0.42, 0.36, 0.72, 0.88, 1.24, 0.86] }
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

function refresh() {
  refreshing.value = true;
  window.setTimeout(() => {
    refreshing.value = false;
    lastUpdated.value = '刚刚';
    updateTrend(trendOption);
    window.$message?.success('监控数据已刷新');
  }, 450);
}

onMounted(() => updateTrend(trendOption));
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
            <NBadge :value="2" class="ml-6px" />
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
            <NListItem v-for="dependency in mockDependencies" :key="dependency.name">
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
      <NGrid cols="1 s:2 m:3" responsive="screen" :x-gap="12" :y-gap="12">
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
                  :percentage="service.cpu"
                  :show-indicator="false"
                  :color="levelColor(service.cpu)"
                  :height="5"
                />
                <span class="w-34px text-right">{{ service.cpu }}%</span>
              </div>
              <div class="flex-y-center gap-8px">
                <span class="w-40px text-gray-5">内存</span>
                <NProgress
                  class="flex-1"
                  type="line"
                  :percentage="service.memory"
                  :show-indicator="false"
                  :color="levelColor(service.memory)"
                  :height="5"
                />
                <span class="w-34px text-right">{{ service.memory }}%</span>
              </div>
            </div>
            <div class="mt-10px flex-y-center justify-between text-12px text-gray-4">
              <span>{{ service.version }}</span>
              <span>{{ service.qps }} QPS</span>
            </div>
          </div>
        </NGi>
      </NGrid>
    </NCard>

    <NCard title="最近告警" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton text type="primary" @click="goAlerts">处理告警</NButton></template>
      <NDataTable
        :data="alerts.slice(0, 3)"
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
                { type: row.level === '严重' ? 'error' : row.level === '警告' ? 'warning' : 'info', size: 'small' },
                { default: () => row.level }
              )
          },
          { key: 'title', title: '告警内容', minWidth: 220 },
          { key: 'target', title: '目标', minWidth: 170 },
          { key: 'status', title: '状态', width: 100 },
          { key: 'occurredAt', title: '发生时间', width: 170 }
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
