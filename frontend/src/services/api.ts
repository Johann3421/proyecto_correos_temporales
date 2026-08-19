import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create a dedicated Axios instance with strict cache-busting
const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Request interceptor to append dynamic timestamp preventing HTTP disk/memory cache
http.interceptors.request.use((config) => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }
  return config;
});

export interface InboxData {
  id: string;
  email_address: string;
  access_token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  remaining_seconds: number;
  label?: string;
  session_owner?: string;
  forward_to?: string;
  forward_enabled?: boolean;
  unread_count?: number;
  total_messages?: number;
}

export interface MessageSummary {
  id: string;
  from_address: string;
  subject: string;
  received_at: string;
  is_read: boolean;
  raw_size_kb: number;
  has_attachments: boolean;
  is_saved: boolean;
  matched_rules?: string[];
}

export interface AttachmentSummary {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
}

export interface MessageDetail extends MessageSummary {
  inbox_id: string;
  body_text: string;
  body_html: string;
  attachments: AttachmentSummary[];
}

export interface SavedMessage {
  id: string;
  from_address: string;
  subject: string;
  body_text: string;
  body_html: string;
  received_at: string;
  raw_size_kb: number;
  original_inbox_email: string;
}

export interface InboxRule {
  id: string;
  inbox_id: string;
  rule_type: 'domain' | 'subject' | 'from';
  pattern: string;
  action: 'notify_only' | 'auto_save' | 'forward';
  is_active: boolean;
  created_at: string;
}

export interface StatsDomainCount {
  domain: string;
  count: number;
}

export interface StatsDayCount {
  date: string;
  count: number;
}

export interface StatsData {
  total_inboxes: number;
  active_inboxes: number;
  total_messages_received: number;
  saved_messages_count: number;
  top_senders: StatsDomainCount[];
  messages_by_day: StatsDayCount[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  role: string;
  expires_at: string;
  expires_in_seconds: number;
}

export interface VerifyResponse {
  valid: boolean;
  username?: string;
  role?: string;
  remaining_seconds: number;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>('/auth/login', { username, password });
    return res.data;
  },
  async verifySession(token: string): Promise<VerifyResponse> {
    const res = await http.get<VerifyResponse>(`/auth/verify/${token}`);
    return res.data;
  },
  async logout(token: string): Promise<void> {
    await http.post(`/auth/logout/${token}`);
  },

  // Inbox & Multi-inbox
  async getDomains(): Promise<string[]> {
    const res = await http.get<{ domains: string[] }>('/inbox/domains');
    return res.data.domains;
  },
  async createInbox(domain?: string, customPrefix?: string, label?: string, sessionToken?: string, useSubdomain?: boolean): Promise<InboxData> {
    const res = await http.post<InboxData>('/inbox', {
      domain,
      custom_prefix: customPrefix,
      label,
      session_token: sessionToken,
      use_subdomain: useSubdomain,
    });
    return res.data;
  },
  async listUserInboxes(sessionToken: string): Promise<InboxData[]> {
    const res = await http.get<InboxData[]>(`/inbox/user/${sessionToken}/list`);
    return res.data;
  },
  async getInboxStatus(token: string): Promise<InboxData> {
    const res = await http.get<InboxData>(`/inbox/${token}`);
    return res.data;
  },
  async renameInbox(token: string, label: string): Promise<InboxData> {
    const res = await http.patch<InboxData>(`/inbox/${token}/label`, { label });
    return res.data;
  },
  async updateForwarding(token: string, forwardTo: string, enabled: boolean): Promise<InboxData> {
    const res = await http.put<InboxData>(`/inbox/${token}/forward`, {
      forward_to: forwardTo,
      forward_enabled: enabled,
    });
    return res.data;
  },
  async deleteInbox(token: string): Promise<void> {
    await http.delete(`/inbox/${token}`);
  },

  // Rules & Filters
  async getInboxRules(token: string): Promise<InboxRule[]> {
    const res = await http.get<InboxRule[]>(`/inbox/${token}/rules`);
    return res.data;
  },
  async createInboxRule(token: string, rule: { rule_type: string; pattern: string; action: string }): Promise<InboxRule> {
    const res = await http.post<InboxRule>(`/inbox/${token}/rules`, rule);
    return res.data;
  },
  async deleteInboxRule(token: string, ruleId: string): Promise<void> {
    await http.delete(`/inbox/${token}/rules/${ruleId}`);
  },

  // Messages
  async getMessages(token: string): Promise<MessageSummary[]> {
    const res = await http.get<MessageSummary[]>(`/inbox/${token}/messages`);
    return res.data;
  },
  async getMessageDetail(token: string, messageId: string): Promise<MessageDetail> {
    const res = await http.get<MessageDetail>(`/inbox/${token}/messages/${messageId}`);
    return res.data;
  },
  getAttachmentUrl(token: string, attachmentId: string): string {
    return `${API_BASE_URL}/inbox/${token}/attachments/${attachmentId}`;
  },
  getExportEmlUrl(token: string, messageId: string): string {
    return `${API_BASE_URL}/inbox/${token}/messages/${messageId}/export/eml`;
  },
  getExportHtmlUrl(token: string, messageId: string): string {
    return `${API_BASE_URL}/inbox/${token}/messages/${messageId}/export/html`;
  },

  // Save / history
  async toggleSaveMessage(inboxToken: string, messageId: string, sessionToken: string): Promise<{ saved: boolean }> {
    const res = await http.post(`/inbox/${inboxToken}/messages/${messageId}/save`, null, {
      params: { session_token: sessionToken },
    });
    return res.data;
  },
  async getSavedMessages(sessionToken: string): Promise<SavedMessage[]> {
    const res = await http.get<SavedMessage[]>(`/inbox/saved/${sessionToken}`);
    return res.data;
  },

  // Test email
  async sendTestEmail(token: string): Promise<{ message: string; id: string }> {
    const res = await http.post(`/inbox/${token}/test`);
    return res.data;
  },

  // Stats & Support
  async getUserStats(sessionToken: string): Promise<StatsData> {
    const res = await http.get<StatsData>(`/inbox/stats/${sessionToken}`);
    return res.data;
  },
  async submitSupport(data: { name: string; email: string; subject: string; message: string; session_token?: string }): Promise<any> {
    const res = await http.post('/inbox/support', data);
    return res.data;
  },
};
