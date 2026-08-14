import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface InboxData {
  id: string;
  email_address: string;
  access_token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  remaining_seconds: number;
}

export interface MessageSummary {
  id: string;
  from_address: string;
  subject: string;
  received_at: string;
  is_read: boolean;
  raw_size_kb: number;
  has_attachments: boolean;
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

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  expires_at: string;
  expires_in_seconds: number;
}

export interface VerifyResponse {
  valid: boolean;
  username?: string;
  remaining_seconds: number;
}

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const res = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });
    return res.data;
  },

  async verifySession(token: string): Promise<VerifyResponse> {
    const res = await axios.get<VerifyResponse>(`${API_BASE_URL}/auth/verify/${token}`);
    return res.data;
  },

  async logout(token: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/logout/${token}`);
  },

  // Inbox operations
  async getDomains(): Promise<string[]> {
    const res = await axios.get<{ domains: string[] }>(`${API_BASE_URL}/inbox/domains`);
    return res.data.domains;
  },

  async createInbox(domain?: string, customPrefix?: string): Promise<InboxData> {
    const res = await axios.post<InboxData>(`${API_BASE_URL}/inbox`, {
      domain,
      custom_prefix: customPrefix,
    });
    return res.data;
  },

  async getInboxStatus(token: string): Promise<InboxData> {
    const res = await axios.get<InboxData>(`${API_BASE_URL}/inbox/${token}`);
    return res.data;
  },

  async getMessages(token: string): Promise<MessageSummary[]> {
    const res = await axios.get<MessageSummary[]>(`${API_BASE_URL}/inbox/${token}/messages`);
    return res.data;
  },

  async getMessageDetail(token: string, messageId: string): Promise<MessageDetail> {
    const res = await axios.get<MessageDetail>(`${API_BASE_URL}/inbox/${token}/messages/${messageId}`);
    return res.data;
  },

  async extendInbox(token: string, minutes: number = 10): Promise<InboxData> {
    const res = await axios.post<InboxData>(`${API_BASE_URL}/inbox/${token}/extend`, { minutes });
    return res.data;
  },

  async deleteInbox(token: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/inbox/${token}`);
  },

  getAttachmentUrl(token: string, attachmentId: string): string {
    return `${API_BASE_URL}/inbox/${token}/attachments/${attachmentId}`;
  },
};
