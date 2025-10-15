import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;
  @IsString()
  @IsMongoId()
  userId: string;
}
