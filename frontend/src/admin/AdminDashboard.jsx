import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, Package, ShoppingBag, CreditCard, 
  TrendingUp, DollarSign, AlertCircle, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Eye,
  User, Package2, Receipt, Wallet
} from "lucide-react";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState({
    customers: true,
    products: true,
    sales: true,
    debts: true
  });
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchCustomers();
    fetchProducts();
    fetchSales();
    fetchDebts();
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, customers: false }));
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/sales");
      setSales(res.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, sales: false }));
    }
  };

  const fetchDebts = async () => {
    try {
      const res = await axios.get("/api/debts");
      setDebts(res.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, debts: false }));
    }
  };

  // Calculations
  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const outstanding = totalDebt - totalPaid;
  
  const totalSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalInventoryValue = products.reduce((sum, p) => 
    sum + (p.productprice * p.productQuantity), 0);
  
  // Recent data (last 7 days)
  const recentSales = sales.slice(-5).reverse();
  const recentDebts = debts.slice(-5).reverse();

  // Low stock products (less than 10 items)
  const lowStockProducts = products.filter(p => p.productQuantity < 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome to your business management dashboard</p>
          </div>
          
          {/* Time Range and Refresh */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <button
              onClick={fetchAllData}
              disabled={Object.values(isLoading).some(loading => loading)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={Object.values(isLoading).some(loading => loading) ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading.customers ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    customers.length.toLocaleString()
                  )}
                </p>
                <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
                  <ArrowUp size={14} />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl">
                <Users className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading.products ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    products.length.toLocaleString()
                  )}
                </p>
                <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
                  <ArrowUp size={14} />
                  +5% from last month
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl">
                <Package className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Total Sales Value */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading.sales ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    `$${totalSalesValue.toLocaleString()}`
                  )}
                </p>
                <p className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {sales.length} transactions
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl">
                <ShoppingBag className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Outstanding Debts */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Outstanding Debts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading.debts ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                  ) : (
                    `$${outstanding.toLocaleString()}`
                  )}
                </p>
                <p className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {debts.length} active debts
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-50 rounded-xl">
                <CreditCard className="text-red-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Inventory Value */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-2">Inventory Value</p>
                <p className="text-3xl font-bold">
                  {isLoading.products ? (
                    <div className="animate-pulse bg-red-400 h-8 w-24 rounded"></div>
                  ) : (
                    `$${totalInventoryValue.toLocaleString()}`
                  )}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Package2 className="text-white" size={28} />
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Low Stock Alert</p>
                <p className="text-3xl font-bold text-red-600">
                  {isLoading.products ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                  ) : (
                    lowStockProducts.length
                  )}
                </p>
                <p className="text-gray-600 text-sm font-medium mt-2">
                  Products need restocking
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertCircle className="text-red-600" size={28} />
              </div>
            </div>
          </div>

          {/* Debt Collection Rate */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Debt Collection</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading.debts ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : totalDebt > 0 ? (
                    `${Math.round((totalPaid / totalDebt) * 100)}%`
                  ) : '100%'}
                </p>
                <p className="text-gray-600 text-sm font-medium mt-2">
                  {totalDebt > 0 ? `$${totalPaid.toLocaleString()} collected` : 'No debts'}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <Wallet className="text-red-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Recent Sales</h2>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar size={14} />
                  Last 5 transactions
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading.sales ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : recentSales.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600">No sales recorded yet</p>
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <Receipt size={18} className="text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              ${sale.totalAmount?.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {sale.items?.length || 0} items • {sale.customer?.cusname || 'Walk-in'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(sale.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outstanding Debts */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Outstanding Debts</h2>
                <span className="text-sm text-red-600 font-medium">
                  Total: ${outstanding.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading.debts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : recentDebts.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600">No outstanding debts</p>
                </div>
              ) : (
                recentDebts.map((debt) => {
                  const outstandingAmount = debt.amount - debt.paidAmount;
                  const paidPercentage = (debt.paidAmount / debt.amount) * 100;
                  
                  return (
                    <div key={debt._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                              <User size={18} className="text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {debt.customer?.cusname || 'Unknown Customer'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Total: ${debt.amount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="ml-12">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>${debt.paidAmount?.toLocaleString()} paid</span>
                              <span>${outstandingAmount.toLocaleString()} remaining</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            outstandingAmount > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {outstandingAmount > 0 ? 'Pending' : 'Paid'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Customers */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Recent Customers</h2>
                <span className="text-sm text-gray-600">Total: {customers.length}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading.customers ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : customers.slice(-5).reverse().map((customer) => (
                <div key={customer._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold">
                          {customer.cusname?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{customer.cusname}</p>
                        <p className="text-sm text-gray-600">{customer.cusPhone}</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 transition-colors duration-200">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Low Stock Products</h2>
                <span className="text-sm text-red-600 font-medium">
                  {lowStockProducts.length} products
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading.products ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : lowStockProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600">All products are well-stocked</p>
                </div>
              ) : (
                lowStockProducts.slice(-5).reverse().map((product) => (
                  <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <Package size={18} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.productname}</p>
                          <p className="text-sm text-gray-600">
                            ${product.productprice} • Stock: {product.productQuantity}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.productQuantity < 5 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.productQuantity < 5 ? 'Critical' : 'Low'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;