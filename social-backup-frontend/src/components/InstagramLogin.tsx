import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import "../styles/InstagramLogin.css";

export interface InstagramLoginProps {
  appId: string;
  redirectUri: string;
  backendAuthEndpoint: string;
  onSuccess: (token: string) => void;
  onFailure: (error: string) => void;
}

interface MessageEventData {
  type: string;
  code?: string;
  error?: string;
}

export default function InstagramLogin(props: InstagramLoginProps) {
  const { appId, redirectUri, backendAuthEndpoint, onSuccess, onFailure } =
    props;

  const [popup, setPopup] = useState<Window | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<MessageEventData>) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "instagram-code-received" && event.data.code) {
        try {
          const response = await axios.post<{ access_token: string }>(
            backendAuthEndpoint,
            { code: event.data.code }
          );
          onSuccess(response.data.access_token);
        } catch (error) {
          const axiosError = error as AxiosError<{ error?: string }>;
          onFailure(
            axiosError.response?.data?.error ||
              axiosError.message ||
              "Error al obtener token"
          );
        } finally {
          popup?.close();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSuccess, onFailure, backendAuthEndpoint, popup]);

  const handleLogin = () => {
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=user_profile,user_media&response_type=code`;
    const newPopup = window.open(authUrl, "_blank", "width=600,height=600");

    if (!newPopup || newPopup.closed) {
      onFailure("Por favor permite ventanas emergentes para este sitio");
      return;
    }

    setPopup(newPopup);
  };

  return (
    <div className="instagram-login-container">
      <button className="instagram-login-button" onClick={handleLogin}>
        <span className="instagram-icon"></span>
        sign in
      </button>
    </div>
  );
}
