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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  create(@Body() dto: CreatePaymentDto) {
    // TODO: tag payment with req.user.sub once Payment entity has a userId column
    return this.paymentsService.create(dto);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my payments' })
  @ApiResponse({ status: 200, description: 'List of payments for the authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  findMyPayments() {
    // TODO: filter by req.user.sub once Payment entity has a userId column
    return this.paymentsService.findMyPayments();
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

  // Public webhook — providers can't send a JWT.
  // TODO: verify provider signature inside handleWebhook before trusting the payload.
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment provider webhook (public)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}