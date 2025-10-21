import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// ========== PaymentAccount DTO ==========
export class PaymentAccountDto {
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  accountType?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

// ========== Address DTO ==========
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}

// ========== Main ClaimPayee DTO ==========
export class CreateClaimPayeeDto {
  @IsOptional()
  @IsString()
  claimPayeeType?: string;

  @IsString()
  @IsNotEmpty()
  claimPayeeName: string;

  @IsOptional()
  @IsString()
  claimPayeeCode?: string;

  @IsOptional()
  @IsString()
  legalEntityType?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsPhoneNumber('VN')
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAccountDto)
  paymentAccounts?: PaymentAccountDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  createdBy?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  updatedBy?: number;
}
