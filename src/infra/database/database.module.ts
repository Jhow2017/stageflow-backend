import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';
import { PrismaBlacklistedTokensRepository } from './prisma/repositories/prisma-blacklisted-tokens-repository';
import { PrismaAuditLogsRepository } from './prisma/repositories/prisma-audit-logs-repository';
import { UsersRepository } from '../../domain/auth/application/repositories/users-repository';
import { BlacklistedTokensRepository } from '../../domain/auth/application/repositories/blacklisted-tokens-repository';
import { AuditLogsRepository } from '../../domain/auth/application/repositories/audit-logs-repository';
import { StudiosRepository } from '../../domain/booking/application/repositories/studios-repository';
import { RoomsRepository } from '../../domain/booking/application/repositories/rooms-repository';
import { ClientsRepository } from '../../domain/booking/application/repositories/clients-repository';
import { BookingsRepository } from '../../domain/booking/application/repositories/bookings-repository';
import { PrismaStudiosRepository } from './prisma/repositories/prisma-studios-repository';
import { PrismaRoomsRepository } from './prisma/repositories/prisma-rooms-repository';
import { PrismaClientsRepository } from './prisma/repositories/prisma-clients-repository';
import { PrismaBookingsRepository } from './prisma/repositories/prisma-bookings-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: UsersRepository,
            useClass: PrismaUsersRepository,
        },
        {
            provide: BlacklistedTokensRepository,
            useClass: PrismaBlacklistedTokensRepository,
        },
        {
            provide: AuditLogsRepository,
            useClass: PrismaAuditLogsRepository,
        },
        {
            provide: StudiosRepository,
            useClass: PrismaStudiosRepository,
        },
        {
            provide: RoomsRepository,
            useClass: PrismaRoomsRepository,
        },
        {
            provide: ClientsRepository,
            useClass: PrismaClientsRepository,
        },
        {
            provide: BookingsRepository,
            useClass: PrismaBookingsRepository,
        },
    ],
    exports: [
        PrismaService,
        UsersRepository,
        BlacklistedTokensRepository,
        AuditLogsRepository,
        StudiosRepository,
        RoomsRepository,
        ClientsRepository,
        BookingsRepository,
    ],
})
export class DatabaseModule { }