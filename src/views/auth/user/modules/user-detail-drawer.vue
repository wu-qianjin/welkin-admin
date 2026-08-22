<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  fetchGetLoginLogList,
  fetchGetOperateLogList,
  fetchGetUserDetail,
  resetUserPassword,
  revokeUserSessions,
  updateUserStatus
} from '@/service/api';
import { formatDateTime } from '@/utils/common';

defineOptions({
  name: 'UserDetailDrawer'
});

interface Props {
  /** the user id to display */
  userId?: string | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'updated'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type DetailView = {
  id: string;
  userName: string;
  nickName: string;
  avatar: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  status: '正常' | '锁定';
  avatarText: string;
  avatarColor: string;
  joinedAt: string;
  lastLoginAt: string;
  lastLoginIp: string;
  loginCount: number;
  operationCount: number;
  permissions: string[];
  timeline: Array<{ title: string; time: string; description: string; type: 'success' | 'info' | 'warning' }>;
};

const user = ref<DetailView>(createEmptyDetail());

function createEmptyDetail(): DetailView {
  return {
    id: '',
    userName: '',
    nickName: '',
    avatar: '',
    department: '未分配（部门ID：0）',
    role: '未分配',
    email: '',
    phone: '',
    status: '正常',
    avatarText: '用',
    avatarColor: '#4f46e5',
    joinedAt: '',
    lastLoginAt: '暂无',
    lastLoginIp: '暂无',
    loginCount: 0,
    operationCount: 0,
    permissions: [],
    timeline: []
  };
}

const loading = ref(false);
const logoutLoading = ref(false);
const enabled = computed(() => user.value.status === '正常');
const resetVisible = ref(false);
const resetPassword = ref('');

const stats = computed(() => [
  { label: '登录次数', value: String(user.value.loginCount) },
  { label: '操作次数', value: String(user.value.operationCount) },
  { label: '角色', value: user.value.role },
  { label: '加入时间', value: user.value.joinedAt || '-', nowrap: true }
]);

async function loadUser() {
  if (!props.userId) return;
  loading.value = true;
  try {
    const data = await fetchGetUserDetail(props.userId);
    user.value = {
      ...user.value,
      id: data.id,
      userName: data.userName,
      nickName: data.nickName,
      avatar: data.avatar || '',
      department: `部门ID：${data.deptId || '0'}`,
      role: data.userRoles?.join('、') || '未分配',
      email: data.userEmail,
      phone: data.userPhone,
      status: data.status === 1 ? '正常' : '锁定',
      avatarText: (data.nickName || data.userName || '用').slice(0, 1),
      joinedAt: formatDateTime(data.createTime),
      lastLoginAt: data.lastLoginAt ? formatDateTime(data.lastLoginAt) : '暂无',
      lastLoginIp: data.lastLoginIp || '暂无',
      permissions: data.userRoles || []
    };
    await loadActivityStats(data.userName);
  } catch {
    // request errors are surfaced by the request layer
  } finally {
    loading.value = false;
  }
}

/** 登录/操作次数与最近登录时间线来自审计日志（按用户名过滤），失败不阻塞详情展示 */
async function loadActivityStats(userName: string) {
  const [loginPage, operatePage] = await Promise.all([
    fetchGetLoginLogList({ userName, current: 1, size: 5 }).catch(() => null),
    fetchGetOperateLogList({ userName, current: 1, size: 1 }).catch(() => null)
  ]);

  user.value.loginCount = loginPage?.total ?? 0;
  user.value.operationCount = operatePage?.total ?? 0;
  user.value.timeline = (loginPage?.records ?? []).map(item => ({
    title: item.status === '1' ? '登录成功' : '登录失败',
    time: item.loginTime,
    description: `${item.ipaddr || '-'}${item.msg ? ` · ${item.msg}` : ''}`,
    type: item.status === '1' ? 'success' : 'warning'
  }));
}

watch(visible, value => {
  if (value) {
    user.value = createEmptyDetail();
    resetVisible.value = false;
    resetPassword.value = '';
    loadUser();
  }
});

async function toggleStatus() {
  if (!user.value.id) return;
  const nextStatus = enabled.value ? 0 : 1;
  await updateUserStatus(user.value.id, nextStatus);
  user.value.status = nextStatus === 1 ? '正常' : '锁定';
  window.$message?.success(nextStatus === 1 ? '用户已启用' : '用户已锁定');
  emit('updated');
}

async function confirmReset() {
  if (resetPassword.value.length < 8) {
    window.$message?.warning('临时密码至少需要 8 位');
    return;
  }
  await resetUserPassword(user.value.id, resetPassword.value);
  resetVisible.value = false;
  resetPassword.value = '';
  window.$message?.success('临时密码已生成，请通过安全渠道告知用户');
}

async function forceLogout() {
  if (!user.value.id) return;
  logoutLoading.value = true;
  try {
    await revokeUserSessions(user.value.id);
    window.$message?.success('已强制下线该用户的全部会话，其令牌将在下一次请求时失效');
  } catch {
    // request errors are surfaced by the request layer
  } finally {
    logoutLoading.value = false;
  }
}
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="720">
    <NDrawerContent title="用户详情" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div class="flex flex-col gap-16px">
          <div class="flex items-center gap-18px">
            <AuthAvatar :path="user.avatar" :text="user.avatarText" :color="user.avatarColor" :size="64" />
            <div class="min-w-0 flex-1">
              <div class="flex-y-center gap-10px">
                <span class="text-20px font-600">{{ user.nickName }}</span>
                <NTag :type="enabled ? 'success' : 'error'" round size="small">{{ enabled ? '正常' : '已锁定' }}</NTag>
              </div>
              <div class="mt-6px truncate text-13px text-gray-5">
                {{ user.userName }} · {{ user.department }} · {{ user.role }}
              </div>
              <div class="text-13px text-gray-4">最近登录：{{ user.lastLoginAt }}（IP：{{ user.lastLoginIp }}）</div>
            </div>
            <NSpace size="small">
              <NPopconfirm @positive-click="forceLogout">
                <template #trigger>
                  <NButton size="small" :loading="logoutLoading">
                    <template #icon><icon-mdi-logout-variant /></template>
                    强制下线
                  </NButton>
                </template>
                确定强制下线该用户的全部会话？
              </NPopconfirm>
              <NButton size="small" type="warning" ghost @click="resetVisible = true">
                <template #icon><icon-mdi-lock-reset /></template>
                重置密码
              </NButton>
              <NButton size="small" :type="enabled ? 'error' : 'success'" ghost @click="toggleStatus">
                {{ enabled ? '锁定账号' : '启用账号' }}
              </NButton>
            </NSpace>
          </div>

