import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_URL = "/api/user"; // ⚙️ bedel haddii backend uu ku socdo port kale

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}`, { withCredentials: true });
      setUsers(res.data.data);
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve (activate) user
  const approveUser = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/approve/${id}`, {}, { withCredentials: true });
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error activating user");
    }
  };

  // Deactivate user
  const deactivateUser = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/inactive/${id}`, {}, { withCredentials: true });
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deactivating user");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-semibold mb-6">All Registered Users</h2>

      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Username</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Phone</th>
            <th className="py-3 px-4 text-left">Role</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u._id}
              className="border-t hover:bg-gray-50 transition duration-200"
            >
              <td className="py-2 px-4">{u.username}</td>
              <td className="py-2 px-4">{u.email}</td>
              <td className="py-2 px-4">{u.phone}</td>
              <td className="py-2 px-4 capitalize">{u.role}</td>
              <td
                className={`py-2 px-4 font-semibold ${
                  u.status === "active"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {u.status}
              </td>
              <td className="py-2 px-4 text-center">
                {u.status === "inactive" ? (
                  <button
                    onClick={() => approveUser(u._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Activate
                  </button>
                ) : (
                  <button
                    onClick={() => deactivateUser(u._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
