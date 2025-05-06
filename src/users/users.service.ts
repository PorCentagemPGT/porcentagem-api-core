import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidateCredentialsDto } from './dto/validate-credentials.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserResponseSchema } from './schemas/user-response.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly database: DatabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    this.logger.log('Password hashing started');
    try {
      const result = await bcrypt.hash(password, 10);
      this.logger.log('Password hashing completed');
      return result;
    } catch {
      this.logger.warn('Password hashing failed');
      throw new InternalServerErrorException('Error hashing password');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    this.logger.log(`User creation started - email: ${createUserDto.email}`);
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);

      const result = await this.database.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User creation completed - userId: ${result.id}`);
      return result;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `User creation failed - email: ${createUserDto.email}, error: Email already in use`,
        );
        throw new UnprocessableEntityException('Email is already in use');
      }
      if (error instanceof InternalServerErrorException) {
        this.logger.warn(
          `User creation failed - email: ${createUserDto.email}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `User creation failed - email: ${createUserDto.email}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll(skip = 0, take = 10): Promise<Omit<User, 'password'>[]> {
    this.logger.log(
      `List users operation started - skip: ${skip}, take: ${take}`,
    );
    try {
      const result = await this.database.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      this.logger.log(
        `List users operation completed - count: ${result.length}`,
      );
      return result;
    } catch {
      this.logger.warn('List users operation failed - error: Database error');
      throw new InternalServerErrorException('Error listing users');
    }
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    this.logger.log(`Get user operation started - userId: ${id}`);
    try {
      const user = await this.database.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(
          `Get user operation failed - userId: ${id}, error: User not found`,
        );
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`Get user operation completed - userId: ${id}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.warn(
        `Get user operation failed - userId: ${id}, error: Database error`,
      );
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async findOneByEmail(email: string): Promise<Omit<User, 'password'>> {
    this.logger.log(`Get user operation started - email: ${email}`);
    try {
      const user = await this.database.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        this.logger.warn(
          `Get user operation failed - email: ${email}, error: User not found`,
        );
        throw new NotFoundException(`User with email ${email} not found`);
      }

      this.logger.log(`Get user operation completed - email: ${email}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.warn(
        `Get user operation failed - email: ${email}, error: Database error`,
      );
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    this.logger.log(`Update user operation started - userId: ${id}`);
    try {
      // Check if user exists
      await this.findOne(id);

      const data: Partial<User> = { ...updateUserDto };

      if (updateUserDto.password) {
        data.password = await this.hashPassword(updateUserDto.password);
      }

      const result = await this.database.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Update user operation completed - userId: ${id}`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Update user operation failed - userId: ${id}, error: Email already in use`,
        );
        throw new UnprocessableEntityException('Email is already in use');
      }
      if (error instanceof InternalServerErrorException) {
        this.logger.warn(
          `Update user operation failed - userId: ${id}, error: ${error.message}`,
        );
        throw error;
      }
      this.logger.warn(
        `Update user operation failed - userId: ${id}, error: Unknown error`,
      );
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Delete user operation started - userId: ${id}`);
    try {
      await this.findOne(id); // Check if user exists
      await this.database.user.delete({ where: { id } });
      this.logger.log(`Delete user operation completed - userId: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.warn(
        `Delete user operation failed - userId: ${id}, error: Database error`,
      );
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async validateCredentials(
    dto: ValidateCredentialsDto,
  ): Promise<UserResponseSchema> {
    this.logger.log(`Validate credentials started - email: ${dto.email}`);

    const user = await this.database.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Looked for user in database`);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Found user in database`);

    try {
      this.logger.log(`Starting password comparison`);
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      this.logger.log(`Password comparison completed`);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error comparing passwords: ${errorMessage}`);
      throw new InternalServerErrorException('Error validating credentials');
    }

    this.logger.log(`Validate credentials completed - userId: ${user.id}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
