<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { mockCurrentUser, mockLoginDevices, mockNoticeFeed } from '@/mock/admin';

defineOptions({
  name: 'UserCenter'
});

const router = useRouter();
const profile = reactive({ ...mockCurrentUser });
const devices = ref(mockLoginDevices.map(item => ({ ...item })));
const notices = ref(mockNoticeFeed.map(item => ({ ...item })));
const profileVisible = ref(false);
const passwordVisible = ref(false);
const profileForm = reactive({ nickName: profile.nickName, phone: profile.phone, email: profile.email });
const passwordForm = reactive({ current: '', next: '', confirm: '' });

const unreadCount = computed(() => notices.value.filter(item => !item.read).length);
const securityScore = computed(() => {
  let score = 60;
  if (profile.email) score += 15;
  if (profile.phone) score += 15;
  if (devices.value.length <= 3) score += 10;
  return score;
});

function openProfile() {
  Object.assign(profileForm, { nickName: profile.nickName, phone: profile.phone, email: profile.email });
  profileVisible.value = true;
}

function saveProfile() {
  Object.assign(profile, profileForm);
  profileVisible.value = false;
  window.$message?.success('个人资料已保存');
}

function savePassword() {
  if (!passwordForm.current || passwordForm.next.length < 8 || passwordForm.next !== passwordForm.confirm) {
    window.$message?.warning('请检查密码：新密码至少 8 位且两次输入一致');
    return;
  }

  Object.assign(passwordForm, { current: '', next: '', confirm: '' });
  passwordVisible.value = false;
  window.$message?.success('密码修改成功');
}

function removeDevice(id: number) {
  devices.value = devices.value.filter(item => item.id !== id);
  window.$message?.success('设备已下线');
}

function markNoticeRead(id: number) {
  const notice = notices.value.find(item => item.id === id);
  if (notice) notice.read = true;
}

