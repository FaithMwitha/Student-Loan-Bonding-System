import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateUniversityDto {
  @ApiProperty({ example: 'UNIMA' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1300000 })
  @IsNumber()
  @Min(0)
  tuitionFee: number;
}