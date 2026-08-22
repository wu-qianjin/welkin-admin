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

// ---------------------------------------------------------------- alert center

/** 告警级别：1=提示、2=警告、3=严重；处理状态：1=待处理、2=处理中、3=已恢复 */
interface AlertRecord {
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

/** 告警规则（评估引擎按 PromQL 表达式周期性求值） */
interface AlertRuleRecord {
  id: string;
  name: string;
  target: string;
  condition: string;
  level: number;
  channels: string;
  enabled: boolean;
}

// 可变内存数据：确认/恢复/删除操作直接修改，使告警中心在 dev 会话内完整可用
let alertRecords: AlertRecord[] = [
  {
    id: '1',
    level: 3,
    title: '网关服务 5xx 错误率过高',
    target: 'gateway /api/search/query',
    value: '4.82%',
    threshold: '> 1%',
    status: 1,
    occurredAt: '2026-08-22 09:41:23',
    description: '检索服务上游持续返回 504，网关重试后错误率仍超出阈值，建议检查 search-svc 实例健康状态。'
  },
  {
    id: '2',
    level: 3,
    title: '检索服务 CPU 使用率持续超限',
    target: 'search-svc (192.168.1.15)',
    value: '91.6%',
    threshold: '> 85%',
    status: 1,
    occurredAt: '2026-08-22 08:57:04',
    description: 'CPU 已连续 10 个采集周期高于阈值，goroutine 数量同步攀升，存在 goroutine 泄漏风险。'
  },
  {
    id: '3',
    level: 2,
    title: '消息服务内存使用率告警',
    target: 'message-svc (192.168.1.14)',
    value: '82.4%',
    threshold: '> 80%',
    status: 2,
    occurredAt: '2026-08-21 22:13:45',
    description: '推送高峰期内存超阈值，已确认由大促消息积压引起，正在扩容消费者实例。'
  },
  {
    id: '4',
    level: 2,
    title: '网关 QPS 临近限流阈值',
    target: 'gateway /api/message/push',
    value: '1126',
    threshold: '> 1000',
    status: 2,
    occurredAt: '2026-08-21 20:35:10',
    description: '晚高峰推送流量超出预期，已开启限流保护并通知业务方错峰重试。'
  },
  {
    id: '5',
    level: 3,
    title: '文件服务磁盘空间不足',
    target: 'file-svc (192.168.1.13)',
    value: '86.9%',
    threshold: '> 85%',
    status: 3,
    occurredAt: '2026-08-21 16:02:58',
    description: '对象存储临时分片未及时清理导致磁盘超限，已执行清理任务并恢复到 72%。'
  },
  {
    id: '6',
    level: 1,
    title: '系统服务慢查询提示',
    target: 'system-svc mysql: sm_operate_log',
    value: '3.2s',
    threshold: '> 3s',
    status: 1,
    occurredAt: '2026-08-21 14:26:31',
    description: '操作日志按时间范围统计出现慢查询，建议为 operate_time 字段补充复合索引。'
  },
  {
    id: '7',
    level: 2,
    title: '用户服务接口平均耗时上升',
    target: 'user-svc /api/user/list',
    value: '860ms',
    threshold: '> 500ms',
    status: 3,
    occurredAt: '2026-08-21 11:48:19',
    description: '批量导出用户占用连接池导致接口变慢，任务完成后耗时已恢复正常区间。'
  },
  {
    id: '8',
    level: 1,
    title: '网关证书到期提醒',
    target: 'gateway tls: *.welkin.local',
    value: '14 天',
    threshold: '<= 30 天',
    status: 3,
    occurredAt: '2026-08-20 23:55:02',
    description: '网关 HTTPS 证书剩余有效期不足 30 天，已提交续期申请并完成签发。'
  },
  {
    id: '9',
    level: 2,
    title: '数据库连接池等待次数上升',
    target: 'system-svc db-pool',
    value: '12 次/分',
    threshold: '> 10 次/分',
    status: 1,
    occurredAt: '2026-08-20 19:12:40',
    description: '连接池等待次数在晚高峰超出阈值，建议评估 max_open_connections 是否需要扩容。'
  },
  {
    id: '10',
    level: 1,
    title: '消息服务队列积压提示',
    target: 'message-svc queue: notice-push',
    value: '3862 条',
    threshold: '> 3000 条',
    status: 2,
    occurredAt: '2026-08-20 15:37:55',
    description: '公告推送队列出现积压，消费者已在扩容过程中，预计 30 分钟内消化完毕。'
  },
  {
    id: '11',
    level: 3,
    title: '检索服务实例失联',
    target: 'search-svc (192.168.1.15)',
    value: '失联 5 分钟',
    threshold: '> 1 分钟',
    status: 3,
    occurredAt: '2026-08-20 10:04:17',
    description: '实例心跳丢失超过阈值，切换备用实例后服务已恢复，根因为宿主机网络抖动。'
  },
  {
    id: '12',
    level: 1,
    title: '网关服务 GC 暂停时间提示',
    target: 'gateway runtime',
    value: '4.6ms',
    threshold: '> 4ms',
    status: 3,
    occurredAt: '2026-08-19 21:44:08',
    description: 'GC 暂停时间轻微超出经验阈值，当前不影响请求耗时，继续观察即可。'
  }
];

let alertRules: AlertRuleRecord[] = [
  {
    id: '1',
    name: '网关 5xx 错误率过高',
    target: 'api-gateway 错误率',
    condition: 'sum(rate(gateway_request_total{code=~"5.."}[5m])) / sum(rate(gateway_request_total[5m])) > 0.01',
    level: 3,
    channels: '站内信,邮件',
    enabled: true
  },
  {
    id: '2',
    name: '服务 CPU 持续超阈值',
    target: '各服务实例 CPU',
    condition: 'avg(rate(cpu_usage_percent[5m])) by (service) > 85',
    level: 2,
    channels: '站内信',
    enabled: true
  },
  {
    id: '3',
    name: '磁盘使用率提醒',
    target: '各节点磁盘',
    condition: 'max(disk_usage_percent) by (host) > 85',
    level: 1,
    channels: '站内信,webhook',
    enabled: false
  }
];

let nextAlertRuleId = alertRules.length + 1;

/** paginate from a POST body ({ current, size }) instead of query params */
function paginateBody<T>(records: T[], body: { current?: number; size?: number }) {
  const current = Math.max(1, Number(body?.current ?? 1));
  const size = Math.max(1, Number(body?.size ?? 10));
  const start = (current - 1) * size;
  return { records: records.slice(start, start + size), current, size, total: records.length };
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
  },

