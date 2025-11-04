import React from "react";
import axios from "axios";
import "./ManageAppointment.css";
import AppointmentIcon from "../assets/appointment-manage-icon.svg";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageAppointment() {
  const [manageAppointments, setManageAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/appointments`,
          { withCredentials: true }
        );

        setManageAppointments(res.data);
      } catch (err) {
        console.error(
          "Error fetching appointments:",
          err.response?.data || err.message
        );
      }
    };
    fetchAppointments();

    const interval = setInterval(fetchAppointments, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAcceptAppointment = async (appt) => {
    const appointmentSubmitData = {
      ...appt,
      status: "confirmed",
    };
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appt.id}/confirm`,
        {
          contact: appt.contact,
          firstName: appt.firstName,
          lastName: appt.lastName,
          dentalProcedure: appt.dentalProcedure,
          date: appt.date,
        },
        { withCredentials: true }
      );
      toast.success("Appointment confirmed and SMS sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error confirming appointment."
      );
    }
  };
  const formatDatePH = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Manila",
    });
  };

  const formatTimePH = (timeStr) => {
    if (!timeStr) return "";

    if (
      timeStr.toLowerCase().includes("am") ||
      timeStr.toLowerCase().includes("pm")
    ) {
      return timeStr;
    }

    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  return (
    <div className="manage-appointment-main">
      <ToastContainer position="top-center" />
      <div className="manage-appointment-main-top">
        <img src={AppointmentIcon} alt="Appointment Icon" />
      </div>
      <div className="manage-appointment-main-bottom">
        <h4 style={{ color: "brown" }}>APPOINTMENTS</h4>
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Address</th>
              <th>Contact</th>

              <th>Date</th>
              <th>Time</th>
              <th>Dental Procedure</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {manageAppointments
              .filter((appt) => {
                const apptDate = new Date(appt.date);
                const now = new Date();
                const isSameMonth =
                  apptDate.getFullYear() === now.getFullYear() &&
                  apptDate.getMonth() === now.getMonth();

                return isSameMonth && appt.status !== "confirmed";
              })
              .map((appt) => {
                const isPastDate =
                  new Date(appt.date).setHours(0, 0, 0, 0) <
                  new Date().setHours(0, 0, 0, 0);

                return (
                  <tr key={appt.id}>
                    <td>{appt.firstName}</td>
                    <td>{appt.lastName}</td>
                    <td>{appt.address}</td>
                    <td>{appt.contact}</td>

                    <td>{formatDatePH(appt.date)}</td>
                    <td>{formatTimePH(appt.time)}</td>
                    <td>{appt.dentalProcedure}</td>
                    <td>
                      <button
                        onClick={() => handleAcceptAppointment(appt)}
                        className={`accept-button-manage-appointment ${
                          isPastDate ? "disabled-button" : ""
                        }`}
                        disabled={isPastDate}
                      >
                        Accept
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageAppointment;
