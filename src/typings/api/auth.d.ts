declare namespace Api {
  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      accessToken: string;
      /** legacy/custom Mock compatibility; new services should use accessToken */
      token?: string;
      refreshToken: string;
      accessExpiresAt?: number;
      refreshExpiresAt?: number;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }
}
