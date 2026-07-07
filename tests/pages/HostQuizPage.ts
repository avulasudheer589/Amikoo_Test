import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HostQuizPage extends BasePage {
  // Route: /#/host/:quizId
  constructor(page: Page) {
    super(page);
  }

  get roomNotFoundMessage() {
    return this.page.getByText('Room not found');
  }

  async goto(quizId: string) {
    await this.page.goto(`/#/host/${quizId}`);
  }
}
