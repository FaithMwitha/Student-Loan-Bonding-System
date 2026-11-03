import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    const newPayment = this.paymentRepository.create({
      ...createPaymentDto,
      userId,
      status: 'PENDING',
    });
    return await this.paymentRepository.save(newPayment);
  }

  async findMyPayments(userId: string) {
    return await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyPayment(reference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionReference: reference },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment with reference ${reference} not found`,
      );
    }
    return payment;
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.findOne(id);
    payment.status = status;
    return await this.paymentRepository.save(payment);
  }

  async handleWebhook(payload: PaymentWebhookDto) {
    const { transactionReference, status, amount } = payload;

    const payment = await this.paymentRepository.findOne({
      where: { transactionReference },
    });

    if (payment) {
      payment.status = status;
      await this.paymentRepository.save(payment);
      return {
        received: true,
        message: 'Payment status updated via webhook',
        payment,
      };
    }

    const newPayment = this.paymentRepository.create({
      transactionReference,
      status,
      amount,
    });
    await this.paymentRepository.save(newPayment);
    return {
      received: true,
      message: 'New payment recorded via webhook',
      payment: newPayment,
    };
  }
}
