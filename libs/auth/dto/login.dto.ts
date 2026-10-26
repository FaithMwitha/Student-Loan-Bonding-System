
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email address registered with the system',
    example: 'student@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password for the student account',
    example: '#StudentPass123',
  })
  @IsString()
   @MinLength(8)
    @MaxLength(72)
  password!: string;
}
