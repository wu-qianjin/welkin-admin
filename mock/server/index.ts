import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect } from 'vite';
import {
  addUser,
  apiCrud,
  batchDeleteUsers,
  buildDeptTree,
  buttonCrud,
  configCrud,
  db,
  deleteUser,
  deptCrud,
  deptHasChildren,
  dictOptionCrud,
  dictTypeCrud,
  fileCrud,
  noticeCrud,
  store,
  updateUser
} from './db';
import type { MockConfig, MockConfigHistory, MockDept, MockFile, MockMenu, MockNotice } from './db';
import { customMockRoutes } from './custom';
import { monitorRoutes } from './monitor';
import { authMockRoutes } from './auth';
import { sendData, sendError } from './response';
import type { MockRoute } from './types';

const PROXY_PREFIX = '/proxy-default';

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error(`invalid json body: ${raw.slice(0, 100)}`));
      }
    });
    req.on('error', reject);
  });
}

/** decode the userName embedded in the mock JWT payload (no signature check, mock only) */
function decodeTokenUser(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return payload?.data?.[0]?.userName ?? payload?.userName ?? payload?.username ?? payload?.sub ?? null;
  } catch {
    return null;
  }
}

/** treat empty / "null" / "undefined" query values as "no condition" */
function noCondition(keyword: unknown): boolean {
  return keyword === null || keyword === undefined || keyword === '' || keyword === 'null' || keyword === 'undefined';
}

function contains(value: unknown, keyword: unknown): boolean {
  if (noCondition(keyword)) return true;
  return String(value ?? '').includes(String(keyword));
}

function equals(value: unknown, expected: unknown): boolean {
  if (noCondition(expected)) return true;
  return String(value ?? '') === String(expected);
}

/** 时间范围过滤："YYYY-MM-DD HH:mm:ss" 文本可直接按字典序比较，条件缺省时不过滤 */
function withinTimeRange(value: unknown, beginTime: unknown, endTime: unknown): boolean {
  const text = String(value ?? '');
  if (!noCondition(beginTime) && text < String(beginTime)) return false;
  if (!noCondition(endTime) && text > String(endTime)) return false;
  return true;
}

function paginate<T>(records: T[], query: URLSearchParams) {
  const current = Math.max(1, Number(query.get('current') || 1));
  const size = Math.max(1, Number(query.get('size') || 10));
  const start = (current - 1) * size;
  return {
    records: records.slice(start, start + size),
    current,
    size,
    total: records.length
  };
}

/** "YYYY-MM-DD HH:mm:ss" 文本，与 fixtures 中的时间格式保持一致 */
function nowText() {
  return new Date().toLocaleString('sv-SE').replace('T', ' ');
}

/** mock 库记录 → 网关 /v1 契约：status 转 0/1、id 转字符串、补齐 updateTime */
function toBackendConfig(config: MockConfig) {
  return {
    id: String(config.id),
    paramName: config.paramName,
    paramKey: config.paramKey,
    paramValue: config.paramValue,
    builtIn: config.builtIn,
    status: String(config.status) === '1' ? 1 : 0,
    remark: String(config.remark ?? ''),
    createTime: String(config.createTime ?? ''),
    updateTime: String(config.updateTime ?? config.createTime ?? '')
  };
}

function toBackendNotice(notice: MockNotice) {
  return {
    id: String(notice.id),
    title: notice.title,
    noticeType: Number(notice.noticeType),
    noticeStatus: Number(notice.noticeStatus),
    isTop: Boolean(notice.isTop),
    content: notice.content,
    author: String(notice.createBy ?? ''),
    createTime: String(notice.createTime ?? ''),
    updateTime: String(notice.updateTime ?? notice.createTime ?? '')
  };
}

function toBackendFile(file: MockFile) {
  return {
    id: String(file.id),
    fileName: file.fileName,
    fileType: Number(file.fileType),
    fileSize: file.fileSize,
    bizType: file.bizType ?? '',
    createBy: file.createBy,
    createTime: file.createTime
  };
}

/** 追加一条参数变更历史，供“变更记录”抽屉回看 */
function addConfigHistory(record: Omit<MockConfigHistory, 'id'>) {
  const id = store.configHistories.length ? Math.max(...store.configHistories.map(item => item.id)) + 1 : 1;
  store.configHistories.unshift({ ...record, id });
}

/** a menu matches when itself or any descendant matches every provided condition */
function menuMatches(menu: MockMenu, query: URLSearchParams): boolean {
  const menuName = query.get('menuName');
  const menuType = query.get('menuType');
  const status = query.get('status');

  const selfMatch = contains(menu.menuName, menuName) && equals(menu.menuType, menuType) && equals(menu.status, status);
  const childMatch = (menu.children || []).some(child => menuMatches(child, query));

  return selfMatch || childMatch;
}

/** build the menu tree from the nested menu records */
function buildMenuTree(menus: MockMenu[]): any[] {
  return menus.map(menu => ({
    id: menu.id,
    label: menu.menuName,
    pId: menu.parentId,
    children: menu.children?.length ? buildMenuTree(menu.children) : []
  }));
}

type MockRouteRecord = {
  name: string;
  path?: string;
  component?: string;
  meta?: Record<string, unknown>;
  children?: MockRouteRecord[];
  [key: string]: unknown;
};

const legacyRouteNameMap: Record<string, Pick<MockRouteRecord, 'name' | 'path' | 'component'>> = {
  manage_user: { name: 'manage_auth_user', path: '/manage/auth/user', component: 'view.manage_auth_user' },
  'manage_user-detail': {
    name: 'manage_auth_user-detail',
    path: '/manage/auth/user-detail/:id',
    component: 'view.manage_auth_user-detail'
  },
  manage_dept: { name: 'manage_auth_dept', path: '/manage/auth/dept', component: 'view.manage_auth_dept' },
  manage_role: { name: 'manage_auth_role', path: '/manage/auth/role', component: 'view.manage_auth_role' },
  manage_menu: { name: 'manage_auth_menu', path: '/manage/auth/menu', component: 'view.manage_auth_menu' },
  manage_resource: {
    name: 'manage_auth_resource',
    path: '/manage/auth/resource',
    component: 'view.manage_auth_resource'
  },
  manage_config: {
    name: 'manage_system_config',
    path: '/manage/system/config',
    component: 'view.manage_system_config'
  },
  manage_dict: { name: 'manage_system_dict', path: '/manage/system/dict', component: 'view.manage_system_dict' },
  manage_notice: {
    name: 'manage_system_notice',
    path: '/manage/system/notice',
    component: 'view.manage_system_notice'
  },
  manage_file: { name: 'manage_system_file', path: '/manage/system/file', component: 'view.manage_system_file' },
  manage_log: { name: 'manage_audit_log', path: '/manage/audit/log', component: 'view.manage_audit_log' },
  manage_online: { name: 'manage_audit_online', path: '/manage/audit/online', component: 'view.manage_audit_online' }
};

