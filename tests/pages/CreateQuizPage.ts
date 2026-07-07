import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface QuestionData {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  timeLimit?: number;
}

export class CreateQuizPage extends BasePage {
  readonly url = '/#/create';

  constructor(page: Page) {
    super(page);
  }

  // Title
  get quizTitleInput() {
    return this.page.getByRole('textbox', { name: /quiz title/i });
  }

  // Question block — scoped by index (0-based) for multi-question support
  questionTextAt(index: number) {
    return this.page.getByRole('textbox', { name: /question text/i }).nth(index);
  }

  timeLimitAt(index: number) {
    return this.page.getByRole('spinbutton', { name: /time limit/i }).nth(index);
  }

  optionInputAt(index: number, option: 'A' | 'B' | 'C' | 'D') {
    return this.page
      .getByRole('textbox', { name: new RegExp(`Option ${option}`, 'i') })
      .nth(index);
  }

  correctAnswerSelectAt(index: number) {
    return this.page.getByRole('combobox', { name: /correct answer/i }).nth(index);
  }

  // Buttons
  get addQuestionBtn() {
    return this.page.getByRole('button', { name: '+ Add question' });
  }

  get saveQuizBtn() {
    return this.page.getByRole('button', { name: 'Save quiz' });
  }

  get saveAndHostBtn() {
    return this.page.getByRole('button', { name: 'Save & host →' });
  }

  get cancelBtn() {
    return this.page.getByRole('button', { name: 'Cancel' });
  }

  // Actions
  async goto() {
    await this.page.goto('/#/create');
  }

  async fillQuizTitle(title: string) {
    await this.quizTitleInput.fill(title);
  }

  async fillQuestion(index: number, data: QuestionData) {
    await this.questionTextAt(index).fill(data.text);
    if (data.timeLimit !== undefined) {
      await this.timeLimitAt(index).fill(String(data.timeLimit));
    }
    await this.optionInputAt(index, 'A').fill(data.optionA);
    await this.optionInputAt(index, 'B').fill(data.optionB);
    await this.optionInputAt(index, 'C').fill(data.optionC);
    await this.optionInputAt(index, 'D').fill(data.optionD);
    await this.correctAnswerSelectAt(index).selectOption(data.correctAnswer);
  }

  async addQuestion() {
    await this.addQuestionBtn.click();
  }

  async saveQuiz() {
    await this.saveQuizBtn.click();
  }

  async saveAndHost() {
    await this.saveAndHostBtn.click();
  }

  async cancel() {
    await this.cancelBtn.click();
  }
}
