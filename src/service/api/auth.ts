import { alova } from '../request';

/**
 * Login (real backend via gateway; contract: docs/iam/openapi.yaml)
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(userName: string, password: string) {
  return alova.Post<Api.Auth.LoginToken>('/v1/iam/auth/login', { userName, password });
}

/** Get user info (real backend via gateway) */
export function fetchGetUserInfo() {
  return alova.Get<Api.Auth.UserInfo>('/v1/iam/auth/userInfo');
}

/** Send captcha to target phone */
export function sendCaptcha(phone: string, scene: 'login' | 'register' | 'resetPassword' = 'login') {
  return alova.Post<null>('/v1/iam/auth/captcha/send', { phone, scene });
}

/** Verify captcha */
export function verifyCaptcha(phone: string, code: string) {
  return alova.Post<null>('/v1/iam/auth/captcha/verify', { phone, scene: 'login', code });
}

/** Login by phone number + sms code */
export function fetchLoginByPhone(phone: string, code: string) {
  return alova.Post<Api.Auth.LoginToken>('/v1/iam/auth/loginByPhone', { phone, code });
}

/** Register a new account */
export function fetchRegister(data: { phone: string; code: string; password: string }) {
  return alova.Post<null>('/v1/iam/auth/register', data);
}

/** Reset password by phone + sms code */
export function fetchResetPwd(data: { phone: string; code: string; password: string }) {
  return alova.Post<null>('/v1/iam/auth/resetPassword', data);
}

/** Login by scanning the qr code (confirmed on mobile) */
export function fetchScanLogin(scanToken: string) {
  return alova.Post<Api.Auth.LoginToken>('/v1/iam/auth/scan/login', { scanToken });
}

export interface ScanSession {
  scanToken: string;
  qrContent: string;
  expiresAt: string;
}

export interface ScanStatus {
  status: 'waiting' | 'scanned' | 'confirmed' | 'consumed' | 'expired';
  expiresAt: string;
}

export function createScanSession() {
  return alova.Post<ScanSession>('/v1/iam/auth/scan/create', {});
}

export function fetchScanStatus(scanToken: string) {
  return alova.Get<ScanStatus>(`/v1/iam/auth/scan/status/${encodeURIComponent(scanToken)}`);
}

export interface ProfileData {
  userId: string;
  userName: string;
  nickName: string;
  /** 头像文件预览路径（/v1/system/file/preview/{id}），空串表示未设置，需带 token 以 blob 方式加载 */
  avatar: string;
  phone: string;
  email: string;
  gender: number;
  roles: string[];
  department: string;
  lastLoginAt?: string;
  lastLoginIp: string;
}

export interface SessionData {
  id: string;
  userName: string;
  loginType: number;
  ip: string;
  userAgent: string;
  refreshExpiresAt: string;
  revokedAt?: string;
  createdAt: string;
}

export function fetchGetProfile() {
  return alova.Get<ProfileData>('/v1/iam/profile');
}

export function updateProfile(data: Pick<ProfileData, 'nickName' | 'phone' | 'email' | 'gender' | 'avatar'>) {
  return alova.Put<null>('/v1/iam/profile', data);
}

export function changePassword(currentPassword: string, newPassword: string) {
  return alova.Put<null>('/v1/iam/profile/password', { currentPassword, newPassword });
}

export function fetchProfileSessions() {
  return alova.Get<SessionData[]>('/v1/iam/profile/sessions');
}

export function revokeProfileSession(id: string) {
  return alova.Delete<null>(`/v1/iam/profile/sessions/${id}`);
}
/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return alova.Post<Api.Auth.LoginToken>(
    '/v1/iam/auth/refreshToken',
    { refreshToken },
    {
      meta: {
        authRole: 'refreshToken'
      }
    }
  );
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return alova.Get('/auth/error', {
    params: { code, msg },
    shareRequest: false
  });
}
