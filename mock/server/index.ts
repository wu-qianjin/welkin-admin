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
import type { MockDept, MockMenu } from './db';

const PROXY_PREFIX = '/proxy-default';
const SUCCESS = { code: '0000', msg: '请求成功' };

function sendJson(res: ServerResponse, payload: unknown) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendData(res: ServerResponse, data: unknown) {
  sendJson(res, { data, ...SUCCESS });
}

function sendError(res: ServerResponse, code: string, msg: string) {
  sendJson(res, { data: null, code, msg });
}

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
    return payload?.data?.[0]?.userName ?? null;
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

type MockHandler = (ctx: {
  req: IncomingMessage;
  res: ServerResponse;
  query: URLSearchParams;
  body: any;
  url: URL;
}) => Promise<void> | void;

const routes: Array<{ method: string; path: string; handler: MockHandler }> = [
  // ---------------- auth ----------------
  {
    method: 'POST',
    path: '/auth/login',
    async handler({ res, body }) {
      const account = db.loginTokens[body?.userName];
      if (account && body?.password === '123456') {
        sendData(res, account);
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
        sendData(res, db.refreshTokenData);
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
      if (code === '9999' && decodeTokenUser(req.headers.authorization) === 'Soybean') {
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
    handler({ res }) {
      sendData(res, null);
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
      sendData(res, db.userRoutes);
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

  // ---------------- dict ----------------
  {
    method: 'GET',
    path: '/systemManage/getDictTypeList',
    handler({ res, query }) {
      const types = store.dictTypes.filter(
        type =>
          contains(type.dictName, query.get('dictName')) &&
          contains(type.dictType, query.get('dictType')) &&
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

      // a dept matches when itself or any descendant matches every condition
      const deptMatches = (dept: MockDept): boolean => {
        const selfMatch = contains(dept.deptName, deptName) && equals(dept.status, status);
        const childMatch = (dept.children || []).some(deptMatches);
        return selfMatch || childMatch;
      };

      const tree = buildDeptTree(store.depts).filter(deptMatches);
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

/** handle one request if it matches a local mock route; otherwise fall through */
export async function handleMockRequest(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
  const url = new URL(req.url || '/', 'http://localhost');
  const route = url.pathname.slice(PROXY_PREFIX.length);
  const method = (req.method || 'GET').toUpperCase();

  const matched = routes.find(item => item.method === method && item.path === route);

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
