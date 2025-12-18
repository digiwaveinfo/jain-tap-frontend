const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  bookingDate: string; // ISO format date
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
  createdAt: string; // alias for submissionDate
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
    const token = localStorage.getItem('adminToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors - extract first error message
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        throw new Error(data.errors[0].message || data.message || 'Validation failed');
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Public endpoints
  async submitBooking(data: SubmissionData): Promise<ApiResponse> {
    return this.request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

    if (response.success && response.token) {
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminUser', JSON.stringify(response.user));
    }

    return response;
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  getUser(): { username: string; role: string } | null {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
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

    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/submissions/export?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Export failed');
    return response.blob();
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
    // Need special handling for FormData (no Content-Type header, browser sets it)
    const url = `${API_BASE_URL}/anumodana`;
    const headers = this.getAuthHeader(); // Only auth, no content-type

    const response = await fetch(url, {
      method: 'POST',
      headers: headers as HeadersInit,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
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
export type { SubmissionData, Submission, PaginatedResponse };
