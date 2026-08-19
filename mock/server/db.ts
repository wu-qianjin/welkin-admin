import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** read a json file from mock/db (resolved from the vite project root) */
function readDb<T>(name: string): T {
  const file = resolve(process.cwd(), 'mock/db', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}

export interface MockUser {
  id: number;
  userName: string;
  userGender: string;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userRoles: string[];
  status: string;
  [key: string]: unknown;
}

export interface MockRole {
  id: number;
  roleName: string;
  roleCode: string;
  roleDesc: string;
  status: string;
  [key: string]: unknown;
}

export interface MockMenu {
  id: number;
  parentId: number;
  menuType: string;
  menuName: string;
  routeName: string;
  routePath?: string;
  component?: string;
  i18nKey?: string;
  icon?: string;
  order?: number;
  hideInMenu?: boolean;
  status: string;
  children?: MockMenu[];
  [key: string]: unknown;
}

interface PaginatingRecord<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
}

/** immutable reference data captured from the remote apifox mock */
export const db = {
  loginTokens:
    readDb<Record<string, { token?: string; accessToken?: string; refreshToken: string }>>('auth-login-tokens'),
  userInfos: readDb<Record<string, any>>('auth-user-infos'),
  refreshTokenData: readDb<{ token?: string; accessToken?: string; refreshToken: string }>('auth-refresh-token'),
  constantRoutes: readDb<any[]>('route-constant-routes'),
  userRoutes: readDb<any>('route-user-routes'),
  allRoles: readDb<any[]>('sm-all-roles'),
  allPages: readDb<string[]>('sm-all-pages')
};

export interface MockConfig {
  id: number;
  paramName: string;
  paramKey: string;
  paramValue: string;
  builtIn: string;
  remark?: string;
  status: string;
  [key: string]: unknown;
}

export interface MockFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  bizType?: string | null;
  createBy: string;
  createTime: string;
}

export interface MockNotice {
  id: number;
  title: string;
  noticeType: string;
  noticeStatus: string;
  isTop: boolean;
  content: string;
  status: string;
  [key: string]: unknown;
}

export interface MockDictType {
  id: number;
  dictName: string;
  dictType: string;
  module: string;
  remark?: string;
  status: string;
  [key: string]: unknown;
}

export interface MockDictOption {
  id: number;
  dictType: string;
  optionLabel: string;
  optionValue: string;
  sort: number;
  colorTag?: string | null;
  remark?: string;
  status: string;
  [key: string]: unknown;
}

export interface MockDept {
  id: number;
  deptName: string;
  parentId: number;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  order: number;
  status: string;
  children?: MockDept[];
  [key: string]: unknown;
}

export interface MockApi {
  id: number;
  apiName: string;
  apiPath: string;
  apiMethod: string;
  apiModule: string;
  remark?: string;
  status: string;
  [key: string]: unknown;
}

export interface MockButton {
  id: number;
  buttonCode: string;
  buttonName: string;
  menuName: string;
  remark?: string;
  status: string;
  [key: string]: unknown;
}

export interface MockLoginLog {
  id: number;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  status: string;
  msg: string;
  loginTime: string;
}

export interface MockOperateLog {
  id: number;
  title: string;
  businessType: string;
  userName: string;
  method: string;
  url: string;
  params?: string | null;
  code: string;
  costTime: number;
  ipaddr: string;
  operateTime: string;
}

export interface MockOnlineUser {
  id: number;
  tokenId: string;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: string;
}

/**
 * mutable in-memory state, initialized from the captured data.
 * write endpoints (addUser / updateUser / ...) mutate this copy so the
 * management pages are fully functional during a dev-server session.
 */
