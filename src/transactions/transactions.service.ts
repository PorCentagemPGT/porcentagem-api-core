/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    this.logger.log(
      `Transaction creation started - amount: ${createTransactionDto.amount}, type: ${createTransactionDto.type}`,
    );
    try {
      // Convert string date to Date object
      const data = {
        ...createTransactionDto,
        date: new Date(createTransactionDto.date),
      };

      const result = await this.database.transaction.create({
        data,
      });

      this.logger.log(`Transaction creation completed - id: ${result.id}`);
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Transaction creation failed - reason: Duplicate entry`,
        );
        throw new UnprocessableEntityException('Transaction already exists');
      }

      if (error instanceof Error) {
        this.logger.error(
          `Transaction creation failed - error: ${error.message}`,
        );
      } else {
        this.logger.error(`Transaction creation failed - unknown error`);
      }

      throw new InternalServerErrorException('Error creating transaction');
    }
  }

  async findAll(skip = 0, take = 10): Promise<Transaction[]> {
    this.logger.log(
      `List transactions operation started - skip: ${skip}, take: ${take}`,
    );
    try {
      const transactions = await this.database.transaction.findMany({
        skip,
        take,
        include: {
          category: true,
        },
      });

      this.logger.log(
        `List transactions operation completed - count: ${transactions.length}`,
      );
      return transactions;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `List transactions operation failed - error: ${error.message}`,
        );
      } else {
        this.logger.error('List transactions operation failed - unknown error');
      }
      throw new InternalServerErrorException('Error listing transactions');
    }
  }

  async findByUserId(
    userId: string,
    skip = 0,
    take = 10,
  ): Promise<Transaction[]> {
    this.logger.log(
      `Find transactions by user ID started - userId: ${userId}, skip: ${skip}, take: ${take}`,
    );
    try {
      // First, get all bank accounts for this user
      const bankAccounts = await this.database.bankAccount.findMany({
        where: { userId },
        select: { id: true },
      });

      if (bankAccounts.length === 0) {
        this.logger.warn(`No bank accounts found for user - userId: ${userId}`);
        return [];
      }

      // Get bank account IDs
      const bankAccountIds = bankAccounts.map((account) => account.id);

      // Find transactions for these bank accounts
      const transactions = await this.database.transaction.findMany({
        where: {
          bankAccountId: {
            in: bankAccountIds,
          },
        },
        skip,
        take,
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      this.logger.log(
        `Find transactions by user ID completed - userId: ${userId}, count: ${transactions.length}`,
      );
      return transactions;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Find transactions by user ID failed - userId: ${userId}, error: ${error.message}`,
        );
      } else {
        this.logger.error(
          `Find transactions by user ID failed - userId: ${userId}, unknown error`,
        );
      }
      throw new InternalServerErrorException(
        'Error finding transactions by user ID',
      );
    }
  }

  async findOne(id: string): Promise<Transaction> {
    this.logger.log(`Get transaction started - id: ${id}`);
    try {
      const transaction = await this.database.transaction.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!transaction) {
        this.logger.warn(`Transaction not found - id: ${id}`);
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      this.logger.log(`Get transaction completed - id: ${id}`);
      return transaction;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        this.logger.error(
          `Get transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Get transaction failed - unknown error');
      }
      throw new InternalServerErrorException('Error retrieving transaction');
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    this.logger.log(`Update transaction started - id: ${id}`);
    try {
      await this.findOne(id); // Ensures transaction exists

      // Convert date string to Date object if provided
      const data: any = { ...updateTransactionDto };
      if (data.date) {
        data.date = new Date(data.date);
      }

      const result = await this.database.transaction.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      });

      this.logger.log(`Update transaction completed - id: ${id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        this.logger.error(
          `Update transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Update transaction failed - unknown error');
      }

      throw new InternalServerErrorException('Error updating transaction');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Delete transaction started - id: ${id}`);
    try {
      await this.findOne(id); // Ensures transaction exists

      await this.database.transaction.delete({ where: { id } });

      this.logger.log(`Delete transaction completed - id: ${id}`);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException if it occurs
      }

      if (error instanceof Error) {
        this.logger.error(
          `Delete transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Delete transaction failed - unknown error');
      }

      throw new InternalServerErrorException('Error deleting transaction');
    }
  }
}
