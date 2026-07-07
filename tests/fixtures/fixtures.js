const { test: base } = require('@playwright/test');
const { HomePage } = require('../pages/HomePage');
const { PlayerHubPage } = require('../pages/PlayerHubPage');
const { MyQuizzesPage } = require('../pages/MyQuizzesPage');
const { CreateQuizPage } = require('../pages/CreateQuizPage');
const { JoinGamePage } = require('../pages/JoinGamePage');
const { HostQuizPage } = require('../pages/HostQuizPage');

const test = base.extend({
  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  playerHubPage: async ({ page }, use) => { await use(new PlayerHubPage(page)); },
  myQuizzesPage: async ({ page }, use) => { await use(new MyQuizzesPage(page)); },
  createQuizPage: async ({ page }, use) => { await use(new CreateQuizPage(page)); },
  joinGamePage: async ({ page }, use) => { await use(new JoinGamePage(page)); },
  hostQuizPage: async ({ page }, use) => { await use(new HostQuizPage(page)); },
});

const { expect } = require('@playwright/test');

module.exports = { test, expect };
