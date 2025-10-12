
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionStatus } from '@prisma/client'; // ✅ enum do Prisma

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAuctionDto) {
    return this.prisma.auction.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        startingPrice: dto.startingPrice,
        currentPrice: dto.currentPrice ?? dto.startingPrice,
        endTime: new Date(dto.endTime),
        status: dto.status ?? AuctionStatus.OPEN,
        ownerId: dto.ownerId,
      },
    });
  }

  async getAllAuctions() {
    return this.prisma.auction.findMany();
  }

  async getAuctionById(id: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) throw new Error('Auction not found');
    return auction;
  }

  async update(id: string, dto: UpdateAuctionDto) {
    return this.prisma.auction.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        startingPrice: dto.startingPrice,
        currentPrice: dto.currentPrice,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        status: dto.status ? { set: dto.status } : undefined, // ✅ corrigido
      },
    });
  }

  async deleteAuction(id: string) {
    return this.prisma.auction.delete({ where: { id } });
  }
}
