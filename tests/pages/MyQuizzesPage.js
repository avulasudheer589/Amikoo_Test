const { BasePage } = require('./BasePage');

class MyQuizzesPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/#/quizzes';
  }

  get newQuizBtn() {
    return this.page.getByRole('button', { name: '+ New quiz' });
  }

  get emptyStateMessage() {
    return this.page.getByText('No quizzes yet.');
  }

  get buildFirstQuizBtn() {
    return this.page.getByRole('button', { name: 'Build your first quiz' });
  }

  get quizCards() {
    return this.page.locator('.quiz-cards li');
  }

  // Scoped helpers by quiz title
  quizCardByTitle(title) {
    return this.page.locator('.quiz-cards li').filter({ hasText: title });
  }

  editBtnFor(title) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Edit' });
  }

  deleteBtnFor(title) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Delete' });
  }

  hostBtnFor(title) {
    return this.quizCardByTitle(title).getByRole('button', { name: 'Host →' });
  }

  async goto() {
    await this.page.goto('/#/quizzes');
  }

  async createNewQuiz() {
    await this.newQuizBtn.click();
  }

  async editQuiz(title) {
    await this.editBtnFor(title).click();
  }

  async deleteQuiz(title) {
    await this.deleteBtnFor(title).click();
  }

  async hostQuiz(title) {
    await this.hostBtnFor(title).click();
  }
}

module.exports = { MyQuizzesPage };
