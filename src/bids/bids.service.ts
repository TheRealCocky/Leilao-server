import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}
  async createBid(dto: CreateBidDto, userId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: dto.auctionId },
    });
    if (!auction) throw new NotFoundException('Leilão não encontrado');
    if (auction.status !== 'OPEN')
      throw new BadRequestException('Leilão não está aberto');
    if (dto.amount <= auction.currentPrice)
      throw new BadRequestException('O lance deve ser maior que o preço atual');

    const bid = await this.prisma.bid.create({
      data: {
        amount: dto.amount,
        user: { connect: { id: userId } },
        auction: { connect: { id: dto.auctionId } },
      },
    });

    // Atualiza o preço atual do leilão
    await this.prisma.auction.update({
      where: { id: dto.auctionId },
      data: { currentPrice: dto.amount },
    });

    return bid;
  }

  async findAllByAuction(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      include: { user: true },
    });
  }
  async findAllByUser(userId: string) {
    return this.prisma.bid.findMany({
      where: { userId },
      include: { auction: true },
    });
  }
}
