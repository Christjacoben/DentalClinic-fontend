import React, { useState, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { IoMdLock } from "react-icons/io";
import axios from "axios";
import "./ClinicLogin.css";
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";

function ClinicLogin() {
  const [clinicShowPassword, setClinicShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const loginShowPasswordChange = () => {
    setClinicShowPassword((prev) => !prev);
  };

  const handleClinicLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!recaptchaToken) {
      setLoading(false);
      toast.error("Please complete the captcha first.");
      return;
    }

    setTimeout(async () => {
      try {
        const res = await axios.post(
          
          "https://dentalclinic-backend-mtue.onrender.com/api/login",
          { userName, password, recaptchaToken },
          { withCredentials: true }
        );
        toast.success("Login Successful");
        const user = res.data.user;
        setLoading(false);

        setRecaptchaToken(null);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } catch (err) {
        setLoading(false);
        toast.error(err.response?.data?.message || "Something went wrong");
        setError(err.response?.data?.message || "Something went wrong");
      }
    }, 5000);
  };

  const handleNavigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="clinic-login-main">
      <ToastContainer position="top-center" />
      <div className="clinic-login-child">
        <div className="clinic-login-left"></div>

        <form className="clinic-login-form" onSubmit={handleClinicLogin}>
          <h1>Welcome!</h1>
          <div className="login-input">
            <FaUser size={25} color="white" style={{ marginLeft: "10px" }} />
            <input
              type="text"
              placeholder="Enter UserName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="login-input">
            <IoMdLock size={30} color="white" style={{ marginLeft: "10px" }} />
            <input
              type={clinicShowPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="login-checkbox">
            <input
              type="checkbox"
              className="show-password-checkbox"
              id="checkbox"
              checked={clinicShowPassword}
              onChange={loginShowPasswordChange}
            />
            <label htmlFor="checkbox">show password</label>
          </div>

          {recaptchaToken ? (
            <button type="submit" disabled={loading}>
              {loading ? <PulseLoader color="#fff" size={10} /> : "Login"}
            </button>
          ) : (
            <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              Please complete the captcha to enable Login
            </div>
          )}

          <div style={{ marginTop: "5px", marginBottom: "-50px" }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>

          <div className="signup-indicator">
            <p>Don't have an account?</p>
            <p
              onClick={handleNavigateToSignup}
              style={{
                marginLeft: "5px",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Signup
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClinicLogin;
