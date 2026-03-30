import { Pool } from 'pg';
import { DisclosureGroup } from '../types/entities';

export interface DisclosureGroupRepository {
  findByCode(code: string): Promise<DisclosureGroup | null>;
}

export class DisclosureGroupRepositoryImpl implements DisclosureGroupRepository {
  constructor(private readonly pool: Pool) {}

  async findByCode(code: string): Promise<DisclosureGroup | null> {
    const query = `
      SELECT id, disclosure_group_code, description
      FROM disclosure_groups
      WHERE disclosure_group_code = $1
    `;

    const result = await this.pool.query<DisclosureGroup>(query, [code]);
    return result.rows[0] || null;
  }
}
