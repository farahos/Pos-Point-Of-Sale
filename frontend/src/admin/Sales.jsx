import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = '/api';
const PRODUCTS_API = `${API_URL}/Products`;
const SALES_API = `${API_URL}/sales`;
const CUSTOMERS_API = `${API_URL}/customers`;

const SalesManagement = () => {
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ totalAmount: 0, totalSales: 0, avgSale: 0 });
  
  // Form states
  const [saleForm, setSaleForm] = useState({
    productId: '',
    customerId: '',
    saleType: 'unit',
    quantity: '',
    paymentMethod: 'cash',
    paidAmount: '',
    notes: ''
  });

  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  
  // UI states
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  // Ref for click outside
  const productRef = useRef(null);
  const customerRef = useRef(null);

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    guaranteeName: '',
    guaranteePhone: '',
    creditLimit: '',
    email: '',
    notes: ''
  });

  // Selected items
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchSales();
    fetchStats();
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductSuggestions(false);
      }
      if (customerRef.current && !customerRef.current.contains(event.target)) {
        setShowCustomerSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch functions
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCTS_API);
      setProducts(res.data.data);
      setFilteredProducts(res.data.data);
    } catch (err) {
      showMessage('Error loading products', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(CUSTOMERS_API);
      setCustomers(res.data.data);
      setFilteredCustomers(res.data.data);
    } catch (err) {
      showMessage('Error loading customers', 'error');
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axios.get(SALES_API);
      setSales(res.data.data);
    } catch (err) {
      showMessage('Error loading sales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${SALES_API}/stats`);
      setStats(res.data.data.total);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Product search and selection
  useEffect(() => {
    if (productSearch.trim()) {
      const searchTerm = productSearch.toLowerCase();
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
      );
      setFilteredProducts(filtered);
      setShowProductSuggestions(true);
    } else {
      setFilteredProducts(products);
      setShowProductSuggestions(false);
    }
  }, [productSearch, products]);

  // Customer search and selection
  useEffect(() => {
    if (customerSearch.trim()) {
      const searchTerm = customerSearch.toLowerCase();
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm) ||
        customer.customerPhone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(true);
    } else {
      setFilteredCustomers(customers);
      setShowCustomerSuggestions(false);
    }
  }, [customerSearch, customers]);

  // Handle product selection
  const handleProductSelect = (product) => {
    setSaleForm({...saleForm, productId: product._id });
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowProductSuggestions(false);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSaleForm({...saleForm, customerId: customer._id });
    setSelectedCustomer(customer);
    setCustomerSearch(`${customer.customerName} - ${customer.customerPhone}`);
    setShowCustomerSuggestions(false);
  };

  // Create new customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(CUSTOMERS_API, newCustomer);
      showMessage('Customer created successfully!');
      
      const newCustomerData = res.data.data;
      const updatedCustomers = [newCustomerData, ...customers];
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
      
      // Select the new customer
      handleCustomerSelect(newCustomerData);
      
      // Reset form
      setNewCustomer({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        guaranteeName: '',
        guaranteePhone: '',
        creditLimit: '',
        email: '',
        notes: ''
      });
      setShowNewCustomerForm(false);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error creating customer', 'error');
    }
  };

  // Calculate sale details
  const calculateSaleDetails = () => {
    if (!selectedProduct) return { price: 0, total: 0, stockInfo: '', canSell: false };

    let price = 0;
    let total = 0;
    let stockInfo = '';
    let canSell = true;

    switch (saleForm.saleType) {
      case 'unit':
        price = selectedProduct.pricePerUnit;
        total = saleForm.quantity * price;
        stockInfo = `Available: ${selectedProduct.stockUnits} units`;
        canSell = selectedProduct.stockUnits >= saleForm.quantity;
        break;
      case 'kg':
        price = selectedProduct.pricePerKg;
        total = saleForm.quantity * price;
        stockInfo = `Available: ${selectedProduct.stockKg.toFixed(2)} kg`;
        canSell = selectedProduct.stockKg >= saleForm.quantity;
        break;
      case 'case':
        price = selectedProduct.pricePerCase;
        total = saleForm.quantity * price;
        const unitsNeeded = saleForm.quantity * selectedProduct.unitsPerCase;
        const kgNeeded = saleForm.quantity * selectedProduct.kgPerCase;
        stockInfo = `Units needed: ${unitsNeeded}, Kg needed: ${kgNeeded.toFixed(2)}`;
        canSell = selectedProduct.stockUnits >= unitsNeeded && selectedProduct.stockKg >= kgNeeded;
        break;
    }

    return { price, total, stockInfo, canSell };
  };

  const saleDetails = calculateSaleDetails();

  // Handle sale submit
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedCustomer) {
      showMessage('Please select a customer', 'error');
      return;
    }
    
    if (!selectedProduct) {
      showMessage('Please select a product', 'error');
      return;
    }
    
    if (saleForm.quantity <= 0) {
      showMessage('Quantity must be greater than 0', 'error');
      return;
    }
    
    if (!saleDetails.canSell) {
      showMessage('Insufficient stock!', 'error');
      return;
    }

    // Credit validation
    if (saleForm.paymentMethod === 'credit') {
      const availableCredit = selectedCustomer.creditLimit - selectedCustomer.currentCredit;
      if (saleDetails.total > availableCredit) {
        showMessage(`Credit limit exceeded! Available: $${availableCredit.toFixed(2)}`, 'error');
        return;
      }
    }

    try {
      setLoading(true);
      const saleData = {
        productId: selectedProduct._id,
        customerId: selectedCustomer._id,
        saleType: saleForm.saleType,
        quantity: saleForm.quantity,
        paymentMethod: saleForm.paymentMethod,
        paidAmount: saleForm.paymentMethod === 'credit' ? 0 : saleDetails.total,
        notes: saleForm.notes
      };
      
      const res = await axios.post(SALES_API, saleData);
      
      showMessage(`✅ Sale completed! Invoice: ${res.data.invoiceNumber}`);
      
      // Reset form
      setSaleForm({
        productId: '',
        customerId: '',
        saleType: 'unit',
        quantity: 1,
        paymentMethod: 'cash',
        paidAmount: '',
        notes: ''
      });
      setProductSearch('');
      setCustomerSearch('');
      setSelectedProduct(null);
      setSelectedCustomer(null);
      
      // Refresh data
      fetchProducts();
      fetchCustomers();
      fetchSales();
      fetchStats();
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error processing sale';
      showMessage(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear product selection
  const clearProductSelection = () => {
    setProductSearch('');
    setSelectedProduct(null);
    setSaleForm({...saleForm, productId: '' });
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setCustomerSearch('');
    setSelectedCustomer(null);
    setSaleForm({...saleForm, customerId: '' });
  };

  return (
    <div className="sales-container">
      {/* Header */}
      <div className="header">
        <h1>💰 Sales Management</h1>
        <p>Process sales with customer integration</p>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>${stats.totalAmount.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalSales}</h3>
          <p>Total Sales</p>
        </div>
        <div className="stat-card">
          <h3>{customers.length}</h3>
          <p>Total Customers</p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'error' ? '❌ ' : '✅ '}
          {message.text}
        </div>
      )}

      {/* Sales Form */}
      <div className="card">
        <h2>➕ New Sale</h2>
        
        <form onSubmit={handleSaleSubmit}>
          {/* Customer Selection */}
          <div className="form-group" ref={customerRef}>
            <label>Customer *</label>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search customer by name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  disabled={loading}
                  className="search-input"
                />
                {customerSearch && (
                  <button 
                    type="button"
                    className="clear-btn"
                    onClick={clearCustomerSelection}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {showCustomerSuggestions && filteredCustomers.length > 0 && (
                <div className="suggestions-list">
                  {filteredCustomers.map(customer => (
                    <div 
                      key={customer._id}
                      className="suggestion-item"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="suggestion-main">
                        <strong>{customer.customerName}</strong>
                        <span className="phone">{customer.customerPhone}</span>
                      </div>
                      <div className="suggestion-details">
                        <span className="credit-info">
                          Credit: ${customer.creditLimit} (Used: ${customer.currentCredit})
                        </span>
                      </div>
                    </div>
                  ))}
                  <div 
                    className="suggestion-item new-item"
                    onClick={() => setShowNewCustomerForm(true)}
                  >
                    + Add New Customer
                  </div>
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="selected-item">
                <div className="selected-info">
                  <strong>✓ Selected:</strong> {selectedCustomer.customerName}
                  <span className="selected-phone">Phone: {selectedCustomer.customerPhone}</span>
                  <span className={`selected-credit ${selectedCustomer.currentCredit > 0 ? 'credit-used' : ''}`}>
                    Credit: ${selectedCustomer.creditLimit} (Used: ${selectedCustomer.currentCredit})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="form-group" ref={productRef}>
            <label>Product *</label>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search product by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onFocus={() => setShowProductSuggestions(true)}
                  disabled={loading || !selectedCustomer}
                  className="search-input"
                />
                {productSearch && (
                  <button 
                    type="button"
                    className="clear-btn"
                    onClick={clearProductSelection}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {showProductSuggestions && filteredProducts.length > 0 && (
                <div className="suggestions-list">
                  {filteredProducts.map(product => (
                    <div 
                      key={product._id}
                      className="suggestion-item"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="suggestion-main">
                        <strong>{product.name}</strong>
                        <span className="category">{product.category || 'Uncategorized'}</span>
                      </div>
                      <div className="suggestion-details">
                        <span className="price">${product.pricePerUnit}/unit</span>
                        <span className="stock">
                          Stock: {product.stockUnits}u, {product.stockKg.toFixed(2)}kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedProduct && (
              <div className="selected-item">
                <div className="selected-info">
                  <strong>✓ Selected:</strong> {selectedProduct.name}
                  <span className="selected-category">Category: {selectedProduct.category || 'N/A'}</span>
                  <span className="selected-stock">
                    Stock: {selectedProduct.stockUnits} units, {selectedProduct.stockKg.toFixed(2)} kg
                  </span>
                  <span className="selected-prices">
                    Prices: ${selectedProduct.pricePerUnit}/unit • ${selectedProduct.pricePerKg}/kg • ${selectedProduct.pricePerCase}/case
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sale Type and Quantity */}
          {selectedProduct && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Sale Type *</label>
                  <select
                    value={saleForm.saleType}
                    onChange={(e) => setSaleForm({...saleForm, saleType: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="unit">By Unit</option>
                    <option value="kg">By Kilogram</option>
                    <option value="case">By Case</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="0.01"
                    step={saleForm.saleType === 'kg' ? "0.01" : "1"}
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({...saleForm, quantity: parseFloat(e.target.value) || 1})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Sale Summary */}
              <div className="sale-summary">
                <h4>Sale Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Unit Price:</span>
                    <strong>${saleDetails.price.toFixed(2)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Quantity:</span>
                    <span>{saleForm.quantity} {saleForm.saleType}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Price:</span>
                    <strong>${saleDetails.total.toFixed(2)}</strong>
                  </div>
                  <div className={`summary-item stock ${saleDetails.canSell ? 'in-stock' : 'out-of-stock'}`}>
                    <span>Stock Status:</span>
                    <span>{saleDetails.stockInfo}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={saleForm.paymentMethod}
                  onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              {/* Credit warning */}
              {saleForm.paymentMethod === 'credit' && selectedCustomer && (
                <div className="alert alert-warning">
                  <strong>⚠️ Credit Sale</strong>
                  <p>This sale will use customer's credit limit</p>
                  <p>
                    Available Credit: 
                    <span className={`credit-available ${(selectedCustomer.creditLimit - selectedCustomer.currentCredit) < saleDetails.total ? 'insufficient' : ''}`}>
                      ${(selectedCustomer.creditLimit - selectedCustomer.currentCredit).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                  rows="3"
                  disabled={loading}
                  placeholder="Any additional notes..."
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading || !selectedCustomer || !selectedProduct || !saleDetails.canSell}
          >
            {loading ? '⏳ Processing...' : '✅ Complete Sale'}
          </button>
        </form>
      </div>

      {/* New Customer Modal */}
      {showNewCustomerForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>➕ Add New Customer</h3>
              <button 
                className="close-btn"
                onClick={() => setShowNewCustomerForm(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newCustomer.customerName}
                    onChange={(e) => setNewCustomer({...newCustomer, customerName: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={newCustomer.customerPhone}
                    onChange={(e) => setNewCustomer({...newCustomer, customerPhone: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={newCustomer.customerAddress}
                  onChange={(e) => setNewCustomer({...newCustomer, customerAddress: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Guarantee Name</label>
                  <input
                    type="text"
                    value={newCustomer.guaranteeName}
                    onChange={(e) => setNewCustomer({...newCustomer, guaranteeName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Guarantee Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.guaranteePhone}
                    onChange={(e) => setNewCustomer({...newCustomer, guaranteePhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Credit Limit ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCustomer.creditLimit}
                    onChange={(e) => setNewCustomer({...newCustomer, creditLimit: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                  rows="2"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowNewCustomerForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Sales */}
      <div className="card">
        <div className="card-header">
          <h2>📜 Recent Sales</h2>
          <button 
            onClick={fetchSales} 
            disabled={loading} 
            className="btn-small refresh-btn"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="sales-list">
          {sales.length === 0 ? (
            <div className="empty-state">No sales yet. Create your first sale!</div>
          ) : (
            sales.slice(0, 10).map(sale => (
              <div key={sale._id} className="sale-item">
                <div className="sale-header">
                  <span className="invoice">{sale.invoiceNumber}</span>
                  <span className={`status ${sale.paymentStatus} ${sale.paymentMethod}`}>
                    {sale.paymentMethod === 'credit' ? '💳 Credit' : '💰 Paid'} • {sale.paymentStatus}
                  </span>
                </div>
                
                <div className="sale-details">
                  <p className="product-name">
                    <strong>{sale.product?.name || 'Product'}</strong>
                    <span className="customer-name">for {sale.customer?.customerName || 'Customer'}</span>
                  </p>
                  <p className="sale-info">
                    {sale.quantity} {sale.saleType} • ${sale.totalPrice.toFixed(2)}
                  </p>
                  <p className="sale-date">{formatDate(sale.saleDate)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .sales-container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }

        .header p {
          color: #7f8c8d;
          margin: 5px 0 0 0;
          font-size: 16px;
        }

        .stats {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .stat-card {
          flex: 1;
          min-width: 150px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          text-align: center;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .stat-card h3 {
          margin: 0;
          font-size: 24px;
          color: #2c3e50;
          font-weight: 600;
        }

        .stat-card p {
          margin: 8px 0 0 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .message {
          padding: 12px 20px;
          margin-bottom: 25px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.08);
          margin-bottom: 25px;
        }

        .card h2 {
          margin: 0 0 25px 0;
          color: #2c3e50;
          font-size: 20px;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 25px;
          position: relative;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
          font-size: 14px;
        }

        input, select, textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          transition: all 0.2s;
          background: #fafafa;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3498db;
          background: white;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input {
          padding-right: 40px;
        }

        .clear-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #95a5a6;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          background: #f0f0f0;
          color: #e74c3c;
        }

        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          margin-top: 5px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .suggestion-item {
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .suggestion-item:hover {
          background: #f8f9fa;
        }

        .suggestion-item.new-item {
          background: #e8f4fc;
          color: #2980b9;
          font-weight: 500;
          text-align: center;
        }

        .suggestion-item.new-item:hover {
          background: #d4eaf7;
        }

        .suggestion-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .suggestion-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #7f8c8d;
        }

        .phone, .category, .price, .stock, .credit-info {
          font-size: 12px;
          color: #7f8c8d;
        }

        .selected-item {
          margin-top: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #27ae60;
          animation: slideIn 0.3s ease;
        }

        .selected-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 14px;
        }

        .selected-info > * {
          margin: 2px 0;
        }

        .selected-phone, .selected-category, .selected-stock, .selected-prices, .selected-credit {
          color: #5d6d7e;
          font-size: 13px;
        }

        .credit-used {
          color: #e74c3c;
          font-weight: 500;
        }

        .sale-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin: 25px 0;
          border: 1.5px solid #e0e0e0;
        }

        .sale-summary h4 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e8e8e8;
        }

        .summary-item.total {
          grid-column: span 2;
          font-size: 16px;
          border-bottom: 2px solid #3498db;
        }

        .summary-item.stock {
          grid-column: span 2;
        }

        .in-stock {
          color: #27ae60;
        }

        .out-of-stock {
          color: #e74c3c;
          font-weight: 500;
        }

        .alert {
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
        }

        .credit-available {
          margin-left: 10px;
          font-weight: 600;
          color: #27ae60;
        }

        .credit-available.insufficient {
          color: #e74c3c;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2980b9, #1c6ea4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #95a5a6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        .btn-small {
          padding: 8px 15px;
          background: #7f8c8d;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-small:hover:not(:disabled) {
          background: #6c7a7d;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeInOverlay 0.3s ease;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #95a5a6;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #e74c3c;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .sales-list {
          max-height: 500px;
          overflow-y: auto;
        }

        .sale-item {
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .sale-item:hover {
          border-color: #3498db;
          box-shadow: 0 2px 8px rgba(52, 152, 219, 0.15);
        }

        .sale-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .invoice {
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
          font-family: monospace;
        }

        .status {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status.paid {
          background: #d4edda;
          color: #155724;
        }

        .status.pending {
          background: #fff3cd;
          color: #856404;
        }

        .status.credit {
          background: #d0e3ff;
          color: #004085;
        }

        .sale-details {
          font-size: 13px;
        }

        .product-name {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 5px 0;
        }

        .customer-name {
          color: #7f8c8d;
          font-size: 12px;
        }

        .sale-info {
          color: #5d6d7e;
          margin: 5px 0;
        }

        .sale-date {
          color: #95a5a6;
          font-size: 11px;
          margin: 8px 0 0 0;
          text-align: right;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #95a5a6;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
          }
          
          .summary-item.total,
          .summary-item.stock {
            grid-column: span 1;
          }
          
          .stats {
            flex-direction: column;
          }
          
          .stat-card {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesManagement;