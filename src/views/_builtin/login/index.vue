<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { getPaletteColorByNumber } from '@sa/color';
import { loginModuleRecord } from '@/constants/app';
import { useAppStore } from '@/store/modules/app';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
import PwdLogin from './modules/pwd-login.vue';
import CodeLogin from './modules/code-login.vue';
import Register from './modules/register.vue';
import ResetPwd from './modules/reset-pwd.vue';
import BindWechat from './modules/bind-wechat.vue';

interface Props {
  /** The login module */
  module?: UnionKey.LoginModule;
}

const props = defineProps<Props>();

const appStore = useAppStore();
const themeStore = useThemeStore();

interface LoginModule {
  label: App.I18n.I18nKey;
  component: Component;
}

const moduleMap: Record<UnionKey.LoginModule, LoginModule> = {
  'pwd-login': { label: loginModuleRecord['pwd-login'], component: PwdLogin },
  'code-login': { label: loginModuleRecord['code-login'], component: CodeLogin },
  register: { label: loginModuleRecord.register, component: Register },
  'reset-pwd': { label: loginModuleRecord['reset-pwd'], component: ResetPwd },
  'bind-wechat': { label: loginModuleRecord['bind-wechat'], component: BindWechat }
};

const activeModule = computed(() => moduleMap[props.module || 'pwd-login']);

// Theme colors used for the left banner gradient and the inline illustration.
const bgThemeColor = computed(() =>
  themeStore.darkMode ? getPaletteColorByNumber(themeStore.themeColor, 600) : themeStore.themeColor
);

const bannerLightColor = computed(() => getPaletteColorByNumber(bgThemeColor.value, 50));
const bannerMidColor = computed(() => getPaletteColorByNumber(bgThemeColor.value, 100));
const bannerStrongColor = computed(() => getPaletteColorByNumber(bgThemeColor.value, 300));
</script>

