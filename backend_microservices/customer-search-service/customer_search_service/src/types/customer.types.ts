export type LoyaltyTier = 'vip' | 'gold' | 'silver';

export type SearchField = 'name' | 'email' | 'phone' | 'loyalty_card';

export interface CustomerProfile {
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_card: string;
  loyalty_tier: LoyaltyTier;
  last_activity: string;
  last_visit_store: string;
}

export interface SearchFilters {
  loyalty_tier?: LoyaltyTier[];
  store_id?: string;
}

export interface SearchRequest {
  query: string;
  search_fields?: SearchField[];
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchHighlights {
  name?: string;
  email?: string;
  phone?: string;
  loyalty_card?: string;
}

export interface SearchResult {
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  loyalty_card: string;
  loyalty_tier: LoyaltyTier;
  last_activity: string;
  last_visit_store: string;
  match_score: number;
  highlights: SearchHighlights;
}

export interface PaginationMetadata {
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface SearchResponse {
  total_results: number;
  results: SearchResult[];
  query_time_ms: number;
  pagination: PaginationMetadata;
}

export interface SearchAuditLog {
  search_id: string;
  user_id: string;
  query: string;
  filters?: Record<string, unknown>;
  result_count: number;
  query_time_ms: number;
  zero_results: boolean;
  created_at: Date;
}
