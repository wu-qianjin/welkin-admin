import { alova } from '../request';

/** drop null/undefined entries so alova does not serialize them as the literal "null" */
function cleanParams<T extends Record<string, unknown>>(params?: T) {
  if (!params) return undefined;

  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== null && value !== undefined)) as T;
}

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return alova.Get<Api.SystemManage.RoleList>('/systemManage/getRoleList', { params: cleanParams(params) });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return alova.Get<Api.SystemManage.AllRole[]>('/systemManage/getAllRoles');
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return alova.Get<Api.SystemManage.UserList>('/systemManage/getUserList', { params: cleanParams(params) });
}

export type UserModel = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
>;

/** add user */
export function addUser(data: UserModel) {
  return alova.Post<null>('/systemManage/addUser', data);
}

/** update user */
export function updateUser(data: UserModel & { id: number }) {
  return alova.Post<null>('/systemManage/updateUser', data);
}

/** delete user */
export function deleteUser(id: number) {
  return alova.Delete<null>('/systemManage/deleteUser', { id });
}

/** batch delete user */
export function batchDeleteUser(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteUser', { ids });
}

/** get menu list */
export function fetchGetMenuList(params?: Api.SystemManage.MenuSearchParams) {
  return alova.Get<Api.SystemManage.MenuList>('/systemManage/getMenuList/v2', { params: cleanParams(params) });
}

/** get all pages */
export function fetchGetAllPages() {
  return alova.Get<string[]>('/systemManage/getAllPages');
}

/** get menu tree */
export function fetchGetMenuTree() {
  return alova.Get<Api.SystemManage.MenuTree[]>('/systemManage/getMenuTree');
}

// ---------------- system config ----------------

export type SystemConfigModel = Pick<
  Api.SystemManage.SystemConfig,
  'paramName' | 'paramKey' | 'paramValue' | 'builtIn' | 'status' | 'remark'
>;

/** get config list */
export function fetchGetConfigList(params?: Api.SystemManage.SystemConfigSearchParams) {
  return alova.Get<Api.SystemManage.SystemConfigList>('/systemManage/getConfigList', {
    params: cleanParams(params)
  });
}

/** add config */
export function addConfig(data: SystemConfigModel) {
  return alova.Post<null>('/systemManage/addConfig', data);
}

/** update config */
export function updateConfig(data: SystemConfigModel & Pick<Api.SystemManage.SystemConfig, 'id'>) {
  return alova.Post<null>('/systemManage/updateConfig', data);
}

/** delete config */
export function deleteConfig(id: number) {
  return alova.Delete<null>('/systemManage/deleteConfig', { id });
}

/** batch delete config */
export function batchDeleteConfig(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteConfig', { ids });
}

// ---------------- system file ----------------

/** get file list */
export function fetchGetFileList(params?: Api.SystemManage.SystemFileSearchParams) {
  return alova.Get<Api.SystemManage.SystemFileList>('/systemManage/getFileList', {
    params: cleanParams(params)
  });
}

/**
 * register an uploaded file
 *
 * the real upload is handled by the storage service, this only records the file metadata
 */
export function uploadFile(data: Omit<Api.SystemManage.SystemFile, 'id' | 'createBy' | 'createTime'>) {
  return alova.Post<Api.SystemManage.SystemFile>('/systemManage/uploadFile', data);
}

/** delete file */
export function deleteFile(id: number) {
  return alova.Delete<null>('/systemManage/deleteFile', { id });
}

/** batch delete file */
export function batchDeleteFile(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteFile', { ids });
}

// ---------------- system notice ----------------

export type SystemNoticeModel = Pick<
  Api.SystemManage.SystemNotice,
  'title' | 'noticeType' | 'noticeStatus' | 'isTop' | 'content'
>;

