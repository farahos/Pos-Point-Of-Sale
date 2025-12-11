import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { useUser } from '../hooks/useUser'; // Adjust path as needed
import { motion } from "framer-motion";
import Beco from "../assets/beco.png";
import hormuud from "../assets/hormuud.png";
import Somtel from "../assets/somtel.png";
import Somnet from "../assets/somnet1.jpg";

const companies = [
  { name: "BECO", logo: Beco },
  { name: "somtel", logo: Somtel },
  { name: "Hormuud", logo: hormuud },
  { name: "Somnet", logo: Somnet },
];

const BuyerManagement = ({phoneNumber, message}) => {
  phoneNumber = "252617730000";
  message = "Asc, waxaan jeclaan lahaa inaan wax ka ogaado saamiga iibka ah ee diyaarka ah!";
const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const [sellers, setSellers] = useState([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
    const { user } = useUser(); // Get current user from context
  
  const [statusFilter, setStatusFilter] = useState("available"); // Default waa "all" laakiin sorted
   const buttonStyle = {
    position: "fixed",
    width: "60px",
    height: "60px",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#25D366", // WhatsApp green
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: 1000,
    transition: "transform 0.2s",
  };
  const hoverStyle = {
    transform: "scale(1.1)",
  };
  // Fetch all sellers
  const fetchSellers = async () => {
    try {
      const response = await axios.get("/api/sellers");
      const sortedSellers = sortSellersByPriority(response.data.data);
      setSellers(sortedSellers);
      setFilteredSellers(sortedSellers);
    } catch (error) {
      console.error("Error fetching sellers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

 

  // Sort function for priority order: Available -> Pending -> Sold
  const sortSellersByPriority = (sellersList) => {
    const statusPriority = {
      'Available': 1,
      'Pending': 2,
      'Sold': 3
    };

    return sellersList.sort((a, b) => {
      const priorityA = statusPriority[a.status] || 4;
      const priorityB = statusPriority[b.status] || 4;
      return priorityA - priorityB;
    });
  };

  // Filter sellers based on search term and status
  useEffect(() => {
    let results = sellers;

    // Filter by status
    if (statusFilter !== "all") {
      results = results.filter(seller => 
        seller.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(seller =>
        seller.fullname?.toLowerCase().includes(term) ||
        seller.name?.toLowerCase().includes(term) ||
        seller.samiga?.toLowerCase().includes(term) ||
        seller.rate?.toString().includes(term) ||
        seller.value?.toString().includes(term)
      );
    }

    // Apply sorting always - mar walba Available -> Pending -> Sold
    results = sortSellersByPriority(results);

    setFilteredSellers(results);
  }, [searchTerm, statusFilter, sellers]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Waxyar Sug...</p>
        </div>
      </div>
    );
  }
const handleClick = (sellerId) => {
    if (!user) {
      setShowConfirm(true);
    } else {
      navigate(`/seller/${sellerId}`);
    }
  };
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
      <div className="mb-8 text-center">
  <motion.h1
    className="text-4xl font-extrabold text-blue-600 mb-4"
    initial={{ opacity: 0, y: 30 }}     // marka hore: hoos iyo aan muuqan
    animate={{ opacity: 1, y: 0 }}      // kadib: kor u kac iyo muuqaal buuxa
    transition={{ duration: 1, ease: "easeOut" }}  // xawaaraha animation-ka
  >
    Suuqa Iibka Saamiga
  </motion.h1>

  <motion.p
    className="text-blue-600 text-lg font-semibold"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5, duration: 1 }}
  >
    Ka hel fursadaha ugu fiican ee iibka saamiyada halkan.
  </motion.p>
</div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            {/* <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, samiga, rate, or value..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div> */}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center ">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "all" 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({sellers.length})
              </button>
              <button
                onClick={() => setStatusFilter("available")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "available" 
                    ? "bg-green-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Available ({sellers.filter(s => s.status === 'Available').length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "pending" 
                    ? "bg-yellow-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending ({sellers.filter(s => s.status === 'Pending').length})
              </button>
              <button
                onClick={() => setStatusFilter("sold")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  statusFilter === "sold" 
                    ? "bg-red-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Sold ({sellers.filter(s => s.status === 'Sold').length})
              </button>
              
              {/* Clear Filters Button */}
              {/* {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )} */}
            </div>
          </div>
      <div className="flex items-center justify-between px-6 py-3">
        <h2 className="text-gray-600 font-medium">
          {/* Trusted by companies & exchanges */}
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      {/* Seamless Infinite Animation */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-12 py-4"
          animate={{ 
            x: ["0%", "-100%"] 
          }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
        >
          {[...companies, ...companies ,...companies, ...companies,...companies,...companies, ...companies, ...companies,...companies, ...companies ].map((company, index) => (
            <div key={index} className="flex-shrink-0">
              <img
                src={company.logo}
                alt={company.name}
                className="h-10 opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </motion.div>
      </div>


         

          {/* Sorting Info - Always Visible */}
          {/* <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>Always sorted by: <strong className="text-green-600">Available</strong> → <strong className="text-yellow-600">Pending</strong> → <strong className="text-red-600">Sold</strong></span>
          </div> */}
        </div>

        {/* Results Count */}
        {/* <div className="mb-6 text-center">
          <p className="text-gray-600 text-lg">
            Showing <span className="font-bold text-blue-600">{filteredSellers.length}</span> of <span className="font-bold text-gray-800">{sellers.length}</span> sellers
            <span className="text-green-600 font-semibold"> (Available → Pending → Sold)</span>
          </p>
        </div> */}

        {/* Sellers Grid */}
        {filteredSellers.length === 0 ? (
          <div >
            {/* <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div> */}
            {/* <h3 className="text-2xl font-bold text-gray-900 mb-4">No Sellers Found</h3> */}
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm || statusFilter !== "all" 
                ? ""
                : ""}
            </p>
            {/* {(searchTerm || statusFilter !== "all") && (
              <button 
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4"
              >
                Clear Filters
              </button>
            )} */}
            {/* <button 
              onClick={fetchSellers}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Refresh Page
            </button> */}
          </div>
        ) : (
          
         
        
       <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredSellers.map((seller) => (
          <div
            key={seller._id}
            onClick={() => handleClick(seller._id)}
            className="cursor-pointer group block transform hover:-translate-y-2 transition-all duration-300"
          >
            <div
              className={`rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 h-full flex flex-col text-white ${
                seller.status === "Available"
                  ? "bg-blue-600 hover:bg-blue-800"
                  : seller.status === "Pending"
                  ? "bg-blue-600 hover:bg-blue-800"
                  : seller.status === "Sold"
                  ? "bg-blue-600 hover:bg-blue-800"
                  : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              }`}
            >
              {/* Seller Header */}
          <div className="flex items-start justify-between mb-6">
  <div className="flex-1">
    {(() => {
      const company = companies.find(
        (c) => c.name.toLowerCase() === seller.fullname?.toLowerCase()
      );
      return company ? (
        <img
          src={company.logo}
          alt={company.name}
          className="h-10 w-auto rounded-md bg-white p-1"
        />
      ) : (
        <h3 className="text-lg font-semibold text-white">
          {seller.fullname || "Saami"}
        </h3>
      );
    })()}
  </div>
  <div className="flex-shrink-0 ml-4">
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-opacity-20 text-white border border-white border-opacity-30 ${
        seller.status === "Available"
          ? "bg-green-500"
          : seller.status === "Pending"
          ? "bg-yellow-500"
          : seller.status === "Sold"
          ? "bg-red-500"
          : "bg-gray-500"
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
      {seller.status}
    </span>
  </div>
</div>


              {/* Seller Details */}
              <div className="space-y-4 mb-6 flex-1">
                <div className="bg-opacity-20 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">RATE</p>
                    <p className="text-xl font-bold text-white">
                      {seller.rate || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-opacity-20 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">LACAGTA QORMEYSA</p>
                    <p className="text-xl font-bold text-white">
                      {seller.samiga?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-opacity-20 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-semibold">WADARTA GUUD</p>
                    <p className="text-xl font-bold text-white">
                      ${seller.value?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white border-opacity-30 pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm group-hover:opacity-90 transition-colors duration-200 flex items-center gap-2">
                    Dalbo Hada
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <div className="w-2 h-2 bg-white rounded-full group-hover:opacity-70 transition-colors duration-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ⚠️ Modal (only if user not logged in) */}
      {!user && showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-red-500 dark:text-white mb-2 text-center">
              Fadlan is diwangeli
            </h3>

            <p className="font-semibold text-gray-600 dark:text-gray-300 mb-6 text-center">
              Si aad u dalbato saamigan, waa inaad marka hore isdiiwaangelisaa
              ama soo gashaa.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all"
              >
                Hada Is Diiwangeli
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Ka Noqo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
        )}
        <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...buttonStyle, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>

        {/* Stats Footer */}
        {sellers.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              {/* Total Sellers */}
              <div>
                <p className="text-2xl font-bold text-blue-600">{sellers.length}</p>
                <p className="text-gray-600 text-sm">Total Sellers</p>
              </div>
              
              {/* Pending Sellers */}
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {sellers.filter(s => s.status === 'Pending').length}
                </p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
              
              {/* Available Sellers */}
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {sellers.filter(s => s.status === 'Available').length}
                </p>
                <p className="text-gray-600 text-sm">Available</p>
              </div>
              
              {/* Sold Sellers */}
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {sellers.filter(s => s.status === 'Sold').length}
                </p>
                <p className="text-gray-600 text-sm">Sold</p>
              </div>
              
              {/* Total Value - Lacagta */}
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  ${sellers
                    .filter(s => s.status === 'Available')
                    .reduce((total, seller) => total + (parseFloat(seller.value) || 0), 0)
                    .toLocaleString()
                  }
                </p>
                <p className="text-gray-600 text-sm">Available Value</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerManagement;