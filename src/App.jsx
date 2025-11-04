import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClinicLadingPage from "./components/ClinicLadingPage";
import ClinicLogin from "./components/ClinicLogin";
import ClinicSignUp from "./components/ClinicSignUp";
import ClinicAdminDashboard from "./components/ClinicAdminDashboard";
import ClinicUserDashboard from "./components/ClinicUserDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClinicLadingPage />} />
        <Route path="/login" element={<ClinicLogin />} />
        <Route path="/signup" element={<ClinicSignUp />} />
        <Route path="/admin-dashboard" element={<ClinicAdminDashboard />} />
        <Route path="/user-dashboard" element={<ClinicUserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