/** get notice list */
export function fetchGetNoticeList(params?: Api.SystemManage.SystemNoticeSearchParams) {
  return alova.Get<Api.SystemManage.SystemNoticeList>('/systemManage/getNoticeList', {
    params: cleanParams(params)
  });
}

/** add notice */
export function addNotice(data: SystemNoticeModel) {
  return alova.Post<null>('/systemManage/addNotice', data);
}

/** update notice */
export function updateNotice(data: SystemNoticeModel & Pick<Api.SystemManage.SystemNotice, 'id'>) {
  return alova.Post<null>('/systemManage/updateNotice', data);
}

/** delete notice */
export function deleteNotice(id: number) {
  return alova.Delete<null>('/systemManage/deleteNotice', { id });
}

/** batch delete notice */
export function batchDeleteNotice(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteNotice', { ids });
}

// ---------------- dict ----------------

export type DictTypeModel = Pick<Api.SystemManage.DictType, 'dictName' | 'dictType' | 'status' | 'remark'>;

/** get dict type list */
export function fetchGetDictTypeList(params?: Api.SystemManage.DictTypeSearchParams) {
  return alova.Get<Api.SystemManage.DictTypeList>('/systemManage/getDictTypeList', {
    params: cleanParams(params)
  });
}

/** add dict type */
export function addDictType(data: DictTypeModel) {
  return alova.Post<null>('/systemManage/addDictType', data);
}

/** update dict type */
export function updateDictType(data: DictTypeModel & Pick<Api.SystemManage.DictType, 'id'>) {
  return alova.Post<null>('/systemManage/updateDictType', data);
}

/** delete dict type */
export function deleteDictType(id: number) {
  return alova.Delete<null>('/systemManage/deleteDictType', { id });
}

/** batch delete dict type */
export function batchDeleteDictType(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteDictType', { ids });
}

export type DictOptionModel = Pick<
  Api.SystemManage.DictOption,
  'dictType' | 'optionLabel' | 'optionValue' | 'sort' | 'colorTag' | 'status' | 'remark'
>;

/** get dict option list */
export function fetchGetDictOptionList(params?: Api.SystemManage.DictOptionSearchParams) {
  return alova.Get<Api.SystemManage.DictOptionList>('/systemManage/getDictOptionList', {
    params: cleanParams(params)
  });
}

/** add dict option */
export function addDictOption(data: DictOptionModel) {
  return alova.Post<null>('/systemManage/addDictOption', data);
}

/** update dict option */
export function updateDictOption(data: DictOptionModel & Pick<Api.SystemManage.DictOption, 'id'>) {
  return alova.Post<null>('/systemManage/updateDictOption', data);
}

/** delete dict option */
export function deleteDictOption(id: number) {
  return alova.Delete<null>('/systemManage/deleteDictOption', { id });
}

/** batch delete dict option */
export function batchDeleteDictOption(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteDictOption', { ids });
}

// ---------------- dept ----------------

export type DeptModel = Pick<
  Api.SystemManage.Dept,
  'deptName' | 'parentId' | 'leader' | 'phone' | 'email' | 'order' | 'status'
>;

/** get dept list (hierarchical) */
export function fetchGetDeptList(params?: Api.SystemManage.DeptSearchParams) {
  return alova.Get<Api.SystemManage.DeptList>('/systemManage/getDeptList', {
    params: cleanParams(params)
  });
}

/** add dept */
export function addDept(data: DeptModel) {
  return alova.Post<null>('/systemManage/addDept', data);
}

/** update dept */
export function updateDept(data: DeptModel & Pick<Api.SystemManage.Dept, 'id'>) {
  return alova.Post<null>('/systemManage/updateDept', data);
}

/** delete dept */
export function deleteDept(id: number) {
  return alova.Delete<null>('/systemManage/deleteDept', { id });
}

/** batch delete dept */
export function batchDeleteDept(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteDept', { ids });
}

// ---------------- api resource ----------------

