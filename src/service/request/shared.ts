import { useAuthStore } from '@/store/modules/auth';
import { localStg } from '@/utils/storage';
import { fetchRefreshToken } from '../api';
import type { RequestInstanceState } from './type';

export function getAuthorization() {
  const token = localStg.get('token');
  const Authorization = token ? `Bearer ${token}` : null;

  return Authorization;
}

/** refresh token */
export async function handleRefreshToken() {
  const { resetStore } = useAuthStore();

  const rToken = localStg.get('refreshToken') || '';

  const refreshTokenMethod = fetchRefreshToken(rToken);

  // set the refreshToken role, so that the request will not be intercepted
  refreshTokenMethod.meta.authRole = 'refreshToken';

  try {
    const data = await refreshTokenMethod;
    const accessToken = data.accessToken || (data as Api.Auth.LoginToken & { token?: string }).token;
    if (!accessToken) {
      throw new Error('刷新令牌响应缺少 accessToken');
    }
    localStg.set('token', accessToken);
    localStg.set('refreshToken', data.refreshToken);
  } catch (error) {
    resetStore();
    throw error;
  }
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
