const local: App.I18n.Schema = {
  system: {
    title: 'WelkinAdmin',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    batchDelete: 'Batch Delete',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    selectAll: 'Select All',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    sessionExpired: 'Session expired, please log in again',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    updateSuccess: 'Update Success',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    }
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeDrawerTitle: 'Theme Configuration',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Preset'
    },
    appearance: {
      themeSchema: {
        title: 'Theme Schema',
        light: 'Light',
        dark: 'Dark',
        auto: 'Follow System'
      },
      grayscale: 'Grayscale',
      colourWeakness: 'Colour Weakness',
      themeColor: {
        title: 'Theme Color',
        primary: 'Primary',
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        followPrimary: 'Follow Primary'
      },
      themeRadius: {
        title: 'Theme Radius'
      },
      recommendColor: 'Apply Recommended Color Algorithm',
      recommendColorDesc: 'The recommended color algorithm refers to',
      preset: {
        title: 'Theme Presets',
        apply: 'Apply',
        applySuccess: 'Preset applied successfully',
        default: {
          name: 'Default Preset',
          desc: 'Default theme preset with balanced settings'
        },
        dark: {
          name: 'Dark Preset',
          desc: 'Dark theme preset for night time usage'
        },
        compact: {
          name: 'Compact Preset',
          desc: 'Compact layout preset for small screens'
        },
        azir: {
          name: "Azir's Preset",
          desc: 'It is a cold and elegant preset that Azir likes'
        }
      }
    },
    layout: {
      layoutMode: {
        title: 'Layout Mode',
        vertical: 'Vertical Mode',
        horizontal: 'Horizontal Mode',
        'vertical-mix': 'Vertical Mix Mode',
        'vertical-hybrid-header-first': 'Left Hybrid Header-First',
        'top-hybrid-sidebar-first': 'Top-Hybrid Sidebar-First',
        'top-hybrid-header-first': 'Top-Hybrid Header-First',
        vertical_detail: 'Vertical menu layout, with the menu on the left and content on the right.',
        'vertical-mix_detail':
          'Vertical mix-menu layout, with the primary menu on the dark left side and the secondary menu on the lighter left side.',
        'vertical-hybrid-header-first_detail':
          'Left hybrid layout, with the primary menu at the top, the secondary menu on the dark left side, and the tertiary menu on the lighter left side.',
        horizontal_detail: 'Horizontal menu layout, with the menu at the top and content below.',
        'top-hybrid-sidebar-first_detail':
          'Top hybrid layout, with the primary menu on the left and the secondary menu at the top.',
        'top-hybrid-header-first_detail':
          'Top hybrid layout, with the primary menu at the top and the secondary menu on the left.'
      },
      tab: {
        title: 'Tab Settings',
        visible: 'Tab Visible',
        cache: 'Tag Bar Info Cache',
        cacheTip: 'Keep the tab bar information after leaving the page',
        height: 'Tab Height',
        mode: {
          title: 'Tab Mode',
          slider: 'Slider',
          chrome: 'Chrome',
          button: 'Button'
        },
        closeByMiddleClick: 'Close Tab by Middle Click',
        closeByMiddleClickTip: 'Enable closing tabs by clicking with the middle mouse button'
      },
      header: {
        title: 'Header Settings',
        height: 'Header Height',
        breadcrumb: {
          visible: 'Breadcrumb Visible',
          showIcon: 'Breadcrumb Icon Visible'
        }
      },
      sider: {
        title: 'Sider Settings',
        inverted: 'Dark Sider',
        width: 'Sider Width',
        collapsedWidth: 'Sider Collapsed Width',
        mixWidth: 'Mix Sider Width',
        mixCollapsedWidth: 'Mix Sider Collapse Width',
        mixChildMenuWidth: 'Mix Child Menu Width',
        autoSelectFirstMenu: 'Auto Select First Submenu',
        autoSelectFirstMenuTip:
          'When a first-level menu is clicked, the first submenu is automatically selected and navigated to the deepest level'
      },
      footer: {
        title: 'Footer Settings',
        visible: 'Footer Visible',
        fixed: 'Fixed Footer',
        height: 'Footer Height',
        right: 'Right Footer'
      },
      content: {
        title: 'Content Area Settings',
        scrollMode: {
          title: 'Scroll Mode',
          tip: 'The theme scroll only scrolls the main part, the outer scroll can carry the header and footer together',
          wrapper: 'Wrapper',
          content: 'Content'
        },
        page: {
          animate: 'Page Animate',
          mode: {
            title: 'Page Animate Mode',
            fade: 'Fade',
            'fade-slide': 'Slide',
            'fade-bottom': 'Fade Zoom',
            'fade-scale': 'Fade Scale',
            'zoom-fade': 'Zoom Fade',
            'zoom-out': 'Zoom Out',
            none: 'None'
          }
        },
        fixedHeaderAndTab: 'Fixed Header And Tab'
      }
    },
    general: {
      title: 'General Settings',
      watermark: {
        title: 'Watermark Settings',
        visible: 'Watermark Full Screen Visible',
        text: 'Custom Watermark Text',
        enableUserName: 'Enable User Name Watermark',
        enableTime: 'Show Current Time',
        timeFormat: 'Time Format'
      },
      multilingual: {
        title: 'Multilingual Settings',
        visible: 'Display multilingual button'
      },
      globalSearch: {
        title: 'Global Search Settings',
        visible: 'Display GlobalSearch button'
      }
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    }
  },
  route: {
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
    'iframe-page': 'Iframe',
    home: 'Home',
    document: 'Document',
    document_vue: 'Vue Document',
    document_vite: 'Vite Document',
    document_unocss: 'UnoCSS Document',
    document_naive: 'Naive UI Document',
    'document_pro-naive': 'Pro Naive UI Document',
    document_antd: 'Ant Design Vue Document',
    document_alova: 'Alova Document',
    'user-center': 'User Center',
    about: 'About',
    function: 'System Function',
    alova: 'Alova Example',
    alova_request: 'Alova Request',
    alova_scenes: 'Scenario Request',
    'pro-naive': 'Pro Naive Example',
    'pro-naive_form': 'Form',
    'pro-naive_form_basic': 'Basic Form',
    'pro-naive_form_query': 'Query Form',
    'pro-naive_form_step': 'Step Form',
    'pro-naive_table': 'Table',
    'pro-naive_table_remote': 'Remote',
    'pro-naive_table_row-edit': 'Row Edit',
    function_tab: 'Tab',
    'function_multi-tab': 'Multi Tab',
    'function_hide-child': 'Hide Child',
    'function_hide-child_one': 'Hide Child',
    'function_hide-child_two': 'Two',
    'function_hide-child_three': 'Three',
    function_request: 'Request',
    'function_toggle-auth': 'Toggle Auth',
    'function_super-page': 'Super Admin Visible',
    auth: 'Authentication & Authorization',
    auth_user: 'User Management',
    'auth_user-detail': 'User Detail',
    auth_dept: 'Department Management',
    auth_role: 'Role Management',
    auth_menu: 'Menu Management',
    auth_resource: 'Resource Management',
    message: 'Message Center',
    monitor: 'Operations Center',
    monitor_overview: 'Monitor Overview',
    monitor_server: 'Instance Monitor',
    monitor_gateway: 'Gateway Monitor',
    monitor_alert: 'Alert Center',
    monitor_log: 'Audit Logs',
    monitor_online: 'Online Users',
    system: 'System Management',
    system_config: 'Parameter Configuration',
    system_dict: 'Dictionary Management',
    system_notice: 'Announcements',
    system_file: 'File Management',
    'multi-menu': 'Multi Menu',
    'multi-menu_first': 'Menu One',
    'multi-menu_first_child': 'Menu One Child',
    'multi-menu_second': 'Menu Two',
    'multi-menu_second_child': 'Menu Two Child',
    'multi-menu_second_child_home': 'Menu Two Child Home',
    exception: 'Exception',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    plugin: 'Plugin',
    plugin_copy: 'Copy',
    plugin_charts: 'Charts',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: 'Editor',
    plugin_editor_quill: 'Quill',
    plugin_editor_markdown: 'Markdown',
    plugin_icon: 'Icon',
    plugin_map: 'Map',
    plugin_print: 'Print',
    plugin_swiper: 'Swiper',
    plugin_video: 'Video',
    plugin_barcode: 'Barcode',
    plugin_pinyin: 'pinyin',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF preview',
    plugin_gantt: 'Gantt Chart',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: 'Typeit',
    plugin_tables: 'Tables',
    plugin_tables_vtable: 'VTable'
  },
  page: {
    login: {
      common: {
        loginOrRegister: 'Login / Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !',
        welcome: 'Welcome back 👋',
        welcomeDesc: 'Please enter your account information to manage your project',
        copyright: 'Copyright © 2026 WelkinAdmin · Based on soybean-admin (MIT)'
      },
      pwdLogin: {
        title: 'Password Login',
        rememberMe: 'Remember me',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherAccountLogin: 'Other Account Login',
        otherLoginMode: 'Other Login Mode',
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User',
        phoneLogin: 'Phone Login',
        scanLogin: 'Scan Login',
        noAccount: "Don't have an account?",
        createAccount: 'Create Account',
        wechat: 'WeChat',
        qq: 'QQ',
        github: 'GitHub',
        google: 'Google',
        sliderHint: 'Hold the slider and drag',
        sliderSuccess: 'Verified successfully',
        sliderRequired: 'Please complete the slider verification',
        accountQuickFill: 'Demo account (dev only)'
      },
      banner: {
        title: 'Out-of-the-box large admin platform',
        subtitle: 'Engineered, high-performance, easy to maintain'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        demoCode: 'Demo code: 123456',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        success: 'Registered successfully, please sign in',
        agreement: 'I have read and agree to',
        protocol: '《User Agreement》',
        policy: '《Privacy Policy》'
      },
      resetPwd: {
        title: 'Reset Password',
        success: 'Password reset successfully, please sign in with the new one'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      },
      scanLogin: {
        title: 'Scan to Sign In',
        hint: 'Scan with WeChat',
        scanned: 'Scanned, confirm on your phone',
        success: 'Confirmed, signing in...',
        expired: 'QR code expired',
        refresh: 'Refresh'
      }
    },
    about: {
      title: 'About',
      introduction: `WelkinAdmin is an elegant and powerful admin platform, built on the latest front-end technology stack, including Vue3, Vite, TypeScript, Pinia and UnoCSS. It has built-in rich theme configuration and components, strict code specifications, and an automated file routing system. Forked from soybean-admin (MIT), WelkinAdmin provides you with a one-stop admin solution, no additional configuration, and out of the box.`,
      projectInfo: {
        title: 'Project Info',
        version: 'Version',
        latestBuildTime: 'Latest Build Time',
        githubLink: 'Github Link',
        previewLink: 'Preview Link'
      },
      prdDep: 'Production Dependency',
      devDep: 'Development Dependency'
    },
    home: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: 'Good morning, {userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃!',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      visitCount: 'Visit Count',
      turnover: 'Turnover',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'The Welkin team kicked off the welkin-admin platform in 2026, based on soybean-admin (MIT)!',
        desc2: 'Feel free to open issues on GitHub to help welkin-admin keep evolving.',
        desc3: 'The Welkin team is preparing the v1.0 release of welkin-admin!',
        desc4: 'The Welkin team is polishing the welkin-admin documentation!',
        desc5: 'The Welkin team just refreshed the workbench pages — enjoy!'
      },
      creativity: 'Creativity'
    },
    function: {
      tab: {
        tabOperate: {
          title: 'Tab Operation',
          addTab: 'Add Tab',
          addTabDesc: 'To about page',
          closeTab: 'Close Tab',
          closeCurrentTab: 'Close Current Tab',
          closeAboutTab: 'Close "About" Tab',
          addMultiTab: 'Add Multi Tab',
          addMultiTabDesc1: 'To MultiTab page',
          addMultiTabDesc2: 'To MultiTab page(with query params)'
        },
        tabTitle: {
          title: 'Tab Title',
          changeTitle: 'Change Title',
          change: 'Change',
          resetTitle: 'Reset Title',
          reset: 'Reset'
        }
      },
      multiTab: {
        routeParam: 'Route Param',
        backTab: 'Back function_tab'
      },
      toggleAuth: {
        toggleAccount: 'Toggle Account',
        authHook: 'Auth Hook Function `hasAuth`',
        superAdminVisible: 'Super Admin Visible',
        adminVisible: 'Admin Visible',
        adminOrUserVisible: 'Admin and User Visible'
      },
      request: {
        repeatedErrorOccurOnce: 'Repeated Request Error Occurs Once',
        repeatedError: 'Repeated Request Error',
        repeatedErrorMsg1: 'Custom Request Error 1',
        repeatedErrorMsg2: 'Custom Request Error 2'
      }
    },
    alova: {
      scenes: {
        captchaSend: 'Captcha Send',
        autoRequest: 'Auto Request',
        visibilityRequestTips: 'Automatically request when switching browser window',
        pollingRequestTips: 'It will request every 3 seconds',
        networkRequestTips: 'Automatically request after network reconnecting',
        refreshTime: 'Refresh Time',
        startRequest: 'Start Request',
        stopRequest: 'Stop Request',
        requestCrossComponent: 'Request Cross Component',
        triggerAllRequest: 'Manually Trigger All Automated Requests'
      }
    },
    proNaive: {
      form: {
        basic: {
          title: 'Basic Example',
          appName: 'ApplicationName',
          appStatus: 'ApplicationStatus',
          createTime: 'CreateTime',
          responseDate: 'ResponseDate',
          specificationInfo: 'SpecificationInfo',
          specificate: 'Specificate',
          specificationName: 'SpecificationName',
          specificationValue: 'SpecificationValue',
          specificationColorRed: 'Red',
          specificationColorOrange: 'Orange',
          addSpecificateItem: 'Add Specificate Item',
          fillValue: 'FillValue',
          reset: 'Reset',
          submit: 'Submit',
          add: 'Add',
          delete: 'Delete',
          color: 'Color',
          normal: 'Normal',
          anomaly: 'Anomaly'
        },
        query: {
          title1: 'Query Example, which expands by default',
          title2: 'Query Example, which fold by default, and two lines are retained when folding',
          appName: 'ApplicationName',
          appStatus: 'ApplicationStatus',
          createTime: 'CreateTime',
          responseDate: 'ResponseDate',
          endDate: 'EndDate',
          field: 'Field'
        },
        step: {
          title: 'Step Form',
          step1: {
            title: 'Form 1',
            field: 'Form 1 field',
            nextStep: 'Next Step'
          },
          step2: {
            title: 'Form 2',
            field: 'Form 2 field',
            prevStep: 'Prev Step',
            submit: 'Submit'
          }
        }
      },
      table: {
        remote: {
          filterCondition: 'Filter Condition',
          name: 'Name',
          createTime: 'CreateTime',
          responseTime: 'ResponseTime',
          title: 'Remote Loading',
          replicableText: 'Replicable Text',
          tags: 'Tags',
          dateFormatting: 'Date Formatting',
          image: 'Image'
        },
        rowEdit: {
          title: 'Edit Table',
          reset: 'Reset',
          submit: 'Submit',
          edit: 'Edit',
          delete: 'Delete',
          save: 'Save',
          task: 'Task',
          score: 'Score',
          time: 'Time',
          name: 'Name',
          action: 'Action'
        }
      }
    },
    manage: {
      common: {
        status: {
          enable: 'Enable',
          disable: 'Disable'
        }
      },
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleCode: 'Role Code',
        roleStatus: 'Role Status',
        roleDesc: 'Role Description',
        menuAuth: 'Menu Auth',
        buttonAuth: 'Button Auth',
        form: {
          roleName: 'Please enter role name',
          roleCode: 'Please enter role code',
          roleStatus: 'Please select role status',
          roleDesc: 'Please enter role description'
        },
        addRole: 'Add Role',
        editRole: 'Edit Role'
      },
      user: {
        title: 'User List',
        userName: 'User Name',
        userGender: 'Gender',
        nickName: 'Nick Name',
        userPhone: 'Phone Number',
        userEmail: 'Email',
        userStatus: 'User Status',
        userRole: 'User Role',
        form: {
          userName: 'Please enter user name',
          userGender: 'Please select gender',
          nickName: 'Please enter nick name',
          userPhone: 'Please enter phone number',
          userEmail: 'Please enter email',
          userStatus: 'Please select user status',
          userRole: 'Please select user role'
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        gender: {
          male: 'Male',
          female: 'Female'
        }
      },
      menu: {
        home: 'Home',
        title: 'Menu List',
        parentId: 'Parent ID',
        menuType: 'Menu Type',
        menuName: 'Menu Name',
        routeName: 'Route Name',
        routePath: 'Route Path',
        pathParam: 'Path Param',
        layout: 'Layout Component',
        page: 'Page Component',
        i18nKey: 'I18n Key',
        icon: 'Icon',
        localIcon: 'Local Icon',
        iconTypeTitle: 'Icon Type',
        order: 'Order',
        constant: 'Constant',
        keepAlive: 'Keep Alive',
        href: 'Href',
        hideInMenu: 'Hide In Menu',
        activeMenu: 'Active Menu',
        multiTab: 'Multi Tab',
        fixedIndexInTab: 'Fixed Index In Tab',
        query: 'Query Params',
        button: 'Button',
        buttonCode: 'Button Code',
        buttonDesc: 'Button Desc',
        menuStatus: 'Menu Status',
        form: {
          home: 'Please select home',
          menuType: 'Please select menu type',
          menuName: 'Please enter menu name',
          routeName: 'Please enter route name',
          routePath: 'Please enter route path',
          pathParam: 'Please enter path param',
          page: 'Please select page component',
          layout: 'Please select layout component',
          i18nKey: 'Please enter i18n key',
          icon: 'Please enter iconify name',
          localIcon: 'Please enter local icon name',
          order: 'Please enter order',
          keepAlive: 'Please select whether to cache route',
          href: 'Please enter href',
          hideInMenu: 'Please select whether to hide menu',
          activeMenu: 'Please select route name of the highlighted menu',
          multiTab: 'Please select whether to support multiple tabs',
          fixedInTab: 'Please select whether to fix in the tab',
          fixedIndexInTab: 'Please enter the index fixed in the tab',
          queryKey: 'Please enter route parameter Key',
          queryValue: 'Please enter route parameter Value',
          button: 'Please select whether it is a button',
          buttonCode: 'Please enter button code',
          buttonDesc: 'Please enter button description',
          menuStatus: 'Please select menu status'
        },
        addMenu: 'Add Menu',
        editMenu: 'Edit Menu',
        addChildMenu: 'Add Child Menu',
        type: {
          directory: 'Directory',
          menu: 'Menu'
        },
        iconType: {
          iconify: 'Iconify Icon',
          local: 'Local Icon'
        }
      },
      config: {
        title: 'Config List',
        paramName: 'Config Name',
        paramKey: 'Config Key',
        paramValue: 'Config Value',
        paramStatus: 'Status',
        builtIn: 'Built-in',
        remark: 'Remark',
        updateTime: 'Update Time',
        addConfig: 'Add Config',
        editConfig: 'Edit Config',
        form: {
          paramName: 'Please enter config name',
          paramKey: 'Please enter config key',
          paramValue: 'Please enter config value',
          paramStatus: 'Please select status',
          remark: 'Please enter remark'
        }
      },
      file: {
        title: 'File List',
        fileName: 'File Name',
        fileType: 'File Type',
        fileSize: 'File Size',
        bizType: 'Biz Source',
        createBy: 'Uploader',
        createTime: 'Upload Time',
        upload: 'Upload',
        uploadSource: 'File Manage',
        uploadSuccess: 'Uploaded successfully',
        preview: 'Preview',
        previewPlaceholder: 'A placeholder is shown in the demo env; the real file displays once storage is connected',
        download: 'Download',
        type: {
          image: 'Image',
          document: 'Document',
          archive: 'Archive',
          other: 'Other'
        },
        form: {
          fileName: 'Please enter file name',
          fileType: 'Please select file type'
        }
      },
      notice: {
        title: 'Notice List',
        noticeTitle: 'Title',
        noticeType: 'Notice Type',
        noticeStatus: 'Status',
        top: 'Top',
        content: 'Content',
        createBy: 'Creator',
        createTime: 'Create Time',
        updateTime: 'Update Time',
        view: 'View',
        publish: 'Publish',
        withdraw: 'Withdraw',
        confirmPublish: 'Confirm to publish this notice?',
        confirmWithdraw: 'Confirm to withdraw this notice?',
        publishSuccess: 'Published successfully',
        withdrawSuccess: 'Withdrawn successfully',
        addNotice: 'Add Notice',
        editNotice: 'Edit Notice',
        type: {
          notice: 'Notice',
          announcement: 'Announcement'
        },
        status: {
          draft: 'Draft',
          published: 'Published',
          withdrawn: 'Withdrawn'
        },
        form: {
          noticeTitle: 'Please enter notice title',
          noticeType: 'Please select notice type',
          noticeStatus: 'Please select notice status'
        }
      },
      dept: {
        title: 'Department List',
        orgStructure: 'Organization',
        childList: 'Sub Departments',
        childCountSuffix: ' sub depts',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        deleteSelectedDept: 'Delete selected dept',
        noChildDept: 'No sub departments yet, click "Add Child Dept" in the top right to create one',
        noMatchDept: 'No matching departments, please adjust the filters',
        deptName: 'Dept Name',
        parentDept: 'Parent Dept',
        rootDept: 'Root',
        leader: 'Leader',
        phone: 'Phone',
        email: 'Email',
        order: 'Order',
        status: 'Status',
        createTime: 'Create Time',
        addDept: 'Add Department',
        editDept: 'Edit Department',
        addRootDept: 'Add Root Dept',
        addChildDept: 'Add Child Dept',
        confirmDelete: 'Deletion fails if the dept has children, confirm?',
        form: {
          deptName: 'Please enter dept name',
          parentDept: 'Please select parent dept',
          leader: 'Please enter leader',
          phone: 'Please enter phone',
          email: 'Please enter email',
          status: 'Please select status'
        }
      },
      dict: {
        title: 'Dict List',
        dictName: 'Dict Name',
        dictType: 'Dict Type',
        status: 'Status',
        remark: 'Remark',
        updateTime: 'Update Time',
        dictOptions: 'Dict Options',
        addDictType: 'Add Dict Type',
        editDictType: 'Edit Dict Type',
        form: {
          dictName: 'Please enter dict name',
          dictType: 'Please enter dict type',
          status: 'Please select status',
          remark: 'Please enter remark'
        },
        option: {
          optionLabel: 'Option Label',
          optionValue: 'Option Value',
          sort: 'Sort',
          colorTag: 'Tag Color',
          addOption: 'Add Option',
          editOption: 'Edit Option',
          form: {
            optionLabel: 'Please enter option label',
            optionValue: 'Please enter option value'
          }
        }
      },
      resource: {
        title: 'Resource Manage',
        apiTab: 'API Manage',
        buttonTab: 'Button Permission',
        status: 'Status',
        remark: 'Remark',
        form: {
          remark: 'Please enter remark'
        },
        api: {
          apiName: 'API Name',
          apiPath: 'API Path',
          apiMethod: 'Method',
          apiModule: 'Module',
          addApi: 'Add API',
          editApi: 'Edit API',
          form: {
            apiName: 'Please enter api name',
            apiPath: 'Please enter api path, e.g. /systemManage/getUserList',
            apiMethod: 'Please select method',
            apiModule: 'Please enter module'
          }
        },
        button: {
          buttonCode: 'Permission Code',
          buttonName: 'Button Name',
          menuName: 'Menu',
          createTime: 'Create Time',
          addButton: 'Add Button',
          editButton: 'Edit Button',
          form: {
            buttonCode: 'Please enter permission code, e.g. B_USER_ADD',
            buttonName: 'Please enter button name',
            menuName: 'Please enter menu name'
          }
        }
      },
      log: {
        title: 'Log Manage',
        loginTab: 'Login Log',
        operateTab: 'Operate Log',
        detail: 'Detail',
        clear: 'Clear',
        confirmClear: 'Clear all logs? This cannot be undone',
        clearSuccess: 'Cleared successfully',
        login: {
          userName: 'Account',
          ipaddr: 'Login IP',
          loginLocation: 'Location',
          browser: 'Browser',
          os: 'OS',
          loginStatus: 'Status',
          success: 'Success',
          fail: 'Fail',
          msg: 'Message',
          loginTime: 'Login Time',
          form: {
            userName: 'Please enter account',
            ipaddr: 'Please enter login IP',
            status: 'Please select status'
          }
        },
        operate: {
          title: 'Module',
          businessType: 'Operate Type',
          userName: 'Operator',
          method: 'Method',
          url: 'URL',
          params: 'Params',
          code: 'Code',
          costTime: 'Cost Time',
          ipaddr: 'IP',
          operateTime: 'Operate Time',
          type: {
            add: 'Add',
            update: 'Update',
            delete: 'Delete',
            export: 'Export',
            import: 'Import',
            other: 'Other'
          },
          form: {
            title: 'Please enter module',
            userName: 'Please enter operator',
            businessType: 'Please select operate type'
          }
        }
      },
      online: {
        title: 'Online Users',
        userName: 'Account',
        tokenId: 'Session ID',
        ipaddr: 'Login IP',
        loginLocation: 'Location',
        browser: 'Browser',
        os: 'OS',
        loginTime: 'Login Time',
        forceLogout: 'Force Logout',
        batchForceLogout: 'Batch Logout',
        confirmForceLogout: 'Force logout this user?',
        forceLogoutSuccess: 'Forced logout',
        form: {
          userName: 'Please enter account',
          ipaddr: 'Please enter login IP'
        }
      }
    },
    monitor: {
      serverList: 'Service Instances',
      running: 'Running',
      fault: 'Fault',
      cpu: 'CPU Usage',
      memory: 'Memory Usage',
      disk: 'Disk Usage',
      gaugePanel: 'Resource Gauges',
      trend: 'Realtime Trend (last 5 min)',
      runtimeInfo: 'Runtime Info',
      goVersion: 'Go Version',
      version: 'Version',
      uptime: 'Uptime',
      cpuCores: 'CPU Cores',
      goroutines: 'Goroutines',
      threads: 'Threads',
      gcPause: 'Avg GC Pause',
      openFds: 'Open FDs',
      memUsage: 'Memory Usage',
      diskUsage: 'Disk Usage',
      netIn: 'Network In',
      netOut: 'Network Out',
      updateTime: 'Updated At',
      autoRefresh: 'Auto refresh',
      selectFirst: 'Select a service instance'
    },
    gateway: {
      overview: 'Gateway Overview',
      qps: 'Gateway QPS',
      todayCalls: 'Today Calls',
      requestCount: 'Requests in Range',
      avgCost: 'Avg Cost',
      p95Cost: 'P95 Latency',
      errorRate: 'Error Rate',
      onlineServices: 'Online Services',
      activeRoutes: 'Active Routes',
      connections: 'Connections',
      trend: 'Traffic Trend',
      last15minutes: '15 Minutes',
      lastHour: '1 Hour',
      today: 'Today',
      last3days: '3 Days',
      last7days: '7 Days',
      last30days: '30 Days',
      trafficMetric: 'Traffic',
      errorMetric: 'Errors',
      latencyMetric: 'Latency',
      qpsAxis: 'QPS',
      costAxis: 'Cost (ms)',
      topInvoked: 'Top Invoked',
      topSlow: 'Top Slow',
      topError: 'Top Errors',
      times: 'calls',
      routeTable: 'Route Table',
      serviceRoute: 'Service / Route',
      method: 'Method',
      upstream: 'Upstream',
      strategy: 'Strategy',
      status: 'Status',
      enabled: 'Enabled',
      disabled: 'Disabled',
      partialDisabled: 'Partial',
      expandAll: 'Expand All',
      collapseAll: 'Collapse All',
      qpsCol: 'QPS',
      avgCostCol: 'Avg Cost',
      p95CostCol: 'P95 Latency',
      errorRateCol: 'Error Rate',
      errorCalls: 'Error Calls',
      instanceCount: 'Instances',
      callsCol: 'Calls',
      keyword: 'Path / name / service',
      allServices: 'All Services',
      allStatus: 'All Statuses',
      viewDetail: 'View Details',
      routeDetail: 'Route Details',
      routeName: 'Route Name',
      statusDistribution: 'Status Distribution',
      successRate: 'Success Rate',
      lastSeen: 'Last Request',
      autoRefresh: 'Auto refresh',
      lastUpdated: 'Last updated',
      readOnlyHint: 'Read-only analytics for traffic, performance and route health',
      loadFailed: 'Failed to load gateway data. Please try again later.',
      strategyMap: {
        roundRobin: 'Round Robin',
        weighted: 'Weighted',
        random: 'Random',
        ipHash: 'IP Hash'
      }
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, letters, numbers and common special symbols (no spaces)'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
    pin: 'Pin Tab',
    unpin: 'Unpin Tab'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },
  datatable: {
    itemCount: 'Total {total} items',
    fixed: {
      left: 'Left Fixed',
      right: 'Right Fixed',
      unFixed: 'Unfixed'
    }
  }
};

export default local;
