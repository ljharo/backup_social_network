import { useEffect } from "react";
import { useLocation } from "react-router";

const InstagramCallback = () => {
  const location = useLocation();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    const error = new URLSearchParams(location.search).get("error");

    if (code) {
      // Enviar código a la ventana padre
      window.opener.postMessage(
        {
          type: "instagram-code-received",
          code: code,
        },
        window.location.origin
      );
    } else if (error) {
      window.opener.postMessage(
        {
          type: "instagram-auth-error",
          error: error,
        },
        window.location.origin
      );
    }

    window.close();
  }, [location]);

  return (
    <div className="callback-container">
      <p>Procesando autenticación...</p>
    </div>
  );
};

export default InstagramCallback;
