import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyQuizzesPage extends BasePage {
  readonly url = '/#/quizzes';

  constructor(page: Page) {
    super(page);
  }

  get newQuizBtn() {
    return this.page.getByRole('button', { name: '+ New quiz' });
  }

  get buildFirstQuizBtn() {
    return this.page.getByRole('button', { name: 'Build your first quiz' });
  }

  get emptyStateMessage() {
    return this.page.getByText('No quizzes yet.');
  }

  get quizCards() {
    return this.page.locator('.quiz-cards li');
  }

  // Scoped helpers for a specific quiz card by title
  quizCardByTitle(title: string): Locator {
    return this.page.locator('.quiz-cards li').filter({ hasText: title });
  }

  editBtnFor(title: string) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Edit' });
  }

  deleteBtnFor(title: string) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Delete' });
  }

  hostBtnFor(title: string) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Host →' });
  }

  // Actions
  async goto() {
    await this.page.goto('/#/quizzes');
  }

  async createNewQuiz() {
    await this.newQuizBtn.click();
  }

  async editQuiz(title: string) {
    await this.editBtnFor(title).click();
  }

  async deleteQuiz(title: string) {
    await this.deleteBtnFor(title).click();
  }

  async hostQuiz(title: string) {
    await this.hostBtnFor(title).click();
  }
}
