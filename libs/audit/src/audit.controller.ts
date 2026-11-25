import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { AuditService } from './audit.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'List audit logs (Admin only)',
    description: 'Retrieves a paginated list of system audit logs. Can be filtered by actor, action, entity type, or date range.'
  })
  @ApiQuery({ name: 'actorId', required: false, description: 'Filter by the ID of the user who performed the action' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type (e.g., LOGIN_SUCCESS, LOAN_APPLICATION_CREATED)' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type (e.g., User, LoanApplication)' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by the specific ID of the entity' })
  @ApiQuery({ name: 'from', required: false, description: 'Filter logs starting from this date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'Filter logs up to this date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 50)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully.',
    schema: {
      example: {
        items: [
          {
            id: 'uuid-1234',
            actorId: 'user-123',
            actorEmail: 'student@test.com',
            action: 'LOGIN_SUCCESS',
            entityType: 'User',
            entityId: 'user-123',
            createdAt: '2026-11-23T10:00:00.000Z',
          }
        ],
        total: 1,
        page: 1,
        limit: 50,
        pages: 1,
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized: Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only Admins can access audit logs.' })
  find(@Query() query: AuditLogQueryDto) {
    return this.auditService.find(query);
  }
}