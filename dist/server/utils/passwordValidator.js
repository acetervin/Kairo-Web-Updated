export function validatePassword(password) {
    const errors = [];
    if (!password) {
        return {
            isValid: false,
            errors: ['Password is required'],
        };
    }
    // Minimum length
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    // Maximum length
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
    }
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    // At least one number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|\'";:,.<>?)');
    }
    // Check for common passwords (basic check)
    const commonPasswords = [
        'password',
        '12345678',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
    ];
    if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
        errors.push('Password cannot contain common words or patterns');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
}
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    // Remove null bytes and trim whitespace
    return input.replace(/\0/g, '').trim();
}
