export enum SessionRevokedReason {
    LOGOUT = 'logout',
    LOGOUT_ALL = 'logout_all',
    PASSWORD_CHANGED = 'password_changed',
    PASSWORD_RESET = 'password_reset',
    BLOCKED = 'blocked',
    TOKEN_REUSE = 'token_reuse',
    ADMIN_TERMINATED = 'admin_terminated',
    DELETED = 'deleted',
}