import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  InternalServerErrorException,
  HttpCode,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionResponseSchema } from './schemas/transaction-response.schema';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);

  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({
    type: CreateTransactionDto,
    description: 'Transaction data for creation',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(TransactionResponseSchema) },
        {
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            bankAccountId: '123e4567-e89b-12d3-a456-426614174001',
            date: '2025-03-10T13:24:18.000Z',
            amount: 150.75,
            type: 'income',
            categoryId: '123e4567-e89b-12d3-a456-426614174002',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() dto: CreateTransactionDto) {
    this.logger.log(`Create transaction request started - amount: ${dto.amount}, type: ${dto.type}`);
    try {
      const result = await this.transactionsService.create(dto);
      this.logger.log(`Transaction created - id: ${result.id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Create transaction failed - error: ${error.message}`);
      } else {
        this.logger.warn('Create transaction failed - unknown error');
      }
      throw new InternalServerErrorException('Error creating transaction');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip for pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions listed successfully',
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(TransactionResponseSchema) },
          {
            example: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              bankAccountId: '123e4567-e89b-12d3-a456-426614174001',
              date: '2025-03-10T13:24:18.000Z',
              amount: 150.75,
              type: 'income',
              categoryId: '123e4567-e89b-12d3-a456-426614174002',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.log('List transactions request started');
    try {
      const result = await this.transactionsService.findAll(
        skip ? +skip : undefined,
        take ? +take : undefined,
      );
      this.logger.log(`Transactions listed - count: ${result.length}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`List transactions failed - error: ${error.message}`);
      } else {
        this.logger.warn(`List transactions failed - unknown error`);
      }
      throw new InternalServerErrorException('Error listing transactions');
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get transactions by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip for pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to take for pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(TransactionResponseSchema) },
          {
            example: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              bankAccountId: '123e4567-e89b-12d3-a456-426614174001',
              date: '2025-03-10T13:24:18.000Z',
              amount: 150.75,
              type: 'income',
              categoryId: '123e4567-e89b-12d3-a456-426614174002',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    this.logger.log(`Find transactions by user ID request - userId: ${userId}`);
    try {
      const result = await this.transactionsService.findByUserId(
        userId,
        skip ? +skip : undefined,
        take ? +take : undefined,
      );
      this.logger.log(`Transactions by user ID retrieved - userId: ${userId}, count: ${result.length}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Find transactions by user ID failed - userId: ${userId}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Find transactions by user ID failed - userId: ${userId}, unknown error`);
      }
      throw new InternalServerErrorException('Error finding transactions by user ID');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(TransactionResponseSchema) },
        {
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            bankAccountId: '123e4567-e89b-12d3-a456-426614174001',
            date: '2025-03-10T13:24:18.000Z',
            amount: 150.75,
            type: 'income',
            categoryId: '123e4567-e89b-12d3-a456-426614174002',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Find transaction request - id: ${id}`);
    try {
      return await this.transactionsService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Find transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Find transaction failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error finding transaction');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateTransactionDto,
    description: 'Fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(TransactionResponseSchema) },
        {
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            bankAccountId: '123e4567-e89b-12d3-a456-426614174001',
            date: '2025-03-10T13:24:18.000Z',
            amount: 200.50,
            type: 'expense',
            categoryId: '123e4567-e89b-12d3-a456-426614174002',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-02-01T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    this.logger.log(`Update transaction request - id: ${id}`);
    try {
      return await this.transactionsService.update(id, dto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Update transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Update transaction failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error updating transaction');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Delete transaction request - id: ${id}`);
    try {
      await this.transactionsService.remove(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Delete transaction failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Delete transaction failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error deleting transaction');
    }
  }
}
