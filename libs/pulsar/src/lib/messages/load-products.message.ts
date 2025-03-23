import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { JobMessage } from './job.message';

export class LoadProductsMessage extends JobMessage {
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

  @IsString()
  @IsNotEmpty()
  category: string | undefined;

  @IsNumber()
  @Min(0)
  price: number | undefined;

  @IsInt()
  @Min(0)
  stock: number | undefined;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number | undefined;

  @IsString()
  @IsNotEmpty()
  description: string | undefined;
}
