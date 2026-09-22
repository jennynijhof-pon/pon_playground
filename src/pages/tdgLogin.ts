
import { tdgConfig } from '../utils/tdgConfig';
import { test, expect, Page } from '@playwright/test';

export class TdgLogin {
  public readonly page: Page;

    constructor(page: Page) {
    this.page = page;
  }

  public async visitTestDataGenerator() {
      await this.page.goto(tdgConfig.baseUrl); 
      await expect (this.page.getByRole('button', {name: 'Search orders'})).toBeVisible()
  }
} 

