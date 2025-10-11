import { AuctionStatus } from '../../common/enums/auction-status.enum';

export class Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  status: AuctionStatus;
  createdAt: Date;
  updatedAt?: Date;
}
