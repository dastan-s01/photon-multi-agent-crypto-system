import { API_BASE_URL } from './api-base';

export interface ApiError {
  message: string;
  detail?: string;
  [key: string]: any;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    date_joined: string;
  };
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    full_name: string;
    date_joined: string;
  };
  access: string;
  refresh: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  date_joined: string;
}

export interface RefreshResponse {
  access: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getCookieToken(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const tokenPair = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    return tokenPair ? tokenPair.split('=')[1] : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let token = this.getAccessToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(url, config);

      if (response.status === 401 && token) {
        try {
          const newToken = await this.refreshToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryConfig: RequestInit = {
            ...options,
            headers,
          };
          response = await fetch(url, retryConfig);
        } catch (refreshError) {
          this.clearTokens();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(errorData.detail || errorData.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token') || this.getCookieToken('access_token');
  }

  private setTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    // keep cookies in sync so server-rendered parts can still read tokens
    document.cookie = `access_token=${access}; path=/; max-age=${60 * 30}; sameSite=lax`;
    document.cookie = `refresh_token=${refresh}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'access_token=; path=/; max-age=0; sameSite=lax';
    document.cookie = 'refresh_token=; path=/; max-age=0; sameSite=lax';
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token') || this.getCookieToken('refresh_token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async register(
    email: string,
    password: string,
    fullName?: string
  ): Promise<RegisterResponse> {
    const data = await this.request<RegisterResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName || '',
      }),
    });
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request<RefreshResponse>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    this.setTokens(data.access, refreshToken);
    return data.access;
  }

  async getCurrentUser(): Promise<UserResponse> {
    return await this.request<UserResponse>('/auth/me/');
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Dashboard endpoints
  async getDashboardOverview() {
    return await this.request<{
      balance: number;
      initialBalance: number;
      todayPnL: number;
      todayTradesCount: number;
      winRate: number;
      agentsStatus: string;
      activeAgentsCount: number;
    }>('/trading/dashboard/overview/');
  }

  async getMarketChart(symbol?: string, timeframe?: string) {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol);
    if (timeframe) params.append('timeframe', timeframe);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request<{
      symbol: string;
      currentPrice: number;
      data: Array<{
        timestamp: string;
        price: number;
        volume: number;
      }>;
    }>(`/trading/dashboard/market-chart/${query}`);
  }

  async getMarketHeatmap() {
    return await this.request<Array<{
      symbol: string;
      price: number;
      change: number;
      changePercent: number;
      volume: number;
    }>>('/trading/dashboard/market-heatmap/');
  }

  // Portfolio endpoints
  async getPortfolio() {
    return await this.request<{
      balance: number;
      freeCash: number;
      usedMargin: number;
      totalTrades: number;
      todayPnL: number;
      totalPnL: number;
    }>('/trading/portfolio/');
  }

  async getPositions() {
    return await this.request<Array<{
      id: number;
      symbol: string;
      quantity: number;
      entryPrice: number;
      currentPrice: number;
      pnl: number;
      pnlPercent: number;
      openedAt: string;
    }>>('/trading/positions/');
  }

  async getTrades(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return await this.request<Array<{
      id: number;
      symbol?: string | number;
      symbol_name?: string;
      action: 'BUY' | 'SELL' | 'HOLD';
      price: number;
      quantity: number;
      agent: string;
      pnl: number | null;
      timestamp: string;
    }>>(`/trading/trades/${params}`);
  }

  async getEquityCurve() {
    return await this.request<{
      data: Array<{
        date: string;
        balance: number;
      }>;
      initialBalance: number;
      currentBalance: number;
    }>('/trading/portfolio/equity-curve/');
  }

  // Agents endpoints
  async getAgentsDetail() {
    return await this.request<Array<{
      id: number;
      type: string;
      name: string;
      status: string;
      lastAction: string;
      lastUpdated: string;
      messagesProcessed: number;
      logs: Array<{
        id: number;
        level: string;
        message: string;
        timestamp: string;
      }>;
    }>>('/trading/agents/detail/');
  }

  async getMessages(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return await this.request<Array<{
      id: string;
      from: string;
      to: string;
      type: string;
      payload: Record<string, any>;
      timestamp: string;
    }>>(`/trading/messages/${params}`);
  }

  async controlMarketMonitor(action: 'start' | 'stop') {
    return await this.request('/trading/agents/market-monitor/', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getMarketMonitorStatus() {
    return await this.request<{
      id: number;
      status: string;
      last_updated: string;
      config: Record<string, any>;
    }>('/trading/agents/market-monitor/');
  }

  async requestDecisionMaker(symbolId: number) {
    return await this.request('/trading/agents/decision-maker/', {
      method: 'POST',
      body: JSON.stringify({ symbol_id: symbolId }),
    });
  }

  async getDecisionMakerStatus() {
    return await this.request<{
      id: number;
      status: string;
      last_updated: string;
      config: Record<string, any>;
    }>('/trading/agents/decision-maker/');
  }

  async controlExecutionAgent(action: 'start' | 'stop') {
    return await this.request('/trading/agents/execution/', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async getExecutionAgentStatus() {
    return await this.request<{
      id: number;
      status: string;
      last_updated: string;
      config: Record<string, any>;
    }>('/trading/agents/execution/');
  }

  async getAgentsStatus() {
    return await this.request<Array<{
      id: number;
      name: string;
      type: string;
      status: string;
      last_updated: string;
    }>>('/trading/agents/status/');
  }

  async getAgentStatus(id: number) {
    return await this.request<{
      id: number;
      name: string;
      type: string;
      status: string;
      last_updated: string;
      config: Record<string, any>;
      logs: Array<{
        timestamp: string;
        level: string;
        message: string;
      }>;
    }>(`/trading/agents/status/${id}/`);
  }

  async placeDemoOrder(params: { action: 'BUY' | 'SELL'; symbol: string; quantity: number }) {
    return await this.request<{
      status: string;
      action: string;
      symbol: string;
      price: number;
      quantity: number;
      account: any;
      position: any;
      trade: any;
    }>('/trading/demo/orders/', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Analytics endpoints
  async getPerformanceMetrics() {
    return await this.request<{
      totalReturn: number;
      totalReturnPercent: number;
      sharpeRatio: number;
      winRate: number;
      maxDrawdown: number;
      maxDrawdownPercent: number;
      averageWin: number;
      averageLoss: number;
      profitFactor: number;
      totalTrades: number;
      winningTrades: number;
      losingTrades: number;
    }>('/trading/analytics/performance-metrics/');
  }

  async getPnLCurve() {
    return await this.request<{
      data: Array<{
        date: string;
        pnl: number;
      }>;
      totalPnL: number;
      initialBalance: number;
      currentBalance: number;
    }>('/trading/analytics/pnl-curve/');
  }

  async getMonthlyBreakdown() {
    return await this.request<{
      today: number;
      yesterday: number;
      thisWeek: number;
      thisMonth: number;
      lastMonth: number;
      monthly: Array<{
        month: string;
        pnl: number;
      }>;
    }>('/trading/analytics/monthly-breakdown/');
  }

  // Settings endpoints
  async getSettings() {
    return await this.request<{
      status: string;
      speed: string;
      symbol: string;
      timeframe: string;
      dataProvider: string;
      historyLength: string;
      modelType: string;
      predictionHorizon: string;
      confidenceThreshold: string;
      initialBalance: string;
      maxPositionSize: string;
      riskLevel: string;
      stopLoss: string;
      takeProfit: string;
      maxLeverage: string;
    }>('/trading/settings/');
  }

  async updateSettings(settings: Partial<{
    status: string;
    speed: string;
    symbol: string;
    timeframe: string;
    dataProvider: string;
    historyLength: string;
    modelType: string;
    predictionHorizon: string;
    confidenceThreshold: string;
    initialBalance: string;
    maxPositionSize: string;
    riskLevel: string;
    stopLoss: string;
    takeProfit: string;
    maxLeverage: string;
  }>) {
    return await this.request('/trading/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Symbols endpoints
  async getSymbols() {
    return await this.request<Array<{
      id: number;
      symbol: string;
      name: string;
      type: string;
      createdAt: string;
    }>>('/trading/symbols/');
  }

  async addSymbol(symbol: string) {
    return await this.request<{
      id: number;
      symbol: string;
      name: string;
      type: string;
    }>('/trading/symbols/', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  }

  async deleteSymbol(id: number) {
    return await this.request(`/trading/symbols/${id}/`, {
      method: 'DELETE',
    });
  }

  // Decisions endpoints
  async getDecisions(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return await this.request<Array<{
      id: number;
      symbol: string;
      action: 'BUY' | 'SELL' | 'HOLD';
      confidence: number;
      reasoning: string;
      created_at: string;
      executed_at?: string;
      status: string;
    }>>(`/trading/decisions/${params}`);
  }

  async createDecision(decision: {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence?: number;
    reasoning?: string;
  }) {
    return await this.request<{
      id: number;
      symbol: string;
      action: string;
      confidence: number;
      reasoning: string;
      created_at: string;
      status: string;
    }>('/trading/decisions/', {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  }

  async getDecision(id: number) {
    return await this.request<{
      id: number;
      symbol: string;
      action: 'BUY' | 'SELL' | 'HOLD';
      confidence: number;
      reasoning: string;
      created_at: string;
      executed_at?: string;
      status: string;
    }>(`/trading/decisions/${id}/`);
  }

  async updateDecision(id: number, decision: Partial<{
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    status: string;
  }>) {
    return await this.request(`/trading/decisions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(decision),
    });
  }

