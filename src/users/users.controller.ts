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
  Logger,
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
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: `Creates a new user in the system with the provided data.
    
Requirements:
- Email must be unique
- Password must be at least 8 characters long
- Password must contain at least one uppercase letter, one lowercase letter, and one number
    
Notes:
- The password will be automatically hashed before storage
- The response will not include the password field`,
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data for creation',
    examples: {
      valid: {
        summary: 'Valid user data',
        description: 'Example of valid user data that meets all requirements',
        value: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'strongP@ssw0rd',
        },
      },
      invalid: {
        summary: 'Invalid user data',
        description: 'Example of invalid user data that will fail validation',
        value: {
          name: 'Jo',
          email: 'invalid-email',
          password: 'weak',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(UserResponseSchema) },
        {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: '2025-03-12T19:01:37.000Z',
            updatedAt: '2025-03-12T19:01:37.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error or email already in use',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 422 },
        message: { type: 'string', example: 'Email is already in use' },
        error: { type: 'string', example: 'Unprocessable Entity' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error creating user' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    this.logger.log(
      `Create user request started - email: ${createUserDto.email}`,
    );

    try {
      const result = await this.usersService.create(createUserDto);
      this.logger.log(`Create user request completed - userId: ${result.id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Create user request failed - email: ${createUserDto.email}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `Create user request failed - email: ${createUserDto.email}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error creating user');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: `Returns a paginated list of users.
    
Pagination:
- Uses cursor-based pagination
- Default page size is 10 users
- Maximum page size is 100 users
    
Notes:
- Users are ordered by creation date (newest first)
- Passwords are never included in the response
- Results can be empty if no users match the criteria`,
  })
  @ApiQuery({
    name: 'skip',
    description: 'Number of records to skip (offset)',
    required: false,
    type: Number,
    example: 0,
    schema: {
      minimum: 0,
      default: 0,
    },
  })
  @ApiQuery({
    name: 'take',
    description: 'Number of records to return (limit)',
    required: false,
    type: Number,
    example: 10,
    schema: {
      minimum: 1,
      maximum: 100,
      default: 10,
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Users list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(UserResponseSchema) },
          {
            example: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'John Doe',
              email: 'john@example.com',
              createdAt: '2025-03-12T19:01:37.000Z',
              updatedAt: '2025-03-12T19:01:37.000Z',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error listing users' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<UserResponse[]> {
    this.logger.log(
      `List users request started - skip: ${skip}, take: ${take}`,
    );

    try {
      const result = await this.usersService.findAll(skip, take);
      this.logger.log(`List users request completed - count: ${result.length}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(`List users request failed - error: ${error.message}`);
        throw error;
      }
      this.logger.warn('List users request failed - error: Unknown error');
      throw new InternalServerErrorException('Error listing users');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: `Retrieves detailed information about a specific user.
    
Notes:
- The ID must be a valid UUID
- The password is never included in the response
- Returns 404 if the user doesn't exist`,
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(UserResponseSchema) },
        {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: '2025-03-12T19:01:37.000Z',
            updatedAt: '2025-03-12T19:01:37.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error finding user' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    this.logger.log(`Get user request started - userId: ${id}`);

    try {
      const result = await this.usersService.findOne(id);
      this.logger.log(`Get user request completed - userId: ${id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Get user request failed - userId: ${id}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `Get user request failed - userId: ${id}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error getting user');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: `Updates information for a specific user.
    
Features:
- All fields are optional
- Only provided fields will be updated
- Email updates must be unique
- Password will be re-hashed if provided
    
Notes:
- Returns 404 if the user doesn't exist
- Returns 422 if trying to use an email that's already taken
- The password is never included in the response`,
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User data to update',
    examples: {
      fullUpdate: {
        summary: 'Full update',
        description: 'Example updating all available fields',
        value: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          password: 'newStrongP@ssw0rd',
        },
      },
      partialUpdate: {
        summary: 'Partial update',
        description: 'Example updating only the name',
        value: {
          name: 'John Updated',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(UserResponseSchema) },
        {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'John Updated',
            email: 'john.updated@example.com',
            createdAt: '2025-03-12T19:01:37.000Z',
            updatedAt: '2025-03-12T19:01:37.000Z',
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error or email already in use',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 422 },
        message: { type: 'string', example: 'Email is already in use' },
        error: { type: 'string', example: 'Unprocessable Entity' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error updating user' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    this.logger.log(`Update user request started - userId: ${id}`);

    try {
      const result = await this.usersService.update(id, updateUserDto);
      this.logger.log(`Update user request completed - userId: ${id}`);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Update user request failed - userId: ${id}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `Update user request failed - userId: ${id}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error updating user');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description: `Permanently removes a user from the system.
    
Notes:
- This operation cannot be undone
- Returns 404 if the user doesn't exist
- Returns 204 (no content) on success`,
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Error deleting user' },
        error: { type: 'string', example: 'Internal Server Error' },
      },
    },
  })
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(`Delete user request started - userId: ${id}`);

    try {
      await this.usersService.remove(id);
      this.logger.log(`Delete user request completed - userId: ${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.warn(
          `Delete user request failed - userId: ${id}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `Delete user request failed - userId: ${id}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
