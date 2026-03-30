export class TemplateProcessor {
  static populateTemplate(template: string, data: Record<string, unknown>): string {
    let result = template;

    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, String(value));
    }

    return result;
  }

  static validateRequiredFields(
    data: Record<string, unknown>,
    requiredFields: string[]
  ): string[] {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        missing.push(field);
      }
    }

    return missing;
  }
}
