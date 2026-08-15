<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { fetchRegister } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { useCaptcha } from '@/hooks/business/captcha';
import { $t } from '@/locales';

defineOptions({
  name: 'Register'
});

const { toggleLoginModule } = useRouterPush();
const { formRef, validate } = useNaiveForm();
const { label, isCounting, loading, getCaptcha } = useCaptcha();

const submitting = ref(false);

interface FormModel {
  phone: string;
  code: string;
  password: string;
  confirmPassword: string;
}

const model: FormModel = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
});

const rules = computed<Record<keyof FormModel, App.Global.FormRule[]>>(() => {
  const { formRules, createConfirmPwdRule } = useFormRules();

  return {
    phone: formRules.phone,
    code: formRules.code,
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.password)
  };
});

async function handleSubmit() {
  await validate();

  submitting.value = true;
  try {
    await fetchRegister({ phone: model.phone, password: model.password });
    window.$message?.success($t('page.login.register.success'));
    toggleLoginModule('pwd-login');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-register">
    <header class="login-register__header">
      <h2 class="login-register__title">{{ $t('page.login.register.title') }}</h2>
      <p class="login-register__desc">{{ $t('page.login.common.welcomeDesc') }}</p>
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
      <NFormItem path="password">
        <NInput
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </NFormItem>
      <NFormItem path="confirmPassword">
        <NInput
          v-model:value="model.confirmPassword"
          type="password"
          show-password-on="click"
          :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
        />
      </NFormItem>

      <NButton type="primary" size="large" round block class="mt-12px" :loading="submitting" @click="handleSubmit">
        {{ $t('page.login.register.title') }}
      </NButton>

      <NButton size="large" round block class="mt-12px" @click="toggleLoginModule('pwd-login')">
        {{ $t('page.login.common.back') }}
      </NButton>
    </NForm>
  </div>
</template>

<style scoped>
.login-register {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-register__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 4px;
}

.login-register__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.3;
}

.login-register__desc {
  font-size: 13px;
  color: #666;
}
</style>
