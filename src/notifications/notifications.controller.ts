import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}
  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    return await this.notificationsService.create(dto);
  }
  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.notificationsService.findAllByUser(userId);
  }
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
