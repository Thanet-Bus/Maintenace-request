import { API_BASE_URL } from '../config';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export async function apiClient(endpoint: string, options: FetchOptions = {}) {
  const { data, headers: customHeaders, ...customOptions } = options;

  const token = localStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true', // Essential for bypassing ngrok warning
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    if (data instanceof FormData) {
      // Fetch automatically sets the correct Content-Type with boundary for FormData
      customOptions.body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      customOptions.body = JSON.stringify(data);
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers,
    ...customOptions,
  });

  // Depending on what the backend returns for 401s, we could handle forced logout here
  if (response.status === 401) {
    // Optionally trigger a redirect to login or clear token here.
  }

  // Some endpoints might return empty body (e.g. 204 No Content), so handle JSON parsing carefully
  let responseData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    throw new Error(responseData?.detail || responseData?.message || `Request failed with status ${response.status}`);
  }

  return responseData;
}