type ManageModuleDefinition = {
  name: string;
  path: string;
  icon: string;
  order: number;
  roles: string[];
  legacyNames: string[];
};

const manageModuleDefinitions: ManageModuleDefinition[] = [
  {
    name: 'manage_auth',
    path: '/manage/auth',
    icon: 'mdi:shield-account-outline',
    order: 1,
    roles: ['R_ADMIN'],
    legacyNames: ['manage_user', 'manage_user-detail', 'manage_dept', 'manage_role', 'manage_menu', 'manage_resource']
  },
  {
    name: 'manage_system',
    path: '/manage/system',
    icon: 'mdi:cog-outline',
    order: 2,
    roles: ['R_ADMIN'],
    legacyNames: ['manage_config', 'manage_dict', 'manage_notice', 'manage_file']
  },
  {
    name: 'manage_audit',
    path: '/manage/audit',
    icon: 'mdi:clipboard-text-clock-outline',
    order: 3,
    roles: ['R_SUPER'],
    legacyNames: ['manage_log', 'manage_online']
  }
];

function normalizeRouteRecord(route: MockRouteRecord): MockRouteRecord {
  const mapping = legacyRouteNameMap[route.name];
  const name = mapping?.name ?? route.name;
  const meta = route.meta
    ? {
        ...route.meta,
        ...(mapping ? { title: name, i18nKey: `route.${name}` } : {}),
        ...(name === 'manage_auth_user-detail' ? { activeMenu: 'manage_auth_user' } : {})
      }
    : route.meta;

  return {
    ...route,
    ...mapping,
    meta,
    ...(route.children ? { children: route.children.map(normalizeRouteRecord) } : {})
  };
}

function menuRecordToRoute(menu: MockMenu): MockRouteRecord {
  const routeName = menu.routeName;
  const meta = {
    title: routeName,
    i18nKey: typeof menu.i18nKey === 'string' ? menu.i18nKey : `route.${routeName}`,
    ...(menu.icon ? { icon: menu.icon } : {}),
    ...(typeof menu.order === 'number' ? { order: menu.order } : {}),
    ...(menu.hideInMenu ? { hideInMenu: true } : {}),
    ...(routeName === 'manage_auth_user-detail' ? { activeMenu: 'manage_auth_user' } : {})
  };

  return {
    name: routeName,
    path: menu.routePath,
    ...(menu.component ? { component: menu.component } : {}),
    meta,
    ...(menu.children?.length ? { children: menu.children.map(menuRecordToRoute) } : {})
  };
}

function normalizeManageRoute(route: MockRouteRecord): MockRouteRecord {
  const sourceChildren = route.children ?? [];
  const children = manageModuleDefinitions.map(definition => ({
    name: definition.name,
    path: definition.path,
    meta: {
      title: definition.name,
      i18nKey: `route.${definition.name}`,
      icon: definition.icon,
      order: definition.order,
      roles: [...definition.roles]
    },
    children: sourceChildren
      .filter(child => definition.legacyNames.includes(child.name) || child.name === definition.name)
      .map(normalizeRouteRecord)
  }));

  return {
    ...route,
    meta: {
      ...route.meta,
      title: 'manage',
      i18nKey: 'route.manage',
      icon: 'carbon:cloud-service-management',
      order: 9,
      roles: ['R_ADMIN']
    },
    children
  };
}

function normalizeUserRoutes(value: { routes?: MockRouteRecord[]; home?: string }) {
  if (!Array.isArray(value.routes)) return value;
  const currentManageMenu = store.menus.find(menu => menu.routeName === 'manage');
  const currentManageRoute = currentManageMenu ? menuRecordToRoute(currentManageMenu) : null;
  const normalizedRoutes = value.routes.map(route =>
    route.name === 'manage' ? normalizeManageRoute(route) : normalizeRouteRecord(route)
  );

  return {
    ...value,
    routes: normalizedRoutes.map(route => (route.name === 'manage' && currentManageRoute ? currentManageRoute : route)),
    home: value.home === 'manage_user' ? 'manage_auth_user' : value.home
  };
}

type StoredLoginToken = {
  accessToken?: string;
  token?: string;
  refreshToken: string;
  [key: string]: unknown;
};

const MOCK_ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const MOCK_REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

function createMockAccessToken(userName: string, expiresAt: number) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      data: [{ userName }],
      sub: userName,
      iat: expiresAt - MOCK_ACCESS_TOKEN_TTL_SECONDS,
      exp: expiresAt
    })
  ).toString('base64url');
  return `${header}.${payload}.welkin-mock`;
}

function issueMockLoginToken(value: StoredLoginToken, userName: string) {
  const now = Math.floor(Date.now() / 1000);
  const accessExpiresAt = now + MOCK_ACCESS_TOKEN_TTL_SECONDS;
  const refreshExpiresAt = now + MOCK_REFRESH_TOKEN_TTL_SECONDS;
  // strip the legacy token fields so the response always uses the formal accessToken contract
  const { token: _token, accessToken: _accessToken, ...rest } = value;
  return {
    ...rest,
    accessToken: createMockAccessToken(userName, accessExpiresAt),
    accessExpiresAt,
    refreshExpiresAt
  };
}

function toLoginToken(value: StoredLoginToken, userName = 'Super') {
  return issueMockLoginToken(value, userName);
}
// The application uses the gateway's /v1 contract; keep the legacy aliases above for older demos.
type BackendRouteSource = {
  name?: string;
  path?: string;
  component?: string;
  meta?: Record<string, unknown>;
  children?: BackendRouteSource[];
};

