import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateUniversityDto {
  @ApiProperty({ example: 'UNIMA', description: 'The name of the university' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1300000, description: 'The tuition fee amount in MWK' })
  @IsNumber()
  @Min(0)
  tuitionFee: number;
}