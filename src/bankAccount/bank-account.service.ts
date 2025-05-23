import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(private database: DatabaseService) {}

  create(userId: string, createBankAccountDto: CreateBankAccountDto) {
    return this.database.bankAccount.create({
      data: {
        ...createBankAccountDto,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.database.bankAccount.findMany({
      where: { userId },
    });
  }

  findOne(userId: string, id: string) {
    return this.database.bankAccount.findFirst({
      where: { id, userId },
    });
  }

  update(userId: string, id: string, updateBankAccountDto: UpdateBankAccountDto) {
    return this.database.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
    });
  }

  remove(userId: string, id: string) {
    return this.database.bankAccount.delete({
      where: { id },
    });
  }
}