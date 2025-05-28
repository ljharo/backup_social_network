import InstagramLogin, { type InstagramLoginProps } from "./InstagramLogin";
import logo from "../img/cloud-server.png";
import "../styles/Navbar.css";

export default function Navbar(instagramProps: InstagramLoginProps) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="brand-identity">
          <img src={logo} alt="logo.jpg" className="logo" />
          <span className="page-title">Social Backup</span>
        </div>
        <div className="action-section">
          <InstagramLogin {...instagramProps} />
        </div>
      </div>
    </nav>
  );
}