export const store = {
  users: readDb<PaginatingRecord<MockUser>>('sm-user-list').records,
  roles: readDb<PaginatingRecord<MockRole>>('sm-role-list').records,
  menus: readDb<PaginatingRecord<MockMenu>>('sm-menu-list').records,
  configs: readDb<PaginatingRecord<MockConfig>>('sm-configs').records,
  files: readDb<PaginatingRecord<MockFile>>('sm-files').records,
  notices: readDb<PaginatingRecord<MockNotice>>('sm-notices').records,
  dictTypes: readDb<PaginatingRecord<MockDictType>>('sm-dict-types').records,
  dictOptions: readDb<PaginatingRecord<MockDictOption>>('sm-dict-options').records,
  depts: readDb<PaginatingRecord<MockDept>>('sm-depts').records,
  apis: readDb<PaginatingRecord<MockApi>>('sm-apis').records,
  buttons: readDb<PaginatingRecord<MockButton>>('sm-buttons').records,
  loginLogs: readDb<PaginatingRecord<MockLoginLog>>('sm-login-logs').records,
  operateLogs: readDb<PaginatingRecord<MockOperateLog>>('sm-operate-logs').records,
  onlineUsers: readDb<PaginatingRecord<MockOnlineUser>>('sm-online-users').records
};

let nextUserId = Math.max(...store.users.map(u => u.id)) + 1;

export function addUser(user: Omit<MockUser, 'id'>) {
  store.users.unshift({ ...user, id: nextUserId++ } as MockUser);
}

export function updateUser(user: MockUser & { id: number }) {
  const index = store.users.findIndex(item => item.id === user.id);
  if (index >= 0) {
    store.users[index] = { ...store.users[index], ...user };
  }
}

export function deleteUser(id: number) {
  const index = store.users.findIndex(item => item.id === id);
  if (index >= 0) {
    store.users.splice(index, 1);
  }
}

export function batchDeleteUsers(ids: number[]) {
  store.users = store.users.filter(item => !ids.includes(item.id));
}

/** generic crud helpers for the simple record collections */
function createCrud<T extends { id: number }>(key: keyof typeof store) {
  const now = () => new Date().toLocaleString('sv-SE').replace('T', ' ');
  const nextId = () => {
    const records = store[key] as unknown as T[];
    return records.length ? Math.max(...records.map(item => item.id)) + 1 : 1;
  };

  return {
    add(data: Partial<Omit<T, 'id'>> & Record<string, unknown>) {
      const record = {
        createBy: 'Super',
        createTime: now(),
        updateBy: 'Super',
        updateTime: now(),
        status: '1',
        ...(data as object),
        id: nextId()
      } as unknown as T;
      (store[key] as unknown as T[]).unshift(record);
      return record;
    },
    update(data: T & Record<string, unknown>) {
      const records = store[key] as unknown as T[];
      const index = records.findIndex(item => item.id === data.id);
      if (index >= 0) {
        records[index] = { ...records[index], ...data, updateTime: now(), updateBy: 'Super' };
        return records[index];
      }
      return null;
    },
    remove(id: number) {
      const records = store[key] as unknown as T[];
      const index = records.findIndex(item => item.id === id);
      if (index >= 0) {
        records.splice(index, 1);
        return true;
      }
      return false;
    },
    batchRemove(ids: number[]) {
      store[key] = (store[key] as unknown as T[]).filter(item => !ids.includes(item.id)) as never;
    }
  };
}

export const configCrud = createCrud<MockConfig>('configs');
export const fileCrud = createCrud<MockFile>('files');
export const noticeCrud = createCrud<MockNotice>('notices');
export const dictTypeCrud = createCrud<MockDictType>('dictTypes');
export const dictOptionCrud = createCrud<MockDictOption>('dictOptions');
export const deptCrud = createCrud<MockDept>('depts');
export const apiCrud = createCrud<MockApi>('apis');
export const buttonCrud = createCrud<MockButton>('buttons');

/** build the dept tree from the flat dept store */
export function buildDeptTree(depts: MockDept[], parentId = 0): MockDept[] {
  return depts
    .filter(dept => dept.parentId === parentId)
    .map(dept => {
      const children = buildDeptTree(depts, dept.id);
      return { ...dept, children: children.length ? children : null } as MockDept;
    })
    .sort((a, b) => a.order - b.order);
}

/** whether a dept has child depts */
export function deptHasChildren(id: number): boolean {
  return store.depts.some(dept => dept.parentId === id);
}
