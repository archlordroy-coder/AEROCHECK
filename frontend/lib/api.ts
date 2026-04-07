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
  PaginatedResponse,
  Role
} from '@shared/types';

// Export UserRole as alias for Role
export type UserRole = Role;

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
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const rawText = await response.text();
  const contentType = response.headers.get('content-type') || '';

  let data: any = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      const snippet = rawText.slice(0, 300);
      throw new Error(
        `Invalid JSON response (${response.status}) for ${path}. content-type=${contentType}. body=${snippet}`
      );
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
        ? data.error
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  if (data === null) {
    throw new Error(`Empty response body (${response.status}) for ${path}`);
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

  create: (data: Omit<Agent, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) =>
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

  getWithDocStats: () =>
    request<ApiResponse<Array<{
      id: string;
      matricule: string;
      firstName: string;
      lastName: string;
      email: string;
      aeroport: string;
      status: string;
      documentStats: {
        total: number;
        validated: number;
        pending: number;
        rejected: number;
      };
    }>>>('/api/agents/with-doc-stats'),

  delete: (id: string) =>
    request<ApiResponse<void>>(`/api/agents/${id}`, {
      method: 'DELETE',
    }),

  getLicenses: (agentId: string) =>
    request<ApiResponse<License[]>>(`/api/agents/${agentId}/licenses`),
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

  submit: (data: FormData) =>
    request<ApiResponse<Document>>('/api/documents', {
      method: 'POST',
      body: data,
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

  upload: (agentId: string, data: FormData) => {
    if (!data.has('agentId')) {
      data.append('agentId', agentId);
    }
    return request<ApiResponse<Document>>('/api/documents', {
      method: 'POST',
      body: data,
    });
  },
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

// References API
export const referencesApi = {
  nationalites: () => request<ApiResponse<Array<{ id: string; code: string; nom: string }>>>('/api/references/nationalites'),
  employeurs: () => request<ApiResponse<Array<{ id: string; nom: string }>>>('/api/references/employeurs'),
  pays: () => request<ApiResponse<Array<{ id: string; code: string; nom: string; nomFr: string }>>>('/api/references/pays'),
  aeroports: (paysId?: string) => {
    const params = paysId ? `?paysId=${paysId}` : '';
    return request<ApiResponse<Array<{ id: string; code: string; nom: string; ville: string; paysId: string }>>>(`/api/references/aeroports${params}`);
  },
};

// Health check
export function getHealth() {
  return request<{ status: string; timestamp: string }>('/api/health');
}

// Generic api object for direct endpoint access
export const api = {
  get: async <T>(path: string) => {
    const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const data = await request<T>(normalizedPath);
    return { data };
  },
  post: async <T>(path: string, body: unknown) => {
    const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const data = await request<T>(normalizedPath, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { data };
  },
  patch: async <T>(path: string, body: unknown) => {
    const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const data = await request<T>(normalizedPath, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return { data };
  },
  put: async <T>(path: string, body: unknown) => {
    const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const data = await request<T>(normalizedPath, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    return { data };
  },
  delete: async <T>(path: string) => {
    const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
    const data = await request<T>(normalizedPath, {
      method: 'DELETE',
    });
    return { data };
  },
};
