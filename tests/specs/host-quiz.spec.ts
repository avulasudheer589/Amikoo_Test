import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';

test.describe('Host Quiz Page', () => {
  test('should show Room Not Found for a non-existent quiz ID', async ({ hostQuizPage }) => {
    await hostQuizPage.goto('nonexistent-id');
    await expect(hostQuizPage.roomNotFoundMessage).toBeVisible();
  });

  test('should navigate back to Home from Room Not Found page', async ({ hostQuizPage }) => {
    await hostQuizPage.goto('nonexistent-id');
    await expect(hostQuizPage.roomNotFoundMessage).toBeVisible();
    await hostQuizPage.goHome();
    await expect(hostQuizPage.page).toHaveURL(/#\//);
  });

  test('should host a quiz after creating it via Save & Host', async ({ createQuizPage, page }) => {
    // Create and immediately host a quiz
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('Live Quiz');
    await createQuizPage.fillQuestion(0, {
      text: 'Which planet is closest to the Sun?',
      optionA: 'Venus',
      optionB: 'Earth',
      optionC: 'Mercury',
      optionD: 'Mars',
      correctAnswer: 'C',
      timeLimit: 15,
    });
    await createQuizPage.saveAndHost();

    // Should land on a valid host page (not Room Not Found)
    await expect(page).toHaveURL(/#\/host\//);
    await expect(page.getByText('Room not found')).not.toBeVisible();
  });

  test('should navigate back to Home via Home button on a valid host page', async ({ createQuizPage, hostQuizPage, page }) => {
    // Create and host a quiz
    await createQuizPage.goto();
    await createQuizPage.fillQuizTitle('Quiz For Nav Test');
    await createQuizPage.fillQuestion(0, {
      text: 'What is H2O?',
      optionA: 'Fire',
      optionB: 'Water',
      optionC: 'Air',
      optionD: 'Earth',
      correctAnswer: 'B',
    });
    await createQuizPage.saveAndHost();

    // Navigate home
    await hostQuizPage.goHome();
    await expect(page).toHaveURL(/#\//);
  });
});
