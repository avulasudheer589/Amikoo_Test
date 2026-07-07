import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';

test.describe('Home Page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('should display the KahootLite heading', async ({ homePage }) => {
    await expect(homePage.heading).toBeVisible();
  });

  test('should display the Join Game input and button', async ({ homePage }) => {
    await expect(homePage.gameCodeInput).toBeVisible();
    await expect(homePage.joinGameBtn).toBeVisible();
  });

  test('should display My Quizzes and New Quiz buttons', async ({ homePage }) => {
    await expect(homePage.myQuizzesBtn).toBeVisible();
    await expect(homePage.newQuizBtn).toBeVisible();
  });

  test('should display the footer tip', async ({ homePage }) => {
    await expect(homePage.footerTip).toBeVisible();
  });

  test('should navigate to My Quizzes page', async ({ homePage, page }) => {
    await homePage.goToMyQuizzes();
    await expect(page).toHaveURL(/#\/quizzes/);
  });

  test('should navigate to Create Quiz page', async ({ homePage, page }) => {
    await homePage.goToCreateQuiz();
    await expect(page).toHaveURL(/#\/create/);
  });

  test('should navigate to Join Game page when a valid-format code is entered', async ({ homePage, page }) => {
    await homePage.joinGame('ABC123');
    await expect(page).toHaveURL(/#\/join\/ABC123/);
  });

  test('should toggle the theme', async ({ homePage, page }) => {
    const initialTheme = await page.locator('html').getAttribute('data-theme');
    await homePage.toggleTheme();
    const newTheme = await page.locator('html').getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });
});
