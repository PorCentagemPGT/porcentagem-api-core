import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsUUID, IsIn, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    description: 'Bank account ID associated with the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Bank account ID must be a valid UUID' })
  bankAccountId?: string;

  @ApiProperty({
    description: 'Date of the transaction',
    example: '2025-03-10T13:24:18.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 150.75,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  amount?: number;

  @ApiProperty({
    description: 'Type of transaction (income or expense)',
    example: 'income',
    enum: ['income', 'expense'],
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Type must be a string' })
  @IsIn(['income', 'expense'], { message: 'Type must be either income or expense' })
  type?: string;

  @ApiProperty({
    description: 'Category ID associated with the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;
}
