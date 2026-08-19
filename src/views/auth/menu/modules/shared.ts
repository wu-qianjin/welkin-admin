const LAYOUT_PREFIX = 'layout.';
const VIEW_PREFIX = 'view.';
const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

export interface PageEntry {
  routeName: string;
  viewPath: string;
}

const VIEW_PATH_PREFIX = '/src/views/';

export function normalizeViewPath(viewPath: string) {
  const normalized = viewPath
    .trim()
    .replace(/^@\//, '/src/')
    .replace(/^src\//, '/src/');

  return normalized.startsWith(VIEW_PATH_PREFIX) ? normalized : viewPath.trim();
}

export function getRouteNameByViewPath(viewPath: string) {
  const normalized = normalizeViewPath(viewPath);

  if (!normalized.startsWith(VIEW_PATH_PREFIX)) {
    return normalized;
  }

  const relativePath = normalized
    .slice(VIEW_PATH_PREFIX.length)
    .replace(/^_builtin\//, '')
    .replace(/(?:\/index|\/\[[^/]+\])\.vue$/, '');

  return relativePath.replaceAll('/', '_');
}

export function getLayoutAndPage(component?: string | null) {
  let layout = '';
  let page = '';

  const [layoutOrPage = '', pageItem = ''] = component?.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT) || [];

  layout = getLayout(layoutOrPage);
  page = getPage(pageItem || layoutOrPage);

  return { layout, page };
}

function getLayout(layout: string) {
  return layout.startsWith(LAYOUT_PREFIX) ? layout.replace(LAYOUT_PREFIX, '') : '';
}

function getPage(page: string) {
  return page.startsWith(VIEW_PREFIX) ? page.replace(VIEW_PREFIX, '') : '';
}

export function transformLayoutAndPageToComponent(layout: string, page: string) {
  const hasLayout = Boolean(layout);
  const hasPage = Boolean(page);

  if (hasLayout && hasPage) {
    return `${LAYOUT_PREFIX}${layout}${FIRST_LEVEL_ROUTE_COMPONENT_SPLIT}${VIEW_PREFIX}${page}`;
  }

  if (hasLayout) {
    return `${LAYOUT_PREFIX}${layout}`;
  }

  if (hasPage) {
    return `${VIEW_PREFIX}${page}`;
  }

  return '';
}

/**
 * Get route name by route path
 *
 * @param routeName
 */
export function getRoutePathByRouteName(routeName: string) {
  return `/${routeName.replace(/_/g, '/')}`;
}