function goMessageCenter() {
  router.push('/message');
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <NCard :bordered="false" class="card-wrapper overflow-hidden">
      <div class="relative flex items-center gap-20px lt-sm:flex-col lt-sm:items-start">
        <div class="absolute right-0 top-0 size-180px rounded-full bg-primary:8 blur-2xl" />
        <NAvatar :size="76" round :color="profile.avatarColor">{{ profile.avatarText }}</NAvatar>
        <div class="relative flex-1">
          <div class="flex-y-center gap-10px">
            <h2 class="m-0 text-22px font-600">{{ profile.nickName }}</h2>
            <NTag type="success" round size="small">{{ profile.role }}</NTag>
          </div>
          <div class="mt-8px flex flex-wrap gap-x-20px gap-y-6px text-13px text-gray-5">
            <span>
              <icon-mdi-account-outline class="mr-4px" />
              {{ profile.userName }}
            </span>
            <span>
              <icon-mdi-office-building-outline class="mr-4px" />
              {{ profile.department }}
            </span>
            <span>
              <icon-mdi-calendar-outline class="mr-4px" />
              加入于 {{ profile.joinedAt }}
            </span>
          </div>
        </div>
        <NSpace class="relative" :size="10">
          <NButton secondary @click="openProfile">
            <template #icon><icon-mdi-account-edit-outline /></template>
            编辑资料
          </NButton>
          <NButton type="primary" @click="goMessageCenter">
            <template #icon><icon-mdi-bell-outline /></template>
            消息中心
            <NBadge v-if="unreadCount" :value="unreadCount" :max="99" class="ml-6px" />
          </NButton>
        </NSpace>
      </div>
    </NCard>

    <NGrid cols="1 s:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi>
        <NCard :bordered="false" class="card-wrapper h-full">
          <NStatistic label="账号状态" value="正常">
            <template #prefix><icon-mdi-check-decagram-outline class="text-success" /></template>
          </NStatistic>
          <div class="mt-12px text-12px text-gray-5">已启用，最近无异常登录</div>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper h-full">
          <NStatistic label="安全评分" :value="securityScore" suffix="分">
            <template #prefix><icon-mdi-shield-check-outline class="text-primary" /></template>
          </NStatistic>
          <NProgress class="mt-10px" :percentage="securityScore" :show-indicator="false" status="success" />
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper h-full">
          <NStatistic label="登录次数" :value="1284">
            <template #prefix><icon-mdi-login class="text-info" /></template>
          </NStatistic>
          <div class="mt-12px text-12px text-gray-5">较上月增加 12.6%</div>
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper h-full">
          <NStatistic label="未读消息" :value="unreadCount">
            <template #prefix><icon-mdi-email-outline class="text-warning" /></template>
          </NStatistic>
          <div class="mt-12px text-12px text-gray-5">公告、系统通知和版本更新</div>
        </NCard>
      </NGi>
    </NGrid>

    <NGrid cols="1 l:24" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi span="24 l:14">
        <NCard title="账户信息" :bordered="false" class="card-wrapper h-full">
          <NDescriptions label-placement="left" bordered :column="2" size="small">
            <NDescriptionsItem label="登录账号">{{ profile.userName }}</NDescriptionsItem>
            <NDescriptionsItem label="所属部门">{{ profile.department }}</NDescriptionsItem>
            <NDescriptionsItem label="邮箱">{{ profile.email }}</NDescriptionsItem>
            <NDescriptionsItem label="手机号">{{ profile.phone }}</NDescriptionsItem>
            <NDescriptionsItem label="上次登录">{{ profile.lastLoginAt }}</NDescriptionsItem>
            <NDescriptionsItem label="登录 IP">{{ profile.lastLoginIp }}</NDescriptionsItem>
          </NDescriptions>
          <NSpace class="mt-16px">
            <NButton type="primary" ghost @click="openProfile">编辑个人资料</NButton>
            <NButton @click="passwordVisible = true">修改密码</NButton>
          </NSpace>
        </NCard>
      </NGi>
      <NGi span="24 l:10">
        <NCard title="最近登录" :bordered="false" class="card-wrapper h-full">
          <NTimeline>
            <NTimelineItem type="success" :time="profile.lastLoginAt" title="登录成功">
              Chrome / Windows 11 · {{ profile.lastLoginIp }}
            </NTimelineItem>
            <NTimelineItem type="info" time="2026-08-14 18:12:44" title="登录成功">
              Safari / macOS · 192.168.10.36
            </NTimelineItem>
            <NTimelineItem type="warning" time="2026-08-13 09:03:10" title="登录失败">
              密码错误，第 1 次失败
            </NTimelineItem>
          </NTimeline>
        </NCard>
      </NGi>
    </NGrid>

    <NCard title="登录设备" :bordered="false" class="card-wrapper">
      <template #header-extra><span class="text-12px text-gray-5">仅保留你认识的设备</span></template>
      <NList hoverable>
        <NListItem v-for="device in devices" :key="device.id">
          <div class="flex-y-center gap-12px lt-sm:items-start">
            <div class="size-36px flex-center rounded-8px bg-primary:10 text-primary">
              <icon-mdi-cellphone-link v-if="device.device.includes('iPhone')" class="text-20px" />
              <icon-mdi-laptop v-else class="text-20px" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex-y-center gap-8px">
                <span class="font-500">{{ device.device }}</span>
                <NTag v-if="device.current" type="success" size="small" round>当前设备</NTag>
              </div>
              <div class="mt-4px text-12px text-gray-5">
                {{ device.ip }} · {{ device.location }} · {{ device.lastActive }}
              </div>
            </div>
            <NButton v-if="!device.current" size="small" quaternary type="error" @click="removeDevice(device.id)">
              下线
            </NButton>
          </div>
        </NListItem>
      </NList>
    </NCard>

    <NCard title="待处理消息" :bordered="false" class="card-wrapper">
      <template #header-extra><NButton text type="primary" @click="goMessageCenter">查看全部</NButton></template>
      <NList hoverable>
        <NListItem
          v-for="notice in notices.slice(0, 3)"
          :key="notice.id"
          class="cursor-pointer"
          @click="markNoticeRead(notice.id)"
        >
          <div class="flex-y-center gap-12px">
            <span class="size-8px shrink-0 rounded-full" :class="notice.read ? 'bg-gray-3' : 'bg-primary'" />
            <div class="min-w-0 flex-1">
              <div class="truncate font-500">{{ notice.title }}</div>
              <div class="mt-4px truncate text-12px text-gray-5">{{ notice.summary }}</div>
            </div>
            <span class="shrink-0 text-12px text-gray-4">{{ notice.publishAt }}</span>
          </div>
        </NListItem>
      </NList>
    </NCard>

    <NModal v-model:show="profileVisible" preset="card" title="编辑个人资料" class="w-520px">
      <NForm :model="profileForm" label-placement="left" label-width="80">
        <NFormItem label="昵称"><NInput v-model:value="profileForm.nickName" /></NFormItem>
        <NFormItem label="手机号"><NInput v-model:value="profileForm.phone" /></NFormItem>
        <NFormItem label="邮箱"><NInput v-model:value="profileForm.email" /></NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="profileVisible = false">取消</NButton>
          <NButton type="primary" @click="saveProfile">保存</NButton>
        </NSpace>
      </template>
    </NModal>

    <NModal v-model:show="passwordVisible" preset="card" title="修改密码" class="w-520px">
      <NAlert type="info" class="mb-16px">建议使用 8 位以上，包含大小写字母、数字和特殊字符的密码。</NAlert>
      <NForm :model="passwordForm" label-placement="left" label-width="90">
        <NFormItem label="当前密码">
          <NInput v-model:value="passwordForm.current" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem label="新密码">
          <NInput v-model:value="passwordForm.next" type="password" show-password-on="click" />
        </NFormItem>
        <NFormItem label="确认密码">
          <NInput v-model:value="passwordForm.confirm" type="password" show-password-on="click" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="passwordVisible = false">取消</NButton>
          <NButton type="primary" @click="savePassword">确认修改</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.text-success {
  color: #16a34a;
}
.text-info {
  color: #2563eb;
}
.text-warning {
  color: #d97706;
}
</style>