type BackendMenuItem = {
  id: string;
  parentId: string;
  menuType: string;
  menuName: string;
  routeName: string;
  routePath: string;
  component: string;
  icon: string;
  iconType: string;
  status: number;
  order: number;
  i18nKey: string;
  keepAlive: boolean;
  constant: boolean;
  href: string;
  hideInMenu: boolean;
  activeMenu: string;
  multiTab: boolean;
  fixedIndexInTab: number | null;
  children?: BackendMenuItem[];
};

function toBackendMenuItem(route: BackendRouteSource, index = 0): BackendMenuItem {
  const meta = route.meta || {};
  return {
    id: String(route.name || index),
    parentId: '0',
    menuType: '2',
    menuName: String(meta.title || route.name || ''),
    routeName: String(route.name || ''),
    routePath: String(route.path || '/'),
    component: String(route.component || ''),
    icon: String(meta.icon || ''),
    iconType: '1',
    status: 1,
    order: Number(meta.order || index),
    i18nKey: String(meta.i18nKey || `route.${route.name || ''}`),
    keepAlive: Boolean(meta.keepAlive),
    constant: Boolean(meta.constant),
    href: String(meta.href || ''),
    hideInMenu: Boolean(meta.hideInMenu),
    activeMenu: String(meta.activeMenu || ''),
    multiTab: Boolean(meta.multiTab),
    fixedIndexInTab: typeof meta.fixedIndexInTab === 'number' ? meta.fixedIndexInTab : null,
    children: route.children?.map((child, childIndex) => toBackendMenuItem(child, childIndex))
  };
}

const v1RouteRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/v1/iam/route/constant',
    handler({ res }) {
      const routes = db.constantRoutes as BackendRouteSource[];
      sendData(
        res,
        routes.map((route, index) => toBackendMenuItem(route, index))
      );
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/route/user',
    handler({ req, res }) {
      const userName = decodeTokenUser(req.headers.authorization);
      if (!userName) {
        sendError(res, '3333', '用户已失效或不存在');
        return;
      }
      const userRoutes = db.userRoutes as { routes?: BackendRouteSource[]; home?: string };
      sendData(res, {
        routes: (userRoutes.routes || []).map((route, index) => toBackendMenuItem(route, index)),
        home: userRoutes.home || 'home'
      });
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/route/exists',
    handler({ res, query }) {
      sendData(res, db.allPages.includes(query.get('routeName') || ''));
    }
  }
];

const v1AuthRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/v1/iam/auth/login',
    handler({ res, body }) {
      const account = db.loginTokens[body?.userName];
      if (account && body?.password === '123456') {
        sendData(res, issueMockLoginToken(account, body.userName));
        return;
      }
      sendError(res, '1000', '用户名或密码错误（Mock），请使用 Super / Admin / User + 123456');
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/auth/userInfo',
    handler({ req, res }) {
      const userName = decodeTokenUser(req.headers.authorization);
      if (!userName) {
        sendError(res, '3333', '用户已失效或不存在');
        return;
      }
      sendData(res, db.userInfos[userName] ?? db.userInfos.Super);
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/auth/refreshToken',
    handler({ res, body }) {
      if (!body?.refreshToken) {
        sendError(res, '8888', '用户状态失效，请重新登录');
        return;
      }
      const userName = decodeTokenUser(`Bearer ${body.refreshToken}`) ?? 'Super';
      sendData(res, issueMockLoginToken(db.refreshTokenData, userName));
    }
  }
];

const v1MessageRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/v1/system/message/page',
    handler({ res, body }) {
      const keyword = body?.keyword;
      const unread = body?.unread;
      const records = store.notices
        .filter(notice => notice.noticeStatus === '2')
        .filter(notice => contains(notice.title, keyword))
        .map(notice => ({
          id: String(notice.id),
          noticeId: String(notice.id),
          title: notice.title,
          type: Number(notice.noticeType),
          summary: notice.content.replace(/<[^>]*>/g, '').slice(0, 120),
          content: notice.content,
          author: notice.createBy,
          publishAt: notice.updateTime || notice.createTime,
          read: false,
          top: notice.isTop,
          scope: 'all'
        }))
        .filter(message => unread !== true || !message.read);
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(records, query));
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/message/:id/read',
    handler({ res }) {
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/message/readAll',
    handler({ res }) {
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/v1/system/message/unreadCount',
    handler({ res }) {
      sendData(res, { count: store.notices.filter(notice => notice.noticeStatus === '2').length });
    }
  }
];

function isMockSessionActive(session: { loginTime: string; refreshExpiresAt?: string; revokedAt?: string | null }) {
  if (session.revokedAt) return false;
  const loginAt = Date.parse(session.loginTime.replace(' ', 'T'));
  const expiresAt = session.refreshExpiresAt ? Date.parse(session.refreshExpiresAt.replace(' ', 'T')) : Number.NaN;
  const effectiveExpiresAt = Number.isNaN(expiresAt)
    ? Number.isNaN(loginAt)
      ? Number.POSITIVE_INFINITY
      : loginAt + 60 * 60 * 1000
    : expiresAt;
  return effectiveExpiresAt > Date.now();
}

