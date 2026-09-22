import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { TdgLogin } from '../src/pages/tdgLogin';
import {  TestDataGeneration } from '../src/pages/TestDataGenerator';

type VehicleTestData = {
  kommnummer: string;
  filename: string;
};

async function getVehicles(): Promise<VehicleTestData[]> {
  const vehiclesFile = path.resolve(process.cwd(), 'test-data/verhicles/audi-vehicles.json');
  const vehicles = await readFile(vehiclesFile, 'utf-8');
  return JSON.parse(vehicles) as VehicleTestData[];
}

test.describe('Aanmaken testdata in TDG', () => { 
  let tdgLogin: TdgLogin;
  let searchVehicle: TestDataGeneration;

  test.beforeEach(({ page }) => { 
    tdgLogin = new TdgLogin(page);   
    searchVehicle = new TestDataGeneration(page);

  });


  test(`Change the order status to Scheduled`, async ({page}) => { 
    const vehicles = await getVehicles();

    for (const vehicle of vehicles) {
    await test.step('navigate to the Test Data Generation', async () => { 
      await tdgLogin.visitTestDataGenerator();
    });

    await test.step(`Search for vehicle with kommnummer ${vehicle.kommnummer}`, async () => {
      await expect (searchVehicle.headerText).toBeVisible();
      await searchVehicle.searchForVehicle(vehicle.kommnummer);

      const tdgKommnummer = page.getByRole('cell', { name: vehicle.kommnummer });
      await expect(tdgKommnummer).toHaveText(vehicle.kommnummer);

    });

    await test.step(`Upload the WLTP file (COM 1) for vehicle with kommnummer ${vehicle.kommnummer}`, async () => { 
      await searchVehicle.uploadWLTP(vehicle.filename);
      const confirmDataLoaded = page.locator('span', { hasText: 'Data Loaded.' });
      await expect(confirmDataLoaded).toBeVisible();
    });

    await test.step('Click the "scheduled" switch', async () => { 
      await searchVehicle.scheduleVehicle();
      const frozenPeriodSwitch = page.getByRole('switch', {name: 'Frozen Period'});
      const scheduledSwitch = page.getByRole('switch', {name: 'Scheduled'}); 

      await expect(frozenPeriodSwitch).toHaveAttribute('aria-checked', 'true');
      await expect(scheduledSwitch).toHaveAttribute('aria-checked', 'true');
    });
    }
  });
}); 
