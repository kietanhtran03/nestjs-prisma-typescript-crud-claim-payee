import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RequestLog {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip?: string;
  userAgent: string;
  user?: string;
  timestamp: string;
}

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestLogger');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, body, query } = req;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Extract user info if authenticated
    const user = (req as any).user;
    const username = user?.username || 'Anonymous';

    // Log incoming request
    this.logger.log(`⬇️  Incoming: ${method} ${originalUrl}`);
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      if (Object.keys(query).length > 0) {
        this.logger.debug(`Query: ${JSON.stringify(query)}`);
      }
      
      // Don't log password fields
      if (body && !originalUrl.includes('/auth/')) {
        this.logger.debug(`Body: ${JSON.stringify(body)}`);
      }
    }

    // Intercept response
    const originalSend = res.send;
    let responseBody: any;

    res.send = function (data: any) {
      responseBody = data;
      return originalSend.call(this, data);
    };

    // Log when response is finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      const logData: RequestLog = {
        method,
        url: originalUrl,
        statusCode,
        duration,
        ip,
        userAgent,
        user: username,
        timestamp: new Date().toISOString(),
      };

      // Format log message
      const emoji = this.getStatusEmoji(statusCode);
      const logMessage = `${emoji} ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${username}`;

      // Log based on status code
      if (statusCode >= 500) {
        this.logger.error(logMessage, JSON.stringify(logData));
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(`Response: ${JSON.stringify(logData)}`);
        }
      } else if (statusCode >= 300) {
        this.logger.log(logMessage);
      } else {
        this.logger.log(logMessage);
      }

      // Log slow requests (> 1 second)
      if (duration > 1000) {
        this.logger.warn(`🐌 Slow request detected: ${method} ${originalUrl} took ${duration}ms`);
      }
    });

    next();
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 500) return '❌'; // Server error
    if (statusCode >= 400) return '⚠️';  // Client error
    if (statusCode >= 300) return '↩️';  // Redirect
    if (statusCode >= 200) return '✅'; // Success
    return '➡️'; // Informational
  }
}