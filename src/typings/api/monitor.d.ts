declare namespace Api {
  /** monitoring module: server metrics */
  namespace Monitor {
    interface Server {
      id: number;
      serviceName: string;
      serviceCode: string;
      host: string;
      port: number;
      version: string;
      goVersion: string;
      cpuCores: number;
      uptime: string;
      status: Api.Common.EnableStatus;
      /** snapshot of the latest metrics, for the instance cards */
      cpuPercent: number;
      memPercent: number;
      diskPercent: number;
    }

    interface ServerMetrics {
      serverId: number;
      cpuPercent: number;
      memPercent: number;
      memUsed: number;
      memTotal: number;
      diskPercent: number;
      diskUsed: number;
      diskTotal: number;
      goroutines: number;
      threads: number;
      gcPauseMs: number;
      openFds: number;
      netIn: number;
      netOut: number;
      updateTime: string;
    }

    interface MetricHistoryPoint {
      time: string;
      cpu: number;
      mem: number;
      disk: number;
    }
  }

  /** monitoring module: gateway analytics */
  namespace Gateway {
    interface Overview {
      qps: number;
      todayCalls: number;
      /** request count within the selected time range */
      requestCount?: number;
      avgCostMs: number;
      p95CostMs?: number;
      errorRate: number;
      routeCount: number;
      activeRoutes?: number;
      onlineServices: number;
      totalServices: number;
      connections: number;
      updatedAt?: string;
    }

    interface TrendPoint {
      time: string;
      qps: number;
      avgCost: number;
      p95Cost?: number;
      errorRate: number;
    }

    type LoadStrategy = 'roundRobin' | 'weighted' | 'random' | 'ipHash';

    interface Route {
      id: string | number;
      routeName: string;
      name?: string;
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'ANY';
      path: string;
      serviceName: string;
      internalPath?: string;
      mapped?: boolean;
      source?: 'routers' | string;
      upstream?: string;
      upstreams?: string[];
      strategy?: LoadStrategy;
      status: 0 | 1 | '0' | '1' | '2';
      qps: number;
      avgCostMs: number;
      p95CostMs?: number;
      errorRate?: number;
      errorCalls?: number;
      instanceCount?: number;
      lastSeen?: string;
      /** call count within the queried time range */
      calls: number;
    }

    interface Service {
      id: string;
      serviceName: string;
      status: 0 | 1;
      instanceCount: number;
      healthyInstanceCount: number;
      routeCount: number;
      lastSeen?: string;
      discoveryStatus: 'fresh' | 'stale' | 'unavailable' | string;
    }

    interface TopItem {
      name: string;
      value: number;
    }
  }
}
