/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Department {
  ALL = "All Departments",
  APPAREL = "Apparel & Fashion",
  ELECTRONICS = "Electronics",
  HOME = "Home & Living",
  GROCERIES = "Groceries",
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Department;
  cost: number;        // Buying price
  price: number;       // Retail price
  stockAmount: number; // Current quantity in stock
  stockMinThreshold: number; // Low stock alert level
  salesCount: number;  // Direct count of daily units sold
  salesRevenue: number;
}

export interface SaleTransaction {
  id: string;
  productId: string;
  productName: string;
  category: Department;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  totalCost: number;
  profit: number;
  timestamp: string; // Time format, e.g., "10:45 AM"
}

export interface KPIStats {
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  inStockRate: number; // percentage of elements with stockAmount > 0
  lowStockCount: number; // elements with stockAmount <= stockMinThreshold and stockAmount > 0
  outOfStockCount: number; // elements with stockAmount === 0
}

export interface AIAnalysisReport {
  healthScore: number;
  summary: string;
  positiveTrends: string[];
  criticalWarnings: string[];
  actionItems: AIActionItem[];
}

export interface AIActionItem {
  type: string; // e.g. "Inventory Restock", "Pricing Adjustment", "Marketing Boost", "Supplier Negotiation"
  target: string;
  action: string;
  impact: string;
  priority: "High" | "Medium" | "Low";
}
