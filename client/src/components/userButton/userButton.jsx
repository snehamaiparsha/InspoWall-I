import { useState } from "react";
import "./userButton.css";
import Image from "../image/image";
import apiRequest from "../../utils/apiRequest";
import { Link, useNavigate } from "react-router-dom"; // ✅ fixed import
import useAuthStore from "../../utils/authStore";

const UserButton = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, removeCurrentUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/auth/logout", {});
      removeCurrentUser();
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }
  };

  return currentUser ? (
    <div className={`userButton ${open ? "open" : ""}`}>
      <Image
        path={currentUser.img || "/general/pinkavatar.png"}
        alt=""
        className="userAvatar"
      />
      <div onClick={() => setOpen((prev) => !prev)}>
        <Image path="/general/arrow.svg" alt="" className="arrow" />
      </div>
      {open && (
        <div className="userOptions">
          <Link
            to={`/${currentUser.username}`}
            className="userOption"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>

          <div className="userOption" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  ) : (
    <Link to="/auth" className="loginLink">
      Login / Sign Up
    </Link>
  );
};

export default UserButton;
