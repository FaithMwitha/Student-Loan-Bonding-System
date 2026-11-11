import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Audit, AuditAction, AuditEntity } from '@app/audit';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment (fixed amount K10,000)' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error — amount must be exactly K10,000' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @Audit({
    action: AuditAction.PAYMENT_CREATED,
    entity: AuditEntity.Payment,
    entityIdFrom: "response.id",
  })
  create(
    @Body() dto: CreatePaymentDto,
    @Req() req: { user: { sub: string } },
  ) {
    return this.paymentsService.create(dto, req.user.sub);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my payments' })
  @ApiResponse({ status: 200, description: 'List of payments for the authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  findMyPayments(@Req() req: { user: { sub: string } }) {
    return this.paymentsService.findMyPayments(req.user.sub);
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify a payment by transaction reference' })
  @ApiParam({ name: 'reference', description: 'Transaction reference' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.paymentsService.updateStatus(id, status);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment provider webhook (public)' })
  @ApiSecurity({})
  @ApiBody({ type: PaymentWebhookDto })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @Audit({
    action: AuditAction.PAYMENT_WEBHOOK_RECEIVED,
    entity: AuditEntity.Payment,
    entityIdFrom: 'body.transactionReference',
  })
  handleWebhook(@Body() payload: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(payload);
  }
}
