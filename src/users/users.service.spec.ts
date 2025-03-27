/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: Omit<User, 'password'> & { password: string } = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'strongP@ssw0rd',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'John Updated',
    email: 'john.updated@example.com',
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const selectFields = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  };

  const userWithoutPassword = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      mockPrismaService.user.create.mockResolvedValue(userWithoutPassword);

      const result = await service.create(mockCreateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        expect.any(Number),
      );
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateUserDto,
          password: hashedPassword,
        },
        select: selectFields,
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should handle errors during user creation', async () => {
      mockPrismaService.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002',
          clientVersion: '2.0.0',
        }),
      );

      await expect(service.create(mockCreateUserDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [userWithoutPassword, { ...userWithoutPassword, id: '2' }];

      mockPrismaService.user.findMany.mockResolvedValue(users);

      const result = await service.findAll(0, 10);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        select: selectFields,
      });
      expect(result).toEqual(users);
    });

    it('should handle errors during findAll', async () => {
      mockPrismaService.user.findMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002',
          clientVersion: '2.0.0',
        }),
      );

      await expect(service.findAll(0, 10)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a user without password when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.findOne('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: selectFields,
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updatedUserWithoutPassword = {
        ...userWithoutPassword,
        ...mockUpdateUserDto,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.user.update.mockResolvedValue(
        updatedUserWithoutPassword,
      );

      const result = await service.update('1', mockUpdateUserDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdateUserDto,
        select: selectFields,
      });
      expect(result).toEqual(updatedUserWithoutPassword);
    });

    it('should throw NotFoundException when user to update is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('1', mockUpdateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);
      mockPrismaService.user.delete.mockResolvedValue(userWithoutPassword);

      await service.remove('1');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user to delete is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
