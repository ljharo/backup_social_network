import content from "../img/blogging.png";
import "../styles/MainContent.css";

interface MainContentProps {
  isAuthenticated: boolean;
}

function EmptyState() {
  // Tamaños predefinidos para la imagen
  const sizeClasses = {
    small: "max-w-[200px]",
    medium: "max-w-[300px]",
    large: "max-w-[400px]",
  };

  return (
    <div className="empty-state">
      <img
        src={content}
        alt="No content"
        className={`empty-state-image ${sizeClasses.small}`}
      />
      <h2 className="empty-state-title">There is no content</h2>
    </div>
  );
}

export default function MainContent(props: MainContentProps) {
  const isAuthenticated = props.isAuthenticated;

  if (!isAuthenticated) {
    return (
      <main className="main-content unauthenticated">
        <EmptyState />
      </main>
    );
  }
  return <main className="main-content">{/* Contenido autenticado */}</main>;
}
