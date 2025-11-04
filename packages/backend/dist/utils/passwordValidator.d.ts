export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare function validatePassword(password: string): PasswordValidationResult;
export declare function sanitizeInput(input: string): string;
