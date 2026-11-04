import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

/** What verification needs in order to send an email. */
export abstract class EmailSender {
  abstract send(to: string, subject: string, text: string): Promise<void>;
}

/** Development-only default. Logs the message, and refuses to run in production. */
@Injectable()
export class DevEmailSender extends EmailSender {
  private readonly logger = new Logger(DevEmailSender.name);

  async send(to: string, subject: string, text: string): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Email sending is not configured');
    }
    this.logger.log(`[DEV EMAIL] to=${to} subject="${subject}"\n${text}`);
  }
}