import Navbar from "./components/Nav";
import MainContent from "./components/MainContent";

function App() {
  const handleSuccess = (token: string) => {
    console.log("Token obtenido:", token);
  };

  const handleFailure = (error: string) => {
    console.error("Error:", error);
  };

  return (
    <div className="app-container">
      <Navbar
        appId="TU_APP_ID_DE_INSTAGRAM"
        redirectUri={`${window.location.origin}/instagram-callback`}
        backendAuthEndpoint="/api/instagram-auth"
        onSuccess={handleSuccess}
        onFailure={handleFailure}
      />
      <MainContent isAuthenticated={false} />
    </div>
  );
}

export default App;
