
export const API_BASE_URL = '/api/v1'; // Assuming proxy is set up or same origin

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  CREATE_LISTING: '/create-listing',
  EDIT_LISTING: '/edit-listing', // expects /:id
  LISTING_DETAILS: '/listings', // expects /:id
  MESSAGES: '/messages', // expects /:listingId or general inbox
  ADMIN_CATEGORIES: '/admin/categories',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'listigo_auth_token',
  USER_INFO: 'listigo_user_info',
  USER_ROLES: 'listigo_user_roles',
  FAVORITES: 'listigo_favorites',
};

export const ROLES = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN',
};

export const PASSWORD_VALIDATION = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: false,
  requireSpecialChar: true,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/,
  errorMessage: 'Şifre en az 6 karakter olmalı, en az bir büyük harf, bir küçük harf ve bir özel karakter içermelidir.'
};

export const PHONE_VALIDATION_REGEX = /^[+]?[0-9\s-()]{7,20}$/;

export const DEFAULT_PLACEHOLDER_IMAGE = 'https://picsum.photos/400/300';
