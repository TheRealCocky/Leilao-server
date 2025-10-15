import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Roles } from '../common/decorators/get-user.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles(Role.BUYER)
  async create(@Req() req, @Body() dto: CreateBidDto) {
    return this.bidsService.createBid(dto, req.user.userId);
  }

  @Get('auction/:auctionId')
  async findAllByAuction(@Param('auctionId') auctionId: string) {
    return this.bidsService.findAllByAuction(auctionId);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.bidsService.findAllByUser(userId);
  }
}
