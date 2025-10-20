import { PartialType } from '@nestjs/mapped-types';
import { CreateClaimPayeeDto, AddressDto, PaymentAccountDto } from './create-claim-payee.dto';
import { IsNotEmpty, IsArray, ValidateNested, IsOptional
 } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAddressDto extends PartialType(AddressDto) {
}

export class UpdatePaymentAccountDto extends PartialType(PaymentAccountDto) {
}

export class UpdateClaimPayeeDto extends PartialType(CreateClaimPayeeDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePaymentAccountDto)
  paymentAccounts?: (PaymentAccountDto & { id: number })[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  addresses?: (AddressDto & { id: number })[];          
}