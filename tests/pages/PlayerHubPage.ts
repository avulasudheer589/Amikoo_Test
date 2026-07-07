import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PlayerHubPage extends BasePage {
  readonly url = '/#/player';

  constructor(page: Page) {
    super(page);
  }

  get heading() {
    return this.page.getByRole('heading', { name: /KahootLite/ });
  }

  get gameCodeInput() {
    return this.page.getByRole('textbox', { name: /ABC123/ });
  }

  get joinGameBtn() {
    return this.page.getByRole('button', { name: 'Join game →' });
  }

  get myQuizzesBtn() {
    return this.page.getByRole('button', { name: 'My quizzes' });
  }

  get newQuizBtn() {
    return this.page.getByRole('button', { name: '+ New quiz' });
  }

  async goto() {
    await this.page.goto('/#/player');
  }

  async joinGame(code: string) {
    await this.gameCodeInput.fill(code);
    await this.joinGameBtn.click();
  }
}
