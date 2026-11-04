
//using this one
import { IsEmail, IsString, MinLength, MaxLength} from 'class-validator';
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
  @MinLength(8)
  @MaxLength(72)
   
  password!: string;

}
