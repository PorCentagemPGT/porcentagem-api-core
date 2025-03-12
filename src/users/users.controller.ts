import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserResponseSchema } from './schemas/user-response.schema';

type UserResponse = Omit<User, 'password'>;

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description:
      'Creates a new user in the system. Email must be unique and password must be at least 8 characters long.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data to create',
    examples: {
      default: {
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'strongP@ssw0rd',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 422,
    description: 'Email is already in use',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns a paginated list of users. By default, returns the first 10 users.',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Number of records to skip',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    description: 'Number of records to return',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(UserResponseSchema) },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<UserResponse[]> {
    try {
      return await this.usersService.findAll(skip, take);
    } catch {
      throw new InternalServerErrorException('Error listing users');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find user by ID',
    description: 'Returns data for a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    try {
      return await this.usersService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding user');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates data for a specific user. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User data to update',
    examples: {
      default: {
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'newStrongP@ssw0rd',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Email is already in use',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes a user from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.usersService.remove(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
