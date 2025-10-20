import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAccountDto {
  @IsString() accountName: string;
  @IsString() accountNumber: string;
  @IsString() paymentMethod: string;
  @IsOptional() accountType?: string;
  @IsEmail()
  @IsEmail()
  email?: string;
}

export class AddressDto {
  @IsString() type: string;
  @IsString() street: string;
  @IsString() city: string;
  @IsString() state: string;
  @IsString() postalCode: string;
  @IsOptional() country?: string;
}

export class CreateClaimPayeeDto {
  @IsOptional() claimPayeeType?: string;
  @IsString() claimPayeeName: string;
  @IsOptional() claimPayeeCode?: string;
  @IsOptional() legalEntityType?: string;
  @IsOptional() taxId?: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() phone: string;
  @IsOptional() email?: string;
  @IsOptional() notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAccountDto)
  paymentAccounts: PaymentAccountDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];
}

