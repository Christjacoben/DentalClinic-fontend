import React, { useEffect, useState } from "react";
import "./ManageUser.css";
import ManageUserClnicIcon from "../assets/manage-user-icons.svg";
import UserEditIcon from "../assets/edit-user-icons.svg";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      alert("Error fetching users.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        withCredentials: true,
      });
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User deleted!");
    } catch (err) {
      toast.error("Error deleting user.");
    }
  };

  const handleUpdatePassword = async (id) => {
    if (!newPassword) return alert("Enter new password.");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${id}/password`,
        { newPassword },
        { withCredentials: true }
      );
      toast.success("Password updated!");
      alert("Password updated!");
      setEditUserId(null);
      setNewPassword("");
    } catch (err) {
      toast.error("Error updating password.");
    }
  };

  const handleUpdateUserName = async (id) => {
    if (!newUserName) return alert("Enter new username.");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${id}/username`,
        { newUserName },
        { withCredentials: true }
      );
      toast.success("Username updated!");
      setEditUserId(null);
      setNewUserName("");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating username.");
    }
  };

  return (
    <div className="manage-user-container-main">
      <ToastContainer position="top-center" />
      <div className="manage-user-container-main-top">
        <img src={ManageUserClnicIcon} alt="ManageUserClnicIcon" />
        <h3>Manage Users</h3>
      </div>
      <div className="manage-user-container-main-bottom">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Last Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{user.name}</td>
                <td>{user.userName}</td>
                <td>{user.lastName}</td>
                <td>{user.address}</td>
                <td>{user.contact}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDelete(user.id)}>Delete</button>
                  <button
                    onClick={() =>
                      editUserId === user.id
                        ? setEditUserId(null)
                        : setEditUserId(user.id)
                    }
                  >
                    {editUserId === user.id ? "Cancel" : "Edit"}
                  </button>
                  <AnimatePresence>
                    {editUserId === user.id && (
                      <motion.div
                        className="edit-user-section"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <div className="edit-user-section-top">
                          <img src={UserEditIcon} alt="UserEditIcon" />
                        </div>
                        <div className="edit-user-section-bottom">
                          <div className="edit-user-section-username">
                            <input
                              type="text"
                              placeholder="New Username"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              style={{ marginRight: 4 }}
                            />
                            <button
                              onClick={() => handleUpdateUserName(user.id)}
                            >
                              Update Username
                            </button>
                          </div>
                          <div className="edit-user-section-password">
                            <input
                              type="password"
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              style={{ marginRight: 4 }}
                            />
                            <button
                              onClick={() => handleUpdatePassword(user.id)}
                            >
                              Update Password
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUser;
