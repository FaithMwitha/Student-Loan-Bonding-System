import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../enums/audit-action.enum';
import { AuditEntity } from '../enums/audit-entity.enum';

export const AUDIT_LOG_KEY = 'audit_log_metadata';

export interface AuditLogOptions {
  action: AuditAction;
  entity: AuditEntity;
  /** Where to find the entity ID in the request/response */
  entityIdFrom?: string;
  /** Where to find the reason in the request */
  reasonFrom?: string;
  /** Where to find the actor ID (if not from JWT) */
  actorIdFrom?: string;
  /** Where to find the actor role (if not from JWT) */
  actorRoleFrom?: string;
  /** Where to find the actor email (if not from JWT) */
  actorEmailFrom?: string;
}

export const Audit = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
