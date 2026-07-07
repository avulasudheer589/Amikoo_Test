const { BasePage } = require('./BasePage');

class HostQuizPage extends BasePage {
  // Route: /#/host/:quizId
  constructor(page) {
    super(page);
  }

  get roomNotFoundMessage() {
    return this.page.getByText('Room not found');
  }

  async goto(quizId) {
    await this.page.goto(`/#/host/${quizId}`);
  }
}

module.exports = { HostQuizPage };
