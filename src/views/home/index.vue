<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { $t } from '@/locales';
import {
  fetchGetDeptList,
  fetchGetNoticeList,
  fetchGetOnlineUserList,
  fetchGetProfile,
  fetchGetRoleList,
  fetchGetUserList,
  fetchMonitorAlertList,
  fetchProfileSessions,
  type MonitorAlertItem,
  type ProfileData,
  type SessionData
} from '@/service/api';
import { useNoticeFeed } from '@/views/message/modules/notice-feed';
import HeroBanner from './modules/hero-banner.vue';
import ScaleStrip from './modules/scale-strip.vue';
import TodoPanel from './modules/todo-panel.vue';
import NoticeBoard from './modules/notice-board.vue';
import MessagePanel from './modules/message-panel.vue';
import AlertPanel from './modules/alert-panel.vue';
import OnlineUserPanel from './modules/online-user-panel.vue';

defineOptions({
  name: 'Home'
});

/** 各数据源独立降级：单个接口失败不影响整页 */
const refreshing = ref(false);
const lastUpdated = ref('--');
const profile = ref<ProfileData | null>(null);
const sessions = ref<SessionData[]>([]);
const notices = ref<Api.SystemManage.SystemNotice[]>([]);
const noticeTotal = ref(0);
const userTotal = ref(0);
const roleTotal = ref(0);
const deptTotal = ref(0);
const onlineTotal = ref(0);
const alerts = ref<MonitorAlertItem[]>([]);

const onlineUserRef = ref<InstanceType<typeof OnlineUserPanel> | null>(null);

const { unreadCount, load: loadMessages } = useNoticeFeed();

/** 在线设备 = 未撤销且刷新令牌未过期的会话，按 IP+UA 去重（同一浏览器多次登录算一台） */
const activeDeviceCount = computed(() => {
  const devices = new Set(
    sessions.value
      .filter(item => !item.revokedAt && dayjs(item.refreshExpiresAt).isAfter(dayjs()))
      .map(item => `${item.ip}|${item.userAgent}`)
  );
  devices.delete('|');
  return devices.size;
});

/** 待处理告警 = 未恢复（status: 1 未确认 / 2 已确认） */
const pendingAlerts = computed(() => alerts.value.filter(item => item.status !== 3));

const todoCount = computed(() => {
  let count = 0;
  if (unreadCount.value > 0) count += 1;
  if (profile.value && !profile.value.phone) count += 1;
  if (profile.value && !profile.value.email) count += 1;
  if (profile.value && !profile.value.avatar) count += 1;
  if (activeDeviceCount.value > 1) count += 1;
  if (pendingAlerts.value.length > 0) count += 1;
  return count;
});

async function loadDashboard() {
  refreshing.value = true;
  try {
    const [profileData, sessionList, noticeList, userPage, rolePage, deptPage, onlinePage, alertPage] =
      await Promise.all([
        fetchGetProfile().catch(() => null),
        fetchProfileSessions().catch(() => [] as SessionData[]),
        fetchGetNoticeList({ current: 1, size: 6, noticeStatus: '2' }).catch(() => null),
        fetchGetUserList({ current: 1, size: 1 }).catch(() => null),
        fetchGetRoleList({ current: 1, size: 1 }).catch(() => null),
        fetchGetDeptList().catch(() => null),
        fetchGetOnlineUserList({ current: 1, size: 100 }).catch(() => null),
        fetchMonitorAlertList({ current: 1, size: 20 }).catch(() => null)
      ]);
    profile.value = profileData;
    sessions.value = sessionList ?? [];
    notices.value = noticeList?.records ?? [];
    noticeTotal.value = noticeList?.total ?? 0;
    userTotal.value = userPage?.total ?? 0;
    roleTotal.value = rolePage?.total ?? 0;
    deptTotal.value = deptPage?.total ?? 0;
    onlineTotal.value = onlinePage?.total ?? 0;
    alerts.value = alertPage?.records ?? [];
    lastUpdated.value = dayjs().format('HH:mm:ss');
  } finally {
    refreshing.value = false;
  }
}

async function onRefresh() {
  await Promise.all([loadDashboard(), loadMessages(), onlineUserRef.value?.reload()]);
  window.$message?.success($t('page.home.refreshSuccess'));
}

onMounted(() => {
  void loadDashboard();
  void loadMessages();
});
</script>

<template>
  <div class="min-h-500px flex flex-col gap-16px">
    <HeroBanner
      :profile="profile"
      :last-login-user-agent="sessions[0]?.userAgent || ''"
      :todo-count="todoCount"
      :unread-count="unreadCount"
      :notice-count="noticeTotal"
      :refreshing="refreshing"
      :last-updated="lastUpdated"
      @refresh="onRefresh"
    />
    <ScaleStrip
      :user-count="userTotal"
      :online-count="onlineTotal"
      :role-count="roleTotal"
      :dept-count="deptTotal"
      :notice-count="noticeTotal"
    />
    <NGrid cols="1 l:24" responsive="screen" item-responsive :x-gap="16" :y-gap="16" class="flex-1">
      <NGi span="24 l:14">
        <NoticeBoard :notices="notices" />
      </NGi>
      <NGi span="24 l:10">
        <TodoPanel
          :profile="profile"
          :device-count="activeDeviceCount"
          :unread-count="unreadCount"
          :pending-alert-count="pendingAlerts.length"
        />
      </NGi>
    </NGrid>
    <NGrid cols="1 l:24" responsive="screen" item-responsive :x-gap="16" :y-gap="16" class="flex-1">
      <NGi span="24 l:10">
        <MessagePanel />
      </NGi>
      <NGi span="24 l:7">
        <AlertPanel :alerts="alerts" />
      </NGi>
      <NGi span="24 l:7">
        <OnlineUserPanel ref="onlineUserRef" />
      </NGi>
    </NGrid>
  </div>
</template>

<style scoped></style>
