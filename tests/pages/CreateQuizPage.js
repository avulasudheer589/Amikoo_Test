const { BasePage } = require('./BasePage');

class CreateQuizPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/#/create';
  }

  get quizTitleInput() {
    return this.page.getByPlaceholder('World capitals trivia');
  }

  // Per-question locators — indexed (0-based) for multi-question support
  questionTextAt(index) {
    return this.page.getByPlaceholder('What is the capital of France?').nth(index);
  }

  timeLimitAt(index) {
    return this.page.getByRole('spinbutton', { name: /time limit/i }).nth(index);
  }

  optionInputAt(index, option) {
    return this.page.getByPlaceholder(`Option ${option}`).nth(index);
  }

  correctAnswerSelectAt(index) {
    return this.page.getByRole('combobox', { name: /correct answer/i }).nth(index);
  }

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

  async goto() {
    await this.page.goto('/#/create');
  }

  async fillQuizTitle(title) {
    await this.quizTitleInput.fill(title);
  }

  // data = { text, optionA, optionB, optionC, optionD, correctAnswer, timeLimit }
  async fillQuestion(index, data) {
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

module.exports = { CreateQuizPage };
