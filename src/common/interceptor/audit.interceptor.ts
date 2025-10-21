import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DatabaseService } from 'src/database/database.service';
import { AuditAction } from 'generated/prisma';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly databaseService: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const startTime = Date.now();

    // Determine action based on HTTP method
    const actionMap: Record<string, AuditAction> = {
      POST: AuditAction.CREATE,
      GET: AuditAction.READ,
      PATCH: AuditAction.UPDATE,
      PUT: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method] || AuditAction.READ;

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;

        // Only log if user is authenticated and it's a write operation
        if (user && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
          try {
            await this.databaseService.auditLog.create({
              data: {
                userId: user.id,
                username: user.username,
                action,
                entity: this.extractEntityFromUrl(url),
                entityId: this.extractIdFromUrl(url) || response?.id,
                newValue: method === 'POST' ? body : undefined,
                changes: ['PATCH', 'PUT'].includes(method) ? body : undefined,
                ipAddress: ip,
                userAgent,
                method,
                endpoint: url,
                statusCode: 200,
                metadata: { duration },
              },
            });
          } catch (error) {
            console.error('Failed to create audit log:', error);
          }
        }
      }),
      catchError(async (error) => {
        // Log errors
        if (user) {
          try {
            await this.databaseService.auditLog.create({
              data: {
                userId: user.id,
                username: user.username,
                action,
                entity: this.extractEntityFromUrl(url),
                entityId: this.extractIdFromUrl(url),
                ipAddress: ip,
                userAgent,
                method,
                endpoint: url,
                statusCode: error.status || 500,
                description: error.message,
              },
            });
          } catch (logError) {
            console.error('Failed to log error:', logError);
          }
        }
        throw error;
      }),
    );
  }

  private extractEntityFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    // Remove 'api' prefix if exists
    const startIndex = parts[0] === 'api' ? 1 : 0;
    return parts[startIndex] || 'Unknown';
  }

  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/(\d+)(?:\/|$)/);
    return match ? parseInt(match[1], 10) : null;
  }
}