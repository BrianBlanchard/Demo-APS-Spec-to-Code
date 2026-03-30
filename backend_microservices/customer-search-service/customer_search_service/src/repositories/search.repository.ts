import { ElasticsearchClient, elasticsearchClient } from './elasticsearch.client';
import { SearchRequest, SearchResult, SearchHighlights } from '../types/customer.types';
import { config } from '../config';
import { logger } from '../utils/logger';
import { getPhoneVariations } from '../utils/phone.utils';
import { isEmailLike, isPhoneLike } from '../utils/query.utils';

export interface ISearchRepository {
  searchCustomers(request: SearchRequest): Promise<SearchResult[]>;
  isAvailable(): Promise<boolean>;
}

export class SearchRepository implements ISearchRepository {
  constructor(private esClient: ElasticsearchClient = elasticsearchClient) {}

  async searchCustomers(request: SearchRequest): Promise<SearchResult[]> {
    const { query, search_fields, filters, limit = 10, offset = 0 } = request;

    const client = this.esClient.getClient();

    // Determine which fields to search
    const fieldsToSearch = search_fields || ['name', 'email', 'phone', 'loyalty_card'];

    // Build query based on input pattern
    const mustQueries: any[] = [];

    if (isEmailLike(query)) {
      mustQueries.push({
        match: {
          email: {
            query,
            fuzziness: 0,
          },
        },
      });
    } else if (isPhoneLike(query)) {
      const phoneVariations = getPhoneVariations(query);
      mustQueries.push({
        terms: {
          phone: phoneVariations,
        },
      });
    } else {
      // General multi-field search with fuzzy matching
      const multiMatchFields = fieldsToSearch.map((field) => {
        if (field === 'name') {
          return ['first_name^2', 'last_name^2']; // Boost name fields
        }
        return field;
      }).flat();

      mustQueries.push({
        multi_match: {
          query,
          fields: multiMatchFields,
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    }

    // Add filters
    const filterQueries: any[] = [];

    if (filters?.loyalty_tier && filters.loyalty_tier.length > 0) {
      filterQueries.push({
        terms: {
          loyalty_tier: filters.loyalty_tier,
        },
      });
    }

    if (filters?.store_id) {
      filterQueries.push({
        term: {
          last_visit_store: filters.store_id,
        },
      });
    }

    const searchBody = {
      query: {
        bool: {
          must: mustQueries,
          filter: filterQueries,
        },
      },
      from: offset,
      size: limit,
      sort: [
        { _score: { order: 'desc' as const } },
        { last_activity: { order: 'desc' as const } },
      ],
      highlight: {
        fields: {
          first_name: {},
          last_name: {},
          email: {},
          phone: {},
          loyalty_card: {},
        },
        pre_tags: ['<em>'],
        post_tags: ['</em>'],
      },
    };

    try {
      const result = await client.search({
        index: config.elasticsearch.index,
        body: searchBody as any,
      });

      const hits = result.hits.hits;

      return hits.map((hit: any) => {
        const source = hit._source;
        const highlights: SearchHighlights = {};

        if (hit.highlight) {
          if (hit.highlight.first_name || hit.highlight.last_name) {
            const firstName = hit.highlight.first_name?.[0] || source.first_name;
            const lastName = hit.highlight.last_name?.[0] || source.last_name;
            highlights.name = `${firstName} ${lastName}`;
          }
          if (hit.highlight.email) {
            highlights.email = hit.highlight.email[0];
          }
          if (hit.highlight.phone) {
            highlights.phone = hit.highlight.phone[0];
          }
          if (hit.highlight.loyalty_card) {
            highlights.loyalty_card = hit.highlight.loyalty_card[0];
          }
        }

        return {
          profile_id: source.profile_id,
          first_name: source.first_name,
          last_name: source.last_name,
          email: source.email,
          phone: source.phone,
          loyalty_card: source.loyalty_card,
          loyalty_tier: source.loyalty_tier,
          last_activity: source.last_activity,
          last_visit_store: source.last_visit_store,
          match_score: Math.min((hit._score || 0) * 10, 100), // Normalize to 0-100
          highlights,
        };
      });
    } catch (error) {
      logger.error({ error, query }, 'Elasticsearch search failed');
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.esClient.healthCheck();
  }
}
