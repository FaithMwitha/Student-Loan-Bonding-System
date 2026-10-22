import { IsNotEmpty, IsString, IsEmail, MinLength, } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
  @ApiProperty({example: 'John Doe', description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({example: 'john.doe@example.com', description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({example: 'password123', minLength: 8, description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}
