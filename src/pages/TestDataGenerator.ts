import { Locator, Page } from '@playwright/test'; 
import path from 'path';

export class TestDataGeneration {
  readonly page: Page; 
  readonly headerText: Locator;  
  readonly searchOrders: Locator;
  readonly searchField: Locator;
  readonly searchButton: Locator; 
  readonly comOneButton: Locator;
  readonly loadWltpButton: Locator;
  readonly scheduleVehicleButton: Locator;
  constructor(page: Page) {
    this.page = page; 
    this.headerText = page.getByText('Testdata Generation');
    this.searchOrders = page.getByRole('button', {name: 'Search orders'});
    this.searchField = page.getByLabel('Values:'); 
    this.searchButton = page.getByRole('button', {name: 'Search', exact: true});
    this.comOneButton = page.getByRole('button', {name: 'COM I', exact: true });
    this.loadWltpButton = page.getByRole('button', {name: 'Load WLTP', exact: true});
    this.scheduleVehicleButton = page.getByText('Scheduled', {exact: true});
  }

  async searchForVehicle(kommnummer: string) { 
    await this.searchOrders.click(); 
    await this.searchField.fill(`211;${kommnummer};2026`)
    await this.searchButton.click();
  }

  async uploadWLTP(fileName: string) {
    const filePath = path.resolve('test-data/WLTP', fileName);
    await this.comOneButton.click();
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.loadWltpButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  async scheduleVehicle(){ 
    await this.scheduleVehicleButton.click();
  }
}
