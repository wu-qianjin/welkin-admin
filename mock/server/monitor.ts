import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * mock data for the monitoring pages.
 *
 * values are derived from deterministic patterns (sine waves + seeded noise)
 * around per-service baselines, so charts look alive on every poll while
 * staying plausible and stable in shape.
 */

const SUCCESS = { code: 0, message: 'success' };

function sendData(res: ServerResponse, data: unknown) {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ data, ...SUCCESS, detail: null }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** deterministic 0..1 noise so history series are stable across requests */
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function fmtClock(d: Date, withSeconds = true) {
  const base = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return withSeconds ? `${base}:${pad(d.getSeconds())}` : base;
}

function fmtUptime(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const rest = Math.floor(totalSeconds % 86400);
  const h = Math.floor(rest / 3600);
  const m = Math.floor((rest % 3600) / 60);
  const s = rest % 60;
  return `${days}天 ${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ---------------------------------------------------------------- servers

interface ServerProfile {
  id: number;
  serviceName: string;
  serviceCode: string;
  host: string;
  port: number;
  version: string;
  goVersion: string;
  cpuCores: number;
  uptimeDays: number;
  status: '1' | '2';
  cpuBase: number;
  memBase: number;
  diskBase: number;
  memTotal: number;
  diskTotal: number;
  goroutines: number;
  netBase: number;
}

const serverProfiles: ServerProfile[] = [
  {
    id: 1,
    serviceName: '网关服务',
    serviceCode: 'gateway',
    host: '192.168.1.10',
    port: 41528,
    version: 'v2.4.1',
    goVersion: 'go1.23.4',
    cpuCores: 8,
    uptimeDays: 45,
    status: '1',
    cpuBase: 42,
    memBase: 58,
    diskBase: 47,
    memTotal: 16,
    diskTotal: 200,
    goroutines: 812,
    netBase: 6200
  },
  {
    id: 2,
    serviceName: '系统服务',
    serviceCode: 'system-svc',
    host: '192.168.1.11',
    port: 9001,
    version: 'v1.8.0',
    goVersion: 'go1.23.4',
    cpuCores: 4,
    uptimeDays: 45,
    status: '1',
    cpuBase: 21,
    memBase: 41,
    diskBase: 35,
    memTotal: 8,
    diskTotal: 200,
    goroutines: 236,
    netBase: 1800
  },
  {
    id: 3,
    serviceName: '用户服务',
    serviceCode: 'user-svc',
    host: '192.168.1.12',
    port: 9002,
    version: 'v3.1.2',
    goVersion: 'go1.22.10',
    cpuCores: 4,
    uptimeDays: 12,
    status: '1',
    cpuBase: 33,
    memBase: 52,
    diskBase: 55,
    memTotal: 8,
    diskTotal: 500,
    goroutines: 318,
    netBase: 2400
  },
  {
    id: 4,
    serviceName: '文件服务',
    serviceCode: 'file-svc',
    host: '192.168.1.13',
    port: 9003,
    version: 'v1.4.6',
    goVersion: 'go1.23.4',
    cpuCores: 2,
    uptimeDays: 78,
    status: '1',
    cpuBase: 17,
    memBase: 36,
    diskBase: 76,
    memTotal: 4,
    diskTotal: 2000,
    goroutines: 96,
    netBase: 8600
  },
  {
    id: 5,
    serviceName: '消息服务',
    serviceCode: 'message-svc',
    host: '192.168.1.14',
    port: 9004,
    version: 'v2.0.3',
    goVersion: 'go1.23.4',
    cpuCores: 4,
    uptimeDays: 30,
    status: '1',
    cpuBase: 28,
    memBase: 63,
    diskBase: 44,
    memTotal: 8,
    diskTotal: 300,
    goroutines: 1044,
    netBase: 3100
  },
  {
    id: 6,
    serviceName: '检索服务',
    serviceCode: 'search-svc',
    host: '192.168.1.15',
    port: 9005,
    version: 'v0.9.8',
    goVersion: 'go1.22.10',
    cpuCores: 8,
    uptimeDays: 3,
    status: '2',
    cpuBase: 74,
    memBase: 81,
    diskBase: 66,
    memTotal: 16,
    diskTotal: 500,
    goroutines: 1890,
    netBase: 4700
  }
];

function cpuAt(profile: ServerProfile, ts: number, extra = 0) {
  const wave = Math.sin(ts / 60000 + profile.id * 1.7) * 9;
  return clamp(profile.cpuBase + wave + extra, 1, 99.5);
}

function memAt(profile: ServerProfile, ts: number, extra = 0) {
  const wave = Math.sin(ts / 600000 + profile.id * 0.6) * 5;
  return clamp(profile.memBase + wave + extra, 1, 99.5);
}

function diskAt(profile: ServerProfile, extra = 0) {
  return clamp(profile.diskBase + extra, 1, 99.9);
}

function buildServer(profile: ServerProfile, now: number) {
  const uptimeSeconds = profile.uptimeDays * 86400 + (now % 86400);
  return {
    id: profile.id,
    serviceName: profile.serviceName,
    serviceCode: profile.serviceCode,
    host: profile.host,
    port: profile.port,
    version: profile.version,
    goVersion: profile.goVersion,
    cpuCores: profile.cpuCores,
    uptime: fmtUptime(uptimeSeconds),
    status: profile.status
  };
}

function buildMetrics(profile: ServerProfile, now: number) {
  const cpu = cpuAt(profile, now, (Math.random() - 0.5) * 6);
  const mem = memAt(profile, now, (Math.random() - 0.5) * 3);
  const disk = diskAt(profile, Math.random() * 0.3);
  const load = cpu / 100;

  return {
    serverId: profile.id,
    cpuPercent: Number(cpu.toFixed(1)),
    memPercent: Number(mem.toFixed(1)),
    memUsed: Number(((mem / 100) * profile.memTotal).toFixed(2)),
    memTotal: profile.memTotal,
    diskPercent: Number(disk.toFixed(1)),
    diskUsed: Number(((disk / 100) * profile.diskTotal).toFixed(1)),
    diskTotal: profile.diskTotal,
    goroutines: Math.round(profile.goroutines + load * 120 + (Math.random() - 0.5) * 40),
    threads: Math.round(14 + profile.cpuCores * 1.5 + Math.random() * 6),
    gcPauseMs: Number((0.08 + Math.random() * 0.35 + load * 0.2).toFixed(2)),
    openFds: Math.round(120 + load * 640 + Math.random() * 80),
    netIn: Math.round(profile.netBase * (0.6 + load * 0.8) + Math.random() * 120),
    netOut: Math.round(profile.netBase * (0.5 + load * 0.7) + Math.random() * 100),
    updateTime: fmtClock(new Date(now))
  };
}

// ---------------------------------------------------------------- gateway

const gatewayRoutes: Api.Gateway.Route[] = [
  {
    id: '1',
    routeName: 'user-login',
    method: 'POST',
    path: '/api/user/login',
    serviceName: '用户服务',
    upstream: 'user-svc:9002',
    strategy: 'roundRobin',
    status: 1,
    qps: 86,
    avgCostMs: 42,
    calls: 7_430_400
  },
  {
    id: '2',
    routeName: 'user-list',
    method: 'GET',
    path: '/api/user/list',
    serviceName: '用户服务',
    upstream: 'user-svc:9002',
    strategy: 'roundRobin',
    status: 1,
    qps: 64,
    avgCostMs: 28,
    calls: 5_529_600
  },
  {
    id: '3',
    routeName: 'user-profile',
    method: 'GET',
    path: '/api/user/profile',
    serviceName: '用户服务',
    upstream: 'user-svc:9002',
    strategy: 'ipHash',
    status: 1,
    qps: 38,
    avgCostMs: 16,
    calls: 3_283_200
  },
  {
    id: '4',
    routeName: 'menu-tree',
    method: 'GET',
    path: '/api/system/menu',
    serviceName: '系统服务',
    upstream: 'system-svc:9001',
    strategy: 'roundRobin',
    status: 1,
    qps: 45,
    avgCostMs: 22,
    calls: 3_888_000
  },
  {
    id: '5',
    routeName: 'config-list',
    method: 'GET',
    path: '/api/system/config',
    serviceName: '系统服务',
    upstream: 'system-svc:9001',
    strategy: 'roundRobin',
    status: 1,
    qps: 12,
    avgCostMs: 14,
    calls: 1_036_800
  },
  {
    id: '6',
    routeName: 'dict-query',
    method: 'GET',
    path: '/api/system/dict',
    serviceName: '系统服务',
    upstream: 'system-svc:9001',
    strategy: 'random',
    status: 1,
    qps: 21,
    avgCostMs: 11,
    calls: 1_814_400
  },
  {
    id: '7',
    routeName: 'file-upload',
    method: 'POST',
    path: '/api/file/upload',
    serviceName: '文件服务',
    upstream: 'file-svc:9003',
    strategy: 'weighted',
    status: 1,
    qps: 8,
    avgCostMs: 186,
    calls: 691_200
  },
  {
    id: '8',
    routeName: 'file-download',
    method: 'GET',
    path: '/api/file/download',
    serviceName: '文件服务',
    upstream: 'file-svc:9003',
    strategy: 'weighted',
    status: 1,
    qps: 34,
    avgCostMs: 96,
    calls: 2_937_600
  },
  {
    id: '9',
    routeName: 'message-push',
    method: 'POST',
    path: '/api/message/push',
    serviceName: '消息服务',
    upstream: 'message-svc:9004',
    strategy: 'roundRobin',
    status: 1,
    qps: 128,
    avgCostMs: 35,
    calls: 11_059_200
  },
  {
    id: '10',
    routeName: 'message-pull',
    method: 'GET',
    path: '/api/message/inbox',
    serviceName: '消息服务',
    upstream: 'message-svc:9004',
    strategy: 'ipHash',
    status: 1,
    qps: 92,
    avgCostMs: 24,
    calls: 7_948_800
  },
  {
    id: '11',
    routeName: 'search-query',
    method: 'GET',
    path: '/api/search/query',
    serviceName: '检索服务',
    upstream: 'search-svc:9005',
    strategy: 'weighted',
    status: 1,
    qps: 157,
    avgCostMs: 232,
    calls: 13_565_600
  },
  {
    id: '12',
    routeName: 'search-suggest',
    method: 'GET',
    path: '/api/search/suggest',
    serviceName: '检索服务',
    upstream: 'search-svc:9005',
    strategy: 'random',
    status: 0,
    qps: 44,
    avgCostMs: 388,
    calls: 3_801_600
  },
  {
    id: '13',
    routeName: 'report-export',
    method: 'POST',
    path: '/api/report/export',
    serviceName: '系统服务',
    upstream: 'system-svc:9001',
    strategy: 'roundRobin',
    status: 1,
    qps: 3,
    avgCostMs: 512,
    calls: 259_200
  },
  {
    id: '14',
    routeName: 'stat-track',
    method: 'PUT',
    path: '/api/track/event',
    serviceName: '消息服务',
    upstream: 'message-svc:9004',
    strategy: 'random',
    status: 1,
    qps: 210,
    avgCostMs: 9,
    calls: 18_144_000
  }
];

function gatewayTrend(range: '1h' | 'today'): Api.Gateway.TrendPoint[] {
  const now = new Date();
  const points: Api.Gateway.TrendPoint[] = [];
  const count = range === '1h' ? 60 : 48;

  for (let i = count - 1; i >= 0; i -= 1) {
    const ts = now.getTime() - i * (range === '1h' ? 60_000 : 1_800_000);
    const date = new Date(ts);
    const hour = date.getHours() + date.getMinutes() / 60;

    // daily traffic curve: quiet at night, peaks around 10:00 and 15:00 and 21:00
    const daily =
      0.35 +
      0.3 * Math.exp(-((hour - 10.5) ** 2) / 8) +
      0.25 * Math.exp(-((hour - 15) ** 2) / 10) +
      0.3 * Math.exp(-((hour - 21) ** 2) / 12);
    const idx = count - 1 - i;
    const noise = seeded(idx, range === '1h' ? 7 : 13);

    const qps = Math.round(1150 * daily + noise * 90);
    const avgCost = Number((24 - daily * 8 + noise * 6).toFixed(1));
    const p95Cost = Number((avgCost * (1.65 + noise * 0.25)).toFixed(1));
    const errorRate = Number((0.08 + (1 - daily) * 0.1 + noise * 0.05).toFixed(3));

    const label = range === '1h' ? fmtClock(date, false) : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    points.push({ time: label, qps, avgCost, p95Cost, errorRate });
  }

  return points;
}

function gatewayOverview(start?: number, end?: number): Api.Gateway.Overview {
  const now = new Date();
  const trend = gatewayTrend('1h');
  const last = trend[trend.length - 1];
  const spanDays = start && end && end > start ? clamp((end - start) / 86_400_000, 0.01, 30) : 1;
  const requestCount = Math.round(jitterRoutes(spanDays).reduce((sum, route) => sum + route.calls, 0));

  return {
    qps: last.qps,
    todayCalls: requestCount,
    avgCostMs: last.avgCost,
    p95CostMs: last.p95Cost,
    errorRate: last.errorRate,
    routeCount: gatewayRoutes.length,
    activeRoutes: gatewayRoutes.filter(route => route.status === '1').length,
    onlineServices: serverProfiles.filter(item => item.status === '1').length,
    totalServices: serverProfiles.length,
    connections: Math.round(1150 + Math.random() * 260),
    requestCount,
    updatedAt: fmtClock(now)
  };
}

function jitterRoutes(spanDays = 1): Api.Gateway.Route[] {
  return gatewayRoutes.map(route => ({
    ...route,
    qps: Math.max(1, Math.round(route.qps * (0.9 + Math.random() * 0.2))),
    avgCostMs: Number((route.avgCostMs * (0.92 + Math.random() * 0.16)).toFixed(1)),
    p95CostMs: Number((route.avgCostMs * (1.55 + seeded(Number(route.id), spanDays + 5) * 0.55)).toFixed(1)),
    errorRate: Number(
      (0.08 + (Number(route.id) % 5) * 0.18 + seeded(Number(route.id), spanDays + 9) * 0.24).toFixed(2)
    ),
    instanceCount: 2 + (Number(route.id) % 4),
    lastSeen: fmtClock(new Date()),
    calls: Math.round(route.calls * spanDays * (0.9 + seeded(Number(route.id), spanDays) * 0.2))
  }));
}

/** generate trend points across an arbitrary [start, end] range with an adaptive step */
function gatewayTrendByRange(start: number, end: number): Api.Gateway.TrendPoint[] {
  const span = clamp(end - start, 3_600_000, 90 * 86_400_000);
  const count = 48;
  const step = span / count;
  const points: Api.Gateway.TrendPoint[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const ts = end - i * step;
    const date = new Date(ts);
    const hour = date.getHours() + date.getMinutes() / 60;

    // daily traffic curve: quiet at night, peaks around 10:00 / 15:00 / 21:00
    const daily =
      0.35 +
      0.3 * Math.exp(-((hour - 10.5) ** 2) / 8) +
      0.25 * Math.exp(-((hour - 15) ** 2) / 10) +
      0.3 * Math.exp(-((hour - 21) ** 2) / 12);
    // day-to-day drift so multi-day ranges show variety
    const dayIdx = Math.floor(ts / 86_400_000);
    const dayFactor = 0.85 + seeded(dayIdx, 31) * 0.3;
    const noise = seeded(count - 1 - i, 17);

    const qps = Math.round(1150 * daily * dayFactor + noise * 60);
    const avgCost = Number((26 - daily * 9 + noise * 5).toFixed(1));
    const p95Cost = Number((avgCost * (1.65 + noise * 0.25)).toFixed(1));
    const errorRate = Number((0.08 + (1 - daily) * 0.12 + noise * 0.06).toFixed(3));

    const label = `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    points.push({ time: label, qps, avgCost, p95Cost, errorRate });
  }

  return points;
}

