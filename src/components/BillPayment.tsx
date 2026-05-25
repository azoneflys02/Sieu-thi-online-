import { useState, FormEvent } from "react";
import { 
  Flashlight, Droplet, Wifi, Home, Tv, Search, Landmark, CreditCard, 
  Wallet, Banknote, CheckCircle2, AlertCircle, FileText, MapPin, 
  Sparkles, Receipt, ShieldAlert, Award
} from "lucide-react";
import { Bill, PaymentTransaction } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface BillPaymentProps {
  bills: Bill[];
  onPayBill: (billId: string, tx: PaymentTransaction) => void;
  onAddTransaction: (tx: PaymentTransaction) => void;
  expenses: any;
  setActiveTab: (tab: string) => void;
}

export default function BillPayment({
  bills,
  onPayBill,
  onAddTransaction,
  setActiveTab,
}: BillPaymentProps) {
  const { theme, language, t } = useThemeLanguage();

  const [billType, setBillType] = useState<"điện" | "nước" | "internet" | "chung_cư" | "truyền_hình">("điện");
  const [customerCode, setCustomerCode] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [foundBill, setFoundBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ví_vinapay" | "chuyển_khoản" | "thẻ_atm">("ví_vinapay");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidReceipt, setPaidReceipt] = useState<any>(null);

  // Quick lookup guides so the user can test
  const testGuides = {
    "điện": language === "vi" 
      ? "Mã mẫu: PE102 (Bùi Thị Minh Tâm - 580.000đ) hoặc PE304"
      : "Demo ID: PE102 (Bùi Thị Minh Tâm - 580,000 VND) or PE304",
    "nước": language === "vi"
      ? "Mã mẫu: HW204 (Nguyễn Văn Minh - 145.000đ)"
      : "Demo ID: HW204 (Nguyễn Văn Minh - 145,000 VND)",
    "internet": language === "vi"
      ? "Mã mẫu: IN801 (Phạm Quốc Hùng - 275.000đ)"
      : "Demo ID: IN801 (Phạm Quốc Hùng - 275,000 VND)",
    "chung_cư": language === "vi"
      ? "Mã mẫu: AP902 (Nguyễn Văn Minh - Sunrise Plaza - 850.000đ)"
      : "Demo ID: AP902 (Nguyễn Văn Minh - Sunrise Plaza - 850,000 VND)",
    "truyền_hình": language === "vi"
      ? "Mã mẫu: TV501 (Vũ Minh Thư - 110.000đ)"
      : "Demo ID: TV501 (Vũ Minh Thư - 110,000 VND)"
  };

  const handleSearchBill = (e: FormEvent) => {
    e.preventDefault();
    if (!customerCode.trim()) return;

    // Search inside available mock bills
    const matched = bills.find(
      (b) => b.type === billType && b.customerCode.toUpperCase() === customerCode.trim().toUpperCase()
    );

    if (matched) {
      setFoundBill(matched);
    } else {
      // Create fallback bill if not in mock database so testing is seamless!
      const fallbackBill: Bill = {
        id: "BF-" + Math.floor(1000 + Math.random() * 9000),
        type: billType,
        providerString: billType === "điện" ? "EVN Miền Nam" : billType === "nước" ? "Sawaco nước sạch" : "VNPT Telecom",
        customerCode: customerCode.toUpperCase(),
        customerName: language === "vi" ? "Khách Hàng Thử Nghiệm" : "Demo Customer Trial",
        addressString: language === "vi" 
          ? "Khu chung cư Sunrise Plaza, Block B, Quận 7, TP. HCM"
          : "Sunrise Plaza Complex, Block B, District 7, HCMC",
        amount: Math.floor(120000 + Math.random() * 450000),
        dueDateString: "05/06/2026",
        billingMonthString: language === "vi" ? "Tháng 05/2026" : "May 2026",
        isPaid: false
      };
      setFoundBill(fallbackBill);
    }
    setSearchAttempted(true);
  };

  const handlePayBill = () => {
    if (!foundBill) return;
    setIsPaying(true);

    setTimeout(() => {
      const txId = "TX-" + Math.floor(100000 + Math.random() * 900000);
      const newTx: PaymentTransaction = {
        id: txId,
        billId: foundBill.id,
        billType: foundBill.type,
        amount: foundBill.amount,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: "Thành công",
        customerName: foundBill.customerName
      };

      onPayBill(foundBill.id, newTx);
      onAddTransaction(newTx);

      setPaidReceipt({
        txId,
        bill: { ...foundBill, isPaid: true },
        paymentMethod,
        timestamp: new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US") + " " + new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")
      });

      setIsPaying(false);
      setPaymentSuccess(true);
      setFoundBill(null);
      setCustomerCode("");
      setSearchAttempted(false);
    }, 1500);
  };

  const serviceIcons = {
    "điện": { icon: Flashlight, bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400", labelVi: "Điện lực EVN", labelEn: "EVN Electricity" },
    "nước": { icon: Droplet, bg: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400", labelVi: "Nước sinh hoạt", labelEn: "Tap Water" },
    "internet": { icon: Wifi, bg: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400", labelVi: "Internet / Wifi Broadband", labelEn: "Internet & Wi-Fi" },
    "chung_cư": { icon: Home, bg: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400", labelVi: "Dịch vụ Chung cư", labelEn: "Apartment Fee" },
    "truyền_hình": { icon: Tv, bg: "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400", labelVi: "Truyền hình Cáp", labelEn: "Cable / TV Bills" }
  };

  const getBillTypeLabel = (type: string) => {
    switch(type) {
      case "điện": return t("bills.electricity");
      case "nước": return t("bills.water");
      case "internet": return t("bills.internet");
      case "chung_cư": return t("bills.apartment");
      case "truyền_hình": return t("bills.tv");
      default: return type;
    }
  };

  const unpaidCount = bills.filter(b => !b.isPaid).length;
  const unpaidTotal = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in" id="bill-payment-view">
      {/* Banner / Header info */}
      <div 
        className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
        id="bills-hero-banner"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>{language === "vi" ? "Cổng Thanh Toán Quốc Gia Tiêu chuẩn" : "National Payment Standard Compliant"}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {language === "vi" ? "Thanh Toán Hóa Đơn Sinh Hoạt" : "Instant Utility Bills Payment"}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
            {language === "vi" 
              ? "Tích hợp trực tiếp với EVN, Sawaco, các nhà mạng viễn thông và ban quản lý đô thị Sunrise Plaza. Trừ tiền nhanh chóng, ghi nhận hoàn thiện tự động bảo mật cao."
              : "Direct integrations with EVN, Sawaco water suppliers, top telcos, and Sunrise Plaza residential. Secure instant settlements and download official tax invoices."}
          </p>
        </div>

        {/* Mini stats tracker card */}
        <div className="rounded-xl border border-teal-100 dark:border-teal-950/40 bg-teal-50/35 dark:bg-teal-950/10 p-4 space-y-2 text-xs min-w-[220px]" id="bills-outstanding-summary">
          <h4 className="font-bold text-teal-900 dark:text-teal-400 flex items-center space-x-1">
            <Receipt className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>{language === "vi" ? "Hóa đơn tháng này" : "Outstanding Bills"}</span>
          </h4>
          <div className="space-y-1 text-gray-700 dark:text-slate-300 font-bold">
            <div className="flex justify-between">
              <span>{language === "vi" ? "Chưa đóng:" : "Unpaid details:"}</span>
              <span className="text-red-600 dark:text-red-400 font-mono">
                {unpaidCount} {language === "vi" ? "hóa đơn" : "unpaid"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{language === "vi" ? "Tổng tiền:" : "Total amount:"}</span>
              <span className="text-gray-950 dark:text-white font-mono">
                {unpaidTotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Selection of Service + Form Lookup */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{language === "vi" ? "Dịch vụ thanh toán" : "Utility Services"}</h3>

            {/* Service grid selection buttons */}
            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(serviceIcons) as Array<keyof typeof serviceIcons>).map((type) => {
                const item = serviceIcons[type];
                const IconComp = item.icon;
                const isSelected = billType === type;
                return (
                  <button
                    key={type}
                    id={`service-btn-${type}`}
                    onClick={() => {
                      setBillType(type);
                      setFoundBill(null);
                      setSearchAttempted(false);
                      setCustomerCode("");
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500 font-bold"
                        : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-semibold"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="text-xs">{language === "vi" ? item.labelVi : item.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Form execution look up */}
            <form onSubmit={handleSearchBill} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  {language === "vi" ? "Mã Khách Hàng / Mã danh bộ" : "Customer Contract Code"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === "vi" ? "VD: PE102, HW204..." : "e.g., PE102, HW204..."}
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-3.5 pr-12 text-xs font-bold text-gray-800 dark:text-white outline-none uppercase focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    id="btn-search-bill"
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hints Box */}
              <div className="rounded-xl bg-gray-50 dark:bg-slate-950/50 p-3 flex gap-2 items-start text-[10.5px] leading-relaxed text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-850">
                <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-700 dark:text-slate-300 block">{language === "vi" ? "Hướng dẫn nhập mã" : "Reference instructions"}</span>
                  {testGuides[billType]}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Results display & payment action */}
        <div className="lg:col-span-2 space-y-6">
          {paymentSuccess && paidReceipt && (
            <div className="rounded-2xl border border-emerald-150 dark:border-emerald-950 bg-emerald-50/20 p-6 sm:p-8 shadow-md text-center space-y-5" id="bill-receipt-success">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("bills.pay_success")}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === "vi" 
                    ? `Giao dịch ${paidReceipt.txId} đã đóng sổ liên ngân hàng hạch toán thành công.`
                    : `Transaction ${paidReceipt.txId} was fully processed and settled successfully.`}
                </p>
              </div>

              {/* Printable Transaction Receipt */}
              <div className="max-w-md mx-auto rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 text-left space-y-3.5 font-mono text-xs text-gray-700 dark:text-slate-350 shadow-sm">
                <div className="text-center font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2 uppercase tracking-wider">
                  {language === "vi" ? "BIÊN LAI XÁC NHẬN GIAO DỊCH" : "OFFICIAL SETTLEMENT RECEIPT"}
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Mã GD hệ thống:" : "Txn Reference:"}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{paidReceipt.txId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Loại dịch vụ:" : "Service Category:"}</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200 capitalize">{getBillTypeLabel(paidReceipt.bill.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Nhà cung cấp:" : "Provider Unit:"}</span>
                    <span>{paidReceipt.bill.providerString}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Mã danh bộ KH:" : "ID Code:"}</span>
                    <span className="font-bold">{paidReceipt.bill.customerCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Tên chủ hộ:" : "Resident / Name:"}</span>
                    <span>{paidReceipt.bill.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Thời hạn chu kỳ:" : "Billing Month:"}</span>
                    <span>{paidReceipt.bill.billingMonthString}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "vi" ? "Cổng thực hiện:" : "Settle Gateway:"}</span>
                    <span className="capitalize">{paidReceipt.paymentMethod.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-gray-150 dark:border-slate-800 pt-2 font-bold text-gray-900 dark:text-white text-xs">
                    <span>{language === "vi" ? "TỔNG SỐ TIỀN ĐÃ ĐÓNG:" : "TOTAL SETTLED AMOUNT:"}</span>
                    <span className="text-emerald-600 dark:text-emerald-450">{paidReceipt.bill.amount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>
                <div className="text-center pt-1.5 border-t border-gray-100 dark:border-slate-800 text-[10px] text-gray-400">
                  {language === "vi" ? "Giao dịch đã cộng tích lũy điểm VinaMart 1.5%" : "Completed txn collected +1.5% VinaPoints."}
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setPaidReceipt(null);
                  }}
                  id="btn-pay-another"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer"
                >
                  {language === "vi" ? "Đóng hóa đơn khác" : "Pay Another Bill"}
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  id="btn-ai-consult"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>{language === "vi" ? "Hỏi Trợ lý AI tư vấn tiết kiệm" : "Consult AI Budgeting"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Finding Result screen */}
          {searchAttempted && foundBill && (
            <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-6 animate-fade-in" id="search-bill-result">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{language === "vi" ? "Chi tiết tra cứu hóa đơn" : "Looked up Bill Invoice Details"}</h4>
                    <p className="text-[10.5px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">{foundBill.providerString}</p>
                  </div>
                </div>

                <div>
                  {foundBill.isPaid ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                      {language === "vi" ? "Đã Thanh Toán" : "Fully Paid"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-50/75 px-2.5 py-0.5 text-xs font-bold text-red-600 animate-pulse">
                      {language === "vi" ? "Chưa Thanh Toán" : "Due Unpaid"}
                    </span>
                  )}
                </div>
              </div>

              {/* Grid content detailing bill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700 dark:text-slate-300">
                <div className="space-y-1 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-850">
                  <span className="text-[9.5px] text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Mã danh bộ khách hàng" : "Customer Contract ID"}</span>
                  <span className="text-gray-900 dark:text-white font-bold text-sm tracking-wide font-mono">{foundBill.customerCode}</span>
                </div>
                <div className="space-y-1 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-850">
                  <span className="text-[9.5px] text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Họ tên chủ hộ" : "Contract Holder"}</span>
                  <span className="text-gray-900 dark:text-white font-bold">{foundBill.customerName}</span>
                </div>
                <div className="space-y-1 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-850 md:col-span-2">
                  <span className="text-[9.5px] text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Địa chỉ sử dụng dịch vụ" : "Installation Address"}</span>
                  <span className="text-gray-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    {foundBill.addressString}
                  </span>
                </div>
                <div className="space-y-1 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-850">
                  <span className="text-[9.5px] text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Kỳ hóa đơn" : "Invoice Period"}</span>
                  <span className="text-gray-900 dark:text-white font-bold font-mono">{foundBill.billingMonthString}</span>
                </div>
                <div className="space-y-1 rounded-xl bg-gray-50/50 dark:bg-slate-950/40 p-3 border border-gray-100 dark:border-slate-850">
                  <span className="text-[9.5px] text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Hạn cuối thanh toán" : "Payment Due Date"}</span>
                  <span className="text-red-500 font-bold font-mono">{foundBill.dueDateString}</span>
                </div>
              </div>

              {/* Total amount to pay */}
              <div className="rounded-xl border border-dashed border-gray-150 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Tổng dư nợ cần đóng" : "Outstanding Amount Pending"}</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-450 tracking-tight font-mono">{foundBill.amount.toLocaleString("vi-VN")}đ</span>
                </div>

                {!foundBill.isPaid && (
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                    <span className="text-[11px] text-gray-650 font-bold">{language === "vi" ? "Vui lòng trả trước hạn!" : "Settle before overdue!"}</span>
                  </div>
                )}
              </div>

              {/* Payment selection & pay button if bill is unpaid */}
              {!foundBill.isPaid ? (
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">{language === "vi" ? "Chọn Cổng Thanh Toán" : "Support Gateways"}</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        id="bill-pay-vinapay"
                        onClick={() => setPaymentMethod("ví_vinapay")}
                        className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "ví_vinapay"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                            : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Wallet className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold">{language === "vi" ? "Ví VinaPay" : "VinaPay Wallet"}</div>
                          <div className="text-[9px] text-emerald-600 font-medium">{language === "vi" ? "Chiết khấu 1.5%" : "Save 1.5% commission"}</div>
                        </div>
                      </button>

                      <button
                        id="bill-pay-transfer"
                        onClick={() => setPaymentMethod("chuyển_khoản")}
                        className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "chuyển_khoản"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                            : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <CreditCard className="h-4 w-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold">{language === "vi" ? "Chuyển Khoản QR" : "QR Transfer"}</div>
                          <div className="text-[9px] text-gray-400">{language === "vi" ? "VietQR liên ngân hàng" : "Instant Bank QR"}</div>
                        </div>
                      </button>

                      <button
                        id="bill-pay-atm"
                        onClick={() => setPaymentMethod("thẻ_atm")}
                        className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "thẻ_atm"
                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500"
                            : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Banknote className="h-4 w-4 text-gray-600 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold">{language === "vi" ? "Thẻ ATM Napas" : "Napas ATM Card"}</div>
                          <div className="text-[9px] text-gray-400">{language === "vi" ? "Khấu trừ tài khoản" : "Direct debit account"}</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Submit pay bill */}
                  <button
                    id="submit-pay-bill-btn"
                    onClick={handlePayBill}
                    disabled={isPaying}
                    className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm tracking-wide shadow-lg uppercase transition-all duration-250 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{language === "vi" ? "Đang xử lý thanh toán..." : "Settling security transactions..."}</span>
                      </>
                    ) : (
                      <>
                        <Landmark className="h-4 w-4" />
                        <span>
                          {language === "vi" 
                            ? `Xác nhận thanh toán ${foundBill.amount.toLocaleString("vi-VN")}đ`
                            : `Confirm Payment of ${foundBill.amount.toLocaleString("vi-VN")}đ`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 dark:border-emerald-950/40 p-4 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-2" id="bill-already-paid">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>{language === "vi" ? "Cám ơn bạn! Hóa đơn này đã được kiểm định hạch toán thanh toán hoàn tất." : "Thank you! This invoice has been marked fully paid and verified."}</span>
                </div>
              )}
            </div>
          )}

          {/* Standard background before search */}
          {!searchAttempted && !paymentSuccess && (
            <div className="rounded-2xl border-2 border-dashed border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/20 p-12 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in" id="intro-lookups">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-slate-905 text-emerald-600 shadow-sm">
                <Search className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{language === "vi" ? "Chưa tra cứu hóa đơn sinh hoạt" : "No active billing lookup"}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                  {language === "vi" 
                    ? "Hãy chọn dịch vụ thanh toán ở bên trái, nhập mã khách hàng để hạch toán kiểm tra trạng thái dư nợ của gia đình bạn."
                    : "Select a utility service category on the left, then input your contract customer ID to scan pending debts."}
                </p>
              </div>

              {/* Quick tip card */}
              <div className="rounded-xl border border-amber-100 dark:border-amber-950/40 bg-amber-50/20 dark:bg-amber-950/5 p-3 text-left max-w-md text-[11px] text-amber-800 dark:text-amber-400 mt-2 flex gap-2 items-start shadow-sm shadow-amber-500/5 hover:border-amber-400 transition-all duration-300" id="bills-quick-tip">
                <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block uppercase tracking-wide">{language === "vi" ? "Khuyến nghị thanh toán:" : "Overdue Penalties Advisory:"}</span>
                  {language === "vi" 
                    ? "Các hóa đơn trễ hạn quá 15 ngày có nguy cơ bị nhà mạng/EVN tạm ngưng cung cấp phục vụ. Sử dụng ví VinaPay luôn đảm bảo việc gia đình vận hành thông suốt."
                    : "Unpaid dues exceeding 15 days are subjected to service suspension blocks by EVN and water operators. Keep family spaces running smoothly with automated smart billing."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
