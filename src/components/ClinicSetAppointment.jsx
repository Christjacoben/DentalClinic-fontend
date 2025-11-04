import React, { useEffect, useState } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import TextField from "@mui/material/TextField";
import SetAppointmentIcon from "../assets/set-appointment-icon.svg";
import "./ClinicSetAppointment.css";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import "react-toastify/dist/ReactToastify.css";

function ClinicSetAppointment({ selectedDate, user }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: selectedDate,
    time: selectedTime,
    firstName: user.name,
    lastName: user.lastName,
    address: user.address,
    contact: user.contact,
    userName: user.userName,
    dentalProcedure: "",
    status: "not confirmed",
  });

  useEffect(() => {
    setAppointmentData((prev) => ({
      ...prev,
      time: selectedTime,
    }));
  }, [selectedTime]);

  const handleSetAppointment = async () => {
    const formattedDate = appointmentData.date
      ? dayjs(appointmentData.date).format("YYYY-MM-DD")
      : "";

    const formattedTime = appointmentData.time
      ? appointmentData.time.format("hh:mm A")
      : "";

    const dataToSend = {
      ...appointmentData,
      date: formattedDate,
      time: formattedTime,
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments`,
        dataToSend,
        { withCredentials: true }
      );
      toast.success("Appointment set successfully!");
    } catch (err) {
      if (
        err.response?.data?.message ===
        "You already have an appointment on this date."
      ) {
        toast.error("You already have an appointment on this date.");
      } else {
        toast.error("Error setting appointment.");
      }
    }
  };

  const isValidTime = (time) => {
    if (!time) return false;
    const hour = time.hour();

    return (hour >= 9 && hour <= 12) || (hour >= 13 && hour <= 15);
  };

  const handleTimeChange = (newValue) => {
    if (!newValue) {
      setSelectedTime(null);
      return;
    }

    if (selectedTime && newValue && selectedTime.isSame(newValue, "minute")) {
      setSelectedTime(newValue);
      return;
    }

    const hour = newValue.hour();
    if (hour === null) {
      setSelectedTime(newValue);
      return;
    }

    if (isValidTime(newValue)) {
      setSelectedTime(newValue);
      toast.success("Selected time is valid.", { toastId: "time-valid" });
    } else {
      setSelectedTime(newValue);
      toast.error("Selected time is not allowed.", { toastId: "time-invalid" });
    }
  };

  return (
    <div className="set-appointment-main">
      <ToastContainer position="top-center" />
      <img src={SetAppointmentIcon} alt="Set Appointment Icon" />
      <div className="set-appointment-main-content">
        <div className="set-appointment-main-top">
          {user && (
            <>
              <p>First Name: {user.name}</p>
              <p>Address: {user.address}</p>

              <p>Contact: {user.contact}</p>
            </>
          )}
          {selectedDate && (
            <p>
              Selected Date:{" "}
              {selectedDate.toLocaleString("default", {
                month: "long",
              })}{" "}
              {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </p>
          )}
        </div>
        {user && (
          <div className="set-appointment-main-bottom">
            <p>Last Name: {user.lastName}</p>
            <div className="set-appointment-main-bottom-items">
              <p style={{ marginTop: "20px" }}>Time:</p>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Select time"
                  value={selectedTime}
                  onChange={handleTimeChange}
                  shouldDisableTime={(value, view) => {
                    if (view === "hours") {
                      const hour = value.hour();
                      const disabledHours = [
                        0, 4, 5, 6, 7, 8, 16, 17, 18, 19, 20,
                      ];

                      return disabledHours.includes(hour);
                    }
                    return false;
                  }} 
                  slotProps={{
                    textField: {
                      variant: "standard",
                      sx: {
                        width: 140,
                        height: 50,
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiInput-underline:before": {
                          borderBottom: "none",
                        },
                        "& .MuiInput-underline:after": {
                          borderBottom: "none",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
            <div className="set-appointment-main-bottom-items">
              <label htmlFor="">Dental Procedure:</label>
              <select
                name="dentalProcedure"
                id="dentalProcedure"
                value={appointmentData.dentalProcedure}
                onChange={(e) =>
                  setAppointmentData((prev) => ({
                    ...prev,
                    dentalProcedure: e.target.value,
                  }))
                }
              >
                <option value="">Select</option>
                <option value="consultation">Consultation</option>
                <option value="Resto/pasta">Resto/pasta</option>
                <option value="Denture/Pustiso">Denture/Pustiso</option>
                <option value="Exo/Bunot">Exo/Bunot</option>
                <option value="OP/Cleaning">OP/Cleaning</option>
                <option value="Ortho/Adjusment">Ortho/Adjusment</option>
                <option value="Endo/Root Canal">Endo/Root Canal</option>
              </select>
            </div>
            <button
              onClick={handleSetAppointment}
              className="button-set-appointment"
            >
              Set Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClinicSetAppointment;
