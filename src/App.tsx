import React, { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  History,
  FileSpreadsheet,
  X,
  HelpCircle,
  Undo2,
  DollarSign,
  TrendingUp as TrendUpIcon,
  Activity
} from "lucide-react";
import { 
  Department, 
  Product, 
  SaleTransaction, 
  KPIStats, 
  AIAnalysisReport 
} from "./types";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  HOURLY_SALES_CURVE 
} from "./mockData";
import KPICards from "./components/KPICards";
import HourlySalesChart from "./components/HourlySalesChart";
import PowerBIEmbed from "./components/PowerBIEmbed";
import { StoreFrontierLogo } from "./components/Logo";

export default function App() {
  // --- Persistent Storage State ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("retail_dashboard_products");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some((p: any) => p.name === "Classic Denim Jacket" || p.sku === "APP-DJ-01")) {
        localStorage.removeItem("retail_dashboard_ai_report");
        return INITIAL_PRODUCTS;
      }
      return parsed;
    }
    return INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem("retail_dashboard_transactions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.some((t: any) => t.productName === "Fresh Haas Avocado Pre-pack" || t.productId === "p17" && t.productName !== "Organic A2 Cow Desi Ghee 1L")) {
        return INITIAL_TRANSACTIONS;
      }
      return parsed;
    }
    return INITIAL_TRANSACTIONS;
  });

  const [selectedDept, setSelectedDept] = useState<Department>(Department.ALL);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Panels State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  
  // Sale registration state
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [saleError, setSaleError] = useState("");

  // Product addition state
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCost, setNewProdCost] = useState(10.00);
  const [newProdPrice, setNewProdPrice] = useState(25.00);
  const [newProdCategory, setNewProdCategory] = useState<Department>(Department.APPAREL);
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdMin, setNewProdMin] = useState(10);
  const [prodError, setProdError] = useState("");

  // Tab State: "dashboard" | "inventory" | "ledger" | "powerbi"
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "ledger" | "powerbi">("dashboard");

  // Save states to local storage
  useEffect(() => {
    localStorage.setItem("retail_dashboard_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("retail_dashboard_transactions", JSON.stringify(transactions));
  }, [transactions]);

  const selectedProductForSale = useMemo(() => {
    return products.find(p => p.id === saleProductId);
  }, [saleProductId, products]);

  // Handle setting first available product for sale on open
  useEffect(() => {
    if (isRecordSaleOpen && products.length > 0) {
      const inStock = products.filter(p => p.stockAmount > 0);
      if (inStock.length > 0) {
        setSaleProductId(inStock[0].id);
      } else {
        setSaleProductId(products[0].id);
      }
    }
  }, [isRecordSaleOpen, products]);

  // --- KPI and Calculation Logic ---
  const relevantProducts = useMemo(() => {
    return products.filter(
      p => selectedDept === Department.ALL || p.category === selectedDept
    );
  }, [products, selectedDept]);

  const kpis: KPIStats = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let itemsInStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    relevantProducts.forEach(p => {
      revenue += p.salesRevenue;
      cost += p.salesCount * p.cost;

      if (p.stockAmount > 0) {
        itemsInStockCount++;
        if (p.stockAmount <= p.stockMinThreshold) {
          lowStockCount++;
        }
      } else {
        outOfStockCount++;
      }
    });

    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const inStockRate = relevantProducts.length > 0 
      ? (itemsInStockCount / relevantProducts.length) * 100 
      : 100;

    return {
      revenue,
      cost,
      profit,
      margin,
      inStockRate,
      lowStockCount,
      outOfStockCount
    };
  }, [relevantProducts]);

  // Fast-Moving Products: highest unit sales count
  const fastMovingProducts = useMemo(() => {
    return [...products]
      .filter(p => p.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  }, [products]);

  // Low-Performing Products: lowest unit sales count with high capital tied up in stock
  const lowPerformingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        // Sort by sales count first (ascending)
        if (a.salesCount !== b.salesCount) {
          return a.salesCount - b.salesCount;
        }
        // Then sort by highest holding asset value
        return (b.stockAmount * b.cost) - (a.stockAmount * a.cost);
      })
      .slice(0, 5);
  }, [products]);

  // Filtered Products for Inventory Directory
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchDept = selectedDept === Department.ALL || p.category === selectedDept;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [products, selectedDept, searchTerm]);

  // Filtered Transactions for Ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      return selectedDept === Department.ALL || t.category === selectedDept;
    });
  }, [transactions, selectedDept]);

  // --- Handlers ---
  const handleRecordSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaleError("");

    const targetProduct = products.find(p => p.id === saleProductId);
    if (!targetProduct) {
      setSaleError("Selected product not found.");
      return;
    }

    if (targetProduct.stockAmount < saleQuantity) {
      setSaleError(`Insufficient stock. Only ${targetProduct.stockAmount} units remaining.`);
      return;
    }

    if (saleQuantity <= 0) {
      setSaleError("Please register at least 1 unit.");
      return;
    }

    // Capture calculated finances
    const pricePerUnit = targetProduct.price;
    const totalPrice = pricePerUnit * saleQuantity;
    const totalCost = targetProduct.cost * saleQuantity;
    const profit = totalPrice - totalCost;

    // 1. Deduct Stock Amount and Increase sales stats
    const updatedProducts = products.map(p => {
      if (p.id === targetProduct.id) {
        return {
          ...p,
          stockAmount: p.stockAmount - saleQuantity,
          salesCount: p.salesCount + saleQuantity,
          salesRevenue: p.salesRevenue + totalPrice
        };
      }
      return p;
    });

    // 2. Insert transaction timestamped log
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newTransaction: SaleTransaction = {
      id: `t-${Date.now()}`,
      productId: targetProduct.id,
      productName: targetProduct.name,
      category: targetProduct.category,
      quantity: saleQuantity,
      pricePerUnit,
      totalPrice,
      totalCost,
      profit,
      timestamp: formattedTime
    };

    setProducts(updatedProducts);
    setTransactions([newTransaction, ...transactions]);
    
    // reset form
    setSaleQuantity(1);
    setIsRecordSaleOpen(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProdError("");

    if (!newProdName.trim() || !newProdSku.trim()) {
      setProdError("Product name and SKU identifier are required.");
      return;
    }

    const skuExists = products.some(p => p.sku.trim().toUpperCase() === newProdSku.trim().toUpperCase());
    if (skuExists) {
      setProdError("A product with this SKU code already exists in stock.");
      return;
    }

    if (newProdCost < 0 || newProdPrice < 0) {
      setProdError("Unit buying and selling pricing metrics must be positive.");
      return;
    }

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: newProdName,
      sku: newProdSku.toUpperCase(),
      category: newProdCategory,
      cost: Number(newProdCost),
      price: Number(newProdPrice),
      stockAmount: Number(newProdStock),
      stockMinThreshold: Number(newProdMin),
      salesCount: 0,
      salesRevenue: 0.00
    };

    setProducts([...products, newProduct]);
    setIsAddProductOpen(false);

    // reset fields
    setNewProdName("");
    setNewProdSku("");
    setNewProdCost(10);
    setNewProdPrice(25);
    setNewProdStock(50);
    setNewProdMin(10);
  };

  const handleRestockProduct = (productId: string, amount: number = 30) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockAmount: p.stockAmount + amount
        };
      }
      return p;
    }));
  };

  const handleRestockAllLowStock = () => {
    setProducts(prev => prev.map(p => {
      if (p.stockAmount <= p.stockMinThreshold) {
        // Restock to threshold + 40 units
        return {
          ...p,
          stockAmount: p.stockAmount + 40
        };
      }
      return p;
    }));
  };

  const handleResetAppDefaults = () => {
    if (window.confirm("Restore dashboard to standard retail seed dataset? This wipes registered testing sales.")) {
      localStorage.removeItem("retail_dashboard_products");
      localStorage.removeItem("retail_dashboard_transactions");
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setSearchTerm("");
      setSelectedDept(Department.ALL);
    }
  };

  // Quick Currency Formatter
  const formatCur = (v: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(v);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* HEADER BAR */}
      <header id="app-main-navigation-header" className="sticky top-0 bg-white border-b border-slate-100 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <StoreFrontierLogo size={32} />
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block ml-2"></div>
            <p className="text-[10px] text-indigo-600/80 font-bold uppercase tracking-widest hidden md:flex items-center gap-1">
              <span>Retail Inventory & KPIs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </p>
          </div>

          {/* Quick Config Row */}
          <div className="flex items-center gap-3">
            <button
              id="global-reset-seed-btn"
              onClick={handleResetAppDefaults}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg py-2 px-3 transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              title="Reset Simulated Daily Logs"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Reset Seed Data</span>
            </button>
            <button
              id="top-record-sale-trigger"
              onClick={() => setIsRecordSaleOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-600/10 active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Register Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* REGISTRATION PANEL OVERLAYS */}
      {/* 1. Modal: Register Sale transaction */}
      {isRecordSaleOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div 
            id="register-sale-modal"
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col relative animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h4 className="text-base font-extrabold text-slate-900">Register Customer Sale</h4>
              </div>
              <button 
                onClick={() => setIsRecordSaleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSaleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pick Product Sold</label>
                <select
                  value={saleProductId}
                  onChange={(e) => setSaleProductId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stockAmount === 0}>
                      {p.name} ({p.sku}) — Stock: {p.stockAmount} units | Price: {formatCur(p.price)}
                    </option>
                  ))}
                </select>
                {selectedProductForSale && (
                  <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>Category: <strong>{selectedProductForSale.category}</strong></span>
                    <span>Cost basis: <strong>{formatCur(selectedProductForSale.cost)}</strong></span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Quantity Sold units</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedProductForSale ? selectedProductForSale.stockAmount : 99}
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-800 font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                  <div className="text-right whitespace-nowrap px-1">
                    <span className="text-[10px] block text-slate-400 uppercase tracking-widest leading-none">Est Price</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {selectedProductForSale ? formatCur(selectedProductForSale.price * saleQuantity) : "₹0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {saleError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saleError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecordSaleOpen(false)}
                  className="flex-1 py-3 text-slate-500 bg-slate-50 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={products.length === 0}
                  className="flex-[2] py-3 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Confirm Customer Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: New Product Register */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div 
            id="register-new-product-modal"
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-700" />
                <h4 className="text-base font-extrabold text-slate-900">Add New Retail Product</h4>
              </div>
              <button 
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Classic Canvas Backpack"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="APP-BP-09"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as Department)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value={Department.APPAREL}>{Department.APPAREL}</option>
                    <option value={Department.ELECTRONICS}>{Department.ELECTRONICS}</option>
                    <option value={Department.HOME}>{Department.HOME}</option>
                    <option value={Department.GROCERIES}>{Department.GROCERIES}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Buying Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Low Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdMin}
                    onChange={(e) => setNewProdMin(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {prodError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5 border border-red-100 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{prodError}</span>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-3 text-slate-500 bg-slate-50 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Save to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETAIL MAIN CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-1 flex flex-col">
        {/* CONTROL DEPT STRIP & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Department Filter Segments with dynamic icons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 overflow-x-auto w-full md:w-auto scrollbar-none shadow-xs">
            {Object.values(Department).map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  selectedDept === dept 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {dept === Department.ALL && <Layers className="w-3.5 h-3.5" />}
                {dept === Department.APPAREL && <ShoppingBag className="w-3.5 h-3.5" />}
                {dept === Department.ELECTRONICS && <Activity className="w-3.5 h-3.5" />}
                {dept === Department.HOME && <Package className="w-3.5 h-3.5" />}
                {dept === Department.GROCERIES && <FileSpreadsheet className="w-3.5 h-3.5" />}
                <span>{dept}</span>
              </button>
            ))}
          </div>

          {/* Tab Navigation selectors */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>KPI Summary</span>
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Inventory ({filteredProducts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("ledger")}
              className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ledger"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Log Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab("powerbi")}
              className={`flex-1 md:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "powerbi"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs shadow-amber-500/10"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Power BI Integration</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <KPICards 
          stats={kpis} 
          products={relevantProducts}
          onCreateSaleClick={() => setIsRecordSaleOpen(true)}
          onRestockLowClick={handleRestockAllLowStock}
        />

        {/* INTERACTIVE PANEL TABS CONTENT */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
              {/* Hourly Live Tracker */}
              <HourlySalesChart data={HOURLY_SALES_CURVE} />

              {/* Leaderboard blocks: Fast Moving vs Low Performing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Fast-Moving Leaderboard */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Fast-Moving Items Velocity</h4>
                      <p className="text-[10px] text-slate-400">Products with top daily units count shipped</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fastMovingProducts.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No transactions registered today.
                      </div>
                    ) : (
                      fastMovingProducts.map((p, idx) => (
                        <div key={p.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-50 font-mono text-[10px] font-bold text-slate-500 flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate" title={p.name}>{p.name}</p>
                              <span className="text-[10px] text-slate-400 font-medium">{p.category} • SKU: {p.sku}</span>
                            </div>
                          </div>
                          
                          <div className="text-right whitespace-nowrap ml-2">
                            <span className="font-bold text-slate-900 block">{p.salesCount} sold</span>
                            <span className="text-[10px] font-bold text-emerald-600">+{formatCur(p.salesRevenue)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Low-Performing Leaderboard */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Low Performing / Stock Tied</h4>
                      <p className="text-[10px] text-slate-400">Capital tied down in warehouse with low turnover</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {lowPerformingProducts.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center text-xs pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-rose-50 font-mono text-[10px] font-bold text-rose-800 flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate" title={p.name}>{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium">Stock: {p.stockAmount} units</span>
                          </div>
                        </div>
                        
                        <div className="text-right whitespace-nowrap ml-2">
                          <span className="font-bold text-red-600/90 block"> {p.salesCount} units sold</span>
                          <span className="text-[10px] text-slate-400">
                            Hold value: <strong>{formatCur(p.stockAmount * p.cost)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        {activeTab === "inventory" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {/* SEARCH AND FILTERING PANEL ROW */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by title name or SKU identifier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="open-add-product-btn"
                  onClick={() => setIsAddProductOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* PRODUCT INDEX TABLE */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                    <th className="py-3.5 px-6">Product Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Cost</th>
                    <th className="py-3.5 px-4 text-right">Price</th>
                    <th className="py-3.5 px-4 text-right">Markup Marg.</th>
                    <th className="py-3.5 px-4 text-center">Stock Amount</th>
                    <th className="py-3.5 px-4 text-right">Units Shipped</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium bg-white">
                        No articles match the current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const isLowStock = p.stockAmount > 0 && p.stockAmount <= p.stockMinThreshold;
                      const isOutOfStock = p.stockAmount === 0;
                      const markupPct = ((p.price - p.cost) / p.price) * 100;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                              <span className="font-mono text-[10px] text-slate-400 font-semibold">{p.sku}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-semibold">{p.category}</td>
                          <td className="py-4 px-4 text-right font-mono font-medium text-slate-600">{formatCur(p.cost)}</td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">{formatCur(p.price)}</td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-bold text-emerald-600">
                              {markupPct.toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                                isOutOfStock 
                                  ? "bg-red-50 text-red-700 border border-red-100 font-extrabold" 
                                  : isLowStock 
                                    ? "bg-amber-50 text-amber-700 border border-amber-100 font-bold" 
                                    : "bg-slate-50 text-slate-800"
                              }`}>
                                {p.stockAmount} units
                              </span>
                              
                              {/* Warning notifications */}
                              {isOutOfStock ? (
                                <span className="text-[9px] text-red-500 font-extrabold mt-1">Out of Stock</span>
                              ) : isLowStock ? (
                                <span className="text-[9px] text-amber-600 font-bold mt-1">Low (Threshold: {p.stockMinThreshold})</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                            {p.salesCount} sold
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRestockProduct(p.id, 25)}
                                className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-lg active:scale-95 transition-all cursor-pointer"
                              >
                                +25 Stock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE SUMMARY LINE */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-500 flex justify-between items-center">
              <span>Selected Department: {selectedDept}</span>
              <span className="text-slate-600">Displaying {filteredProducts.length} of {products.length} products listed</span>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="text-indigo-600 w-5 h-5" />
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Today's Transactions log</h4>
                  <p className="text-[10px] text-slate-400">Stream of generated customer receipts and margin accruals</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-bold">
                Total transactions today: <span className="font-mono text-slate-900">{filteredTransactions.length}</span>
              </div>
            </div>

            {/* TRANSACTIONS STREAM list */}
            <div className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No registered receipts in ledger currently. Record a sale to start.
                </div>
              ) : (
                filteredTransactions.map(t => (
                  <div key={t.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl mt-1">
                        <ShoppingBag className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        {/* Transaction title info */}
                        <p className="font-extrabold text-slate-950 text-sm">
                          Receipt: <span className="font-mono font-bold text-indigo-600">{t.id}</span>
                        </p>
                        <p className="font-bold text-slate-800 mt-0.5">{t.productName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex gap-2">
                          <span>Qty: <strong>{t.quantity}</strong></span>
                          <span>Category: <strong>{t.category}</strong></span>
                          <span>Time: <strong>{t.timestamp}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Financial split right block */}
                    <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400">Total revenue</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCur(t.totalPrice)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400">Inventory Cost</span>
                        <span className="font-mono text-slate-500 font-semibold block">
                          {formatCur(t.totalCost)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] block text-slate-400">Profit Margin</span>
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">
                          +{formatCur(t.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-500 text-right">
              All financial transactions computed live based on client-side state
            </div>
          </div>
        )}

        {activeTab === "powerbi" && (
          <PowerBIEmbed products={products} transactions={transactions} />
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <StoreFrontierLogo size={22} showTagline={false} />
            <span className="text-slate-400 text-xs">— KPI Dashboard Strategy Toolkit</span>
          </div>
          <div className="flex gap-4">
            <span className="font-mono text-slate-500">v1.1.0 (TypeScript + Express)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-500">UTC: 2026-06-11</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
