import { Controller, Get, Req, UseGuards, Patch, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Role } from '@app/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';
import { NotificationsService } from './notifications.service';

interface AuthRequest extends Request {
  user: { sub: string; role: Role };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.STUDENT)
  @ApiOperation({ 
    summary: 'Get my notifications',
    description: 'Retrieves a list of in-app notifications for the logged-in student (e.g., loan status changes).'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success! Returns an array of notifications.',
    schema: {
      example: [
        {
          id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
          userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
          message: "Your loan status changed to APPROVED.",
          isRead: false,
          createdAt: "2026-10-25T05:30:00.000Z"
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only students can access this endpoint.' })
  getMyNotifications(@Req() req: AuthRequest) {
    return this.notificationsService.getUserNotifications(req.user.sub);
  }

  @Patch(':id/read')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification marked as read',
    schema: {
      example: {
        id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
        userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        message: "Your loan status changed to APPROVED.",
        isRead: true,
        createdAt: "2026-10-25T05:30:00.000Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @Delete(':id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification deleted',
    schema: {
      example: {
        id: "b2fce3b4-9e0b-4743-8d7e-14e10398268a",
        userId: "13f462bb-4d85-4681-bbf6-d59d984415d8",
        message: "Your loan status changed to APPROVED.",
        isRead: true,
        createdAt: "2026-10-25T05:30:00.000Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.notificationsService.remove(id, req.user.sub);
  }
}