import { Department, Product, SaleTransaction } from "./types";

export interface HourlyDataPoint {
  hour: string;
  sales: number;
  profit: number;
  cost: number;
}

export const INITIAL_PRODUCTS: Product[] = [
  // APPAREL & FASHION
  {
    id: "p1",
    name: "Handwoven Banarasi Silk Saree",
    sku: "APP-BSS-01",
    category: Department.APPAREL,
    cost: 28.50,
    price: 65.00,
    stockAmount: 42,
    stockMinThreshold: 10,
    salesCount: 12,
    salesRevenue: 780.00
  },
  {
    id: "p2",
    name: "Premium Khadi Cotton Kurta",
    sku: "APP-KCK-02",
    category: Department.APPAREL,
    cost: 6.50,
    price: 22.00,
    stockAmount: 110,
    stockMinThreshold: 15,
    salesCount: 45,
    salesRevenue: 990.00
  },
  {
    id: "p3",
    name: "Handcrafted Kolhapuri Chappals",
    sku: "APP-KLC-03",
    category: Department.APPAREL,
    cost: 18.00,
    price: 48.00,
    stockAmount: 35,
    stockMinThreshold: 8,
    salesCount: 8,
    salesRevenue: 384.00
  },
  {
    id: "p4",
    name: "Designer Jodhpuri Sherwani Jacket",
    sku: "APP-JSJ-04",
    category: Department.APPAREL,
    cost: 45.00,
    price: 110.00,
    stockAmount: 3,  // Critical Stock Level!
    stockMinThreshold: 8,
    salesCount: 22,
    salesRevenue: 2420.00
  },
  {
    id: "p5",
    name: "Pashmina Woolen Shawl",
    sku: "APP-PWS-05",
    category: Department.APPAREL,
    cost: 4.20,
    price: 15.00,
    stockAmount: 85,
    stockMinThreshold: 10,
    salesCount: 14,
    salesRevenue: 210.00
  },

  // ELECTRONICS
  {
    id: "p6",
    name: "BoAt Rockerz ANC Earbuds",
    sku: "ELE-BRE-06",
    category: Department.ELECTRONICS,
    cost: 32.00,
    price: 89.00,
    stockAmount: 28,
    stockMinThreshold: 5,
    salesCount: 16,
    salesRevenue: 1424.00
  },
  {
    id: "p7",
    name: "Portronics Wireless Keyboard Duo",
    sku: "ELE-PWK-07",
    category: Department.ELECTRONICS,
    cost: 48.00,
    price: 125.00,
    stockAmount: 14,
    stockMinThreshold: 5,
    salesCount: 5,
    salesRevenue: 625.00
  },
  {
    id: "p8",
    name: "CrystalView Smart LED Projector",
    sku: "ELE-SLP-08",
    category: Department.ELECTRONICS,
    cost: 165.00,
    price: 349.00,
    stockAmount: 6,
    stockMinThreshold: 3,
    salesCount: 4,
    salesRevenue: 1396.00
  },
  {
    id: "p9",
    name: "Syska Fast-Charge 20k Power Bank",
    sku: "ELE-SPB-09",
    category: Department.ELECTRONICS,
    cost: 11.50,
    price: 29.99,
    stockAmount: 0,  // OUT OF STOCK Alert!
    stockMinThreshold: 8,
    salesCount: 32,
    salesRevenue: 959.68
  },
  {
    id: "p10",
    name: "Noise ColorFit Metallic Smartwatch",
    sku: "ELE-NCS-10",
    category: Department.ELECTRONICS,
    cost: 74.00,
    price: 180.00,
    stockAmount: 19,
    stockMinThreshold: 4,
    salesCount: 11,
    salesRevenue: 1980.00
  },

  // HOME & LIVING
  {
    id: "p11",
    name: "Hand-embossed Pure Copper Bottle",
    sku: "HOM-PCB-11",
    category: Department.HOME,
    cost: 95.00,
    price: 240.00,
    stockAmount: 8,
    stockMinThreshold: 3,
    salesCount: 2,
    salesRevenue: 480.00
  },
  {
    id: "p12",
    name: "Mysore Sandalwood Dhoop Cones",
    sku: "HOM-MSD-12",
    category: Department.HOME,
    cost: 8.00,
    price: 24.99,
    stockAmount: 64,
    stockMinThreshold: 10,
    salesCount: 19,
    salesRevenue: 474.81
  },
  {
    id: "p13",
    name: "Jaipuri Hand-Block Bedsheet",
    sku: "HOM-JBB-13",
    category: Department.HOME,
    cost: 6.20,
    price: 18.00,
    stockAmount: 72,
    stockMinThreshold: 8,
    salesCount: 3,
    salesRevenue: 54.00
  },
  {
    id: "p14",
    name: "Brass Puja Diya Arch Set",
    sku: "HOM-BPD-14",
    category: Department.HOME,
    cost: 34.00,
    price: 85.00,
    stockAmount: 3,
    stockMinThreshold: 5,
    salesCount: 1,
    salesRevenue: 85.00
  },
  {
    id: "p15",
    name: "Handwoven Jute Living Room Rug",
    sku: "HOM-HJR-15",
    category: Department.HOME,
    cost: 29.00,
    price: 79.99,
    stockAmount: 45,
    stockMinThreshold: 5,
    salesCount: 0,
    salesRevenue: 0.00
  },

  // GROCERIES
  {
    id: "p16",
    name: "Premium Kohinoor Basmati Rice 5kg",
    sku: "GRO-KBR-16",
    category: Department.GROCERIES,
    cost: 1.80,
    price: 4.89,
    stockAmount: 154,
    stockMinThreshold: 20,
    salesCount: 88,
    salesRevenue: 430.32
  },
  {
    id: "p17",
    name: "Organic A2 Cow Desi Ghee 1L",
    sku: "GRO-CDG-17",
    category: Department.GROCERIES,
    cost: 2.20,
    price: 5.99,
    stockAmount: 18,
    stockMinThreshold: 25,
    salesCount: 94,
    salesRevenue: 563.06
  },
  {
    id: "p18",
    name: "Authentic Kashmiri Kesar (Saffron) 1g",
    sku: "GRO-AKK-18",
    category: Department.GROCERIES,
    cost: 1.50,
    price: 6.50,
    stockAmount: 22,
    stockMinThreshold: 10,
    salesCount: 38,
    salesRevenue: 247.00
  },
  {
    id: "p19",
    name: "Tata Tea Gold Premium Blend",
    sku: "GRO-TTG-19",
    category: Department.GROCERIES,
    cost: 3.10,
    price: 11.99,
    stockAmount: 40,
    stockMinThreshold: 12,
    salesCount: 52,
    salesRevenue: 623.48
  },
  {
    id: "p20",
    name: "Alphonso Mango Pulp Can",
    sku: "GRO-AMP-20",
    category: Department.GROCERIES,
    cost: 4.80,
    price: 14.50,
    stockAmount: 62,
    stockMinThreshold: 8,
    salesCount: 14,
    salesRevenue: 203.00
  }
];

