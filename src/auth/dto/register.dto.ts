import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterUsersDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username (5-30 characters)',
    minLength: 5,
    maxLength: 30,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(30)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Valid email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd!123',
    description:
      'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (optional)',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;
}
