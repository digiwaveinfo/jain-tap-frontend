/**
 * API Service Layer
 * Handles all API communication with the backend
 */

// API Base URL - defaults to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL;

// Request timeout in milliseconds (Issue #9 fix)
const REQUEST_TIMEOUT = 30000;

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: { username: string; role: string };
}

interface SubmissionData {
  name: string;
  upiNumber: string;
  whatsappNumber: string;
  ayambilShalaName: string;
  city: string;
  bookingDate: string;
  email?: string;
}

interface Submission {
  id: string;
  name: string;
  upiNumber: string;
  whatsappNumber: string;
  ayambilShalaName: string;
  city: string;
  bookingDate: string;
  status: string;
  submissionDate: string;
  createdAt: string;
  ipAddress?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private getAuthHeader(): HeadersInit {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Safe token retrieval
  private getToken(): string | null {
    try {
      return sessionStorage.getItem('adminToken');
    } catch {
      return null;
    }
  }

  // Request with timeout (Issue #9 fix)
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          this.logout();
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          throw new Error(data.message || 'Authentication required');
        }

        // Handle validation errors
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors[0].message || data.message || 'Validation failed');
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  // Public endpoints
  async submitBooking(data: SubmissionData): Promise<ApiResponse & { errors?: Array<{ field: string; message: string }> }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseData = await response.json();

      if (!response.ok) {
        return responseData;
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, message: 'Request timeout - please try again' };
      }
      throw error;
    }
  }

  async getBookingCounts(startDate: string, endDate: string): Promise<ApiResponse<Record<string, number>>> {
    return this.request(`/submissions/bookings/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  async checkDateAvailability(date: string): Promise<ApiResponse> {
    return this.request(`/submissions/bookings/check/${date}`);
  }

  // Admin auth
  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.request<ApiResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      try {
        const { token, user } = response.data as { token: string; user: { username: string; role: string } };
        if (token) {
          sessionStorage.setItem('adminToken', token);
          sessionStorage.setItem('adminUser', JSON.stringify(user));
        }
      } catch {
        // Storage might be full or disabled
      }
    }

    return response;
  }

  logout(): void {
    try {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
    } catch {
      // Ignore storage errors
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Basic JWT expiry check (Issue #3 enhancement)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Safe JSON parse (Issue #4 fix)
  getUser(): { username: string; role: string } | null {
    try {
      const user = sessionStorage.getItem('adminUser');
      if (!user) return null;
      return JSON.parse(user);
    } catch {
      // Corrupted data - clear it
      try {
        sessionStorage.removeItem('adminUser');
      } catch {
        // Ignore
      }
      return null;
    }
  }

  // Admin protected endpoints
  async getSubmissions(page = 1, limit = 50, filters?: Record<string, string>): Promise<PaginatedResponse<Submission>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return this.request(`/submissions?${params}`);
  }

  async getSubmissionById(id: string): Promise<ApiResponse<Submission>> {
    return this.request(`/submissions/${id}`);
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<ApiResponse> {
    return this.request(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubmission(id: string): Promise<ApiResponse> {
    return this.request(`/submissions/${id}`, {
      method: 'DELETE',
    });
  }

  async searchSubmissions(query: string): Promise<ApiResponse<Submission[]>> {
    return this.request(`/submissions/search?q=${encodeURIComponent(query)}`);
  }

  async getStatistics(): Promise<ApiResponse> {
    return this.request('/submissions/stats');
  }

  async exportSubmissions(filters?: Record<string, string>): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const token = this.getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for export

    try {
      const response = await fetch(`${BASE_URL}/submissions/export?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Export failed');
      return response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getHealth(): Promise<ApiResponse> {
    return this.request('/admin/health');
  }

  async getBackups(): Promise<ApiResponse> {
    return this.request('/admin/backups');
  }

  async createBackup(): Promise<ApiResponse> {
    return this.request('/admin/backups', { method: 'POST' });
  }

  // Calendar
  async getCalendarSettings(startDate: string, endDate: string): Promise<ApiResponse> {
    return this.request(`/calendar?startDate=${startDate}&endDate=${endDate}`);
  }

  async setCalendarDateStatus(date: string, status: string): Promise<ApiResponse> {
    return this.request('/calendar/status', {
      method: 'POST',
      body: JSON.stringify({ date, status })
    });
  }

  // Anumodana
  async getAnumodanaImages(): Promise<ApiResponse> {
    return this.request('/anumodana');
  }

  async uploadAnumodanaImage(formData: FormData): Promise<ApiResponse> {
    const url = `${BASE_URL}/anumodana`;
    const headers = this.getAuthHeader();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for upload

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers as HeadersInit,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async deleteAnumodanaImage(id: string): Promise<ApiResponse> {
    return this.request(`/anumodana/${id}`, { method: 'DELETE' });
  }

  // System Settings
  async getSystemSettings(): Promise<ApiResponse> {
    return this.request('/admin/settings');
  }

  async updateSystemSettings(settings: { maxBookingsPerDay?: number, maxBookingsPerMonth?: number }): Promise<ApiResponse> {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
}

export const api = new ApiService();
export type { SubmissionData, Submission, PaginatedResponse, ApiResponse };
