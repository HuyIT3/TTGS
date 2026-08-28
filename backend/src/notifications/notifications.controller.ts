import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /** GET /notifications — list for current user */
  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.sub;
    const notifications = await this.notificationsService.findForUser(userId);
    const unreadCount = await this.notificationsService.countUnread(userId);
    return { notifications, unreadCount };
  }

  /** GET /notifications/unread-count */
  @Get('unread-count')
  async unreadCount(@Request() req: any) {
    const count = await this.notificationsService.countUnread(req.user.sub);
    return { count };
  }

  /** PATCH /notifications/read-all */
  @Patch('read-all')
  async markAllRead(@Request() req: any) {
    await this.notificationsService.markAllRead(req.user.sub);
    return { success: true };
  }

  /** PATCH /notifications/:id/read */
  @Patch(':id/read')
  async markRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationsService.markRead(id, req.user.sub);
    return { success: true };
  }
}
