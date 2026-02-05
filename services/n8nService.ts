import { ApiRequestPayload, ApiResponse } from '../types';

export const sendToWebhook = async (
  url: string,
  payload: ApiRequestPayload
): Promise<ApiResponse> => {
  if (!url) {
    throw new Error('URL do Webhook não configurada.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na comunicação: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate expected response structure based on requirements
    if (typeof data.summary !== 'string') {
      // Fallback if the webhook returns just text or a different key, adapt as needed
      if (data.text) return { summary: data.text };
      if (data.output) return { summary: data.output };
      // If purely JSON object without known keys, stringify it
      return { summary: JSON.stringify(data, null, 2) };
    }

    return data as ApiResponse;
  } catch (error) {
    console.error('Webhook Error:', error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};