const BACKEND_URL: string = "http://localhost:3001";

interface CredentialsIntgram {
    clientId: string;
    redirectUri:string;
}

export asyncfunction getInstagramCredentials(): Promise<CredentialsIntgram> {}

export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error HTTP: ' + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error al obtener datos: ' + error.message);
  }
}


