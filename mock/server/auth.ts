import type { MockRoute } from './types';
import { sendError, sendData } from './response';
import { db, store } from './db';

/**
 * local mock handlers for the auth management pages (user / role / dept / menu / resource).
 *
 * the captured fixtures in mock/db keep the legacy string-typed shape (status '1'/'2',
 * numeric ids), while the v1 gateway contract uses numeric status and string ids —
 * this module adapts fixtures into the v1 shape once at startup and keeps a mutable
 * in-memory copy so create/update/delete work during a dev-server session.
 */

/** legacy fixture status '1'/'2' → v1 1/0 */
function toStatus(value: unknown): number {
  return value === '2' ? 0 : 1;
}

function nowText(): string {
  return new Date().toLocaleString('sv-SE').replace('T', ' ');
}

interface V1User {
  id: string;
  userName: string;
  userGender: number;
  nickName: string;
  avatar: string;
  userPhone: string;
  userEmail: string;
  userRoles: string[];
  deptId: string;
  status: number;
  createTime: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

interface V1Role {
  id: string;
  roleName: string;
  roleCode: string;
  roleDesc: string;
  status: number;
  createTime: string;
}

interface V1Dept {
  id: string;
  parentId: string;
  deptName: string;
  leader: string;
  phone: string;
  email: string;
  order: number;
  status: number;
  children?: V1Dept[];
}

interface V1Menu {
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
  buttons: unknown[];
  createTime: string;
}

interface V1Api {
  id: string;
  apiName: string;
  apiPath: string;
  apiMethod: string;
  apiModule: string;
  status: number;
  remark: string;
  createTime: string;
}

interface V1Button {
  id: string;
  buttonCode: string;
  buttonName: string;
  menuName: string;
  status: number;
  remark: string;
  createTime: string;
}

const deptIds = store.depts.map(dept => String(dept.id));

const users: V1User[] = store.users.map((user, index) => ({
  id: String(user.id),
  userName: String(user.userName ?? ''),
  userGender: Number(user.userGender ?? 0) || 0,
  nickName: String(user.nickName ?? ''),
  avatar: '',
  userPhone: String(user.userPhone ?? ''),
  userEmail: String(user.userEmail ?? ''),
  userRoles: (user.userRoles as string[]) ?? [],
  deptId: deptIds[index % deptIds.length] ?? '100',
  status: toStatus(user.status),
  createTime: String(user.createTime ?? nowText())
}));

const roles: V1Role[] = store.roles.map(role => ({
  id: String(role.id),
  roleName: String(role.roleName ?? ''),
  roleCode: String(role.roleCode ?? ''),
  roleDesc: String(role.roleDesc ?? ''),
  status: toStatus(role.status),
  createTime: String(role.createTime ?? nowText())
}));

const depts: V1Dept[] = store.depts.map(dept => ({
  id: String(dept.id),
  parentId: String(dept.parentId ?? 0),
  deptName: String(dept.deptName ?? ''),
  leader: String(dept.leader ?? ''),
  phone: String(dept.phone ?? ''),
  email: String(dept.email ?? ''),
  order: Number(dept.order ?? 1),
  status: toStatus(dept.status)
}));

const menus: V1Menu[] = store.menus.map(menu => ({
  id: String(menu.id),
  parentId: String(menu.parentId ?? 0),
  menuType: String(menu.menuType ?? '2'),
  menuName: String(menu.menuName ?? ''),
  routeName: String(menu.routeName ?? ''),
  routePath: String(menu.routePath ?? ''),
  component: String(menu.component ?? ''),
  icon: String(menu.icon ?? ''),
  iconType: String(menu.iconType ?? '1'),
  status: toStatus(menu.status),
  order: Number(menu.order ?? 1),
  i18nKey: String(menu.i18nKey ?? ''),
  keepAlive: Boolean(menu.keepAlive),
  constant: Boolean(menu.constant),
  href: '',
  hideInMenu: Boolean(menu.hideInMenu),
  activeMenu: '',
  multiTab: false,
  buttons: [],
  createTime: String(menu.createTime ?? nowText())
}));

const apis: V1Api[] = store.apis.map(item => ({
  id: String(item.id),
  apiName: String(item.apiName ?? ''),
  apiPath: String(item.apiPath ?? ''),
  apiMethod: String(item.apiMethod ?? 'GET'),
  apiModule: String(item.apiModule ?? ''),
  status: toStatus(item.status),
  remark: String(item.remark ?? ''),
  createTime: String(item.createTime ?? nowText())
}));

const buttons: V1Button[] = store.buttons.map(item => ({
  id: String(item.id),
  buttonCode: String(item.buttonCode ?? ''),
  buttonName: String(item.buttonName ?? ''),
  menuName: String(item.menuName ?? ''),
  status: toStatus(item.status),
  remark: String(item.remark ?? ''),
  createTime: String(item.createTime ?? nowText())
}));

/** roleId → granted ids */
const rolePermissions = new Map<string, { menuIds: string[]; apiIds: string[]; buttonIds: string[] }>();

let nextUserId = Math.max(0, ...users.map(user => Number(user.id) || 0)) + 1;
let nextRoleId = Math.max(0, ...roles.map(role => Number(role.id) || 0)) + 1;
let nextDeptId = Math.max(0, ...depts.map(dept => Number(dept.id) || 0)) + 1;
let nextMenuId = Math.max(0, ...menus.map(menu => Number(menu.id) || 0)) + 1;
let nextApiId = Math.max(0, ...apis.map(item => Number(item.id) || 0)) + 1;
let nextButtonId = Math.max(0, ...buttons.map(item => Number(item.id) || 0)) + 1;

function contains(value: unknown, keyword: unknown): boolean {
  if (keyword === undefined || keyword === null || keyword === '') return true;
  return String(value ?? '')
    .toLowerCase()
    .includes(String(keyword).toLowerCase());
}

function pageOf<T>(
  records: T[],
  body: Record<string, any>
): { records: T[]; current: number; size: number; total: number } {
  const current = Math.max(1, Number(body?.current ?? 1));
  const size = Math.max(1, Number(body?.size ?? 10));
  const start = (current - 1) * size;
  return { records: records.slice(start, start + size), current, size, total: records.length };
}

function buildDeptTree(filter?: (dept: V1Dept) => boolean): V1Dept[] {
  const match = (dept: V1Dept) => (filter ? filter(dept) : true);
  const build = (parentId: string, inherited: boolean): V1Dept[] =>
    depts
      .filter(dept => dept.parentId === parentId)
      .map(dept => {
        const children = build(dept.id, inherited || match(dept));
        return { ...dept, children };
      })
      .filter(dept => match(dept) || (dept.children && dept.children.length > 0));
  return build('0', false);
}

interface MenuTreeNode {
  id: string;
  label: string;
  i18nKey: string;
  pId: string;
  children: MenuTreeNode[];
}

function buildMenuTree(): MenuTreeNode[] {
  const build = (parentId: string): MenuTreeNode[] =>
    menus
      .filter(menu => menu.parentId === parentId)
      .map(menu => ({
        id: menu.id,
        label: menu.menuName,
        i18nKey: menu.i18nKey,
        pId: menu.parentId,
        children: build(menu.id)
      }));
  return build('0');
}

function removeByIds<T extends { id: string }>(list: T[], ids: string[]): void {
  for (const id of ids) {
    const index = list.findIndex(item => item.id === String(id));
    if (index >= 0) list.splice(index, 1);
  }
}

function idFromPath(url: URL): string {
  const segments = url.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? '';
}

/** decode the userName embedded in the mock JWT payload (no signature check, mock only) */
function decodeTokenUser(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const parts = authorization.replace(/^Bearer\s+/i, '').split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return payload?.data?.[0]?.userName ?? payload?.userName ?? payload?.sub ?? null;
  } catch {
    return null;
  }
}

