import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from 'src/dto/createPayment.dto';

@Injectable()
export class BraintreeAdapter {
  transactionAdaptRequest(dto: CreatePaymentDto) {
    return {
      amount: dto.amount,
      currency: dto.currency,
      statementDescriptor: dto.description,
      paymentType: dto.paymentMethod.type,
      card: {
        number: dto.paymentMethod.card.number,
        holder: dto.paymentMethod.card.holderName,
        cvv: dto.paymentMethod.card.cvv,
        expiration: this.convertExpirationDate(dto.paymentMethod.card.expirationDate),
        installmentNumber: dto.paymentMethod.card.installments,
      },
    };
  }

  private convertExpirationDate(expirationDate: string): string {
    const [month, year] = expirationDate.split('/');
    return `${month}/${year.slice(-2)}`;
  }
}
