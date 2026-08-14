import { transformRecordToOption } from '@/utils/common';

export const enableStatusRecord: Record<Api.Common.EnableStatus, App.I18n.I18nKey> = {
  '1': 'page.manage.common.status.enable',
  '2': 'page.manage.common.status.disable'
};

export const enableStatusOptions = transformRecordToOption(enableStatusRecord);

export const userGenderRecord: Record<Api.SystemManage.UserGender, App.I18n.I18nKey> = {
  '1': 'page.manage.user.gender.male',
  '2': 'page.manage.user.gender.female'
};

export const userGenderOptions = transformRecordToOption(userGenderRecord);

export const menuTypeRecord: Record<Api.SystemManage.MenuType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.type.directory',
  '2': 'page.manage.menu.type.menu'
};

export const menuTypeOptions = transformRecordToOption(menuTypeRecord);

export const menuIconTypeRecord: Record<Api.SystemManage.IconType, App.I18n.I18nKey> = {
  '1': 'page.manage.menu.iconType.iconify',
  '2': 'page.manage.menu.iconType.local'
};

export const menuIconTypeOptions = transformRecordToOption(menuIconTypeRecord);

export const fileTypeRecord: Record<Api.SystemManage.FileType, App.I18n.I18nKey> = {
  '1': 'page.manage.file.type.image',
  '2': 'page.manage.file.type.document',
  '3': 'page.manage.file.type.archive',
  '4': 'page.manage.file.type.other'
};

export const fileTypeOptions = transformRecordToOption(fileTypeRecord);

export const noticeTypeRecord: Record<Api.SystemManage.NoticeType, App.I18n.I18nKey> = {
  '1': 'page.manage.notice.type.notice',
  '2': 'page.manage.notice.type.announcement'
};

export const noticeTypeOptions = transformRecordToOption(noticeTypeRecord);

export const noticeStatusRecord: Record<Api.SystemManage.NoticeStatus, App.I18n.I18nKey> = {
  '1': 'page.manage.notice.status.draft',
  '2': 'page.manage.notice.status.published',
  '3': 'page.manage.notice.status.withdrawn'
};

export const noticeStatusOptions = transformRecordToOption(noticeStatusRecord);

export const apiMethodOptions: { label: Api.SystemManage.ApiMethod; value: Api.SystemManage.ApiMethod }[] = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' }
];

export const operateTypeRecord: Record<Api.SystemManage.OperateType, App.I18n.I18nKey> = {
  '1': 'page.manage.log.operate.type.add',
  '2': 'page.manage.log.operate.type.update',
  '3': 'page.manage.log.operate.type.delete',
  '4': 'page.manage.log.operate.type.export',
  '5': 'page.manage.log.operate.type.import',
  '6': 'page.manage.log.operate.type.other'
};

export const operateTypeOptions = transformRecordToOption(operateTypeRecord);
