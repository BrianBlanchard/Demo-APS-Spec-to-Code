import { Knex } from 'knex';
import { EmailTemplate } from '../entities/email-notification.entity';
import { NotFoundError } from '../errors/custom-errors';

export interface IEmailTemplateRepository {
  findByTemplateId(templateId: string): Promise<EmailTemplate>;
}

export class EmailTemplateRepository implements IEmailTemplateRepository {
  private readonly tableName = 'email_templates';

  constructor(private readonly db: Knex) {}

  async findByTemplateId(templateId: string): Promise<EmailTemplate> {
    const row = await this.db(this.tableName).where({ template_id: templateId }).first();

    if (!row) {
      throw new NotFoundError(`Template with ID '${templateId}' not found`, 'TEMPLATE_NOT_FOUND');
    }

    return {
      id: row.id,
      templateId: row.template_id,
      subject: row.subject,
      htmlContent: row.html_content,
      textContent: row.text_content,
      requiredFields: Array.isArray(row.required_fields)
        ? row.required_fields
        : JSON.parse(row.required_fields),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
