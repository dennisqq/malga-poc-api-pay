import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class BraintreeRepository {
  private readonly logger = new Logger(BraintreeRepository.name);
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: 'http://localhost:3000',
      timeout: 5000,
    });
  }
  async createBraintreePayment(request) {
    try {
      const response = await this.httpClient.post('/transactions', request);
      this.logger.log('Criação de pagamento realizada com sucesso', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  async createRefund(id, amount) {
    try {
      const response = await this.httpClient.post(`/void/${id}`, { amount });
      return response.data;
    } catch (error) {
      this.logger.error('error', error);
    }
  }

  public async getTransaction(id) {
    try {
      const response = await this.httpClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error('error', error);
    }
  }
}
