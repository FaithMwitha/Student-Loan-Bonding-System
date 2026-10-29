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
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { Role } from '@app/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePaymentDto) {
    // TODO: tag payment with req.user.sub once Payment entity has a userId column
    return this.paymentsService.create(dto);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  findMyPayments() {
    // TODO: filter by req.user.sub once Payment entity has a userId column
    return this.paymentsService.findMyPayments();
  }

  @Get('verify/:reference')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}