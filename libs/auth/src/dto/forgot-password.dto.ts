import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({example:'student@test.com'})
  @IsEmail()
  email!:string;
}