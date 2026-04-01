import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateClientAreaBannerDto {
    @ApiProperty({ example: 'https://cdn.stageflow.app/banners/banda-x.jpg' })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    bannerUrl: string;
}
