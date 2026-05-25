import { useState, useEffect } from "react";
import { Product, CartItem, Bill, PaymentTransaction, ExpenseRecord } from "./types";
import Navbar from "./components/Navbar";
import GroceryShop from "./components/GroceryShop";
import CartManager from "./components/CartManager";
import BillPayment from "./components/BillPayment";
import AIAssistant from "./components/AIAssistant";
import ExpenseManager from "./components/ExpenseManager";
import TransactionHistory from "./components/TransactionHistory";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useThemeLanguage } from "./ThemeLanguageContext";

// Fallback constant catalog items in case server fails
const LOCAL_CATALOG: Product[] = [
  { id: "1", name: "Rau cải thìa hữu cơ 500g", price: 18000, category: "Rau củ", unit: "Túi", image: "https://images.unsplash.com/photo-1587049352847-4a23e5133ec2?w=400" },
  { id: "2", name: "Cà chua chín tự nhiên 1kg", price: 29000, category: "Rau củ", unit: "Kg", image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=400" },
  { id: "3", name: "Thịt ba rọi heo CP 500g", price: 89000, category: "Thịt trứng", unit: "Khay", image: "https://images.unsplash.com/photo-1602470520998-f4a5cd45d4c3?w=400" },
  { id: "4", name: "Ức gà phi lê thương hạng 500g", price: 45000, category: "Thịt trứng", unit: "Khay", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400" },
  { id: "5", name: "Sữa tươi TH True Milk ít đường 1L", price: 34000, category: "Sữa bơ", unit: "Hộp", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400" },
  { id: "6", name: "Trứng gà ta VietGAP hộp 10 quả", price: 32000, category: "Thịt trứng", unit: "Hộp", image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400" },
  { id: "7", name: "Gạo dẻo hương ST25 túi 5kg", price: 165000, category: "Gia vị gạo", unit: "Túi", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" },
  { id: "8", name: "Nước mắm Nam Ngư Đệ Nhị 900ml", price: 23000, category: "Gia vị gạo", unit: "Chai", image: "https://images.unsplash.com/photo-1627485264174-112df91cd048?w=400" },
  { id: "9", name: "Dầu ăn Simply hạt cải 1L", price: 62000, category: "Gia vị gạo", unit: "Chai", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" },
  { id: "10", name: "Táo Gala Mỹ nhập khẩu 1kg", price: 59000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400" },
  { id: "11", name: "Cam sành miền Tây mọng nước 1kg", price: 22000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400" },
  { id: "12", name: "Mì ăn liền Hảo Hảo tôm chua cay thùng 30 gói", price: 118000, category: "Sản phẩm khô", unit: "Thùng", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400" },
  { id: "13", name: "Bánh bông lan trứng muối tươi ngon", price: 42000, category: "Bánh ngọt", unit: "Hộp", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
  { id: "14", name: "Bơ sáp loại 1 Đắk Lắk 1kg", price: 48000, category: "Trái cây", unit: "Kg", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
];

export default function App() {
  const { theme, language, t } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<string>("store");

  const [catalog, setCatalog] = useState<Product[]>(LOCAL_CATALOG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Initial Outstanding Service Bills state
  const [bills, setBills] = useState<Bill[]>([
    {
      id: "b-elec-1",
      type: "điện",
      providerString: "Tổng công ty Điện lực EVN TP.HCM (EVN HCMC)",
      customerCode: "PE102",
      customerName: "Bùi Thị Minh Tâm",
      addressString: "Sunrise Plaza Block A, lầu 12-05, Quận 7, TP. HCM",
      amount: 580000,
      dueDateString: "03/06/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
    {
      id: "b-elec-2",
      type: "điện",
      providerString: "Tổng công ty Điện lực EVN Miền Nam",
      customerCode: "PE304",
      customerName: "Nguyễn Hoàng Nam",
      addressString: "Khu Biệt Thự Mỹ Thái 2, Đường số 4, Quận 7, TP. HCM",
      amount: 1220000,
      dueDateString: "02/06/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
    {
      id: "b-water-1",
      type: "nước",
      providerString: "Công ty Cấp nước Chợ Lớn Sawaco",
      customerCode: "HW204",
      customerName: "Nguyễn Văn Minh",
      addressString: "Căn Hộ 1205, Block B, Chung Cư Sunrise Plaza, Quận 7, TP. HCM",
      amount: 145000,
      dueDateString: "05/06/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
    {
      id: "b-internet-1",
      type: "internet",
      providerString: "Công ty Viễn Thông FPT Telecom",
      customerCode: "IN801",
      customerName: "Phạm Quốc Hùng",
      addressString: "Chung cư Hoàng Anh Thanh Bình, Block B, Quận 7, TP. HCM",
      amount: 275000,
      dueDateString: "08/06/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
    {
      id: "b-apt-1",
      type: "chung_cư",
      providerString: "Ban Quản Trị Chung cư Sunrise Plaza",
      customerCode: "AP902",
      customerName: "Nguyễn Văn Minh",
      addressString: "Căn Hộ 1205, Block B, Chung Cư Sunrise Plaza, Quận 7, TP. HCM",
      amount: 850000,
      dueDateString: "10/06/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
    {
      id: "b-tv-1",
      type: "truyền_hình",
      providerString: "Tổng công ty Truyền hình cáp VTVCab",
      customerCode: "TV501",
      customerName: "Vũ Minh Thư",
      addressString: "Khu Đô Thị Phú Mỹ Hưng, Phường Tân Phong, Quận 7, TP. HCM",
      amount: 110000,
      dueDateString: "28/05/2026",
      billingMonthString: "Tháng 05/2026",
      isPaid: false,
    },
  ]);

  // Transaction History log state
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Five months of household expenses ledger
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([
    { month: "Tháng 1", "Điện": 450000, "Nước": 120000, "Siêu thị": 1200000, "Khác": 150000 },
    { month: "Tháng 2", "Điện": 390000, "Nước": 115000, "Siêu thị": 1850000, "Khác": 150000 },
    { month: "Tháng 3", "Điện": 420000, "Nước": 130000, "Siêu thị": 1450000, "Khác": 160000 },
    { month: "Tháng 4", "Điện": 510000, "Nước": 140000, "Siêu thị": 1600000, "Khác": 110000 },
    { month: "Tháng 5", "Điện": 0, "Nước": 0, "Siêu thị": 0, "Khác": 0 }, // Dynamically calculated when paid in active month
  ]);

  // Budget CAP variables
  const activeBudget = 3200000;

  // Fetch updated catalog on start
  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        }
      })
      .catch((err) => console.log("Using local fallback catalog data", err));
  }, []);

  // Update real-time Month 5 expenditure calculations when cart checkout or bills are paid!
  useEffect(() => {
    // Calcul de l'enveloppe
    const totalPaidElectricity = transactions
      .filter((tx) => tx.status === "Thành công" && tx.billType === "điện")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPaidWater = transactions
      .filter((tx) => tx.status === "Thành công" && tx.billType === "nước")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPaidSupermarketByOrderId = transactions
      .filter((tx) => tx.status === "Thành công" && tx.orderId)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalPaidOthers = transactions
      .filter((tx) => tx.status === "Thành công" && tx.billType && tx.billType !== "điện" && tx.billType !== "nước")
      .reduce((sum, tx) => sum + tx.amount, 0);

    setExpenses((prev) => {
      const updated = [...prev];
      updated[4] = {
        month: "Tháng 5",
        "Điện": totalPaidElectricity,
        "Nước": totalPaidWater,
        "Siêu thị": totalPaidSupermarketByOrderId,
        "Khác": totalPaidOthers,
      };
      return updated;
    });
  }, [transactions]);

  // Helper trigger helper toaster toast notices
  const addToast = (text: string, type: "success" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Cart operations actions
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addToast(t("store.toast_add", { name: product.name }));
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.product.id !== product.id);
    });
    addToast(t("store.toast_reduce", { name: product.name }));
  };

  const handleUpdateQuantity = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== product.id));
      addToast(t("store.toast_remove", { name: product.name }));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleAddMultipleToCart = (itemsToAdd: Array<{ product: Product; quantity: number }>) => {
    setCart((prev) => {
      let updated = [...prev];
      itemsToAdd.forEach((item) => {
        const idx = updated.findIndex((x) => x.product.id === item.product.id);
        if (idx > -1) {
          updated[idx].quantity += item.quantity;
        } else {
          updated.push({ product: item.product, quantity: item.quantity });
        }
      });
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Pay single service outstanding bill
  const handlePayBill = (billId: string, tx: PaymentTransaction) => {
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, isPaid: true } : b))
    );
    addToast(t("bills.payment_success"));
  };


  const handleAddTransaction = (newTx: PaymentTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const cartCountById = (id: string) => {
    const item = cart.find((x) => x.product.id === id);
    return item ? item.quantity : 0;
  };

  const cartTotalCount = cart.reduce((s, x) => s + x.quantity, 0);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-200`}>
      
      {/* Top sticky navigation menu header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cartTotalCount} 
      />

      {/* Floating alert toasts */}
      {toast && (
        <div 
          onClick={() => setToast(null)}
          className={`fixed bottom-24 right-6 z-50 flex max-w-sm cursor-pointer items-center space-x-3 rounded-2xl border p-4 text-xs font-semibold shadow-2xl animate-fade-in-up transition-all ${
            theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-emerald-100 text-gray-700"
          }`}
          id="toast-notification"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-teal-600 shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.text}</span>
          <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 shrink-0" />
        </div>
      )}

      {/* Primary tab workspace router viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-10 pb-28 lg:pb-12 h-full">
        {activeTab === "store" && (
          <GroceryShop
            products={catalog}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            cartCountById={cartCountById}
          />
        )}

        {activeTab === "cart" && (
          <CartManager
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onClearCart={handleClearCart}
            onAddTransaction={handleAddTransaction}
            setActiveTab={setActiveTab}
            products={catalog}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === "bills" && (
          <BillPayment
            bills={bills}
            onPayBill={handlePayBill}
            onAddTransaction={handleAddTransaction}
            expenses={expenses}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "ai" && (
          <AIAssistant
            products={catalog}
            onAddMultipleToCart={handleAddMultipleToCart}
            cart={cart}
            expenses={expenses}
            onAddToast={(msg) => addToast(msg, "success")}
          />
        )}

        {activeTab === "stats" && (
          <ExpenseManager 
            expenses={expenses} 
            activeBudget={activeBudget} 
          />
        )}

        {activeTab === "history" && (
          <TransactionHistory 
            transactions={transactions} 
          />
        )}
      </main>

      {/* Localized Footer */}
      <footer className={`border-t py-6 text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 hidden lg:block ${
        theme === "dark" ? "border-slate-900 bg-slate-900/40" : "border-gray-100 bg-white"
      }`}>
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <p>{language === "vi" ? "© 2026 Siêu thị trực tuyến VinaMart & Thanh toán Tiện ích. Bảo lưu mọi quyền." : "© 2026 VinaMart Supermarket Online & Utility Smart Payments. All Rights Reserved."}</p>
          <div className="flex justify-center space-x-4">
            <span>{language === "vi" ? "Chứng chỉ VietGAP số ĐC-302" : "VietGAP Standard Certificate No. DC-302"}</span>
            <span>•</span>
            <span>{language === "vi" ? "Bảo mật cổng PCI-DSS Level 1" : "PCI-DSS Level 1 Gate Security"}</span>
          </div>
        </div>
      </footer>
    </div>

  );
}
