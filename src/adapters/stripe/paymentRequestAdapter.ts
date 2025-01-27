import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';

@Injectable()
export class StripeAdapter {
  chargesAdaptRequest(dto: CreatePaymentDto) {
    return {
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description,
      paymentMethod: {
        type: dto.paymentMethod.type,
        card: {
          number: dto.paymentMethod.card.number,
          holderName: dto.paymentMethod.card.holderName,
          cvv: dto.paymentMethod.card.cvv,
          expirationDate: dto.paymentMethod.card.expirationDate,
          installments: dto.paymentMethod.card.installments,
        },
      },
    };
  }
}
