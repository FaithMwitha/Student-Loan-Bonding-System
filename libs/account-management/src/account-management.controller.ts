import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiResponse, 
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Audit, AuditAction, AuditEntity } from '@app/audit';
import { AccountManagementService } from './account-management.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AccountManagementController {
  constructor(private readonly service: AccountManagementService) {}

  @Post('officers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new officer account',
    description: 'Allows an Admin to create a new Loans Officer account. The officer will receive an email with their login credentials.'
  })
  @ApiBody({ type: CreateOfficerDto })
  @ApiResponse({ status: 201, description: 'Officer account created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  @ApiResponse({ status: 409, description: 'Conflict: An officer with that email or staff number already exists.' })
  @Audit({
    action: AuditAction.OFFICER_ACCOUNT_CREATED,
    entity: AuditEntity.User,
    entityIdFrom: 'response.user.id',
  })
  createOfficer(@Body() dto: CreateOfficerDto) {
    return this.service.createOfficer(dto);
  }

  @Get('officers')
  @ApiOperation({ 
    summary: 'Get all loans officers',
    description: 'Retrieves a list of all registered Loans Officers in the system.'
  })
  @ApiResponse({ status: 200, description: 'List of officers retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  getAllOfficers() {
    return this.service.getAllOfficers();
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user information',
    description: 'Retrieves the account details and status of any user (Student, Officer, or Admin) by their ID.'
  })
  @ApiParam({ name: 'id', description: 'UUID of the user', type: String })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  @ApiResponse({ status: 404, description: 'Not Found: User with the given ID does not exist.' })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getUser(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ 
    summary: 'Update user account status',
    description: 'Allows an Admin to activate or deactivate a user account. Inactive accounts cannot log in.'
  })
  @ApiParam({ name: 'id', description: 'UUID of the user', type: String })
  @ApiBody({ type: UpdateAccountStatusDto })
  @ApiResponse({ status: 200, description: 'User status successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request: Invalid status value or trying to change own status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can perform this action.' })
  @ApiResponse({ status: 404, description: 'Not Found: User with the given ID does not exist.' })
  @Audit({
    action: AuditAction.ACCOUNT_STATUS_CHANGED,
    entity: AuditEntity.User,
    entityIdFrom: 'params.id',
  })
  setStatus(
    @Req() req: AuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountStatusDto,
  ) {
    return this.service.setStatus(req.user.sub, id, dto.status);
  }
}