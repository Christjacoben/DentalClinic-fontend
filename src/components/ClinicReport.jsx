import React, { useEffect, useState } from "react";
import "./ClinicReport.css";
import ClinicReportIcon from "../assets/report-patient-icon.svg";
import UserReportIcon from "../assets/report-user-icon.svg";
import { IoCloseCircleSharp } from "react-icons/io5";
import { AnimatePresence, color, motion } from "framer-motion";
import FileReport from "../assets/sunge-report-icon.svg";
import { IoMdArrowRoundBack } from "react-icons/io";
import PrintLogo from "../assets/logo-print-sunga.svg";
import axios from "axios";
import dayjs from "dayjs";

function ClinicReport() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportType, setReportType] = useState("perPatient");
  const [filterMonth, setFilterMonth] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState("");

  useEffect(() => {
    const fetchFinished = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/appointments/finished`,
          { withCredentials: true }
        );
        setAppointments(res.data);
      } catch (err) {
        console.error(
          "Error fetching finished appointments:",
          err.response?.data || err.message
        );
      }
    };
    fetchFinished();
  }, []);

  const users = [
    ...new Map(
      appointments.map((a) => [
        `${a.firstName} ${a.lastName}`,
        { firstName: a.firstName, lastName: a.lastName },
      ])
    ).values(),
  ];

  const userAppointments = selectedUser
    ? appointments.filter(
        (a) =>
          a.firstName === selectedUser.firstName &&
          a.lastName === selectedUser.lastName
      )
    : [];

  const filteredAppointments =
    !filterMonth || filterMonth === ""
      ? appointments
      : appointments.filter((appt) => {
          const apptMonth = dayjs(appt.date).format("YYYY-MM");
          return apptMonth === filterMonth;
        });

  const procedures = [
    ...new Set(
      appointments
        .map((a) => a.dentalProcedure)
        .filter((p) => p && p.toString().trim() !== "")
    ),
  ];

  const procedureFilteredAppointments = selectedProcedure
    ? filteredAppointments.filter(
        (appt) => appt.dentalProcedure === selectedProcedure
      )
    : filteredAppointments;

  const handlePrintMonth = () => {
    const apptsToPrint = userAppointments.filter(
      (appt) => dayjs(appt.date).format("MMMM YYYY") === selectedDate
    );

    const infoAppt =
      userAppointments.find(
        (appt) => dayjs(appt.date).format("MMMM YYYY") === selectedDate
      ) ||
      userAppointments[0] ||
      {};
    const contact = infoAppt.contact || infoAppt.phone || "";
    const address = infoAppt.address || "";

    const logoUrl =
      typeof PrintLogo === "string" && PrintLogo.startsWith("http")
        ? PrintLogo
        : `${window.location.origin}${
            PrintLogo.startsWith("/") ? "" : "/"
          }${PrintLogo}`;

    const title = `Appointments for ${selectedUser.firstName} ${selectedUser.lastName}`;
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>${title} - ${selectedDate || ""}</title>
        <style>
          :root { --accent: #c39e79; --text: #222; --muted:#666; }
          html,body { height:100%; margin:0; padding:0; font-family: "Helvetica Neue", Arial, sans-serif; color:var(--text); }
          .container { padding:28px 36px; max-width:900px; margin:0 auto; }
          .logo-wrap { text-align:center; margin-bottom:8px; }
          /* larger print logo */
          .logo { height:140px; max-width:320px; width:auto; object-fit:contain; display:block; margin:0 auto; }
          .title { text-align:center; font-size:20px; font-weight:700; margin:8px 0 14px 0; }
          .meta { width:100%; margin-bottom:16px; }
          .meta-table { width:100%; border-collapse:collapse; }
          .meta-table td { padding:6px 8px; vertical-align:top; }
          .meta-label { color:var(--muted); font-weight:600; width:140px; }
          .info-row { display:flex; gap:16px; margin-bottom:8px; }
          .info-block { flex:1; }
          table.report { width:100%; border-collapse:collapse; margin-top:8px; }
          table.report th, table.report td { border:1px solid #ddd; padding:10px 12px; text-align:left; }
          table.report th { background:#f7f7f7; font-weight:700; }
          .prepared { margin-top:18px; font-weight:700; color:var(--text); }
          .small { color:var(--muted); font-size:12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-wrap" style="padding:30px; margin-top:-60px;">
            <img src="${logoUrl}" class="logo" alt="Logo" style="height:180px; width:auto; display:block; margin:0 auto;"/>
          </div>
          <div class="title" style="margin-top:-60px;">Appointments</div>
          <table class="meta-table">
            <tr>
              <td style="width:50%; padding-right:16px;">
                <table style="width:100%;">
                  <tr>
                    <td class="meta-label">First Name:</td>
                    <td>${selectedUser.firstName || ""}</td>
                  </tr>
                  <tr>
                    <td class="meta-label">Contact</td>
                    <td>${contact}</td>
                  </tr>
                </table>
              </td>
              <td style="width:50%; padding-left:16px;">
                <table style="width:100%;">
                  <tr>
                    <td class="meta-label">Last Name:</td>
                    <td>${selectedUser.lastName || ""}</td>
                  </tr>
                  <tr>
                    <td class="meta-label">Address</td>
                    <td>${address}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:10px;">
                <span class="meta-label">Report Month</span>
                <span>${selectedDate || ""}</span>
              </td>
            </tr>
          </table>

          <table class="report" role="table" aria-label="Appointments">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Dental Procedure</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${apptsToPrint
                .map(
                  (appt) => `
                <tr>
                  <td>${new Date(appt.date).toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Manila",
                  })}</td>
                  <td>${formatTimePH(appt.time)}</td>
                  <td>${appt.dentalProcedure || ""}</td>
                  <td>${appt.status || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="prepared">Prepared by: Dr. Contessalou B. Sunga</div>
          <div class="small" style="margin-top:8px;">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <script>
          // wait for images to load, then print and close
          function whenImagesLoaded(win, callback) {
            const imgs = Array.from(win.document.images || []);
            if (!imgs.length) return callback();
            let loaded = 0;
            imgs.forEach(img => {
              if (img.complete) {
                loaded++;
                if (loaded === imgs.length) callback();
              } else {
                img.onload = img.onerror = () => {
                  loaded++;
                  if (loaded === imgs.length) callback();
                };
              }
            });
          }
          window.onload = function() {
            whenImagesLoaded(window, function() {
              setTimeout(function() {
                window.focus();
                window.print();
                // do not close automatically to allow user to change settings if needed
              }, 200);
            });
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
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

  const handlePrintFiltered = () => {
    const monthLabel = filterMonth
      ? dayjs(filterMonth).isValid()
        ? dayjs(filterMonth).format("MMMM YYYY")
        : ""
      : "";

    const title =
      monthLabel !== ""
        ? `All Finished Appointments - ${monthLabel}`
        : "All Finished Appointments";

    const logoUrl =
      typeof PrintLogo === "string" && PrintLogo.startsWith("http")
        ? PrintLogo
        : `${window.location.origin}${
            PrintLogo.startsWith("/") ? "" : "/"
          }${PrintLogo}`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color:#222; }
          .logo-wrap { text-align:center; margin-bottom:18px; }
          .logo { height:120px; max-width:320px; width:auto; object-fit:contain; display:block; margin:0 auto; }
          h2 { color: #222; text-align:center; margin:8px 0 12px; }
          table { border-collapse: collapse; width: 100%; margin-top: 8px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align:left; }
          th { background: #f5f5f5; font-weight:700; }
          .prepared { margin-top:18px; font-weight:700; }
          .small { color:#666; font-size:12px; margin-top:6px; }
        </style>
      </head>
      <body>
        <div class="logo-wrap">
          <img src="${logoUrl}" class="logo" alt="Logo" />
        </div>
        <h2>${title}</h2>
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
            ${filteredAppointments
              .map(
                (appt) => `
              <tr>
                <td>${appt.firstName}</td>
                <td>${appt.lastName}</td>
                <td>${dayjs(appt.date).format("MMMM D, YYYY")}</td>
                <td>${formatTimePH(appt.time)}</td>
                <td>${appt.dentalProcedure || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="prepared">Prepared by: Dr. Contessalou B. Sunga</div>
        <div class="small">Generated: ${new Date().toLocaleString()}</div>

        <script>
          function whenImagesLoaded(win, callback) {
            const imgs = Array.from(win.document.images || []);
            if (!imgs.length) return callback();
            let loaded = 0;
            imgs.forEach(img => {
              if (img.complete) {
                loaded++;
                if (loaded === imgs.length) callback();
              } else {
                img.onload = img.onerror = () => {
                  loaded++;
                  if (loaded === imgs.length) callback();
                };
              }
            });
          }
          window.onload = function() {
            whenImagesLoaded(window, function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 200);
            });
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
  };

  const handlePrintProcedure = () => {
    const title =
      selectedProcedure && selectedProcedure !== ""
        ? `Finished Appointments - ${selectedProcedure}`
        : "Finished Appointments - All Procedures";

    // absolute logo URL
    const logoUrl =
      typeof PrintLogo === "string" && PrintLogo.startsWith("http")
        ? PrintLogo
        : `${window.location.origin}${
            PrintLogo.startsWith("/") ? "" : "/"
          }${PrintLogo}`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color:#222; }
            .logo-wrap { text-align:center; margin-bottom:18px; }
            .logo { height:120px; max-width:320px; width:auto; object-fit:contain; display:block; margin:0 auto; }
            h2 { color: #222; text-align:center; margin:8px 0 12px; }
            table { border-collapse: collapse; width: 100%; margin-top: 8px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align:left; }
            th { background: #f5f5f5; font-weight:700; }
            .prepared { margin-top:18px; font-weight:700; }
            .small { color:#666; font-size:12px; margin-top:6px; }
          </style>
        </head>
        <body>
          <div class="logo-wrap">
            <img src="${logoUrl}" class="logo" alt="Logo" />
          </div>
          <h2>${title}</h2>
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
              ${procedureFilteredAppointments
                .map(
                  (appt) => `
                    <tr>
                      <td>${appt.firstName}</td>
                      <td>${appt.lastName}</td>
                      <td>${dayjs(appt.date).format("MMMM D, YYYY")}</td>
                      <td>${formatTimePH(appt.time)}</td>
                      <td>${appt.dentalProcedure || ""}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <div class="prepared">Prepared by: Dr. Contessalou B. Sunga</div>
          <div class="small">Generated: ${new Date().toLocaleString()}</div>

          <script>
            function whenImagesLoaded(win, callback) {
              const imgs = Array.from(win.document.images || []);
              if (!imgs.length) return callback();
              let loaded = 0;
              imgs.forEach(img => {
                if (img.complete) {
                  loaded++;
                  if (loaded === imgs.length) callback();
                } else {
                  img.onload = img.onerror = () => {
                    loaded++;
                    if (loaded === imgs.length) callback();
                  };
                }
              });
            }
            window.onload = function() {
              whenImagesLoaded(window, function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 200);
              });
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="clinic-report-container">
      <div className="clinic-report-container-top">
        <img src={ClinicReportIcon} alt="ClinicReportIcon" />
        <h4>FINISHED APPOINTMENTS REPORT</h4>
        <select
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            marginLeft: "950px",
            border: "1px solid #c39e79 ",
          }}
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            setSelectedUser(null);
            setSelectedDate(null);
          }}
        >
          <option value="perPatient">Per Patient</option>
          <option value="allPatient">All Patient</option>
          <option value="perProcedure">Per Procedure</option>
        </select>
      </div>
      <div className="clinic-report-container-bottom">
        {reportType === "perPatient" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {Array.from({ length: Math.ceil(users.length / 8) }, (_, index) => {
              const chunk = users.slice(index * 8, index * 8 + 8);
              return (
                <div
                  key={index}
                  style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                >
                  {chunk.map((user) => (
                    <div
                      key={`${user.firstName} ${user.lastName}`}
                      className="user-card-report"
                      onClick={() => setSelectedUser(user)}
                    >
                      <img src={UserReportIcon} alt="UserReportIcon" />
                      {user.firstName} {user.lastName}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        {reportType === "allPatient" && (
          <div className="all-patient">
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <label style={{ marginLeft: "10px" }}>
                Filter by Month:{" "}
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  placeholder="Filter by month"
                />
              </label>
              <button
                onClick={handlePrintFiltered}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  background: "#c39e79",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Print
              </button>
            </div>
            <div className="all-patient-table-data">
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
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.firstName}</td>
                      <td>{appt.lastName}</td>
                      <td>{dayjs(appt.date).format("MMMM D, YYYY")}</td>
                      <td>{formatTimePH(appt.time)}</td>
                      <td>{appt.dentalProcedure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {reportType === "perProcedure" && (
          <div className="all-procedure">
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <label style={{ marginLeft: "10px" }}>
                Filter by Procedure:{" "}
                <select
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  style={{ padding: "6px 8px", marginLeft: "8px" }}
                >
                  <option value="">All Procedures</option>
                  {procedures.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={handlePrintProcedure}
                style={{
                  padding: "6px 16px",
                  borderRadius: 4,
                  background: "#c39e79",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Print
              </button>
            </div>

            <div className="all-procedure-table-data">
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
                  {procedureFilteredAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.firstName}</td>
                      <td>{appt.lastName}</td>
                      <td>{dayjs(appt.date).format("MMMM D, YYYY")}</td>
                      <td>{formatTimePH(appt.time)}</td>
                      <td>{appt.dentalProcedure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <AnimatePresence>
          {selectedUser && reportType === "perPatient" && (
            <motion.div
              className="clinic-user-appointments-report"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <IoCloseCircleSharp
                className="clinic-user-appointments-report-close-btn"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedDate(null);
                }}
              />
              <h4>
                Appointments for {selectedUser.firstName}{" "}
                {selectedUser.lastName}
              </h4>
              {!selectedDate ? (
                <div>
                  <ul className="list-date">
                    {[
                      ...new Set(
                        userAppointments.map((appt) =>
                          dayjs(appt.date).format("MMMM YYYY")
                        )
                      ),
                    ].map((month) => (
                      <li key={month} className="report-date-render">
                        <img
                          src={FileReport}
                          alt="File report"
                          onClick={() => setSelectedDate(month)}
                        />
                        <button>{month}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <IoMdArrowRoundBack
                    size={25}
                    color="red"
                    onClick={() => setSelectedDate(null)}
                    style={{
                      marginBottom: "10px",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  />
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Dental Procedure</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAppointments
                        .filter(
                          (appt) =>
                            dayjs(appt.date).format("MMMM YYYY") ===
                            selectedDate
                        )
                        .map((appt) => (
                          <tr key={appt.id}>
                            <td>
                              {new Date(appt.date).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                timeZone: "Asia/Manila",
                              })}
                            </td>
                            <td>{formatTimePH(appt.time)}</td>
                            <td>{appt.dentalProcedure}</td>
                            <td style={{ color: "green" }}>{appt.status}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <button
                    onClick={handlePrintMonth}
                    className="btn-per-month"
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Print
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ClinicReport;
