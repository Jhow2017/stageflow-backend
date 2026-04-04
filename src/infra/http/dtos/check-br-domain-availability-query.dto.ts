import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckBrDomainAvailabilityQueryDto {
    @ApiProperty({
        description: 'Nome de domínio .br completo (FQDN), em ASCII.',
        example: 'meuestudio.com.br',
        maxLength: 253,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(253)
    fqdn!: string;
}
