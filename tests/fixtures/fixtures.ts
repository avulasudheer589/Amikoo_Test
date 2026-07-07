import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { PlayerHubPage } from '../pages/PlayerHubPage';
import { MyQuizzesPage } from '../pages/MyQuizzesPage';
import { CreateQuizPage } from '../pages/CreateQuizPage';
import { JoinGamePage } from '../pages/JoinGamePage';
import { HostQuizPage } from '../pages/HostQuizPage';

type AppFixtures = {
  homePage: HomePage;
  playerHubPage: PlayerHubPage;
  myQuizzesPage: MyQuizzesPage;
  createQuizPage: CreateQuizPage;
  joinGamePage: JoinGamePage;
  hostQuizPage: HostQuizPage;
};

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  playerHubPage: async ({ page }, use) => {
    await use(new PlayerHubPage(page));
  },
  myQuizzesPage: async ({ page }, use) => {
    await use(new MyQuizzesPage(page));
  },
  createQuizPage: async ({ page }, use) => {
    await use(new CreateQuizPage(page));
  },
  joinGamePage: async ({ page }, use) => {
    await use(new JoinGamePage(page));
  },
  hostQuizPage: async ({ page }, use) => {
    await use(new HostQuizPage(page));
  },
});

export { expect } from '@playwright/test';
