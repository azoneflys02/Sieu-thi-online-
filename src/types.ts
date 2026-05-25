export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Bill {
  id: string;
  type: "điện" | "nước" | "internet" | "chung_cư" | "truyền_hình";
  providerString: string;
  customerCode: string;
  customerName: string;
  addressString: string;
  amount: number;
  dueDateString: string;
  billingMonthString: string;
  isPaid: boolean;
}

export interface PaymentTransaction {
  id: string;
  billId?: string; // Optional if paying standard bills
  billType?: string; // e.g., "điện", "nước"
  orderId?: string;  // Optional if purchasing supermarket goods
  amount: number;
  paymentMethod: "chuyển_khoản" | "ví_vinapay" | "thẻ_atm";
  timestamp: string;
  status: "Thành công" | "Đang xử lý";
  customerName?: string;
}

export interface ExpenseRecord {
  month: string;
  "Điện": number;
  "Nước": number;
  "Siêu thị": number;
  "Khác": number;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text?: string;
  timestamp: string;
  // Specific recipe data structure from AI
  recipePayload?: {
    recipeName: string;
    instructions: string;
    matchingProducts: Array<{
      id: string;
      name: string;
      quantityNeed: number;
      note?: string;
    }>;
    assistantSpeech: string;
  };
  isLoading?: boolean;
}
