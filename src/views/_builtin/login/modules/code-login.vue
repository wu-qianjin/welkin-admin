<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';

defineOptions({
  name: 'CodeLogin'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

interface FormModel {
  phone: string;
  code: string;
}

const model: FormModel = reactive({
  phone: '',
  code: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules } = useFormRules();

  return {
    phone: formRules.phone,
    code: formRules.code
  };
});

async function handleSubmit() {
  await validate();

  await authStore.loginByPhone(model.phone, model.code);
}
</script>

<template>
  <div class="login-code">
    <header class="login-code__header">
      <h2 class="login-code__title">{{ $t('page.login.codeLogin.title') }}</h2>
      <p class="login-code__desc">{{ $t('page.login.common.welcomeDesc') }}</p>
    </header>

    <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
      <NFormItem path="phone">
        <NInput v-model:value="model.phone" :placeholder="$t('page.login.common.phonePlaceholder')" />
      </NFormItem>
      <NFormItem path="code">
        <div class="w-full flex-y-center gap-12px">
          <NInput v-model:value="model.code" :placeholder="$t('page.login.common.codePlaceholder')" />
          <NButton size="large" :disabled="isCounting" :loading="loading" @click="getCaptcha(model.phone)">
            {{ label }}
          </NButton>
        </div>
      </NFormItem>

      <NButton
        type="primary"
        size="large"
        round
        block
        class="mt-12px"
        :loading="authStore.loginLoading"
        @click="handleSubmit"
      >
        {{ $t('page.login.common.codeLogin') }}
      </NButton>

      <NButton size="large" round block class="mt-12px" @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NForm>
  </div>
</template>

<style scoped>
.login-code {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-code__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}

.login-code__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.3;
}

.login-code__desc {
  font-size: 13px;
  color: #666;
}
</style>