const v1AuditRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/v1/monitor/loginLog/page',
    handler({ res, body }) {
      const logs = store.loginLogs.filter(
        log =>
          contains(log.userName, body?.userName) &&
          contains(log.ipaddr, body?.ipaddr) &&
          (body?.status === undefined ||
            body?.status === null ||
            body?.status === '' ||
            Number(log.status) === Number(body.status)) &&
          withinTimeRange(log.loginTime, body?.beginTime, body?.endTime)
      );
      sendData(
        res,
        paginate(logs, new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) }))
      );
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/loginLog/delete',
    handler({ res, body }) {
      const ids = (body?.ids || []).map(Number);
      store.loginLogs = store.loginLogs.filter(log => !ids.includes(log.id));
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/loginLog/clear',
    handler({ res }) {
      store.loginLogs = [];
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/v1/monitor/operateLog/page',
    handler({ res, body }) {
      const logs = store.operateLogs.filter(
        log =>
          contains(log.title, body?.title) &&
          contains(log.userName, body?.userName) &&
          (body?.businessType === undefined ||
            body?.businessType === null ||
            body?.businessType === '' ||
            Number(log.businessType) === Number(body.businessType)) &&
          withinTimeRange(log.operateTime, body?.beginTime, body?.endTime)
      );
      sendData(
        res,
        paginate(logs, new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) }))
      );
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/operateLog/delete',
    handler({ res, body }) {
      const ids = (body?.ids || []).map(Number);
      store.operateLogs = store.operateLogs.filter(log => !ids.includes(log.id));
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/operateLog/clear',
    handler({ res }) {
      store.operateLogs = [];
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/session/page',
    handler({ res, body }) {
      const users = store.onlineUsers.filter(
        user =>
          isMockSessionActive(user) && contains(user.userName, body?.userName) && contains(user.ipaddr, body?.ipaddr)
      );
      sendData(
        res,
        paginate(users, new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) }))
      );
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/session/:id',
    handler({ res, url }) {
      const id = Number(url.pathname.split('/').pop());
      store.onlineUsers = store.onlineUsers.filter(user => user.id !== id);
      sendData(res, null);
    }
  }
];

