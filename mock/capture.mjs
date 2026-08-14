/**
 * One-off script: capture all Apifox mock API responses into mock/data/*.json
 * Run: node mock/capture.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://mock.apifox.cn/m1/3109515-0-default';
const TOKEN = 'XL299LiMEDZ0H5h3A29PxwQXdMJqWyY2';
const OUT_DIR = new URL('./data/', import.meta.url);

await mkdir(OUT_DIR, { recursive: true });

async function call(method, path, body, query) {
  const url = new URL(BASE + path);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', apifoxToken: TOKEN },
    ...(method === 'GET' ? {} : { body: body ? JSON.stringify(body) : undefined })
  });
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch {
    return { status: res.status, body: text.slice(0, 500) };
  }
}

const results = {};

async function capture(name, method, path, body, query) {
  try {
    const r = await call(method, path, body, query);
    results[name] = { method, path, query: query || null, ...r };
    console.log(`[ok] ${method} ${path} -> ${r.status}`);
  } catch (e) {
    console.log(`[fail] ${method} ${path}: ${e.message}`);
    results[name] = { method, path, query: query || null, error: e.message };
  }
}

await capture('auth-login-super', 'POST', '/auth/login', { userName: 'Super', password: '123456' });
await capture('auth-login-admin', 'POST', '/auth/login', { userName: 'Admin', password: '123456' });
await capture('auth-login-user', 'POST', '/auth/login', { userName: 'User', password: '123456' });
await capture('auth-get-user-info', 'GET', '/auth/getUserInfo');
await capture('auth-refresh-token', 'POST', '/auth/refreshToken', { refreshToken: 'mock' });
await capture('auth-error', 'GET', '/auth/error', null, { code: '8888', msg: 'custom error' });
await capture('auth-send-captcha', 'POST', '/auth/sendCaptcha', { phone: '13800138000' });
await capture('auth-verify-captcha', 'POST', '/auth/verifyCaptcha', { phone: '13800138000', code: '123456' });
await capture('route-get-constant-routes', 'GET', '/route/getConstantRoutes');
await capture('route-get-user-routes', 'GET', '/route/getUserRoutes');
await capture('route-is-route-exist', 'GET', '/route/isRouteExist', null, { routeName: 'home' });
await capture('sm-get-role-list', 'GET', '/systemManage/getRoleList', null, { current: 1, size: 10 });
await capture('sm-get-all-roles', 'GET', '/systemManage/getAllRoles');
await capture('sm-get-user-list', 'GET', '/systemManage/getUserList', null, { current: 1, size: 10 });
await capture('sm-get-menu-list', 'GET', '/systemManage/getMenuList/v2', null, { current: 1, size: 10 });
await capture('sm-get-all-pages', 'GET', '/systemManage/getAllPages');
await capture('sm-get-menu-tree', 'GET', '/systemManage/getMenuTree');
await capture('sm-add-user', 'POST', '/systemManage/addUser', {
  userName: 'x',
  userGender: 1,
  nickName: 'x',
  userPhone: '13800000000',
  userEmail: 'a@b.c',
  userRoles: ['R_USER'],
  status: 1
});
await capture('sm-update-user', 'POST', '/systemManage/updateUser', {
  userName: 'x',
  userGender: 1,
  nickName: 'x',
  userPhone: '13800000000',
  userEmail: 'a@b.c',
  userRoles: ['R_USER'],
  status: 1
});
await capture('sm-delete-user', 'DELETE', '/systemManage/deleteUser', { id: 1 });
await capture('sm-batch-delete-user', 'DELETE', '/systemManage/batchDeleteUser', { ids: [1, 2] });

await writeFile(new URL('./capture-result.json', OUT_DIR), JSON.stringify(results, null, 2));
console.log('saved to mock/data/capture-result.json');