<template>
  <div class="login-page size-full">
    <!-- Floating brand on top-left of banner column -->
    <div class="login-brand flex-y-center gap-10px">
      <SystemLogo class="size-32px" />
      <h3 class="text-18px font-500 text-primary">{{ $t('system.title') }}</h3>
    </div>

    <!-- Floating action icons on top-right of form column -->
    <div class="login-actions flex-y-center gap-4px text-18px">
      <ThemeSchemaSwitch
        :theme-schema="themeStore.themeScheme"
        :show-tooltip="true"
        class="text-20px"
        @switch="themeStore.toggleThemeScheme"
      />
      <FullScreen class="text-20px" />
      <LangSwitch
        v-if="themeStore.header.multilingual.visible"
        :lang="appStore.locale"
        :lang-options="appStore.localeOptions"
        :show-tooltip="true"
        @change-lang="appStore.changeLocale"
      />
    </div>

    <!-- Two full-height color columns -->
    <div class="login-cols size-full flex">
      <!-- Left banner -->
      <section
        class="login-banner flex-col-center justify-center gap-32px"
        :style="{
          background: `linear-gradient(135deg, ${bannerLightColor} 0%, ${bannerMidColor} 60%, ${bannerStrongColor} 100%)`
        }"
      >
        <!-- Inline isometric illustration -->
        <svg
          class="login-illustration"
          viewBox="0 0 480 360"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="login-illust-base" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" :stop-color="bgThemeColor" stop-opacity="0.95" />
              <stop offset="1" :stop-color="bgThemeColor" stop-opacity="0.7" />
            </linearGradient>
            <linearGradient id="login-illust-base-shadow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#000" stop-opacity="0.18" />
              <stop offset="1" stop-color="#000" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="login-illust-screen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ffffff" />
              <stop offset="1" stop-color="#e6f1ff" />
            </linearGradient>
            <linearGradient id="login-illust-person" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" :stop-color="bannerStrongColor" />
              <stop offset="1" :stop-color="bgThemeColor" />
            </linearGradient>
          </defs>

          <!-- Soft floor shadow -->
          <ellipse cx="240" cy="320" rx="170" ry="18" fill="url(#login-illust-base-shadow)" />

          <!-- Back panel -->
          <g transform="translate(70 70)">
            <polygon
              points="0,40 180,0 360,40 180,80"
              fill="url(#login-illust-screen)"
              stroke="currentColor"
              stroke-opacity="0.08"
            />
            <polygon points="0,40 0,160 180,200 180,80" fill="#ffffff" stroke="currentColor" stroke-opacity="0.08" />
            <polygon
              points="360,40 360,160 180,200 180,80"
              :fill="bannerMidColor"
              opacity="0.85"
              stroke="currentColor"
              stroke-opacity="0.08"
            />
          </g>

          <!-- Chart on the back panel -->
          <g transform="translate(120 110)">
            <rect x="0" y="40" width="18" height="40" rx="2" :fill="bgThemeColor" opacity="0.55" />
            <rect x="28" y="22" width="18" height="58" rx="2" :fill="bgThemeColor" opacity="0.75" />
            <rect x="56" y="10" width="18" height="70" rx="2" :fill="bgThemeColor" />
            <rect x="84" y="32" width="18" height="48" rx="2" :fill="bgThemeColor" opacity="0.7" />
            <polyline
              points="9,52 37,32 65,18 93,40"
              fill="none"
              :stroke="bgThemeColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>

          <!-- Floating card 1 -->
          <g transform="translate(310 90)">
            <rect
              x="0"
              y="0"
              width="110"
              height="74"
              rx="10"
              fill="#ffffff"
              stroke="currentColor"
              stroke-opacity="0.08"
            />
            <circle cx="20" cy="20" r="8" :fill="bgThemeColor" />
            <rect x="36" y="14" width="60" height="6" rx="3" fill="currentColor" fill-opacity="0.18" />
            <rect x="36" y="26" width="42" height="5" rx="2" fill="currentColor" fill-opacity="0.12" />
            <rect x="12" y="46" width="86" height="6" rx="3" :fill="bannerStrongColor" opacity="0.6" />
            <rect x="12" y="58" width="60" height="6" rx="3" :fill="bannerStrongColor" opacity="0.35" />
          </g>

          <!-- Floating card 2 (gear) -->
          <g transform="translate(70 230)">
            <rect
              x="0"
              y="0"
              width="80"
              height="80"
              rx="12"
              fill="#ffffff"
              stroke="currentColor"
              stroke-opacity="0.08"
            />
            <g transform="translate(40 40)">
              <circle r="14" fill="none" :stroke="bgThemeColor" stroke-width="3" />
              <circle r="5" :fill="bgThemeColor" />
              <g :stroke="bgThemeColor" stroke-width="3" stroke-linecap="round">
                <line x1="0" y1="-22" x2="0" y2="-17" />
                <line x1="0" y1="22" x2="0" y2="17" />
                <line x1="-22" y1="0" x2="-17" y2="0" />
                <line x1="22" y1="0" x2="17" y2="0" />
              </g>
            </g>
          </g>

          <!-- Monitor (foreground) -->
          <g transform="translate(150 150)">
            <!-- Stand base -->
            <polygon points="50,150 110,150 100,170 60,170" :fill="bannerStrongColor" />
            <!-- Monitor body -->
            <rect
              x="0"
              y="0"
              width="220"
              height="140"
              rx="10"
              fill="#ffffff"
              stroke="currentColor"
              stroke-opacity="0.12"
            />
            <rect x="0" y="0" width="220" height="140" rx="10" fill="url(#login-illust-screen)" />
            <!-- Screen UI -->
            <rect x="14" y="14" width="80" height="8" rx="4" :fill="bgThemeColor" opacity="0.85" />
            <rect x="14" y="30" width="120" height="6" rx="3" fill="currentColor" fill-opacity="0.18" />
            <rect x="14" y="42" width="90" height="6" rx="3" fill="currentColor" fill-opacity="0.12" />
            <!-- Side panel -->
            <rect x="150" y="14" width="56" height="50" rx="6" :fill="bannerMidColor" />
            <rect
              x="150"
              y="74"
              width="56"
              height="50"
              rx="6"
              :fill="bannerLightColor"
              stroke="currentColor"
              stroke-opacity="0.08"
            />
            <!-- Stand -->
            <rect x="100" y="140" width="20" height="14" :fill="bannerStrongColor" />
          </g>

          <!-- Person standing next to monitor -->
          <g transform="translate(310 170)">
            <!-- Shadow -->
            <ellipse cx="32" cy="148" rx="22" ry="4" fill="#000" fill-opacity="0.12" />
            <!-- Legs -->
            <rect x="22" y="92" width="9" height="50" rx="3" :fill="bannerStrongColor" />
            <rect x="34" y="92" width="9" height="50" rx="3" :fill="bgThemeColor" />
            <!-- Body -->
            <rect x="14" y="56" width="36" height="42" rx="8" fill="url(#login-illust-person)" />
            <!-- Arm holding tablet -->
            <rect x="42" y="62" width="6" height="22" rx="3" :fill="bannerStrongColor" />
            <rect
              x="46"
              y="70"
              width="22"
              height="16"
              rx="3"
              fill="#ffffff"
              stroke="currentColor"
              stroke-opacity="0.12"
            />
            <rect x="49" y="73" width="16" height="3" rx="1" :fill="bgThemeColor" opacity="0.7" />
            <rect x="49" y="79" width="10" height="3" rx="1" :fill="bgThemeColor" opacity="0.4" />
            <!-- Head -->
            <circle cx="32" cy="42" r="14" fill="#ffd9b3" />
            <path d="M18 42 a14 14 0 0 1 28 0 z" :fill="bannerStrongColor" />
            <!-- Face -->
            <circle cx="28" cy="44" r="1.4" fill="#3b3b3b" />
            <circle cx="36" cy="44" r="1.4" fill="#3b3b3b" />
          </g>

          <!-- Magnifier floating -->
          <g transform="translate(370 250) rotate(15)">
            <circle cx="0" cy="0" r="16" fill="#ffffff" stroke="currentColor" stroke-opacity="0.12" />
            <circle cx="0" cy="0" r="9" fill="none" :stroke="bgThemeColor" stroke-width="2.5" />
            <line x1="11" y1="11" x2="22" y2="22" :stroke="bgThemeColor" stroke-width="3.5" stroke-linecap="round" />
          </g>
        </svg>

        <div class="banner-text">
          <h2 class="text-24px font-600 text-primary">{{ $t('page.login.banner.title') }}</h2>
          <p class="mt-8px text-14px text-#666">{{ $t('page.login.banner.subtitle') }}</p>
        </div>
      </section>

      <!-- Right form -->
      <section class="login-form-pane">
        <div class="login-form-card-wrap flex-center">
          <div class="login-form-card">
            <component :is="activeModule.component" />
          </div>
        </div>

        <!-- Floating copyright at the bottom of the form pane -->
        <div class="login-copyright flex-center">
          <span class="text-12px text-#999">{{ $t('page.login.common.copyright') }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-width: 600px;
  min-height: 100vh;
  background-color: #ffffff;
}

