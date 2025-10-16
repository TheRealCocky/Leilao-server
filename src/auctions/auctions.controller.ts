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

  @Roles(Role.SELLER, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateAuctionDto, @Request() req) {
    const ownerId = req.user.userId;
    return this.auctionsService.create({ ...dto, ownerId });
  }

  @Roles(Role.BUYER, Role.SELLER, Role.ADMIN)
  @Get()
  findAll() {
    return this.auctionsService.getAllAuctions();
  }

  @Roles(Role.BUYER, Role.SELLER, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionsService.getAuctionById(id);
  }

  @Roles(Role.SELLER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuctionDto) {
    return this.auctionsService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auctionsService.deleteAuction(id);
  }
}
