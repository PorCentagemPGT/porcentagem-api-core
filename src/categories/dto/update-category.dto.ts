import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Transporte',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @ApiProperty({
    description: 'Color code of the category (usually a HEX or color name)',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color: string;

  @ApiProperty({
    description: 'Description of the category',
    example: 'Despesas relacionadas a transporte diário',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;
}
