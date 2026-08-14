<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { loginModuleRecord } from '@/constants/app';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  userName: string;
  password: string;
}

interface Account {
  key: AccountKey;
  label: string;
  userName: string;
  password: string;
}

type AccountKey = 'super' | 'admin' | 'user';

const accounts = computed<Account[]>(() => [
  {
    key: 'super',
    label: $t('page.login.pwdLogin.superAdmin'),
    userName: 'Super',
    password: '123456'
  },
  {
    key: 'admin',
    label: $t('page.login.pwdLogin.admin'),
    userName: 'Admin',
    password: '123456'
  },
  {
    key: 'user',
    label: $t('page.login.pwdLogin.user'),
    userName: 'User',
    password: '123456'
  }
]);

const accountOptions = computed(() => accounts.value.map(item => ({ label: item.label, value: item.key })));

const model: FormModel = reactive({
  userName: 'Super',
  password: '123456'
});

const selectedAccount = ref<AccountKey>('super');

watch(selectedAccount, key => {
  const acc = accounts.value.find(a => a.key === key);
  if (acc) {
    model.userName = acc.userName;
    model.password = acc.password;
  }
});

const remember = ref(true);

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  // inside computed to make locale reactive, if not apply i18n, you can define it without computed
  const { formRules } = useFormRules();

  return {
    userName: formRules.userName,
    password: formRules.pwd
  };
});

const SLIDER_THUMB_WIDTH = 40;

const sliderTrackRef = ref<HTMLElement | null>(null);
const sliderVerified = ref(false);
const sliderDragging = ref(false);
const sliderX = ref(0);

let sliderDragStartX = 0;

function getSliderMaxX() {
  const trackWidth = sliderTrackRef.value?.offsetWidth ?? 0;
  return Math.max(0, trackWidth - SLIDER_THUMB_WIDTH);
}

function handleSliderPointerDown(event: PointerEvent) {
  if (sliderVerified.value) return;

  sliderDragging.value = true;
  sliderDragStartX = event.clientX - sliderX.value;

  try {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  } catch {
    // pointer capture is unavailable (e.g. synthetic events), still allow dragging
  }
}

function handleSliderPointerMove(event: PointerEvent) {
  if (!sliderDragging.value) return;

  const maxX = getSliderMaxX();
  sliderX.value = Math.min(Math.max(0, event.clientX - sliderDragStartX), maxX);
}

function handleSliderPointerUp() {
  if (!sliderDragging.value) return;

  sliderDragging.value = false;

  if (sliderX.value >= getSliderMaxX() - 2) {
    sliderX.value = getSliderMaxX();
    sliderVerified.value = true;
  } else {
    sliderX.value = 0;
  }
}

async function handleSubmit() {
  await validate();

  if (!sliderVerified.value) {
    window.$message?.warning($t('page.login.pwdLogin.sliderRequired'));
    return;
  }

  await authStore.login(model.userName, model.password);
}

function handlePhoneLogin() {
  toggleLoginModule('code-login');
}
</script>

