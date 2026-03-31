import { Inject } from '@nestjs/common';
import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';
import { HashGenerator } from '../cryptography/hash-generator';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../enterprise/value-objects/role';

export interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
    role?: Role;
}

export interface RegisterUserResponse {
    user: User;
}

export class UserAlreadyExistsError extends UseCaseError {
    constructor() {
        super('User with this email already exists');
    }
}

export class RegisterUserUseCase {
    constructor(
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(HashGenerator)
        private hashGenerator: HashGenerator,
    ) { }

    async execute({
        name,
        email,
        password,
        role,
    }: RegisterUserRequest): Promise<RegisterUserResponse> {
        const userWithSameEmail = await this.usersRepository.findByEmail(email);

        if (userWithSameEmail) {
            throw new UserAlreadyExistsError();
        }

        const hashedPassword = await this.hashGenerator.hash(password);

        const user = User.create({
            name,
            email,
            password: hashedPassword,
            role: role ?? Role.USER,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            refreshToken: null,
        });

        await this.usersRepository.create(user);

        return {
            user,
        };
    }
}