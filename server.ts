import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Retail Store AI Auditor API Route
app.post("/api/analyze", async (req, res) => {
  try {
    const { products, kpis, department } = req.body;

    const systemPrompt = `You are an expert Retail Strategy Consultant and Financial Analyst. You specialize in store optimization, inventory turnover, margin maximizing, and general cash flow health. Your job is to analyze the daily retail performance metrics, stock levels, fast-moving items, and low-performing items to produce structured, professional, and actionable business recommendations.
Keep all labels friendly, objective, and realistic. Provide actual values based on the numbers presented.`;

    const storeContext = `
Department Segment analyzed: ${department || "All Store"}
--- CURRENT KPIS ---
Total Revenue: ₹${Number(kpis.revenue).toFixed(2)}
Total Sales Cost: ₹${Number(kpis.cost).toFixed(2)}
Overall Profit Margin: ${Number(kpis.margin).toFixed(1)}%
Average Fill Rate (In Stock %): ${Number(kpis.inStockRate).toFixed(1)}%
Out of Stock Products: ${kpis.outOfStockCount || 0} items

--- TOP 5 SELLING PRODUCTS OR SAMPLES ---
${products
  .filter((p: any) => p.salesCount > 0)
  .sort((a: any, b: any) => b.salesCount - a.salesCount)
  .slice(0, 5)
  .map((p: any) => `- ${p.name} (${p.category}): Sales count: ${p.salesCount} units, Current stock: ${p.stockAmount} units, Total value sold: ₹${(p.salesCount * p.price).toFixed(2)}, Profit margin: ${(((p.price - p.cost) / p.price) * 100).toFixed(1)}%`)
  .join("\n")}

--- LOWEST SELLING PRODUCTS OR STOCK ISSUES ---
${products
  .sort((a: any, b: any) => a.salesCount - b.salesCount)
  .slice(0, 5)
  .map((p: any) => `- ${p.name} (${p.category}): Sales count: ${p.salesCount} units, Current stock: ${p.stockAmount}, Total holding value in stock: ₹${(p.stockAmount * p.cost).toFixed(2)}, Profit margin: ${(((p.price - p.cost) / p.price) * 100).toFixed(1)}%`)
  .join("\n")}
`;

    const userPrompt = `Review the current store metrics and provide recommendations in the expected JSON schema:
${storeContext}
Provide high-quality retail consultation directly.
`;

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["healthScore", "summary", "positiveTrends", "criticalWarnings", "actionItems"],
          properties: {
            healthScore: {
              type: Type.INTEGER,
              description: "Overall retail retail store health score between 0 and 100, calculated intelligently based on margins and stock efficiency.",
            },
            summary: {
              type: Type.STRING,
              description: "A solid, professional 2-3 sentence overview containing direct assessment of the revenue progress and stock concerns.",
            },
            positiveTrends: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 positive developments in sales volumes, inventory velocity, or margins.",
            },
            criticalWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 2-3 critical risks, like fast-movers going out-of-stock, or heavy capital tied up in dead stock.",
            },
            actionItems: {
              type: Type.ARRAY,
              description: "A list of 3-4 specific operations or pricing changes proposed to solve key metrics problems.",
              items: {
                type: Type.OBJECT,
                required: ["type", "target", "action", "impact", "priority"],
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Proposed department area action kind, e.g. 'Inventory Restock', 'Pricing Adjustment', 'Marketing Push', 'Cost Renegotiation'.",
                  },
                  target: {
                    type: Type.STRING,
                    description: "The specific product name, category name, or general indicator targeted.",
                  },
                  action: {
                    type: Type.STRING,
                    description: "Concrete step details, such as 'Reorder 50 units immediately', 'Raise standard price by ₹150', or 'Bundle with slow-moving item'.",
                  },
                  impact: {
                    type: Type.STRING,
                    description: "Financial or inventory outcome expected, like 'Unlocks ₹35,000 in trapped capital' or 'Protects from stockout loss'.",
                  },
                  priority: {
                    type: Type.STRING,
                    description: "Rating of importance: 'High', 'Medium', or 'Low'.",
                  },
                },
              },
            },
          },
        },
      },
    });

    const reportText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(reportText));

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during report generation. Verify GEMINI_API_KEY is configured in Secrets."
    });
  }
});

// Setup Vite Dev Server / Static Files Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for all non-API paths
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Retail Store Server is running and listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
