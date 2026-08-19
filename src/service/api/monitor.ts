import { alova } from '../request';

// ---------------- server monitor ----------------

/** get monitored server list */
export function fetchGetServerList() {
  return alova.Get<Api.Monitor.Server[]>('/v1/monitor/server/list');
}

/** get real-time metrics of one server */
export function fetchGetServerMetrics(params: { serverId: number }) {
  return alova.Get<Api.Monitor.ServerMetrics>('/v1/monitor/server/metrics', { params });
}

/** database connection pool stats of the monitor datasource */
export interface MonitorDBPoolStats {
  maxOpenConnections: number;
  openConnections: number;
  inUse: number;
  idle: number;
  waitCount: number;
  waitDurationMs: number;
  maxIdleClosed: number;
  maxLifetimeClosed: number;
}

/** get database connection pool stats */
export function fetchGetMonitorDBPool() {
  return alova.Get<MonitorDBPoolStats>('/v1/monitor/server/dbPool');
}

// ---------------- gateway analytics ----------------

export interface GatewayRouteSearchParams {
  keyword?: string | null;
  status?: 0 | 1 | string | null;
  method?: string | null;
  serviceName?: string | null;
  startTime?: number;
  endTime?: number;
}

export interface GatewayRangeParams {
  startTime?: number;
  endTime?: number;
}

export interface GatewayRankingParams extends GatewayRangeParams {
  limit: number;
}

/** get gateway overview stats */
export function fetchGetGatewayOverview(params?: GatewayRangeParams) {
  return alova.Get<Api.Gateway.Overview>('/v1/gateway/monitor/getOverview', { params });
}

/** get gateway traffic trend within a time range */
export function fetchGetGatewayTrend(params: { startTime: number; endTime: number }) {
  return alova.Get<Api.Gateway.TrendPoint[]>('/v1/gateway/monitor/getTrend', { params });
}

/** get gateway service list */
export function fetchGetGatewayServiceList() {
  return alova.Get<Api.Gateway.Service[]>('/v1/gateway/monitor/getServiceList');
}

/** get routes registered by one upstream Gin service */
export function fetchGetGatewayServiceRoutes(params: GatewayRouteSearchParams & { serviceName: string }) {
  const cleaned = params
    ? (Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== '')
      ) as GatewayRouteSearchParams)
    : undefined;

  return alova.Get<Api.Gateway.Route[]>('/v1/gateway/monitor/getServiceRoutes', { params: cleaned });
}

/** @deprecated use fetchGetGatewayServiceRoutes; kept for demo/mock callers during migration. */
export function fetchGetGatewayRouteList(params?: GatewayRouteSearchParams) {
  const serviceName = params?.serviceName;
  if (serviceName) return fetchGetGatewayServiceRoutes({ ...params, serviceName });
  return alova.Get<Api.Gateway.Route[]>('/v1/gateway/monitor/getRouteList', { params });
}

/** get most invoked routes */
export function fetchGetGatewayTopInvoked(params?: GatewayRankingParams) {
  return alova.Get<Api.Gateway.TopItem[]>('/v1/gateway/monitor/getTopInvoked', { params });
}

/** get slowest routes */
export function fetchGetGatewayTopSlow(params?: GatewayRankingParams) {
  return alova.Get<Api.Gateway.TopItem[]>('/v1/gateway/monitor/getTopSlow', { params });
}

/** get routes with the highest error rate */
export function fetchGetGatewayTopError(params?: GatewayRankingParams) {
  return alova.Get<Api.Gateway.TopItem[]>('/v1/gateway/monitor/getTopError', { params });
}

export interface MonitorAlertItem {
  id: string;
  level: number;
  title: string;
  target: string;
  value: string;
  threshold: string;
  status: number;
  occurredAt: string;
  description: string;
}

export function fetchMonitorAlertList(params: {
  current: number;
  size: number;
  keyword?: string;
  level?: number;
  status?: number;
}) {
  return alova.Post<{ records: MonitorAlertItem[]; current: number; size: number; total: number }>(
    '/v1/monitor/alert/page',
    params
  );
}

export function acknowledgeMonitorAlert(id: string) {
  return alova.Put<null>(`/v1/monitor/alert/${id}/ack`, {});
}

export function recoverMonitorAlert(id: string) {
  return alova.Put<null>(`/v1/monitor/alert/recover/${id}`, {});
}

export interface MonitorAlertRuleItem {
  id: string;
  name: string;
  target: string;
  condition: string;
  level: number;
  channels: string;
  enabled: boolean;
}

export function fetchMonitorAlertRuleList(params = { current: 1, size: 100 }) {
  return alova.Post<{ records: MonitorAlertRuleItem[]; current: number; size: number; total: number }>(
    '/v1/monitor/alertRule/page',
    params
  );
}

export function createMonitorAlertRule(data: Omit<MonitorAlertRuleItem, 'id'>) {
  return alova.Post<{ id: string }>('/v1/monitor/alertRule/create', data);
}

export function updateMonitorAlertRule(id: string, data: Omit<MonitorAlertRuleItem, 'id'>) {
  return alova.Put<null>(`/v1/monitor/alertRule/update/${id}`, data);
}

export function setMonitorAlertRuleStatus(id: string, enabled: boolean) {
  return alova.Put<null>(`/v1/monitor/alertRule/status/${id}`, { enabled });
}

export function deleteMonitorAlertRules(ids: string[]) {
  return alova.Delete<null>('/v1/monitor/alertRule/delete', { ids });
}
