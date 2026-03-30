import { TemplateProcessor } from '../template-processor';

describe('TemplateProcessor', () => {
  describe('populateTemplate', () => {
    it('should replace simple placeholders', () => {
      const template = 'Hello {{name}}';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Hello John');
    });

    it('should replace multiple placeholders', () => {
      const template = 'Hello {{firstName}} {{lastName}}';
      const data = { firstName: 'John', lastName: 'Doe' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Hello John Doe');
    });

    it('should handle placeholders with spaces', () => {
      const template = 'Hello {{ name }}';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Hello John');
    });

    it('should replace same placeholder multiple times', () => {
      const template = '{{name}} is {{name}}';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('John is John');
    });

    it('should handle numeric values', () => {
      const template = 'Amount: ${{amount}}';
      const data = { amount: 100.50 };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Amount: $100.5');
    });

    it('should handle boolean values', () => {
      const template = 'Active: {{isActive}}';
      const data = { isActive: true };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Active: true');
    });

    it('should leave unknown placeholders unchanged', () => {
      const template = 'Hello {{name}}, your {{missing}} is ready';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Hello John, your {{missing}} is ready');
    });

    it('should handle empty template', () => {
      const template = '';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('');
    });

    it('should handle template with no placeholders', () => {
      const template = 'Static text with no placeholders';
      const data = { name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Static text with no placeholders');
    });

    it('should handle empty data object', () => {
      const template = 'Hello {{name}}';
      const data = {};

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Hello {{name}}');
    });

    it('should handle complex HTML templates', () => {
      const template = '<html><body><h1>{{title}}</h1><p>Dear {{name}},</p></body></html>';
      const data = { title: 'Welcome', name: 'John' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('<html><body><h1>Welcome</h1><p>Dear John,</p></body></html>');
    });

    it('should handle special characters in values', () => {
      const template = 'Email: {{email}}';
      const data = { email: 'john+tag@example.com' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Email: john+tag@example.com');
    });

    it('should handle nested object values as strings', () => {
      const template = 'User: {{user}}';
      const data = { user: { name: 'John', age: 30 } };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('User: [object Object]');
    });

    it('should handle array values as strings', () => {
      const template = 'Items: {{items}}';
      const data = { items: ['apple', 'banana', 'orange'] };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Items: apple,banana,orange');
    });

    it('should handle zero values', () => {
      const template = 'Count: {{count}}';
      const data = { count: 0 };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Count: 0');
    });

    it('should handle null values', () => {
      const template = 'Value: {{value}}';
      const data = { value: null };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Value: null');
    });

    it('should handle undefined values', () => {
      const template = 'Value: {{value}}';
      const data = { value: undefined };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Value: undefined');
    });

    it('should handle long templates with many placeholders', () => {
      const template = 'a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g{{7}}h{{8}}i{{9}}j{{10}}';
      const data = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I', 10: 'J' };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('aAbBcCdDeEfFgGhHiIjJ');
    });

    it('should handle payment confirmation template', () => {
      const template = 'Dear {{customerName}}, your payment of ${{paymentAmount}} has been confirmed. Confirmation: {{confirmationNumber}}';
      const data = {
        customerName: 'John Anderson',
        paymentAmount: 2450.75,
        confirmationNumber: 'PAY-20240115-ABC123'
      };

      const result = TemplateProcessor.populateTemplate(template, data);

      expect(result).toBe('Dear John Anderson, your payment of $2450.75 has been confirmed. Confirmation: PAY-20240115-ABC123');
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty array when all fields are present', () => {
      const data = { field1: 'value1', field2: 'value2' };
      const required = ['field1', 'field2'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should return missing field names', () => {
      const data = { field1: 'value1' };
      const required = ['field1', 'field2', 'field3'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['field2', 'field3']);
    });

    it('should detect null values as missing', () => {
      const data = { field1: 'value1', field2: null };
      const required = ['field1', 'field2'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['field2']);
    });

    it('should detect undefined values as missing', () => {
      const data = { field1: 'value1', field2: undefined };
      const required = ['field1', 'field2'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['field2']);
    });

    it('should accept zero as valid value', () => {
      const data = { field1: 0 };
      const required = ['field1'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should accept false as valid value', () => {
      const data = { field1: false };
      const required = ['field1'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should accept empty string as valid value', () => {
      const data = { field1: '' };
      const required = ['field1'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should handle empty required fields array', () => {
      const data = { field1: 'value1' };
      const required: string[] = [];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should handle empty data object', () => {
      const data = {};
      const required = ['field1', 'field2'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['field1', 'field2']);
    });

    it('should handle multiple missing fields in order', () => {
      const data = { field2: 'value2' };
      const required = ['field1', 'field2', 'field3', 'field4'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['field1', 'field3', 'field4']);
    });

    it('should validate payment confirmation fields', () => {
      const data = {
        customerName: 'John Anderson',
        paymentAmount: 2450.75,
        confirmationNumber: 'PAY-123'
      };
      const required = ['customerName', 'paymentAmount', 'confirmationNumber', 'paymentDate'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual(['paymentDate']);
    });

    it('should handle nested objects as valid values', () => {
      const data = { field1: { nested: 'value' } };
      const required = ['field1'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should handle arrays as valid values', () => {
      const data = { field1: ['item1', 'item2'] };
      const required = ['field1'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing).toEqual([]);
    });

    it('should handle large number of fields', () => {
      const data: Record<string, unknown> = {};
      const required: string[] = [];

      for (let i = 1; i <= 50; i++) {
        required.push(`field${i}`);
        if (i % 2 === 0) {
          data[`field${i}`] = `value${i}`;
        }
      }

      const missing = TemplateProcessor.validateRequiredFields(data, required);

      expect(missing.length).toBe(25);
      expect(missing).toContain('field1');
      expect(missing).not.toContain('field2');
    });
  });

  describe('Integration tests', () => {
    it('should validate and populate template together', () => {
      const template = 'Hello {{name}}, your balance is ${{balance}}';
      const data = { name: 'John', balance: 100.50 };
      const required = ['name', 'balance'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);
      expect(missing).toEqual([]);

      const result = TemplateProcessor.populateTemplate(template, data);
      expect(result).toBe('Hello John, your balance is $100.5');
    });

    it('should detect missing fields before population', () => {
      const template = 'Hello {{name}}, your balance is ${{balance}}';
      const data = { name: 'John' };
      const required = ['name', 'balance'];

      const missing = TemplateProcessor.validateRequiredFields(data, required);
      expect(missing).toEqual(['balance']);

      const result = TemplateProcessor.populateTemplate(template, data);
      expect(result).toBe('Hello John, your balance is ${{balance}}');
    });
  });
});
