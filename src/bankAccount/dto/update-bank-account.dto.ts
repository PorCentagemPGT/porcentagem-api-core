import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateBankAccountDto {
  @ApiProperty({
    description: 'Bank Account name',
    example: 'My Main Account',
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({
    description: 'API Token for bank integration',
    example: 'api-token-example',
  })
  @IsOptional()
  @IsString({ message: 'API Token must be a string' })
  apiToken: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
  })
  @IsOptional()
  @IsString({ message: 'Account status must be a string' })
  accountStatus: string;

  @ApiProperty({
    description: 'Connection status with bank',
    example: 'connected',
  })
  @IsOptional()
  @IsString({ message: 'Connection status must be a string' })
  connectionStatus: string;
}
