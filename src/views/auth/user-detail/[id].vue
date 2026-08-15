<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { mockUserDetails } from '@/mock/admin';

interface Props {
  id: string;
}

defineOptions({ name: 'ManageUserDetail' });

const props = defineProps<Props>();
const router = useRouter();
const user = computed(() => mockUserDetails[props.id] ?? mockUserDetails['1']);
const enabled = ref(user.value.status === '正常');
const resetVisible = ref(false);
const resetPassword = ref('');

function goBack() {
  router.push('/manage/user');
}

function toggleStatus() {
  enabled.value = !enabled.value;
  window.$message?.success(enabled.value ? '用户已启用' : '用户已锁定');
}

function confirmReset() {
  if (resetPassword.value.length < 8) {
    window.$message?.warning('临时密码至少需要 8 位');
    return;
  }
  resetVisible.value = false;
  resetPassword.value = '';
  window.$message?.success('临时密码已生成，请通过安全渠道告知用户');
}

function forceLogout() {
  window.$message?.success('已发起强制下线，用户的其它会话将在下一次请求时失效');
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px">
    <div class="flex-y-center justify-between">
      <div>
        <NButton text type="primary" @click="goBack">
          <template #icon><icon-mdi-arrow-left /></template>
          返回用户列表
        </NButton>
        <span class="ml-12px text-18px font-600">用户详情</span>
      </div>
      <NSpace>
        <NButton @click="forceLogout">
          <template #icon><icon-mdi-logout-variant /></template>
          强制下线
        </NButton>
        <NButton type="warning" ghost @click="resetVisible = true">
          <template #icon><icon-mdi-lock-reset /></template>
          重置密码
        </NButton>
        <NButton :type="enabled ? 'error' : 'success'" ghost @click="toggleStatus">
          {{ enabled ? '锁定账号' : '启用账号' }}
        </NButton>
      </NSpace>
    </div>

    <NCard :bordered="false" class="card-wrapper overflow-hidden">
      <div class="relative flex items-center gap-18px lt-sm:flex-col lt-sm:items-start">
        <NAvatar :size="72" round :color="user.avatarColor">{{ user.avatarText }}</NAvatar>
        <div class="flex-1">
          <div class="flex-y-center gap-10px">
            <h2 class="m-0 text-22px font-600">{{ user.nickName }}</h2>
            <NTag :type="enabled ? 'success' : 'error'" round>{{ enabled ? '正常' : '已锁定' }}</NTag>
          </div>
          <div class="mt-8px text-13px text-gray-5">{{ user.userName }} · {{ user.department }} · {{ user.role }}</div>
        </div>
        <div class="rounded-8px bg-primary:8 px-16px py-10px text-13px text-primary">
          <div>最近登录</div>
          <div class="mt-4px font-600">{{ user.lastLoginAt }}</div>
        </div>
      </div>
    </NCard>

    <NGrid cols="1 s:2 l:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi>
        <NCard :bordered="false" class="card-wrapper"><NStatistic label="登录次数" :value="user.loginCount" /></NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper">
          <NStatistic label="操作次数" :value="user.operationCount" />
        </NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper"><NStatistic label="角色" :value="user.role" /></NCard>
      </NGi>
      <NGi>
        <NCard :bordered="false" class="card-wrapper"><NStatistic label="加入时间" :value="user.joinedAt" /></NCard>
      </NGi>
    </NGrid>

    <NGrid cols="1 l:24" responsive="screen" :x-gap="16" :y-gap="16">
      <NGi span="24 l:13">
        <NCard title="基本资料" :bordered="false" class="card-wrapper h-full">
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
      </NGi>
      <NGi span="24 l:11">
        <NCard title="权限概览" :bordered="false" class="card-wrapper h-full">
          <div class="flex flex-wrap gap-8px">
            <NTag v-for="permission in user.permissions" :key="permission" type="info" round>{{ permission }}</NTag>
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
      </NGi>
    </NGrid>

    <NCard title="账号动态" :bordered="false" class="card-wrapper">
      <NTimeline>
        <NTimelineItem
          v-for="item in user.timeline"
          :key="`${item.time}-${item.title}`"
          :type="item.type"
          :time="item.time"
          :title="item.title"
        >
          {{ item.description }}
        </NTimelineItem>
      </NTimeline>
    </NCard>

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
  </div>
</template>

<style scoped></style>
