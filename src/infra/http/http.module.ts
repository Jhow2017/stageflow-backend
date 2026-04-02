import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { CryptographyModule } from '../cryptography/cryptography.module';
import { AuthModule } from '../auth/auth.module';
import { MessagingModule } from '../messaging/messaging.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterUserController } from './controllers/register-user.controller';
import { RegisterUserByRoleController } from './controllers/register-user-by-role.controller';
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
import { ListGlobalStudiosController } from './controllers/list-global-studios.controller';
import { ListPublicRoomsUseCase } from '../../domain/booking/application/use-cases/list-public-rooms';
import { ListAvailableSlotsByDateUseCase } from '../../domain/booking/application/use-cases/list-available-slots-by-date';
import { ListAvailableSlotsByRangeUseCase } from '../../domain/booking/application/use-cases/list-available-slots-by-range';
import { CreatePublicBookingUseCase } from '../../domain/booking/application/use-cases/create-public-booking';
import { ListStudioBookingsUseCase } from '../../domain/booking/application/use-cases/list-studio-bookings';
import { ListStudioClientsUseCase } from '../../domain/booking/application/use-cases/list-studio-clients';
import { ListGlobalStudiosUseCase } from '../../domain/booking/application/use-cases/list-global-studios';
import { GetGlobalStudioDetailsUseCase } from '../../domain/booking/application/use-cases/get-global-studio-details';
import { SettingsRoomsController } from './controllers/settings-rooms.controller';
import { CreateStudioRoomFromSettingsUseCase } from '../../domain/booking/application/use-cases/create-studio-room-from-settings';
import { OwnerGuard } from '../auth/owner.guard';
import { SubscriptionCheckoutController } from './controllers/subscription-checkout.controller';
import { StartSubscriptionCheckoutUseCase } from '../../domain/subscription-checkout/application/use-cases/start-subscription-checkout';
import { GetSubscriptionCheckoutUseCase } from '../../domain/subscription-checkout/application/use-cases/get-subscription-checkout';
import { ApproveSubscriptionCheckoutUseCase } from '../../domain/subscription-checkout/application/use-cases/approve-subscription-checkout';
import { SubscriptionCheckoutSessionsRepository } from '../../domain/subscription-checkout/application/repositories/subscription-checkout-sessions-repository';
import { PrismaSubscriptionCheckoutSessionsRepository } from '../database/prisma/repositories/prisma-subscription-checkout-sessions-repository';
import { SubdomainAvailabilityChecker } from '../../domain/subscription-checkout/application/services/subdomain-availability-checker';
import { StudioSubdomainAvailabilityChecker } from '../subscription-checkout/studio-subdomain-availability-checker';
import { SubscriptionProvisioningService } from '../../domain/subscription-checkout/application/services/subscription-provisioning-service';
import { StudioSubscriptionProvisioningService } from '../subscription-checkout/studio-subscription-provisioning.service';
import { ClientAreaController } from './controllers/client-area.controller';
import { ClientAreaScopeGuard } from '../auth/client-area-scope.guard';
import { GetClientAreaProfileUseCase } from '../../domain/booking/application/use-cases/get-client-area-profile';
import { UpdateClientAreaProfileUseCase } from '../../domain/booking/application/use-cases/update-client-area-profile';
import { ListClientAreaBookingsUseCase } from '../../domain/booking/application/use-cases/list-client-area-bookings';
import { ListClientAreaReceiptsUseCase } from '../../domain/booking/application/use-cases/list-client-area-receipts';
import { UpdateClientAreaBannerUseCase } from '../../domain/booking/application/use-cases/update-client-area-banner';
import { DeleteClientAreaAccountUseCase } from '../../domain/booking/application/use-cases/delete-client-area-account';
import { LogoutClientAreaUseCase } from '../../domain/auth/application/use-cases/logout-client-area';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { CreateSubscriptionCheckoutStripeSessionUseCase } from '../../domain/subscription-checkout/application/use-cases/create-subscription-checkout-stripe-session';
import { HandleStripeSubscriptionWebhookUseCase } from '../../domain/subscription-checkout/application/use-cases/handle-stripe-subscription-webhook';
import { StripeSubscriptionGateway } from '../../domain/subscription-checkout/application/services/stripe-subscription-gateway';
import { StripeSubscriptionGatewayService } from '../subscription-checkout/stripe-subscription-gateway.service';
import { StripeWebhookEventsRepository } from '../../domain/subscription-checkout/application/repositories/stripe-webhook-events-repository';
import { PrismaStripeWebhookEventsRepository } from '../database/prisma/repositories/prisma-stripe-webhook-events-repository';
import { BookingPaymentGateway } from '../../domain/booking/application/services/booking-payment-gateway';
import { StripeBookingPaymentGatewayService } from '../booking/stripe-booking-payment-gateway.service';
import { CreateBookingPaymentIntentUseCase } from '../../domain/booking/application/use-cases/create-booking-payment-intent';
import { StripeConnectGateway } from '../../domain/booking/application/services/stripe-connect-gateway';
import { StripeConnectGatewayService } from '../booking/stripe-connect-gateway.service';
import { FinanceStripeController } from './controllers/finance-stripe.controller';
import { CreateStudioStripeConnectOnboardingLinkUseCase } from '../../domain/booking/application/use-cases/create-studio-stripe-connect-onboarding-link';
import { GetStudioStripeConnectStatusUseCase } from '../../domain/booking/application/use-cases/get-studio-stripe-connect-status';
import { CreateStudioStripeDashboardLinkUseCase } from '../../domain/booking/application/use-cases/create-studio-stripe-dashboard-link';
import { CreateBookingPaymentIntentController } from './controllers/create-booking-payment-intent.controller';

