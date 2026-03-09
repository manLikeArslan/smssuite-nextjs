import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const MAX_PHONE_LENGTH = 20;

export function isValidPhone(phone: any): phone is string {
    if (typeof phone !== 'string') return false;
    if (phone.length > MAX_PHONE_LENGTH) return false;
    return PHONE_REGEX.test(phone);
}
