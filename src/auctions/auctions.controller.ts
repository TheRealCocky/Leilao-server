import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  /**
   * Criar um leilão (apenas SELLER ou ADMIN)
   */
  @Roles(Role.SELLER, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateAuctionDto, @Request() req) {
    const ownerId = req.user.userId;
    return this.auctionsService.create({ ...dto, ownerId });
  }

  /**
   * Listar todos os leilões (todos os papéis)
   */
  @Roles(Role.BUYER, Role.SELLER, Role.ADMIN)
  @Get()
  findAll() {
    return this.auctionsService.getAllAuctions();
  }

  /**
   * Obter detalhes de um leilão específico
   */
  @Roles(Role.BUYER, Role.SELLER, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.getAuctionById(id);
  }

  /**
   * Atualizar um leilão (apenas SELLER do próprio leilão ou ADMIN)
   */
  @Roles(Role.SELLER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuctionDto, @Request() req) {
    return this.auctionsService.update(id, dto, req.user);
  }

  /**
   * Deletar um leilão (apenas ADMIN)
   */
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auctionsService.deleteAuction(id);
  }

  /**
   * Dar um lance (apenas BUYER)
   */
  @Roles(Role.BUYER)
  @Post(':id/bid')
  async placeBid(
    @Param('id') id: string,
    @Body() body: { amount: number },
    @Request() req,
  ) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid bid amount');
    }
    const userId = req.user.userId;
    return this.auctionsService.placeBid({ auctionId: id, amount: body.amount, userId });
  }
}
