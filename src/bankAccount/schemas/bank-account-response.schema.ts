import { ApiProperty } from '@nestjs/swagger';

export class BankAccountResponseSchema {
  @ApiProperty({
    description: 'Bank Account unique ID',
    example: 'uuid-example',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns this bank account',
    example: 'user-uuid-example',
  })
  userId: string;

  @ApiProperty({
    description: 'Bank Account name',
    example: 'My Main Account',
  })
  name: string;

  @ApiProperty({
    description: 'API Token for bank integration',
    example: 'api-token-example',
  })
  apiToken: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
  })
  accountStatus: string;

  @ApiProperty({
    description: 'Connection status with bank',
    example: 'connected',
  })
  connectionStatus: string;

  @ApiProperty({
    description: 'Date when the bank account was created',
    example: '2025-05-18T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the bank account was last updated',
    example: '2025-05-18T10:00:00.000Z',
  })
  updatedAt: Date;
}