
// From backend DTOs

export interface UserMetadata {
  userId: string; // UUID
  email: string;
  name: string;
  phone: string;
  createdAt: string; // ISO DateTime string
  refreshToken?: string;
  refreshTokenExpiration?: string; // ISO DateTime string
  // listings: Listing[]; // Avoid circular dependency if Listing type also includes UserMetadata
}

export interface UserResponse {
  userId: string; // UUID
  email: string;
  name: string;
  phone: string;
}

export interface UserDto {
  email: string;
  password?: string; // Optional for updates
  name: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserMetadata; 
}


export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CategoryDTO {
  categoryId: number | null; // Null for new category before saving
  categoryName: string;
}

export interface ListingDTO {
  listingId?: number; // Optional for new listings
  userId: string; // UUID string
  categoryId: number;
  title: string;
  description?: string;
  price: number;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  location?: string;
  photos: string[];
  createdAt?: string; // ISO DateTime string
}

export interface ListingFilterDTO {
  categoryId?: number;
  brand?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  searchText?: string;
}

export interface MessageDTO {
  messageId?: number;
  senderId: string; // UUID string
  receiverId: string; // UUID string
  listingId: number;
  content: string;
  sentAt?: string; // ISO DateTime string
  isRead?: boolean;
}

export interface BlockUserDTO {
  blockedId: string; // UUID string of the user to be blocked
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]> | string[];
}

// Frontend specific types
export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserMetadata | null;
  roles: string[] | null;
  accessToken: string | null;
  login: (data: AuthResponse) => Promise<void>;
  logout: () => void;
  register: (userData: UserDto) => Promise<UserResponse>;
  updateUserContext: (updatedUser: UserMetadata) => void;
}

export interface FavoriteListing {
  id: number;
  title: string;
  price: number;
  imageUrl?: string; // first photo
}

// For password change form
export interface ChangePasswordForm {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

// API Service Function Generic Type
export type ApiService = <T, D = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: D,
  params?: Record<string, string | number | boolean | undefined>
) => Promise<T>;

// For simplified conversation overview
export interface ConversationInfo {
  listingId: number;
  listingTitle: string;
  otherParticipantName: string;
  otherParticipantId: string;
  lastMessage?: string;
  lastMessageAt?: string; // ISO DateTime string
  unreadCount?: number;
  listingImageUrl?: string;
}

export interface Conversation {
  listing: ListingDTO;
  messages: MessageDTO[];
  otherParticipant: UserMetadata;
}