@Module({
    imports: [DatabaseModule, CryptographyModule, AuthModule, MessagingModule],
    controllers: [
        RegisterUserController,
        RegisterUserByRoleController,
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
        ListGlobalStudiosController,
        SubscriptionCheckoutController,
        SettingsRoomsController,
        ClientAreaController,
        StripeWebhookController,
        FinanceStripeController,
        CreateBookingPaymentIntentController,
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
        ListAvailableSlotsByRangeUseCase,
        CreatePublicBookingUseCase,
        CreateStudioRoomFromSettingsUseCase,
        ListStudioBookingsUseCase,
        ListStudioClientsUseCase,
        ListGlobalStudiosUseCase,
        GetGlobalStudioDetailsUseCase,
        StartSubscriptionCheckoutUseCase,
        GetSubscriptionCheckoutUseCase,
        ApproveSubscriptionCheckoutUseCase,
        GetClientAreaProfileUseCase,
        UpdateClientAreaProfileUseCase,
        ListClientAreaBookingsUseCase,
        ListClientAreaReceiptsUseCase,
        UpdateClientAreaBannerUseCase,
        DeleteClientAreaAccountUseCase,
        LogoutClientAreaUseCase,
        CreateSubscriptionCheckoutStripeSessionUseCase,
        HandleStripeSubscriptionWebhookUseCase,
        CreateBookingPaymentIntentUseCase,
        CreateStudioStripeConnectOnboardingLinkUseCase,
        GetStudioStripeConnectStatusUseCase,
        CreateStudioStripeDashboardLinkUseCase,
        {
            provide: SubscriptionCheckoutSessionsRepository,
            useClass: PrismaSubscriptionCheckoutSessionsRepository,
        },
        {
            provide: StripeWebhookEventsRepository,
            useClass: PrismaStripeWebhookEventsRepository,
        },
        {
            provide: SubdomainAvailabilityChecker,
            useClass: StudioSubdomainAvailabilityChecker,
        },
        {
            provide: StripeSubscriptionGateway,
            useClass: StripeSubscriptionGatewayService,
        },
        {
            provide: BookingPaymentGateway,
            useClass: StripeBookingPaymentGatewayService,
        },
        {
            provide: StripeConnectGateway,
            useClass: StripeConnectGatewayService,
        },
        {
            provide: SubscriptionProvisioningService,
            useClass: StudioSubscriptionProvisioningService,
        },
        {
            provide: AuditLogger,
            useClass: AuditLoggerService,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        OwnerGuard,
        ClientAreaScopeGuard,
    ],
})
export class HttpModule { }