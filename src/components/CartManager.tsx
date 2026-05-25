import { useState, useMemo } from "react";
import { 
  Trash2, MapPin, Truck, ShieldCheck, CreditCard, Banknote, Sparkles, 
  Wallet, CheckCircle2, Ticket, Printer, ArrowRight, ShoppingCart, ShoppingBag,
  Plus, Minus
} from "lucide-react";
import { CartItem, Product, PaymentTransaction } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface CartManagerProps {
  cart: CartItem[];
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onClearCart: () => void;
  onAddTransaction: (tx: PaymentTransaction) => void;
  setActiveTab: (tab: string) => void;
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function CartManager({
  cart,
  onUpdateQuantity,
  onClearCart,
  onAddTransaction,
  setActiveTab,
  products = [],
  onAddToCart,
}: CartManagerProps) {
  const { theme, language, t } = useThemeLanguage();

  const [address, setAddress] = useState(
    language === "vi" 
      ? "Căn Hộ 1205, Block B, Chung Cư Sunrise Plaza, Quận 7, TP. HCM"
      : "Apartment 1205, Block B, Sunrise Plaza Residential, District 7, HCMC"
  );
  const [recipient, setRecipient] = useState(language === "vi" ? "Nguyễn Văn Minh" : "Kevin Nguyen");
  const [phone, setPhone] = useState("0908 123 456");
  const [paymentMethod, setPaymentMethod] = useState<"ví_vinapay" | "chuyển_khoản" | "thẻ_atm">("ví_vinapay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [lastOrderInvoice, setLastOrderInvoice] = useState<any>(null);

  // Switch product units translation 
  const getUnitLabel = (unit: string) => {
    if (language === "vi") return unit;
    switch (unit.toLowerCase()) {
      case "túi": return "Bag";
      case "kg": return "Kg";
      case "khay": return "Tray";
      case "hộp": return "Box";
      case "chai": return "Bottle";
      case "thùng": return "Case";
      default: return unit;
    }
  };

  // Find all eligible recommendations based on current items in cart
  const matchedSuggestions = useMemo(() => {
    if (cart.length === 0) {
      // Best Seller / Essential Recommendations when the cart is empty:
      // We recommend: 6 (Trứng gà), 5 (Sữa tươi), 1 (Rau cải thìa), 11 (Cam sành)
      const emptyRecIds = ["6", "5", "1", "11"];
      return emptyRecIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p)
        .map(p => ({
          product: p,
          reason: language === "vi" 
            ? "Sản phẩm thiết yếu bán chạy nhất trong ngày tại VinaMart"
            : "Top essential best-seller in high demand today",
          tag: language === "vi" ? "NỔI BẬT" : "POPULAR"
        }));
    }

    // Schemes of rules for smart pairings
    const rules = [
      {
        keywords: ["thịt", "ba rọi", "ức gà", "heo", "gà"],
        recIds: ["1", "2", "8", "9"],
        reasonVi: "Rau củ hữu cơ & gia vị ngon để nấu món mặn tuyệt hảo chuẩn vị cơm nhà",
        reasonEn: "Organic vegetables & fine dipping spices to prep comforting savory foods",
        tagVi: "Bữa cơm gia đình",
        tagEn: "Family Dinner"
      },
      {
        keywords: ["rau", "cải thìa", "cà chua"],
        recIds: ["3", "4", "6"],
        reasonVi: "Nguồn đạm tươi sạch giúp bạn bổ trợ dưỡng chất toàn diện cho tô canh ngọt",
        reasonEn: "Fresh wholesome meats to add well-balanced proteins to your soup broth",
        tagVi: "Dinh dưỡng ngon",
        tagEn: "Healthy Stew"
      },
      {
        keywords: ["gạo", "st25", "nước mắm", "dầu ăn"],
        recIds: ["3", "4", "6", "2"],
        reasonVi: "Kết xảo kho rim đậm đà ăn kèm với bát cơm trắng dẻo thơm hạt ngọc ST25",
        reasonEn: "Savory side dishes ideal for serving with warm premium ST25 fragrant white rice",
        tagVi: "Bếp ấm yêu thương",
        tagEn: "Main Dishes"
      },
      {
        keywords: ["táo", "cam", "bơ", "bơ sáp", "trái cây"],
        recIds: ["5", "13"],
        reasonVi: "Cặp bài trùng tráng miệng: nạp trọn bộ Vitamin & bánh ngọt ngậy thơm",
        reasonEn: "Great dessert combos loaded with clean vitamins and fresh sweet bakery",
        tagVi: "Bữa xế an lành",
        tagEn: "Healthy Snack"
      },
      {
        keywords: ["mì", "hảo hảo"],
        recIds: ["6", "1", "3"],
        reasonVi: "Phối hương hoàn hảo: úp thêm trứng gà ta VietGAP, rau cải tươi mát lịm",
        reasonEn: "Upgrade instant noodles by adding fresh grade-A VietGAP eggs & organics veggies",
        tagVi: "Mì ăn liền",
        tagEn: "Ramen Upgrade"
      },
      {
        keywords: ["sữa", "bánh bông lan"],
        recIds: ["10", "11", "14"],
        reasonVi: "Sạc đầy Vitamin khoáng chất với hoa quả tươi nhập khẩu cho bữa sáng tuyệt đỉnh",
        reasonEn: "Charge up with fresh imported handpicked fruits for rich breakfast boosters",
        tagVi: "Sức khỏe dồi dào",
        tagEn: "Vitamins Pack"
      }
    ];

    const cartIds = cart.map(item => item.product.id);
    const collectedRecs: Array<{ product: Product; reason: string; tag: string }> = [];
    const usedProductIds = new Set<string>();

    for (const item of cart) {
      const name = item.product.name.toLowerCase();
      const cat = item.product.category.toLowerCase();

      for (const rule of rules) {
        const matchesKeyword = rule.keywords.some(kw => name.includes(kw) || cat.includes(kw));
        if (matchesKeyword) {
          for (const recId of rule.recIds) {
            if (!cartIds.includes(recId) && !usedProductIds.has(recId)) {
              const prod = products.find(p => p.id === recId);
              if (prod) {
                collectedRecs.push({
                  product: prod,
                  reason: language === "vi" ? rule.reasonVi : rule.reasonEn,
                  tag: language === "vi" ? rule.tagVi : rule.tagEn
                });
                usedProductIds.add(recId);
              }
            }
          }
        }
      }
    }

    if (collectedRecs.length === 0) {
      const generalRecIds = ["9", "8", "13", "5"];
      for (const recId of generalRecIds) {
        if (!cartIds.includes(recId) && !usedProductIds.has(recId)) {
          const prod = products.find(p => p.id === recId);
          if (prod) {
            collectedRecs.push({
              product: prod,
              reason: language === "vi" 
                ? "Nhu yếu phẩm tiện lợi luôn cần có sẵn trong gia đình của bạn" 
                : "Convenient grocery essential useful for any home kitchen",
              tag: language === "vi" ? "Bổ sung tủ bếp" : "Kitchen Stuff"
            });
            usedProductIds.add(recId);
          }
        }
      }
    }

    return collectedRecs.slice(0, 4);
  }, [cart, products, language]);

  // Subtotal, promotion discount and shipping calculation
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 300005 || subtotal === 0 ? 0 : 22000;
  const discountPercent = subtotal > 150005 ? 0.1 : 0; 
  const discountAmount = subtotal * discountPercent;
  const totalAmount = subtotal - discountAmount + shippingFee;

  // Handle Checkout Action
  const handleOrderCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const simulatedOrderId = "VM-" + Math.floor(100000 + Math.random() * 900000);
      const newTransaction: PaymentTransaction = {
        id: simulatedOrderId,
        orderId: simulatedOrderId,
        amount: totalAmount,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: "Thành công",
        customerName: recipient
      };

      onAddTransaction(newTransaction);
      setLastOrderInvoice({
        orderId: simulatedOrderId,
        recipient,
        phone,
        address,
        paymentMethod,
        totalAmount,
        discountAmount,
        shippingFee,
        items: [...cart],
        timestamp: new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US") + " " + new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")
      });

      setIsProcessing(false);
      setOrderComplete(true);
      onClearCart();
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (orderComplete && lastOrderInvoice) {
    return (
      <div className="max-w-2xl mx-auto py-4 animate-fade-in" id="checkout-success-view">
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("cart.order_success")}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("cart.order_success_desc")}</p>
          </div>

          {/* Tax Invoice Bill design */}
          <div className="rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 p-6 text-left space-y-4 font-mono text-xs text-gray-700 dark:text-slate-300 relative overflow-hidden" id="invoice">
            {/* Supermarket Header */}
            <div className="text-center border-b border-dashed border-gray-200 dark:border-slate-800 pb-3 space-y-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {language === "vi" ? "HÓA ĐƠN SIÊU THỊ VINAMART" : "VINAMART DIGITAL SUPERMARKET"}
              </h3>
              <p className="text-[10px]">{language === "vi" ? "ĐC: Block A, Sunrise Plaza, Quận 7, TP.HCM" : "Add: Block A, Sunrise Plaza, District 7, HCMC"}</p>
              <p className="text-[10px]">{language === "vi" ? "ĐT: 1900 6060 - GP VietGAP số VN-302" : "Support: 1900 6060 - Licence VN-302"}</p>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-2 gap-y-1.5 text-[11px] pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>{language === "vi" ? "Mã Hóa Đơn:" : "Invoice ID:"}</div>
              <div className="text-right font-bold text-gray-900 dark:text-white">{lastOrderInvoice.orderId}</div>
              <div>{language === "vi" ? "Khách hàng:" : "Customer:"}</div>
              <div className="text-right">{lastOrderInvoice.recipient}</div>
              <div>{language === "vi" ? "SĐT nhận hàng:" : "Mobile phone:"}</div>
              <div className="text-right">{lastOrderInvoice.phone}</div>
              <div>{t("cart.time")}:</div>
              <div className="text-right">{lastOrderInvoice.timestamp}</div>
              <div>{language === "vi" ? "Kênh thanh toán:" : "Settle Channel:"}</div>
              <div className="text-right capitalize">
                {lastOrderInvoice.paymentMethod.replace("_", " ")}
              </div>
            </div>

            {/* Table of items */}
            <div className="space-y-2 border-b border-dashed border-gray-200 dark:border-slate-800 pb-3">
              <div className="grid grid-cols-12 font-bold text-gray-900 dark:text-white text-[10px] uppercase pb-1 tracking-wider">
                <div className="col-span-6">{language === "vi" ? "TÊN SẢN PHẨM" : "PRODUCT NAME"}</div>
                <div className="col-span-2 text-center">{language === "vi" ? "SL" : "QTY"}</div>
                <div className="col-span-4 text-right">TOTAL</div>
              </div>
              {lastOrderInvoice.items.map((item: CartItem, idx: number) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] leading-tight">
                  <div className="col-span-6 text-gray-800 dark:text-slate-300 line-clamp-1">{item.product.name}</div>
                  <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</div>
                  <div className="col-span-4 text-right text-gray-800 dark:text-white font-medium">
                    {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-2 gap-y-1 text-[11px] border-b border-gray-150 dark:border-slate-800 pb-3">
              <div>{language === "vi" ? "Tiền hàng:" : "Value of goods:"}</div>
              <div className="text-right">
                {lastOrderInvoice.items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0).toLocaleString("vi-VN")}đ
              </div>
              {lastOrderInvoice.discountAmount > 0 && (
                <>
                  <div className="text-emerald-600">{language === "vi" ? "Khấu trừ (10%):" : "Discount (10%):"}</div>
                  <div className="text-right text-emerald-600">-{lastOrderInvoice.discountAmount.toLocaleString("vi-VN")}đ</div>
                </>
              )}
              <div>{t("cart.shipping")}:</div>
              <div className="text-right font-semibold">
                {lastOrderInvoice.shippingFee === 0 ? (language === "vi" ? "Miễn phí" : "Free") : `${lastOrderInvoice.shippingFee.toLocaleString("vi-VN")}đ`}
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">TOTAL PAYMENT:</div>
              <div className="text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {lastOrderInvoice.totalAmount.toLocaleString("vi-VN")}đ
              </div>
            </div>

            {/* Delivery address */}
            <div className="text-[10.5px] leading-relaxed">
              <span className="font-bold block text-gray-850 dark:text-slate-200 uppercase">{t("cart.address")}:</span>
              <p className="text-gray-600 dark:text-slate-400 font-normal">{lastOrderInvoice.address}</p>
            </div>

            {/* Print greeting footer details */}
            <div className="text-center pt-2 border-t border-dashed border-gray-200 dark:border-slate-800">
              <p className="text-[9px] uppercase tracking-wider text-gray-405">
                {language === "vi" ? "Cảm ơn quý khách! Hẹn gặp lại!" : "Thank you for shopping with us!"}
              </p>
              <div className="mx-auto mt-2 h-10 w-44 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,gray_2px,gray_4px)] dark:bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,slate-700_2px,slate-700_4px)] opacity-30"></div>
            </div>
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={handlePrint}
              id="btn-print-invoice"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{t("cart.print_invoice")}</span>
            </button>
            <button
              onClick={() => {
                setOrderComplete(false);
                setLastOrderInvoice(null);
                setActiveTab("store");
              }}
              id="btn-continue-shopping"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t("cart.continue_shopping")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="cart-manager-view">
      {/* List of items in cart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-4 mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
              <span>{t("cart.title")} ({cart.length} {language === "vi" ? "nhóm hàng" : "groups"})</span>
            </h3>
            {cart.length > 0 && (
              <button
                id="clear-all-cart"
                onClick={onClearCart}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer"
              >
                {language === "vi" ? "Xóa tất cả sản phẩm" : "Clear All Items"}
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" id="cart-empty">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{t("cart.empty")}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">{t("cart.empty_sub")}</p>
              </div>
              <button
                onClick={() => setActiveTab("store")}
                id="return-store-btn"
                className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
              >
                <span>{t("cart.back_to_shop")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800" id="cart-items-list">
              {cart.map((item) => (
                <div key={item.product.id} className="flex py-4 gap-4 items-center" id={`cart-row-${item.product.id}`}>
                  {/* Item mini-image */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-14 w-14 rounded-xl object-cover border border-gray-100 dark:border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.product.name}</h4>
                    <p className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-500">
                      {language === "vi" ? "Đơn giá:" : "Unit Price:"} {item.product.price.toLocaleString("vi-VN")}đ / {getUnitLabel(item.product.unit)}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-450 mt-0.5">
                      {language === "vi" ? "Thành tiền:" : "Line Total:"} {(item.product.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  {/* Increment/Decrement Quantity inside cart */}
                  <div className="flex items-center space-x-1.5 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 p-1">
                    <button
                      id={`dec-${item.product.id}`}
                      onClick={() => onUpdateQuantity(item.product, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-850 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-gray-800 dark:text-white font-mono">{item.quantity}</span>
                    <button
                      id={`inc-${item.product.id}`}
                      onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-slate-850 text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove completely icon */}
                  <button
                    id={`del-row-${item.product.id}`}
                    onClick={() => onUpdateQuantity(item.product, 0)}
                    className="p-1 text-gray-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Recommendations Section */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950 bg-white dark:bg-slate-900/40 p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in" id="smart-recommendations">
          <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-500 fill-amber-100 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  {cart.length === 0 ? t("cart.rec_empty_title") : t("cart.rec_title")}
                </h3>
                <p className="text-[10.5px] text-gray-400 dark:text-gray-500 font-medium leading-tight mt-0.5">
                  {cart.length === 0 ? t("cart.rec_empty_desc") : t("cart.rec_desc")}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450 uppercase tracking-widest leading-none shrink-0 border border-amber-200/20">
              VinaMart AI
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="rec-products-grid">
            {matchedSuggestions.map(({ product, reason, tag }) => (
              <div 
                key={product.id} 
                id={`rec-item-${product.id}`}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all duration-200"
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-16 w-16 rounded-lg object-cover border border-gray-150 dark:border-slate-850 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {tag}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 mt-1">{product.name}</h4>
                    <p className="text-[10.5px] text-gray-400 dark:text-gray-500 mt-0.5 font-semibold leading-tight">
                      {reason}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100/30 dark:border-slate-800/30">
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      {product.price.toLocaleString("vi-VN")}đ<span className="text-[9.5px] font-medium text-gray-400">/{getUnitLabel(product.unit)}</span>
                    </span>
                    <button
                      id={`rec-add-btn-${product.id}`}
                      onClick={() => onAddToCart(product, 1)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10.5px] font-bold hover:bg-emerald-700 hover:scale-102 transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t("cart.quick_add")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Form */}
        {cart.length > 0 && (
          <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <MapPin className="h-4.5 w-4.5 text-emerald-600" />
              <span>{t("cart.delivery_info")}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cart.recipient")}</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cart.phone")}</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("cart.address")}</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout Payment Column */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("cart.item_summary")}</h3>

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 border-b border-gray-50 dark:border-slate-850 pb-4">
            <div className="flex justify-between">
              <span>{t("cart.subtotal")}:</span>
              <span className="font-bold text-gray-800 dark:text-white font-mono">{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-450">
                <span className="flex items-center space-x-1">
                  <Ticket className="h-3.5 w-3.5" />
                  <span>{t("cart.discount")} (10%):</span>
                </span>
                <span className="font-bold font-mono">-{discountAmount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="flex items-center space-x-1">
                <Truck className="h-3.5 w-3.5" />
                <span>{t("cart.shipping")}:</span>
              </span>
              <span className="font-bold text-gray-800 dark:text-white font-mono">
                {shippingFee === 0 ? (language === "vi" ? "Miễn phí (Free)" : "Free Delivery") : `${shippingFee.toLocaleString("vi-VN")}đ`}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 italic">
              {t("cart.shipping_note")}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 dark:text-white">
            <span>{t("cart.total")}:</span>
            <span className="text-lg text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">{totalAmount.toLocaleString("vi-VN")}đ</span>
          </div>

          {/* Checkout Payment Channels options */}
          <div className="space-y-2.5">
            <label className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{t("cart.payment_method")}</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                id="pay-vinapay"
                onClick={() => setPaymentMethod("ví_vinapay")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "ví_vinapay"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                    : "border-gray-150 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Wallet className="h-4.5 w-4.5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold leading-none">{t("cart.vinapay")}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      {language === "vi" ? "Giảm 20.000đ khi thanh toán" : "Save 20,000 VND instantly"}
                    </div>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "ví_vinapay" ? "border-emerald-600 bg-emerald-600" : "border-gray-300 dark:border-slate-705"}`}>
                  {paymentMethod === "ví_vinapay" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                id="pay-transfer"
                onClick={() => setPaymentMethod("chuyển_khoản")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "chuyển_khoản"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                    : "border-gray-150 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="h-4.5 w-4.5 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold leading-none">{t("cart.bank_transfer")}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {language === "vi" ? "Quét mã VietQR chuyển khoản nhanh" : "Instant QR via VietQR bank codes"}
                    </div>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "chuyển_khoản" ? "border-emerald-600 bg-emerald-600" : "border-gray-300 dark:border-slate-705"}`}>
                  {paymentMethod === "chuyển_khoản" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                id="pay-atm"
                onClick={() => setPaymentMethod("thẻ_atm")}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMethod === "thẻ_atm"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                    : "border-gray-150 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Banknote className="h-4.5 w-4.5 text-gray-650 dark:text-gray-400" />
                  <div>
                    <div className="text-xs font-bold leading-none">{t("cart.atm")}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {language === "vi" ? "Thẻ ATM nội địa Napas liên kết" : "Local Vietnamese Napas Card support"}
                    </div>
                  </div>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === "thẻ_atm" ? "border-emerald-600 bg-emerald-600" : "border-gray-300 dark:border-slate-705"}`}>
                  {paymentMethod === "thẻ_atm" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
          </div>

          <button
            id="checkout-order-btn"
            onClick={handleOrderCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all uppercase"
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t("cart.processing")}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>{t("cart.place_order")}</span>
              </>
            )}
          </button>

          <div className="text-[10px] text-gray-400 flex items-center justify-center space-x-1.5 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{language === "vi" ? "Mã hóa bảo mật cổng SSL 256-bit" : "Secured via SSL 256-bit encrypted gateway"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
