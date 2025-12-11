import { useEffect, useState } from "react";
import axios from "axios";
import { X, Search, UserPlus, Edit2, Trash2, RefreshCw } from "lucide-react";

const API_URL = "/api/customers";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    cusname: "",
    cusPhone: "",
  });

  // Fetch All Customers
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Search By Phone
  const searchCustomer = async () => {
    if (!searchPhone.trim()) {
      fetchCustomers();
      return;
    }

    setIsLoading(true);
    try {
      // If you have a search endpoint, use it instead
      // const res = await axios.get(`${API_URL}/search?phone=${searchPhone}`);
      // setCustomers(res.data);
      
      // Client-side filtering for now
      const filtered = customers.filter((c) =>
        c.cusPhone.includes(searchPhone)
      );
      setCustomers(filtered);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      searchCustomer();
    }
  };

  // Create or Update Customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      if (editingCustomer) {
        // Update Customer
        await axios.put(`${API_URL}/${editingCustomer}`, formData);
        setEditingCustomer(null);
      } else {
        // Create Customer
        await axios.post(API_URL, formData);
      }

      setFormData({ cusname: "", cusPhone: "" });
      setShowFormModal(false);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Customer For Editing
  const editCustomer = async (id) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setFormData({
        cusname: res.data.cusname,
        cusPhone: res.data.cusPhone,
      });
      setEditingCustomer(id);
      setShowFormModal(true);
    } catch (error) {
      console.error("Error loading customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Customer
  const deleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        setIsLoading(false);
      }
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({ cusname: "", cusPhone: "" });
    setEditingCustomer(null);
    setShowFormModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers Management</h1>
            <p className="text-gray-600 mt-2">Manage your customer database efficiently</p>
          </div>
          
          {/* Add Customer Button */}
          <button
            onClick={() => setShowFormModal(true)}
            className="mt-4 md:mt-0 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <UserPlus size={20} />
            Add New Customer
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={searchCustomer}
                disabled={isLoading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Search size={20} />
                Search
              </button>
              <button
                onClick={fetchCustomers}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Customer List</h2>
            <p className="text-gray-600 text-sm mt-1">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first customer</p>
              <button
                onClick={() => setShowFormModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                <UserPlus size={18} />
                Add Customer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((cus, index) => (
                    <tr key={cus._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-800 rounded-full font-medium">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cus.cusname}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{cus.cusPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCustomer(cus._id)}
                            className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors duration-200"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCustomer(cus._id)}
                            className="inline-flex items-center gap-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-2 px-4 rounded-md transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {customers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{customers.length}</span> customers
                </p>
                <button
                  onClick={() => setShowFormModal(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  + Add Another Customer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="cusname" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cusname"
                    name="cusname"
                    value={formData.cusname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter customer name"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="cusPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="cusPhone"
                    name="cusPhone"
                    value={formData.cusPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      {editingCustomer ? "Updating..." : "Adding..."}
                    </span>
                  ) : editingCustomer ? (
                    "Update Customer"
                  ) : (
                    "Add Customer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}