function findUserByToken(authorization: string | undefined): V1User | null {
  const userName = decodeTokenUser(authorization);
  if (!userName) return null;
  const existing = users.find(user => user.userName === userName);
  if (existing) return existing;
  // mock login accounts (Super/Admin/User) are not part of the captured user table —
  // register them on first access so their own profile is available
  const created: V1User = {
    id: String(900_000 + nextUserId++),
    userName,
    userGender: 1,
    nickName: userName === 'Super' ? '超级管理员' : userName,
    avatar: '',
    userPhone: '13800000000',
    userEmail: `${userName.toLowerCase()}@welkin.com`,
    userRoles: [userName === 'Super' ? 'R_SUPER' : 'R_USER'],
    deptId: deptIds[0] ?? '100',
    status: 1,
    createTime: nowText()
  };
  users.push(created);
  return created;
}

export const authMockRoutes: MockRoute[] = [
  // ---------------- user ----------------
  {
    method: 'POST',
    path: '/v1/iam/user/page',
    handler({ res, body }) {
      const params = body ?? {};
      const records = users.filter(
        user =>
          contains(user.userName, params.userName) &&
          contains(user.nickName, params.nickName) &&
          contains(user.userPhone, params.userPhone) &&
          contains(user.userEmail, params.userEmail) &&
          (params.userGender === undefined ||
            Number(params.userGender) === 0 ||
            user.userGender === Number(params.userGender)) &&
          (params.status === undefined || user.status === Number(params.status))
      );
      sendData(res, pageOf(records, params));
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/user/detail/:id',
    handler({ res, url }) {
      const user = users.find(item => item.id === idFromPath(url));
      if (!user) {
        sendError(res, '1000', '用户不存在（Mock）');
        return;
      }
      sendData(res, { ...user, failedAttempts: 0 });
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/user/create',
    handler({ res, body }) {
      const data = body ?? {};
      const id = String(nextUserId++);
      users.unshift({
        id,
        userName: String(data.userName ?? ''),
        userGender: Number(data.userGender ?? 0),
        nickName: String(data.nickName ?? ''),
        avatar: '',
        userPhone: String(data.userPhone ?? ''),
        userEmail: String(data.userEmail ?? ''),
        userRoles: data.userRoles ?? [],
        deptId: String(data.deptId ?? '100'),
        status: Number(data.status ?? 1),
        createTime: nowText()
      });
      sendData(res, { id, tempPassword: '123456' });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/user/update/:id',
    handler({ res, url, body }) {
      const id = idFromPath(url);
      const user = users.find(item => item.id === id);
      if (!user) {
        sendError(res, '1000', '用户不存在（Mock）');
        return;
      }
      Object.assign(user, {
        userName: body?.userName ?? user.userName,
        userGender: body?.userGender ?? user.userGender,
        nickName: body?.nickName ?? user.nickName,
        userPhone: body?.userPhone ?? user.userPhone,
        userEmail: body?.userEmail ?? user.userEmail,
        userRoles: body?.userRoles ?? user.userRoles,
        deptId: body?.deptId ? String(body.deptId) : user.deptId,
        status: body?.status ?? user.status
      });
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/user/status/:id',
    handler({ res, url, body }) {
      const user = users.find(item => item.id === idFromPath(url));
      if (user) user.status = Number(body?.status ?? 1);
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/user/password/reset/:id',
    handler({ res }) {
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/user/delete',
    handler({ res, body }) {
      removeByIds(users, body?.ids ?? []);
      sendData(res, null);
    }
  },

  // ---------------- role ----------------
  {
    method: 'POST',
    path: '/v1/iam/role/page',
    handler({ res, body }) {
      const params = body ?? {};
      const records = roles.filter(
        role =>
          contains(role.roleName, params.roleName) &&
          contains(role.roleCode, params.roleCode) &&
          (params.status === undefined || role.status === Number(params.status))
      );
      sendData(res, pageOf(records, params));
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/role/all',
    handler({ res }) {
      sendData(res, roles);
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/role/create',
    handler({ res, body }) {
      const id = String(nextRoleId++);
      roles.unshift({
        id,
        roleName: String(body?.roleName ?? ''),
        roleCode: String(body?.roleCode ?? ''),
        roleDesc: String(body?.roleDesc ?? ''),
        status: Number(body?.status ?? 1),
        createTime: nowText()
      });
      sendData(res, { id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/role/update/:id',
    handler({ res, url, body }) {
      const role = roles.find(item => item.id === idFromPath(url));
      if (role) {
        Object.assign(role, {
          roleName: body?.roleName ?? role.roleName,
          roleCode: body?.roleCode ?? role.roleCode,
          roleDesc: body?.roleDesc ?? role.roleDesc,
          status: body?.status ?? role.status
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/role/delete',
    handler({ res, body }) {
      removeByIds(roles, body?.ids ?? []);
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/role/:id/permissions',
    handler({ res, url }) {
      const roleId = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
      sendData(
        res,
        rolePermissions.get(roleId) ?? {
          menuIds: menus.slice(0, 4).map(menu => menu.id),
          apiIds: apis.slice(0, 3).map(api => api.id),
          buttonIds: buttons.slice(0, 2).map(button => button.id)
        }
      );
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/role/:id/permissions',
    handler({ res, url, body }) {
      const roleId = url.pathname.split('/').filter(Boolean).at(-2) ?? '';
      rolePermissions.set(roleId, {
        menuIds: body?.menuIds ?? [],
        apiIds: body?.apiIds ?? [],
        buttonIds: body?.buttonIds ?? []
      });
      sendData(res, null);
    }
  },

  // ---------------- dept ----------------
  {
    method: 'POST',
    path: '/v1/iam/dept/tree',
    handler({ res, body }) {
      const tree = buildDeptTree(
        body?.deptName || body?.status !== undefined
          ? dept =>
              contains(dept.deptName, body?.deptName) &&
              (body?.status === undefined || dept.status === Number(body.status))
          : undefined
      );
      sendData(res, tree);
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/dept/create',
    handler({ res, body }) {
      const id = String(nextDeptId++);
      depts.push({
        id,
        parentId: String(body?.parentId ?? '0'),
        deptName: String(body?.deptName ?? ''),
        leader: String(body?.leader ?? ''),
        phone: String(body?.phone ?? ''),
        email: String(body?.email ?? ''),
        order: Number(body?.order ?? 1),
        status: Number(body?.status ?? 1)
      });
      sendData(res, { id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/dept/update/:id',
    handler({ res, url, body }) {
      const dept = depts.find(item => item.id === idFromPath(url));
      if (dept) {
        Object.assign(dept, {
          parentId: body?.parentId ? String(body.parentId) : dept.parentId,
          deptName: body?.deptName ?? dept.deptName,
          leader: body?.leader ?? dept.leader,
          phone: body?.phone ?? dept.phone,
          email: body?.email ?? dept.email,
          order: body?.order ?? dept.order,
          status: body?.status ?? dept.status
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/dept/delete',
    handler({ res, body }) {
      removeByIds(depts, body?.ids ?? []);
      sendData(res, null);
    }
  },

  // ---------------- menu ----------------
  {
    method: 'POST',
    path: '/v1/iam/menu/page',
    handler({ res, body }) {
      const params = body ?? {};
      const records = menus.filter(
        menu =>
          contains(menu.menuName, params.menuName) &&
          (!params.menuType || menu.menuType === String(params.menuType)) &&
          (params.status === undefined || menu.status === Number(params.status))
      );
      sendData(res, pageOf(records, params));
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/menu/tree',
    handler({ res }) {
      sendData(res, buildMenuTree());
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/menu/pages',
    handler({ res }) {
      sendData(res, db.allPages);
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/menu/create',
    handler({ res, body }) {
      const id = String(nextMenuId++);
      menus.push({
        id,
        parentId: String(body?.parentId ?? '0'),
        menuType: String(body?.menuType ?? '2'),
        menuName: String(body?.menuName ?? ''),
        routeName: String(body?.routeName ?? ''),
        routePath: String(body?.routePath ?? ''),
        component: String(body?.component ?? ''),
        icon: String(body?.icon ?? ''),
        iconType: String(body?.iconType ?? '1'),
        status: Number(body?.status ?? 1),
        order: Number(body?.order ?? 1),
        i18nKey: String(body?.i18nKey ?? ''),
        keepAlive: Boolean(body?.keepAlive),
        constant: Boolean(body?.constant),
        href: String(body?.href ?? ''),
        hideInMenu: Boolean(body?.hideInMenu),
        activeMenu: String(body?.activeMenu ?? ''),
        multiTab: Boolean(body?.multiTab),
        buttons: body?.buttons ?? [],
        createTime: nowText()
      });
      sendData(res, { id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/menu/update/:id',
    handler({ res, url, body }) {
      const menu = menus.find(item => item.id === idFromPath(url));
      if (menu) {
        Object.assign(menu, {
          parentId: body?.parentId ? String(body.parentId) : menu.parentId,
          menuType: body?.menuType ?? menu.menuType,
          menuName: body?.menuName ?? menu.menuName,
          routeName: body?.routeName ?? menu.routeName,
          routePath: body?.routePath ?? menu.routePath,
          component: body?.component ?? menu.component,
          icon: body?.icon ?? menu.icon,
          iconType: body?.iconType ?? menu.iconType,
          status: body?.status ?? menu.status,
          order: body?.order ?? menu.order,
          i18nKey: body?.i18nKey ?? menu.i18nKey,
          href: body?.href ?? menu.href,
          hideInMenu: body?.hideInMenu ?? menu.hideInMenu,
          activeMenu: body?.activeMenu ?? menu.activeMenu,
          multiTab: body?.multiTab ?? menu.multiTab
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/menu/delete',
    handler({ res, body }) {
      removeByIds(menus, body?.ids ?? []);
      sendData(res, null);
    }
  },

  // ---------------- api resource ----------------
  {
    method: 'POST',
    path: '/v1/iam/apiResource/page',
    handler({ res, body }) {
      const params = body ?? {};
      const records = apis.filter(
        item =>
          contains(item.apiName, params.apiName) &&
          contains(item.apiPath, params.apiPath) &&
          (!params.apiMethod || item.apiMethod === String(params.apiMethod)) &&
          contains(item.apiModule, params.apiModule) &&
          (params.status === undefined || item.status === Number(params.status))
      );
      sendData(res, pageOf(records, params));
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/apiResource/create',
    handler({ res, body }) {
      const id = String(nextApiId++);
      apis.unshift({
        id,
        apiName: String(body?.apiName ?? ''),
        apiPath: String(body?.apiPath ?? ''),
        apiMethod: String(body?.apiMethod ?? 'GET'),
        apiModule: String(body?.apiModule ?? ''),
        status: Number(body?.status ?? 1),
        remark: String(body?.remark ?? ''),
        createTime: nowText()
      });
      sendData(res, { id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/apiResource/update/:id',
    handler({ res, url, body }) {
      const item = apis.find(api => api.id === idFromPath(url));
      if (item) {
        Object.assign(item, {
          apiName: body?.apiName ?? item.apiName,
          apiPath: body?.apiPath ?? item.apiPath,
          apiMethod: body?.apiMethod ?? item.apiMethod,
          apiModule: body?.apiModule ?? item.apiModule,
          status: body?.status ?? item.status,
          remark: body?.remark ?? item.remark
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/apiResource/delete',
    handler({ res, body }) {
      removeByIds(apis, body?.ids ?? []);
      sendData(res, null);
    }
  },

  // ---------------- button resource ----------------
  {
    method: 'POST',
    path: '/v1/iam/buttonResource/page',
    handler({ res, body }) {
      const params = body ?? {};
      const records = buttons.filter(
        item =>
          contains(item.buttonCode, params.buttonCode) &&
          contains(item.buttonName, params.buttonName) &&
          contains(item.menuName, params.menuName) &&
          (params.status === undefined || item.status === Number(params.status))
      );
      sendData(res, pageOf(records, params));
    }
  },
  {
    method: 'POST',
    path: '/v1/iam/buttonResource/create',
    handler({ res, body }) {
      const id = String(nextButtonId++);
      buttons.unshift({
        id,
        buttonCode: String(body?.buttonCode ?? ''),
        buttonName: String(body?.buttonName ?? ''),
        menuName: String(body?.menuName ?? ''),
        status: Number(body?.status ?? 1),
        remark: String(body?.remark ?? ''),
        createTime: nowText()
      });
      sendData(res, { id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/buttonResource/update/:id',
    handler({ res, url, body }) {
      const item = buttons.find(button => button.id === idFromPath(url));
      if (item) {
        Object.assign(item, {
          buttonCode: body?.buttonCode ?? item.buttonCode,
          buttonName: body?.buttonName ?? item.buttonName,
          menuName: body?.menuName ?? item.menuName,
          status: body?.status ?? item.status,
          remark: body?.remark ?? item.remark
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/buttonResource/delete',
    handler({ res, body }) {
      removeByIds(buttons, body?.ids ?? []);
      sendData(res, null);
    }
  },

  // ---------------- profile (user center) ----------------
  {
    method: 'GET',
    path: '/v1/iam/profile',
    handler({ req, res }) {
      const user = findUserByToken(req.headers.authorization);
      if (!user) {
        sendError(res, '3333', '用户已失效或不存在');
        return;
      }
      const dept = depts.find(item => item.id === user.deptId);
      sendData(res, {
        userId: user.id,
        userName: user.userName,
        nickName: user.nickName,
        avatar: user.avatar,
        phone: user.userPhone,
        email: user.userEmail,
        gender: user.userGender,
        roles: user.userRoles,
        deptId: user.deptId,
        department: dept?.deptName ?? '',
        lastLoginAt: nowText(),
        lastLoginIp: '192.168.1.8'
      });
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/profile',
    handler({ req, res, body }) {
      const user = findUserByToken(req.headers.authorization);
      if (user) {
        Object.assign(user, {
          nickName: body?.nickName ?? user.nickName,
          userPhone: body?.phone ?? user.userPhone,
          userEmail: body?.email ?? user.userEmail,
          userGender: body?.gender ?? user.userGender,
          avatar: body?.avatar ?? user.avatar,
          deptId: body?.deptId ? String(body.deptId) : user.deptId
        });
      }
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/iam/profile/password',
    handler({ res, body }) {
      if (body?.currentPassword && body.currentPassword !== '123456') {
        sendError(res, '1000', '当前密码不正确（Mock，默认 123456）');
        return;
      }
      sendData(res, null);
    }
  },
  {
    method: 'GET',
    path: '/v1/iam/profile/sessions',
    handler({ req, res }) {
      const user = findUserByToken(req.headers.authorization) ?? users[0];
      const future = (days: number) => {
        const date = new Date(Date.now() + days * 86_400_000);
        return date.toLocaleString('sv-SE').replace('T', ' ');
      };
      const past = (days: number) => future(-days);
      sendData(res, [
        {
          id: `${user.id}-1`,
          userName: user.userName,
          loginType: 1,
          ip: '192.168.1.8',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0',
          refreshExpiresAt: future(6),
          createdAt: past(1)
        },
        {
          id: `${user.id}-2`,
          userName: user.userName,
          loginType: 1,
          ip: '10.20.30.12',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/18.0',
          refreshExpiresAt: future(12),
          createdAt: past(4)
        },
        {
          id: `${user.id}-3`,
          userName: user.userName,
          loginType: 1,
          ip: '172.16.4.55',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/140.0',
          refreshExpiresAt: past(2),
          revokedAt: past(2),
          createdAt: past(9)
        }
      ]);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/iam/profile/sessions/:id',
    handler({ res }) {
      sendData(res, null);
    }
  }
];
