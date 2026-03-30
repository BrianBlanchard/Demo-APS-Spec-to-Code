import { CustomerEntity, AccountEntity } from '../types/entities';
import { CustomerDTO, AccountDTO, CustomerStatus, UserRole } from '../types/dtos';
import { maskSSN, maskGovernmentId, shouldShowFicoScore } from './masking';

export function mapCustomerEntityToDTO(
  entity: CustomerEntity,
  role: UserRole,
  accounts?: AccountEntity[]
): CustomerDTO {
  const dto: CustomerDTO = {
    customerId: entity.customer_id,
    firstName: entity.first_name,
    middleName: entity.middle_name,
    lastName: entity.last_name,
    dateOfBirth: entity.date_of_birth.toISOString().split('T')[0],
    ssn: maskSSN(entity.ssn, role),
    governmentId: maskGovernmentId(entity.government_id, role),
    addressLine1: entity.address_line1,
    addressLine2: entity.address_line2,
    city: entity.city,
    state: entity.state,
    zipCode: entity.zip_code,
    country: entity.country,
    phone1: entity.phone1,
    phone2: entity.phone2,
    eftAccountId: entity.eft_account_id,
    isPrimaryCardholder: entity.is_primary_cardholder,
    status: entity.status as CustomerStatus,
    createdAt: entity.created_at.toISOString(),
    updatedAt: entity.updated_at.toISOString(),
  };

  if (shouldShowFicoScore(role)) {
    dto.ficoScore = entity.fico_score;
  }

  if (accounts && accounts.length > 0) {
    dto.accounts = accounts.map(mapAccountEntityToDTO);
  }

  return dto;
}

export function mapAccountEntityToDTO(entity: AccountEntity): AccountDTO {
  return {
    accountId: entity.account_id,
    status: entity.status,
    balance: Number(entity.balance),
  };
}
