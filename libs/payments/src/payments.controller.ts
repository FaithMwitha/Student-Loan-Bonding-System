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
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiSecurity,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Audit, AuditAction, AuditEntity } from '@app/audit';

interface AuthRequest extends Request {
  user: { sub: string };
}

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
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.paymentsService.create(dto, req.user.sub, idempotencyKey);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my payments' })
  @ApiResponse({ status: 200, description: 'List of payments for the authenticated user' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  findMyPayments(@Req() req: AuthRequest) {
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

  @Post(':id/upload-receipt')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Upload payment receipt', 
    description: 'Allows a student to upload the bank deposit slip after making a payment. This moves the loan to UNDER_REVIEW.' 
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        receipt: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Receipt uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required' })
  @UseInterceptors(FileInterceptor('receipt', {
    storage: diskStorage({
      destination: './uploads/receipts',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadReceipt(
    @Param('id') id: string,
    @Req() req: AuthRequest, 
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No receipt file uploaded');
    }
    return this.paymentsService.uploadReceipt(id, req.user.sub, file.path);
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
  handleWebhook(
    @Body() payload: PaymentWebhookDto,
    @Headers('x-webhook-signature') signature: string | undefined,
    @Req() req: Request & { rawBody: Buffer },
  ) {
    return this.paymentsService.handleWebhook(payload, signature, req.rawBody);
  }
}