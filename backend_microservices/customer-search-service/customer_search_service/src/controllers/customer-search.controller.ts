import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ICustomerSearchService, CustomerSearchService } from '../services/customer-search.service';
import { getContext } from '../middleware/context.middleware';
import { UnauthorizedError } from '../types/error.types';

const searchQuerySchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  search_fields: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined))
    .pipe(
      z
        .array(z.enum(['name', 'email', 'phone', 'loyalty_card']))
        .optional()
    ),
  loyalty_tier: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined))
    .pipe(
      z
        .array(z.enum(['vip', 'gold', 'silver']))
        .optional()
    ),
  store_id: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(50)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;

export class CustomerSearchController {
  constructor(private searchService: ICustomerSearchService = new CustomerSearchService()) {}

  searchCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const context = getContext();
      const userId = context?.userId;

      if (!userId) {
        throw new UnauthorizedError('User ID not found in request context');
      }

      const validatedQuery = searchQuerySchema.parse(req.query);

      const searchRequest = {
        query: validatedQuery.query,
        search_fields: validatedQuery.search_fields,
        filters: {
          loyalty_tier: validatedQuery.loyalty_tier,
          store_id: validatedQuery.store_id,
        },
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
      };

      const response = await this.searchService.searchCustomers(searchRequest, userId);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
