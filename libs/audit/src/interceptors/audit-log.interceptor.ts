import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { AuditService } from '../audit.service';
import {
  AUDIT_LOG_KEY,
  AuditLogOptions,
} from '../decorators/audit-log.decorator';

interface AuthenticatedRequest extends Request {
  user?: { sub: string; role: string; email?: string };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();

    const options = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      handler,
    );

    if (!options) {
      return next.handle();
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    return next.handle().pipe(
      tap((responseBody) => {
        this.writeAuditLog(options, request, responseBody).catch((err) => {
          this.logger.error(
            `Audit interceptor failed: ${err instanceof Error ? err.message : err}`,
          );
        });
      }),
    );
  }

  private async writeAuditLog(
    options: AuditLogOptions,
    request: AuthenticatedRequest,
    responseBody: unknown,
  ): Promise<void> {
    const user = request.user;

    // Actor identity: prefer JWT user, fallback to response/request extraction
    const actorId =
      user?.sub ??
      this.extractString(request, responseBody, options.actorIdFrom);
    const actorRole =
      user?.role ??
      this.extractString(request, responseBody, options.actorRoleFrom);
    const actorEmail =
      user?.email ??
      this.extractString(request, responseBody, options.actorEmailFrom);

    const entityId = this.extractString(
      request,
      responseBody,
      options.entityIdFrom,
    );
    const reason = this.extractString(
      request,
      responseBody,
      options.reasonFrom,
    );

    await this.auditService.record({
      actorId,
      actorRole,
      actorEmail,
      action: options.action,
      entityType: options.entity,
      entityId,
      reason,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  private extractString(
    request: AuthenticatedRequest,
    responseBody: unknown,
    path?: string,
  ): string | undefined {
    if (!path) return undefined;
    const value = this.extractPath(request, responseBody, path);
    return typeof value === 'string' ? value : undefined;
  }

  private extractPath(
    request: AuthenticatedRequest,
    responseBody: unknown,
    path: string,
  ): unknown {
    const [source, ...keys] = path.split('.');

    let root: unknown;
    switch (source) {
      case 'params':
        root = request.params;
        break;
      case 'body':
        root = request.body;
        break;
      case 'query':
        root = request.query;
        break;
      case 'response':
        root = responseBody;
        break;
      default:
        return undefined;
    }

    return keys.reduce<unknown>(
      (current, key) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[key]
          : undefined,
      root,
    );
  }
}
