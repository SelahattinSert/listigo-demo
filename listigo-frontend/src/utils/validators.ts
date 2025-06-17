
import { PASSWORD_VALIDATION, PHONE_VALIDATION_REGEX } from '../constants';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  return PHONE_VALIDATION_REGEX.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < PASSWORD_VALIDATION.minLength) {
    return { isValid: false, message: `Şifre en az ${PASSWORD_VALIDATION.minLength} karakter olmalıdır.` };
  }
  if (PASSWORD_VALIDATION.requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir büyük harf içermelidir.' };
  }
  if (PASSWORD_VALIDATION.requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir küçük harf içermelidir.' };
  }
  if (PASSWORD_VALIDATION.requireNumber && !/\d/.test(password)) {
     return { isValid: false, message: 'Şifre en az bir rakam içermelidir.' };
  }
  if (PASSWORD_VALIDATION.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir özel karakter içermelidir.' };
  }
  return { isValid: true };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (_) {
    return false;
  }
};
