import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { AuctionStatus } from '@prisma/client';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  startingPrice: number;

  @IsOptional()
  @IsNumber()
  currentPrice?: number;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;

  // ✅ Novo campo
  @IsOptional()
  @IsString()
  ownerId?: string;
}
