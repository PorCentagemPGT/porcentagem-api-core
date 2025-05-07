import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Transporte',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @ApiProperty({
    description: 'Color code of the category (usually a HEX or color name)',
    example: '#FF5733',
  })
  @IsString({ message: 'Color must be a string' })
  color: string;

  @ApiProperty({
    description: 'Icon name or reference for the category',
    example: 'car',
  })
  @IsString({ message: 'Icon must be a string' })
  icon: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Despesas relacionadas a transporte diário',
  })
  @IsString({ message: 'Description must be a string' })
  description: string;
}
