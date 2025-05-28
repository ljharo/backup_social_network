import axios, { AxiosError, AxiosResponse } from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface ErrorResponse {
  error: string;
  status_code: number;
  details?: Record<string, any>;
}

interface UserSimpleDetail {
  id: string;
  username: string;
  profile_picture_url?: string;
  account_type?: string;
  followers_count?: number;
  media_count?: number;
}

interface MediaPost {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  file_name?: string;
}

export class InstagramHelper {
  private access_token: string;
  private readonly URL_BASE = "https://graph.instagram.com/";

  constructor(access_token: string | null = null) {
    if (!access_token) {
      throw new Error("Tienes que ingresar el access_token.");
    }
    this.access_token = access_token;
  }

  private async get(url: string): Promise<Record<string, any> | ErrorResponse> {
    try {
      const response: AxiosResponse = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorData: ErrorResponse = {
        error: axiosError.message,
        status_code: axiosError.response?.status || 500,
        details: null,
      };

      if (axiosError.response?.data) {
        try {
          errorData.details =
            typeof axiosError.response.data === "object"
              ? axiosError.response.data
              : { message: axiosError.response.data };
        } catch (e) {
          errorData.details = { message: "Failed to parse error response" };
        }
      }

      return errorData;
    }
  }

  private async downloadFile(
    url: string,
    filePath: string
  ): Promise<string | null> {
    try {
      const parsedUrl = new URL(url);
      const fileName = path.basename(parsedUrl.pathname);
      const newPath = path.join(filePath, fileName);

      if (fs.existsSync(newPath)) {
        console.log("El archivo ya existe");
        return newPath;
      }

      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        timeout: 10000,
      });

      // Crear directorio si no existe
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      const writer = fs.createWriteStream(newPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(newPath));
        writer.on("error", (err) => {
          console.error(`Error al descargar la imagen: ${err}`);
          reject(null);
        });
      });
    } catch (error) {
      console.error(`Error al descargar el archivo: ${error}`);
      return null;
    }
  }

  private makeJson(data: Record<string, any>, filePath: string): void {
    try {
      // Crear directorio si no existe
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 4), "utf-8");
    } catch (error) {
      console.error(`Error al guardar el JSON: ${error}`);
    }
  }

  public async getUserSimpleDetail(): Promise<
    UserSimpleDetail | ErrorResponse
  > {
    const url = `${this.URL_BASE}me?fields=id,username,profile_picture_url,account_type,followers_count,media_count&access_token=${this.access_token}`;
    return this.get(url);
  }

  public async getUserFollowers(): Promise<
    Record<string, any> | ErrorResponse | null
  > {
    const userDetail = await this.getUserSimpleDetail();

    if ("error" in userDetail) {
      return userDetail;
    }

    const userId = (userDetail as UserSimpleDetail).id;
    const apiVersion = "v18.0";
    const url = `https://graph.facebook.com/${apiVersion}/${userId}`;

    const params = {
      fields: "username,followers_count,follows_count",
      access_token: this.access_token,
    };

    try {
      const response = await axios.get(url, { params });
      const data = response.data;

      console.log(`Usuario: ${data.username || "No disponible"}`);
      console.log(`Seguidores: ${data.followers_count || "No disponible"}`);
      console.log(`Siguiendo: ${data.follows_count || "No disponible"}`);

      return data;
    } catch (error) {
      console.error(`Error al hacer la solicitud: ${error}`);
      return null;
    }
  }

  public async getUserPosts(
    downloadMediaFile: boolean = false,
    makeJson: boolean = false
  ): Promise<MediaPost[] | ErrorResponse> {
    const url = `${this.URL_BASE}me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${this.access_token}`;

    const response = await this.get(url);
    if ("error" in response) {
      return response;
    }

    let posts = response.data as MediaPost[];

    if (downloadMediaFile) {
      const userDetail = await this.getUserSimpleDetail();
      let dirName: string;

      if ("error" in userDetail) {
        dirName = uuidv4();
      } else {
        dirName = (userDetail as UserSimpleDetail).id;
      }

      const newPath = path.join("images", dirName);
      const newData: MediaPost[] = [];

      for (const post of posts) {
        if (post.media_url) {
          const fileName = await this.downloadFile(post.media_url, newPath);
          newData.push({ ...post, file_name: fileName || undefined });
        } else {
          newData.push(post);
        }
      }

      posts = newData;
    }

    if (makeJson) {
      const fileName = `${uuidv4()}.json`;
      const jsonPath = path.join("json", fileName);
      this.makeJson(posts, jsonPath);
    }

    return posts;
  }
}
