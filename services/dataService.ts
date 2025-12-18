/**
 * MediTrack Pro - 数据服务层
 * 
 * 调用后端 API 版本
 */

import { Drug, SaleRecord, User, SaleItem } from '../types';

// API 基础路径
const API_BASE = '/api';

// Token 存储键
const TOKEN_KEY = 'meditrack_auth_token';
const USER_KEY = 'meditrack_user';

// ==================== Token 管理 ====================

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ==================== API 请求封装 ====================

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // Token 过期处理
  if (response.status === 401) {
    clearToken();
    // 不自动跳转，让调用方处理
    throw new Error('登录已过期，请重新登录');
  }

  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || '请求失败');
  }
  
  return data.data;
}

// ==================== 认证服务 ====================

export const authService = {
  /**
   * 用户登录
   */
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || '登录失败');
    }

    // 保存 token 和用户信息
    setToken(data.data.token);
    setStoredUser(data.data.user);

    return data.data;
  },

  /**
   * 用户注册
   */
  register: async (userData: { 
    username: string; 
    password: string; 
    name: string; 
    role: string 
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return { success: data.success, message: data.message };
  },

  /**
   * 登出
   */
  logout: (): void => {
    clearToken();
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  /**
   * 获取当前用户
   */
  getCurrentUser: (): User | null => {
    return getStoredUser();
  },
};

// ==================== 药品服务 ====================

export const drugService = {
  /**
   * 获取所有药品
   */
  getDrugs: async (): Promise<Drug[]> => {
    const response = await fetchWithAuth('/drugs');
    return handleResponse<Drug[]>(response);
  },

  /**
   * 获取已删除的药品
   */
  getDeletedDrugs: async (): Promise<Drug[]> => {
    const response = await fetchWithAuth('/drugs?deleted=true');
    return handleResponse<Drug[]>(response);
  },

  /**
   * 添加药品
   */
  addDrug: async (drug: Omit<Drug, 'id' | 'history'>): Promise<Drug> => {
    const response = await fetchWithAuth('/drugs', {
      method: 'POST',
      body: JSON.stringify(drug),
    });
    return handleResponse<Drug>(response);
  },

  /**
   * 批量添加药品
   */
  batchAddDrugs: async (drugs: Omit<Drug, 'id' | 'history'>[]): Promise<Drug[]> => {
    const response = await fetchWithAuth('/drugs', {
      method: 'POST',
      body: JSON.stringify(drugs),
    });
    return handleResponse<Drug[]>(response);
  },

  /**
   * 更新药品
   */
  updateDrug: async (drug: Drug): Promise<Drug> => {
    const response = await fetchWithAuth(`/drugs/${drug.id}`, {
      method: 'PUT',
      body: JSON.stringify(drug),
    });
    return handleResponse<Drug>(response);
  },

  /**
   * 删除药品
   */
  deleteDrug: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/drugs/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },

  /**
   * 批量删除
   */
  batchDeleteDrugs: async (ids: string[]): Promise<{ count: number }> => {
    const response = await fetchWithAuth('/drugs/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    return handleResponse<{ count: number }>(response);
  },

  /**
   * 恢复药品
   */
  restoreDrug: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/drugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'restore' }),
    });
    await handleResponse<void>(response);
  },

  /**
   * 彻底删除
   */
  permanentlyDeleteDrug: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/drugs/${id}?permanent=true`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },

  /**
   * 切换锁定
   */
  toggleDrugLock: async (id: string): Promise<{ isLocked: boolean }> => {
    const response = await fetchWithAuth(`/drugs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'toggleLock' }),
    });
    return handleResponse<{ isLocked: boolean }>(response);
  },
};

// ==================== 销售服务 ====================

export const salesService = {
  /**
   * 获取销售记录
   */
  getSales: async (limit: number = 100, offset: number = 0): Promise<SaleRecord[]> => {
    const response = await fetchWithAuth(`/sales?limit=${limit}&offset=${offset}`);
    return handleResponse<SaleRecord[]>(response);
  },

  /**
   * 创建销售记录
   */
  addSale: async (items: SaleItem[], customerName?: string): Promise<SaleRecord> => {
    const response = await fetchWithAuth('/sales', {
      method: 'POST',
      body: JSON.stringify({ items, customerName }),
    });
    return handleResponse<SaleRecord>(response);
  },
};

// ==================== 用户服务 ====================

export const userService = {
  /**
   * 获取当前用户信息
   */
  getProfile: async (): Promise<User> => {
    const response = await fetchWithAuth('/users/me');
    return handleResponse<User>(response);
  },

  /**
   * 更新用户信息
   */
  updateProfile: async (data: { name?: string; password?: string }): Promise<User> => {
    const response = await fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const user = await handleResponse<User>(response);
    setStoredUser(user);
    return user;
  },
};

// ==================== 兼容旧版 dataService ====================
// 警告：这些方法仅为兼容性保留，新代码请使用上面的服务

export const dataService = {
  getDrugs: () => drugService.getDrugs(),
  saveDrugs: () => console.warn('saveDrugs 已弃用'),
  getDeletedDrugs: () => drugService.getDeletedDrugs(),
  saveDeletedDrugs: () => console.warn('saveDeletedDrugs 已弃用'),
  getSales: () => salesService.getSales(),
  addSale: (sale: SaleRecord) => salesService.addSale(sale.items, sale.customerName),
  getUsers: () => {
    console.warn('getUsers 已弃用');
    return [];
  },
  registerUser: (user: any) => authService.register({
    username: user.username,
    password: user.password || '',
    name: user.name,
    role: user.role,
  }),
  loginUser: async (username: string, password: string) => {
    try {
      const result = await authService.login(username, password);
      return result.user;
    } catch {
      return undefined;
    }
  },
  updateUser: (user: User) => userService.updateProfile({ name: user.name, password: user.password }),
};

export default dataService;
