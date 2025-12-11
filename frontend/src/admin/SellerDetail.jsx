import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api/customers";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    cusname: "",
    cusPhone: "",
  });

  // Fetch All Customers
  const fetchCustomers = async () => {
    const res = await axios.get(API_URL);
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Search By Phone
  const searchCustomer = () => {
    if (!searchPhone.trim()) return fetchCustomers();

    const filtered = customers.filter((c) =>
      c.cusPhone.includes(searchPhone)
    );
    setCustomers(filtered);
  };

  // Create or Update Customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingCustomer) {
      // Update Customer
      await axios.put(`${API_URL}/${editingCustomer}`, formData);
      setEditingCustomer(null);
    } else {
      // Create Customer
      await axios.post(API_URL, formData);
    }

    setFormData({ cusname: "", cusPhone: "" });
    fetchCustomers();
  };

  // Load Customer For Editing
  const editCustomer = async (id) => {
    const res = await axios.get(`${API_URL}/${id}`);
    setFormData({
      cusname: res.data.cusname,
      cusPhone: res.data.cusPhone,
    });
    setEditingCustomer(id);
  };

  // Delete Customer
  const deleteCustomer = async (id) => {
    if (window.confirm("Are you sure?")) {
      await axios.delete(`${API_URL}/${id}`);
      fetchCustomers();
    }
  };

  return (
    <div style={{ width: "80%", margin: "20px auto" }}>
      <h2>Customers Management</h2>

      {/* Add / Update Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Customer Name"
          name="cusname"
          value={formData.cusname}
          onChange={handleChange}
          required
        />{" "}
        <input
          type="text"
          placeholder="Phone"
          name="cusPhone"
          value={formData.cusPhone}
          onChange={handleChange}
          required
        />{" "}
        <button type="submit">
          {editingCustomer ? "Update" : "Add"} Customer
        </button>
      </form>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by phone"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
        />
        <button onClick={searchCustomer}>Search</button>
        <button onClick={fetchCustomers} style={{ marginLeft: "10px" }}>
          Reset
        </button>
      </div>

      {/* Customers Table */}
      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.length === 0 && (
            <tr>
              <td colSpan="4" align="center">
                No customers found
              </td>
            </tr>
          )}

          {customers.map((cus, index) => (
            <tr key={cus._id}>
              <td>{index + 1}</td>
              <td>{cus.cusname}</td>
              <td>{cus.cusPhone}</td>

              <td>
                <button onClick={() => editCustomer(cus._id)}>
                  Edit
                </button>

                <button
                  onClick={() => deleteCustomer(cus._id)}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
