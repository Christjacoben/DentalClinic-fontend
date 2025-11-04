import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BackupAndRestore.css";
import BackupAndRestoreImg from "../assets/backupAndRestore.svg";

function BackupAndRestore() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deletedAppointments, setDeletedAppointments] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [selectedType, setSelectedType] = useState("appointments");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/appointments/finished`,
          { withCredentials: true }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users`,
          {
            withCredentials: true,
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    const fetchDeletedAppointments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/deleted/appointments`,
          { withCredentials: true }
        );
        setDeletedAppointments(res.data);
      } catch (err) {
        console.error("Error fetching deleted appointments:", err);
      }
    };

    const fetchDeletedUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/deleted/users`,
          { withCredentials: true }
        );
        setDeletedUsers(res.data);
      } catch (err) {
        console.error("Error fetching deleted users:", err);
      }
    };

    fetchAppointments();
    fetchUsers();
    fetchDeletedAppointments();
    fetchDeletedUsers();
  }, []);

  const handleDownloadAppointmentsExcel = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/backup/appointments/excel`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "finished_appointments.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error downloading appointments Excel:", err);
      alert("Failed to download appointments Excel file.");
    }
  };

  const handleDownloadUsersExcel = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/backup/users/excel`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error downloading users Excel:", err);
      alert("Failed to download users Excel file.");
    }
  };

  const handleRestoreAppointments = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/restore/appointments`,
        { appointments: deletedAppointments },
        { withCredentials: true }
      );
      alert(res.data.message);
      setDeletedAppointments([]);
    } catch (err) {
      console.error("Error restoring appointments:", err);
      alert("Failed to restore appointments.");
    }
  };

  const handleRestoreUsers = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/restore/users`,
        { users: deletedUsers },
        { withCredentials: true }
      );
      alert(res.data.message);
      setDeletedUsers([]);
    } catch (err) {
      console.error("Error restoring users:", err);
      alert("Failed to restore users.");
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
    <div className="backup-restore-main">
      <div className="backup-restore-top">
        <img src={BackupAndRestoreImg} alt="Backup and Restore" />
      </div>
      <div className="backup-restore-center">
        <h2>Backup and Restore</h2>
      </div>
      <div className="backup-restore-bottom">
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Select Type:{" "}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="appointments">Finished Appointments</option>
              <option value="users">Users</option>
              <option value="deletedUsers">Deleted Users</option>
              <option value="deletedAppointments">Deleted Appointments</option>
            </select>
          </label>
        </div>

        {/* Display Users */}
        {selectedType === "users" && (
          <div>
            <button onClick={handleDownloadUsersExcel}>Backup</button>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.userName}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Display Finished Appointments */}
        {selectedType === "appointments" && (
          <div>
            <button onClick={handleDownloadAppointmentsExcel}>Backup</button>
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Dental Procedure</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.firstName}</td>
                    <td>{appt.lastName}</td>
                    <td>{formatDatePH(appt.date)}</td>
                    <td>{formatTimePH(appt.time)}</td>
                    <td>{appt.dentalProcedure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Display Deleted Users */}
        {selectedType === "deletedUsers" && (
          <div>
            <button onClick={handleRestoreUsers}>Restore Deleted Users</button>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {deletedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.userName}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Display Deleted Appointments */}
        {selectedType === "deletedAppointments" && (
          <div>
            <button onClick={handleRestoreAppointments}>
              Restore Deleted Appointments
            </button>
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Dental Procedure</th>
                </tr>
              </thead>
              <tbody>
                {deletedAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.firstName}</td>
                    <td>{appt.lastName}</td>
                    <td>{formatDatePH(appt.date)}</td>
                    <td>{formatTimePH(appt.time)}</td>
                    <td>{appt.dentalProcedure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dropdown to select type */}
    </div>
  );
}

export default BackupAndRestore;
