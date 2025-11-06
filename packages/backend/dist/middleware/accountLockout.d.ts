export interface FailedLoginAttempt {
    username: string;
    count: number;
    lastAttempt: number;
    lockedUntil?: number;
}
export declare const MAX_FAILED_ATTEMPTS = 5;
export declare function checkAccountLockoutSync(username: string): {
    isLocked: boolean;
    lockedUntil?: Date;
    remainingAttempts?: number;
};
export declare function checkAccountLockout(username: string): Promise<{
    isLocked: boolean;
    lockedUntil?: Date;
    remainingAttempts?: number;
}>;
export declare function recordFailedLogin(username: string): {
    isLocked: boolean;
    lockedUntil?: Date;
};
export declare function recordSuccessfulLogin(username: string): void;
