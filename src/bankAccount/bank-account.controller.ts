import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { BankAccountService } from './bank-account.service';
  import { CreateBankAccountDto } from './dto/create-bank-account.dto';
  import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
  
  @ApiBearerAuth()
  @ApiTags('bank-accounts')
  @Controller('bank-accounts')
  export class BankAccountController {
    constructor(private readonly bankAccountService: BankAccountService) {}
  
    @Post()
    create(userId: string, @Body() createBankAccountDto: CreateBankAccountDto) {
      return this.bankAccountService.create(userId, createBankAccountDto);
    }
  
    @Get()
    findAll(userId: string) {
      return this.bankAccountService.findAll(userId);
    }
  
    @Get(':id')
    findOne(userId: string, @Param('id') id: string) {
      return this.bankAccountService.findOne(userId, id);
    }
  
    @Patch(':id')
    update(
      userId: string,
      @Param('id') id: string,
      @Body() updateBankAccountDto: UpdateBankAccountDto,
    ) {
      return this.bankAccountService.update(userId, id, updateBankAccountDto);
    }
  
    @Delete(':id')
    remove(userId: string, @Param('id') id: string) {
      return this.bankAccountService.remove(userId, id);
    }
  }