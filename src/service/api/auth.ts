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
export function sendCaptcha(phone: string) {
  return alova.Post<null>('/auth/sendCaptcha', { phone });
}

/** Verify captcha */
export function verifyCaptcha(phone: string, code: string) {
  return alova.Post<null>('/auth/verifyCaptcha', { phone, code });
}

/** Login by phone number + sms code */
export function fetchLoginByPhone(phone: string, code: string) {
  return alova.Post<Api.Auth.LoginToken>('/auth/loginByPhone', { phone, code });
}

/** Register a new account */
export function fetchRegister(data: { phone: string; password: string }) {
  return alova.Post<null>('/auth/register', data);
}

/** Reset password by phone + sms code */
export function fetchResetPwd(data: { phone: string; code: string; password: string }) {
  return alova.Post<null>('/auth/resetPwd', data);
}

/** Login by scanning the qr code (confirmed on mobile) */
export function fetchScanLogin(scanToken: string) {
  return alova.Post<Api.Auth.LoginToken>('/auth/scanLogin', { scanToken });
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
