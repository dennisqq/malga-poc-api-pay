import { IsString, IsUUID } from 'class-validator';

export class GetPaymentDto {
  @IsString()
  @IsUUID('4', { message: 'O id deve ser um UUID válido' })
  id: string;
}
