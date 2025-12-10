
import { GOOGLE_SCRIPT_URL } from '../constants';
import { AppItem, ApiResponse, SheetName } from '../types';

/**
 * Helper to retry fetch requests on failure (useful for GAS "cold starts" or network blips).
 */
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, backoff = 1500): Promise<Response> => {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (err) {
      lastError = err;
      // If it's a TypeError, it's often a CORS/Network issue which might not resolve with retry immediately,
      // but we try anyway.
      const delayTime = backoff * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed. Error: ${err.message}. Retrying in ${delayTime}ms...`);
      // Exponential backoff
      await new Promise(r => setTimeout(r, delayTime)); 
    }
  }
  throw lastError;
};

/**
 * Fetches data for a specific sheet.
 */
export const fetchRemoteSheetData = async (sheetName: SheetName): Promise<AppItem[]> => {
  try {
    // FIX: Added 'action=read' parameter. Many GAS scripts require an action router.
    const url = `${GOOGLE_SCRIPT_URL}?action=read&sheet=${sheetName}&t=${new Date().getTime()}`;
    
    // CRITICAL for GAS: 
    // 1. credentials: 'omit' -> prevents multi-login CORS issues
    // 2. No custom headers -> prevents Preflight (OPTIONS) check which GAS fails
    const response = await fetchWithRetry(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit', 
      redirect: 'follow',
    });

    // Safety check: Google sometimes returns HTML error pages with 200 OK (e.g. script crash or auth page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      await response.text(); // Consume body
      console.error(`Received HTML instead of JSON for ${sheetName}. This usually means the script crashed or permissions are wrong.`);
      throw new Error(`Server returned HTML error for ${sheetName}. Check Script Permissions.`);
    }

    const result = await response.json();

    // Check for script-level errors
    if (result && result.status === 'error') {
      throw new Error(result.message || 'Script returned error status');
    }

    return Array.isArray(result) ? result : (result.data || []);
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error(`CORS or Network Error for ${sheetName}. Ensure the Google Script is deployed as "Anyone".`);
    } else {
      console.error(`Failed to fetch remote data for ${sheetName}.`, error);
    }
    throw error;
  }
};

/**
 * Sends data to the Google Sheet (Add, Update, Delete).
 */
export const postDataToSheet = async (sheetName: SheetName, payload: AppItem, action: string = 'add'): Promise<ApiResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('action', action.toLowerCase());
    params.append('sheet', sheetName);
    const dataStr = JSON.stringify(payload);
    params.append('data', dataStr);

    // Warning for huge payloads
    if (dataStr.length > 500000) {
      console.warn(`⚠️ Warning: Payload for ${sheetName} is very large (${Math.round(dataStr.length / 1024)}KB). Sync might fail.`);
    }

    // Use URLSearchParams for simple POST (no preflight)
    // Retry with longer backoff for POST
    const response = await fetchWithRetry(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }, 2, 2000); // 2 retries, 2s initial delay
    
    const result = await response.json();
    if (result.status === 'error') {
        throw new Error(result.message);
    }
    return result;
  } catch (error) {
    console.error(`Failed to post data to ${sheetName}:`, error);
    throw error;
  }
};
