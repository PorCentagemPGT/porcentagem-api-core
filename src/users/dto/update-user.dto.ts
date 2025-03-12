import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Updated',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Email address of the user (must be unique)',
    example: 'john.updated@example.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({
    description: `User's password. Must contain:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    
Note: If provided, the password will be re-hashed before storage`,
    example: 'newStrongP@ssw0rd',
    format: 'password',
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password?: string;
}
