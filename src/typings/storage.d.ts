/** The storage namespace */
declare namespace StorageType {
  interface Session {
    /** The theme color */
    themeColor: string;
    // /**
    //  * the theme settings
    //  */
    // themeSettings: App.Theme.ThemeSetting;
  }

  interface Local {
    /** The i18n language */
    lang: App.I18n.LangType;
    /** The access token */
    token: string;
    /** The access token expiry as Unix seconds */
    accessExpiresAt: number;
    /** The refresh token */
    refreshToken: string;
    /** The refresh token expiry as Unix seconds */
    refreshExpiresAt: number;
    /** Whether the mixed layout sider stays fixed */
    mixSiderFixed: CommonType.YesOrNo;
    /** The theme color */
    themeColor: string;
    /** The dark mode */
    darkMode: boolean;
    /** The theme settings */
    themeSettings: App.Theme.ThemeSetting;
    /**
     * The override theme flags
     *
     * The value is the build time of the project
     */
    overrideThemeFlag: string;
    /** The global tabs */
    globalTabs: App.Global.Tab[];
    /** The backup theme setting before is mobile */
    backupThemeSettingBeforeIsMobile: {
      layout: UnionKey.ThemeLayoutMode;
      siderCollapse: boolean;
    };
    /** The last login user id */
    lastLoginUserId: string;
    /** The remembered login credentials (only stored when the user checks "remember me") */
    rememberedLogin: {
      userName: string;
      password: string;
    };
  }
}
