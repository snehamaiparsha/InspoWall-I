import { useNavigate } from "react-router";
import Image from "../image/image";
import UserButton from "../userButton/userButton";
import "./topBar.css";

const TopBar = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = e.target[0].value.trim();
    if (value) navigate(`/search?search=${value}`);
  };

  return (
    <div className="topBar">
      {/* SEARCH */}
      <form onSubmit={handleSubmit} className="search">
        <Image path="/general/search.svg" alt="Search Icon" />
        <input type="text" placeholder="Search inspirations..." />
      </form>

      {/* USER */}
      <div className="userButton">
        <UserButton />
      </div>
    </div>
  );
};

export default TopBar;
