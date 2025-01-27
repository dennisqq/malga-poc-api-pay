import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class StripeRepository {
  private readonly logger = new Logger(StripeRepository.name);
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 5000,
    });
  }

  async createPayment(request) {
    try {
      const response = await this.httpClient.post('/charges', request);
      this.logger.log('Criação de pagamento realizada com sucesso', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Stripe error', error);
      throw new HttpException('Erro ao criar pagamento', 500);
    }
  }

  async createRefund(id, amount) {
    try {
      const response = await this.httpClient.post(`/refund/${id}`, { amount });
      return response.data;
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  async getTransaction(id) {
    try {
      const response = await this.httpClient.get(`/charges/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error('error', error);
    }
  }
}
