import type { TransactionCategory } from '../../src/entities/transaction-category.entity';

describe('TransactionCategory Entity', () => {
  it('should create a valid transaction category entity', () => {
    const category: TransactionCategory = {
      categoryCode: '5411',
      categoryName: 'Grocery Stores',
      transactionType: '01',
      categoryGroup: 'retail',
      interestRate: 18.99,
      rewardsEligible: true,
      rewardsRate: 1.5,
    };

    expect(category.categoryCode).toBe('5411');
    expect(category.categoryName).toBe('Grocery Stores');
    expect(category.transactionType).toBe('01');
    expect(category.categoryGroup).toBe('retail');
    expect(category.interestRate).toBe(18.99);
    expect(category.rewardsEligible).toBe(true);
    expect(category.rewardsRate).toBe(1.5);
  });

  it('should support category with no rewards', () => {
    const category: TransactionCategory = {
      categoryCode: '4900',
      categoryName: 'Utilities',
      transactionType: '01',
      categoryGroup: 'services',
      interestRate: 18.99,
      rewardsEligible: false,
      rewardsRate: 0.0,
    };

    expect(category.rewardsEligible).toBe(false);
    expect(category.rewardsRate).toBe(0.0);
  });

  it('should support cash advance category', () => {
    const category: TransactionCategory = {
      categoryCode: '6011',
      categoryName: 'Cash Advance',
      transactionType: '02',
      categoryGroup: 'cash',
      interestRate: 24.99,
      rewardsEligible: false,
      rewardsRate: 0.0,
    };

    expect(category.transactionType).toBe('02');
    expect(category.interestRate).toBe(24.99);
  });

  it('should support default/other category', () => {
    const category: TransactionCategory = {
      categoryCode: '9999',
      categoryName: 'Other',
      transactionType: '01',
      categoryGroup: 'other',
      interestRate: 19.99,
      rewardsEligible: false,
      rewardsRate: 0.0,
    };

    expect(category.categoryCode).toBe('9999');
    expect(category.categoryName).toBe('Other');
    expect(category.categoryGroup).toBe('other');
  });

  it('should support restaurant category with high rewards', () => {
    const category: TransactionCategory = {
      categoryCode: '5812',
      categoryName: 'Eating Places and Restaurants',
      transactionType: '01',
      categoryGroup: 'retail',
      interestRate: 18.99,
      rewardsEligible: true,
      rewardsRate: 2.0,
    };

    expect(category.categoryName).toBe('Eating Places and Restaurants');
    expect(category.rewardsRate).toBe(2.0);
  });

  it('should support gas station category with highest rewards', () => {
    const category: TransactionCategory = {
      categoryCode: '5541',
      categoryName: 'Service Stations',
      transactionType: '01',
      categoryGroup: 'retail',
      interestRate: 18.99,
      rewardsEligible: true,
      rewardsRate: 3.0,
    };

    expect(category.categoryCode).toBe('5541');
    expect(category.rewardsRate).toBe(3.0);
  });

  it('should support all transaction types', () => {
    const transactionTypes = ['01', '02', '03', '04', '05', '06'];

    transactionTypes.forEach((type) => {
      const category: TransactionCategory = {
        categoryCode: '0000',
        categoryName: 'Test Category',
        transactionType: type,
        categoryGroup: 'test',
        interestRate: 20.0,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      expect(category.transactionType).toBe(type);
    });
  });

  it('should support various category groups', () => {
    const groups = ['retail', 'services', 'cash', 'other'];

    groups.forEach((group) => {
      const category: TransactionCategory = {
        categoryCode: '0000',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: group,
        interestRate: 20.0,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      expect(category.categoryGroup).toBe(group);
    });
  });

  it('should support varying interest rates', () => {
    const rates = [0.0, 10.0, 18.99, 19.99, 24.99, 29.99];

    rates.forEach((rate) => {
      const category: TransactionCategory = {
        categoryCode: '0000',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: rate,
        rewardsEligible: false,
        rewardsRate: 0.0,
      };

      expect(category.interestRate).toBe(rate);
    });
  });

  it('should support varying rewards rates', () => {
    const rates = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 5.0];

    rates.forEach((rate) => {
      const category: TransactionCategory = {
        categoryCode: '0000',
        categoryName: 'Test Category',
        transactionType: '01',
        categoryGroup: 'test',
        interestRate: 20.0,
        rewardsEligible: rate > 0,
        rewardsRate: rate,
      };

      expect(category.rewardsRate).toBe(rate);
      expect(category.rewardsEligible).toBe(rate > 0);
    });
  });

  it('should allow modification of entity properties', () => {
    const category: TransactionCategory = {
      categoryCode: '5411',
      categoryName: 'Grocery Stores',
      transactionType: '01',
      categoryGroup: 'retail',
      interestRate: 18.99,
      rewardsEligible: true,
      rewardsRate: 1.5,
    };

    // Entities are mutable interfaces, not immutable
    category.interestRate = 19.99;
    category.rewardsRate = 2.0;

    expect(category.interestRate).toBe(19.99);
    expect(category.rewardsRate).toBe(2.0);
  });

  it('should handle all fields correctly when creating multiple entities', () => {
    const categories: TransactionCategory[] = [
      {
        categoryCode: '5411',
        categoryName: 'Grocery Stores',
        transactionType: '01',
        categoryGroup: 'retail',
        interestRate: 18.99,
        rewardsEligible: true,
        rewardsRate: 1.5,
      },
      {
        categoryCode: '5812',
        categoryName: 'Restaurants',
        transactionType: '01',
        categoryGroup: 'retail',
        interestRate: 18.99,
        rewardsEligible: true,
        rewardsRate: 2.0,
      },
      {
        categoryCode: '6011',
        categoryName: 'Cash Advance',
        transactionType: '02',
        categoryGroup: 'cash',
        interestRate: 24.99,
        rewardsEligible: false,
        rewardsRate: 0.0,
      },
    ];

    expect(categories).toHaveLength(3);
    expect(categories[0].categoryCode).toBe('5411');
    expect(categories[1].categoryCode).toBe('5812');
    expect(categories[2].categoryCode).toBe('6011');
  });
});
