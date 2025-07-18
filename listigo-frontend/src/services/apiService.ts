import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../constants';
import { ErrorResponse } from '../types';

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }
  return null;
};

const apiService = async <T, D = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: D,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorJson: Partial<ErrorResponse & { error?: string; errors?: string[] | Record<string, string[]>}> = {};
      let responseText = '';
      try {
        responseText = await response.text();
        errorJson = JSON.parse(responseText);
      } catch (jsonError) {
      }

      let errorMessage = 'Bilinmeyen bir API hatası oluştu.';
      if (errorJson.message) {
        errorMessage = errorJson.message;
      } else if ((errorJson as any).error) { // Spring Boot default error structure
        errorMessage = (errorJson as any).error;
      } else if (responseText && !(responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html'))) {
        errorMessage = responseText.substring(0, 200);
      } else if (responseText) {
         errorMessage = `API Hatası: Sunucu JSON yerine HTML döndürdü. Endpoint: ${method} ${url}`;
      } else {
        errorMessage = `API isteği başarısız oldu. Durum: ${response.status} ${response.statusText || ''}`;
      }
      
      if (typeof errorJson.errors === 'object' && errorJson.errors !== null) {
        const detailedErrors = Array.isArray(errorJson.errors) 
          ? errorJson.errors.join(', ') 
          : Object.values(errorJson.errors).flat().join(', ');
        if (detailedErrors) {
          errorMessage += `: ${detailedErrors}`;
        }
      }
      
      console.error(`API Error (${response.status}) for ${method} ${url}:`, errorMessage, 'Raw Response Text:', responseText.substring(0,500));
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) {
        return undefined as unknown as T; 
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json() as T;
    } else {
        const responseText = await response.text();
        if (response.ok && (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html'))) {
            console.error(`API endpoint ${method} ${url} returned HTML content instead of JSON for a 2xx response.`);
            throw new Error(`Sunucudan beklenmedik bir HTML yanıtı alındı. Lütfen API endpointini kontrol edin: ${method} ${url}`);
        }
        console.warn(`API response from ${method} ${url} was OK but not JSON. Content-Type: ${contentType}. Body: ${responseText.substring(0, 200)}...`);
        throw new Error(`Sunucudan JSON formatında olmayan bir yanıt alındı. Content-Type: ${contentType || 'bilinmiyor'}`);
    }

  } catch (error) {
    throw error; 
  }
};

export default apiService;