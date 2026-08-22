declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    /** role; id is decimal string (Snowflake, exceeds JS safe integer) */
    type Role = Omit<
      Common.CommonRecord<{
        /** role name */
        roleName: string;
        /** role code */
        roleCode: string;
        /** role description */
        roleDesc: string;
      }>,
      'id'
    > & { id: string; builtIn?: string };

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Omit<
      Common.CommonRecord<{
        /** user name */
        userName: string;
        /** user gender */
        userGender: UserGender | null;
        /** user nick name */
        nickName: string;
        /** user phone */
        userPhone: string;
        /** user email */
        userEmail: string;
        /** user role code collection */
        userRoles: string[];
        deptId?: string;
      }>,
      'id'
    > & { id: string };

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('vue-router').RouteMeta,
      | 'i18nKey'
      | 'keepAlive'
      | 'constant'
      | 'order'
      | 'href'
      | 'hideInMenu'
      | 'activeMenu'
      | 'multiTab'
      | 'fixedIndexInTab'
      | 'query'
    >;

    type Menu = Omit<
      Common.CommonRecord<{
        /** parent menu id */
        parentId: string;
        /** menu type */
        menuType: MenuType;
        /** menu name */
        menuName: string;
        /** route name */
        routeName: string;
        /** route path */
        routePath: string;
        /** component */
        component?: string;
        /** iconify icon name or local icon name */
        icon: string;
        /** icon type */
        iconType: IconType;
        /** buttons */
        buttons?: MenuButton[] | null;
        /** children menu */
        children?: Menu[] | null;
      }>,
      'id'
    > & { id: string } & MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    /** menu search params */
    type MenuSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Menu, 'menuName' | 'menuType' | 'status'> & CommonSearchParams
    >;

    type MenuTree = {
      id: string;
      label: string;
      i18nKey?: string;
      pId: string;
      children?: MenuTree[];
    };

    /** system config */
    type SystemConfig = Omit<
      Common.CommonRecord<{
        /** config name */
        paramName: string;
        /** config key */
        paramKey: string;
        /** config value */
        paramValue: string;
        /** whether it is built-in, built-in config cannot be deleted */
        builtIn: CommonType.YesOrNo;
        /** remark */
        remark?: string;
      }>,
      'id'
    > & { id: string };

    /** system config list */
    type SystemConfigList = Common.PaginatingQueryRecord<SystemConfig>;

    /** system config search params */
    type SystemConfigSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.SystemConfig, 'paramName' | 'paramKey' | 'status'> & CommonSearchParams
    >;

    /**
     * file type
     *
     * - "1": image
     * - "2": document
     * - "3": archive
     * - "4": other
     */
    type FileType = '1' | '2' | '3' | '4';

    /** system file */
    type SystemFile = {
      /** file id */
      id: string;
      /** file name with extension */
      fileName: string;
      /** file type */
      fileType: FileType;
      /** file size in bytes */
      fileSize: number;
      /** biz source of the file */
      bizType?: string | null;
      /** uploader */
      createBy: string;
      /** upload time */
      createTime: string;
    };

    /** system file list */
    type SystemFileList = Common.PaginatingQueryRecord<SystemFile>;

    /** system file search params */
    type SystemFileSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.SystemFile, 'fileName' | 'fileType'> & CommonSearchParams
    >;

    /**
     * notice type
     *
     * - "1": notice
     * - "2": announcement
     */
    type NoticeType = '1' | '2';

    /**
     * notice status
     *
     * - "1": draft
     * - "2": published
     * - "3": withdrawn
     */
    type NoticeStatus = '1' | '2' | '3';

    /** system notice */
    type SystemNotice = Omit<
      Common.CommonRecord<{
        /** notice title */
        title: string;
        /** notice type */
        noticeType: NoticeType;
        /** notice status */
        noticeStatus: NoticeStatus;
        /** whether the notice is pinned to the top */
        isTop: boolean;
        /** rich text content */
        content: string;
      }>,
      'id'
    > & { id: string };

    /** system notice list */
    type SystemNoticeList = Common.PaginatingQueryRecord<SystemNotice>;

    /** system notice search params */
    type SystemNoticeSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.SystemNotice, 'title' | 'noticeType' | 'noticeStatus'> & CommonSearchParams
    >;

    /** dict type */
    type DictType = Omit<
      Common.CommonRecord<{
        /** dict name */
        dictName: string;
        /** dict type key, unique */
        dictType: string;
        /** business module the dict belongs to */
        module: string;
        /** remark */
        remark?: string;
      }>,
      'id'
    > & { id: string };

    /** dict type list */
    type DictTypeList = Common.PaginatingQueryRecord<DictType>;

    /** dict type search params */
    type DictTypeSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.DictType, 'dictName' | 'dictType' | 'module' | 'status'> & CommonSearchParams
    >;

    /** tag color of a dict option, mapped to NTag type */
    type DictColorTag = 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error';

    /** dict option, belongs to a dict type */
    type DictOption = Omit<
      Common.CommonRecord<{
        /** the dict type this option belongs to */
        dictType: string;
        /** option label */
        optionLabel: string;
        /** option value */
        optionValue: string;
        /** sort number, asc */
        sort: number;
        /** tag color */
        colorTag?: DictColorTag | null;
        /** remark */
        remark?: string;
      }>,
      'id'
    > & { id: string };

    /** dict option list */
    type DictOptionList = Common.PaginatingQueryRecord<DictOption>;

    /** dict option search params */
    type DictOptionSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.DictOption, 'dictType' | 'optionLabel' | 'status'> & CommonSearchParams
    >;

    /** department, children are only populated in list responses.
     *  id/parentId are decimal strings (Snowflake IDs exceed JS safe integer). */
    type Dept = Omit<
      Common.CommonRecord<{
        /** dept name */
        deptName: string;
        /** parent dept id, 0 for root */
        parentId: string;
        /** leader name */
        leader?: string | null;
        /** contact phone */
        phone?: string | null;
        /** contact email */
        email?: string | null;
        /** sort number, asc */
        order: number;
        /** children depts */
        children?: Dept[] | null;
      }>,
      'id'
    > & { id: string };

    /** dept list */
    type DeptList = Common.PaginatingQueryRecord<Dept>;

    /** dept search params */
    type DeptSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Dept, 'deptName' | 'status'> & CommonSearchParams
    >;

    /** http method of an api resource */
    type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

    /** api resource */
    type ApiResource = Omit<
      Common.CommonRecord<{
        /** api name */
        apiName: string;
        /** request path */
        apiPath: string;
        /** request method */
        apiMethod: ApiMethod;
        /** the module the api belongs to */
        apiModule: string;
        /** remark */
        remark?: string;
      }>,
      'id'
    > & { id: string };

    /** api resource list */
    type ApiResourceList = Common.PaginatingQueryRecord<ApiResource>;

    /** api resource search params */
    type ApiResourceSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.ApiResource, 'apiName' | 'apiPath' | 'apiMethod' | 'apiModule' | 'status'> &
        CommonSearchParams
    >;

    /** button permission resource */
    type ButtonResource = Omit<
      Common.CommonRecord<{
        /** permission code, e.g. B_USER_ADD */
        buttonCode: string;
        /** button name */
        buttonName: string;
        /** the menu the button belongs to */
        menuName: string;
        /** remark */
        remark?: string;
      }>,
      'id'
    > & { id: string };

    /** button resource list */
    type ButtonResourceList = Common.PaginatingQueryRecord<ButtonResource>;

    /** button resource search params */
    type ButtonResourceSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.ButtonResource, 'buttonCode' | 'buttonName' | 'menuName' | 'status'> & CommonSearchParams
    >;

    /** login log */
    type LoginLog = {
      id: string;
      /** login account */
      userName: string;
      /** login ip */
      ipaddr: string;
      /** login location */
      loginLocation: string;
      /** browser */
      browser: string;
      /** operating system */
      os: string;
      /**
       * login result
       *
       * - "1": success
       * - "2": fail
       */
      status: '1' | '2';
      /** fail message or "登录成功" */
      msg: string;
      /** login time */
      loginTime: string;
    };

    /** login log list */
    type LoginLogList = Common.PaginatingQueryRecord<LoginLog>;

    /** login log search params */
    type LoginLogSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.LoginLog, 'userName' | 'ipaddr' | 'status'> & CommonSearchParams & LogTimeRangeParams
    >;

    /**
     * operation business type
     *
     * - "1": add
     * - "2": update
     * - "3": delete
     * - "4": export
     * - "5": import
     * - "6": other
     */
    type OperateType = '1' | '2' | '3' | '4' | '5' | '6';

    /** operation log */
    type OperateLog = {
      id: string;
      /** operated module, e.g. 用户管理 */
      title: string;
      /** operation type */
      businessType: OperateType;
      /** operator */
      userName: string;
      /** request method */
      method: string;
      /** request url */
      url: string;
      /** request params (json string) */
      params?: string | null;
      /** result code */
      code: string;
      /** cost time in ms */
      costTime: number;
      /** operator ip */
      ipaddr: string;
      /** operate time */
      operateTime: string;
    };

    /** operation log list */
    type OperateLogList = Common.PaginatingQueryRecord<OperateLog>;

    /** operation log search params */
    type OperateLogSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.OperateLog, 'title' | 'userName' | 'businessType'> & CommonSearchParams & LogTimeRangeParams
    >;

    /** 审计日志时间范围（"YYYY-MM-DD HH:mm:ss"，两端均可缺省） */
    type LogTimeRangeParams = {
      beginTime?: string | null;
      endTime?: string | null;
    };

    /** online user session */
    type OnlineUser = {
      id: string;
      /** session token id */
      tokenId: string;
      /** login account */
      userName: string;
      /** client ip */
      ipaddr: string;
      /** login location */
      loginLocation: string;
      /** browser */
      browser: string;
      /** operating system */
      os: string;
      /** login time */
      loginTime: string;
      /** session refresh-token expiry, returned by IAM when available */
      refreshExpiresAt?: string;
      /** session revocation time */
      revokedAt?: string | null;
      /** last activity time, when supplied by the backend */
      lastActiveAt?: string;
    };

    /** online user list */
    type OnlineUserList = Common.PaginatingQueryRecord<OnlineUser>;

    /** online user search params */
    type OnlineUserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.OnlineUser, 'userName' | 'ipaddr'> & CommonSearchParams
    >;
  }
}