// ---------------------------------------------------------------- routes

type MonitorHandler = (ctx: {
  req: IncomingMessage;
  res: ServerResponse;
  query: URLSearchParams;
  body: any;
  url: URL;
}) => Promise<void> | void;

export const monitorRoutes: Array<{ method: string; path: string; handler: MonitorHandler }> = [
  // ---------------- server monitor ----------------
  {
    method: 'GET',
    path: '/v1/monitor/server/list',
    handler({ res }) {
      const now = Date.now();
      sendData(
        res,
        serverProfiles.map(profile => {
          const metrics = buildMetrics(profile, now);
          return {
            ...buildServer(profile, now),
            cpuPercent: metrics.cpuPercent,
            memPercent: metrics.memPercent,
            diskPercent: metrics.diskPercent
          };
        })
      );
    }
  },
  {
    method: 'GET',
    path: '/v1/monitor/server/metrics',
    handler({ res, query }) {
      const id = Number(query.get('serverId'));
      const profile = serverProfiles.find(item => item.id === id);
      if (!profile) {
        sendData(res, null);
        return;
      }
      sendData(res, buildMetrics(profile, Date.now()));
    }
  },
  {
    method: 'GET',
    path: '/v1/monitor/server/metricHistory',
    handler({ res, query }) {
      const id = Number(query.get('serverId'));
      const profile = serverProfiles.find(item => item.id === id) ?? serverProfiles[0];
      const now = Date.now();
      const points: Api.Monitor.MetricHistoryPoint[] = [];

      // last 5 minutes, one point every 5 seconds
      for (let i = 59; i >= 0; i -= 1) {
        const ts = now - i * 5000;
        const idx = 59 - i;
        points.push({
          time: fmtClock(new Date(ts)),
          cpu: Number(cpuAt(profile, ts, (seeded(idx, profile.id) - 0.5) * 6).toFixed(1)),
          mem: Number(memAt(profile, ts, (seeded(idx, profile.id + 50) - 0.5) * 3).toFixed(1)),
          disk: Number(diskAt(profile, seeded(idx, profile.id + 90) * 0.4).toFixed(1))
        });
      }

      sendData(res, points);
    }
  },

  // ---------------- gateway analytics ----------------
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getOverview',
    handler({ res, query }) {
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));
      sendData(res, gatewayOverview(start, end));
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getTrend',
    handler({ res, query }) {
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));

      if (start && end && end > start) {
        sendData(res, gatewayTrendByRange(start, end));
        return;
      }

      const range = query.get('range') === 'today' ? 'today' : '1h';
      sendData(res, gatewayTrend(range));
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getServiceList',
    handler({ res }) {
      const services = Array.from(new Set(gatewayRoutes.map(route => route.serviceName))).map(serviceName => {
        const rows = gatewayRoutes.filter(route => route.serviceName === serviceName);
        return {
          id: serviceName,
          serviceName,
          status: 1,
          instanceCount: 2,
          healthyInstanceCount: 2,
          routeCount: rows.length,
          lastSeen: new Date().toISOString(),
          discoveryStatus: 'fresh'
        };
      });
      sendData(res, services);
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getServiceRoutes',
    handler({ res, query }) {
      const keyword = query.get('keyword');
      const status = query.get('status');
      const method = query.get('method');
      const serviceName = query.get('serviceName');
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));
      const spanDays = start && end && end > start ? clamp(Math.round((end - start) / 86_400_000), 1, 30) : 1;

      const routes = jitterRoutes(spanDays).filter(
        route =>
          (!keyword ||
            route.path.includes(keyword) ||
            route.routeName.includes(keyword) ||
            route.serviceName.includes(keyword)) &&
          (status === null || status === undefined || status === '' || String(route.status) === status) &&
          (method === null || method === undefined || method === '' || route.method === method) &&
          (serviceName === null || serviceName === undefined || serviceName === '' || route.serviceName === serviceName)
      );

      sendData(res, routes);
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getTopInvoked',
    handler({ res, query }) {
      const limit = Number(query.get('limit') || 8);
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));
      const spanDays = start && end && end > start ? clamp((end - start) / 86_400_000, 0.01, 30) : 1;
      const routes = jitterRoutes(spanDays);

      const items = routes
        .map(route => ({ name: `${route.method} ${route.path}`, value: route.calls }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

      sendData(res, items);
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getTopSlow',
    handler({ res, query }) {
      const limit = Number(query.get('limit') || 8);
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));
      const spanDays = start && end && end > start ? clamp((end - start) / 86_400_000, 0.01, 30) : 1;
      const items = jitterRoutes(spanDays)
        .map(route => ({ name: `${route.method} ${route.path}`, value: route.p95CostMs ?? route.avgCostMs }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

      sendData(res, items);
    }
  },
  {
    method: 'GET',
    path: '/v1/gateway/monitor/getTopError',
    handler({ res, query }) {
      const limit = Number(query.get('limit') || 8);
      const start = Number(query.get('startTime'));
      const end = Number(query.get('endTime'));
      const spanDays = start && end && end > start ? clamp((end - start) / 86_400_000, 0.01, 30) : 1;
      const items = jitterRoutes(spanDays)
        .map(route => ({ name: `${route.method} ${route.path}`, value: route.errorRate ?? 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);

      sendData(res, items);
    }
  }
];
