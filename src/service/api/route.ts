import { alova } from '../request';
import type { RouteMeta } from 'vue-router';

/** backend menu item (GET /v1/iam/route/*) */
interface BackendMenuItem {
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
  fixedIndexInTab?: number | null;
  query?: { key: string; value: string }[];
  children?: BackendMenuItem[];
}

/** convert backend menu item to frontend menu route */
function toMenuRoute(item: BackendMenuItem): Api.Route.MenuRoute {
  const meta: RouteMeta = {
    title: item.menuName || item.routeName,
    i18nKey: (item.i18nKey || null) as App.I18n.I18nKey | null,
    icon: item.iconType === '2' ? undefined : item.icon || undefined,
    localIcon: item.iconType === '2' ? item.icon || undefined : undefined,
    order: item.order,
    keepAlive: item.keepAlive,
    constant: item.constant,
    href: item.href || null,
    hideInMenu: item.hideInMenu,
    activeMenu: (item.activeMenu || null) as RouteMeta['activeMenu'],
    multiTab: item.multiTab,
    fixedIndexInTab: item.fixedIndexInTab ?? null,
    query: Array.isArray(item.query) ? item.query : []
  };
  return {
    id: item.id,
    name: item.routeName,
    path: item.routePath,
    component: item.component || undefined,
    meta,
    children: item.children?.map(toMenuRoute)
  };
}

/** get constant routes */
export async function fetchGetConstantRoutes() {
  const data = await alova.Get<BackendMenuItem[]>('/v1/iam/route/constant');
  return data.map(toMenuRoute);
}

/** get user routes */
export async function fetchGetUserRoutes(): Promise<Api.Route.UserRoute> {
  const data = await alova.Get<{ routes: BackendMenuItem[]; home: string }>('/v1/iam/route/user');
  return {
    routes: data.routes.map(toMenuRoute),
    home: data.home as Api.Route.UserRoute['home']
  };
}

/**
 * whether the route is exist
 *
 * @param routeName route name
 */
export function fetchIsRouteExist(routeName: string) {
  return alova.Get<boolean>('/v1/iam/route/exists', { params: { routeName } });
}
