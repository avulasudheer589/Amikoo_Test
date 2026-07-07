import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly url = '/#/';

  constructor(page: Page) {
    super(page);
  }

  // Locators
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

  get footerTip() {
    return this.page.getByText(/Tip: open this app in two tabs/);
  }

  // Actions
  async goto() {
    await this.page.goto('/#/');
  }

  async joinGame(code: string) {
    await this.gameCodeInput.fill(code);
    await this.joinGameBtn.click();
  }

  async goToMyQuizzes() {
    await this.myQuizzesBtn.click();
  }

  async goToCreateQuiz() {
    await this.newQuizBtn.click();
  }
}
