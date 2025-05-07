import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly database: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log(
      `Category creation started - name: ${createCategoryDto.name}`,
    );
    try {
      const result = await this.database.category.create({
        data: createCategoryDto,
      });

      this.logger.log(`Category creation completed - id: ${result.id}`);
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Category creation failed - name: ${createCategoryDto.name}, reason: Duplicate entry`,
        );
        throw new UnprocessableEntityException('Category already exists');
      }

      if (error instanceof Error) {
        this.logger.error(`Category creation failed - error: ${error.message}`);
      } else {
        this.logger.error(`Category creation failed - unknown error`);
      }

      throw new InternalServerErrorException('Error creating category');
    }
  }

  async findAll(skip = 0, take = 10): Promise<Category[]> {
    this.logger.log(
      `List categories operation started - skip: ${skip}, take: ${take}`,
    );
    try {
      const categories = await this.database.category.findMany({
        skip,
        take,
      });

      this.logger.log(
        `List categories operation completed - count: ${categories.length}`,
      );
      return categories;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `List categories operation failed - error: ${error.message}`,
        );
      } else {
        this.logger.error('List categories operation failed - unknown error');
      }
      throw new InternalServerErrorException('Error listing categories');
    }
  }

  async findOne(id: string): Promise<Category> {
    this.logger.log(`Get category started - id: ${id}`);
    try {
      const category = await this.database.category.findUnique({
        where: { id },
      });

      if (!category) {
        this.logger.warn(`Category not found - id: ${id}`);
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      this.logger.log(`Get category completed - id: ${id}`);
      return category;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        this.logger.error(
          `Get category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Get category failed - unknown error');
      }
      throw new InternalServerErrorException('Error retrieving category');
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    this.logger.log(`Update category started - id: ${id}`);
    try {
      await this.findOne(id); // Ensures category exists

      const result = await this.database.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      this.logger.log(`Update category completed - id: ${id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Verificação para erro de duplicidade (P2002)
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Update category failed - id: ${id}, reason: Duplicate entry`,
        );
        throw new UnprocessableEntityException('Category already exists');
      }

      // Verificação geral para outros erros
      if (error instanceof Error) {
        this.logger.error(
          `Update category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Update category failed - unknown error');
      }

      throw new InternalServerErrorException('Error updating category');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Delete category started - id: ${id}`);
    try {
      await this.findOne(id); // Ensures category exists

      await this.database.category.delete({ where: { id } });

      this.logger.log(`Delete category completed - id: ${id}`);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException if it occurs
      }

      // Verificação para garantir que o erro seja uma instância de Error
      if (error instanceof Error) {
        this.logger.error(
          `Delete category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.error('Delete category failed - unknown error');
      }

      throw new InternalServerErrorException('Error deleting category');
    }
  }
}
