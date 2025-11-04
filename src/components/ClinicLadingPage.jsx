import React from "react";
import "./ClinicLandingPage.css";
import { useNavigate } from "react-router-dom";

function ClinicLadingPage() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="clinic-landing-page-main">
      <div className="clinic-left">
        <button onClick={handleNavigateToLogin}>Get Started</button>
      </div>
      <div className="clinic-right"></div>
    </div>
  );
}

export default ClinicLadingPage;