/* Floating brand — sits in the top-left corner above the banner column */
.login-brand {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 20;
}

/* Floating action icons — sit in the top-right corner above the form column */
.login-actions {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 20;
}

.login-cols {
  display: flex;
  width: 100%;
  height: 100vh;
}

.login-banner {
  display: flex;
  flex: 1.2;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
}

.login-banner::before,
.login-banner::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.45;
  pointer-events: none;
}

.login-banner::before {
  width: 320px;
  height: 320px;
  background: var(--primary-color);
  top: -80px;
  left: -80px;
  opacity: 0.18;
}

.login-banner::after {
  width: 280px;
  height: 280px;
  background: var(--primary-color);
  bottom: -60px;
  right: -40px;
  opacity: 0.14;
}

.login-illustration {
  position: relative;
  z-index: 1;
  width: clamp(280px, 36vw, 420px);
  height: auto;
  color: var(--primary-color);
}

.banner-text {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 380px;
}

.login-form-pane {
  flex: 1;
  min-width: 0;
  position: relative;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.login-form-card-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 60px;
}

.login-form-card {
  width: 100%;
  max-width: 400px;
}

.login-copyright {
  padding: 16px 24px;
}

/* Mobile fallback: hide the banner column, form takes full width */
@media (max-width: 768px) {
  .login-brand {
    color: #333;
  }

  .login-banner {
    display: none;
  }
}
</style>
