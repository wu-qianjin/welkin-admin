/**
 * 字典种子脚本：把前端 constants/business.ts 中适合字典管理的枚举
 * （≥3 个选项或业务上需要扩展的枚举）写入后端 system 服务字典表。
 *
 * 纳入：notice_status 通知状态 / operate_type 操作日志类型 / file_type 文件类型 / api_method 请求方式。
 * 排除：enable_status、user_gender、menu_type、notice_type 等只有 1~2 个固定选项的枚举，
 *       以及各处 yes/no 布尔标记 —— 这些选项稳定、无扩展需求，留在前端常量更直观。
 *
 * 用法：IAM_USERNAME=admin IAM_PASSWORD=... npx tsx scripts/seed-dicts.ts
 * 幂等：已存在的字典类型（按 dictType）跳过；选项按 dictType + optionValue 比对后只补缺。
 */
const GATEWAY_BASE = process.env.GATEWAY_BASE ?? 'http://127.0.0.1:41528';
const IAM_USERNAME = process.env.IAM_USERNAME;
const IAM_PASSWORD = process.env.IAM_PASSWORD;

interface SeedOption {
  optionLabel: string;
  optionValue: string;
  sort: number;
  colorTag: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';
  remark?: string;
}

interface SeedDictType {
  dictName: string;
  dictType: string;
  remark: string;
  options: SeedOption[];
}

const dictTypes: SeedDictType[] = [
  {
    dictName: '通知状态',
    dictType: 'notice_status',
    remark: '通知公告模块使用（system/notice）',
    options: [
      { optionLabel: '草稿', optionValue: '1', sort: 1, colorTag: 'default' },
      { optionLabel: '已发布', optionValue: '2', sort: 2, colorTag: 'success' },
      { optionLabel: '已撤回', optionValue: '3', sort: 3, colorTag: 'warning' }
    ]
  },
  {
    dictName: '操作类型',
    dictType: 'operate_type',
    remark: '操作日志模块使用（audit/log）',
    options: [
      { optionLabel: '新增', optionValue: '1', sort: 1, colorTag: 'info' },
      { optionLabel: '修改', optionValue: '2', sort: 2, colorTag: 'primary' },
      { optionLabel: '删除', optionValue: '3', sort: 3, colorTag: 'error' },
      { optionLabel: '导出', optionValue: '4', sort: 4, colorTag: 'warning' },
      { optionLabel: '导入', optionValue: '5', sort: 5, colorTag: 'success' },
      { optionLabel: '其它', optionValue: '6', sort: 6, colorTag: 'default' }
    ]
  },
  {
    dictName: '文件类型',
    dictType: 'file_type',
    remark: '文件管理模块使用（system/file）',
    options: [
      { optionLabel: '图片', optionValue: '1', sort: 1, colorTag: 'info' },
      { optionLabel: '文档', optionValue: '2', sort: 2, colorTag: 'primary' },
      { optionLabel: '压缩包', optionValue: '3', sort: 3, colorTag: 'warning' },
      { optionLabel: '其它', optionValue: '4', sort: 4, colorTag: 'default' }
    ]
  },
  {
    dictName: '请求方式',
    dictType: 'api_method',
    remark: 'API 资源管理使用（auth/resource），可按需扩展 PATCH 等方法',
    options: [
      { optionLabel: 'GET', optionValue: 'GET', sort: 1, colorTag: 'info' },
      { optionLabel: 'POST', optionValue: 'POST', sort: 2, colorTag: 'success' },
      { optionLabel: 'PUT', optionValue: 'PUT', sort: 3, colorTag: 'warning' },
      { optionLabel: 'DELETE', optionValue: 'DELETE', sort: 4, colorTag: 'error' }
    ]
  }
];

let token = '';

async function api<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(`${GATEWAY_BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const json = (await res.json()) as { code: number; message: string; data: T };
  if (json.code !== 0) throw new Error(`${method} ${url} -> ${json.code} ${json.message}`);
  return json.data;
}

async function login() {
  if (!IAM_USERNAME || !IAM_PASSWORD) {
    throw new Error('请设置 IAM_USERNAME 与 IAM_PASSWORD 后再执行字典种子脚本');
  }
  const res = await fetch(`${GATEWAY_BASE}/v1/iam/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: IAM_USERNAME, password: IAM_PASSWORD })
  });
  const json = (await res.json()) as { code: number; message: string; data?: { accessToken?: string } };
  if (json.code !== 0 || !json.data?.accessToken) {
    throw new Error(`登录失败：${json.code} ${json.message}`);
  }
  token = json.data.accessToken;
}

async function loadDictTypeNames(): Promise<Set<string>> {
  const page = await api<{ records: Array<{ dictType: string }>; total: number }>('POST', '/v1/system/dictType/page', {
    current: 1,
    size: 100,
    dictName: '',
    dictType: ''
  });
  return new Set(page.records.map(item => item.dictType));
}

async function loadOptionValues(dictType: string): Promise<Set<string>> {
  const page = await api<{ records: Array<{ optionValue: string }>; total: number }>(
    'POST',
    '/v1/system/dictOption/page',
    { current: 1, size: 100, dictType, optionLabel: '' }
  );
  return new Set(page.records.map(item => item.optionValue));
}

async function main() {
  console.log('0. 通过网关登录...');
  await login();
  console.log('1. 同步现有字典类型...');
  const existingTypes = await loadDictTypeNames();

  for (const dictType of dictTypes) {
    if (existingTypes.has(dictType.dictType)) {
      console.log(`  = ${dictType.dictType}(${dictType.dictName}) 已存在，跳过`);
    } else {
      await api('POST', '/v1/system/dictType/create', {
        dictName: dictType.dictName,
        dictType: dictType.dictType,
        status: 1,
        remark: dictType.remark
      });
      console.log(`  + ${dictType.dictType}(${dictType.dictName})`);
    }

    const existingOptions = await loadOptionValues(dictType.dictType);
    for (const option of dictType.options) {
      if (existingOptions.has(option.optionValue)) continue;
      await api('POST', '/v1/system/dictOption/create', {
        dictType: dictType.dictType,
        optionLabel: option.optionLabel,
        optionValue: option.optionValue,
        sort: option.sort,
        colorTag: option.colorTag,
        status: 1,
        remark: option.remark ?? ''
      });
      console.log(`    + ${option.optionLabel}(${option.optionValue})`);
    }
  }
  console.log('完成。刷新「系统管理 → 字典管理」即可看到数据。');
}

main().catch(err => {
  console.error('种子脚本失败:', err.message);
  process.exit(1);
});
