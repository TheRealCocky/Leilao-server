import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBidDto{
  @IsNotEmpty()
  @IsString()
  auctionId: string;
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
