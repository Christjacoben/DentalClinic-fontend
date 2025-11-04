import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagePatient.css";
import ManagePatientIcon from "../assets/all-appointment-icon.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Reschedule from "../assets/reschedule.svg";
import { IoIosCloseCircle } from "react-icons/io";

function ManagePatient() {
  const [patients, setPatients] = useState([]);
  const [reschedule, setReschedule] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const fetchConfirmedAppointments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/appointments/confirmed`,
          { withCredentials: true }
        );
        setPatients(res.data);
      } catch (err) {
        console.error(
          "Error fetching confirmed appointments:",
          err.response?.data || err.message
        );
      }
    };
    fetchConfirmedAppointments();
    const interval = setInterval(fetchConfirmedAppointments, 2000);

    return () => clearInterval(interval);
  }, []);

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

  const markAsDone = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments/${id}/finish`,
        {},
        { withCredentials: true }
      );
      toast.success("Appointment marked as done!");

      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error marking as done.");
    }
  };

  const handleRescheduleClose = () => {
    setReschedule(false);
  };

  const handleReschedule = (id) => {
    setReschedule(!reschedule);
    setRescheduleId(id);
  };
  return (
    <div className="manage-Patient-container">
      <ToastContainer position="top-center" />
      <div className="manage-Patient-container-top">
        <img src={ManagePatientIcon} alt="ManagePatientIcon" />
      </div>
      <div className="manage-Patient-container-bottom">
        <h4>CONFIRM PATIENTS APPOINTSMENT</h4>
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Address</th>
              <th>Age</th>
              <th>Date</th>
              <th>Time</th>
              <th>Dental Procedure</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const apptDate = new Date(patient.date);
              const now = new Date();

              apptDate.setHours(0, 0, 0, 0);
              now.setHours(0, 0, 0, 0);
              const isPast = apptDate < now;

              return (
                <tr key={patient.id}>
                  <td>{patient.firstName}</td>
                  <td>{patient.lastName}</td>
                  <td>{patient.address}</td>
                  <td>{patient.age}</td>
                  <td>{formatDatePH(patient.date)}</td>
                  <td>{formatTimePH(patient.time)}</td>
                  <td>{patient.dentalProcedure}</td>
                  <td>
                    {isPast ? (
                      <button
                        className="reschedule-button"
                        onClick={() => handleReschedule(patient.id)}
                      >
                        Reschedule
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsDone(patient.id)}
                        className="mark-as-done-button"
                      >
                        Mark as Done
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {reschedule && (
          <div className="reschedule-component">
            <IoIosCloseCircle
              className="reschedule-close"
              onClick={handleRescheduleClose}
            />
            <div className="reschedule-component-top">
              <img src={Reschedule} alt="Reschedule Icon" />
            </div>
            <div className="reschedule-component-bottom">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <button
              className="reschedule-btn-submit-to"
              onClick={async () => {
                try {
                  await axios.put(
                    `${
                      import.meta.env.VITE_API_URL
                    }/api/appointments/${rescheduleId}/reschedule`,
                    { date: newDate, time: newTime },
                    { withCredentials: true }
                  );
                  toast.success("Appointment rescheduled!");
                  setPatients((prev) =>
                    prev.map((p) =>
                      p.id === rescheduleId
                        ? {
                            ...p,
                            date: newDate,
                            time: newTime,
                            status: "confirmed",
                          }
                        : p
                    )
                  );
                  setReschedule(false);
                  setRescheduleId(null);
                  setNewDate("");
                  setNewTime("");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message ||
                      "Error rescheduling appointment."
                  );
                }
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagePatient;
