<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { $t } from '@/locales';
import { fetchGetGatewayServiceList } from '@/service/api';

defineOptions({
  name: 'PieChart'
});

const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '1%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#5da8ff', '#8e9dff', '#fedc69', '#26deca'],
      name: $t('page.home.schedule'),
      type: 'pie',
      radius: ['45%', '75%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 1
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: [] as { name: string; value: number }[]
    }
  ]
}));

async function loadData() {
  try {
    const services = await fetchGetGatewayServiceList();
    const healthy = services.filter(item => item.status === 1).length;
    const unhealthy = services.length - healthy;
    updateOptions(opts => {
      opts.series[0].data = [
        { name: '正常服务', value: healthy },
        { name: '异常服务', value: unhealthy }
      ];
      return opts;
    });
  } catch {
    /* keep an empty chart when the gateway is not configured */
  }
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();

    opts.series[0].name = originOpts.series[0].name;

    return opts;
  });
}

async function init() {
  await loadData();
}

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

// init
onMounted(init);
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <div ref="domRef" class="h-360px overflow-hidden"></div>
  </NCard>
</template>

<style scoped></style>
