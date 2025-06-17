
// From backend DTOs

export interface UserMetadata {
  userId: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  refreshToken?: string;
  refreshTokenExpiration?: string;
  // listings: Listing[]; // Avoid circular dependency if Listing type also includes UserMetadata
}

export interface UserResponse {
  userId: string;
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
  categoryId: number | null;
  categoryName: string;
}

export interface ListingDTO {
  listingId?: number; // Optional for new listings
  userId: string;
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
  createdAt?: string;
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
  senderId: string;
  receiverId: string;
  listingId: number;
  content: string;
  sentAt?: string;
  isRead?: boolean;
}

export interface BlockUserDTO {
  blockedId: string;
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
  imageUrl?: string;
}

export interface ChangePasswordForm {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export type ApiService = <T, D = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: D,
  params?: Record<string, string | number | boolean | undefined>
) => Promise<T>;

export interface ConversationInfo {
  listingId: number;
  listingTitle: string;
  otherParticipantName: string;
  otherParticipantId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  listingImageUrl?: string;
}

export interface Conversation {
  listing: ListingDTO;
  messages: MessageDTO[];
  otherParticipant: UserMetadata;
}
