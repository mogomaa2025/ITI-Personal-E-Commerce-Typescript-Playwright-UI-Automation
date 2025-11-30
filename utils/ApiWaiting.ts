import { Page, expect, Response } from '@playwright/test';

export class ApiWaiting {

//    /** 
//    * ⚠️ RACE CONDITION RISK: Waits for a specific network response to be received, 
//    * asserting its status and a key-value pair in its JSON body.
//    * * Use this when the action has already been performed (e.g., in a separate step or hook),
//    * but be aware that if the network request completes quickly, this method may miss it.
//    *
//    * @param page The Playwright Page object.
//    * @param endpoint The URL partial or full endpoint to wait for (e.g., '**/api/cart/items').
//    * @param expectedStatus The expected HTTP status code (e.g., 200).
//    * @param bodyKey The key to check in the JSON response body (e.g., 'message').
//    * @param bodyValue The expected value for that key (e.g., 'Item added successfully').
//    * @returns A Promise that resolves to the Playwright Response object.
//    **/

  static async waitForAndAssertResponse(
    page: Page,
    endpoint: string,
    expectedStatus: number,
    bodyKey: string,
    bodyValue: string,
  ): Promise<Response> {
    
    // 1. Wait for the response object.
    const response = await page.waitForResponse(endpoint);
    
    // 2. Assert the HTTP status code.
    await expect(response.status()).toBe(expectedStatus);

    // 3. Get and assert the JSON body content.
    try {
      const responseBody = await response.json();
      await expect(responseBody).toHaveProperty(bodyKey, bodyValue);
    } catch (error) {
      // Throw a specific error if the response can't be parsed or asserted.
      const responseText = await response.text();
      throw new Error(`
        Network assertion failed for endpoint: ${endpoint}. 
        Expected JSON property: '${bodyKey}' with value '${bodyValue}'.
        Received status: ${response.status()}. 
        Response body (or error): ${responseText.substring(0, 200)}...
      `);
    }
    
    return response;
  }



  static async waitForAndAssertResponseNoBody(
    page: Page,
    endpoint: string,
    expectedStatus: number,
  ): Promise<Response> {
    // 1. Wait for the response object.
    const response = await page.waitForResponse(endpoint);
    
    // 2. Assert the HTTP status code.
    await expect(response.status()).toBe(expectedStatus);
    
    return response;
  }





  static async waitForAndAssertResponseBoolean(
    page: Page,
    endpoint: string,
    expectedStatus: number,
    bodyKey: string,
    bodyValue: Boolean,
  ): Promise<Response> {
    
    // 1. Wait for the response object.
    const response = await page.waitForResponse(endpoint);
    
    // 2. Assert the HTTP status code.
    await expect(response.status()).toBe(expectedStatus);

    // 3. Get and assert the JSON body content.
    try {
      const responseBody = await response.json();
      await expect(responseBody).toHaveProperty(bodyKey, bodyValue);
    } catch (error) {
      // Throw a specific error if the response can't be parsed or asserted.
      const responseText = await response.text();
      throw new Error(`
        Network assertion failed for endpoint: ${endpoint}. 
        Expected JSON property: '${bodyKey}' with value '${bodyValue}'.
        Received status: ${response.status()}. 
        Response body (or error): ${responseText.substring(0, 200)}...
      `);
    }
    
    return response;
  }



  
    
}
