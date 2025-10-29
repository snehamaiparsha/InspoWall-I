import Image from "../image/image";
import { Link } from "react-router";
import "./leftBar.css";

const LeftBar = () => {
  return (
    <div className="leftBar">
      <div className="menuIcons">
        <Link to="/" className="menuIcon">
          <Image
            path="/general/InspoWall-logo-transparent.png"
            alt="InspoWall Logo"
            className="logo"
          />
        </Link>
        <div
          style={{
            width: "50%",
            height: "1px",
            background: "#eee",
            margin: "8px 0",
          }}
        />
        <Link to="/" className="menuIcon">
          <Image path="/general/home.svg" alt="Home" />
        </Link>
        <Link to="/create" className="menuIcon">
          <Image path="/general/create.svg" alt="Create" />
        </Link>
        <Link to="/" className="menuIcon">
          <Image path="/general/updates.svg" alt="Updates" />
        </Link>
        <Link to="/" className="menuIcon">
          <Image path="/general/messages.svg" alt="Messages" />
        </Link>
      </div>

      <Link to="/" className="menuIcon">
        <Image path="/general/settings.svg" alt="Settings" />
      </Link>
    </div>
  );
};

export default LeftBar;
