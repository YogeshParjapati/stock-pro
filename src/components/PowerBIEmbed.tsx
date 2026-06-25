import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  Settings, 
  Info, 
  Copy, 
  Check, 
  ExternalLink, 
  FileDown, 
  Grid3X3, 
  SlidersHorizontal,
  RefreshCw,
  Database,
  ArrowRight,
  TrendingUp,
  Layout,
  Flame,
  LineChart,
  HelpCircle
} from "lucide-react";
import { Product, SaleTransaction } from "../types";

interface PowerBIEmbedProps {
  products: Product[];
  transactions: SaleTransaction[];
}

export default function PowerBIEmbed({ products, transactions }: PowerBIEmbedProps) {
  // Custom Embed URL config saved in state & localStorage
  const [embedUrl, setEmbedUrl] = useState<string>(() => {
    return localStorage.getItem("merch_metrics_pbi_embed") || "";
  });
  const [tempUrl, setTempUrl] = useState(embedUrl);
  const [isUrlApplied, setIsUrlApplied] = useState(!!embedUrl);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Active page selector inside the Power BI Mock Canvas
  const [pbiActivePage, setPbiActivePage] = useState<"summary" | "profitability" | "data-feed">("summary");

  // Power BI Filter variables for our interactive emulator
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [minStockFilter, setMinStockFilter] = useState<number>(0);

  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Filter products based on selected Power BI mock slicers
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategoryFilter === "All" || p.category === selectedCategoryFilter;
      const matchStock = p.stockAmount >= minStockFilter;
      return matchCat && matchStock;
    });
  }, [products, selectedCategoryFilter, minStockFilter]);

  // Handle Embed URL submission
  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitised = tempUrl.trim();
    localStorage.setItem("merch_metrics_pbi_embed", sanitised);
    setEmbedUrl(sanitised);
    setIsUrlApplied(!!sanitised);
  };

  const handleClearUrl = () => {
    localStorage.removeItem("merch_metrics_pbi_embed");
    setEmbedUrl("");
    setTempUrl("");
    setIsUrlApplied(false);
  };

  // Copy Data for Power BI Web/CSV Connector
  const handleCopyData = (format: "csv" | "json") => {
    let content = "";
    if (format === "csv") {
      const headers = ["ID", "Name", "SKU", "Category", "Cost", "Price", "StockAmount", "SalesCount", "SalesRevenue"].join(",");
      const rows = products.map(p => 
        `"${p.id}","${p.name.replace(/"/g, '""')}","${p.sku}","${p.category}",${p.cost},${p.price},${p.stockAmount},${p.salesCount},${p.salesRevenue}`
      );
      content = [headers, ...rows].join("\n");
    } else {
      content = JSON.stringify(products, null, 2);
    }

    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(format);
      setTimeout(() => setIsCopied(null), 2000);
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  // High-performance dynamic stats for visual dashboard
  const stats = useMemo(() => {
    let totalRev = 0;
    let totalCost = 0;
    let totalStockValue = 0;
    let unitsSold = 0;

    filteredProducts.forEach(p => {
      totalRev += p.salesRevenue;
      totalCost += p.salesCount * p.cost;
      totalStockValue += p.stockAmount * p.cost;
      unitsSold += p.salesCount;
    });

    const netProfit = totalRev - totalCost;
    const grossMargin = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;

    return {
      totalRev,
      netProfit,
      totalStockValue,
      unitsSold,
      grossMargin
    };
  }, [filteredProducts]);

  return (
    <div id="powerbi-tab-wrapper" className="space-y-6">
      
      {/* EXPLANATORY INFORMATION CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="bg-amber-100 text-amber-800 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Power BI Dashboard Synergy
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Connect Live Retail Data to Microsoft Power BI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Maximize your corporate strategy reports by visualizing Store Frontier's daily sales logs. Use our built-in interactive Power BI emulator to preview executive visualizations, import local live JSON/CSV feeds into <strong>Power BI Desktop</strong>, or embed your live enterprise report directly.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href="https://powerbi.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 py-2.5 px-4 rounded-xl shadow-xs flex items-center gap-1.5 transition-all text-center"
          >
            <span>Learn Power BI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: POWER BI EMBED CONTROLS & DATA GATEWAY FEED */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* CONTROL BOX: CONFIGURE EMBED URL */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-50">
              <Settings className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-extrabold">Publishing Embed Link</h4>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paste Embed URL / Iframe Link</label>
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://app.powerbi.com/view?r=..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono bg-slate-50/50"
                />
              </div>

              <div className="flex gap-2">
                {isUrlApplied && (
                  <button
                    type="button"
                    onClick={handleClearUrl}
                    className="flex-1 py-2 text-slate-500 hover:text-slate-900 font-bold rounded-lg text-xs transition-colors bg-slate-100 active:scale-95 cursor-pointer"
                  >
                    Clear Custom
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 py-2 text-white bg-slate-900 hover:bg-slate-800 font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Apply Report</span>
                </button>
              </div>
            </form>

            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 space-y-1 text-[11px] text-amber-900 leading-relaxed font-medium">
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Info className="w-3.5 h-3.5 text-amber-500" />
                <span>How to embed real reports:</span>
              </div>
              <ol className="list-decimal pl-3.5 space-y-1 text-slate-600 font-semibold text-[10px]">
                <li>Open your report on Power BI Service.</li>
                <li>Go to <span className="text-slate-800">File &gt; Embed report &gt; Publish to web</span>.</li>
                <li>Copy the HTTPS Link or embed iframe and paste it above!</li>
              </ol>
            </div>
          </div>

          {/* POWER BI DESKTOP DATA FEED EXTRACTOR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-3 border-b border-slate-50">
              <Database className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-extrabold">Data Gateway Extracts</h4>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Power BI Desktop relies on accurate data sources. Feed your active store logs directly into your custom Power BI models:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopyData("csv")}
                className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 outline-hidden relative cursor-pointer"
              >
                {isCopied === "csv" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy CSV Feed</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopyData("json")}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 outline-hidden relative cursor-pointer"
              >
                {isCopied === "json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Copy JSON Feed</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-[10px] text-slate-600 font-semibold leading-relaxed">
              <p className="font-bold text-slate-800 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-indigo-500" />
                <span>Importing to Power Query:</span>
              </p>
              <p className="text-[9.5px]">
                Click "Get Data from Web" or "Blank Query" in Power BI Desktop &gt; paste copied source into Power Query Editor. Real-time updates sync instantly on model refresh.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CORRESPONDING LIVE REPORT WINDOW */}
        <div className="xl:col-span-3">
          
          {isUrlApplied && embedUrl ? (
            /* RENDER REAL POWER BI LIVE IFRAME */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col h-[650px]">
              <div className="bg-slate-900 px-5 py-3.5 flex justify-between items-center text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-xs tracking-tight">Active Real-Time Power BI Feed Channel</span>
                </div>
                <button
                  onClick={handleClearUrl}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white px-2.5 py-1 text-[10px] font-extrabold rounded-lg tracking-wider transition-all cursor-pointer"
                >
                  Switch to Emulator Visuals
                </button>
              </div>
              <div className="flex-1 w-full relative bg-slate-950">
                <iframe
                  title="Power BI Embedded Report"
                  src={embedUrl.startsWith("<iframe") ? (embedUrl.match(/src="([^"]+)"/)?.[1] || embedUrl) : embedUrl}
                  className="w-full h-full border-0 rounded-b-2xl object-cover"
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ) : (
            /* RENDERING HIGH-FIDELITY INTERACTIVE POWER BI EMULATOR */
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-auto min-h-[650px] relative">
              
              {/* VIRTUAL POWER BI HEADER PANEL */}
              <div className="bg-[#181818] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg font-black text-xs shadow-md shadow-amber-500/10 flex items-center justify-center">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Store Frontier</span>
                      <span className="bg-amber-500/20 text-amber-400 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-amber-500/20">Power BI Desktop Server</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Analytical Canvas Pro — Powered by local store transactional dataset</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                    <span>DirectQuery Mode</span>
                  </span>
                </div>
              </div>

              {/* LIVE REPORT CONTROL RIBBON (TABS & SLICERS) */}
              <div className="bg-[#202020] px-6 py-3 border-b border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                
                {/* Visual Pages selector inside Power BI simulator */}
                <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-slate-800/80">
                  <button
                    onClick={() => setPbiActivePage("summary")}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                      pbiActivePage === "summary"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Executive Summary
                  </button>
                  <button
                    onClick={() => setPbiActivePage("profitability")}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                      pbiActivePage === "profitability"
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Marginal Profit Matrix
                  </button>
                  <button
                    onClick={() => setPbiActivePage("data-feed")}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                      pbiActivePage === "data-feed"
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Query Data Feed
                  </button>
                </div>

                {/* Slicers block */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">Slicer: Category</span>
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-white rounded-lg py-1 px-2.5 font-bold focus:outline-hidden text-[11px]"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider">Min Stock ({minStockFilter})</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minStockFilter}
                      onChange={(e) => setMinStockFilter(parseInt(e.target.value) || 0)}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* REPORT GRAPHIC RENDERING CANVAS */}
              <div className="p-6 flex-1 bg-[#1a1a1a] text-slate-350 min-h-[500px]">

                {/* PAGE 1: EXECUTIVE SUMMARY */}
                {pbiActivePage === "summary" && (
                  <div className="space-y-6">
                    
                    {/* Visual cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <div className="bg-[#242424] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <h4 className="text-xl font-extrabold text-white">{formatCurrency(stats.totalRev)}</h4>
                          <span className="text-[9px] text-emerald-400 font-bold">+12%</span>
                        </div>
                      </div>

                      <div className="bg-[#242424] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Direct Profit Accrued</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <h4 className="text-xl font-extrabold text-white">{formatCurrency(stats.netProfit)}</h4>
                          <span className="text-[9px] text-amber-400 font-bold">{stats.grossMargin.toFixed(1)}% margins</span>
                        </div>
                      </div>

                      <div className="bg-[#242424] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sourcing Capital Asset</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <h4 className="text-xl font-extrabold text-white">{formatCurrency(stats.totalStockValue)}</h4>
                          <span className="text-[9px] text-slate-400">Total holding tied</span>
                        </div>
                      </div>

                      <div className="bg-[#242424] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Product Scope Shipped</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <h4 className="text-xl font-extrabold text-white">{stats.unitsSold} <span className="text-xs text-slate-500 font-medium">units</span></h4>
                          <span className="text-[9px] text-amber-500 font-semibold">{filteredProducts.length} items filters</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart visualizations block */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      
                      {/* Power BI clustered bar chart styled */}
                      <div className="lg:col-span-3 bg-[#242424] p-5 rounded-2xl border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-[11px] font-bold text-slate-300">Sales Value (₹) & Velocity By Sku Code</span>
                            <p className="text-[9px] text-slate-500">Live analytics sourced from data feed parameters</p>
                          </div>
                          
                          <span className="text-[9.5px] text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/10">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Leaderboards Slices
                          </span>
                        </div>

                        {/* Custom SVG Bar Chart */}
                        <div className="space-y-3.5 pt-2">
                          {filteredProducts.slice(0, 5).map(p => {
                            const maxVal = Math.max(...products.map(pr => pr.salesRevenue), 1);
                            const percent = (p.salesRevenue / maxVal) * 100;
                            return (
                              <div key={p.id} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-medium text-slate-300">
                                  <span className="truncate max-w-[170px] font-semibold">{p.name} <span className="text-slate-500 font-mono text-[9px]">({p.sku})</span></span>
                                  <span className="font-mono text-[10px] text-white font-bold">{formatCurrency(p.salesRevenue)} ({p.salesCount} sold)</span>
                                </div>
                                <div className="w-full bg-[#181818] h-3 rounded-full overflow-hidden flex">
                                  <div 
                                    className="bg-amber-500 rounded-full h-full" 
                                    style={{ width: `${Math.max(percent, 4)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                          {filteredProducts.length === 0 && (
                            <div className="py-12 text-center text-xs text-slate-500">
                              No products match the selected category or stock limits.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stacked Share / Breakdown donut style */}
                      <div className="lg:col-span-2 bg-[#242424] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-300">Share Of Total Assets Under Inventory</span>
                          <p className="text-[9px] text-slate-500">Breakdown percent based on direct product units in stock</p>
                        </div>

                        {/* Pie Chart Representation */}
                        <div className="flex justify-center items-center py-4">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Inner circle mask */}
                            <div className="absolute w-16 h-16 rounded-full bg-[#242424] border border-slate-800 z-10 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-slate-400">Total Stock</span>
                              <span className="text-xs font-extrabold text-white font-mono">
                                {filteredProducts.reduce((sum, p) => sum + p.stockAmount, 0)} Pcs
                              </span>
                            </div>

                            {/* Beautiful SVG dynamic circles overlay representing proportion */}
                            <svg className="w-28 h-28 transform -rotate-90">
                              <circle cx="56" cy="56" r="46" fill="transparent" stroke="#2a2a2a" strokeWidth="11" />
                              <circle 
                                cx="56" cy="56" r="46" fill="transparent" 
                                stroke="#f59e0b" strokeWidth="12" 
                                strokeDasharray={`${2 * Math.PI * 46}`}
                                strokeDashoffset={`${2 * Math.PI * 46 * 0.35}`}
                                strokeLinecap="round"
                              />
                              <circle 
                                cx="56" cy="56" r="46" fill="transparent" 
                                stroke="#8b5cf6" strokeWidth="12" 
                                strokeDasharray={`${2 * Math.PI * 46}`}
                                strokeDashoffset={`${2 * Math.PI * 46 * 0.7}`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-1.5 text-[10.5px]">
                          <div className="flex justify-between items-center bg-[#1a1a1a] p-1.5 px-2 rounded-lg border border-slate-800/80">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span>Target Category</span>
                            </span>
                            <span className="font-mono text-white font-bold">
                              {selectedCategoryFilter}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-[#1a1a1a] p-1.5 px-2 rounded-lg border border-slate-800/80">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
                              <span>Remaining Stock items</span>
                            </span>
                            <span className="font-mono text-white font-semibold">
                              {filteredProducts.filter(p => p.stockAmount > 0).length} items
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* PAGE 2: PROFITABILITY MATRIX */}
                {pbiActivePage === "profitability" && (
                  <div className="space-y-6">
                    
                    {/* Intro */}
                    <div className="bg-[#242424] p-4 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-slate-200">Gross Sourcing Costs vs Retail Margins Scatter Plot Matrix</span>
                      <p className="text-[9.5px] text-slate-500 mt-0.5">Determine gross pricing leakage coordinates instantly. Upper right zone represents premium high markups.</p>
                    </div>

                    {/* Chart View */}
                    <div className="bg-[#242424] p-5 rounded-2xl border border-slate-800 space-y-4">
                      
                      {/* Interactive Visual Graph Grid layout */}
                      <div className="relative h-64 border-l-2 border-b-2 border-slate-700/60 pb-2 pl-2">
                        {/* Grids background */}
                        <div className="absolute inset-0 grid grid-rows-4 divide-y divide-slate-800/60 pointer-events-none">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>

                        {/* Elements Plotting */}
                        {filteredProducts.map((p, idx) => {
                          const maxCost = Math.max(...products.map(pr => pr.cost), 100);
                          const maxPrice = Math.max(...products.map(pr => pr.price), 200);
                          const xPercent = (p.cost / maxCost) * 90;
                          const yPercent = (p.price / maxPrice) * 85;

                          return (
                            <div
                              key={p.id}
                              className="absolute w-5 h-5 group"
                              style={{
                                left: `${5 + xPercent}%`,
                                bottom: `${5 + yPercent}%`
                              }}
                            >
                              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-400 border border-slate-900 group-hover:scale-125 transition-transform duration-100 flex items-center justify-center cursor-help">
                                <span className="text-[8px] font-black text-slate-950 font-mono">{idx + 1}</span>
                              </div>

                              {/* Bubble tooltip box */}
                              <div className="absolute opacity-0 group-hover:opacity-100 bg-[#161616] text-white border border-slate-800 p-2.5 rounded-xl text-[10.5px] w-48 shadow-xl -top-24 left-6 pointer-events-none transition-opacity duration-150 z-20 space-y-1">
                                <p className="font-bold text-amber-400">{p.name}</p>
                                <div className="flex justify-between font-mono font-bold">
                                  <span>Buying Cost:</span>
                                  <span>{formatCurrency(p.cost)}</span>
                                </div>
                                <div className="flex justify-between font-mono font-bold">
                                  <span>Retail Price:</span>
                                  <span className="text-emerald-400">{formatCurrency(p.price)}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-800 pt-1 text-[9px] font-bold">
                                  <span>Profit Markup:</span>
                                  <span className="text-amber-500 font-extrabold">{(((p.price - p.cost) / p.price) * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty results check */}
                        {filteredProducts.length === 0 && (
                          <div className="h-full flex items-center justify-center text-xs text-slate-500">
                            No dynamic products to plot. Alter slices configured on ribbon.
                          </div>
                        )}
                      </div>

                      {/* Graph legend labels */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold px-2 pt-1 uppercase">
                        <span>Low Sourcing Cost Basis</span>
                        <span>High Sourcing Cost Basis (X-Axis)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 3: QUERY DATA FEED */}
                {pbiActivePage === "data-feed" && (
                  <div className="space-y-4">
                    
                    <div className="flex justify-between items-center text-slate-200">
                      <div>
                        <span className="text-[11px] font-bold">Raw Table Direct Query Feed</span>
                        <p className="text-[9.5px] text-slate-500">Relational data rows formatted for real-time model transformation bindings</p>
                      </div>

                      <button
                        onClick={() => handleCopyData("csv")}
                        className="bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 py-1 px-2.5 text-[10.1px] font-extrabold tracking-tight rounded-md duration-150 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy CSV Dataset</span>
                      </button>
                    </div>

                    {/* Table display */}
                    <div className="bg-[#242424] rounded-xl border border-slate-800 overflow-hidden text-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-[#2a2a2a] text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                              <th className="p-3">SKU</th>
                              <th className="p-3">Product Name</th>
                              <th className="p-3 text-right">Cost</th>
                              <th className="p-3 text-right">Price</th>
                              <th className="p-3 text-center font-bold text-amber-400">Stock</th>
                              <th className="p-3 text-right">Revenue Shipped</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300 font-semibold">
                            {filteredProducts.slice(0, 8).map(p => (
                              <tr key={p.id} className="hover:bg-slate-800/40">
                                <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">{p.sku}</td>
                                <td className="p-3 font-bold text-white max-w-[200px] truncate" title={p.name}>{p.name}</td>
                                <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(p.cost)}</td>
                                <td className="p-3 text-right font-mono text-emerald-400">{formatCurrency(p.price)}</td>
                                <td className="p-3 text-center font-mono font-bold">
                                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                                    p.stockAmount === 0 ? "bg-red-900/40 text-red-300 border border-red-900" : "bg-slate-800 text-slate-300"
                                  }`}>
                                    {p.stockAmount} units
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono text-white font-bold">{formatCurrency(p.salesRevenue)}</td>
                              </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                                  No records found under active categories.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination simulator */}
                      <footer className="bg-[#202020] px-4 py-2 text-[9.5px] font-bold text-slate-500 uppercase flex justify-between tracking-wide border-t border-slate-800">
                        <span>Database Stream: Store_Frontier_Dataset</span>
                        <span>Displaying top {Math.min(filteredProducts.length, 8)} rows of {filteredProducts.length}</span>
                      </footer>
                    </div>
                  </div>
                )}

              </div>

              {/* VIRTUAL STATUS BAR FOOTER */}
              <div className="bg-[#181818] border-t border-slate-800 px-6 py-3 flex text-[10.5px] text-slate-500 justify-between items-center font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-slate-400 font-bold">Query results active & up to date</span>
                </span>
                
                <span className="font-mono text-[9.5px]">Page {pbiActivePage === "summary" ? "1" : pbiActivePage === "profitability" ? "2" : "3"} of 3</span>
              </div>

            </div>
          )
          }

        </div>
      </div>

    </div>
  );
}
