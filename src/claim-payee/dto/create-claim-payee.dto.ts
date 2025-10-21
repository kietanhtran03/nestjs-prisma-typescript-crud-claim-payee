import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========== PaymentAccount DTO ==========
export class PaymentAccountDto {
  @ApiProperty({ example: 'Primary Checking Account' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'ACH', description: 'ACH, Wire, Check, etc.' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'checking' })
  @IsOptional()
  @IsString()
  accountType?: string;

  @ApiPropertyOptional({ example: 'Vietcombank' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'SWIFT123' })
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiPropertyOptional({ example: 'payment@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// ========== Address DTO ==========
export class AddressDto {
  @ApiProperty({ example: 'billing', description: 'billing, shipping, mailing' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  street2?: string;

  @ApiProperty({ example: 'Da Nang' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Da Nang City' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '550000' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ example: 'Vietnam', default: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 16.0544 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 108.2022 })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ========== Main ClaimPayee DTO ==========
export class CreateClaimPayeeDto {
  @ApiPropertyOptional({ example: 'Corporate' })
  @IsOptional()
  @IsString()
  claimPayeeType?: string;

  @ApiProperty({ example: 'ABC Insurance Company' })
  @IsString()
  @IsNotEmpty()
  claimPayeeName: string;

  @ApiPropertyOptional({ example: 'ABC001' })
  @IsOptional()
  @IsString()
  claimPayeeCode?: string;

  @ApiPropertyOptional({ example: 'LLC' })
  @IsOptional()
  @IsString()
  legalEntityType?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+84123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Important client notes here' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [PaymentAccountDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAccountDto)
  paymentAccounts?: PaymentAccountDto[];

  @ApiPropertyOptional({ type: [AddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}