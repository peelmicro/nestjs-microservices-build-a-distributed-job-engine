import { IsNumber, IsNotEmpty } from 'class-validator';

export class FibonacciData {
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
