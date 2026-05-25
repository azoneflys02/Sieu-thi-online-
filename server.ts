import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended server-side settings
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Mock Supermarket Catalog for AI orientation
const CATALOG_ITEMS = [
  { id: "1", name: "Rau cải thìa hữu cơ 500g", price: 18000, category: "Rau củ", unit: "Túi", image: "https://images.unsplash.com/photo-1587049352847-4a23e5133ec2?w=400" },
  { id: "2", name: "Cà chua chín tự nhiên 1kg", price: 29000, category: "Rau củ", unit: "Kg", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400" },
  { id: "3", name: "Thịt ba rọi heo CP 500g", price: 89000, category: "Thịt trứng", unit: "Khay", image: "https://images.unsplash.com/photo-1602470520998-f4a5cd45d4c3?w=400" },
  { id: "4", name: "Ức gà phi lê thương hạng 500g", price: 45000, category: "Thịt trứng", unit: "Khay", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400" },
  { id: "5", name: "Sữa tươi TH True Milk ít đường 1L", price: 34000, category: "Sữa bơ", unit: "Hộp", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
  { id: "6", name: "Trứng gà ta VietGAP hộp 10 quả", price: 32000, category: "Thịt trứng", unit: "Hộp", image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400" },
  { id: "7", name: "Gạo lài hương đặc sản ST25 túi 5kg", price: 165000, category: "Gia vị gạo", unit: "Túi", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
  { id: "8", name: "Nước mắm Nam Ngư Đệ Nhị 900ml", price: 23000, category: "Gia vị gạo", unit: "Chai", image: "https://images.unsplash.com/photo-1627485264174-112df91cd048?w=400" },
  { id: "9", name: "Dầu ăn Simply hạt cải 1L", price: 62000, category: "Gia vị gạo", unit: "Chai", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
  { id: "10", name: "Táo Gala Mỹ nhập khẩu 1kg", price: 59000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
  { id: "11", name: "Cam sành miền Tây mọng nước 1kg", price: 22000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400" },
  { id: "12", name: "Mì ăn liền Hảo Hảo tôm chua cay thùng 30 gói", price: 118000, category: "Sản phẩm khô", unit: "Thùng", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400" },
  { id: "13", name: "Bánh bông lan trứng muối tươi ngon", price: 42000, category: "Bánh ngọt", unit: "Hộp", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
  { id: "14", name: "Bơ sáp loại 1 Đắk Lắk 1kg", price: 48000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
];

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Catalog items endpoint
app.get("/api/catalog", (req, res) => {
  res.json(CATALOG_ITEMS);
});

// Gemini Assistant Endpoint
app.post("/api/gemini", async (req, res) => {
  const { prompt, type, cart, expenses } = req.body;

  if (!process.env.GEMINI_API_KEY || !ai) {
    return res.status(200).json({
      text: "Xin chào! Hiện tại tính năng AI chưa được cấu hình khóa API (GEMINI_API_KEY). Vui lòng thêm khóa trong phần 'Settings -> Secrets' trên AI Studio. Tuy nhiên tôi có thể gợi ý cho bạn: Thịt kho hột vịt cần Thịt ba rọi heo (89.000đ/Khay), trứng gà ta (32.000đ/Hộp), nước mắm Nam Ngư (23.000đ/Chai).",
      success: false,
      recommendedIds: ["3", "6", "8"]
    });
  }

  try {
    let systemInstruction = "Bạn là Trợ lý mua sắm AI thân thiện của Siêu Thị Trực Tuyến & Thanh Toán Hóa Đơn VinaMart. Bạn phản hồi lịch sự bằng tiếng Việt.";
    let finalPrompt = prompt;

    if (type === "recipe") {
      systemInstruction += " Nhiệm vụ của bạn là tư vấn công thức nấu ăn ngon cho gia đình, cung cấp danh sách nguyên liệu và so khớp chính xác với ID của các mặt hàng trong siêu thị của chúng tôi để người dùng có thể thêm vào giỏ hàng. Chỉ đề xuất các sản phẩm thực sự hữu ích cho món ăn.";
      finalPrompt = `Dựa trên yêu cầu nấu ăn: "${prompt}". Hãy gợi ý công thức ngắn gọn và liệt kê các nguyên liệu cần mua. 
      Dưới đây là danh sách sản phẩm trong siêu thị: ${JSON.stringify(CATALOG_ITEMS)}.
      Hãy phản hồi dưới dạng cấu trúc JSON sạch chứa 3 phần:
      1. "recipeName": Tên món ăn.
      2. "instructions": Cách làm tóm tắt (3-4 dòng ngắn).
      3. "matchingProducts": Mảng chứa các object có cấu trúc: { "id": "ID sản phẩm trong danh sách trên", "name": "Tên gốc trong danh sách", "quantityNeed": 1, "note": "Ghi chú dùng cho việc gì" }.
      4. "assistantSpeech": Lời chào/tư vấn bằng giọng văn ấm áp của trợ lý.`;
    } else if (type === "spending_advisor") {
      systemInstruction += " Bạn là chuyên gia tư vấn tài chính gia đình giúp người dùng tiết kiệm hóa đơn tiền điện, tiền nước, chi tiêu siêu thị hằng ngày.";
      finalPrompt = `Dựa trên số liệu chi tiêu hiện tại: ${JSON.stringify(expenses)} và giỏ hàng hiện tại: ${JSON.stringify(cart || [])}. Người dùng hỏi câu: "${prompt}".
      Hãy phản hồi bằng một đoạn văn tiếng Việt có cấu trúc đẹp (sử dụng Markdown), đưa ra phân tích chi tiêu thiết thực, mẹo tiết kiệm điện/nước hữu dụng cụ thể, và khuyên họ nên mua gì hợp lý.`;
    }

    if (type === "recipe") {
      // Return structured JSON response for recipe matching
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipeName: { type: Type.STRING },
              instructions: { type: Type.STRING },
              matchingProducts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    quantityNeed: { type: Type.INTEGER },
                    note: { type: Type.STRING }
                  },
                  required: ["id", "name", "quantityNeed"]
                }
              },
              assistantSpeech: { type: Type.STRING }
            },
            required: ["recipeName", "instructions", "matchingProducts", "assistantSpeech"]
          }
        }
      });

      const responseText = response.text || "{}";
      const resultData = JSON.parse(responseText.trim());
      res.json({ success: true, ...resultData });
    } else {
      // General chat or spending advice (markdown)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalPrompt,
        config: { systemInstruction }
      });
      res.json({ success: true, text: response.text || "" });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Lỗi kết nối AI: " + error.message, success: false });
  }
});

// Setup Vite and Static endpoints
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK] Server started successfully on port ${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server:", err);
});
