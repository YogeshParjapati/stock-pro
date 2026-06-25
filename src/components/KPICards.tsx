import React from "react";
import { 
  TrendingUp, 
  IndianRupee, 
  Percent, 
  Package, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck,
  Plus
} from "lucide-react";
import { KPIStats, Product } from "../types";

interface KPICardsProps {
  stats: KPIStats;
  products: Product[];
  onCreateSaleClick: () => void;
  onRestockLowClick: () => void;
}

export default function KPICards(props: KPICardsProps) {
  const { stats, products, onCreateSaleClick, onRestockLowClick } = props;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* CARD 1: DAILY SALES REVENUE */}
      <div 
        id="kpi-sales-revenue-card"
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-300 transition-all duration-200 group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors duration-200 animate-pulse">
            <IndianRupee className="w-6 h-6" />
          </div>
          <button
            id="register-sale-quick-btn"
            onClick={onCreateSaleClick}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:scale-95 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </button>
        </div>
        
        <p className="text-sm font-medium text-slate-500 mb-1">Daily Sales Revenue</p>
        <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
          {formatCurrency(stats.revenue)}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="flex items-center gap-0.5 font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            +14.2%
          </span>
          <span className="text-slate-400">vs. yesterday avg</span>
        </div>
      </div>

      {/* CARD 2: PROFIT MARGIN */}
      <div 
        id="kpi-profit-margin-card"
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-300 transition-all duration-200 group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors duration-200">
            <Percent className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Net Profit</div>
            <div className="text-sm font-bold text-indigo-600">{formatCurrency(stats.profit)}</div>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mb-1">Average Profit Margin</p>
        <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
          {stats.margin.toFixed(1)}%
        </h3>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="flex items-center gap-0.5 font-bold text-indigo-600">
            <ArrowUpRight className="w-3 h-3" />
            +2.1%
          </span>
          <span className="text-slate-400">optimized pricing</span>
        </div>
      </div>

      {/* CARD 3: STOCK AVAILABILITY / FILL RATE */}
      <div 
        id="kpi-stock-availability-card"
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-300 transition-all duration-200 group"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-100 transition-colors duration-200">
            <Package className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              stats.inStockRate > 95 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              <ShieldCheck className="w-3 h-3" />
              {stats.inStockRate > 95 ? "Excellent" : "Needs stock"}
            </span>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mb-1">In-Stock Fill Rate</p>
        <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
          {stats.inStockRate.toFixed(1)}%
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-cyan-600">{stats.outOfStockCount} items</span>
          <span>out-of-stock globally</span>
        </div>
      </div>

      {/* CARD 4: STOCKED ALERT MODULE */}
      <div 
        id="kpi-low-stock-warnings-card"
        className={`rounded-2xl p-6 shadow-sm border transition-all duration-200 group ${
          stats.lowStockCount > 0 
            ? "bg-amber-50/70 border-amber-200 hover:border-amber-400" 
            : "bg-white border-slate-100 hover:border-slate-300"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl transition-colors duration-200 ${
            stats.lowStockCount > 0 
              ? "bg-amber-100 text-amber-700 animate-bounce" 
              : "bg-slate-50 text-slate-500"
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          {stats.lowStockCount > 0 && (
            <button
              id="restock-action-quick-btn"
              onClick={onRestockLowClick}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-200 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            >
              <span>Restock all</span>
            </button>
          )}
        </div>

        <p className="text-sm font-medium text-slate-500 mb-1">Low In-Stock Alerts</p>
        <h3 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">
          {stats.lowStockCount} <span className="text-sm font-medium text-slate-500">products</span>
        </h3>

        <div className="flex items-center gap-1.5 text-xs">
          {stats.lowStockCount > 0 ? (
            <>
              <span className="font-bold text-amber-800">Action recommended:</span>
              <span className="text-slate-600">restock running out</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-emerald-600">All Healthy</span>
              <span className="text-slate-400">all products above minima</span>
            </>
          )}
        </div>

        {products && products.filter(p => p.stockAmount <= p.stockMinThreshold).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Items below threshold:</span>
            {products
              .filter(p => p.stockAmount <= p.stockMinThreshold)
              .map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs bg-amber-50/50 p-2 rounded-lg border border-amber-100/30">
                  <div className="truncate pr-2">
                    <p className="font-bold text-amber-950 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">SKU: {p.sku} • {p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      p.stockAmount === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                    }`}>
                      {p.stockAmount} / {p.stockMinThreshold}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
