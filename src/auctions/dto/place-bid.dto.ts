import { IsNumber, IsString, Min } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  auctionId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  userId: string;
}
