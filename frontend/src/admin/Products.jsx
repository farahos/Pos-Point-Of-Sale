import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/products';

const ProductManagement = () => {
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dialog, setDialog] = useState({ open: false, type: '', data: null });

  // Form state
  const [form, setForm] = useState({
    name: '', category: 'Qudar', pricePerUnit: '', pricePerKg: '', pricePerCase: '',
    unitsPerCase: '', kgPerCase: '', stockUnits: '', stockKg: ''
  });

  // Stock update state
  const [stockForm, setStockForm] = useState({ units: '', kg: '', operation: 'set' });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setProducts(res.data.data);
    } catch (err) {
      showMessage('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper functions
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const resetForm = () => {
    setForm({
      name: '', category: '', pricePerUnit: '', pricePerKg: '', pricePerCase: '',
      unitsPerCase: '', kgPerCase: '', stockUnits: '', stockKg: ''
    });
  };

  const openDialog = (type, product = null) => {
    if (product) {
      if (type === 'edit') setForm(product);
      if (type === 'stock') setStockForm({ units: '', kg: '', operation: 'set' });
    }
    setDialog({ open: true, type, data: product });
  };

  const closeDialog = () => {
    setDialog({ open: false, type: '', data: null });
    resetForm();
  };

  // CRUD Operations
  const handleCreate = async () => {
    try {
      await axios.post(API_URL, form);
      showMessage('Product created!');
      fetchProducts();
      closeDialog();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error creating product', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/${dialog.data._id}`, form);
      showMessage('Product updated!');
      fetchProducts();
      closeDialog();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error updating product', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${dialog.data._id}`);
      showMessage('Product deleted!');
      fetchProducts();
      closeDialog();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error deleting product', 'error');
    }
  };

  const handleStockUpdate = async () => {
    try {
      await axios.patch(`${API_URL}/${dialog.data._id}/stock`, {
        stockUnits: stockForm.units || 0,
        stockKg: stockForm.kg || 0,
        operation: stockForm.operation
      });
      showMessage('Stock updated!');
      fetchProducts();
      closeDialog();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error updating stock', 'error');
    }
  };

  // Calculations
  const getStockValue = (product) => {
    return (product.stockUnits * product.pricePerUnit) + (product.stockKg * product.pricePerKg);
  };

  const isLowStock = (product) => product.stockUnits < 10 || product.stockKg < 10;

  // Filter products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const stats = {
    total: products.length,
    lowStock: products.filter(isLowStock).length,
    totalValue: products.reduce((sum, p) => sum + getStockValue(p), 0)
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>📦 Product Management</h1>
        <p>Manage inventory products and stock</p>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>${stats.totalValue.toFixed(2)}</h3>
          <p>Total Value</p>
        </div>
        <div className="stat-card warning">
          <h3>{stats.lowStock}</h3>
          <p>Low Stock</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="actions">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search"
        />
        <button onClick={() => openDialog('add')} className="btn-primary">
          ➕ Add Product
        </button>
        <button onClick={fetchProducts} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Products Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">No products found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price/Unit</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>${product.pricePerUnit.toFixed(2)}</td>
                  <td className={isLowStock(product) ? 'low-stock' : ''}>
                    {product.stockUnits}
                  </td>
                  <td>
                    <span className={`status ${isLowStock(product) ? 'warning' : 'success'}`}>
                      {isLowStock(product) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openDialog('edit', product)} className="btn-small">
                      ✏️ Edit
                    </button>
                    <button onClick={() => openDialog('stock', product)} className="btn-small">
                      📦 Stock
                    </button>
                    <button onClick={() => openDialog('delete', product)} className="btn-small danger">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {['add', 'edit'].includes(dialog.type) && (
        <div className="modal">
          <div className="modal-content">
            <h2>{dialog.type === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
            
            <div className="form-grid">
              <input
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
              <input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price per Unit"
                value={form.pricePerUnit}
                onChange={(e) => setForm({...form, pricePerUnit: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price per Kg"
                value={form.pricePerKg}
                onChange={(e) => setForm({...form, pricePerKg: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price per Case"
                value={form.pricePerCase}
                onChange={(e) => setForm({...form, pricePerCase: e.target.value})}
              />
              <input
                type="number"
                placeholder="Units per Case"
                value={form.unitsPerCase}
                onChange={(e) => setForm({...form, unitsPerCase: e.target.value})}
              />
              <input
                type="number"
                placeholder="Kg per Case"
                value={form.kgPerCase}
                onChange={(e) => setForm({...form, kgPerCase: e.target.value})}
              />
              <input
                type="number"
                placeholder="Initial Stock Units"
                value={form.stockUnits}
                onChange={(e) => setForm({...form, stockUnits: e.target.value})}
              />
              <input
                type="number"
                placeholder="Initial Stock Kg"
                value={form.stockKg}
                onChange={(e) => setForm({...form, stockKg: e.target.value})}
              />
            </div>

            <div className="modal-actions">
              <button onClick={closeDialog} className="btn-secondary">Cancel</button>
              <button onClick={dialog.type === 'add' ? handleCreate : handleUpdate} className="btn-primary">
                {dialog.type === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Dialog */}
      {dialog.type === 'stock' && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Stock - {dialog.data?.name}</h2>
            
            <div className="form">
              <select
                value={stockForm.operation}
                onChange={(e) => setStockForm({...stockForm, operation: e.target.value})}
              >
                <option value="set">Set to Value</option>
                <option value="increment">Increase by</option>
                <option value="decrement">Decrease by</option>
              </select>
              
              <input
                type="number"
                placeholder={`Units (Current: ${dialog.data?.stockUnits})`}
                value={stockForm.units}
                onChange={(e) => setStockForm({...stockForm, units: e.target.value})}
              />
              
              <input
                type="number"
                placeholder={`Kg (Current: ${dialog.data?.stockKg})`}
                value={stockForm.kg}
                onChange={(e) => setStockForm({...stockForm, kg: e.target.value})}
              />
            </div>

            <div className="modal-actions">
              <button onClick={closeDialog} className="btn-secondary">Cancel</button>
              <button onClick={handleStockUpdate} className="btn-primary">Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {dialog.type === 'delete' && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Delete "{dialog.data?.name}"? This action cannot be undone.</p>
            
            <div className="modal-actions">
              <button onClick={closeDialog} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 30px;
        }

        .header h1 {
          margin: 0;
          color: #333;
        }

        .header p {
          color: #666;
          margin: 5px 0 0 0;
        }

        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          flex: 1;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-card.warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
        }

        .stat-card h3 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .stat-card p {
          margin: 5px 0 0 0;
          color: #666;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          align-items: center;
        }

        .search {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-small {
          padding: 5px 10px;
          font-size: 12px;
          margin-right: 5px;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #bd2130;
        }

        .message {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
          text-align: center;
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

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
        }

        tr:hover {
          background: #f5f5f5;
        }

        .low-stock {
          color: #dc3545;
          font-weight: bold;
        }

        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .status.success {
          background: #d4edda;
          color: #155724;
        }

        .status.warning {
          background: #fff3cd;
          color: #856404;
        }

        .loading, .empty {
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .modal {
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
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin: 20px 0;
        }

        input, select {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          width: 100%;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #007bff;
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;