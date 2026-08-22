/** 从原始 User-Agent 提取浏览器与操作系统描述（个人中心登录设备、首页最近登录共用） */
export interface UserAgentInfo {
  browser: string;
  browserVersion: string;
  os: string;
  label: string;
  mobile: boolean;
}

export function parseUserAgent(ua: string): UserAgentInfo {
  if (!ua) {
    return { browser: '', browserVersion: '', os: '', label: '', mobile: false };
  }
  let browser = '';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';
  else if (/curl\//.test(ua)) browser = 'curl';
  else if (/Go-http-client/.test(ua)) browser = 'Go HTTP Client';

  let os = '';
  if (/Windows NT 10/.test(ua)) os = 'Windows';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/iPhone/.test(ua)) os = 'iPhone';
  else if (/iPad/.test(ua)) os = 'iPad';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  const browserVersion = ua.match(/(?:Chrome|Firefox|Safari|Edge|OPR)\/(\d+)/)?.[1] ?? '';
  const label = browserVersion ? [browser, browserVersion].filter(Boolean).join(' ') : browser;
  return {
    browser,
    browserVersion,
    os,
    label: os ? `${label} · ${os}` : label,
    mobile: /iPhone|Android|Mobile/i.test(ua)
  };
}
