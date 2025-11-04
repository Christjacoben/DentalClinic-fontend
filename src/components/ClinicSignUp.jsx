import React, { useEffect, useRef, useState } from "react";
import { IoMdLock } from "react-icons/io";
import { HiOutlineMail } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";
import "./ClinicSignup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";

function ClinicSignUp() {
  const [adminExists, setAdminExists] = useState(false);
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [signupClinicFormData, setSignupClinicFormData] = useState({
    name: "",
    userName: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const recaptchaRef = useRef(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users/admin-exists`)
      .then((res) => setAdminExists(res.data.adminExists))
      .catch(() => setAdminExists(false));
  }, []);

  useEffect(() => {
    if (
      signupClinicFormData.password &&
      signupClinicFormData.confirmPassword &&
      signupClinicFormData.password === signupClinicFormData.confirmPassword
    ) {
      setIsConfirmed(true);
    } else {
      setIsConfirmed(false);
    }
  }, [signupClinicFormData.password, signupClinicFormData.confirmPassword]);

  const handleClinicOnchange = (name, value) => {
    setSignupClinicFormData({ ...signupClinicFormData, [name]: value });
  };

  const handleSignupShowPassword = () => {
    setSignupShowPassword((prev) => !prev);
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  const handlClinicSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!recaptchaToken) {
      toast.error("Please complete the captcha.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          name: signupClinicFormData.name,
          userName: signupClinicFormData.userName,
          password: signupClinicFormData.password,
          role: signupClinicFormData.role,
          recaptchaToken,
        },
        { withCredentials: true }
      );
      toast.success(res.data.message);

      setSignupClinicFormData({
        name: "",
        userName: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
      setRecaptchaToken(null);
      if (recaptchaRef.current) recaptchaRef.current.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div className="clinic-signup-main">
      <ToastContainer position="top-center" />
      <div className="clinic-signup-child">
        <form className="clinic-signup-form" onSubmit={handlClinicSubmit}>
          <h1>Sign Up!</h1>
          <div className="clinin-signup-input" style={{ marginTop: "-15px" }}>
            <FaUser size={28} color="white" className="signup-icons" />
            <input
              type="text"
              placeholder="Enter First Name"
              value={signupClinicFormData.name}
              onChange={(e) => handleClinicOnchange("name", e.target.value)}
            />
          </div>
          <div className="clinin-signup-input">
            <HiOutlineMail size={33} color="white" className="signup-icons" />
            <input
              type="text"
              placeholder="Enter Username"
              value={signupClinicFormData.userName}
              onChange={(e) => handleClinicOnchange("userName", e.target.value)}
            />
          </div>
          <div className="clinin-signup-input">
            <IoMdLock size={33} color="white" className="signup-icons" />
            <input
              value={signupClinicFormData.password}
              onChange={(e) => handleClinicOnchange("password", e.target.value)}
              type={signupShowPassword ? "text" : "password"}
              placeholder="Enter Password"
            />
            {signupClinicFormData.confirmPassword &&
              (isConfirmed ? (
                <FaCircleCheck color="white" />
              ) : (
                <IoIosCloseCircle size={20} color="white" />
              ))}
          </div>
          <div className="clinin-signup-input">
            <IoMdLock size={33} color="white" className="signup-icons" />
            <input
              value={signupClinicFormData.confirmPassword}
              onChange={(e) =>
                handleClinicOnchange("confirmPassword", e.target.value)
              }
              type={signupShowPassword ? "text" : "password"}
              placeholder="Confirm Password"
            />
            {signupClinicFormData.confirmPassword &&
              (isConfirmed ? (
                <FaCircleCheck color="white" />
              ) : (
                <IoIosCloseCircle size={20} color="white" />
              ))}
          </div>
          <div className="signup-checkbox">
            <input
              type="checkbox"
              checked={signupShowPassword}
              onChange={handleSignupShowPassword}
              id="signup-checkbox"
              className="signup-checkbox-indicator"
            />
            <label htmlFor="signup-checkbox">show password</label>
            {!adminExists && (
              <>
                <input
                  type="checkbox"
                  className="signup-checkbox-indicator"
                  checked={signupClinicFormData.role === "admin"}
                  onChange={() =>
                    setSignupClinicFormData({
                      ...signupClinicFormData,
                      role:
                        signupClinicFormData.role === "admin"
                          ? "user"
                          : "admin",
                    })
                  }
                  id="admin"
                />
                <label htmlFor="admin">Admin</label>
              </>
            )}
          </div>

          {recaptchaToken ? (
            <button style={{ marginTop: "5px" }} type="submit">
              Sign Up
            </button>
          ) : (
            <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              Please complete the captcha to enable Sign Up
            </div>
          )}
          <div style={{ margin: "10px 0" }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
            />
          </div>

          <div className="signup-text">
            <p style={{ marginTop: "-10px" }}>Already have an account?</p>
            <p
              onClick={handleNavigateToLogin}
              style={{
                cursor: "pointer",
                textDecoration: "underline",
                marginTop: "-10px",
              }}
            >
              Login
            </p>
          </div>
        </form>
        <div className="clinic-signup-right"></div>
      </div>
    </div>
  );
}

export default ClinicSignUp;
