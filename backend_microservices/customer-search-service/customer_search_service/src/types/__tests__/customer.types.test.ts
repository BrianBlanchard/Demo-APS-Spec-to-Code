import {
  LoyaltyTier,
  SearchField,
  CustomerProfile,
  SearchFilters,
  SearchRequest,
  SearchResult,
  SearchResponse,
} from '../customer.types';

describe('Customer Types', () => {
  describe('LoyaltyTier', () => {
    it('should allow valid loyalty tier values', () => {
      const tiers: LoyaltyTier[] = ['vip', 'gold', 'silver'];
      expect(tiers).toHaveLength(3);
      expect(tiers).toContain('vip');
      expect(tiers).toContain('gold');
      expect(tiers).toContain('silver');
    });
  });

  describe('SearchField', () => {
    it('should allow valid search field values', () => {
      const fields: SearchField[] = ['name', 'email', 'phone', 'loyalty_card'];
      expect(fields).toHaveLength(4);
      expect(fields).toContain('name');
      expect(fields).toContain('email');
      expect(fields).toContain('phone');
      expect(fields).toContain('loyalty_card');
    });
  });

  describe('CustomerProfile', () => {
    it('should create a valid customer profile', () => {
      const profile: CustomerProfile = {
        profile_id: '550e8400-e29b-41d4-a716-446655440001',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '+14155551234',
        loyalty_card: 'PGA12345678',
        loyalty_tier: 'vip',
        last_activity: '2026-03-25T18:45:00Z',
        last_visit_store: 'store-123',
      };

      expect(profile.profile_id).toBeDefined();
      expect(profile.first_name).toBe('John');
      expect(profile.loyalty_tier).toBe('vip');
    });
  });

  describe('SearchFilters', () => {
    it('should create filters with loyalty tier', () => {
      const filters: SearchFilters = {
        loyalty_tier: ['vip', 'gold'],
      };

      expect(filters.loyalty_tier).toHaveLength(2);
      expect(filters.loyalty_tier).toContain('vip');
    });

    it('should create filters with store id', () => {
      const filters: SearchFilters = {
        store_id: 'store-123',
      };

      expect(filters.store_id).toBe('store-123');
    });

    it('should create filters with both loyalty tier and store id', () => {
      const filters: SearchFilters = {
        loyalty_tier: ['vip'],
        store_id: 'store-123',
      };

      expect(filters.loyalty_tier).toHaveLength(1);
      expect(filters.store_id).toBe('store-123');
    });
  });

  describe('SearchRequest', () => {
    it('should create a minimal search request', () => {
      const request: SearchRequest = {
        query: 'john smith',
      };

      expect(request.query).toBe('john smith');
      expect(request.search_fields).toBeUndefined();
      expect(request.filters).toBeUndefined();
      expect(request.limit).toBeUndefined();
      expect(request.offset).toBeUndefined();
    });

    it('should create a complete search request', () => {
      const request: SearchRequest = {
        query: 'john smith',
        search_fields: ['name', 'email'],
        filters: {
          loyalty_tier: ['vip', 'gold'],
          store_id: 'store-123',
        },
        limit: 10,
        offset: 0,
      };

      expect(request.query).toBe('john smith');
      expect(request.search_fields).toHaveLength(2);
      expect(request.filters?.loyalty_tier).toContain('vip');
      expect(request.limit).toBe(10);
      expect(request.offset).toBe(0);
    });
  });

  describe('SearchResult', () => {
    it('should create a valid search result', () => {
      const result: SearchResult = {
        profile_id: '550e8400-e29b-41d4-a716-446655440001',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        phone: '+14155551234',
        loyalty_card: 'PGA12345678',
        loyalty_tier: 'vip',
        last_activity: '2026-03-25T18:45:00Z',
        last_visit_store: 'store-123',
        match_score: 98.5,
        highlights: {
          name: '<em>John Smith</em>',
        },
      };

      expect(result.match_score).toBe(98.5);
      expect(result.highlights.name).toContain('<em>');
    });
  });

  describe('SearchResponse', () => {
    it('should create a valid search response', () => {
      const response: SearchResponse = {
        total_results: 2,
        results: [
          {
            profile_id: '550e8400-e29b-41d4-a716-446655440001',
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            phone: '+14155551234',
            loyalty_card: 'PGA12345678',
            loyalty_tier: 'vip',
            last_activity: '2026-03-25T18:45:00Z',
            last_visit_store: 'store-123',
            match_score: 98.5,
            highlights: {},
          },
        ],
        query_time_ms: 145,
        pagination: {
          limit: 10,
          offset: 0,
          has_more: false,
        },
      };

      expect(response.total_results).toBe(2);
      expect(response.results).toHaveLength(1);
      expect(response.query_time_ms).toBe(145);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.has_more).toBe(false);
    });
  });
});
