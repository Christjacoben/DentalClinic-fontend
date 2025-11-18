import React, { useState } from "react";
import ClinicUserInfoImg from "../assets/clinic-user-info-imge.svg";
import "./ClinicUserInfo.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ClinicUserInfo({ user }) {
  if (!user) {
    return <div>Loading...</div>;
  }
  const [clinicUserData, setClinicUserData] = useState({
    userName: user.userName,
    firstName: user.name,
    lastName: "",

    address: "",
    contact: "",
  });

  const handleClinicDataChangeInput = (e) => {
    const { name, value } = e.target;
    setClinicUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClinicUserData = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user-info`,
        {
          lastName: clinicUserData.lastName,

          address: clinicUserData.address,
          contact: clinicUserData.contact,
        },
        { withCredentials: true }
      );
      toast.success("User info updated successfully!");
    } catch (err) {
      toast.error("Failed to update user info.");
    }
  };

  return (
    <div className="clinic-user-info-container">
      <ToastContainer position="top-center" />
      <div className="clinic-user-info-top">
        <img src={ClinicUserInfoImg} alt="Clinic User Info" />
      </div>
      <div className="clinic-user-info-bottom">
        <div className="clinic-user-info-bottom-left">
          <div className="clinic-user-info-bottom-left-items">
            <p>FIRST NAME: {user.name}</p>
          </div>
          <div className="clinic-user-info-bottom-right-items">
            <label htmlFor="last-name-input" id="last-name-label">
              Last Name:
            </label>
            {user.lastName ? (
              <span>{user.lastName}</span>
            ) : (
              <input
                type="text"
                id="last-name-input"
                name="lastName"
                value={clinicUserData.lastName}
                onChange={handleClinicDataChangeInput}
              />
            )}
          </div>
        </div>
        <div className="clinic-user-info-bottom-right">
           <div className="clinic-user-info-bottom-left-items">
            <label htmlFor="address-input" id="address-label">
              ADDRESS:
            </label>
            {user.address ? (
              <span>{user.address}</span>
            ) : (
              <input
                type="text"
                id="address-input"
                name="address"
                value={clinicUserData.address}
                onChange={handleClinicDataChangeInput}
              />
            )}
          </div>
         
          <div className="clinic-user-info-bottom-right-items">
            <label htmlFor="contact-input" id="contact-label">
              Contact No#:
            </label>
            {user.contact ? (
              <span>{user.contact}</span>
            ) : (
              <input
                type="text"
                id="contact-input"
                name="contact"
                value={clinicUserData.contact}
                onChange={handleClinicDataChangeInput}
              />
            )}
          </div>
          <div className="clinic-user-info-bottom-right-items">
            {(!user.lastName || !user.address || !user.contact) && (
              <button onClick={handleClinicUserData}>Submit</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicUserInfo;
