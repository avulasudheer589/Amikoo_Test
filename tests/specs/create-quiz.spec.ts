import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';

test.describe('Create Quiz Page', () => {
  test.beforeEach(async ({ createQuizPage }) => {
    await createQuizPage.goto();
  });

  test('should display the quiz title input', async ({ createQuizPage }) => {
    await expect(createQuizPage.quizTitleInput).toBeVisible();
  });

  test('should display question fields for the first question', async ({ createQuizPage }) => {
    await expect(createQuizPage.questionTextAt(0)).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'A')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'B')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'C')).toBeVisible();
    await expect(createQuizPage.optionInputAt(0, 'D')).toBeVisible();
    await expect(createQuizPage.correctAnswerSelectAt(0)).toBeVisible();
    await expect(createQuizPage.timeLimitAt(0)).toBeVisible();
  });

  test('should display Save, Save & Host, Cancel and Add Question buttons', async ({ createQuizPage }) => {
    await expect(createQuizPage.saveQuizBtn).toBeVisible();
    await expect(createQuizPage.saveAndHostBtn).toBeVisible();
    await expect(createQuizPage.cancelBtn).toBeVisible();
    await expect(createQuizPage.addQuestionBtn).toBeVisible();
  });

  test('should fill in a quiz title', async ({ createQuizPage }) => {
    await createQuizPage.fillQuizTitle('Geography Quiz');
    await expect(createQuizPage.quizTitleInput).toHaveValue('Geography Quiz');
  });

  test('should fill in a full question', async ({ createQuizPage }) => {
    await createQuizPage.fillQuestion(0, {
      text: 'What is the capital of France?',
      optionA: 'Berlin',
      optionB: 'Paris',
      optionC: 'Madrid',
      optionD: 'Rome',
      correctAnswer: 'B',
      timeLimit: 30,
    });

    await expect(createQuizPage.questionTextAt(0)).toHaveValue('What is the capital of France?');
    await expect(createQuizPage.optionInputAt(0, 'A')).toHaveValue('Berlin');
    await expect(createQuizPage.optionInputAt(0, 'B')).toHaveValue('Paris');
    await expect(createQuizPage.correctAnswerSelectAt(0)).toHaveValue('B');
    await expect(createQuizPage.timeLimitAt(0)).toHaveValue('30');
  });

  test('should add a second question when Add Question is clicked', async ({ createQuizPage }) => {
    await createQuizPage.addQuestion();
    await expect(createQuizPage.questionTextAt(1)).toBeVisible();
  });

  test('should save a quiz and navigate to My Quizzes', async ({ createQuizPage, page }) => {
    await createQuizPage.fillQuizTitle('Saved Quiz');
    await createQuizPage.fillQuestion(0, {
      text: 'What is 1 + 1?',
      optionA: '1',
      optionB: '2',
      optionC: '3',
      optionD: '4',
      correctAnswer: 'B',
    });
    await createQuizPage.saveQuiz();
    await expect(page).toHaveURL(/#\/quizzes/);
  });

  test('should save and host a quiz and navigate to Host page', async ({ createQuizPage, page }) => {
    await createQuizPage.fillQuizTitle('Hosted Quiz');
    await createQuizPage.fillQuestion(0, {
      text: 'What colour is the sky?',
      optionA: 'Red',
      optionB: 'Green',
      optionC: 'Blue',
      optionD: 'Yellow',
      correctAnswer: 'C',
    });
    await createQuizPage.saveAndHost();
    await expect(page).toHaveURL(/#\/host\//);
  });

  test('should cancel and navigate away from Create Quiz', async ({ createQuizPage, page }) => {
    await createQuizPage.cancel();
    // Cancel should navigate away from /#/create
    await expect(page).not.toHaveURL(/#\/create/);
  });

  test('should navigate back to Home via Home button', async ({ createQuizPage, page }) => {
    await createQuizPage.goHome();
    await expect(page).toHaveURL(/#\//);
  });
});
