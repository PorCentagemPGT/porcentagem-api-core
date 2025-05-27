import { Module } from '@nestjs/common';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [DatabaseService],
  controllers: [BankAccountController],
  providers: [BankAccountService],
})
export class BankAccountModule {}