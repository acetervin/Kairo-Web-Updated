export declare enum AuditEventType {
    LOGIN_SUCCESS = "LOGIN_SUCCESS",
    LOGIN_FAILURE = "LOGIN_FAILURE",
    LOGIN_LOCKOUT = "LOGIN_LOCKOUT",
    LOGOUT = "LOGOUT",
    USER_CREATED = "USER_CREATED",
    USER_UPDATED = "USER_UPDATED",
    USER_DELETED = "USER_DELETED",
    PROPERTY_CREATED = "PROPERTY_CREATED",
    PROPERTY_UPDATED = "PROPERTY_UPDATED",
    PROPERTY_DELETED = "PROPERTY_DELETED",
    BOOKING_UPDATED = "BOOKING_UPDATED",
    BOOKING_DELETED = "BOOKING_DELETED",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
}
export interface AuditLog {
    event_type: AuditEventType;
    user_id?: number;
    username?: string;
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, any>;
    success: boolean;
}
export declare function logAuditEvent(log: AuditLog): Promise<void>;
export declare function getClientIp(req: any): string;
export declare function getUserAgent(req: any): string;
