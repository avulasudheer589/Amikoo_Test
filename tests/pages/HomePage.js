const { BasePage } = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/#/';
  }

  get heading() {
    return this.page.getByRole('heading', { name: /KahootLite/ });
  }

  get gameCodeInput() {
    return this.page.getByPlaceholder('ABC123');
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

  async goto() {
    await this.page.goto('/#/');
  }

  async joinGame(code) {
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

module.exports = { HomePage };
