import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthModule } from '../auth/auth.module';
import { MessagingModule } from '../messaging/messaging.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterUserController } from './controllers/register-user.controller';
import { AuthenticateController } from './controllers/authenticate.controller';
import { GetProfileController } from './controllers/get-profile.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { RegisterUserUseCase } from '../../domain/auth/application/use-cases/register-user';
import { AuthenticateUserUseCase } from '../../domain/auth/application/use-cases/authenticate-user';
import { RefreshTokenUseCase } from '../../domain/auth/application/use-cases/refresh-token';
import { ChangePasswordController } from './controllers/change-password.controller';
import { ChangePasswordUseCase } from '../../domain/auth/application/use-cases/change-password';
import { ForgotPasswordController } from './controllers/forgot-password.controller';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { ForgotPasswordUseCase } from '../../domain/auth/application/use-cases/forgot-password';
import { ResetPasswordUseCase } from '../../domain/auth/application/use-cases/reset-password';
import { LogoutController } from './controllers/logout.controller';
import { LogoutUseCase } from '../../domain/auth/application/use-cases/logout';
import { ListUsersController } from './controllers/list-users.controller';
import { ListUsersUseCase } from '../../domain/auth/application/use-cases/list-users';
import { ListAuditLogsController } from './controllers/list-audit-logs.controller';
import { ListAuditLogsUseCase } from '../../domain/auth/application/use-cases/list-audit-logs';
import { AuditLogger } from '../../domain/auth/application/services/audit-logger';
import { AuditLoggerService } from '../../infra/services/audit-logger.service';
import { ListPublicRoomsController } from './controllers/list-public-rooms.controller';
import { ListAvailableSlotsController } from './controllers/list-available-slots.controller';
import { CreatePublicBookingController } from './controllers/create-public-booking.controller';
import { ListStudioBookingsController } from './controllers/list-studio-bookings.controller';
import { ListStudioClientsController } from './controllers/list-studio-clients.controller';
import { ListPublicRoomsUseCase } from '../../domain/booking/application/use-cases/list-public-rooms';
import { ListAvailableSlotsByDateUseCase } from '../../domain/booking/application/use-cases/list-available-slots-by-date';
import { CreatePublicBookingUseCase } from '../../domain/booking/application/use-cases/create-public-booking';
import { ListStudioBookingsUseCase } from '../../domain/booking/application/use-cases/list-studio-bookings';
import { ListStudioClientsUseCase } from '../../domain/booking/application/use-cases/list-studio-clients';
import { OnboardingController } from './controllers/onboarding.controller';
import { StartOnboardingUseCase } from '../../domain/onboarding/application/use-cases/start-onboarding';
import { GetOnboardingSessionUseCase } from '../../domain/onboarding/application/use-cases/get-onboarding-session';
import { ConfirmOnboardingUseCase } from '../../domain/onboarding/application/use-cases/confirm-onboarding';
import { OnboardingSessionsRepository } from '../../domain/onboarding/application/repositories/onboarding-sessions-repository';
import { InMemoryOnboardingSessionsRepository } from '../onboarding/in-memory-onboarding-sessions-repository';
import { SubdomainAvailabilityChecker } from '../../domain/onboarding/application/services/subdomain-availability-checker';
import { StudioSubdomainAvailabilityChecker } from '../onboarding/studio-subdomain-availability-checker';
import { StudioProvisioningService } from '../../domain/onboarding/application/services/studio-provisioning-service';
import { StudioOnboardingProvisioningService } from '../onboarding/studio-onboarding-provisioning.service';
import { SettingsRoomsController } from './controllers/settings-rooms.controller';
import { CreateStudioRoomFromSettingsUseCase } from '../../domain/booking/application/use-cases/create-studio-room-from-settings';

@Module({
    imports: [DatabaseModule, CryptographyModule, AuthModule, MessagingModule],
    controllers: [
        RegisterUserController,
        AuthenticateController,
        GetProfileController,
        RefreshTokenController,
        ChangePasswordController,
        ForgotPasswordController,
        ResetPasswordController,
        LogoutController,
        ListUsersController,
        ListAuditLogsController,
        ListPublicRoomsController,
        ListAvailableSlotsController,
        CreatePublicBookingController,
        ListStudioBookingsController,
        ListStudioClientsController,
        OnboardingController,
        SettingsRoomsController,
    ],
    providers: [
        RegisterUserUseCase,
        AuthenticateUserUseCase,
        RefreshTokenUseCase,
        ChangePasswordUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        LogoutUseCase,
        ListUsersUseCase,
        ListAuditLogsUseCase,
        ListPublicRoomsUseCase,
        ListAvailableSlotsByDateUseCase,
        CreatePublicBookingUseCase,
        CreateStudioRoomFromSettingsUseCase,
        ListStudioBookingsUseCase,
        ListStudioClientsUseCase,
        StartOnboardingUseCase,
        GetOnboardingSessionUseCase,
        ConfirmOnboardingUseCase,
        {
            provide: OnboardingSessionsRepository,
            useClass: InMemoryOnboardingSessionsRepository,
        },
        {
            provide: SubdomainAvailabilityChecker,
            useClass: StudioSubdomainAvailabilityChecker,
        },
        {
            provide: StudioProvisioningService,
            useClass: StudioOnboardingProvisioningService,
        },
        {
            provide: AuditLogger,
            useClass: AuditLoggerService,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class HttpModule { }