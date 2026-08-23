const local: App.I18n.Schema = {
  system: {
    title: 'Welkin 管理系统',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    selectAll: '全选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    sessionExpired: '登录已过期，请重新登录',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeDrawerTitle: '主题配置',
    tabs: {
      appearance: '外观',
      layout: '布局',
      general: '通用',
      preset: '预设'
    },
    appearance: {
      themeSchema: {
        title: '主题模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟随系统'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主题颜色',
        primary: '主色',
        info: '信息色',
        success: '成功色',
        warning: '警告色',
        error: '错误色',
        followPrimary: '跟随主色'
      },
      themeRadius: {
        title: '主题圆角'
      },
      recommendColor: '应用推荐算法的颜色',
      recommendColorDesc: '推荐颜色的算法参照',
      preset: {
        title: '主题预设',
        apply: '应用',
        applySuccess: '预设应用成功',
        default: {
          name: '默认预设',
          desc: 'Welkin 默认主题预设'
        },
        dark: {
          name: '暗色预设',
          desc: '适用于夜间使用的暗色主题预设'
        },
        compact: {
          name: '紧凑型',
          desc: '适用于小屏幕的紧凑布局预设'
        },
        azir: {
          name: 'Azir的预设',
          desc: '是 Azir 比较喜欢的莫兰迪色系冷淡风'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '布局模式',
        vertical: '左侧菜单模式',
        'vertical-mix': '左侧菜单混合模式',
        'vertical-hybrid-header-first': '左侧混合-顶部优先',
        horizontal: '顶部菜单模式',
        'top-hybrid-sidebar-first': '顶部混合-侧边优先',
        'top-hybrid-header-first': '顶部混合-顶部优先',
        vertical_detail: '左侧菜单布局，菜单在左，内容在右。',
        'vertical-mix_detail': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
        'vertical-hybrid-header-first_detail':
          '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
        horizontal_detail: '顶部菜单布局，菜单在顶部，内容在下方。',
        'top-hybrid-sidebar-first_detail': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
        'top-hybrid-header-first_detail': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。'
      },
      tab: {
        title: '标签栏设置',
        visible: '显示标签栏',
        cache: '标签栏信息缓存',
        cacheTip: '离开页面后仍然保留标签栏信息',
        height: '标签栏高度',
        mode: {
          title: '标签栏风格',
          slider: '滑块风格',
          chrome: '谷歌风格',
          button: '按钮风格'
        },
        closeByMiddleClick: '鼠标中键关闭标签页',
        closeByMiddleClickTip: '启用后可以使用鼠标中键点击标签页进行关闭'
      },
      header: {
        title: '头部设置',
        height: '头部高度',
        breadcrumb: {
          visible: '显示面包屑',
          showIcon: '显示面包屑图标'
        }
      },
      sider: {
        title: '侧边栏设置',
        inverted: '深色侧边栏',
        width: '侧边栏宽度',
        collapsedWidth: '侧边栏折叠宽度',
        mixWidth: '混合布局侧边栏宽度',
        mixCollapsedWidth: '混合布局侧边栏折叠宽度',
        mixChildMenuWidth: '混合布局子菜单宽度',
        autoSelectFirstMenu: '自动选择第一个子菜单',
        autoSelectFirstMenuTip: '点击一级菜单时，自动选择并导航到第一个子菜单的最深层级'
      },
      footer: {
        title: '底部设置',
        visible: '显示底部',
        fixed: '固定底部',
        height: '底部高度',
        right: '底部居右'
      },
      content: {
        title: '内容区域设置',
        scrollMode: {
          title: '滚动模式',
          tip: '主题滚动仅 main 部分滚动，外层滚动可携带头部底部一起滚动',
          wrapper: '外层滚动',
          content: '主体滚动'
        },
        page: {
          animate: '页面切换动画',
          mode: {
            title: '页面切换动画类型',
            'fade-slide': '滑动',
            fade: '淡入淡出',
            'fade-bottom': '底部消退',
            'fade-scale': '缩放消退',
            'zoom-fade': '渐变',
            'zoom-out': '闪现',
            none: '无'
          }
        },
        fixedHeaderAndTab: '固定头部和标签栏'
      }
    },
    general: {
      title: '通用设置',
      watermark: {
        title: '水印设置',
        visible: '显示全屏水印',
        text: '自定义水印文本',
        enableUserName: '启用用户名水印',
        enableTime: '显示当前时间',
        timeFormat: '时间格式'
      },
      multilingual: {
        title: '多语言设置',
        visible: '显示多语言按钮'
      },
      globalSearch: {
        title: '全局搜索设置',
        visible: '显示全局搜索按钮'
      }
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  route: {
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    home: '首页',
    document: '文档',
    document_vue: 'Vue文档',
    document_vite: 'Vite文档',
    document_unocss: 'UnoCSS文档',
    document_naive: 'Naive UI文档',
    'document_pro-naive': 'Pro Naive UI文档',
    document_antd: 'Ant Design Vue文档',
    document_alova: 'Alova文档',
    'user-center': '个人中心',
    about: '关于',
    auth: '认证授权',
    auth_user: '用户管理',
    auth_dept: '部门管理',
    auth_role: '角色管理',
    auth_menu: '菜单管理',
    auth_resource: '资源管理',
    message: '消息中心',
    monitor: '运维监控',
    monitor_overview: '监控总览',
    monitor_gateway: '网关监控',
    monitor_alert: '告警中心',
    monitor_log: '日志管理',
    monitor_online: '在线用户',
    system: '系统管理',
    system_config: '参数配置',
    system_dict: '字典管理',
    system_notice: '通知公告',
    system_file: '文件管理'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！',
        welcome: '欢迎回来 👋',
        welcomeDesc: '请输入您的账户信息以开始管理您的项目',
        copyright: 'Copyright © 2026 WelkinAdmin · 基于 soybean-admin (MIT)'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住账号',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户',
        phoneLogin: '手机号登录',
        scanLogin: '扫码登录',
        noAccount: '还没有账号？',
        createAccount: '创建账号',
        wechat: '微信',
        qq: 'QQ',
        github: 'GitHub',
        google: 'Google',
        sliderHint: '请按住滑块拖动',
        sliderSuccess: '验证通过',
        sliderRequired: '请拖动滑块完成验证',
        accountQuickFill: '演示账号快填（仅开发环境）'
      },
      banner: {
        title: '开箱即用的大型中后台管理系统',
        subtitle: '工程化、高性能、易维护的前端模板'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        demoCode: '演示验证码：123456',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        success: '注册成功，请返回登录',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》'
      },
      resetPwd: {
        title: '重置密码',
        success: '密码重置成功，请使用新密码登录'
      },
      bindWeChat: {
        title: '绑定微信'
      },
      scanLogin: {
        title: '扫码登录',
        hint: '打开微信扫一扫',
        scanned: '扫描成功，请在手机上确认',
        success: '确认成功，正在登录...',
        expired: '二维码已失效',
        refresh: '刷新二维码'
      }
    },
    about: {
      title: '关于',
      introduction: `WelkinAdmin 是一个优雅且功能强大的中后台管理平台，基于最新的前端技术栈，包括 Vue3、Vite、TypeScript、Pinia 和 UnoCSS。它内置了丰富的主题配置和组件，代码规范严谨，实现了自动化的文件路由系统。WelkinAdmin 基于 soybean-admin (MIT) 二次开发，为您提供一站式后台管理解决方案，无需额外配置，开箱即用。`,
      projectInfo: {
        title: '项目信息',
        version: '版本',
        latestBuildTime: '最新构建时间',
        githubLink: 'Github 地址',
        previewLink: '预览地址'
      },
      prdDep: '生产依赖',
      devDep: '开发依赖'
    },
    home: {
      greetingMorning: '早上好，{userName}，新的一天从 Welkin 开始',
      greetingNoon: '中午好，{userName}，记得休息一下',
      greetingAfternoon: '下午好，{userName}，继续加油',
      greetingEvening: '晚上好，{userName}，辛苦了',
      roleLabel: '角色',
      lastUpdated: '更新于 {time}',
      refresh: '刷新',
      refreshSuccess: '工作台数据已刷新',
      quickEntry: '快捷入口',
      entryMessage: '消息中心',
      entryNotice: '通知公告',
      entryProfile: '个人中心',
      entryUser: '用户管理',
      heroTodo: '待办',
      heroUnread: '未读消息',
      heroNotice: '公告',
      todoPanel: '待办事项',
      todoAllDone: '不错，全部处理完毕',
      goHandle: '去处理',
      todoReadMessages: '阅读 {count} 条未读消息',
      todoBindPhone: '绑定手机号，提升账号安全',
      todoBindEmail: '绑定邮箱，方便找回账号',
      todoUploadAvatar: '设置个人头像',
      todoCheckDevices: '{count} 台设备在线，确认是否本人',
      noticeBoard: '通知公告',
      noticeAll: '全部公告',
      noNotices: '暂无公告',
      pinned: '置顶',
      messagePanel: '最新消息',
      messageAll: '查看全部',
      noMessages: '暂无消息',
      markAllRead: '全部已读',
      alertPanel: '告警中心',
      alertAll: '全部告警',
      noAlerts: '暂无待处理告警',
      alertLevel1: '提示',
      alertLevel2: '警告',
      alertLevel3: '严重',
      alertPending: '待处理',
      alertAcknowledged: '已确认',
      todoHandleAlerts: '处理 {count} 条待处理告警',
      lastLogin: '最近登录',
      platformUsers: '平台用户',
      onlineUsers: '在线用户',
      roleCount: '角色',
      deptCount: '部门',
      noticeTotalLabel: '累计公告',
      unitPeople: '{count} 人',
      unitRoles: '{count} 个',
      unitDepts: '{count} 个',
      unitNotices: '{count} 条',
      logAll: '查看全部',
      noLogs: '暂无记录',
      loadFailed: '部分数据加载失败'
    },
    function: {
      tab: {
        tabOperate: {
          title: '标签页操作',
          addTab: '添加标签页',
          addTabDesc: '跳转到关于页面',
          closeTab: '关闭标签页',
          closeCurrentTab: '关闭当前标签页',
          closeAboutTab: '关闭"关于"标签页',
          addMultiTab: '添加多标签页',
          addMultiTabDesc1: '跳转到多标签页页面',
          addMultiTabDesc2: '跳转到多标签页页面(带有查询参数)'
        },
        tabTitle: {
          title: '标签页标题',
          changeTitle: '修改标题',
          change: '修改',
          resetTitle: '重置标题',
          reset: '重置'
        }
      },
      multiTab: {
        routeParam: '路由参数',
        backTab: '返回 function_tab'
      },
      toggleAuth: {
        toggleAccount: '切换账号',
        authHook: '权限钩子函数 `hasAuth`',
        superAdminVisible: '超级管理员可见',
        adminVisible: '管理员可见',
        adminOrUserVisible: '管理员和用户可见'
      },
      request: {
        repeatedErrorOccurOnce: '重复请求错误只出现一次',
        repeatedError: '重复请求错误',
        repeatedErrorMsg1: '自定义请求错误 1',
        repeatedErrorMsg2: '自定义请求错误 2'
      }
    },
    manage: {
      common: {
        status: {
          enable: '启用',
          disable: '禁用'
        }
      },
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleCode: '角色编码',
        roleStatus: '角色状态',
        roleDesc: '角色描述',
        menuAuth: '菜单权限',
        buttonAuth: '按钮权限',
        form: {
          roleName: '请输入角色名称',
          roleCode: '请输入角色编码',
          roleStatus: '请选择角色状态',
          roleDesc: '请输入角色描述'
        },
        addRole: '新增角色',
        editRole: '编辑角色'
      },
      user: {
        title: '用户列表',
        userName: '用户名',
        userGender: '性别',
        nickName: '昵称',
        userPhone: '手机号',
        userEmail: '邮箱',
        userStatus: '用户状态',
        userRole: '用户角色',
        userDept: '所属部门',
        noDept: '不分配部门',
        form: {
          userName: '请输入用户名',
          userGender: '请选择性别',
          nickName: '请输入昵称',
          userPhone: '请输入手机号',
          userEmail: '请输入邮箱',
          userStatus: '请选择用户状态',
          userRole: '请选择用户角色',
          userDept: '请选择所属部门'
        },
        addUser: '新增用户',
        editUser: '编辑用户',
        gender: {
          male: '男',
          female: '女'
        }
      },
      menu: {
        home: '首页',
        title: '菜单列表',
        parentId: '父级菜单ID',
        menuType: '菜单类型',
        menuName: '菜单名称',
        routeName: '路由名称',
        routePath: '路由路径',
        layout: '布局',
        page: '页面组件',
        i18nKey: '国际化key',
        icon: '图标',
        localIcon: '本地图标',
        iconTypeTitle: '图标类型',
        order: '排序',
        keepAlive: '缓存路由',
        href: '外链',
        hideInMenu: '隐藏菜单',
        activeMenu: '高亮的菜单',
        multiTab: '支持多页签',
        query: '默认查询参数',
        menuStatus: '菜单状态',
        section: {
          basic: '基本信息',
          page: '页面与布局',
          display: '显示与图标',
          advanced: '高级路由设置'
        },
        form: {
          home: '请选择首页',
          menuType: '请选择菜单类型',
          menuName: '请输入菜单名称',
          routeName: '请输入路由名称',
          routePath: '请输入路由路径，如 /system/dict 或 /auth/user',
          page: '请选择或输入完整路径，如 /src/views/system/dict/index.vue',
          legacyPage: '历史组件',
          layout: '请选择布局组件',
          i18nKey: '请输入国际化key',
          icon: '请输入图标',
          localIcon: '请选择本地图标',
          order: '请输入排序',
          keepAlive: '请选择是否缓存路由',
          href: '请输入外链',
          hideInMenu: '请选择是否隐藏菜单',
          activeMenu: '请选择高亮的菜单的路由名称',
          multiTab: '请选择是否支持多标签',
          queryKey: '例：tab',
          queryValue: '例：security',
          queryHint: '从菜单进入时附加到 URL，例如 /system/config?tab=security。',
          advancedHint: '缓存、菜单可见性和多页签等低频配置。',
          menuStatus: '请选择菜单状态'
        },
        addMenu: '新增菜单',
        editMenu: '编辑菜单',
        addChildMenu: '新增子菜单',
        type: {
          directory: '目录',
          menu: '菜单'
        },
        iconType: {
          iconify: 'iconify图标',
          local: '本地图标'
        }
      },
      config: {
        title: '参数列表',
        paramName: '参数名称',
        paramKey: '参数键',
        paramValue: '参数值',
        paramStatus: '状态',
        builtIn: '内置',
        remark: '备注',
        updateTime: '更新时间',
        addConfig: '新增参数',
        editConfig: '编辑参数',
        form: {
          paramName: '请输入参数名称',
          paramKey: '请输入参数键',
          paramValue: '请输入参数值',
          paramStatus: '请选择状态',
          remark: '请输入备注'
        }
      },
      file: {
        title: '文件列表',
        fileName: '文件名称',
        fileType: '文件类型',
        fileSize: '文件大小',
        bizType: '所属业务',
        createBy: '上传人',
        createTime: '上传时间',
        upload: '上传文件',
        uploadSource: '文件管理',
        uploadSuccess: '上传成功',
        preview: '预览',
        previewPlaceholder: '演示环境展示占位图，接入真实存储服务后显示原文件',
        download: '下载',
        type: {
          image: '图片',
          document: '文档',
          archive: '压缩包',
          other: '其他'
        },
        form: {
          fileName: '请输入文件名称',
          fileType: '请选择文件类型'
        }
      },
      notice: {
        title: '公告列表',
        noticeTitle: '公告标题',
        noticeType: '公告类型',
        noticeStatus: '公告状态',
        top: '置顶',
        content: '公告内容',
        createBy: '创建人',
        createTime: '创建时间',
        updateTime: '更新时间',
        view: '查看',
        publish: '发布',
        withdraw: '撤回',
        confirmPublish: '确认发布该公告？',
        confirmWithdraw: '确认撤回该公告？',
        publishSuccess: '发布成功',
        withdrawSuccess: '撤回成功',
        addNotice: '新增公告',
        editNotice: '编辑公告',
        type: {
          notice: '通知',
          announcement: '公告'
        },
        status: {
          draft: '草稿',
          published: '已发布',
          withdrawn: '已撤回'
        },
        form: {
          noticeTitle: '请输入公告标题',
          noticeType: '请选择公告类型',
          noticeStatus: '请选择公告状态'
        }
      },
      dept: {
        title: '部门列表',
        orgStructure: '组织架构',
        childList: '子部门列表',
        childCountSuffix: '个子部门',
        expandAll: '展开全部',
        collapseAll: '收起全部',
        deleteSelectedDept: '删除选中部门',
        noChildDept: '该部门下暂无子部门，可点击右上角「新增子部门」创建',
        noMatchDept: '未找到匹配部门，请调整查询条件',
        deptName: '部门名称',
        parentDept: '上级部门',
        rootDept: '顶级部门',
        leader: '负责人',
        phone: '联系电话',
        email: '邮箱',
        order: '排序',
        status: '状态',
        createTime: '创建时间',
        addDept: '新增部门',
        editDept: '编辑部门',
        addRootDept: '新增根部门',
        addChildDept: '新增子部门',
        confirmDelete: '若该部门存在子部门将无法删除，确认删除？',
        form: {
          deptName: '请输入部门名称',
          parentDept: '请选择上级部门',
          leader: '请输入负责人',
          phone: '请输入联系电话',
          email: '请输入邮箱',
          status: '请选择状态'
        }
      },
      dict: {
        title: '字典列表',
        dictName: '字典名称',
        dictType: '字典编码',
        module: '所属模块',
        status: '状态',
        remark: '备注',
        updateTime: '更新时间',
        dictOptions: '字典选项',
        addDictType: '新增字典编码',
        editDictType: '编辑字典编码',
        form: {
          dictName: '请输入字典名称',
          dictType: '请输入字典编码',
          module: '请选择或输入所属模块',
          status: '请选择状态',
          remark: '请输入备注'
        },
        option: {
          optionLabel: '选项标签',
          optionValue: '选项值',
          sort: '排序',
          colorTag: '标签颜色',
          addOption: '新增选项',
          editOption: '编辑选项',
          form: {
            optionLabel: '请输入选项标签',
            optionValue: '请输入选项值'
          }
        }
      },
      resource: {
        title: '资源管理',
        apiTab: 'API 管理',
        buttonTab: '按钮权限',
        status: '状态',
        remark: '备注',
        form: {
          remark: '请输入备注'
        },
        api: {
          apiName: '接口名称',
          apiPath: '接口路径',
          apiMethod: '请求方式',
          apiModule: '所属模块',
          addApi: '新增接口',
          editApi: '编辑接口',
          form: {
            apiName: '请输入接口名称',
            apiPath: '请输入接口路径，如 /systemManage/getUserList',
            apiMethod: '请选择请求方式',
            apiModule: '请输入所属模块'
          }
        },
        button: {
          buttonCode: '权限编码',
          buttonName: '按钮名称',
          menuName: '所属菜单',
          createTime: '创建时间',
          addButton: '新增按钮',
          editButton: '编辑按钮',
          form: {
            buttonCode: '请输入权限编码，如 B_USER_ADD',
            buttonName: '请输入按钮名称',
            menuName: '请输入所属菜单名称'
          }
        }
      },
      log: {
        title: '日志管理',
        loginTab: '登录日志',
        operateTab: '操作日志',
        detail: '详情',
        clear: '清空',
        confirmClear: '确认清空全部日志？该操作不可恢复',
        clearSuccess: '清空成功',
        login: {
          userName: '登录账号',
          ipaddr: '登录 IP',
          loginLocation: '登录地点',
          browser: '浏览器',
          os: '操作系统',
          loginStatus: '登录状态',
          success: '成功',
          fail: '失败',
          msg: '提示消息',
          loginTime: '登录时间',
          form: {
            userName: '请输入登录账号',
            ipaddr: '请输入登录 IP',
            status: '请选择登录状态'
          }
        },
        operate: {
          title: '操作模块',
          businessType: '操作类型',
          userName: '操作人员',
          method: '请求方式',
          url: '请求地址',
          params: '请求参数',
          code: '状态码',
          costTime: '耗时',
          ipaddr: '操作 IP',
          operateTime: '操作时间',
          type: {
            add: '新增',
            update: '修改',
            delete: '删除',
            export: '导出',
            import: '导入',
            other: '其他'
          },
          form: {
            title: '请输入操作模块',
            userName: '请输入操作人员',
            businessType: '请选择操作类型'
          }
        }
      },
      online: {
        title: '在线用户列表',
        userName: '登录账号',
        tokenId: '会话编号',
        ipaddr: '登录 IP',
        loginLocation: '登录地点',
        browser: '浏览器',
        os: '操作系统',
        loginTime: '登录时间',
        forceLogout: '强制下线',
        batchForceLogout: '批量下线',
        confirmForceLogout: '确认将该用户强制下线？',
        forceLogoutSuccess: '已强制下线',
        form: {
          userName: '请输入登录账号',
          ipaddr: '请输入登录 IP'
        }
      }
    },
    monitor: {
      serverList: '服务实例',
      running: '运行中',
      fault: '异常',
      cpu: 'CPU 利用率',
      memory: '内存利用率',
      disk: '磁盘利用率',
      gaugePanel: '资源仪表盘',
      trend: '实时趋势（近 5 分钟）',
      runtimeInfo: '运行时信息',
      goVersion: 'Go 版本',
      version: '服务版本',
      uptime: '运行时长',
      cpuCores: 'CPU 核数',
      goroutines: 'Goroutines',
      threads: '线程数',
      gcPause: 'GC 平均暂停',
      openFds: '文件句柄数',
      memUsage: '内存用量',
      diskUsage: '磁盘用量',
      netIn: '网络流入',
      netOut: '网络流出',
      updateTime: '更新时间',
      autoRefresh: '自动刷新',
      selectFirst: '请选择服务实例'
    },
    gateway: {
      overview: '网关总览',
      qps: '网关 QPS（近1分钟）',
      todayCalls: '今日调用量',
      requestCount: '区间请求量',
      avgCost: '平均处理时长',
      p95Cost: 'P95 响应时间',
      errorRate: '错误率',
      onlineServices: '在线服务',
      activeRoutes: '活跃路由',
      connections: '活跃连接',
      trend: '流量趋势',
      last15minutes: '近 15 分钟',
      lastHour: '近 1 小时',
      today: '今天',
      last3days: '近 3 天',
      last7days: '近 7 天',
      last30days: '近 30 天',
      trafficMetric: '流量指标',
      errorMetric: '错误指标',
      latencyMetric: '延迟指标',
      qpsAxis: 'QPS（分钟均值）',
      costAxis: '耗时 (ms)',
      topInvoked: '调用量 TOP',
      topSlow: '耗时 TOP',
      topError: '错误率 TOP',
      times: '次',
      routeTable: '路由表',
      serviceRoute: '服务 / 接口',
      method: '请求方式',
      upstream: '上游地址',
      strategy: '负载策略',
      status: '状态',
      enabled: '启用',
      disabled: '停用',
      partialDisabled: '部分停用',
      expandAll: '展开全部',
      collapseAll: '收起全部',
      qpsCol: 'QPS(区间)',
      avgCostCol: '平均耗时',
      p95CostCol: 'P95 耗时',
      errorRateCol: '错误率',
      errorCalls: '错误次数',
      instanceCount: '实例数',
      callsCol: '调用量',
      keyword: '路径 / 名称 / 服务',
      allServices: '全部服务',
      allStatus: '全部状态',
      viewDetail: '查看详情',
      routeDetail: '路由详情',
      routeName: '路由名称',
      source: '来源',
      internalPath: '内部路径',
      mapped: '路径映射',
      statusDistribution: '状态码分布',
      successRate: '成功率',
      lastSeen: '最近请求',
      autoRefresh: '自动刷新',
      lastUpdated: '最后更新',
      readOnlyHint: '只读分析视图，聚焦流量、性能与路由健康',
      loadFailed: '网关数据加载失败，请稍后重试',
      strategyMap: {
        roundRobin: '轮询',
        weighted: '加权轮询',
        random: '随机',
        ipHash: 'IP Hash'
      }
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，可包含字母、数字及常见特殊符号（不含空格）'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有',
    pin: '固定标签',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条',
    fixed: {
      left: '左固定',
      right: '右固定',
      unFixed: '取消固定'
    }
  }
};

export default local;
