import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsISO8601, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { AccountStatus, Role } from '@app/common';
import { UserSearchFilter } from '@app/users';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const toBool = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : value;

export class UserFilterDto implements UserSearchFilter {
  @ApiPropertyOptional({ description: 'Part of the email address' })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(100) email?: string;

  @ApiPropertyOptional({ description: 'Part of the name' })
  @IsOptional() @Transform(trim) @IsString() @MaxLength(100) name?: string;

  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role) role?: Role;
  @ApiPropertyOptional({ enum: AccountStatus }) @IsOptional() @IsEnum(AccountStatus) status?: AccountStatus;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() emailVerified?: boolean;

  @ApiPropertyOptional({ example: '2026-11-01' })
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsISO8601({ strict: true }) createdFrom?: string;

  @ApiPropertyOptional({ example: '2026-11-30' })
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsISO8601({ strict: true }) createdTo?: string;

  @ApiPropertyOptional({ enum: ['createdAt', 'name', 'email'] })
  @IsOptional() @IsIn(['createdAt', 'name', 'email']) sortBy?: 'createdAt' | 'name' | 'email';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional() @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit: number = 20;
}