<template>
  <div class="login-pwd">
    <header class="login-pwd__header">
      <h2 class="login-pwd__title">{{ $t('page.login.common.welcome') }}</h2>
      <p class="login-pwd__desc">{{ $t('page.login.common.welcomeDesc') }}</p>
    </header>

    <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
      <NFormItem>
        <NSelect v-model:value="selectedAccount" :options="accountOptions" :consistent-menu-width="false" />
      </NFormItem>

      <NFormItem path="userName">
        <NInput v-model:value="model.userName" :placeholder="$t('page.login.common.userNamePlaceholder')" />
      </NFormItem>

      <NFormItem path="password">
        <NInput
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </NFormItem>

      <NFormItem :show-feedback="false">
        <div
          ref="sliderTrackRef"
          class="login-pwd__slider"
          :class="{ 'is-dragging': sliderDragging, 'is-verified': sliderVerified }"
        >
          <div class="login-pwd__slider-fill" :style="{ width: `${sliderX + SLIDER_THUMB_WIDTH}px` }" />
          <div
            class="login-pwd__slider-thumb"
            :style="{ transform: `translateX(${sliderX}px)` }"
            @pointerdown="handleSliderPointerDown"
            @pointermove="handleSliderPointerMove"
            @pointerup="handleSliderPointerUp"
            @pointercancel="handleSliderPointerUp"
          >
            <span v-if="sliderVerified" class="login-pwd__slider-check text-16px">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </span>
            <template v-else>»</template>
          </div>
          <span class="login-pwd__slider-hint">
            {{ sliderVerified ? $t('page.login.pwdLogin.sliderSuccess') : $t('page.login.pwdLogin.sliderHint') }}
          </span>
        </div>
      </NFormItem>

      <div class="login-pwd__row flex-y-center justify-between">
        <NCheckbox v-model:checked="remember">{{ $t('page.login.pwdLogin.rememberMe') }}</NCheckbox>
        <NButton quaternary type="primary" @click="toggleLoginModule('reset-pwd')">
          {{ $t('page.login.pwdLogin.forgetPassword') }}
        </NButton>
      </div>

      <NButton
        type="primary"
        size="large"
        round
        block
        :loading="authStore.loginLoading"
        class="mt-12px"
        @click="handleSubmit"
      >
        {{ $t(loginModuleRecord['pwd-login']) }}
      </NButton>

      <div class="login-pwd__pair flex gap-12px mt-12px">
        <NButton class="flex-1" size="large" block @click="handlePhoneLogin">
          {{ $t('page.login.pwdLogin.phoneLogin') }}
        </NButton>
        <NButton class="flex-1" size="large" block @click="toggleLoginModule('bind-wechat')">
          {{ $t('page.login.pwdLogin.scanLogin') }}
        </NButton>
      </div>

      <NDivider class="login-pwd__divider !m-12px text-12px">
        {{ $t('page.login.pwdLogin.otherLoginMode') }}
      </NDivider>

      <div class="login-pwd__social flex-center gap-16px">
        <button class="login-pwd__social-btn" type="button" :title="$t('page.login.pwdLogin.wechat')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="#07C160"
              d="M8.69 4C5.05 4 2 6.46 2 9.6c0 1.74 1 3.27 2.55 4.32l-.45 1.6 1.95-.97c.81.18 1.67.27 2.56.27.27 0 .54-.01.8-.04-.18-.55-.28-1.13-.28-1.73 0-3.13 3.04-5.65 6.8-5.65.13 0 .27 0 .4.01C15.7 5.18 12.5 4 8.69 4zm-2.7 2.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm5.4 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM21.97 13.05c0-2.65-2.6-4.8-5.8-4.8s-5.8 2.15-5.8 4.8c0 2.66 2.6 4.81 5.8 4.81.69 0 1.36-.1 1.98-.27l1.6.83-.4-1.43c1.6-.88 2.62-2.36 2.62-3.94zm-7.7-1.2a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm3.85 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"
            />
          </svg>
        </button>
        <button class="login-pwd__social-btn" type="button" :title="$t('page.login.pwdLogin.qq')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="#12B7F5"
              d="M21.5 14.4c-.6-1.5-1.7-2.6-3.1-3.2.4-1 .6-2 .6-3 0-3.8-3.1-6.9-7-6.9S5 4.4 5 8.2c0 1 .2 2 .6 3-1.4.6-2.5 1.7-3.1 3.2-.5 1.4-.4 2.9.2 4.2.5 1 1.3 1.8 2.3 2.2 0 .1 0 .2 0 .3 0 1 .8 1.8 1.8 1.8.7 0 1.4-.4 1.7-1.1.7.2 1.4.3 2.2.3h.6c.8 0 1.5-.1 2.2-.3.3.7 1 1.1 1.7 1.1 1 0 1.8-.8 1.8-1.8 0-.1 0-.2 0-.3 1-.4 1.8-1.2 2.3-2.2.6-1.3.7-2.8.2-4.2zM9.7 7.1c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2zm4.6 0c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2.5-1.2 1.2-1.2z"
            />
          </svg>
        </button>
        <button class="login-pwd__social-btn" type="button" :title="$t('page.login.pwdLogin.github')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="#171515"
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.74.4-1.26.73-1.55-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17a11 11 0 0 1 5.74 0c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.7 5.36-5.26 5.65.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
            />
          </svg>
        </button>
        <button class="login-pwd__social-btn" type="button" :title="$t('page.login.pwdLogin.google')">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.07-1.6-.2-2.3H12v4.4h6.5c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.52-5.17 3.52-8.72z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.88-3c-1.07.73-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A11.99 11.99 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29c-.24-.73-.38-1.5-.38-2.29s.14-1.56.38-2.29V6.6H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.6l4 3.1C6.22 6.88 8.87 4.77 12 4.77z"
            />
          </svg>
        </button>
      </div>

      <div class="login-pwd__footer flex-center mt-16px gap-6px">
        <span class="text-13px text-#666">{{ $t('page.login.pwdLogin.noAccount') }}</span>
        <NButton quaternary type="primary" @click="toggleLoginModule('register')">
          {{ $t('page.login.pwdLogin.createAccount') }}
        </NButton>
      </div>
    </NForm>
  </div>
</template>

<style scoped>
.login-pwd {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-pwd__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}

.login-pwd__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.3;
}

.login-pwd__desc {
  font-size: 13px;
  color: #666;
}

.login-pwd__row {
  margin-bottom: 4px;
}

.login-pwd__slider {
  position: relative;
  width: 100%;
  height: 38px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  user-select: none;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.login-pwd__slider.is-verified {
  border-color: rgb(var(--success-color));
  background-color: #e8f7ef;
}

.login-pwd__slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background-color: rgb(var(--primary-color));
  opacity: 0.16;
  transition: width 0.3s ease;
}

.login-pwd__slider.is-dragging .login-pwd__slider-fill {
  transition: none;
}

.login-pwd__slider.is-verified .login-pwd__slider-fill {
  background-color: rgb(var(--success-color));
  opacity: 0.15;
}

.login-pwd__slider-thumb {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-right: 1px solid #e5e5e5;
  border-radius: 4px 0 0 4px;
  color: #999;
  font-size: 18px;
  cursor: grab;
  touch-action: none;
  will-change: transform;
  transition:
    transform 0.3s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.login-pwd__slider.is-dragging .login-pwd__slider-thumb {
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  background-color: rgb(var(--primary-color));
  border-right-color: transparent;
  color: #fff;
}

.login-pwd__slider:not(.is-dragging) .login-pwd__slider-thumb {
  transition:
    transform 0.3s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.login-pwd__slider-thumb:active {
  cursor: grabbing;
}

.login-pwd__slider.is-verified .login-pwd__slider-thumb {
  border-right-color: transparent;
  background-color: rgb(var(--success-color));
  color: #fff;
  cursor: default;
}

.login-pwd__slider-check {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-pwd__slider-hint {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #999;
  transition: color 0.3s ease;
}

.login-pwd__slider.is-verified .login-pwd__slider-hint {
  color: rgb(var(--success-color));
}

.login-pwd__divider {
  color: #999;
}

.login-pwd__social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.login-pwd__social-btn:hover {
  transform: scale(1.1);
}

.login-pwd__footer {
  font-size: 13px;
}
</style>
