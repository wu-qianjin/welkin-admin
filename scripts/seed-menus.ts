/**
 * 菜单种子脚本：把 src/router/elegant/routes.ts 的静态路由导入后端 iam 菜单表，
 * 并创建"系统管理员/演示管理员"两个角色及菜单授权。
 *
 * 用法：IAM_USERNAME=admin IAM_PASSWORD=... npx tsx scripts/seed-menus.ts
 * 幂等：已存在的菜单（按 routeName）跳过；已存在的角色复用。
 */
import { generatedRoutes } from '../src/router/elegant/routes';

const IAM_BASE = process.env.IAM_BASE ?? 'http://127.0.0.1:8091';
const IAM_USERNAME = process.env.IAM_USERNAME;
const IAM_PASSWORD = process.env.IAM_PASSWORD;

// 系统管理员可见的顶级路由；其余演示页面归演示管理员。
const SYS_ADMIN_TOPS = new Set(['auth', 'system', 'monitor', 'about']);

let token = '';

async function api<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(`${IAM_BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const json = (await res.json()) as { code: number; message: string; data: T };
  if (json.code !== 0) throw new Error(`${method} ${url} -> ${json.code} ${json.message}`);
  return json.data;
}

async function login() {
  if (!IAM_USERNAME || !IAM_PASSWORD) {
    throw new Error('请设置 IAM_USERNAME 和 IAM_PASSWORD 后再执行菜单种子脚本');
  }
  const res = await fetch(`${IAM_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: IAM_USERNAME, password: IAM_PASSWORD })
  });
  const json = (await res.json()) as { code: number; message: string; data?: { accessToken?: string } };
  if (json.code !== 0 || !json.data?.accessToken) {
    throw new Error(`登录失败：${json.code} ${json.message}`);
  }
  token = json.data.accessToken;
}

interface MenuRow {
  id: string;
  parentId: string;
  routeName: string;
  constant: boolean;
}

async function loadExistingMenus(): Promise<MenuRow[]> {
  const rows: MenuRow[] = [];
  let current = 1;
  for (;;) {
    const page = await api<{ records: MenuRow[]; total: number }>('POST', '/menu/page', { current, size: 100 });
    rows.push(
      ...page.records.map(r => ({
        id: r.id,
        parentId: r.parentId,
        routeName: r.routeName,
        constant: r.constant === true
      }))
    );
    if (rows.length >= page.total) break;
    current += 1;
  }
  return rows;
}

// GeneratedRoute is a discriminated union: leaf routes deliberately omit
// `children` from their type. The seeding traversal needs one recursive view
// of that data, so narrow it once at the boundary instead of sprinkling casts.
interface SeedRoute {
  name: string;
  path: string;
  component?: string;
  meta?: Record<string, unknown>;
  children?: SeedRoute[];
}

const routes = generatedRoutes as unknown as SeedRoute[];

function menuTypeOf(route: SeedRoute): '1' | '2' {
  return route.children && route.children.length > 0 ? '1' : '2';
}

async function createMenu(route: SeedRoute, parentId: string): Promise<string> {
  const meta = (route.meta ?? {}) as Record<string, unknown>;
  const icon = typeof meta.localIcon === 'string' ? meta.localIcon : typeof meta.icon === 'string' ? meta.icon : '';
  const iconType = typeof meta.localIcon === 'string' ? '2' : '1';
  const data = await api<{ id: string }>('POST', '/menu/create', {
    parentId,
    menuType: menuTypeOf(route),
    menuName: String(meta.title ?? route.name),
    routeName: route.name,
    routePath: route.path,
    component: route.component ?? '',
    icon,
    iconType,
    status: 1,
    order: typeof meta.order === 'number' ? meta.order : 0,
    i18nKey: typeof meta.i18nKey === 'string' ? meta.i18nKey : '',
    keepAlive: meta.keepAlive === true,
    constant: meta.constant === true,
    href: typeof meta.href === 'string' ? meta.href : '',
    hideInMenu: meta.hideInMenu === true,
    activeMenu: typeof meta.activeMenu === 'string' ? meta.activeMenu : '',
    multiTab: meta.multiTab === true
  });
  console.log(`  + ${route.name} (${menuTypeOf(route) === '1' ? '目录' : '页面'})`);
  return data.id;
}

