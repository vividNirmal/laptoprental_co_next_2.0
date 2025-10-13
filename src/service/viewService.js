//const baseURL = "http://localhost:7000/api/v1";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.laptoprental.co/api/v1";


function getToken(tokenKey = "token") {
  if (typeof window !== "undefined") {
    return localStorage.getItem(tokenKey);
  }
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzljYzgwZWZlZTliNzA5MWFkODA4ZTEiLCJlbWFpbCI6ImZhaXppbW9oZGluZGlhQGdtYWlsLmNvbSIsIm5hbWUiOiJGYWl6aU1vaGQiLCJyb2xlIjoiMCIsInN1Yl9yb2xlIjoiMCIsInBob25lX251bWJlciI6IjEyMzQ1Njc4OTkiLCJwcm9maWxlX3BpYyI6InNkIiwid2Vic2l0ZSI6InMgZGYiLCJzaG93X3dlYnNpdGUiOiJZZXMiLCJpc19hcHByb3ZlZCI6IlllcyIsImlzX3ZlcmlmaWVkIjoiWWVzIiwiaXNfYmxvY2tlZCI6Ik5vIiwiaWF0IjoxNzUzMTU5MzU5LCJleHAiOjE3NTMxODgxNTl9.Itr6IWpLNO2vGU6rI2-oHsuU9X-vBpBEGq6jM_p9Hwg";
}

export async function getRequest(path) {
  const token = getToken();
  if (!token) {
    localStorage.removeItem("token");
    window.location.href = "/dashboard/login";
  }
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        if (!response.ok && (response.status == 403 || response.status == 401)) {
          localStorage.removeItem("token");
          window.location.href = "/dashboard/login";
        }
      }
    })
    .catch((error) => {
      console.error(error)
    });
}

export async function getApiWithParam(path, param) {
  const token = getToken();
  if (!token) {
    throw new Error("No token found");
  }
  return fetch(`${baseURL}/${path}/${param}`, {
    next: { revalidate: 3600 },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .catch(() => ({ success: false }));
}

export async function postRequest(path, data) {
  const token = getToken();
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function deleteRequest(path) {
  return fetch(`${baseURL}/${path}`, { method: "DELETE" })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function updateRequest(path, data) {
  return fetch(`${baseURL}/${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function patchUpdateRequest(path, data) {
  return fetch(`${baseURL}/${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function getApiResponce(path, apikey) {
  return fetch(`${path}`, {
    method: "GET",
    headers: {
      "X-Api-Key": `${apikey}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function loginRequest(path, data) {

  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}

export async function fileDownloadRequest(method, url, data = null) {
  const fullUrl = `${baseURL}/${url}`;
  const token = getToken();

  const options = {
    method: method,
    headers: {},
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (data) {
    if (data instanceof FormData) {

      options.body = data;
    } else {
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(data) ?? JSON.stringify(data);
    }
  }

  //try {
  const response = await fetch(fullUrl, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.blob(); // Return blob for file download 
}


export async function userGetRequest(path) {
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((error) => {
      return error
    });
}

export async function userPostRequest(path, data) {
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}
export async function userGetRequestWithToken(path) {
  const token = getToken('usertoken');
  if(!token){
    throw new Error("No token found");
  }
  return fetch(`${baseURL}/${path}`, {
    next: { revalidate: 3600 },
     headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((error) => {
      return error
    });
}
export async function userPostRequestWithToken(path, data) {
  const token = getToken('usertoken');
  if(!token){
    throw new Error("No token found");
  }
  return fetch(`${baseURL}/${path}`, {
    method: "POST",
     headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  })
    .then((response) => response.json())
    .catch((error) => console.error(error));
}