import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseSchema {
  @ApiProperty({
    description: 'Transaction unique ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Bank account ID associated with the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bankAccountId: string;

  @ApiProperty({
    description: 'Date of the transaction',
    example: '2025-03-10T13:24:18.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 150.75,
  })
  amount: number;

  @ApiProperty({
    description: 'Type of transaction (income or expense)',
    example: 'income',
    enum: ['income', 'expense'],
  })
  type: string;

  @ApiProperty({
    description: 'Category ID associated with the transaction',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Date when the transaction was created',
    example: '2025-03-10T13:24:18.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the transaction was last updated',
    example: '2025-03-12T11:00:00.000Z',
  })
  updatedAt: Date;
}
