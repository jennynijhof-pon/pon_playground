import { test as setup, expect } from '@playwright/test';
import { writeFile } from 'fs/promises';
import path from 'path';

type VehicleTestData = {
  kommnummer: string;
  filename: string;
};

setup('create Audi vehicle test data through API', async ({ playwright }) => {
  const request = await playwright.request.newContext({
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.API_PASSWORD}`,
      'X-Correlation-ID': `playwright-${Date.now()}`,
    },
    clientCertificates: [
      {
        origin: process.env.API_BASE_URL!,
        pfxPath: process.env.API_CERT_PFX_PATH!,
        passphrase: process.env.API_CERT_PASSPHRASE,
      },
    ],
  });

  const requestBody = {
    "SalesBrand": "A",
    "ExternalOrderNumber": "teststandaardAD",
    "OwningDealerNumber": "200372",
    "DeliveredToDealerNumber": "200372",
    "DeliveryAddressName": "200372",
    "DeliveringDealerNumber": "200372",
    "DeliverAsSoonAsPossible": false,
    "NotDeliverBeforeDate": "2025-09-11",
    "DesiredDeliveryDate": "2025-09-16",
    "DesiredProductionWeek": "202525",
    "CustomerID": "123456",
    "DriverID": "Driver01",
    "LesseeID": "Lease02",
    "Remark": "Remark",
    "QuoteID": "AD123",
    "AgreementNumber": "111222333",
    "VehicleSpecification": {
      "ModelCode": "8YFBNG",
      "NationalVehicleCode": "AED",
      "ModelYear": "2025",
      "ColourCodeFinish": "M4",
      "ColourCodeTop": "M4",
      "InteriorCode": "AI",
      "Features": "4ZB,9VD,IT3,IU4,PWD,PX2,PYG,WN1"
    }
  };

  const response = await request.post('/rest/importervehicleorder/v1/orders', {
    data: requestBody,
  });

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  const vehicles: VehicleTestData[] = [
    {
      kommnummer: body.CommissionNumber,
      filename: `${requestBody.VehicleSpecification.ModelCode}.xlsx`,
    },
  ];

  const fileContent = `export type VehicleTestData = {
  kommnummer: string;
  filename: string;
}

export const vehicles: VehicleTestData[] = ${JSON.stringify(vehicles, null, 2)};
`;

  await writeFile(
    path.resolve(__dirname, '../../test-data/verhicles/audi-vehicles.ts'),
    fileContent
  );

  await writeFile(
    path.resolve(__dirname, '../../test-data/verhicles/audi-vehicles.json'),
    JSON.stringify(vehicles, null, 2)
  );

  await request.dispose();
});