const routes: MockRoute[] = [
  ...v1RouteRoutes,
  ...v1MessageRoutes,
  ...v1AuthRoutes,
  ...v1AuditRoutes,
  ...authMockRoutes,
  ...customMockRoutes,
  ...monitorRoutes,
  // ---------------- auth ----------------
  {
    method: 'POST',
    path: '/auth/login',
    async handler({ res, body }) {
      const account = db.loginTokens[body?.userName];
      if (account && body?.password === '123456') {
        sendData(res, toLoginToken(account));
      } else {
        sendError(res, '1000', '用户名或密码错误（Mock），请使用 Super / Admin / User + 123456');
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/getUserInfo',
    handler({ req, res }) {
      const userName = decodeTokenUser(req.headers.authorization);
      if (!userName) {
        sendError(res, '3333', '用户已失效或不存在');
        return;
      }
      // tokens issued by refreshToken carry the issuer account, keep the session alive
      const info = db.userInfos[userName] ?? db.userInfos.Super;
      sendData(res, info);
    }
  },
  {
    method: 'POST',
    path: '/auth/refreshToken',
    handler({ res, body }) {
      if (body?.refreshToken) {
        sendData(res, toLoginToken(db.refreshTokenData));
      } else {
        sendError(res, '8888', '用户状态失效，请重新登录');
      }
    }
  },
  {
    method: 'GET',
    path: '/auth/error',
    handler({ req, res, query }) {
      const code = query.get('code') || '500';
      const msg = query.get('msg') || '未知错误';

      // the token-expired demo (code 9999) triggers a refresh + auto retry;
      // once the client carries a refreshed token, let the retry succeed to end the loop
      if (code === '9999' && decodeTokenUser(req.headers.authorization) === 'Welkin') {
        sendData(res, null);
        return;
      }

      sendError(res, code, msg);
    }
  },
  {
    method: 'POST',
    path: '/auth/sendCaptcha',
    handler({ res }) {
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/auth/verifyCaptcha',
    handler({ res, body }) {
      if (body?.code === '123456') {
        sendData(res, null);
      } else {
        sendError(res, '1000', '验证码错误（Mock），验证码为 123456');
      }
    }
  },

  // ---------------- extended auth (monitoring demo) ----------------
  {
    method: 'POST',
    path: '/auth/loginByPhone',
    handler({ res, body }) {
      if (body?.code === '123456') {
        sendData(res, toLoginToken(db.loginTokens.admin));
      } else {
        sendError(res, '1000', '验证码错误（Mock），验证码为 123456');
      }
    }
  },
  {
    method: 'POST',
    path: '/auth/register',
    handler({ res, body }) {
      if (!body?.phone || !body?.password) {
        sendError(res, '1000', '手机号和密码不能为空');
        return;
      }
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/auth/resetPwd',
    handler({ res, body }) {
      if (body?.code !== '123456') {
        sendError(res, '1000', '验证码错误（Mock），验证码为 123456');
        return;
      }
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/auth/scanLogin',
    handler({ res, body }) {
      if (body?.scanToken) {
        sendData(res, toLoginToken(db.loginTokens.admin));
      } else {
        sendError(res, '1000', '扫码状态无效，请刷新二维码重试');
      }
    }
  },

  // ---------------- route ----------------
  {
    method: 'GET',
    path: '/route/getConstantRoutes',
    handler({ res }) {
      sendData(res, db.constantRoutes);
    }
  },
  {
    method: 'GET',
    path: '/route/getUserRoutes',
    handler({ req, res }) {
      const userName = decodeTokenUser(req.headers.authorization);
      if (!userName) {
        sendError(res, '3333', '用户已失效或不存在');
        return;
      }
      sendData(res, normalizeUserRoutes(db.userRoutes));
    }
  },
  {
    method: 'GET',
    path: '/route/isRouteExist',
    handler({ res, query }) {
      sendData(res, db.allPages.includes(query.get('routeName') || ''));
    }
  },

  // ---------------- misc ----------------
  {
    method: 'GET',
    path: '/mock/getLastTime',
    handler({ res }) {
      sendData(res, { time: new Date().toLocaleTimeString() });
    }
  },

  // ---------------- system manage ----------------
  {
    method: 'GET',
    path: '/systemManage/getRoleList',
    handler({ res, query }) {
      const roles = store.roles.filter(
        role =>
          contains(role.roleName, query.get('roleName')) &&
          contains(role.roleCode, query.get('roleCode')) &&
          equals(role.status, query.get('status'))
      );
      sendData(res, paginate(roles, query));
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getAllRoles',
    handler({ res }) {
      sendData(res, db.allRoles);
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getUserList',
    handler({ res, query }) {
      const users = store.users.filter(
        user =>
          contains(user.userName, query.get('userName')) &&
          equals(user.userGender, query.get('userGender')) &&
          contains(user.nickName, query.get('nickName')) &&
          contains(user.userPhone, query.get('userPhone')) &&
          contains(user.userEmail, query.get('userEmail')) &&
          equals(user.status, query.get('status'))
      );
      sendData(res, paginate(users, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addUser',
    handler({ res, body }) {
      addUser(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateUser',
    handler({ res, body }) {
      updateUser(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteUser',
    handler({ res, body }) {
      deleteUser(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteUser',
    handler({ res, body }) {
      batchDeleteUsers(body?.ids || []);
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getMenuList/v2',
    handler({ res, query }) {
      const menus = store.menus.filter(menu => menuMatches(menu, query));
      sendData(res, paginate(menus, query));
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getAllPages',
    handler({ res }) {
      sendData(res, db.allPages);
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getMenuTree',
    handler({ res }) {
      sendData(res, buildMenuTree(store.menus));
    }
  },

  // ---------------- system config ----------------
  {
    method: 'GET',
    path: '/systemManage/getConfigList',
    handler({ res, query }) {
      const configs = store.configs.filter(
        config =>
          contains(config.paramName, query.get('paramName')) &&
          contains(config.paramKey, query.get('paramKey')) &&
          equals(config.status, query.get('status'))
      );
      sendData(res, paginate(configs, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addConfig',
    handler({ res, body }) {
      if (store.configs.some(config => config.paramKey === body?.paramKey)) {
        sendError(res, '1001', `参数键 ${body?.paramKey} 已存在`);
        return;
      }
      configCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateConfig',
    handler({ res, body }) {
      const conflict = store.configs.find(config => config.paramKey === body?.paramKey && config.id !== body?.id);
      if (conflict) {
        sendError(res, '1001', `参数键 ${body?.paramKey} 已存在`);
        return;
      }
      configCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteConfig',
    handler({ res, body }) {
      const config = store.configs.find(item => item.id === body?.id);
      if (config?.builtIn === 'Y') {
        sendError(res, '1002', '内置参数不允许删除');
        return;
      }
      configCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteConfig',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      const hasBuiltIn = store.configs.some(config => ids.includes(config.id) && config.builtIn === 'Y');
      if (hasBuiltIn) {
        sendError(res, '1002', '包含内置参数，内置参数不允许删除');
        return;
      }
      configCrud.batchRemove(ids);
      sendData(res, null);
    }
  },

  // ---------------- system file ----------------
  {
    method: 'GET',
    path: '/systemManage/getFileList',
    handler({ res, query }) {
      const files = store.files.filter(
        file => contains(file.fileName, query.get('fileName')) && equals(file.fileType, query.get('fileType'))
      );
      sendData(res, paginate(files, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/uploadFile',
    handler({ res, body }) {
      const file = fileCrud.add({
        fileName: body?.fileName || 'unnamed',
        fileType: body?.fileType || '4',
        fileSize: Number(body?.fileSize || 0),
        bizType: body?.bizType || null
      });
      sendData(res, file);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteFile',
    handler({ res, body }) {
      fileCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteFile',
    handler({ res, body }) {
      fileCrud.batchRemove(body?.ids || []);
      sendData(res, null);
    }
  },

  // ---------------- system notice ----------------
  {
    method: 'GET',
    path: '/systemManage/getNoticeList',
    handler({ res, query }) {
      const notices = store.notices.filter(
        notice =>
          contains(notice.title, query.get('title')) &&
          equals(notice.noticeType, query.get('noticeType')) &&
          equals(notice.noticeStatus, query.get('noticeStatus'))
      );
      sendData(res, paginate(notices, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addNotice',
    handler({ res, body }) {
      noticeCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateNotice',
    handler({ res, body }) {
      noticeCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteNotice',
    handler({ res, body }) {
      noticeCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteNotice',
    handler({ res, body }) {
      noticeCrud.batchRemove(body?.ids || []);
      sendData(res, null);
    }
  },

  // ---------------- v1 system config ----------------
  {
    method: 'POST',
    path: '/v1/system/config/page',
    handler({ res, body }) {
      const configs = store.configs.filter(
        config =>
          contains(config.paramName, body?.paramName) &&
          contains(config.paramKey, body?.paramKey) &&
          (body?.status === undefined ||
            body?.status === null ||
            body?.status === '' ||
            (Number(body.status) === 1 ? String(config.status) === '1' : String(config.status) === '2'))
      );
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(configs.map(toBackendConfig), query));
    }
  },
  {
    method: 'POST',
    path: '/v1/system/config/create',
    handler({ res, body }) {
      if (store.configs.some(config => config.paramKey === body?.paramKey)) {
        sendError(res, '1001', `参数键 ${body?.paramKey} 已存在`);
        return;
      }
      const record = configCrud.add({
        paramName: body?.paramName ?? '',
        paramKey: body?.paramKey ?? '',
        paramValue: body?.paramValue ?? '',
        builtIn: body?.builtIn === 'Y' ? 'Y' : 'N',
        remark: body?.remark ?? '',
        status: Number(body?.status) === 0 ? '2' : '1'
      });
      sendData(res, { id: String(record.id) });
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/config/update/:id',
    handler({ res, body, url }) {
      const id = Number(url.pathname.split('/').pop());
      const config = store.configs.find(item => item.id === id);
      if (!config) {
        sendError(res, '1003', '参数配置不存在');
        return;
      }
      const conflict = store.configs.find(item => item.paramKey === body?.paramKey && item.id !== id);
      if (conflict) {
        sendError(res, '1001', `参数键 ${body?.paramKey} 已存在`);
        return;
      }
      const beforeValue = String(config.paramValue);
      const afterValue = String(body?.paramValue ?? beforeValue);
      configCrud.update({
        ...body,
        id,
        builtIn: body?.builtIn === 'Y' ? 'Y' : 'N',
        status: Number(body?.status) === 0 ? '2' : '1'
      });
      // 参数值变化时追加一条变更历史，供“变更记录”抽屉回看
      if (afterValue !== beforeValue) {
        addConfigHistory({
          configId: id,
          paramName: String(body?.paramName ?? config.paramName),
          paramKey: String(body?.paramKey ?? config.paramKey),
          beforeValue,
          afterValue,
          operator: 'Super',
          operatedAt: nowText(),
          reason: '管理端修改参数值'
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/system/config/delete',
    handler({ res, body }) {
      const ids = (body?.ids || []).map((id: string | number) => Number(id));
      const hasBuiltIn = store.configs.some(config => ids.includes(config.id) && config.builtIn === 'Y');
      if (hasBuiltIn) {
        sendError(res, '1002', '包含内置参数，内置参数不允许删除');
        return;
      }
      configCrud.batchRemove(ids);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/v1/system/config/history/page',
    handler({ res, body }) {
      const configId = noCondition(body?.configId) ? null : Number(body.configId);
      const histories = store.configHistories
        .filter(item => configId === null || item.configId === configId)
        .sort((a, b) => b.operatedAt.localeCompare(a.operatedAt))
        .map(({ configId: _configId, ...rest }) => ({ ...rest, id: String(rest.id) }));
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 100) });
      sendData(res, paginate(histories, query));
    }
  },

  // ---------------- v1 system notice ----------------
  {
    method: 'POST',
    path: '/v1/system/notice/page',
    handler({ res, body }) {
      const notices = store.notices
        .filter(
          notice =>
            contains(notice.title, body?.title) &&
            (body?.noticeType === undefined ||
              body?.noticeType === null ||
              body?.noticeType === '' ||
              Number(notice.noticeType) === Number(body.noticeType)) &&
            (body?.noticeStatus === undefined ||
              body?.noticeStatus === null ||
              body?.noticeStatus === '' ||
              Number(notice.noticeStatus) === Number(body.noticeStatus))
        )
        .map(toBackendNotice);
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(notices, query));
    }
  },
  {
    method: 'POST',
    path: '/v1/system/notice/create',
    handler({ res, body }) {
      const record = noticeCrud.add({
        title: body?.title ?? '',
        noticeType: String(body?.noticeType ?? '1'),
        noticeStatus: String(body?.noticeStatus ?? '1'),
        isTop: Boolean(body?.isTop),
        content: body?.content ?? '',
        status: '1'
      });
      sendData(res, { id: String(record.id) });
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/notice/update/:id',
    handler({ res, body, url }) {
      const id = Number(url.pathname.split('/').pop());
      // 发布/撤回由前端通过本接口携带新的 noticeStatus 完成
      noticeCrud.update({
        ...body,
        id,
        noticeType: String(body?.noticeType ?? '1'),
        noticeStatus: String(body?.noticeStatus ?? '1'),
        isTop: Boolean(body?.isTop)
      });
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/system/notice/delete',
    handler({ res, body }) {
      noticeCrud.batchRemove((body?.ids || []).map((id: string | number) => Number(id)));
      sendData(res, null);
    }
  },

  // ---------------- v1 system file ----------------
  // 仅实现元数据列表；upload/preview/download 涉及二进制流，不匹配时回落到真实后端
  {
    method: 'POST',
    path: '/v1/system/file/page',
    handler({ res, body }) {
      const files = store.files
        .filter(
          file =>
            contains(file.fileName, body?.fileName) &&
            (body?.fileType === undefined ||
              body?.fileType === null ||
              body?.fileType === '' ||
              Number(file.fileType) === Number(body.fileType))
        )
        .map(toBackendFile);
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(files, query));
    }
  },

  // ---------------- v1 dict ----------------
  {
    method: 'POST',
    path: '/v1/system/dictType/page',
    handler({ res, body }) {
      const types = store.dictTypes.filter(
        type =>
          contains(type.dictName, body?.dictName) &&
          contains(type.dictType, body?.dictType) &&
          contains(type.module, body?.module) &&
          (body?.status === undefined ||
            body?.status === null ||
            (Number(body.status) === 1 ? String(type.status) === '1' : String(type.status) === '2'))
      );
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(types, query));
    }
  },
  {
    method: 'GET',
    path: '/v1/system/dictType/modules',
    handler({ res }) {
      // 去重并过滤空模块，供字典管理页的“所属模块”筛选项使用
      const modules = Array.from(
        new Set(store.dictTypes.map(type => String(type.module ?? '').trim()).filter(module => module.length > 0))
      );
      sendData(res, modules);
    }
  },
  {
    method: 'POST',
    path: '/v1/system/dictType/create',
    handler({ res, body }) {
      if (store.dictTypes.some(type => type.dictType === body?.dictType)) {
        sendError(res, '1001', `字典编码 ${body?.dictType} 已存在`);
        return;
      }
      const record = dictTypeCrud.add({ ...body, module: body?.module ?? '' });
      sendData(res, { id: String(record.id) });
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/dictType/update/:id',
    handler({ res, body, url }) {
      const id = Number(url.pathname.split('/').pop());
      const conflict = store.dictTypes.find(type => type.dictType === body?.dictType && type.id !== id);
      if (conflict) {
        sendError(res, '1001', `字典编码 ${body?.dictType} 已存在`);
        return;
      }
      dictTypeCrud.update({ ...body, id, module: body?.module ?? '' });
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/system/dictType/delete',
    handler({ res, body }) {
      const ids = (body?.ids || []).map((id: string | number) => Number(id));
      const blocked = store.dictTypes.find(
        type => ids.includes(type.id) && store.dictOptions.some(option => option.dictType === type.dictType)
      );
      if (blocked) {
        sendError(res, '1002', `字典编码 ${blocked.dictType} 下存在选项，请先删除全部选项`);
        return;
      }
      dictTypeCrud.batchRemove(ids);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/v1/system/dictOption/page',
    handler({ res, body }) {
      const options = store.dictOptions
        .filter(
          option =>
            equals(option.dictType, body?.dictType) &&
            contains(option.optionLabel, body?.optionLabel) &&
            (body?.status === undefined ||
              body?.status === null ||
              (Number(body.status) === 1 ? String(option.status) === '1' : String(option.status) === '2'))
        )
        .sort((a, b) => a.sort - b.sort);
      const query = new URLSearchParams({ current: String(body?.current ?? 1), size: String(body?.size ?? 10) });
      sendData(res, paginate(options, query));
    }
  },
  {
    method: 'POST',
    path: '/v1/system/dictOption/create',
    handler({ res, body }) {
      const conflict = store.dictOptions.some(
        option => option.dictType === body?.dictType && option.optionValue === body?.optionValue
      );
      if (conflict) {
        sendError(res, '1001', `选项值 ${body?.optionValue} 在该类型下已存在`);
        return;
      }
      const record = dictOptionCrud.add(body);
      sendData(res, { id: String(record.id) });
    }
  },
  {
    method: 'PUT',
    path: '/v1/system/dictOption/update/:id',
    handler({ res, body, url }) {
      const id = Number(url.pathname.split('/').pop());
      const conflict = store.dictOptions.some(
        option => option.dictType === body?.dictType && option.optionValue === body?.optionValue && option.id !== id
      );
      if (conflict) {
        sendError(res, '1001', `选项值 ${body?.optionValue} 在该类型下已存在`);
        return;
      }
      dictOptionCrud.update({ ...body, id });
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/system/dictOption/delete',
    handler({ res, body }) {
      dictOptionCrud.batchRemove((body?.ids || []).map((id: string | number) => Number(id)));
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getDictTypeList',
    handler({ res, query }) {
      const types = store.dictTypes.filter(
        type =>
          contains(type.dictName, query.get('dictName')) &&
          contains(type.dictType, query.get('dictType')) &&
          contains(type.module, query.get('module')) &&
          equals(type.status, query.get('status'))
      );
      sendData(res, paginate(types, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addDictType',
    handler({ res, body }) {
      if (store.dictTypes.some(type => type.dictType === body?.dictType)) {
        sendError(res, '1001', `字典类型 ${body?.dictType} 已存在`);
        return;
      }
      dictTypeCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateDictType',
    handler({ res, body }) {
      const conflict = store.dictTypes.find(type => type.dictType === body?.dictType && type.id !== body?.id);
      if (conflict) {
        sendError(res, '1001', `字典类型 ${body?.dictType} 已存在`);
        return;
      }
      dictTypeCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteDictType',
    handler({ res, body }) {
      const type = store.dictTypes.find(item => item.id === body?.id);
      if (type && store.dictOptions.some(option => option.dictType === type.dictType)) {
        sendError(res, '1002', '该字典类型下存在选项，请先删除全部选项');
        return;
      }
      dictTypeCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteDictType',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      const blocked = store.dictTypes.filter(
        type => ids.includes(type.id) && store.dictOptions.some(option => option.dictType === type.dictType)
      );
      if (blocked.length) {
        sendError(res, '1002', `字典类型 ${blocked[0].dictName} 下存在选项，请先删除全部选项`);
        return;
      }
      dictTypeCrud.batchRemove(ids);
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/systemManage/getDictOptionList',
    handler({ res, query }) {
      const options = store.dictOptions
        .filter(
          option =>
            equals(option.dictType, query.get('dictType')) &&
            contains(option.optionLabel, query.get('optionLabel')) &&
            equals(option.status, query.get('status'))
        )
        .sort((a, b) => a.sort - b.sort);
      sendData(res, paginate(options, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addDictOption',
    handler({ res, body }) {
      const conflict = store.dictOptions.some(
        option => option.dictType === body?.dictType && option.optionValue === body?.optionValue
      );
      if (conflict) {
        sendError(res, '1001', `选项值 ${body?.optionValue} 在该类型下已存在`);
        return;
      }
      dictOptionCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateDictOption',
    handler({ res, body }) {
      const conflict = store.dictOptions.some(
        option =>
          option.dictType === body?.dictType && option.optionValue === body?.optionValue && option.id !== body?.id
      );
      if (conflict) {
        sendError(res, '1001', `选项值 ${body?.optionValue} 在该类型下已存在`);
        return;
      }
      dictOptionCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteDictOption',
    handler({ res, body }) {
      dictOptionCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteDictOption',
    handler({ res, body }) {
      dictOptionCrud.batchRemove(body?.ids || []);
      sendData(res, null);
    }
  },

  // ---------------- dept ----------------
  {
    method: 'GET',
    path: '/systemManage/getDeptList',
    handler({ res, query }) {
      const deptName = query.get('deptName');
      const status = query.get('status');

      // keep a dept when itself matches (with its whole subtree) or any descendant matches
      const filterDeptTree = (depts: MockDept[]): MockDept[] => {
        const result: MockDept[] = [];

        for (const dept of depts) {
          const selfMatch = contains(dept.deptName, deptName) && equals(dept.status, status);

          if (selfMatch) {
            result.push(dept);
            continue;
          }

          const children = dept.children?.length ? filterDeptTree(dept.children) : [];

          if (children.length > 0) {
            result.push({ ...dept, children });
          }
        }

        return result;
      };

      const tree = filterDeptTree(buildDeptTree(store.depts));
      // depts are hierarchical, return all matching nodes without pagination
      sendData(res, { records: tree, current: 1, size: tree.length, total: tree.length });
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addDept',
    handler({ res, body }) {
      if (body?.parentId && !store.depts.some(dept => dept.id === body.parentId)) {
        sendError(res, '1003', '父级部门不存在');
        return;
      }
      deptCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateDept',
    handler({ res, body }) {
      // the parent cannot be itself or any of its descendants
      const collectDescendantIds = (id: number): number[] => {
        const children = store.depts.filter(dept => dept.parentId === id);
        return children.flatMap(child => [child.id, ...collectDescendantIds(child.id)]);
      };

      if (body?.parentId === body?.id || collectDescendantIds(body?.id).includes(body?.parentId)) {
        sendError(res, '1003', '父级部门不能是自身或其下级部门');
        return;
      }
      deptCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteDept',
    handler({ res, body }) {
      const dept = store.depts.find(item => item.id === body?.id);
      if (dept && deptHasChildren(dept.id)) {
        sendError(res, '1002', '该部门下存在子部门，不允许删除');
        return;
      }
      deptCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteDept',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      const hasChildren = ids.some(id => deptHasChildren(id));
      if (hasChildren) {
        sendError(res, '1002', '所选部门中包含存在子部门的部门，不允许删除');
        return;
      }
      deptCrud.batchRemove(ids);
      sendData(res, null);
    }
  },

  // ---------------- api resource ----------------
  {
    method: 'GET',
    path: '/systemManage/getApiList',
    handler({ res, query }) {
      const apis = store.apis.filter(
        api =>
          contains(api.apiName, query.get('apiName')) &&
          contains(api.apiPath, query.get('apiPath')) &&
          equals(api.apiMethod, query.get('apiMethod')) &&
          contains(api.apiModule, query.get('apiModule')) &&
          equals(api.status, query.get('status'))
      );
      sendData(res, paginate(apis, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addApi',
    handler({ res, body }) {
      const conflict = store.apis.find(api => api.apiPath === body?.apiPath && api.apiMethod === body?.apiMethod);
      if (conflict) {
        sendError(res, '1001', `接口 ${body?.apiMethod} ${body?.apiPath} 已存在`);
        return;
      }
      apiCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateApi',
    handler({ res, body }) {
      const conflict = store.apis.find(
        api => api.apiPath === body?.apiPath && api.apiMethod === body?.apiMethod && api.id !== body?.id
      );
      if (conflict) {
        sendError(res, '1001', `接口 ${body?.apiMethod} ${body?.apiPath} 已存在`);
        return;
      }
      apiCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteApi',
    handler({ res, body }) {
      apiCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteApi',
    handler({ res, body }) {
      apiCrud.batchRemove(body?.ids || []);
      sendData(res, null);
    }
  },

  // ---------------- button resource ----------------
  {
    method: 'GET',
    path: '/systemManage/getButtonList',
    handler({ res, query }) {
      const buttons = store.buttons.filter(
        button =>
          contains(button.buttonCode, query.get('buttonCode')) &&
          contains(button.buttonName, query.get('buttonName')) &&
          contains(button.menuName, query.get('menuName')) &&
          equals(button.status, query.get('status'))
      );
      sendData(res, paginate(buttons, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/addButton',
    handler({ res, body }) {
      if (store.buttons.some(button => button.buttonCode === body?.buttonCode)) {
        sendError(res, '1001', `按钮编码 ${body?.buttonCode} 已存在`);
        return;
      }
      buttonCrud.add(body);
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/systemManage/updateButton',
    handler({ res, body }) {
      const conflict = store.buttons.find(button => button.buttonCode === body?.buttonCode && button.id !== body?.id);
      if (conflict) {
        sendError(res, '1001', `按钮编码 ${body?.buttonCode} 已存在`);
        return;
      }
      buttonCrud.update(body);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteButton',
    handler({ res, body }) {
      buttonCrud.remove(body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteButton',
    handler({ res, body }) {
      buttonCrud.batchRemove(body?.ids || []);
      sendData(res, null);
    }
  },

  // ---------------- login log ----------------
  {
    method: 'GET',
    path: '/systemManage/getLoginLogList',
    handler({ res, query }) {
      const logs = store.loginLogs.filter(
        log =>
          contains(log.userName, query.get('userName')) &&
          contains(log.ipaddr, query.get('ipaddr')) &&
          equals(log.status, query.get('status'))
      );
      sendData(res, paginate(logs, query));
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteLoginLog',
    handler({ res, body }) {
      store.loginLogs = store.loginLogs.filter(log => log.id !== body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteLoginLog',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      store.loginLogs = store.loginLogs.filter(log => !ids.includes(log.id));
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/clearLoginLog',
    handler({ res }) {
      store.loginLogs = [];
      sendData(res, null);
    }
  },

  // ---------------- operate log ----------------
  {
    method: 'GET',
    path: '/systemManage/getOperateLogList',
    handler({ res, query }) {
      const logs = store.operateLogs.filter(
        log =>
          contains(log.title, query.get('title')) &&
          contains(log.userName, query.get('userName')) &&
          equals(log.businessType, query.get('businessType'))
      );
      sendData(res, paginate(logs, query));
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/deleteOperateLog',
    handler({ res, body }) {
      store.operateLogs = store.operateLogs.filter(log => log.id !== body?.id);
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/batchDeleteOperateLog',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      store.operateLogs = store.operateLogs.filter(log => !ids.includes(log.id));
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/systemManage/clearOperateLog',
    handler({ res }) {
      store.operateLogs = [];
      sendData(res, null);
    }
  },

  // ---------------- online user ----------------
  {
    method: 'GET',
    path: '/systemManage/getOnlineUserList',
    handler({ res, query }) {
      const users = store.onlineUsers.filter(
        user => contains(user.userName, query.get('userName')) && contains(user.ipaddr, query.get('ipaddr'))
      );
      sendData(res, paginate(users, query));
    }
  },
  {
    method: 'POST',
    path: '/systemManage/forceLogout',
    handler({ res, body }) {
      const ids: number[] = body?.ids || [];
      store.onlineUsers = store.onlineUsers.filter(user => !ids.includes(user.id));
      sendData(res, null);
    }
  }
];

export interface MockRequestOptions {
  /** Local monitor fixtures are enabled in hybrid/custom development modes. */
  includeMonitor?: boolean;
}

/** handle one request if it matches a local mock route; otherwise fall through */
export async function handleMockRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
  options: MockRequestOptions = {}
) {
  const url = new URL(req.url || '/', 'http://localhost');
  const route = url.pathname.slice(PROXY_PREFIX.length);
  const method = (req.method || 'GET').toUpperCase();

  const matched = routes.find(
    item =>
      item.method === method &&
      (item.path === route ||
        (item.path.includes('/:') &&
          item.path.split('/').length === route.split('/').length &&
          item.path
            .split('/')
            .every((segment, index) => segment.startsWith(':') || segment === route.split('/')[index]))) &&
      (options.includeMonitor || !monitorRoutes.includes(item) || !item.path.startsWith('/v1/gateway/monitor/'))
  );

  if (!matched) {
    // unmatched endpoints keep going to the remote proxy
    next();
    return;
  }

  const body = method === 'GET' || method === 'HEAD' ? {} : await readBody(req);

  try {
    await matched.handler({ req, res, query: url.searchParams, body, url });
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ message: `[local mock] ${String(error)}` }));
  }
}

export const MOCK_PROXY_PREFIX = PROXY_PREFIX;
