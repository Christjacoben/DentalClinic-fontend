import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ClinicUserDashboard.css";
import { TiThMenu } from "react-icons/ti";
import { MdRateReview } from "react-icons/md";
import { MdPageview } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { IoIosCloseCircle } from "react-icons/io";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import ClinicMessage from "../assets/clinic-message.svg";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SideBarLogo from "../assets/finalNewTransparentLogo.svg";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ClinicSetAppointment from "./ClinicSetAppointment";

import ClinicUserInfo from "./ClinicUserInfo";

function ClinicUserDashboard() {
  const [isClinicSideBarOpen, setIsClinicSideBarOpen] = useState(false);
  const [clinicCurrentUser, setClinicCurrentUser] = useState(null);
  const [clinicUserIsOpen, setClinicUserIsOpen] = useState(false);
  const [setAppointmentShow, setSetAppointmentShow] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMessage, setShowMessage] = useState(true);
  const [userallAppointments, setUserAllAppointments] = useState([]);
  const [date, setDate] = useState(new Date());

  const [calendarView, setCalendarView] = useState("month");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndAppointments = async () => {
      try {
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/current-user`,
          { withCredentials: true }
        );
        setClinicCurrentUser(userRes.data);

        if (userRes.data?.userName) {
          const apptRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/appointments`,
            { withCredentials: true }
          );
          const filtered = apptRes.data.filter(
            (appt) => appt.userName === userRes.data.userName
          );
          setUserAllAppointments(filtered);
        }
      } catch (err) {
        console.error("Error fetching user or appointments:", err);
      }
    };

    fetchUserAndAppointments();

    const interval = setInterval(fetchUserAndAppointments, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsClinicSideBarOpen(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const localizer = momentLocalizer(moment);

  const events = userallAppointments
    .filter((appt) => appt.status === "confirmed")
    .map((appt) => ({
      title: appt.dentalProcedure,
      start: new Date(appt.date),
      end: new Date(appt.date),
      allDay: true,
      note: `Status: ${appt.status}`,
    }));

  const toggleSideBar = () => {
    setIsClinicSideBarOpen(!isClinicSideBarOpen);
  };

  const toggleClinicUserInfo = () => {
    setClinicUserIsOpen(!clinicUserIsOpen);
  };

  const toggleSetAppointment = () => {
    setClinicUserIsOpen(false);
    setSetAppointmentShow(!setAppointmentShow);
  };

  const toggleCloseAppointment = () => {
    setSelectedDate(null);
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

  const appointmentsThisMonth = userallAppointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    return (
      apptDate.getFullYear() === calendarDate.getFullYear() &&
      apptDate.getMonth() === calendarDate.getMonth()
    );
  });

  return (
    <div className="clinic-user-dashboard">
      <ToastContainer position="top-center" />
      <AnimatePresence>
        {isClinicSideBarOpen && (
          <motion.div
            className="clinic-user-sidebar"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <div className="clinic-side-bar-top">
              <img src={SideBarLogo} alt="Clinic Logo" />
            </div>
            <div className="clinic-side-bar-bottom">
              <div
                className="clinic-side-bar-items"
                onClick={toggleSetAppointment}
              >
                <MdRateReview
                  color="rgb(65, 53, 51)"
                  size={40}
                  className="clinic-side-bar-icon"
                />
                <p>Set Appointment</p>
              </div>

              <div
                className="clinic-side-bar-items"
                onClick={toggleClinicUserInfo}
              >
                <FaInfoCircle
                  color="rgb(65, 53, 51)"
                  size={40}
                  className="clinic-side-bar-icon"
                />
                <p>User Info</p>
              </div>
              <div className="clinic-side-bar-items">
                <LuLogOut
                  color="rgb(65, 53, 51)"
                  size={40}
                  className="clinic-side-bar-icon"
                />
                <p onClick={handleLogout}>Logout</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="clinic-user-dashboard-top">
        <div className="clinic-user-dashboard-top-left">
          <TiThMenu size={40} onClick={toggleSideBar} />
        </div>
        <div className="clinic-user-dashboard-top-right">
          <img src={SideBarLogo} alt="SideBar Logo" />
        </div>
      </div>
      <div className="clinic-user-dashboard-bottom">
        {setAppointmentShow && (
          <div className="clinic-user-dashboard-bottom-calendar">
            <div className="clinic-user-dashboard-bottom-calendar-left">
              <div className="clinic-user-dashboard-bottom-calendar-left-content">
                <h4>Appointment Calendar</h4>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  view={calendarView}
                  date={calendarDate}
                  onView={setCalendarView}
                  onNavigate={setCalendarDate}
                  className="clinic-user-dashboard-bottom-big-calendar-left"
                  popup
                  selectable
                  longPressThreshold={100}
                  onSelectSlot={(slotInfo) => {
                    const date =
                      slotInfo.start instanceof Date
                        ? slotInfo.start
                        : new Date(slotInfo.start);
                    if (date.getDay() === 0) {
                      toast.error("Appointments cannot be set on Sundays");
                      return;
                    }
                    setSelectedDate(date);
                    setSetAppointmentShow(true);
                    setClinicUserIsOpen(false);
                  }}
                  dayPropGetter={(date) =>
                    date.getDay && date.getDay() === 0
                      ? {
                          style: {
                            backgroundColor: "#fafafa",
                            color: "#999",
                            pointerEvents: "none",
                          },
                        }
                      : {}
                  }
                  components={{
                    event: ({ event }) => (
                      <div className="note">
                        <strong>{event.title}</strong>
                      </div>
                    ),
                  }}
                />
              </div>
            </div>
            <div className="clinic-user-dashboard-bottom-calendar-right">
              <div className="clinic-user-dashboard-bottom-calendar-right-content">
                <p>List of Appointments</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Treatment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsThisMonth.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          {new Date(appt.date).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "Asia/Manila",
                          })}
                        </td>
                        <td>{appt.time}</td>
                        <td>{appt.dentalProcedure}</td>
                        <td
                          className={
                            appt.status === "confirmed"
                              ? "status-confirmed"
                              : appt.status === "finished"
                              ? "status-finished"
                              : "status-pending"
                          }
                        >
                          {appt.status === "not confirmed"
                            ? "pending"
                            : appt.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {userallAppointments.length === 0 && (
                  <div>No appointments found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {selectedDate && (
            <motion.div
              className="clinic-setAppoint"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div>
                <IoIosCloseCircle
                  size={30}
                  color="red"
                  className="clinic-user-info-close-icon"
                  onClick={toggleCloseAppointment}
                />
                <ClinicSetAppointment
                  selectedDate={selectedDate}
                  user={clinicCurrentUser}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {clinicUserIsOpen && (
            <motion.div
              className="clinic-user-info"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <IoIosCloseCircle
                size={30}
                color="red"
                className="clinic-user-info-close-icon"
                onClick={toggleClinicUserInfo}
              />
              <ClinicUserInfo user={clinicCurrentUser} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {userallAppointments.some((appt) => appt.status === "confirmed") &&
            showMessage && (
              <motion.div
                className="message"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="message-top">
                  <IoIosCloseCircle
                    size={30}
                    color="red"
                    className="message-exit"
                    onClick={() => setShowMessage(false)}
                  />

                  <img src={ClinicMessage} alt="clinic message" />
                </div>
                <div className="message-bottom">
                  <p>
                    Hi {clinicCurrentUser.name} {clinicCurrentUser.lastName}
                  </p>
                  <p>
                    Please wait for a message regarding your confirmed
                    appointment!
                  </p>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ClinicUserDashboard;
