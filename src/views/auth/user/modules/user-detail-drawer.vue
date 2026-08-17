<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetUserDetail, resetUserPassword, updateUserStatus } from '@/service/api';

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
const enabled = computed(() => user.value.status === '正常');
const resetVisible = ref(false);
const resetPassword = ref('');

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
      department: `部门ID：${data.deptId || '0'}`,
      role: data.userRoles?.join('、') || '未分配',
      email: data.userEmail,
      phone: data.userPhone,
      status: data.status === 1 ? '正常' : '锁定',
      avatarText: (data.nickName || data.userName || '用').slice(0, 1),
      joinedAt: data.createTime,
      lastLoginAt: data.lastLoginAt || '暂无',
      lastLoginIp: data.lastLoginIp || '暂无',
      permissions: data.userRoles || []
    };
  } catch {
    // request errors are surfaced by the request layer
  } finally {
    loading.value = false;
  }
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

function forceLogout() {
  window.$message?.success('已发起强制下线，用户的其它会话将在下一次请求时失效');
}
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="720">
    <NDrawerContent title="用户详情" :native-scrollbar="false" closable>
      <NSpin :show="loading">
        <div class="flex flex-col gap-16px">
          <div class="flex items-center gap-18px">
            <NAvatar :size="64" round :color="user.avatarColor">{{ user.avatarText }}</NAvatar>
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
              <NButton size="small" @click="forceLogout">
                <template #icon><icon-mdi-logout-variant /></template>
                强制下线
              </NButton>
              <NButton size="small" type="warning" ghost @click="resetVisible = true">
                <template #icon><icon-mdi-lock-reset /></template>
                重置密码
              </NButton>
              <NButton size="small" :type="enabled ? 'error' : 'success'" ghost @click="toggleStatus">
                {{ enabled ? '锁定账号' : '启用账号' }}
              </NButton>
            </NSpace>
          </div>

          <NGrid cols="2 s:4" responsive="screen" :x-gap="12" :y-gap="12" class="stat-grid">
            <NGi>
              <NCard :bordered="false" size="small" class="card-wrapper">
                <NStatistic label="登录次数" :value="user.loginCount" />
              </NCard>
            </NGi>
            <NGi>
              <NCard :bordered="false" size="small" class="card-wrapper">
                <NStatistic label="操作次数" :value="user.operationCount" />
              </NCard>
            </NGi>
            <NGi>
              <NCard :bordered="false" size="small" class="card-wrapper">
                <NStatistic label="角色" :value="user.role" />
              </NCard>
            </NGi>
            <NGi>
              <NCard :bordered="false" size="small" class="card-wrapper">
                <NStatistic label="加入时间" :value="user.joinedAt" />
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
            </div>
            <NDivider />
            <div class="flex-y-center justify-between text-13px">
              <span class="text-gray-5">数据范围</span>
              <span>本部门及下属部门</span>
            </div>
            <div class="mt-12px flex-y-center justify-between text-13px">
              <span class="text-gray-5">多因素认证</span>
              <NTag type="warning" size="small">未启用</NTag>
            </div>
            <div class="mt-12px flex-y-center justify-between text-13px">
              <span class="text-gray-5">账号有效期</span>
              <span>长期有效</span>
            </div>
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

<style scoped>
/* 抽屉内统计卡片紧凑字号：NStatistic 默认 24px 值在长文本（角色、时间）下失衡，且该组件无 label/value-style props */
.stat-grid :deep(.n-statistic__label) {
  font-size: 12px;
}

.stat-grid :deep(.n-statistic-value) {
  font-size: 16px;
}
</style>