  async patchDecision(id: number, decision: Partial<{
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    status: string;
  }>) {
    return await this.request(`/trading/decisions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(decision),
    });
  }

  async deleteDecision(id: number) {
    return await this.request(`/trading/decisions/${id}/`, {
      method: 'DELETE',
    });
  }

  async getDecisionsStatistics() {
    return await this.request<{
      total_decisions: number;
      successful_decisions: number;
      failed_decisions: number;
      pending_decisions: number;
      average_confidence: number;
      win_rate: number;
    }>('/trading/decisions/statistics/');
  }

  // Market Data endpoints
  async getMarketData(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return await this.request<Array<{
      id: number;
      symbol: string;
      price: number;
      volume: number;
      timestamp: string;
      source: string;
    }>>(`/trading/market-data/${params}`);
  }

  async getMarketDataById(id: number) {
    return await this.request<{
      id: number;
      symbol: string;
      price: number;
      volume: number;
      timestamp: string;
      source: string;
      additional_data?: Record<string, any>;
    }>(`/trading/market-data/${id}/`);
  }

  async getLatestMarketData() {
    return await this.request<{
      data: Array<{
        symbol: string;
        price: number;
        change: number;
        change_percent: number;
        volume: number;
        timestamp: string;
      }>;
      errors?: string[];
    } | Array<{
      symbol: string;
      price: number;
      change: number;
      change_percent: number;
      volume: number;
      timestamp: string;
    }>>('/trading/market-data/latest/');
  }

  async refreshMarketData() {
    return await this.request<{
      status: string;
      message: string;
      updated_records: number;
    }>('/trading/market-data/refresh/', {
      method: 'POST',
    });
  }

  // Meta-Model endpoints
  async runMetaModelTrade(params: {
    symbol: string;
    execute?: boolean;
  }) {
    return await this.request<{
      success: boolean;
      symbol: string;
      decision: {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        regime: 'trend' | 'flat' | 'volatile';
        price: number;
        decision_id: number;
      };
      market_data: {
        timestamp: string;
        close: number;
        volume: number;
      };
      execution?: {
        status: string;
        action: string;
        quantity: number;
        price: number;
        trade_id: number;
        position_id: number;
      };
    }>('/trading/meta-model/trade/', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getTradingChartData(symbol: string, days: number = 30) {
    const params = new URLSearchParams();
    params.append('symbol', symbol);
    params.append('days', days.toString());
    return await this.request<{
      symbol: string;
      candles: Array<{
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }>;
      trades: Array<{
        timestamp: string;
        side: 'BUY' | 'SELL';
        price: number;
        quantity: number;
        trade_id: number;
        decision_id: number | null;
        confidence: number | null;
      }>;
      decisions: Array<{
        timestamp: string;
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        decision_id: number;
        regime: string | null;
      }>;
      summary: {
        total_trades: number;
        buy_trades: number;
        sell_trades: number;
        total_decisions: number;
      };
    }>(`/trading/meta-model/chart-data/?${params.toString()}`);
  }

  async getApprovedAssets() {
    return await this.request<{
      approved: Array<{
        symbol: string;
        category: string;
        historical_score: number;
        win_rate: number | null;
        trades: number | null;
        config: {
          enabled: boolean;
          max_position_size: number;
          min_confidence: number;
          use_meta_model: boolean;
          risk_level: string;
        };
      }>;
      blacklisted: Array<{
        symbol: string;
        reason: string;
        score: number | null;
      }>;
      total_approved: number;
      total_blacklisted: number;
    }>('/trading/meta-model/approved-assets/');
  }

  async runMetaModelBacktest(params: {
    symbol: string;
    initial_balance?: number;
    train_window?: number;
    retrain_interval?: number;
    use_ensemble?: boolean;
    use_regime_switching?: boolean;
    /** When true (default), paper account is reset to final backtest equity (clears demo trades/positions). */
    apply_to_account?: boolean;
  }) {
    return await this.request<{
      success: boolean;
      account_synced?: boolean;
      account_sync_error?: string;
      symbol: string;
      initial_balance: number;
      final_balance: number;
      total_return: number;
      total_trades: number;
      profitable_trades: number;
      losing_trades: number;
      win_rate: number;
      regime_distribution: {
        flat: number;
        volatile: number;
        trend: number;
      };
      trades: Array<{
        index: number;
        action: 'BUY' | 'SELL';
        price: number;
        confidence: number;
        regime: string;
        pnl?: number;
        pnl_pct?: number;
        is_closing?: boolean;
      }>;
      models_used: string[];
      models_count: number;
      settings: {
        train_window: number;
        retrain_interval: number;
        use_ensemble: boolean;
        use_regime_switching: boolean;
      };
    }>('/trading/meta-model/backtest/', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();

