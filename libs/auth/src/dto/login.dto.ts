
//using this one
import { IsEmail, IsString, MinLength, MaxLength, Matches} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
   @ApiProperty({
    description: 'Email address registered with the system',
    example: 'student@example.com',
  })
  @IsEmail()
  email!: string;
  
  @ApiProperty({
    description: 'Password for the student account',
    example: 'SecurePassword',
  })  
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @MaxLength(72, {
    message: 'Password must not exceed 72 characters',
  })
   
  password!: string;

}
