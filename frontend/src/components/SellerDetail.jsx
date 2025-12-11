import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../hooks/useUser'; // Adjust path as needed
import Footer from './Footer';

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Get current user from context
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // New state for success popup

  const [seller, setSeller] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch seller details with error handling
  const fetchSeller = async () => {
    try {
      setLoading(true);
      console.log('Fetching seller with ID:', sellerId);
      
      const response = await axios.get(`/api/sellers/${sellerId}`);
      console.log('Seller response:', response.data);
      
      setSeller(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching seller:', error);
      setError('Error loading seller: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch buyers for this specific seller
  const fetchSellerBuyers = async () => {
    try {
      const response = await axios.get(`/api/buyers/seller/${sellerId}`);
      console.log('Buyers response:', response.data);
      setBuyers(response.data.data);
    } catch (error) {
      console.error('Error fetching buyers:', error);
      // If the specific endpoint doesn't exist, fall back to filtering all buyers
      try {
        const allBuyersResponse = await axios.get('/api/buyers');
        const filteredBuyers = allBuyersResponse.data.data.filter(
          buyer => buyer.seller?._id === sellerId || buyer.seller === sellerId
        );
        setBuyers(filteredBuyers);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  useEffect(() => {
    fetchSeller();
    fetchSellerBuyers();
  }, [sellerId]);

  // Handle adding buyer request
  const handleAddBuyerRequest = async () => {
    try {
      // Check if user is logged in
      if (!user) {
        alert("Fadlan login marka hore si aad u dalbato saamigan.");
        setShowConfirm(false);
        navigate('/login'); // Redirect to login page
        return;
      }

      // Add buyer request using user's information
      await axios.post('/api/buyers', {
        name: user.username,
        email: user.email,
        phone: user.phone || "N/A",
        requestedProduct: "Hormuud Shares",
        buyer: sellerId,
      });

      // Update seller status to "Pending"
      await axios.patch(`/api/sellers/${sellerId}/status`, { status: "Pending" });

      // Refresh data
      fetchSeller();
      fetchSellerBuyers();
      setShowConfirm(false);
      
      // Show success popup instead of alert
      setShowSuccess(true);

      // Navigate to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 10000);

    } catch (error) {
      console.error('Error adding buyer request:', error);
      alert('Codsigaaga laguma guuleysan fadlan dalbo mar kale! ' + 
            (error.response?.data?.message || error.message));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading seller details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Sellers
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Seller</h2>
            <p className="text-gray-600 mb-6 text-lg">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Seller not found state
  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Sellers
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-yellow-200">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Not Found</h2>
            <p className="text-gray-600 mb-6 text-lg">The seller you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Go Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
     <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    {/* Main Content */}
    <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          {/* <h1 className="text-2xl font-semibold text-blue-600">
            Waxaan Diyaar u ahay inaan iibsado saamigan:
          </h1> */}
        </div>

        {/* Seller Information Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              {/* <h2 className="text-3xl font-bold text-white mb-2">
                {seller.fullname || seller.name}
              </h2> */}
              {/* <p className="text-blue-100 text-lg">Seller Information</p> */}
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mt-4 lg:mt-0 -opacity-20 text-white border border-white border-opacity-30">
              <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
              {seller.status || 'Pending'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-white  font-semibold text-lg">RATE</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{seller.rate || 'N/A'}</p>
            </div>
            
            <div className="rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-white font-semibold text-lg">LACAGTA QORMEYSA</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{seller.samiga.toLocaleString() || 'N/A'}</p>
            </div>
            
            <div className="bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <p className="text-white font-semibold text-lg "> WADARTA GUUD</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">${seller.value.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Buyer Requests Section */}
        <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
          {/* Buyers List */}
          {buyers.length === 0 ? (
            <div className="text-end">
              {seller.status === "Pending" || seller.status === "Sold" ? (
                <p className="text-red-600 font-semibold text-lg">
                 Saamigan lama dalban karo hadda — xaaladiisu waa "{seller.status}".
                </p>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Dalbo Hada
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Already Requested</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {buyers.length} {buyers.length === 1 ? 'Request' : 'Requests'}
                </span>
              </div>
              
              {/* You can display the buyers list here if needed */}
              <div className="space-y-4">
                {buyers.map((buyer) => (
                  <div key={buyer._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{buyer.name}</p>
                        <p className="text-gray-600 text-sm">{buyer.email}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        Requested
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {user && showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
              <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-2xl font-bold text-red-500 dark:text-white mb-2 text-center ">
              Xaqiijin
            </h3>
            
            {/* Message */}
            <p className="font-semibold text-blue-600 dark:text-gray-300 mb-6 text-center ">
              Ma hubtaa inaad rabto inaad dalbato saamigan?
              
              {user && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    <strong className='text-xl text-blue-800 font-semibold'>
                      Qiimihiisu yahay: ${seller.value.toLocaleString()}
                    </strong>
                  </p>
                </div>
              )}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleAddBuyerRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all"
              >
                Haa
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Maya
              </button>
            </div>
          </div>
        </div>
      )}
    

      {/* Success Popup Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-2xl font-bold text-green-600 dark:text-white mb-2 text-center ">
              Thanks!
            </h3>
            
            {/* Message */}
            <p className="font-semibold text-black mb-6 text-center text-lg">
              ✅ Codsigaaga waa la gudbiyey! Tag Nootaayo Boqole.
            </p>
            
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
               
              </p>
            </div>
          </div>
        </div>
      )}
        
      </main>
      
  <Footer className="mt-auto" /> 
     
     
    </div>
  );

};

export default SellerDetail;