export type ApiResourceModel = Pick<
  Api.SystemManage.ApiResource,
  'apiName' | 'apiPath' | 'apiMethod' | 'apiModule' | 'status' | 'remark'
>;

/** get api resource list */
export function fetchGetApiList(params?: Api.SystemManage.ApiResourceSearchParams) {
  return alova.Get<Api.SystemManage.ApiResourceList>('/systemManage/getApiList', {
    params: cleanParams(params)
  });
}

/** add api resource */
export function addApi(data: ApiResourceModel) {
  return alova.Post<null>('/systemManage/addApi', data);
}

/** update api resource */
export function updateApi(data: ApiResourceModel & Pick<Api.SystemManage.ApiResource, 'id'>) {
  return alova.Post<null>('/systemManage/updateApi', data);
}

/** delete api resource */
export function deleteApi(id: number) {
  return alova.Delete<null>('/systemManage/deleteApi', { id });
}

/** batch delete api resource */
export function batchDeleteApi(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteApi', { ids });
}

// ---------------- button resource ----------------

export type ButtonResourceModel = Pick<
  Api.SystemManage.ButtonResource,
  'buttonCode' | 'buttonName' | 'menuName' | 'status' | 'remark'
>;

/** get button resource list */
export function fetchGetButtonList(params?: Api.SystemManage.ButtonResourceSearchParams) {
  return alova.Get<Api.SystemManage.ButtonResourceList>('/systemManage/getButtonList', {
    params: cleanParams(params)
  });
}

/** add button resource */
export function addButton(data: ButtonResourceModel) {
  return alova.Post<null>('/systemManage/addButton', data);
}

/** update button resource */
export function updateButton(data: ButtonResourceModel & Pick<Api.SystemManage.ButtonResource, 'id'>) {
  return alova.Post<null>('/systemManage/updateButton', data);
}

/** delete button resource */
export function deleteButton(id: number) {
  return alova.Delete<null>('/systemManage/deleteButton', { id });
}

/** batch delete button resource */
export function batchDeleteButton(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteButton', { ids });
}

// ---------------- login log ----------------

/** get login log list */
export function fetchGetLoginLogList(params?: Api.SystemManage.LoginLogSearchParams) {
  return alova.Get<Api.SystemManage.LoginLogList>('/systemManage/getLoginLogList', {
    params: cleanParams(params)
  });
}

/** delete login log */
export function deleteLoginLog(id: number) {
  return alova.Delete<null>('/systemManage/deleteLoginLog', { id });
}

/** batch delete login log */
export function batchDeleteLoginLog(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteLoginLog', { ids });
}

/** clear all login logs */
export function clearLoginLog() {
  return alova.Delete<null>('/systemManage/clearLoginLog');
}

// ---------------- operate log ----------------

/** get operate log list */
export function fetchGetOperateLogList(params?: Api.SystemManage.OperateLogSearchParams) {
  return alova.Get<Api.SystemManage.OperateLogList>('/systemManage/getOperateLogList', {
    params: cleanParams(params)
  });
}

/** delete operate log */
export function deleteOperateLog(id: number) {
  return alova.Delete<null>('/systemManage/deleteOperateLog', { id });
}

/** batch delete operate log */
export function batchDeleteOperateLog(ids: number[]) {
  return alova.Delete<null>('/systemManage/batchDeleteOperateLog', { ids });
}

/** clear all operate logs */
export function clearOperateLog() {
  return alova.Delete<null>('/systemManage/clearOperateLog');
}

// ---------------- online user ----------------

/** get online user list */
export function fetchGetOnlineUserList(params?: Api.SystemManage.OnlineUserSearchParams) {
  return alova.Get<Api.SystemManage.OnlineUserList>('/systemManage/getOnlineUserList', {
    params: cleanParams(params)
  });
}

/** force logout online users */
export function forceLogout(ids: number[]) {
  return alova.Post<null>('/systemManage/forceLogout', { ids });
}
