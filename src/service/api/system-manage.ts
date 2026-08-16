import { alova } from '../request';

// ---------------- role (real backend via gateway, contract: docs/iam/openapi.yaml) ----------------

/** backend role item (status is int 0/1) */
interface BackendRoleItem {
  id: string;
  roleName: string;
  roleCode: string;
  roleDesc: string;
  status: number;
  builtIn: string;
  createTime: string;
}

function adaptRoleItem(item: BackendRoleItem): Api.SystemManage.Role {
  return {
    id: item.id,
    roleName: item.roleName,
    roleCode: item.roleCode,
    roleDesc: item.roleDesc,
    builtIn: item.builtIn,
    status: item.status === 1 ? '1' : '2',
    createTime: item.createTime,
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

/** get role list (paged, POST /v1/iam/role/page) */
export async function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  const res = await alova.Post<{ records: BackendRoleItem[]; current: number; size: number; total: number }>(
    '/v1/iam/role/page',
    {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      roleName: params?.roleName ?? '',
      roleCode: params?.roleCode ?? '',
      status: params?.status ? Number(params.status === '1' ? 1 : 0) : undefined
    }
  );
  return { ...res, records: res.records.map(adaptRoleItem) } as Api.SystemManage.RoleList;
}

/** get all roles (GET /v1/iam/role/all) */
export async function fetchGetAllRoles() {
  const res = await alova.Get<BackendRoleItem[]>('/v1/iam/role/all');
  return res.map(adaptRoleItem) as unknown as Api.SystemManage.AllRole[];
}

export type RoleModel = Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'roleDesc' | 'status'>;

/** add role */
export function addRole(data: RoleModel) {
  return alova.Post<{ id: string }>('/v1/iam/role/create', {
    roleName: data.roleName,
    roleCode: data.roleCode,
    roleDesc: data.roleDesc ?? '',
    status: data.status === '2' ? 0 : 1
  });
}

/** update role */
export function updateRole(data: RoleModel & Pick<Api.SystemManage.Role, 'id'>) {
  return alova.Put<null>(`/v1/iam/role/update/${data.id}`, {
    roleName: data.roleName,
    roleCode: data.roleCode,
    roleDesc: data.roleDesc ?? '',
    status: data.status === '2' ? 0 : 1
  });
}

/** delete role */
export function deleteRole(id: string) {
  return alova.Delete<null>('/v1/iam/role/delete', { ids: [id] });
}

/** batch delete role */
export function batchDeleteRole(ids: string[]) {
  return alova.Delete<null>('/v1/iam/role/delete', { ids });
}

export interface RolePermissionModel {
  menuIds: string[];
  apiIds: string[];
  buttonIds: string[];
}

export function fetchRolePermissions(roleId: string) {
  return alova.Get<RolePermissionModel>(`/v1/iam/role/${roleId}/permissions`);
}

export function updateRolePermissions(roleId: string, data: RolePermissionModel) {
  return alova.Put<null>(`/v1/iam/role/${roleId}/permissions`, data);
}

interface BackendUserItem {
  id: string;
  userName: string;
  userGender: number;
  nickName: string;
  userPhone: string;
  userEmail: string;
  userRoles: string[];
  deptId: string;
  status: number;
  createTime: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

function adaptUserItem(item: BackendUserItem): Api.SystemManage.User {
  return {
    id: item.id,
    userName: item.userName,
    userGender: item.userGender === 0 ? null : (String(item.userGender) as Api.SystemManage.UserGender),
    nickName: item.nickName,
    userPhone: item.userPhone,
    userEmail: item.userEmail,
    userRoles: item.userRoles ?? [],
    status: item.status === 1 ? '1' : '2',
    deptId: item.deptId,
    createTime: item.createTime,
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

/** get user detail */
export function fetchGetUserDetail(id: string) {
  return alova.Get<BackendUserItem & { failedAttempts: number; lockedUntil?: string }>(`/v1/iam/user/detail/${id}`);
}

/** update user status */
export function updateUserStatus(id: string, status: 0 | 1) {
  return alova.Put<null>(`/v1/iam/user/status/${id}`, { status });
}

/** reset user password */
export function resetUserPassword(id: string, password: string) {
  return alova.Put<null>(`/v1/iam/user/password/reset/${id}`, { password });
}

/** get user list (paged, POST /v1/iam/user/page) */
export async function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  const res = await alova.Post<{ records: BackendUserItem[]; current: number; size: number; total: number }>(
    '/v1/iam/user/page',
    {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      userName: params?.userName ?? '',
      nickName: params?.nickName ?? '',
      userPhone: params?.userPhone ?? '',
      userEmail: params?.userEmail ?? '',
      userGender: params?.userGender ? Number(params.userGender) : undefined,
      status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
    }
  );
  return { ...res, records: res.records.map(adaptUserItem) } as Api.SystemManage.UserList;
}

export type UserModel = Pick<
  Api.SystemManage.User,
  'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'userRoles' | 'status'
>;

/** add user */
export function addUser(data: UserModel) {
  return alova.Post<{ id: string; tempPassword?: string }>('/v1/iam/user/create', {
    ...data,
    userGender: data.userGender ? Number(data.userGender) : 0,
    status: data.status === '2' ? 0 : 1,
    userRoles: data.userRoles ?? []
  });
}

/** update user */
export function updateUser(data: UserModel & { id: string }) {
  return alova.Put<null>(`/v1/iam/user/update/${data.id}`, {
    ...data,
    userGender: data.userGender ? Number(data.userGender) : 0,
    status: data.status === '2' ? 0 : 1,
    userRoles: data.userRoles ?? []
  });
}

/** delete user */
export function deleteUser(id: string) {
  return alova.Delete<null>('/v1/iam/user/delete', { ids: [id] });
}

/** batch delete user */
export function batchDeleteUser(ids: string[]) {
  return alova.Delete<null>('/v1/iam/user/delete', { ids });
}

/** get menu list */
export function fetchGetMenuList(params?: Api.SystemManage.MenuSearchParams) {
  return alova
    .Post<{ records: BackendMenuItem[]; current: number; size: number; total: number }>('/v1/iam/menu/page', {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      menuName: params?.menuName ?? '',
      menuType: params?.menuType ?? '',
      status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
    })
    .then(res => ({ ...res, records: res.records.map(adaptMenuItem) })) as Promise<Api.SystemManage.MenuList>;
}

/** get all pages */
export function fetchGetAllPages() {
  return alova.Get<string[]>('/v1/iam/menu/pages');
}

/** get menu tree */
export function fetchGetMenuTree() {
  return alova.Get<Api.SystemManage.MenuTree[]>('/v1/iam/menu/tree');
}

interface BackendMenuItem {
  id: string;
  parentId: string;
  menuType: Api.SystemManage.MenuType;
  menuName: string;
  routeName: string;
  routePath: string;
  component: string;
  icon: string;
  iconType: Api.SystemManage.IconType;
  status: number;
  order: number;
  i18nKey: string;
  keepAlive: boolean;
  constant: boolean;
  href: string;
  hideInMenu: boolean;
  activeMenu: string;
  multiTab: boolean;
  fixedIndexInTab?: number;
  query: { key: string; value: string }[];
  buttons: Api.SystemManage.MenuButton[];
  createTime: string;
}

function adaptMenuItem(item: BackendMenuItem): Api.SystemManage.Menu {
  return {
    ...item,
    parentId: item.parentId,
    i18nKey: item.i18nKey as App.I18n.I18nKey,
    activeMenu: item.activeMenu as Api.SystemManage.Menu['activeMenu'],
    status: item.status === 1 ? '1' : '2',
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

export type MenuModel = Omit<
  Api.SystemManage.Menu,
  'id' | 'createBy' | 'createTime' | 'updateBy' | 'updateTime' | 'children'
>;

export function addMenu(data: MenuModel) {
  return alova.Post<{ id: string }>('/v1/iam/menu/create', {
    ...data,
    parentId: String(data.parentId),
    status: data.status === '2' ? 0 : 1
  });
}

export function updateMenu(data: MenuModel & Pick<Api.SystemManage.Menu, 'id'>) {
  return alova.Put<null>(`/v1/iam/menu/update/${data.id}`, {
    ...data,
    parentId: String(data.parentId),
    status: data.status === '2' ? 0 : 1
  });
}

export function deleteMenu(id: string) {
  return alova.Delete<null>('/v1/iam/menu/delete', { ids: [id] });
}

export function batchDeleteMenu(ids: string[]) {
  return alova.Delete<null>('/v1/iam/menu/delete', { ids });
}

// ---------------- system config ----------------

interface BackendConfigItem {
  id: string;
  paramName: string;
  paramKey: string;
  paramValue: string;
  builtIn: string;
  status: number;
  remark: string;
  createTime: string;
}

function adaptConfigItem(item: BackendConfigItem): Api.SystemManage.SystemConfig {
  return {
    id: item.id,
    paramName: item.paramName,
    paramKey: item.paramKey,
    paramValue: item.paramValue,
    builtIn: item.builtIn as CommonType.YesOrNo,
    status: item.status === 1 ? '1' : '2',
    remark: item.remark,
    createTime: item.createTime,
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

export type SystemConfigModel = Pick<
  Api.SystemManage.SystemConfig,
  'paramName' | 'paramKey' | 'paramValue' | 'builtIn' | 'status' | 'remark'
>;

/** get config list */
export function fetchGetConfigList(params?: Api.SystemManage.SystemConfigSearchParams) {
  return alova
    .Post<{ records: BackendConfigItem[]; current: number; size: number; total: number }>('/v1/system/config/page', {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      paramName: params?.paramName ?? '',
      paramKey: params?.paramKey ?? '',
      status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
    })
    .then(res => ({ ...res, records: res.records.map(adaptConfigItem) })) as Promise<Api.SystemManage.SystemConfigList>;
}

/** add config */
export function addConfig(data: SystemConfigModel) {
  return alova.Post<{ id: string }>('/v1/system/config/create', {
    ...data,
    status: data.status === '2' ? 0 : 1,
    builtIn: data.builtIn === 'Y' ? 'Y' : 'N'
  });
}

/** update config */
export function updateConfig(data: SystemConfigModel & Pick<Api.SystemManage.SystemConfig, 'id'>) {
  return alova.Put<null>(`/v1/system/config/update/${data.id}`, {
    ...data,
    status: data.status === '2' ? 0 : 1,
    builtIn: data.builtIn === 'Y' ? 'Y' : 'N'
  });
}

/** delete config */
export function deleteConfig(id: string) {
  return alova.Delete<null>('/v1/system/config/delete', { ids: [id] });
}

/** batch delete config */
export function batchDeleteConfig(ids: string[]) {
  return alova.Delete<null>('/v1/system/config/delete', { ids });
}

export interface ConfigHistoryItem {
  id: string;
  paramName: string;
  paramKey: string;
  beforeValue: string;
  afterValue: string;
  operator: string;
  operatedAt: string;
  reason: string;
}

export function fetchConfigHistory(params?: { current?: number; size?: number; configId?: string }) {
  return alova.Post<{ records: ConfigHistoryItem[]; current: number; size: number; total: number }>(
    '/v1/system/config/history/page',
    {
      current: params?.current ?? 1,
      size: params?.size ?? 100,
      configId: params?.configId
    }
  );
}

// ---------------- system file ----------------

/** get file list */
export function fetchGetFileList(params?: Api.SystemManage.SystemFileSearchParams) {
  return alova
    .Post<{ records: BackendFileItem[]; current: number; size: number; total: number }>('/v1/system/file/page', {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      fileName: params?.fileName ?? '',
      fileType: params?.fileType ? Number(params.fileType) : undefined
    })
    .then(res => ({ ...res, records: res.records.map(adaptFileItem) })) as Promise<Api.SystemManage.SystemFileList>;
}

interface BackendFileItem {
  id: string;
  fileName: string;
  fileType: number;
  fileSize: number;
  bizType: string;
  createBy: string;
  createTime: string;
  objectKey?: string;
}
function adaptFileItem(item: BackendFileItem): Api.SystemManage.SystemFile {
  return { ...item, fileType: String(item.fileType) as Api.SystemManage.FileType };
}

/** upload file bytes; the backend persists metadata and object storage key atomically */
export function uploadFile(file: File, bizType = '') {
  const body = new FormData();
  body.append('file', file);
  body.append('bizType', bizType);
  return alova.Post<Api.SystemManage.SystemFile>('/v1/system/file/upload', body);
}

/** delete file */
export function deleteFile(id: string) {
  return alova.Delete<null>('/v1/system/file/delete', { ids: [id] });
}

/** batch delete file */
export function batchDeleteFile(ids: string[]) {
  return alova.Delete<null>('/v1/system/file/delete', { ids });
}

// ---------------- system notice ----------------

export type SystemNoticeModel = Pick<
  Api.SystemManage.SystemNotice,
  'title' | 'noticeType' | 'noticeStatus' | 'isTop' | 'content'
>;

/** get notice list */
export function fetchGetNoticeList(params?: Api.SystemManage.SystemNoticeSearchParams) {
  return alova
    .Post<{ records: BackendNoticeItem[]; current: number; size: number; total: number }>('/v1/system/notice/page', {
      current: params?.current ?? 1,
      size: params?.size ?? 10,
      title: params?.title ?? '',
      noticeType: params?.noticeType ? Number(params.noticeType) : undefined,
      noticeStatus: params?.noticeStatus ? Number(params.noticeStatus) : undefined
    })
    .then(res => ({ ...res, records: res.records.map(adaptNoticeItem) })) as Promise<Api.SystemManage.SystemNoticeList>;
}

interface BackendNoticeItem {
  id: string;
  title: string;
  noticeType: number;
  noticeStatus: number;
  isTop: boolean;
  content: string;
  author: string;
  createTime: string;
  updateTime: string;
}

function adaptNoticeItem(item: BackendNoticeItem): Api.SystemManage.SystemNotice {
  return {
    ...item,
    noticeType: String(item.noticeType) as Api.SystemManage.NoticeType,
    noticeStatus: String(item.noticeStatus) as Api.SystemManage.NoticeStatus,
    status: item.noticeStatus === 1 ? '1' : '2',
    createBy: item.author,
    updateBy: item.author
  };
}

/** add notice */
export function addNotice(data: SystemNoticeModel) {
  return alova.Post<{ id: string }>('/v1/system/notice/create', {
    ...data,
    noticeType: Number(data.noticeType),
    noticeStatus: Number(data.noticeStatus)
  });
}

/** update notice */
export function updateNotice(data: SystemNoticeModel & Pick<Api.SystemManage.SystemNotice, 'id'>) {
  return alova.Put<null>(`/v1/system/notice/update/${data.id}`, {
    ...data,
    noticeType: Number(data.noticeType),
    noticeStatus: Number(data.noticeStatus)
  });
}

/** delete notice */
export function deleteNotice(id: string) {
  return alova.Delete<null>('/v1/system/notice/delete', { ids: [id] });
}

/** batch delete notice */
export function batchDeleteNotice(ids: string[]) {
  return alova.Delete<null>('/v1/system/notice/delete', { ids });
}

// ---------------- dict ----------------

interface BackendDictTypeItem {
  id: string;
  dictName: string;
  dictType: string;
  status: number;
  remark: string;
  createTime: string;
}

interface BackendDictOptionItem {
  id: string;
  dictType: string;
  optionLabel: string;
  optionValue: string;
  sort: number;
  colorTag: string;
  status: number;
  remark: string;
  createTime: string;
}

function adaptDictTypeItem(item: BackendDictTypeItem): Api.SystemManage.DictType {
  return {
    id: item.id,
    dictName: item.dictName,
    dictType: item.dictType,
    status: item.status === 1 ? '1' : '2',
    remark: item.remark,
    createTime: item.createTime,
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

function adaptDictOptionItem(item: BackendDictOptionItem): Api.SystemManage.DictOption {
  return {
    id: item.id,
    dictType: item.dictType,
    optionLabel: item.optionLabel,
    optionValue: item.optionValue,
    sort: item.sort,
    colorTag: item.colorTag as Api.SystemManage.DictColorTag,
    status: item.status === 1 ? '1' : '2',
    remark: item.remark,
    createTime: item.createTime,
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

export type DictTypeModel = Pick<Api.SystemManage.DictType, 'dictName' | 'dictType' | 'status' | 'remark'>;

/** get dict type list */
export function fetchGetDictTypeList(params?: Api.SystemManage.DictTypeSearchParams) {
  return alova
    .Post<{ records: BackendDictTypeItem[]; current: number; size: number; total: number }>(
      '/v1/system/dictType/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        dictName: params?.dictName ?? '',
        dictType: params?.dictType ?? '',
        status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
      }
    )
    .then(res => ({ ...res, records: res.records.map(adaptDictTypeItem) })) as Promise<Api.SystemManage.DictTypeList>;
}

/** add dict type */
export function addDictType(data: DictTypeModel) {
  return alova.Post<{ id: string }>('/v1/system/dictType/create', { ...data, status: data.status === '2' ? 0 : 1 });
}

/** update dict type */
export function updateDictType(data: DictTypeModel & Pick<Api.SystemManage.DictType, 'id'>) {
  return alova.Put<null>(`/v1/system/dictType/update/${data.id}`, { ...data, status: data.status === '2' ? 0 : 1 });
}

/** delete dict type */
export function deleteDictType(id: string) {
  return alova.Delete<null>('/v1/system/dictType/delete', { ids: [id] });
}

/** batch delete dict type */
export function batchDeleteDictType(ids: string[]) {
  return alova.Delete<null>('/v1/system/dictType/delete', { ids });
}

export type DictOptionModel = Pick<
  Api.SystemManage.DictOption,
  'dictType' | 'optionLabel' | 'optionValue' | 'sort' | 'colorTag' | 'status' | 'remark'
>;

/** get dict option list */
export function fetchGetDictOptionList(params?: Api.SystemManage.DictOptionSearchParams) {
  return alova
    .Post<{ records: BackendDictOptionItem[]; current: number; size: number; total: number }>(
      '/v1/system/dictOption/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        dictType: params?.dictType ?? '',
        optionLabel: params?.optionLabel ?? '',
        status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
      }
    )
    .then(res => ({
      ...res,
      records: res.records.map(adaptDictOptionItem)
    })) as Promise<Api.SystemManage.DictOptionList>;
}

/** add dict option */
export function addDictOption(data: DictOptionModel) {
  return alova.Post<{ id: string }>('/v1/system/dictOption/create', { ...data, status: data.status === '2' ? 0 : 1 });
}

/** update dict option */
export function updateDictOption(data: DictOptionModel & Pick<Api.SystemManage.DictOption, 'id'>) {
  return alova.Put<null>(`/v1/system/dictOption/update/${data.id}`, { ...data, status: data.status === '2' ? 0 : 1 });
}

/** delete dict option */
export function deleteDictOption(id: string) {
  return alova.Delete<null>('/v1/system/dictOption/delete', { ids: [id] });
}

/** batch delete dict option */
export function batchDeleteDictOption(ids: string[]) {
  return alova.Delete<null>('/v1/system/dictOption/delete', { ids });
}

// ---------------- dept (real backend via gateway, contract: docs/iam/openapi.yaml) ----------------

export type DeptModel = Pick<
  Api.SystemManage.Dept,
  'deptName' | 'parentId' | 'leader' | 'phone' | 'email' | 'order' | 'status'
>;

/** backend dept node (status is int 0/1) */
interface BackendDeptNode {
  id: string;
  parentId: string;
  deptName: string;
  leader: string;
  phone: string;
  email: string;
  order: number;
  status: number;
  createTime: string;
  children: BackendDeptNode[] | null;
}

/** adapter: backend status(0/1) -> frontend EnableStatus("1"/"2") */
function adaptDeptNode(node: BackendDeptNode): Api.SystemManage.Dept {
  return {
    id: node.id,
    parentId: node.parentId,
    deptName: node.deptName,
    leader: node.leader,
    phone: node.phone,
    email: node.email,
    order: node.order,
    status: node.status === 1 ? '1' : '2',
    createTime: node.createTime,
    createBy: '',
    updateTime: '',
    updateBy: '',
    children: node.children?.map(adaptDeptNode) ?? null
  };
}

/** adapter: frontend form model -> backend save request */
function toDeptSaveReq(data: DeptModel & { id?: string }) {
  return {
    parentId: String(data.parentId ?? '0'),
    deptName: data.deptName,
    leader: data.leader ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    order: data.order ?? 1,
    status: data.status === '2' ? 0 : 1
  };
}

/** get dept tree (hierarchical, POST /v1/iam/dept/tree) */
export async function fetchGetDeptList(params?: Api.SystemManage.DeptSearchParams) {
  const res = await alova.Post<BackendDeptNode[]>('/v1/iam/dept/tree', {
    deptName: params?.deptName ?? '',
    status: params?.status ? Number(params.status === '1' ? 1 : 0) : undefined
  });
  const records = res.map(adaptDeptNode);
  return { records, current: 1, size: records.length, total: records.length } as Api.SystemManage.DeptList;
}

/** add dept */
export function addDept(data: DeptModel) {
  return alova.Post<{ id: string }>('/v1/iam/dept/create', toDeptSaveReq(data));
}

/** update dept */
export function updateDept(data: DeptModel & Pick<Api.SystemManage.Dept, 'id'>) {
  return alova.Put<null>(`/v1/iam/dept/update/${data.id}`, toDeptSaveReq(data));
}

/** delete dept */
export function deleteDept(id: string) {
  return alova.Delete<null>('/v1/iam/dept/delete', { ids: [id] });
}

/** batch delete dept */
export function batchDeleteDept(ids: string[]) {
  return alova.Delete<null>('/v1/iam/dept/delete', { ids });
}

// ---------------- api resource ----------------

export type ApiResourceModel = Pick<
  Api.SystemManage.ApiResource,
  'apiName' | 'apiPath' | 'apiMethod' | 'apiModule' | 'status' | 'remark'
>;

/** get api resource list */
interface BackendAPIResourceItem {
  id: string;
  apiName: string;
  apiPath: string;
  apiMethod: Api.SystemManage.ApiMethod;
  apiModule: string;
  status: number;
  remark: string;
  createTime: string;
}

function adaptAPIResourceItem(item: BackendAPIResourceItem): Api.SystemManage.ApiResource {
  return {
    ...item,
    status: item.status === 1 ? '1' : '2',
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

export function fetchGetApiList(params?: Api.SystemManage.ApiResourceSearchParams) {
  return alova
    .Post<{ records: BackendAPIResourceItem[]; current: number; size: number; total: number }>(
      '/v1/iam/apiResource/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        apiName: params?.apiName ?? '',
        apiPath: params?.apiPath ?? '',
        apiMethod: params?.apiMethod ?? '',
        apiModule: params?.apiModule ?? '',
        status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
      }
    )
    .then(res => ({
      ...res,
      records: res.records.map(adaptAPIResourceItem)
    })) as Promise<Api.SystemManage.ApiResourceList>;
}

/** add api resource */
export function addApi(data: ApiResourceModel) {
  return alova.Post<{ id: string }>('/v1/iam/apiResource/create', { ...data, status: data.status === '2' ? 0 : 1 });
}

/** update api resource */
export function updateApi(data: ApiResourceModel & Pick<Api.SystemManage.ApiResource, 'id'>) {
  return alova.Put<null>(`/v1/iam/apiResource/update/${data.id}`, { ...data, status: data.status === '2' ? 0 : 1 });
}

/** delete api resource */
export function deleteApi(id: string) {
  return alova.Delete<null>('/v1/iam/apiResource/delete', { ids: [id] });
}

/** batch delete api resource */
export function batchDeleteApi(ids: string[]) {
  return alova.Delete<null>('/v1/iam/apiResource/delete', { ids });
}

// ---------------- button resource ----------------

export type ButtonResourceModel = Pick<
  Api.SystemManage.ButtonResource,
  'buttonCode' | 'buttonName' | 'menuName' | 'status' | 'remark'
>;

/** get button resource list */
interface BackendButtonResourceItem {
  id: string;
  buttonCode: string;
  buttonName: string;
  menuName: string;
  status: number;
  remark: string;
  createTime: string;
}

function adaptButtonResourceItem(item: BackendButtonResourceItem): Api.SystemManage.ButtonResource {
  return {
    ...item,
    status: item.status === 1 ? '1' : '2',
    createBy: '',
    updateTime: '',
    updateBy: ''
  };
}

export function fetchGetButtonList(params?: Api.SystemManage.ButtonResourceSearchParams) {
  return alova
    .Post<{ records: BackendButtonResourceItem[]; current: number; size: number; total: number }>(
      '/v1/iam/buttonResource/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        buttonCode: params?.buttonCode ?? '',
        buttonName: params?.buttonName ?? '',
        menuName: params?.menuName ?? '',
        status: params?.status ? (params.status === '1' ? 1 : 0) : undefined
      }
    )
    .then(res => ({
      ...res,
      records: res.records.map(adaptButtonResourceItem)
    })) as Promise<Api.SystemManage.ButtonResourceList>;
}

/** add button resource */
export function addButton(data: ButtonResourceModel) {
  return alova.Post<{ id: string }>('/v1/iam/buttonResource/create', { ...data, status: data.status === '2' ? 0 : 1 });
}

/** update button resource */
export function updateButton(data: ButtonResourceModel & Pick<Api.SystemManage.ButtonResource, 'id'>) {
  return alova.Put<null>(`/v1/iam/buttonResource/update/${data.id}`, { ...data, status: data.status === '2' ? 0 : 1 });
}

/** delete button resource */
export function deleteButton(id: string) {
  return alova.Delete<null>('/v1/iam/buttonResource/delete', { ids: [id] });
}

/** batch delete button resource */
export function batchDeleteButton(ids: string[]) {
  return alova.Delete<null>('/v1/iam/buttonResource/delete', { ids });
}

// ---------------- login log ----------------

/** get login log list */
export function fetchGetLoginLogList(params?: Api.SystemManage.LoginLogSearchParams) {
  return alova
    .Post<{ records: BackendLoginLogItem[]; current: number; size: number; total: number }>(
      '/v1/monitor/loginLog/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        userName: params?.userName ?? '',
        ipaddr: params?.ipaddr ?? '',
        status: params?.status ? Number(params.status) : undefined
      }
    )
    .then(res => ({
      ...res,
      records: res.records.map(item => ({ ...item, status: item.status === '1' ? '1' : '2' }))
    })) as Promise<Api.SystemManage.LoginLogList>;
}

interface BackendLoginLogItem {
  id: string;
  userName: string;
  ipaddr: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  status: string;
  msg: string;
  loginTime: string;
}

/** delete login log */
export function deleteLoginLog(id: string) {
  return alova.Delete<null>('/v1/monitor/loginLog/delete', { ids: [id] });
}

/** batch delete login log */
export function batchDeleteLoginLog(ids: string[]) {
  return alova.Delete<null>('/v1/monitor/loginLog/delete', { ids });
}

/** clear all login logs */
export function clearLoginLog() {
  return alova.Delete<null>('/v1/monitor/loginLog/clear');
}

// ---------------- operate log ----------------

/** get operate log list */
export function fetchGetOperateLogList(params?: Api.SystemManage.OperateLogSearchParams) {
  return alova
    .Post<{ records: BackendOperateLogItem[]; current: number; size: number; total: number }>(
      '/v1/monitor/operateLog/page',
      {
        current: params?.current ?? 1,
        size: params?.size ?? 10,
        userName: params?.userName ?? '',
        title: params?.title ?? '',
        businessType: params?.businessType ? Number(params.businessType) : undefined
      }
    )
    .then(res => ({
      ...res,
      records: res.records.map(item => ({ ...item, businessType: adaptOperateType(item.businessType, item.method) }))
    })) as Promise<Api.SystemManage.OperateLogList>;
}

/** 归一化操作类型：老数据 businessType=0 无业务语义，按请求方法近似归类，未知回落"其他"。 */
function adaptOperateType(raw: string, method: string): Api.SystemManage.OperateType {
  const type = String(raw);
  if (['1', '2', '3', '4', '5', '6'].includes(type)) return type as Api.SystemManage.OperateType;
  switch (String(method).toUpperCase()) {
    case 'POST':
      return '1';
    case 'PUT':
    case 'PATCH':
      return '2';
    case 'DELETE':
      return '3';
    default:
      return '6';
  }
}

interface BackendOperateLogItem {
  id: string;
  title: string;
  businessType: string;
  userName: string;
  method: string;
  url: string;
  params?: string;
  code: string;
  costTime: number;
  ipaddr: string;
  operateTime: string;
}

/** delete operate log */
export function deleteOperateLog(id: string) {
  return alova.Delete<null>('/v1/monitor/operateLog/delete', { ids: [id] });
}

/** batch delete operate log */
export function batchDeleteOperateLog(ids: string[]) {
  return alova.Delete<null>('/v1/monitor/operateLog/delete', { ids });
}

/** clear all operate logs */
export function clearOperateLog() {
  return alova.Delete<null>('/v1/monitor/operateLog/clear');
}

// ---------------- online user ----------------

/** get online user list */
export function fetchGetOnlineUserList(params?: Api.SystemManage.OnlineUserSearchParams) {
  return alova.Post<Api.SystemManage.OnlineUserList>('/v1/iam/session/page', {
    current: params?.current ?? 1,
    size: params?.size ?? 10,
    userName: params?.userName ?? '',
    ipaddr: params?.ipaddr ?? ''
  });
}

/** force logout online users */
export function forceLogout(ids: string[]) {
  return Promise.all(ids.map(id => alova.Delete<null>(`/v1/iam/session/${id}`))).then(() => null);
}
