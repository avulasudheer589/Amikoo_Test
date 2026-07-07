import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class JoinGamePage extends BasePage {
  // Route: /#/join/:gameCode
  constructor(page: Page) {
    super(page);
  }

  get roomNotFoundMessage() {
    return this.page.getByText('Room not found');
  }

  async goto(gameCode: string) {
    await this.page.goto(`/#/join/${gameCode}`);
  }
}
