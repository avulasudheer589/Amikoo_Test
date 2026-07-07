const { BasePage } = require('./BasePage');

class PlayerHubPage extends BasePage {
  constructor(page) {
    super(page);
    this.url = '/#/player';
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

  async goto() {
    await this.page.goto('/#/player');
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

module.exports = { PlayerHubPage };
