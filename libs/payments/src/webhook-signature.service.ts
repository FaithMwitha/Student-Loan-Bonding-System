import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhookSignatureService {
  private readonly logger = new Logger(WebhookSignatureService.name);
  private readonly secret: string;
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET') ?? '';
    this.isDev =
      (this.config.get<string>('NODE_ENV') ?? 'development') !== 'production';
  }

  verify(rawBody: Buffer, signature: string | undefined): void {
    // Dev bypass — no signature required locally
    if (this.isDev && !signature) {
      this.logger.warn(
        'Webhook accepted without signature (NODE_ENV !== production)',
      );
      return;
    }

    if (!this.secret) {
      throw new Error(
        'PAYMENT_WEBHOOK_SECRET is not configured. Set it in .env',
      );
    }

    if (!signature) {
      throw new UnauthorizedException('Webhook signature missing');
    }

    // Expect format: "sha256=<hex>"
    const prefix = 'sha256=';
    if (!signature.startsWith(prefix)) {
      throw new UnauthorizedException(
        'Invalid signature format. Expected: sha256=<hex>',
      );
    }

    const receivedHex = signature.slice(prefix.length).trim();
    const computedHex = createHmac('sha256', this.secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const received = Buffer.from(receivedHex, 'hex');
    const computed = Buffer.from(computedHex, 'hex');

    if (
      received.length !== computed.length ||
      !timingSafeEqual(received, computed)
    ) {
      this.logger.warn('Webhook signature mismatch — rejecting');
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }
}
