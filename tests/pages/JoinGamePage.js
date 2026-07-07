const { BasePage } = require('./BasePage');

class JoinGamePage extends BasePage {
  // Route: /#/join/:gameCode
  constructor(page) {
    super(page);
  }

  get roomNotFoundMessage() {
    return this.page.getByText('Room not found');
  }

  async goto(gameCode) {
    await this.page.goto(`/#/join/${gameCode}`);
  }
}

module.exports = { JoinGamePage };
