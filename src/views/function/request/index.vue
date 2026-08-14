<script setup lang="ts">
import { fetchCustomBackendError } from '@/service/api';
import { $t } from '@/locales';

async function logout() {
  try {
    await fetchCustomBackendError('8888', $t('request.logoutMsg'));
  } catch {
    // expected: the global request layer shows the message / handles logout
  }
}

async function logoutWithModal() {
  try {
    await fetchCustomBackendError('7777', $t('request.logoutWithModalMsg'));
  } catch {
    // expected: the global request layer shows the modal
  }
}

async function refreshToken() {
  try {
    await fetchCustomBackendError('9999', $t('request.tokenExpired'));
  } catch {
    // expected: the global request layer refreshes the token and retries
  }
}

async function handleRepeatedMessageError() {
  try {
    await Promise.all([
      fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
      fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
      fetchCustomBackendError('2222', $t('page.function.request.repeatedErrorMsg1')),
      fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2')),
      fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2')),
      fetchCustomBackendError('3333', $t('page.function.request.repeatedErrorMsg2'))
    ]);
  } catch {
    // expected: identical messages are deduplicated by the request layer
  }
}

async function handleRepeatedModalError() {
  try {
    await Promise.all([
      fetchCustomBackendError('7777', $t('request.logoutWithModalMsg')),
      fetchCustomBackendError('7777', $t('request.logoutWithModalMsg')),
      fetchCustomBackendError('7777', $t('request.logoutWithModalMsg'))
    ]);
  } catch {
    // expected: identical modals are deduplicated by the request layer
  }
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard :title="$t('request.logout')" :bordered="false" size="small" segmented class="card-wrapper">
      <NButton @click="logout">{{ $t('common.trigger') }}</NButton>
    </NCard>
    <NCard :title="$t('request.logoutWithModal')" :bordered="false" size="small" segmented class="card-wrapper">
      <NButton @click="logoutWithModal">{{ $t('common.trigger') }}</NButton>
    </NCard>
    <NCard :title="$t('request.refreshToken')" :bordered="false" size="small" segmented class="card-wrapper">
      <NButton @click="refreshToken">{{ $t('common.trigger') }}</NButton>
    </NCard>
    <NCard
      :title="$t('page.function.request.repeatedErrorOccurOnce')"
      :bordered="false"
      size="small"
      segmented
      class="card-wrapper"
    >
      <NButton @click="handleRepeatedMessageError">{{ $t('page.function.request.repeatedError') }}(Message)</NButton>
      <NButton class="ml-12px" @click="handleRepeatedModalError">
        {{ $t('page.function.request.repeatedError') }}(Modal)
      </NButton>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
