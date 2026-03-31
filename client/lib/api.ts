import type { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User,
  Agent,
  Document,
  License,
  DashboardStats,
  PaginatedResponse
} from '@shared/types';

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Get stored token
function getToken(): string | null {
  return localStorage.getItem('aerocheck_token');
}

// Set token
export function setToken(token: string): void {
  localStorage.setItem('aerocheck_token', token);
}

// Remove token
export function removeToken(): void {
  localStorage.removeItem('aerocheck_token');
}

// Base request function
async function request<T>(
  path: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data as T;
}

// Auth API
export const authApi = {
  register: (data: RegisterRequest) => 
    request<ApiResponse<AuthResponse>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) => 
    request<ApiResponse<AuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<ApiResponse<User>>('/api/auth/me'),
};

// Agents API
export const agentsApi = {
  list: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return request<PaginatedResponse<Agent>>(`/api/agents?${searchParams}`);
  },

  get: (id: string) => request<ApiResponse<Agent>>(`/api/agents/${id}`),

  create: (data: Omit<Agent, 'id' | 'userId' | 'matricule' | 'status' | 'createdAt' | 'updatedAt'>) =>
    request<ApiResponse<Agent>>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Agent>) =>
    request<ApiResponse<Agent>>(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<ApiResponse<Agent>>(`/api/agents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<ApiResponse<void>>(`/api/agents/${id}`, {
      method: 'DELETE',
    }),
};

// Documents API
export const documentsApi = {
  list: (params?: { agentId?: string; status?: string; type?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.agentId) searchParams.set('agentId', params.agentId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return request<PaginatedResponse<Document>>(`/api/documents?${searchParams}`);
  },

  get: (id: string) => request<ApiResponse<Document>>(`/api/documents/${id}`),

  submit: (data: { agentId: string; type: string; fileName: string }) =>
    request<ApiResponse<Document>>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  validate: (id: string, data: { status: 'VALIDE' | 'REJETE'; comment?: string }) =>
    request<ApiResponse<Document>>(`/api/documents/${id}/validate`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<void>>(`/api/documents/${id}`, {
      method: 'DELETE',
    }),
};

// Licenses API
export const licensesApi = {
  list: (params?: { agentId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.agentId) searchParams.set('agentId', params.agentId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    return request<PaginatedResponse<License>>(`/api/licenses?${searchParams}`);
  },

  get: (id: string) => request<ApiResponse<License>>(`/api/licenses/${id}`),

  issue: (data: { agentId: string; validityYears?: number }) =>
    request<ApiResponse<License>>('/api/licenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request<ApiResponse<License>>(`/api/licenses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  regenerateQR: (id: string) =>
    request<ApiResponse<License>>(`/api/licenses/${id}/qrcode`, {
      method: 'POST',
    }),
};

// Stats API
export const statsApi = {
  overview: () => request<ApiResponse<DashboardStats>>('/api/stats/overview'),
  
  workflow: () => request<ApiResponse<{
    workflow: Record<string, number>;
    monthlyData: Record<string, { agents: number; licenses: number }>;
  }>>('/api/stats/workflow'),
  
  users: () => request<ApiResponse<{
    totalUsers: number;
    usersParRole: Record<string, number>;
    recentUsers: User[];
  }>>('/api/stats/users'),
};

// Health check
export function getHealth() {
  return request<{ status: string; timestamp: string }>('/api/health');
}
