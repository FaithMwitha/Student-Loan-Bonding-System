import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';


import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/src/jwt/jwtauthguard';
import { RolesGuard } from '../../auth/src/roles/roles.guard';
import { Roles } from '../../auth/src/roles/roles.decorators';
import { Role } from '../../common/src/enums/role.enum';
import { VerificationsService } from './verification.service';

@ApiBearerAuth()
@ApiTags(' Verifications')
@Controller('verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.LOANS_OFFICER)
export class VerificationsController {
  constructor(
    private readonly verificationsService: VerificationsService,
  ) {}

  // Get all students in the verification module
  @Get()
  @ApiOperation({
  summary: 'Get all approved loan verifications',
  description: 'Retrieves all approved loan verification records. Accessible only to authenticated Loans Officers.',
})
@ApiResponse({
  status: 200,
  description: 'Approved verification records retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized. A valid JWT token is required.',
})
@ApiResponse({
  status: 403,
  description: 'Forbidden. Only Loans Officers may access this endpoint.',
})
  findAll() {
    return this.verificationsService.findAll();
  }

  // Get a single verification record
  @Get(':id')
  @ApiOperation({
  summary: 'Get a loan verification by ID',
  description: 'Retrieves a specific loan verification record using its unique ID.',
})
@ApiParam({
  name: 'id',
  description: 'UUID of the verification record',
  example: '550e8400-e29b-41d4-a716-446655440000',
})
@ApiResponse({
  status: 200,
  description: 'Verification record retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized. A valid JWT token is required.',
})
@ApiResponse({
  status: 403,
  description: 'Forbidden. Only Loans Officers may access this endpoint.',
})
@ApiResponse({
  status: 404,
  description: 'Verification record not found.',
})
  findOne(@Param('id') id: string) {
    return this.verificationsService.findOne(id);
  }

@Get('university/:university')
@ApiOperation({
  summary: 'Get verification statistics by university',
  description:
    'Returns the total number of approved, pending, in-progress and rejected verification records for a specified university.',
})
@ApiParam({
  name: 'university',
  description: 'Name of the university',
  example: 'University of Malawi',
})
@ApiResponse({
  status: 200,
  description: 'University verification statistics retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized. A valid JWT token is required.',
})
@ApiResponse({
  status: 403,
  description: 'Forbidden. Only Loans Officers may access this endpoint.',
})
@ApiResponse({
  status: 404,
  description: 'University not found.',
})
getStatisticsByUniversity(
  @Param('university') university: string,
) {
  return this.verificationsService.getStatisticsByUniversity(
    university,
  );
}
}