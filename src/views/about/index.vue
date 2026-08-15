<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { $t } from '@/locales';
import pkg from '~/package.json';

const appStore = useAppStore();

const column = computed(() => (appStore.isMobile ? 1 : 2));

interface PkgJson {
  name: string;
  version: string;
  dependencies: PkgVersionInfo[];
  devDependencies: PkgVersionInfo[];
}

interface PkgVersionInfo {
  name: string;
  version: string;
}

const { name, version, dependencies, devDependencies } = pkg;

function transformVersionData(tuple: [string, string]): PkgVersionInfo {
  const [$name, $version] = tuple;
  return {
    name: $name,
    version: $version
  };
}

const pkgJson: PkgJson = {
  name,
  version,
  dependencies: Object.entries(dependencies).map(item => transformVersionData(item)),
  devDependencies: Object.entries(devDependencies).map(item => transformVersionData(item))
};

const latestBuildTime = BUILD_TIME;

const systemInfo = [
  { label: '前端版本', value: pkgJson.version },
  { label: '运行环境', value: '生产环境' },
  { label: 'API 服务', value: '已连接（Mock）' },
  { label: '数据版本', value: 'schema-2026.08' },
  { label: '构建时间', value: latestBuildTime },
  { label: '授权协议', value: 'MIT License' }
];

const releaseNotes = [
  { version: '2.4.0', date: '2026-08-15', content: '新增监控总览、告警中心、个人中心和消息中心。' },
  { version: '2.3.2', date: '2026-08-08', content: '补充权限数据范围、日志导出和配置变更历史。' },
  { version: '2.3.0', date: '2026-07-26', content: '统一文件存储设置、主题配置和移动端列表体验。' }
];
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :bordered="false" size="small" segmented class="card-wrapper overflow-hidden">
      <div class="flex items-center gap-16px lt-sm:flex-col lt-sm:items-start">
        <div class="size-64px flex-center rounded-16px bg-primary text-30px text-white font-700">W</div>
        <div class="flex-1">
          <h2 class="m-0 text-22px font-600">WelkinAdmin</h2>
          <p class="mb-0 mt-8px text-14px leading-6 text-gray-5">
            面向个人和小企业的通用内部管理平台，提供组织权限、系统管理、消息公告、文件管理、审计日志和运行监控等基础能力。
          </p>
        </div>
        <NTag type="success" round>稳定版本</NTag>
      </div>
    </NCard>
    <NGrid cols="1 s:2 l:3" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi v-for="item in systemInfo" :key="item.label">
        <NCard :bordered="false" size="small" class="card-wrapper h-full">
          <div class="text-12px text-gray-5">{{ item.label }}</div>
          <div class="mt-8px truncate text-16px font-600">{{ item.value }}</div>
        </NCard>
      </NGi>
    </NGrid>
    <NCard :title="$t('page.about.projectInfo.title')" :bordered="false" size="small" segmented class="card-wrapper">
      <NDescriptions label-placement="left" bordered size="small" :column="column">
        <NDescriptionsItem :label="$t('page.about.projectInfo.version')">
          <NTag type="primary">{{ pkgJson.version }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.about.projectInfo.latestBuildTime')">
          <NTag type="primary">{{ latestBuildTime }}</NTag>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.about.projectInfo.githubLink')">
          <a class="text-primary" :href="pkg.homepage" target="_blank" rel="noopener noreferrer">
            {{ $t('page.about.projectInfo.githubLink') }}
          </a>
        </NDescriptionsItem>
        <NDescriptionsItem :label="$t('page.about.projectInfo.previewLink')">
          <a class="text-primary" :href="pkg.website" target="_blank" rel="noopener noreferrer">
            {{ $t('page.about.projectInfo.previewLink') }}
          </a>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
    <NCard title="版本更新" :bordered="false" size="small" segmented class="card-wrapper">
      <NTimeline>
        <NTimelineItem
          v-for="item in releaseNotes"
          :key="item.version"
          type="info"
          :time="item.date"
          :title="`v${item.version}`"
        >
          {{ item.content }}
        </NTimelineItem>
      </NTimeline>
    </NCard>
    <NCard title="帮助与支持" :bordered="false" size="small" segmented class="card-wrapper">
      <NGrid cols="1 s:3" responsive="screen" :x-gap="12" :y-gap="12">
        <NGi>
          <div class="rounded-8px border-1px border-gray-2 p-12px">
            <div class="flex-y-center gap-8px font-500">
              <icon-mdi-book-open-page-variant class="text-primary" />
              使用文档
            </div>
            <p class="mb-0 mt-8px text-12px text-gray-5">了解系统管理、权限配置和监控接入方式。</p>
          </div>
        </NGi>
        <NGi>
          <div class="rounded-8px border-1px border-gray-2 p-12px">
            <div class="flex-y-center gap-8px font-500">
              <icon-mdi-chat-question-outline class="text-primary" />
              问题反馈
            </div>
            <p class="mb-0 mt-8px text-12px text-gray-5">反馈使用问题或提交功能建议。</p>
          </div>
        </NGi>
        <NGi>
          <div class="rounded-8px border-1px border-gray-2 p-12px">
            <div class="flex-y-center gap-8px font-500">
              <icon-mdi-license class="text-primary" />
              开源许可
            </div>
            <p class="mb-0 mt-8px text-12px text-gray-5">WelkinAdmin 使用 MIT License 发布。</p>
          </div>
        </NGi>
      </NGrid>
    </NCard>
    <NCard :title="$t('page.about.prdDep')" :bordered="false" size="small" segmented class="card-wrapper">
      <NDescriptions label-placement="left" bordered size="small" :column="column">
        <NDescriptionsItem v-for="item in pkgJson.dependencies" :key="item.name" :label="item.name">
          {{ item.version }}
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
    <NCard :title="$t('page.about.devDep')" :bordered="false" size="small" segmented class="card-wrapper">
      <NDescriptions label-placement="left" bordered size="small" :column="column">
        <NDescriptionsItem v-for="item in pkgJson.devDependencies" :key="item.name" :label="item.name">
          {{ item.version }}
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
