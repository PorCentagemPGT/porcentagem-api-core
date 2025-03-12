import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  NotFoundException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strongP@ssw0rd',
    };

    it('should create a user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnprocessableEntityException when email is already in use', async () => {
      mockUsersService.create.mockRejectedValue(
        new UnprocessableEntityException('Email is already in use'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.create.mockRejectedValue(
        new InternalServerErrorException('Error creating user'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll(0, 10);

      expect(service.findAll).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual([mockUser]);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.findAll.mockRejectedValue(
        new InternalServerErrorException('Error listing users'),
      );

      await expect(controller.findAll(0, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new InternalServerErrorException('Error finding user'),
      );

      await expect(controller.findOne(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'John Updated',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, name: updateUserDto.name };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException when email is already in use', async () => {
      mockUsersService.update.mockRejectedValue(
        new UnprocessableEntityException('Email is already in use'),
      );

      await expect(
        controller.update(mockUser.id, { email: 'existing@example.com' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.update.mockRejectedValue(
        new InternalServerErrorException('Error updating user'),
      );

      await expect(
        controller.update(mockUser.id, updateUserDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      mockUsersService.remove.mockRejectedValue(
        new InternalServerErrorException('Error deleting user'),
      );

      await expect(controller.remove(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
