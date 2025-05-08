import { ApiProperty } from '@nestjs/swagger';

export class UserResponseSchema {
  @ApiProperty({
    description: 'User unique ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'strongP@ssw0rd',
  })
  password: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2025-03-10T13:24:18.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2025-03-10T13:24:18.000Z',
  })
  updated_at: Date;
}
