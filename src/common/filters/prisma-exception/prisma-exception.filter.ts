import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  Logger
} from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { Response, Request } from 'express';

@Catch()  
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name); 

  catch(exception: unknown, host: ArgumentsHost) {  // unknown type, handle all
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();  //  Get request info

    this.logger.debug(`Exception type: ${exception?.constructor?.name}`);
    this.logger.debug(`Exception: ${JSON.stringify(exception, null, 2)}`);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    //  1. Handle NestJS HttpException (NotFoundException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    }
    
    //  2. Handle Prisma Known Errors (P2002, P2025, etc.)
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const result = this.handlePrismaError(exception);
      status = result.status;
      message = result.message;
      error = result.error;
    }
    
    //  3. Handle Prisma Validation Error (schema mismatch)
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided to database';
      error = 'Validation Error';
    }
    
    //  4. Handle Prisma Connection Error
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection failed';
      error = 'Database Error';
    }
    
    //  5. Handle unknown JavaScript errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    //  Logging với context
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    //  Response với đầy đủ thông tin
    response.status(status).json({
      statusCode: status,  
      message,
      error,
      timestamp: new Date().toISOString(),  
      path: request.url, 
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,  //  Stack trace cho dev
      }),
    });
  }

  //  Dedicated method cho Prisma errors với nhiều cases hơn
  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    const meta = exception.meta;

    switch (exception.code) {
      //  Unique constraint - better message
      case 'P2002': {
        const target = (meta?.target as string[]) || ['field'];
        return {
          status: HttpStatus.CONFLICT,
          message: `${target.join(', ')} already exists`,
          error: 'Duplicate Entry',
        };
      }

      //  Not found - with cause if available
      case 'P2025': {
        return {
          status: HttpStatus.NOT_FOUND,
          message: meta?.cause ? String(meta.cause) : 'Record not found',
          error: 'Not Found',
        };
      }

      //  Foreign key - with field name
      case 'P2003': {
        const field = meta?.field_name as string;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Invalid ${field}: related record does not exist`,
          error: 'Foreign Key Constraint',
        };
      }

      case 'P2014': {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid ID provided',
          error: 'Invalid ID',
        };
      }

      case 'P2011': {
        const field = meta?.constraint as string;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${field} is required`,
          error: 'Missing Required Field',
        };
      }

      //  THÊM: Value too long
      case 'P2000': {
        const field = meta?.column_name as string;
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `${field} value is too long`,
          error: 'Value Too Long',
        };
      }

      //  THÊM: Record to update not found
      case 'P2016': {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record to update not found',
          error: 'Not Found',
        };
      }

      //  THÊM: Related record not found
      case 'P2018': {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Required related record not found',
          error: 'Related Record Not Found',
        };
      }

      //  THÊM: Write conflict (concurrent updates)
      case 'P2034': {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Transaction failed due to concurrent update. Please retry.',
          error: 'Write Conflict',
        };
      }

      default: {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          error: `Database Error (${exception.code})`,
        };
      }
    }
  }
}