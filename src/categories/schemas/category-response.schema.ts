import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseSchema {
  @ApiProperty({
    description: 'Category unique ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  name: string;

  @ApiProperty({
    description: 'Category color in hexadecimal format',
    example: '#FF5733',
  })
  color: string;

  @ApiProperty({
    description: 'Date when the category was created',
    example: '2025-03-10T13:24:18.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the category was last updated',
    example: '2025-03-12T11:00:00.000Z',
  })
  updatedAt: Date;
}
