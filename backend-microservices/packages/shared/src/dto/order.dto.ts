import { IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsString()
  product: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class OrderResponseDto {
  id: number;
  userId: number;
  product: string;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: Date;
}