import React from "react";
import axios from "axios";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaCalendarDays } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { IoSettings } from "react-icons/io5";
import { TbLogout } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ClinicAdminDashboard.css";
import ManageAppointment from "./ManageAppointment";
import ManagePatient from "./ManagePatient";
import ClinicReport from "./ClinicReport";
import ManageUser from "./ManageUser";
import BackupAndRestore from "./BackupAndRestore";
import ClinicSideBarLogo from "../assets/finalTransparentLogo.svg";
import { useState, useEffect } from "react";
import AllAppointment from "../assets/all-appointment-icon.svg";
import NotConfirm from "../assets/not-confirm-icon.svg";
import Confirm from "../assets/confirmed-appointment-icon.svg";
import Completed from "../assets/completed-appointment-icon.svg";
import { LuDatabaseBackup } from "react-icons/lu";

function ClinicAdminDashboard() {
  const localizer = momentLocalizer(moment);
  const [adminDashboardContent, setAdminDashboardContent] = useState(true);
  const [manageAppointmentIsOpen, setManageAppointmentIsOpen] = useState(false);
  const [ManagePatientIsOpen, setManagePatientIsOpen] = useState(false);
  const [reportClinicIsOpen, setReportClinicIsOpen] = useState(false);
  const [manageUserIsOpen, setManageUserIsOpen] = useState(false);
  const [backupRestoreIsOpen, setBackupRestoreIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/appointments`,
          { withCredentials: true }
        );
        setAppointments(res.data);
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

  const calendarEvents = appointments
    .filter((appt) => appt.status === "confirmed")
    .map((appt) => ({
      title: appt.dentalProcedure,
      start: new Date(appt.date),
      end: new Date(appt.date),
      allDay: true,
      note: `Status: ${appt.status}`,
    }));

  const navigate = useNavigate();

  const toggleAdminDashboardContent = () => {
    setManageAppointmentIsOpen(false);
    setManagePatientIsOpen(false);
    setReportClinicIsOpen(false);
    setManageUserIsOpen(false);
    setBackupRestoreIsOpen(false);
    setAdminDashboardContent(!adminDashboardContent);
  };

  const toggleManageAppointmentIsOpen = () => {
    setAdminDashboardContent(false);
    setManagePatientIsOpen(false);
    setReportClinicIsOpen(false);
    setBackupRestoreIsOpen(false);
    setManageUserIsOpen(false);
    setManageAppointmentIsOpen(!manageAppointmentIsOpen);
  };

  const handleManegePatientIsOpen = () => {
    setAdminDashboardContent(false);
    setManageAppointmentIsOpen(false);
    setReportClinicIsOpen(false);
    setManageUserIsOpen(false);
    setBackupRestoreIsOpen(false);
    setManagePatientIsOpen(!ManagePatientIsOpen);
  };

  const handleReportClinicIsOpen = () => {
    setAdminDashboardContent(false);
    setManageAppointmentIsOpen(false);
    setManagePatientIsOpen(false);
    setManageUserIsOpen(false);
    setBackupRestoreIsOpen(false);
    setReportClinicIsOpen(!reportClinicIsOpen);
  };

  const handleManageUserIsOpen = () => {
    setAdminDashboardContent(false);
    setManageAppointmentIsOpen(false);
    setManagePatientIsOpen(false);
    setReportClinicIsOpen(false);
    setBackupRestoreIsOpen(false);
    setManageUserIsOpen(!manageUserIsOpen);
  };

  const handleBackupRestoreIsOpen = () => {
    setAdminDashboardContent(false);
    setManageAppointmentIsOpen(false);
    setManagePatientIsOpen(false);
    setReportClinicIsOpen(false);
    setManageUserIsOpen(false);

    setBackupRestoreIsOpen(!backupRestoreIsOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/logout`,
        {},
        { withCredentials: true }
      );
      console.log("Logout successful");
      navigate("/login", { replace: true });
    } catch (err) {
      console.err("Logout failed. Please try again.");
    }
  };

  const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
    );
  };

  const appointmentsThisMonth = appointments.filter((appt) =>
    isSameMonth(appt.date, calendarDate)
  );

  const allCount = appointmentsThisMonth.length;
  const notConfirmedCount = appointmentsThisMonth.filter(
    (appt) => appt.status === "not confirmed"
  ).length;
  const confirmedCount = appointmentsThisMonth.filter(
    (appt) => appt.status === "confirmed"
  ).length;
  const finishedCount = appointmentsThisMonth.filter(
    (appt) => appt.status === "finished"
  ).length;

  const procedureCountsThisMonth = appointmentsThisMonth.reduce((acc, appt) => {
    if (appt.dentalProcedure) {
      acc[appt.dentalProcedure] = (acc[appt.dentalProcedure] || 0) + 1;
    }
    return acc;
  }, {});

  const topProceduresThisMonth = Object.entries(procedureCountsThisMonth)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="clinic-admin-dashboard">
      <div className="clinic-sidebar">
        <img
          src={ClinicSideBarLogo}
          alt="Clinic Logo"
          className="clinic-sidebar-logo"
        />
        <div
          className="clinic-sidebar-icons"
          onClick={toggleAdminDashboardContent}
        >
          <RiDashboard3Fill
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Dashboard</p>
        </div>
        <div
          className="clinic-sidebar-icons"
          onClick={toggleManageAppointmentIsOpen}
        >
          <FaCalendarDays
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Manage Appointment</p>
        </div>
        <div
          className="clinic-sidebar-icons"
          onClick={handleManegePatientIsOpen}
        >
          <FaUsers
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Manage Patient</p>
        </div>
        <div
          className="clinic-sidebar-icons"
          onClick={handleReportClinicIsOpen}
        >
          <TbReport
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Report</p>
        </div>
        <div className="clinic-sidebar-icons" onClick={handleManageUserIsOpen}>
          <IoSettings
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Manage User</p>
        </div>
        <div
          className="clinic-sidebar-icons"
          onClick={handleBackupRestoreIsOpen}
        >
          <LuDatabaseBackup
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Backup/Restore</p>
        </div>
        <div className="clinic-sidebar-icons" onClick={handleLogout}>
          <TbLogout
            color="rgb(65, 53, 51)"
            size={40}
            className="clinic-icons-side"
          />
          <p>Logout</p>
        </div>
      </div>
      {adminDashboardContent && (
        <div className="clinic-right-content">
          <div className="clinic-search">
            <div className="clinic-search-right">
              <h4>Dashboard</h4>
            </div>
            <div className="clinic-search-left"></div>
          </div>
          <div className="clinic-box-indicator">
            <div className="clinic-box">
              <div
                className="clinic-box-content"
                style={{ marginLeft: "10px" }}
              >
                <h4>All Appointments</h4>
                <p>Total {allCount}</p>
              </div>
              <img src={AllAppointment} alt="AllAppointment" />
            </div>

            <div className="clinic-box">
              <div className="clinic-box-content">
                <h4>Not Confirmed</h4>
                <p>Total {notConfirmedCount}</p>
              </div>
              <img src={NotConfirm} alt="NotConfirm" />
            </div>
            <div className="clinic-box">
              <div className="clinic-box-content">
                <h4>Confirmed Appointment</h4>
                <p>Total {confirmedCount}</p>
              </div>
              <img
                src={Confirm}
                alt="Confirm"
                style={{ width: "160px", marginLeft: "1px" }}
              />
            </div>
            <div className="clinic-box">
              <div className="clinic-box-content">
                <h4>Completed Treatments</h4>
                <p>Total {finishedCount}</p>
              </div>
              <img src={Completed} alt="Completed" />
            </div>
          </div>
          <div className="clinic-content">
            <div className="clinic-content-right">
              <div className="clinic-calendar">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  titleAccessor="title"
                  style={{
                    height: 460,
                    width: "100%",
                    background: "white",
                    borderRadius: 8,
                    padding: 10,
                    marginTop: "5px",
                  }}
                  components={{
                    event: ({ event }) => (
                      <div>
                        <strong>{event.title}</strong>
                      </div>
                    ),
                  }}
                  view={calendarView}
                  date={calendarDate}
                  onView={setCalendarView}
                  onNavigate={setCalendarDate}
                />
              </div>
            </div>
            <div className="clinic-content-left">
              <div className="clinic-patient-indicator">
                <div className="clinic-patient-indicator-bottom">
                  <div className="appointments-table-container">
                    <h4 className="appointment-text">Appointments</h4>
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Time</th>
                          <th>Treatment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsThisMonth.map((appt) => (
                          <tr key={appt.id}>
                            <td>{appt.firstName}</td>
                            <td>{appt.lastName}</td>
                            <td>{formatTimePH(appt.time)}</td>
                            <td>{appt.dentalProcedure}</td>
                            <td>
                              <span
                                className={
                                  appt.status === "finished"
                                    ? "status-finished"
                                    : appt.status === "not confirmed"
                                    ? "status-not-confirmed"
                                    : appt.status === "confirmed"
                                    ? "status-confirmed"
                                    : ""
                                }
                              >
                                {appt.status === "not confirmed"
                                  ? "pending"
                                  : appt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>{" "}
              <div className="patient-treatment-review">
                <h4 className="appointment-text">Patient Treatment</h4>
                {topProceduresThisMonth.length === 0 && (
                  <div>No treatments yet.</div>
                )}
                {topProceduresThisMonth.map(([procedure, count]) => (
                  <div className="review-row" key={procedure}>
                    <span>
                      {procedure} ({count})
                    </span>
                    <div className="review-bar-bg">
                      <div
                        className="review-bar"
                        style={{
                          width: `${(count / 10) * 100}%`,
                          background: "#4caf50",
                          minWidth: count > 0 ? "5%" : 0,
                          maxWidth: "100%",
                          height: "16px",
                          borderRadius: "4px",
                          transition: "width 0.5s",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {manageAppointmentIsOpen && (
        <div className="manage-appointment">
          <ManageAppointment />
        </div>
      )}
      {ManagePatientIsOpen && (
        <div className="manage-patient">
          <ManagePatient />
        </div>
      )}
      {reportClinicIsOpen && (
        <div className="clinic-report">
          <ClinicReport />
        </div>
      )}
      {manageUserIsOpen && (
        <div className="manage-user">
          <ManageUser />
        </div>
      )}
      {backupRestoreIsOpen && (
        <div className="backup-restore">
          <BackupAndRestore />
        </div>
      )}
    </div>
  );
}

export default ClinicAdminDashboard;
