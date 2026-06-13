import React, { useState, useRef, useEffect } from "react";
import { HourlyDataPoint } from "../mockData";

interface HourlySalesChartProps {
  data: HourlyDataPoint[];
}

export default function HourlySalesChart(props: HourlySalesChartProps) {
  const { data } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 260 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 280),
        height: 240
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const padding = { top: 20, right: 20, bottom: 30, left: 55 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxSales = Math.max(...data.map((d) => d.sales), 500);
  const yMax = Math.ceil(maxSales / 200) * 200;

  const getCoords = (item: HourlyDataPoint, index: number) => {
    // Avoid division by zero
    const xFraction = data.length > 1 ? index / (data.length - 1) : 0;
    const x = padding.left + xFraction * chartWidth;
    const ySales = padding.top + chartHeight - (item.sales / yMax) * chartHeight;
    const yProfit = padding.top + chartHeight - (item.profit / yMax) * chartHeight;
    return { x, ySales, yProfit };
  };

  const coords = data.map((item, idx) => getCoords(item, idx));

  const salesLinePath = coords.length > 0 
    ? `M ${coords[0].x} ${coords[0].ySales} ` + coords.slice(1).map((c) => `L ${c.x} ${c.ySales}`).join(" ")
    : "";

  const salesAreaPath = coords.length > 0 && chartWidth > 0
    ? `${salesLinePath} L ${coords[coords.length - 1].x} ${padding.top + chartHeight} L ${coords[0].x} ${padding.top + chartHeight} Z`
    : "";

  const profitLinePath = coords.length > 0 
    ? `M ${coords[0].x} ${coords[0].yProfit} ` + coords.slice(1).map((c) => `L ${c.x} ${c.yProfit}`).join(" ")
    : "";

  const profitAreaPath = coords.length > 0 && chartWidth > 0
    ? `${profitLinePath} L ${coords[coords.length - 1].x} ${padding.top + chartHeight} L ${coords[0].x} ${padding.top + chartHeight} Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || chartWidth <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - padding.left;
    
    // Find closest index
    const percent = mouseX / chartWidth;
    let index = Math.round(percent * (data.length - 1));
    index = Math.max(0, Math.min(data.length - 1, index));
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">Intraday Sales & Margin Tracker</h4>
          <p className="text-xs text-slate-500">Hourly revenue performance vs. bottom-line profit margin accrual</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span>
            <span className="text-slate-600">Hourly Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">Profit Margin ($)</span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full relative overflow-visible"
        style={{ height: `${height}px` }}
      >
        <svg
          width={width}
          height={height}
          className="overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((g, i) => {
            const y = padding.top + chartHeight - g * chartHeight;
            const labelValue = g * yMax;
            return (
              <g key={i} className="opacity-40">
                <line
                  className="stroke-slate-200"
                  style={{ strokeDasharray: "4 4" }}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  className="fill-slate-400 font-mono text-[9px]"
                  textAnchor="end"
                >
                  {formatCurrency(labelValue)}
                </text>
              </g>
            );
          })}

          {/* X Axis label coordinates */}
          {data.map((item, idx) => {
            if (idx % 2 !== 0 && idx !== data.length - 1) return null;
            const x = padding.left + (idx / (data.length - 1)) * chartWidth;
            return (
              <text
                key={idx}
                x={x}
                y={height - 10}
                className="fill-slate-400 font-mono text-[9px]"
                textAnchor="middle"
              >
                {item.hour.replace(":00", "")}
              </text>
            );
          })}

          {/* Paths under charts */}
          {salesAreaPath && <path d={salesAreaPath} fill="url(#salesGrad)" />}
          {profitAreaPath && <path d={profitAreaPath} fill="url(#profitGrad)" />}

          {/* Line plots */}
          {salesLinePath && (
            <path
              d={salesLinePath}
              fill="none"
              className="stroke-indigo-500"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {profitLinePath && (
            <path
              d={profitLinePath}
              fill="none"
              className="stroke-emerald-500"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active hover crosshair and highlights */}
          {activeIndex !== null && coords[activeIndex] && (
            <g>
              <line
                className="stroke-slate-300"
                style={{ strokeDasharray: "2 2" }}
                x1={coords[activeIndex].x}
                y1={padding.top}
                x2={coords[activeIndex].x}
                y2={padding.top + chartHeight}
                strokeWidth="1.5"
              />

              <circle
                cx={coords[activeIndex].x}
                cy={coords[activeIndex].ySales}
                r="5"
                className="fill-indigo-600 stroke-white"
                strokeWidth="2"
              />

              <circle
                cx={coords[activeIndex].x}
                cy={coords[activeIndex].yProfit}
                r="5"
                className="fill-emerald-600 stroke-white"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating tooltip html box */}
        {activeIndex !== null && data[activeIndex] && coords[activeIndex] && (
          <div
            className="absolute bg-slate-950 text-white rounded-xl p-3 shadow-lg text-left pointer-events-none z-10 text-xs flex flex-col gap-1 border border-slate-800 backdrop-blur-md"
            style={{
              left: `${Math.min(coords[activeIndex].x - 70, width - 150)}px`,
              top: `${Math.max(coords[activeIndex].ySales - 95, 10)}px`,
              width: "140px"
            }}
          >
            <div className="font-bold text-slate-300 pb-1 border-b border-slate-800">
              {data[activeIndex].hour}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-400 font-medium">Sales:</span>
              <span className="font-mono font-bold text-indigo-300">
                {formatCurrency(data[activeIndex].sales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Net Profit:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(data[activeIndex].profit)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] pt-1 mt-1 border-t border-slate-900">
              <span className="text-slate-500 uppercase tracking-widest text-[8px] font-bold">Margin %:</span>
              <span className="text-slate-300 font-bold">
                {data[activeIndex].sales > 0 ? ((data[activeIndex].profit / data[activeIndex].sales) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
