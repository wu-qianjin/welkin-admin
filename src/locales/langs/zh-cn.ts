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
          desc: 'Soybean 默认主题预设'
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
    document_project: '项目文档',
    'document_project-link': '项目文档(外链)',
    document_video: '视频教程',
    document_vue: 'Vue文档',
    document_vite: 'Vite文档',
    document_unocss: 'UnoCSS文档',
    document_naive: 'Naive UI文档',
    'document_pro-naive': 'Pro Naive UI文档',
    document_antd: 'Ant Design Vue文档',
    document_alova: 'Alova文档',
    'user-center': '个人中心',
    about: '关于',
    function: '系统功能',
    alova: 'alova示例',
    alova_request: 'alova请求',
    alova_scenes: '场景化请求',
    'pro-naive': 'Pro Naive UI 示例',
    'pro-naive_form': '表单',
    'pro-naive_form_basic': '基础表单',
    'pro-naive_form_query': '查询表单',
    'pro-naive_form_step': '分步表单',
    'pro-naive_table': '表格',
    'pro-naive_table_remote': '远程加载',
    'pro-naive_table_row-edit': '行编辑',
    function_tab: '标签页',
    'function_multi-tab': '多标签页',
    'function_hide-child': '隐藏子菜单',
    'function_hide-child_one': '隐藏子菜单',
    'function_hide-child_two': '菜单二',
    'function_hide-child_three': '菜单三',
    function_request: '请求',
    'function_toggle-auth': '切换权限',
    'function_super-page': '超级管理员可见',
    auth: '认证授权',
    auth_user: '用户管理',
    'auth_user-detail': '用户详情',
    auth_dept: '部门管理',
    auth_role: '角色管理',
    auth_menu: '菜单管理',
    auth_resource: '资源管理',
    message: '消息中心',
    monitor: '运维监控',
    monitor_overview: '监控总览',
    monitor_server: '实例监控',
    monitor_gateway: '网关监控',
    monitor_alert: '告警中心',
    monitor_log: '日志管理',
    monitor_online: '在线用户',
    system: '系统管理',
    system_config: '参数配置',
    system_dict: '字典管理',
    system_notice: '通知公告',
    system_file: '文件管理',
    'multi-menu': '多级菜单',
    'multi-menu_first': '菜单一',
    'multi-menu_first_child': '菜单一子菜单',
    'multi-menu_second': '菜单二',
    'multi-menu_second_child': '菜单二子菜单',
    'multi-menu_second_child_home': '菜单二子菜单首页',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    plugin: '插件示例',
    plugin_copy: '剪贴板',
    plugin_charts: '图表',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: '编辑器',
    plugin_editor_quill: '富文本编辑器',
    plugin_editor_markdown: 'MD 编辑器',
    plugin_icon: '图标',
    plugin_map: '地图',
    plugin_print: '打印',
    plugin_swiper: 'Swiper',
    plugin_video: '视频',
    plugin_barcode: '条形码',
    plugin_pinyin: '拼音',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF 预览',
    plugin_gantt: '甘特图',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: '打字机',
    plugin_tables: '表格',
    plugin_tables_vtable: 'VTable'
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
      introduction: `SoybeanAdmin 是一个优雅且功能强大的后台管理模板，基于最新的前端技术栈，包括 Vue3, Vite7, TypeScript, Pinia 和 UnoCSS。它内置了丰富的主题配置和组件，代码规范严谨，实现了自动化的文件路由系统。此外，它还采用了基于 ApiFox 的在线Mock数据方案。SoybeanAdmin 为您提供了一站式的后台管理解决方案，无需额外配置，开箱即用。同样是一个快速学习前沿技术的最佳实践。`,
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
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '早安，{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      projectCount: '项目数',
      todo: '待办',
      message: '消息',
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      visitCount: '访问量',
      turnover: '成交额',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: 'Soybean 在2021年5月28日创建了开源项目 soybean-admin!',
        desc2: 'Yanbowe 向 soybean-admin 提交了一个bug，多标签栏不会自适应。',
        desc3: 'Soybean 准备为 soybean-admin 的发布做充分的准备工作!',
        desc4: 'Soybean 正在忙于为soybean-admin写项目说明文档！',
        desc5: 'Soybean 刚才把工作台页面随便写了一些，凑合能看了！'
      },
      creativity: '创意'
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
    alova: {
      scenes: {
        captchaSend: '发送验证码',
        autoRequest: '自动请求',
        visibilityRequestTips: '浏览器窗口切换自动请求数据',
        pollingRequestTips: '每3秒自动请求一次',
        networkRequestTips: '网络重连后自动请求',
        refreshTime: '更新时间',
        startRequest: '开始请求',
        stopRequest: '停止请求',
        requestCrossComponent: '跨组件触发请求',
        triggerAllRequest: '手动触发所有自动请求'
      }
    },
    proNaive: {
      form: {
        basic: {
          title: '基础示例',
          appName: '应用名称',
          appStatus: '应用状态',
          createTime: '创建时间',
          responseDate: '响应日期',
          specificationInfo: '规格信息',
          specificate: '规格',
          specificationName: '规格名',
          specificationValue: '规格值',
          specificationColorRed: '红',
          specificationColorOrange: '橙',
          addSpecificateItem: '添加规格项',
          fillValue: '填充值',
          reset: '重置',
          submit: '提交',
          add: '新建',
          delete: '删除',
          color: '颜色',
          normal: '正常',
          anomaly: '异常'
        },
        query: {
          title1: '查询表单，默认展开',
          title2: '查询表单，默认折叠，折叠时保留2行',
          appName: '应用名称',
          appStatus: '应用状态',
          createTime: '创建时间',
          responseDate: '响应日期',
          endDate: '结束日期',
          field: '字段'
        },
        step: {
          title: '分步表单',
          step1: {
            title: '表单1',
            field: '表单1字段',
            nextStep: '下一步'
          },
          step2: {
            title: '表单2',
            field: '表单2字段',
            prevStep: '上一步',
            submit: '提交'
          }
        }
      },
      table: {
        remote: {
          filterCondition: '筛选条件',
          name: '名称',
          createTime: '创建时间',
          responseTime: '响应时间',
          title: '远程加载',
          replicableText: '可复制文本',
          tags: 'tags',
          dateFormatting: '日期格式化',
          image: '图片'
        },
        rowEdit: {
          title: '编辑表格',
          reset: '重置',
          submit: '提交',
          edit: '编辑',
          delete: '删除',
          save: '保存',
          task: '任务',
          score: '评分',
          time: '时间',
          name: '名称',
          action: '操作'
        }
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
        form: {
          userName: '请输入用户名',
          userGender: '请选择性别',
          nickName: '请输入昵称',
          userPhone: '请输入手机号',
          userEmail: '请输入邮箱',
          userStatus: '请选择用户状态',
          userRole: '请选择用户角色'
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
        id: 'ID',
        parentId: '父级菜单ID',
        menuType: '菜单类型',
        menuName: '菜单名称',
        routeName: '路由名称',
        routePath: '路由路径',
        pathParam: '路径参数',
        layout: '布局',
        page: '页面组件',
        i18nKey: '国际化key',
        icon: '图标',
        localIcon: '本地图标',
        iconTypeTitle: '图标类型',
        order: '排序',
        constant: '常量路由',
        keepAlive: '缓存路由',
        href: '外链',
        hideInMenu: '隐藏菜单',
        activeMenu: '高亮的菜单',
        multiTab: '支持多页签',
        fixedIndexInTab: '固定在页签中的序号',
        query: '路由参数',
        button: '按钮',
        buttonCode: '按钮编码',
        buttonDesc: '按钮描述',
        menuStatus: '菜单状态',
        form: {
          home: '请选择首页',
          menuType: '请选择菜单类型',
          menuName: '请输入菜单名称',
          routeName: '请输入路由名称',
          routePath: '请输入路由路径',
          pathParam: '请输入路径参数',
          page: '请选择页面组件',
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
          fixedInTab: '请选择是否固定在页签中',
          fixedIndexInTab: '请输入固定在页签中的序号',
          queryKey: '请输入路由参数Key',
          queryValue: '请输入路由参数Value',
          button: '请选择是否按钮',
          buttonCode: '请输入按钮编码',
          buttonDesc: '请输入按钮描述',
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
        dictType: '字典类型',
        status: '状态',
        remark: '备注',
        updateTime: '更新时间',
        dictOptions: '字典选项',
        addDictType: '新增字典类型',
        editDictType: '编辑字典类型',
        form: {
          dictName: '请输入字典名称',
          dictType: '请输入字典类型',
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
          code: '结果码',
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
      qps: '网关 QPS',
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
      qpsAxis: 'QPS',
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
      qpsCol: 'QPS',
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
