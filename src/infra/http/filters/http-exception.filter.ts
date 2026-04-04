import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { UseCaseError } from '../../../core/errors/use-case-error';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof UseCaseError) {
            const status = this.getStatusCode(exception);
            return response.status(status).json({
                statusCode: status,
                message: exception.message,
                error: exception.name,
            });
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            return response.status(status).json(
                typeof exceptionResponse === 'string'
                    ? {
                        statusCode: status,
                        message: exceptionResponse,
                    }
                    : exceptionResponse,
            );
        }

        // Em desenvolvimento, mostra o erro completo para debug
        const errorMessage =
            process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : exception instanceof Error
                    ? exception.message
                    : 'Internal server error';

        const errorStack =
            process.env.NODE_ENV !== 'production' && exception instanceof Error
                ? exception.stack
                : undefined;

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: errorMessage,
            ...(errorStack && { stack: errorStack }),
        });
    }

    private getStatusCode(exception: UseCaseError): number {
        if (exception.constructor.name === 'ResourceNotFoundError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'StudioNotFoundError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'RoomNotFoundError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'BookingNotFoundForPaymentError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'OnboardingSessionNotFoundError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'SubscriptionCheckoutSessionNotFoundError') {
            return HttpStatus.NOT_FOUND;
        }

        if (exception.constructor.name === 'SubscriptionCheckoutAccessDeniedError') {
            return HttpStatus.FORBIDDEN;
        }

        if (exception.constructor.name === 'NotAllowedError') {
            return HttpStatus.FORBIDDEN;
        }

        if (exception.constructor.name === 'StudioAccessDeniedError') {
            return HttpStatus.FORBIDDEN;
        }

        if (exception.constructor.name === 'StudioStripeAccountNotConnectedError') {
            return HttpStatus.BAD_REQUEST;
        }

        if (exception.constructor.name === 'ClientAreaAccessDeniedError') {
            return HttpStatus.FORBIDDEN;
        }

        if (exception.constructor.name === 'UserAlreadyExistsError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'WrongCredentialsError') {
            return HttpStatus.UNAUTHORIZED;
        }

        if (exception.constructor.name === 'WrongCurrentPasswordError') {
            return HttpStatus.UNAUTHORIZED;
        }

        if (exception.constructor.name === 'PastDateNotAllowedError') {
            return HttpStatus.BAD_REQUEST;
        }

        if (exception.constructor.name === 'BookingConflictError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'StudioSlugAlreadyExistsError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'SubdomainUnavailableError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'InvalidSubscriptionCheckoutStatusError') {
            return HttpStatus.BAD_REQUEST;
        }

        if (exception.constructor.name === 'InvalidBrFqdnError') {
            return HttpStatus.BAD_REQUEST;
        }

        if (exception.constructor.name === 'BrDomainAvailabilityQueryFailedError') {
            return HttpStatus.SERVICE_UNAVAILABLE;
        }

        if (exception.constructor.name === 'BrDomainNotRegisterableError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'RoomLimitReachedError') {
            return HttpStatus.CONFLICT;
        }

        if (exception.constructor.name === 'InvalidRefreshTokenError') {
            return HttpStatus.UNAUTHORIZED;
        }

        if (exception.constructor.name === 'InvalidResetTokenError') {
            return HttpStatus.UNAUTHORIZED;
        }

        return HttpStatus.BAD_REQUEST;
    }
}

