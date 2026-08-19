export interface MockLoginDevice {
  id: number;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

export interface MockUserDetail {
  id: string;
  userName: string;
  nickName: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  status: '正常' | '锁定';
  avatarText: string;
  avatarColor: string;
  joinedAt: string;
  lastLoginAt: string;
  lastLoginIp: string;
  loginCount: number;
  operationCount: number;
  permissions: string[];
  timeline: Array<{ title: string; time: string; description: string; type: 'success' | 'info' | 'warning' }>;
}

export interface MockNoticeFeed {
  id: number;
  title: string;
  type: '通知' | '公告' | '更新';
  summary: string;
  content: string;
  publishAt: string;
  author: string;
  scope: string;
  read: boolean;
  top?: boolean;
}

export interface MockAlert {
  id: number;
  level: '严重' | '警告' | '提示';
  title: string;
  target: string;
  value: string;
  threshold: string;
  status: '待处理' | '处理中' | '已恢复';
  occurredAt: string;
  description: string;
}

export interface MockConfigHistory {
  id: number;
  configName: string;
  paramKey: string;
  beforeValue: string;
  afterValue: string;
  operator: string;
  operatedAt: string;
  reason: string;
}

export interface MockFileAsset {
  id: number;
  fileName: string;
  type: '图片' | '文档' | '压缩包' | '其他';
  size: string;
  bizType: string;
  uploader: string;
  updatedAt: string;
  previewable: boolean;
  shared: boolean;
}

export const mockCurrentUser = {
  userName: 'Super',
  nickName: '系统管理员',
  department: '平台管理部',
  role: '超级管理员',
  email: 'admin@welkin.local',
  phone: '138****8000',
  joinedAt: '2024-03-18',
  lastLoginAt: '2026-08-15 09:26:41',
  lastLoginIp: '192.168.10.24',
  avatarText: '管',
  avatarColor: '#4f46e5'
};

export const mockLoginDevices: MockLoginDevice[] = [
  {
    id: 1,
    device: 'Windows 11 · Chrome',
    browser: 'Chrome 138',
    ip: '192.168.10.24',
    location: '上海市',
    lastActive: '刚刚活跃',
    current: true
  },
  {
    id: 2,
    device: 'macOS · Safari',
    browser: 'Safari 18',
    ip: '192.168.10.36',
    location: '上海市',
    lastActive: '今天 08:52'
  },
  {
    id: 3,
    device: 'iPhone · Mobile Safari',
    browser: 'Mobile Safari',
    ip: '116.231.18.12',
    location: '上海市',
    lastActive: '昨天 21:08'
  }
];

export const mockUserDetails: Record<string, MockUserDetail> = {
  '1': {
    id: '1',
    userName: 'Super',
    nickName: '系统管理员',
    department: '平台管理部',
    role: '超级管理员',
    email: 'admin@welkin.local',
    phone: '138****8000',
    status: '正常',
    avatarText: '管',
    avatarColor: '#4f46e5',
    joinedAt: '2024-03-18',
    lastLoginAt: '2026-08-15 09:26:41',
    lastLoginIp: '192.168.10.24',
    loginCount: 1284,
    operationCount: 8632,
    permissions: ['系统管理', '用户管理', '角色授权', '监控中心', '配置中心', '审计日志'],
    timeline: [
      {
        title: '登录成功',
        time: '2026-08-15 09:26:41',
        description: 'Chrome / Windows 11 · 192.168.10.24',
        type: 'success'
      },
      { title: '修改系统参数', time: '2026-08-14 17:42:12', description: '更新文件上传大小上限为 50 MB', type: 'info' },
      { title: '授权角色', time: '2026-08-12 10:18:06', description: '为“运营人员”角色增加公告发布权限', type: 'info' },
      { title: '修改密码', time: '2026-07-30 15:06:33', description: '通过个人中心完成密码修改', type: 'warning' }
    ]
  },
  '2': {
    id: '2',
    userName: 'Admin',
    nickName: '平台运营',
    department: '运营部',
    role: '运营人员',
    email: 'admin@welkin.local',
    phone: '139****2211',
    status: '正常',
    avatarText: '运',
    avatarColor: '#0f766e',
    joinedAt: '2024-05-06',
    lastLoginAt: '2026-08-15 08:51:03',
    lastLoginIp: '192.168.10.31',
    loginCount: 486,
    operationCount: 2184,
    permissions: ['首页', '公告管理', '用户查看', '文件管理'],
    timeline: [
      {
        title: '登录成功',
        time: '2026-08-15 08:51:03',
        description: 'Edge / Windows 11 · 192.168.10.31',
        type: 'success'
      },
      { title: '发布公告', time: '2026-08-14 16:23:19', description: '发布《周末系统维护通知》', type: 'info' },
      { title: '登录失败', time: '2026-08-13 09:03:10', description: '密码错误，第 1 次失败', type: 'warning' }
    ]
  },
  '3': {
    id: '3',
    userName: 'User',
    nickName: '业务同事',
    department: '产品部',
    role: '普通用户',
    email: 'user@welkin.local',
    phone: '137****6301',
    status: '正常',
    avatarText: '业',
    avatarColor: '#c2410c',
    joinedAt: '2025-01-12',
    lastLoginAt: '2026-08-14 18:12:44',
    lastLoginIp: '192.168.10.47',
    loginCount: 106,
    operationCount: 732,
    permissions: ['首页', '个人中心', '公告查看'],
    timeline: [
      {
        title: '登录成功',
        time: '2026-08-14 18:12:44',
        description: 'Chrome / macOS · 192.168.10.47',
        type: 'success'
      },
      { title: '查看公告', time: '2026-08-14 18:13:02', description: '阅读《周末系统维护通知》', type: 'info' }
    ]
  }
};

export const mockPermissionTree = [
  {
    key: 'home',
    label: '首页',
    children: []
  },
  {
    key: 'auth',
    label: '认证授权',
    children: [
      { key: 'auth_user', label: '用户管理', children: [] },
      { key: 'auth_dept', label: '部门管理', children: [] },
      { key: 'auth_role', label: '角色管理', children: [] },
      { key: 'auth_menu', label: '菜单管理', children: [] },
      { key: 'auth_resource', label: '资源管理', children: [] }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    children: [
      { key: 'system_config', label: '参数配置', children: [] },
      { key: 'system_dict', label: '字典管理', children: [] },
      { key: 'system_notice', label: '通知公告', children: [] },
      { key: 'system_file', label: '文件管理', children: [] }
    ]
  },
  {
    key: 'monitor',
    label: '运维监控',
    children: [
      { key: 'monitor_overview', label: '监控总览', children: [] },
      { key: 'monitor_gateway', label: '网关治理', children: [] },
      { key: 'monitor_alert', label: '告警中心', children: [] },
      { key: 'monitor_log', label: '日志管理', children: [] },
      { key: 'monitor_online', label: '在线用户', children: [] }
    ]
  }
];

function flattenMenuKeys(items: Array<{ key: string; children?: Array<{ key: string; children?: any[] }> }>): string[] {
  return items.flatMap(item => [item.key, ...flattenMenuKeys(item.children ?? [])]);
}

export const mockButtonPermissionTree = [
  { key: 'user:add', label: '用户管理 / 新增用户', code: 'B_USER_ADD' },
  { key: 'user:edit', label: '用户管理 / 编辑用户', code: 'B_USER_EDIT' },
  { key: 'user:reset', label: '用户管理 / 重置密码', code: 'B_USER_RESET_PASSWORD' },
  { key: 'notice:publish', label: '公告管理 / 发布公告', code: 'B_NOTICE_PUBLISH' },
  { key: 'file:upload', label: '文件管理 / 上传文件', code: 'B_FILE_UPLOAD' },
  { key: 'log:export', label: '日志管理 / 导出日志', code: 'B_LOG_EXPORT' },
  { key: 'monitor:alert', label: '告警中心 / 处理告警', code: 'B_MONITOR_ALERT_HANDLE' }
];

export const mockRolePermissions: Record<string, { menus: string[]; buttons: string[] }> = {
  1: {
    menus: flattenMenuKeys(mockPermissionTree),
    buttons: mockButtonPermissionTree.map(item => item.key)
  },
  2: {
    menus: ['home', 'system', 'system_notice', 'system_file', 'monitor', 'monitor_overview'],
    buttons: ['notice:publish', 'file:upload']
  }
};

export const mockNoticeFeed: MockNoticeFeed[] = [
  {
    id: 1,
    title: '周末系统维护通知',
    type: '公告',
    summary: '本周六 22:00 - 24:00 进行系统升级维护，期间部分功能暂不可用。',
    content: '维护期间将完成权限模块性能优化、文件服务升级和安全策略调整，请提前保存工作内容。',
    publishAt: '2026-08-14 16:30',
    author: '系统管理员',
    scope: '全体成员',
    read: false,
    top: true
  },
  {
    id: 2,
    title: 'WelkinAdmin 2.4.0 更新说明',
    type: '更新',
    summary: '新增监控总览、告警中心和个人中心，优化移动端列表体验。',
    content: '本次更新聚焦通用后台能力建设，新增告警闭环、权限数据范围和安全设置页面。',
    publishAt: '2026-08-13 10:00',
    author: '产品中心',
    scope: '全体成员',
    read: true
  },
  {
    id: 3,
    title: '密码安全策略调整提醒',
    type: '通知',
    summary: '系统将于 8 月 31 日启用密码强度校验，请及时更新个人密码。',
    content: '密码长度不少于 8 位，并至少包含大小写字母和数字。',
    publishAt: '2026-08-10 09:20',
    author: '安全管理员',
    scope: '全体成员',
    read: true
  }
];

export const mockAlerts: MockAlert[] = [
  {
    id: 1,
    level: '严重',
    title: '文件服务磁盘空间不足',
    target: 'file-svc / 10.0.1.23',
    value: '92%',
    threshold: '> 85%',
    status: '处理中',
    occurredAt: '2026-08-15 09:18:22',
    description: '上传文件持续增长，预计 2.6 天后达到安全阈值。'
  },
  {
    id: 2,
    level: '警告',
    title: '网关错误率升高',
    target: 'api-gateway / production',
    value: '1.82%',
    threshold: '> 1%',
    status: '待处理',
    occurredAt: '2026-08-15 08:42:10',
    description: '近 5 分钟错误率主要来自报告导出接口。'
  },
  {
    id: 3,
    level: '提示',
    title: '用户服务已恢复',
    target: 'user-svc / 10.0.1.21',
    value: '正常',
    threshold: '健康检查',
    status: '已恢复',
    occurredAt: '2026-08-14 22:16:05',
    description: '服务实例已重新注册，连续 10 次健康检查通过。'
  },
  {
    id: 4,
    level: '警告',
    title: '数据库连接池使用率偏高',
    target: 'system-svc / PostgreSQL',
    value: '78%',
    threshold: '> 70%',
    status: '已恢复',
    occurredAt: '2026-08-14 17:05:44',
    description: '高峰期连接数已回落，建议持续观察慢查询。'
  }
];

export const mockConfigHistory: MockConfigHistory[] = [
  {
    id: 1,
    configName: '上传文件大小上限',
    paramKey: 'file.upload.max-size',
    beforeValue: '20',
    afterValue: '50',
    operator: 'Super',
    operatedAt: '2026-08-14 17:42:12',
    reason: '支持项目附件上传'
  },
  {
    id: 2,
    configName: '用户初始密码',
    paramKey: 'user.default-password',
    beforeValue: 'Welkin@2025',
    afterValue: '••••••••••',
    operator: 'Super',
    operatedAt: '2026-08-11 11:08:36',
    reason: '安全策略调整'
  },
  {
    id: 3,
    configName: '登录失败锁定次数',
    paramKey: 'security.login.max-failures',
    beforeValue: '5',
    afterValue: '10',
    operator: 'Super',
    operatedAt: '2026-08-02 14:21:08',
    reason: '降低误锁定概率'
  }
];

export const mockFileAssets: MockFileAsset[] = [
  {
    id: 1,
    fileName: '用户导入模板.xlsx',
    type: '文档',
    size: '28 KB',
    bizType: '用户管理',
    uploader: 'Super',
    updatedAt: '2026-08-15 09:10',
    previewable: true,
    shared: true
  },
  {
    id: 2,
    fileName: 'company-logo.svg',
    type: '图片',
    size: '12 KB',
    bizType: '品牌设置',
    uploader: 'Super',
    updatedAt: '2026-08-14 18:21',
    previewable: true,
    shared: true
  },
  {
    id: 3,
    fileName: '季度经营分析.pdf',
    type: '文档',
    size: '2.8 MB',
    bizType: '报表中心',
    uploader: 'Admin',
    updatedAt: '2026-08-14 16:08',
    previewable: true,
    shared: false
  },
  {
    id: 4,
    fileName: 'backup-2026-08-14.tar.gz',
    type: '压缩包',
    size: '486 MB',
    bizType: '系统备份',
    uploader: 'Super',
    updatedAt: '2026-08-14 02:00',
    previewable: false,
    shared: false
  },
  {
    id: 5,
    fileName: 'theme-settings.json',
    type: '其他',
    size: '6 KB',
    bizType: '主题配置',
    uploader: 'Super',
    updatedAt: '2026-08-12 13:34',
    previewable: false,
    shared: false
  }
];

export const mockDependencies = [
  {
    name: 'PostgreSQL',
    type: '数据库',
    address: 'postgresql:5432 / welkin',
    status: '正常',
    latency: '8 ms',
    checkedAt: '刚刚'
  },
  { name: 'Redis', type: '缓存', address: 'redis:6379', status: '正常', latency: '2 ms', checkedAt: '刚刚' },
  {
    name: 'MinIO',
    type: '对象存储',
    address: 'minio:9000 / welkin',
    status: '警告',
    latency: '126 ms',
    checkedAt: '刚刚'
  },
  {
    name: '消息服务',
    type: '消息队列',
    address: 'message-svc:9004',
    status: '正常',
    latency: '14 ms',
    checkedAt: '刚刚'
  }
];
