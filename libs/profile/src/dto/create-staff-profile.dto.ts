import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, Validate } from 'class-validator';

export class CreateStaffProfileDto {
  @ApiProperty({ example: 'string' })
  @IsNotEmpty()
  @IsString()
  staffNumber: string;

  @ApiProperty({ example: 'string' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'string' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(099|098|088|089)\d{7}$/, { 
    message: 'Phone number must be a valid Malawian number (Airtel or TNM) and exactly 10 digits long' 
  })
  @Validate((value: string) => {
  
    const lastSevenDigits = value.slice(3);

    const allSame = /^(\d)\1{6}$/.test(lastSevenDigits);
    
    if (allSame) {
      return false;
    }
    return true;
  }, {
    message: 'Phone number cannot be a fake sequential number (e.g., 0999999999). Please use a real number.'
  })
  phone: string;
}