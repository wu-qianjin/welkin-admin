import { alova } from '../request';

// ---------------- server monitor ----------------

/** get monitored server list */
export function fetchGetServerList() {
  return alova.Get<Api.Monitor.Server[]>('/monitor/getServerList');
}

/** get real-time metrics of one server */
export function fetchGetServerMetrics(params: { serverId: number }) {
  return alova.Get<Api.Monitor.ServerMetrics>('/monitor/getServerMetrics', { params });
}

/** get metric history of one server (last 5 minutes, 5s step) */
export function fetchGetServerMetricHistory(params: { serverId: number }) {
  return alova.Get<Api.Monitor.MetricHistoryPoint[]>('/monitor/getServerMetricHistory', { params });
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
