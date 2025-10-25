import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuctionStatus } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAuctionDto) {
    const auction = await this.prisma.auction.create({
      data: {
        title: dto.title,
        description: dto.description ?? '',
        startingPrice: dto.startingPrice,
        currentPrice: dto.startingPrice,
        endTime: new Date(dto.endTime),
        status: dto.status ?? AuctionStatus.OPEN,
        ownerId: dto.ownerId,
      },
    });

    this.notificationsGateway.server.emit('auctionCreated', auction);
    return auction;
  }

  async getAllAuctions() {
    return this.prisma.auction.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Corrigido com verificação de ID e fechamento automático
  async getAuctionById(id: string) {
    if (!id || id === 'undefined') {
      throw new BadRequestException('ID do leilão inválido.');
    }

    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          include: { user: true },
          orderBy: { amount: 'desc' },
        },
        owner: true,
      },
    });

    if (!auction) throw new NotFoundException('Leilão não encontrado.');

    const now = new Date();

    // ⏰ Fecha automaticamente se o prazo passou
    if (auction.status === AuctionStatus.OPEN && auction.endTime <= now) {
      const highestBid = auction.bids[0];

      const closed = await this.prisma.auction.update({
        where: { id },
        data: {
          status: AuctionStatus.FINISHED,
          winnerId: highestBid?.userId ?? null,
          currentPrice: highestBid?.amount ?? auction.currentPrice,
        },
        include: { winner: true },
      });

      if (highestBid) {
        // 🏆 Notificação para o vencedor
        await this.notificationsService.create({
          userId: highestBid.userId,
          message: `🎉 Parabéns! Você venceu o leilão "${closed.title}" com um lance de ${highestBid.amount.toLocaleString(
            'pt-AO',
            {
              style: 'currency',
              currency: 'AOA',
            },
          )}.`,
        });

        // 📢 Notificação para o dono do leilão
        await this.notificationsService.create({
          userId: closed.ownerId,
          message: `✅ O leilão "${closed.title}" terminou. O vencedor foi ${highestBid.user?.name ?? 'Usuário desconhecido'} com ${highestBid.amount.toLocaleString(
            'pt-AO',
            {
              style: 'currency',
              currency: 'AOA',
            },
          )}.`,
        });
      } else {
        // 🚫 Nenhum lance
        await this.notificationsService.create({
          userId: closed.ownerId,
          message: `❌ O leilão "${closed.title}" terminou sem nenhum lance.`,
        });
      }

      // 🔔 Emite evento de fechamento
      this.notificationsGateway.server.emit('auctionClosed', {
        auctionId: closed.id,
        title: closed.title,
        winner: highestBid?.user?.name ?? 'Sem vencedor',
        amount: highestBid?.amount ?? 0,
      });

      return closed;
    }

    return auction;
  }

  async update(id: string, dto: UpdateAuctionDto, user: any) {
    const auction = await this.getAuctionById(id);

    if (user.role !== 'ADMIN' && auction.ownerId !== user.userId) {
      throw new ForbiddenException('Você não pode editar este leilão.');
    }

    const updated = await this.prisma.auction.update({
      where: { id },
      data: {
        title: dto.title ?? auction.title,
        description: dto.description ?? auction.description,
        endTime: dto.endTime ? new Date(dto.endTime) : auction.endTime,
        status: dto.status ?? auction.status,
      },
    });

    this.notificationsGateway.server.emit('auctionUpdated', updated);
    return updated;
  }

  async deleteAuction(id: string) {
    if (!id || id === 'undefined') {
      throw new BadRequestException('ID inválido para exclusão.');
    }

    const deleted = await this.prisma.auction.delete({ where: { id } });
    this.notificationsGateway.server.emit('auctionDeleted', { id });
    return deleted;
  }

  async placeBid(dto: PlaceBidDto) {
    if (!dto.auctionId || dto.auctionId === 'undefined') {
      throw new BadRequestException('ID do leilão inválido.');
    }

    const auction = await this.getAuctionById(dto.auctionId);

    if (auction.status !== AuctionStatus.OPEN)
      throw new BadRequestException('O leilão está encerrado.');

    if (dto.amount <= auction.currentPrice)
      throw new BadRequestException(
        'O lance deve ser maior que o preço atual.',
      );

    const bid = await this.prisma.bid.create({
      data: {
        auctionId: dto.auctionId,
        userId: dto.userId,
        amount: dto.amount,
      },
      include: { user: true },
    });

    const updated = await this.prisma.auction.update({
      where: { id: dto.auctionId },
      data: { currentPrice: dto.amount },
    });

    // 🔔 Emite eventos em tempo real
    this.notificationsGateway.server.emit('newBid', {
      auctionId: updated.id,
      bid,
    });
    this.notificationsGateway.server.emit('auctionUpdated', updated);

    // 💬 Notificação para o dono
    await this.notificationsService.create({
      userId: auction.ownerId,
      message: `💰 Novo lance de ${bid.user?.name ?? 'Usuário'} em "${auction.title}": ${dto.amount.toLocaleString(
        'pt-AO',
        {
          style: 'currency',
          currency: 'AOA',
        },
      )}.`,
    });

    return updated;
  }
}
