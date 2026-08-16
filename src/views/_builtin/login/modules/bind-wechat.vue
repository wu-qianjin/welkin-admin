<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';
import { createScanSession, fetchScanStatus } from '@/service/api/auth';

defineOptions({
  name: 'BindWechat'
});

const authStore = useAuthStore();
const { toggleLoginModule } = useRouterPush();

const QR_SIZE = 210;
const QR_MODULES = 25;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const scanToken = ref('');
const status = ref<'waiting' | 'scanned' | 'success' | 'expired'>('waiting');

let scanTimer: number | null = null;
let expireTimer: number | null = null;

function clearTimers() {
  [scanTimer, expireTimer].forEach(timer => {
    if (timer !== null) window.clearTimeout(timer);
  });
  scanTimer = null;
  expireTimer = null;
}

/** deterministic 0..1 noise so each qr is stable per token */
function seededNoise(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function drawFinder(ctx: CanvasRenderingContext2D, x: number, y: number, cell: number) {
  ctx.fillStyle = '#111';
  ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
  ctx.fillStyle = '#fff';
  ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
  ctx.fillStyle = '#111';
  ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
}

function drawQr(token: string) {
  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const cell = QR_SIZE / QR_MODULES;
  canvas.width = QR_SIZE * 2;
  canvas.height = QR_SIZE * 2;
  ctx.scale(2, 2);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, QR_SIZE, QR_SIZE);
  ctx.fillStyle = '#111';

  const salt = [...token].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let row = 0; row < QR_MODULES; row += 1) {
    for (let col = 0; col < QR_MODULES; col += 1) {
      const inFinder = (row < 8 && col < 8) || (row < 8 && col > QR_MODULES - 9) || (row > QR_MODULES - 9 && col < 8);
      if (!inFinder && seededNoise(row * QR_MODULES + col, salt) > 0.52) {
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
  }

  drawFinder(ctx, 0, 0, cell);
  drawFinder(ctx, QR_MODULES - 7, 0, cell);
  drawFinder(ctx, 0, QR_MODULES - 7, cell);
}

async function pollStatus() {
  if (!scanToken.value || status.value === 'expired') return;
  try {
    const next = await fetchScanStatus(scanToken.value);
    if (next.status === 'confirmed') {
      status.value = 'success';
      await authStore.loginByScan(scanToken.value);
      return;
    }
    if (next.status === 'expired' || next.status === 'consumed') {
      status.value = 'expired';
      return;
    }
  } catch {
    // Keep polling until the server-side expiry timer elapses.
  }
  scanTimer = window.setTimeout(pollStatus, 2000);
}

async function startScan() {
  clearTimers();
  status.value = 'waiting';
  const session = await createScanSession();
  scanToken.value = session.scanToken;
  drawQr(session.qrContent);

  expireTimer = window.setTimeout(() => {
    status.value = 'expired';
    clearTimers();
  }, 120_000);
  void pollStatus();
}

onMounted(startScan);

onUnmounted(clearTimers);
</script>

<template>
  <div class="login-scan">
    <header class="login-scan__header">
      <h2 class="login-scan__title">{{ $t('page.login.scanLogin.title') }}</h2>
      <p class="login-scan__desc">{{ $t('page.login.common.welcomeDesc') }}</p>
    </header>

    <div class="login-scan__qr-wrap">
      <div class="login-scan__qr" :class="`is-${status}`" @click="status === 'expired' && startScan()">
        <canvas ref="canvasRef" class="login-scan__canvas" />

        <Transition name="login-scan-fade">
          <div v-if="status === 'scanned'" class="login-scan__mask">
            <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
              <path
                fill="#18a058"
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.2 14.6L6.4 12.2l1.4-1.4 3 3 5.4-5.4 1.4 1.4z"
              />
            </svg>
            <p class="login-scan__mask-text">{{ $t('page.login.scanLogin.scanned') }}</p>
          </div>
        </Transition>

        <Transition name="login-scan-fade">
          <div v-if="status === 'expired'" class="login-scan__mask">
            <p class="login-scan__mask-text">{{ $t('page.login.scanLogin.expired') }}</p>
            <NButton size="small" type="primary" ghost @click.stop="startScan">
              {{ $t('page.login.scanLogin.refresh') }}
            </NButton>
          </div>
        </Transition>
      </div>

      <p class="login-scan__hint">
        <template v-if="status === 'waiting'">{{ $t('page.login.scanLogin.hint') }}</template>
        <template v-else-if="status === 'success'">{{ $t('page.login.scanLogin.success') }}</template>
      </p>
    </div>

    <NButton size="large" round block @click="toggleLoginModule('pwd-login')">
      {{ $t('page.login.common.back') }}
    </NButton>
  </div>
</template>

<style scoped>
.login-scan {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-scan__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-scan__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--primary-color);
  line-height: 1.3;
}

.login-scan__desc {
  font-size: 13px;
  color: #666;
}

.login-scan__qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
}

.login-scan__qr {
  position: relative;
  padding: 10px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background-color: #fff;
  cursor: default;
}

.login-scan__qr.is-expired {
  cursor: pointer;
}

.login-scan__canvas {
  display: block;
  width: 210px;
  height: 210px;
}

.login-scan__mask {
  position: absolute;
  inset: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(2px);
}

.login-scan__mask-text {
  margin: 0;
  font-size: 13px;
  color: #333;
  text-align: center;
  padding: 0 12px;
}

.login-scan__hint {
  margin: 0;
  font-size: 13px;
  color: #999;
}

.login-scan-fade-enter-active,
.login-scan-fade-leave-active {
  transition: opacity 0.25s ease;
}

.login-scan-fade-enter-from,
.login-scan-fade-leave-to {
  opacity: 0;
}
</style>