          <NGrid cols="2 s:4" responsive="screen" :x-gap="12" :y-gap="12">
            <NGi v-for="stat in stats" :key="stat.label">
              <NCard :bordered="false" size="small" class="card-wrapper">
                <div class="flex flex-col gap-4px">
                  <span class="text-12px text-gray-5">{{ stat.label }}</span>
                  <span class="text-14px" :class="stat.nowrap ? 'whitespace-nowrap text-13px' : 'break-all'">
                    {{ stat.value }}
                  </span>
                </div>
              </NCard>
            </NGi>
          </NGrid>

          <NCard title="基本资料" :bordered="false" size="small" class="card-wrapper">
            <NDescriptions bordered label-placement="left" :column="2" size="small">
              <NDescriptionsItem label="登录账号">{{ user.userName }}</NDescriptionsItem>
              <NDescriptionsItem label="显示名称">{{ user.nickName }}</NDescriptionsItem>
              <NDescriptionsItem label="所属部门">{{ user.department }}</NDescriptionsItem>
              <NDescriptionsItem label="角色">{{ user.role }}</NDescriptionsItem>
              <NDescriptionsItem label="手机号">{{ user.phone }}</NDescriptionsItem>
              <NDescriptionsItem label="邮箱">{{ user.email }}</NDescriptionsItem>
              <NDescriptionsItem label="注册时间">{{ user.joinedAt }}</NDescriptionsItem>
              <NDescriptionsItem label="最近登录 IP">{{ user.lastLoginIp }}</NDescriptionsItem>
            </NDescriptions>
          </NCard>

          <NCard title="权限概览" :bordered="false" size="small" class="card-wrapper">
            <div class="flex flex-wrap gap-8px">
              <NTag v-for="permission in user.permissions" :key="permission" type="info" round size="small">
                {{ permission }}
              </NTag>
              <NEmpty v-if="!user.permissions.length" size="small" description="未分配角色" />
            </div>
          </NCard>

          <NCard title="最近登录记录" :bordered="false" size="small" class="card-wrapper">
            <NTimeline v-if="user.timeline.length">
              <NTimelineItem
                v-for="(item, index) in user.timeline"
                :key="index"
                :type="item.type"
                :title="item.title"
                :content="item.description"
                :time="item.time"
              />
            </NTimeline>
            <NEmpty v-else size="small" description="暂无登录记录" />
          </NCard>
        </div>
      </NSpin>

      <NModal v-model:show="resetVisible" preset="card" title="重置用户密码" class="w-480px">
        <NAlert type="warning" class="mb-16px">重置后原密码立即失效，请通过安全渠道告知用户临时密码。</NAlert>
        <NForm label-placement="left" label-width="90">
          <NFormItem label="临时密码">
            <NInput v-model:value="resetPassword" type="password" show-password-on="click" placeholder="至少 8 位" />
          </NFormItem>
        </NForm>
        <template #footer>
          <NSpace justify="end">
            <NButton @click="resetVisible = false">取消</NButton>
            <NButton type="warning" @click="confirmReset">确认重置</NButton>
          </NSpace>
        </template>
      </NModal>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
