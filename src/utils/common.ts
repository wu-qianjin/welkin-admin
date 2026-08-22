import dayjs from 'dayjs';
import { $t } from '@/locales';

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption<T extends Record<string, string>>(record: T) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  })) as CommonType.Option<keyof T, T[keyof T]>[];
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options: CommonType.Option<string, App.I18n.I18nKey>[]) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Format a backend timestamp as `yyyy-MM-dd HH:mm:ss`.
 *
 * Go services serialize time as RFC3339 UTC (`2026-08-18T13:21:35.1873916Z`);
 * dayjs normalizes it to the browser timezone, while already-formatted strings
 * (`2026-08-18 13:21:35`) pass through unchanged. Empty or invalid values render as `-`.
 *
 * @param value timestamp from the backend: ISO string, formatted string, ms or Date
 */
export function formatDateTime(value?: string | number | Date | null): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  const date = dayjs(value);

  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
}

/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className: string) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

/**
 * 后端分页 size 上限 100，按 total 循环拉齐全部页。
 * 供角色授权资源、菜单选择等需要完整数据源的场景使用。
 */
export async function fetchAllPages<T>(
  fetchPage: (current: number, size: number) => Promise<{ records: T[]; total: number; size: number }>
): Promise<T[]> {
  const first = await fetchPage(1, 100);
  const records = [...first.records];
  const pages = Math.ceil(first.total / (first.size || 100));

  for (let current = 2; current <= pages; current += 1) {
    const rest = await fetchPage(current, 100);
    records.push(...rest.records);
  }

  return records;
}
