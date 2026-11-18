
import { IsNotEmpty, IsString, IsEmail, MinLength, } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user.',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Valid email address used for the user account. The system converts it to lowercase.',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 8,
    description: 'User account password. Must contain at least 8 characters.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}
