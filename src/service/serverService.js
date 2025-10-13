export async function getRequest(path) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;  
  
  // Real-time data fetching with no cache
  return fetch(`${baseURL}/${path}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Force fresh data on every request
    next: { revalidate: 60 }
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.warn(`API request failed: ${baseURL}/${path}`, response.status);
        return false;
      }
    })
    .catch((error) => {
      console.error(`API request error for ${path}:`, error);
      return false;
    });
}


