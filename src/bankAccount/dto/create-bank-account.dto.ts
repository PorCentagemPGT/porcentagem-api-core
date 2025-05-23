import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({
    description: 'Bank Account name',
    example: 'My Main Account',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'API Token for bank integration',
    example: 'api-token-example',
  })
  @IsString()
  @IsNotEmpty()
  apiToken: string;

  @ApiProperty({
    description: 'Account status',
    example: 'active',
  })
  @IsString()
  @IsNotEmpty()
  accountStatus: string;

  @ApiProperty({
    description: 'Connection status with bank',
    example: 'connected',
  })
  @IsString()
  @IsNotEmpty()
  connectionStatus: string;
}