export type ActionType = 'like' | 'rate' | 'report' | 'download' | 'copy' | 'view';

export type ReportReason = 'inappropriate' | 'spam' | 'copyright' | 'other';

export interface ActionResponse {
  success: boolean;
  error?: string;
  data?: {
    url?: string;
    views_count?: number;
    liked?: boolean;
  };
}

export interface ActionDetails {
  reason?: ReportReason;
  description?: string;
  score?: number;
  comment?: string;
  type?: 'link' | 'image' | 'prompt';
  referrer?: string;
} 