export const INITIAL_TRANSACTIONS: SaleTransaction[] = [
  {
    id: "t1",
    productId: "p17",
    productName: "Organic A2 Cow Desi Ghee 1L",
    category: Department.GROCERIES,
    quantity: 3,
    pricePerUnit: 5.99,
    totalPrice: 17.97,
    totalCost: 6.60,
    profit: 11.37,
    timestamp: "08:12 AM"
  },
  {
    id: "t2",
    productId: "p4",
    productName: "Designer Jodhpuri Sherwani Jacket",
    category: Department.APPAREL,
    quantity: 1,
    pricePerUnit: 110.00,
    totalPrice: 110.00,
    totalCost: 45.00,
    profit: 65.00,
    timestamp: "08:44 AM"
  },
  {
    id: "t3",
    productId: "p16",
    productName: "Premium Kohinoor Basmati Rice 5kg",
    category: Department.GROCERIES,
    quantity: 5,
    pricePerUnit: 4.89,
    totalPrice: 24.45,
    totalCost: 9.00,
    profit: 15.45,
    timestamp: "09:05 AM"
  },
  {
    id: "t4",
    productId: "p6",
    productName: "BoAt Rockerz ANC Earbuds",
    category: Department.ELECTRONICS,
    quantity: 2,
    pricePerUnit: 89.00,
    totalPrice: 178.00,
    totalCost: 64.00,
    profit: 114.00,
    timestamp: "09:32 AM"
  },
  {
    id: "t5",
    productId: "p19",
    productName: "Tata Tea Gold Premium Blend",
    category: Department.GROCERIES,
    quantity: 2,
    pricePerUnit: 11.99,
    totalPrice: 23.98,
    totalCost: 6.20,
    profit: 17.78,
    timestamp: "10:15 AM"
  },
  {
    id: "t6",
    productId: "p2",
    productName: "Premium Khadi Cotton Kurta",
    category: Department.APPAREL,
    quantity: 4,
    pricePerUnit: 22.00,
    totalPrice: 88.00,
    totalCost: 26.00,
    profit: 62.00,
    timestamp: "10:48 AM"
  },
  {
    id: "t7",
    productId: "p10",
    productName: "Noise ColorFit Metallic Smartwatch",
    category: Department.ELECTRONICS,
    quantity: 1,
    pricePerUnit: 180.00,
    totalPrice: 180.00,
    totalCost: 74.00,
    profit: 106.00,
    timestamp: "11:20 AM"
  },
  {
    id: "t8",
    productId: "p8",
    productName: "CrystalView Smart LED Projector",
    category: Department.ELECTRONICS,
    quantity: 1,
    pricePerUnit: 349.00,
    totalPrice: 349.00,
    totalCost: 165.00,
    profit: 184.00,
    timestamp: "12:02 PM"
  },
  {
    id: "t9",
    productId: "p12",
    productName: "Mysore Sandalwood Dhoop Cones",
    category: Department.HOME,
    quantity: 2,
    pricePerUnit: 24.99,
    totalPrice: 49.98,
    totalCost: 16.00,
    profit: 33.98,
    timestamp: "12:45 PM"
  },
  {
    id: "t10",
    productId: "p17",
    productName: "Organic A2 Cow Desi Ghee 1L",
    category: Department.GROCERIES,
    quantity: 4,
    pricePerUnit: 5.99,
    totalPrice: 23.96,
    totalCost: 8.80,
    profit: 15.16,
    timestamp: "01:10 PM"
  },
  {
    id: "t11",
    productId: "p1",
    productName: "Handwoven Banarasi Silk Saree",
    category: Department.APPAREL,
    quantity: 1,
    pricePerUnit: 65.00,
    totalPrice: 65.00,
    totalCost: 28.50,
    profit: 36.50,
    timestamp: "01:30 PM"
  },
  {
    id: "t12",
    productId: "p9",
    productName: "Syska Fast-Charge 20k Power Bank",
    category: Department.ELECTRONICS,
    quantity: 3,
    pricePerUnit: 29.99,
    totalPrice: 89.97,
    totalCost: 34.50,
    profit: 55.47,
    timestamp: "02:15 PM"
  },
  {
    id: "t13",
    productId: "p20",
    productName: "Alphonso Mango Pulp Can",
    category: Department.GROCERIES,
    quantity: 1,
    pricePerUnit: 14.50,
    totalPrice: 14.50,
    totalCost: 4.80,
    profit: 9.70,
    timestamp: "02:50 PM"
  }
];

export const HOURLY_SALES_CURVE: HourlyDataPoint[] = [
  { hour: "08:00 AM", sales: 120, profit: 45, cost: 75 },
  { hour: "09:00 AM", sales: 250, profit: 95, cost: 155 },
  { hour: "10:00 AM", sales: 380, profit: 140, cost: 240 },
  { hour: "11:00 AM", sales: 490, profit: 185, cost: 305 },
  { hour: "12:00 PM", sales: 680, profit: 260, cost: 420 },
  { hour: "01:00 PM", sales: 620, profit: 240, cost: 380 },
  { hour: "02:00 PM", sales: 540, profit: 195, cost: 345 },
  { hour: "03:00 PM", sales: 710, profit: 280, cost: 430 },
  { hour: "04:00 PM", sales: 880, profit: 340, cost: 540 },
  { hour: "05:00 PM", sales: 950, profit: 390, cost: 560 },
  { hour: "06:00 PM", sales: 1120, profit: 450, cost: 670 },
  { hour: "07:00 PM", sales: 850, profit: 320, cost: 530 },
  { hour: "08:00 PM", sales: 610, profit: 230, cost: 380 },
  { hour: "09:00 PM", sales: 340, profit: 130, cost: 210 }
];
