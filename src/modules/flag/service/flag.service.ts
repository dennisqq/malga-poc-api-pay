import { Injectable } from '@nestjs/common';

@Injectable()
export class FlagService {
  private states = new Map<string, boolean>();

  setState(key: string, value: boolean): void {
    this.states.set(key, value);
  }

  getState(key: string): boolean {
    return this.states.get(key) ?? true;
  }
}