  // ---------------- database connection pool ----------------
  {
    method: 'GET',
    path: '/v1/monitor/server/dbPool',
    handler({ res }) {
      // 与 metrics 一致：围绕基线做确定性波动，让每次轮询看起来"活着"
      const wave = Math.sin(Date.now() / 60000);
      const openConnections = Math.round(38 + wave * 4);
      const inUse = Math.min(openConnections - 1, Math.round(26 + wave * 6));
      sendData(res, {
        maxOpenConnections: 100,
        openConnections,
        inUse,
        idle: openConnections - inUse,
        waitCount: Math.max(0, Math.round(wave * 3)),
        waitDurationMs: Math.round(8400 + wave * 1200),
        maxIdleClosed: 4271,
        maxLifetimeClosed: 189
      });
    }
  },

  // ---------------- alert center ----------------
  {
    method: 'POST',
    path: '/v1/monitor/alert/page',
    handler({ res, body }) {
      const keyword = body?.keyword;
      const level = body?.level;
      const status = body?.status;
      const records = alertRecords.filter(
        alert =>
          (!keyword || alert.title.includes(String(keyword)) || alert.target.includes(String(keyword))) &&
          (level === undefined || level === null || level === '' || alert.level === Number(level)) &&
          (status === undefined || status === null || status === '' || alert.status === Number(status))
      );
      sendData(res, paginateBody(records, body));
    }
  },
  {
    method: 'PUT',
    path: '/v1/monitor/alert/:id/ack',
    handler({ res, url }) {
      // /v1/monitor/alert/{id}/ack → id 位于第 5 段
      const id = url.pathname.split('/')[4];
      const alert = alertRecords.find(item => item.id === id);
      if (alert) alert.status = 2;
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/monitor/alert/recover/:id',
    handler({ res, url }) {
      const id = url.pathname.split('/').pop();
      const alert = alertRecords.find(item => item.id === id);
      if (alert) alert.status = 3;
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/alert/delete',
    handler({ res, body }) {
      const ids: string[] = body?.ids || [];
      alertRecords = alertRecords.filter(alert => !ids.includes(alert.id));
      sendData(res, null);
    }
  },
  {
    method: 'POST',
    path: '/v1/monitor/alertRule/page',
    handler({ res, body }) {
      sendData(res, paginateBody(alertRules, body));
    }
  },
  {
    method: 'POST',
    path: '/v1/monitor/alertRule/create',
    handler({ res, body }) {
      const rule: AlertRuleRecord = {
        id: String(nextAlertRuleId++),
        name: String(body?.name ?? ''),
        target: String(body?.target ?? ''),
        condition: String(body?.condition ?? ''),
        level: Number(body?.level ?? 2),
        channels: String(body?.channels ?? ''),
        enabled: body?.enabled !== false
      };
      alertRules.unshift(rule);
      sendData(res, { id: rule.id });
    }
  },
  {
    method: 'PUT',
    path: '/v1/monitor/alertRule/update/:id',
    handler({ res, body, url }) {
      const id = url.pathname.split('/').pop();
      const rule = alertRules.find(item => item.id === id);
      if (rule) {
        rule.name = body?.name ?? rule.name;
        rule.target = body?.target ?? rule.target;
        rule.condition = body?.condition ?? rule.condition;
        rule.level = body?.level !== undefined ? Number(body.level) : rule.level;
        rule.channels = body?.channels ?? rule.channels;
        rule.enabled = body?.enabled !== undefined ? Boolean(body.enabled) : rule.enabled;
      }
      sendData(res, null);
    }
  },
  {
    method: 'PUT',
    path: '/v1/monitor/alertRule/status/:id',
    handler({ res, body, url }) {
      const id = url.pathname.split('/').pop();
      const rule = alertRules.find(item => item.id === id);
      if (rule) rule.enabled = body?.enabled !== false;
      sendData(res, null);
    }
  },
  {
    method: 'DELETE',
    path: '/v1/monitor/alertRule/delete',
    handler({ res, body }) {
      const ids: string[] = body?.ids || [];
      alertRules = alertRules.filter(rule => !ids.includes(rule.id));
      sendData(res, null);
    }
  }
];