async function seedRoute(route: SeedRoute, parentId: string, byName: Map<string, string>): Promise<void> {
  let id = byName.get(route.name);
  if (!id) {
    id = await createMenu(route, parentId);
    byName.set(route.name, id);
  } else {
    console.log(`  = ${route.name} 已存在，跳过`);
  }
  for (const child of route.children ?? []) {
    await seedRoute(child, id, byName);
  }
}

async function main() {
  console.log('0. 以管理员身份登录...');
  await login();
  console.log('1. 同步现有菜单...');
  const existing = await loadExistingMenus();
  const byName = new Map(existing.map(m => [m.routeName, m.id]));
  for (const route of routes) {
    await seedRoute(route, '0', byName);
  }

  console.log('2. 确保角色存在...');
  const roles = await api<Array<{ id: string; roleCode: string }>>('GET', '/role/all');
  async function ensureRole(name: string, code: string): Promise<string> {
    const found = roles.find(r => r.roleCode === code);
    if (found) {
      console.log(`  = ${name}(${code}) 已存在`);
      return found.id;
    }
    const data = await api<{ id: string }>('POST', '/role/create', {
      roleName: name,
      roleCode: code,
      roleDesc: `${name}（seed-menus 创建）`,
      status: 1
    });
    console.log(`  + ${name}(${code})`);
    return data.id;
  }
  const sysRoleId = await ensureRole('系统管理员', 'R_SYS_ADMIN');
  const demoRoleId = await ensureRole('演示管理员', 'R_DEMO_ADMIN');
  const superRole = roles.find(r => r.roleCode === 'R_SUPER');
  if (!superRole) throw new Error('R_SUPER 角色不存在（种子数据未初始化）');

  console.log('3. 分配菜单权限...');
  // 重新拉取全量菜单以获得父子关系，计算各顶级目录下的全部后代。
  const menus = await loadExistingMenus();
  const idByRoute = new Map(menus.map(m => [m.id, m.routeName] as const));
  const childrenOf = new Map<string, string[]>();
  for (const m of menus) {
    const list = childrenOf.get(m.parentId) ?? [];
    list.push(m.id);
    childrenOf.set(m.parentId, list);
  }
  function descendants(id: string): string[] {
    return [id, ...(childrenOf.get(id) ?? []).flatMap(descendants)];
  }
  const topSys: string[] = [];
  const topDemo: string[] = [];
  for (const m of menus) {
    if (m.parentId !== '0' || m.constant) continue;
    const name = idByRoute.get(m.id) ?? '';
    (SYS_ADMIN_TOPS.has(name) ? topSys : topDemo).push(...descendants(m.id));
  }
  await api('PUT', `/role/${sysRoleId}/permissions`, { menuIds: topSys, apiIds: [], buttonIds: [] });
  await api('PUT', `/role/${demoRoleId}/permissions`, { menuIds: topDemo, apiIds: [], buttonIds: [] });
  // 超级管理员与普通角色一致走绑定表（后端不再特殊放行），绑全部非 constant 菜单。
  const superMenuIds = menus.filter(m => !m.constant).map(m => m.id);
  await api('PUT', `/role/${superRole.id}/permissions`, { menuIds: superMenuIds, apiIds: [], buttonIds: [] });
  console.log(
    `  系统管理员：${topSys.length}；演示管理员：${topDemo.length}；超级管理员：${superMenuIds.length} 个菜单`
  );
  console.log('完成。');
}

main().catch(err => {
  console.error('种子脚本失败:', err.message);
  process.exit(1);
});
