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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseSchema } from './schemas/category-response.schema';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category data for creation',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CategoryResponseSchema) },
        {
          example: {
            id: 1,
            name: 'Electronics',
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
  async create(@Body() dto: CreateCategoryDto) {
    this.logger.log(`Create category request started - name: ${dto.name}`);
    try {
      const result = await this.categoriesService.create(dto);
      this.logger.log(`Category created - id: ${result.id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`Create category failed - error: ${error.message}`);
      } else {
        this.logger.warn('Create category failed - unknown error');
      }
      throw new InternalServerErrorException('Error creating category');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories listed successfully',
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(CategoryResponseSchema) },
          {
            example: {
              id: 1,
              name: 'Electronics',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    this.logger.log('List categories request started');
    try {
      const result = await this.categoriesService.findAll();
      this.logger.log(`Categories listed - count: ${result.length}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`List categories failed - error: ${error.message}`);
      } else {
        this.logger.warn(`List categories failed - unknown error`);
      }
      throw new InternalServerErrorException('Error listing categories');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CategoryResponseSchema) },
        {
          example: {
            id: 1,
            name: 'Electronics',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Find category request - id: ${id}`);
    try {
      return await this.categoriesService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Find category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Find category failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error finding category');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String,
    example: 1,
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Fields to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(CategoryResponseSchema) },
        {
          example: {
            id: 1,
            name: 'Updated Name',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-02-01T00:00:00.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    this.logger.log(`Update category request - id: ${id}`);
    try {
      return await this.categoriesService.update(id, dto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Update category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Update category failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error updating category');
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: String,
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Delete category request - id: ${id}`);
    try {
      await this.categoriesService.remove(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Delete category failed - id: ${id}, error: ${error.message}`,
        );
      } else {
        this.logger.warn(`Delete category failed - id: ${id}, unknown error`);
      }
      throw new InternalServerErrorException('Error deleting category');
    }
  }
}
