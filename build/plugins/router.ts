import type { RouteMeta } from 'vue-router';
import ElegantVueRouter from '@elegant-router/vue/vite';
import type { RouteKey } from '@elegant-router/types';

/**
 * Business menu metadata lives next to the route generator so a directory
 * move cannot silently remove icons, ordering, or RBAC rules from the menu.
 */
const routeMetaByName: Record<string, Partial<RouteMeta>> = {
  auth: { icon: 'mdi:shield-account-outline', order: 8, roles: ['R_ADMIN'] },
  auth_user: { icon: 'ic:round-manage-accounts', order: 1, roles: ['R_ADMIN'], keepAlive: true },
  auth_dept: { icon: 'mdi:account-multiple-outline', order: 2, roles: ['R_ADMIN'], keepAlive: true },
  auth_role: { icon: 'carbon:user-role', order: 3, roles: ['R_SUPER'], keepAlive: true },
  auth_menu: { icon: 'material-symbols:route', order: 4, roles: ['R_ADMIN'], keepAlive: true },
  auth_resource: { icon: 'mdi:api', order: 5, roles: ['R_SUPER'], keepAlive: true },
  'auth_user-detail': { hideInMenu: true, activeMenu: 'auth_user' },
  system: { icon: 'mdi:cog-outline', order: 9, roles: ['R_ADMIN'] },
  system_config: { icon: 'mdi:tune-variant', order: 1, roles: ['R_SUPER'], keepAlive: true },
  system_dict: { icon: 'mdi:bookshelf', order: 2, roles: ['R_SUPER'], keepAlive: true },
  system_notice: { icon: 'mdi:bullhorn-outline', order: 3, roles: ['R_ADMIN'], keepAlive: true },
  system_file: { icon: 'mdi:folder-file-outline', order: 4, roles: ['R_ADMIN'], keepAlive: true },
  monitor: { icon: 'mdi:monitor-dashboard', order: 10, roles: ['R_SUPER'] },
  monitor_overview: { icon: 'mdi:view-dashboard-outline', order: 1, roles: ['R_SUPER'], keepAlive: true },
  monitor_server: { icon: 'mdi:server', order: 2, roles: ['R_SUPER'], keepAlive: true },
  monitor_gateway: { icon: 'mdi:transit-connection-variant', order: 3, roles: ['R_SUPER'], keepAlive: true },
  monitor_alert: { icon: 'mdi:bell-alert-outline', order: 4, roles: ['R_SUPER'], keepAlive: true },
  monitor_log: { icon: 'mdi:file-document-multiple-outline', order: 5, roles: ['R_SUPER'], keepAlive: true },
  monitor_online: { icon: 'mdi:monitor-account', order: 6, roles: ['R_SUPER'], keepAlive: true },
  message: { icon: 'mdi:message-badge-outline', order: 2, hideInMenu: true },
  about: { order: 11 }
};

export function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue'
    },
    customRoutes: {
      names: [
        'exception_403',
        'exception_404',
        'exception_500',
        'document_vue',
        'document_vite',
        'document_unocss',
        'document_naive',
        'document_pro-naive',
        'document_antd',
        'document_alova'
      ]
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName as RouteKey;

      if (key === 'login') {
        const modules: UnionKey.LoginModule[] = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat'];

        const moduleReg = modules.join('|');

        return `/login/:module(${moduleReg})?`;
      }

      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName as RouteKey;

      const constantRoutes: RouteKey[] = ['login', '403', '404', '500'];

      const meta: Partial<RouteMeta> = {
        title: key,
        i18nKey: `route.${key}` as App.I18n.I18nKey
      };

      Object.assign(meta, routeMetaByName[routeName]);

      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }

      return meta;
    }
  });
}
