import {
  UserCharacter, Quest, ActivityLog, ShopItem, AuthResponse, CompleteQuestResult,
  AttributeType, QuestDifficulty, QuestType
} from '../types';

const TOKEN_KEY = 'liferpg_jwt_token';
const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiration gracefully
    if ((response.status === 401 || response.status === 403) && !isRetry && !endpoint.includes('/api/auth/')) {
      console.warn(`[ApiClient] Session invalidated on ${endpoint}. Refreshing demo credentials...`);
      this.setToken(null);
      try {
        await this.loginAsDemo();
        return this.request<T>(endpoint, options, true);
      } catch (authErr) {
        console.error('[ApiClient] Auto-session refresh failed:', authErr);
      }
    }

    let data: Record<string, unknown> = {};
    const text = await response.text();
    if (text) {
      try { data = JSON.parse(text); }
      catch { data = { error: text.length > 200 ? `Server returned status ${response.status}` : text }; }
    }

    if (!response.ok) {
      const errorMsg = (data.error as string) || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Auth
  public async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    this.setToken(res.token);
    return res;
  }

  public async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
    this.setToken(res.token);
    return res;
  }

  public async loginAsDemo(): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/demo', { method: 'POST' });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: { id: string; username: string; email: string }; character: UserCharacter }> {
    return this.request('/api/auth/me');
  }

  public logout() { this.setToken(null); }

  // Character
  public async getCharacter(): Promise<UserCharacter> { return this.request<UserCharacter>('/api/character'); }
  public async equipItem(itemId: string): Promise<UserCharacter> {
    return this.request<UserCharacter>('/api/character/equip', { method: 'POST', body: JSON.stringify({ itemId }) });
  }

  // Quests
  public async getQuests(): Promise<Quest[]> { return this.request<Quest[]>('/api/quests'); }
  public async createQuest(data: { title: string; description?: string; category: AttributeType; difficulty: QuestDifficulty; type?: QuestType }): Promise<Quest> {
    return this.request<Quest>('/api/quests', { method: 'POST', body: JSON.stringify(data) });
  }
  public async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest> {
    return this.request<Quest>(`/api/quests/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  }
  public async deleteQuest(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/quests/${id}`, { method: 'DELETE' });
  }
  public async completeQuest(id: string): Promise<CompleteQuestResult> {
    return this.request<CompleteQuestResult>(`/api/quests/${id}/complete`, { method: 'POST' });
  }
  public async uncompleteQuest(id: string): Promise<{ quest: Quest; character: UserCharacter }> {
    return this.request(`/api/quests/${id}/uncomplete`, { method: 'POST' });
  }

  // Shop
  public async getShopCatalog(): Promise<ShopItem[]> { return this.request<ShopItem[]>('/api/shop'); }
  public async purchaseItem(itemId: string): Promise<{ character: UserCharacter; item: ShopItem }> {
    return this.request('/api/shop/purchase', { method: 'POST', body: JSON.stringify({ itemId }) });
  }

  // Logs
  public async getActivityLogs(): Promise<ActivityLog[]> { return this.request<ActivityLog[]>('/api/logs'); }
}

export const api = new ApiClient();
