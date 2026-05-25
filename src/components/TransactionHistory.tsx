import { Receipt, Landmark, Calendar, Printer, CheckCircle2, ShoppingCart } from "lucide-react";
import { PaymentTransaction } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface TransactionHistoryProps {
  transactions: PaymentTransaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { theme, language, t } = useThemeLanguage();

  const handlePrintTransaction = (tx: PaymentTransaction) => {
    window.print();
  };

  const getBillTypeLabel = (type?: string) => {
    if (!type) return "";
    switch (type) {
      case "điện": return t("bills.electricity");
      case "nước": return t("bills.water");
      case "internet": return t("bills.internet");
      case "chung_cư": return t("bills.apartment");
      case "truyền_hình": return t("bills.tv");
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="transaction-history-view">
      {/* Header card */}
      <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-emerald-600" />
          <span>{t("history.title")}</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === "vi" 
            ? "Xem lại toàn bộ lịch sử hóa đơn dịch vụ sinh hoạt và hóa đơn đi chợ trực tuyến đã đóng tại hệ thống VinaMart."
            : "Review active utility settlements and supermarket grocery orders successfully settled at VinaMart digital gateway."}
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/20 p-12 text-center text-gray-400 space-y-3" id="no-tx-history">
          <Calendar className="h-10 w-10 text-gray-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-gray-750 dark:text-slate-300">{language === "vi" ? "Chưa có giao dịch phát sinh" : "No pending transaction logs found"}</h4>
            <p className="text-[11px] text-gray-450 dark:text-gray-400 max-w-xs mx-auto">
              {language === "vi" 
                ? "Khi bạn thanh toán giỏ hàng nhu yếu phẩm hoặc đóng nợ điện nước, lịch sử sẽ lập tức lưu vết hóa đơn đỏ điện tử tại đây."
                : "Once you settle pending grocery carts or confirm utility bill balances, verified digital slips will register automatically here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tx-history-list">
          {transactions.map((tx) => {
            const isBill = !!tx.billId;
            return (
              <div
                key={tx.id}
                id={`tx-card-${tx.id}`}
                className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4 hover:border-emerald-250 dark:hover:border-emerald-500 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                      isBill ? "bg-amber-500" : "bg-emerald-600"
                    }`}>
                      {isBill ? <Landmark className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {isBill 
                          ? (language === "vi" ? `Thanh toán: Hóa đơn ${getBillTypeLabel(tx.billType)}` : `Settlement: ${getBillTypeLabel(tx.billType)} bill`)
                          : (language === "vi" ? "Hóa đơn Đi siêu thị" : "VinaMart Grocery Order")}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono font-bold">Ref: {tx.id}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{language === "vi" ? "Thành công" : "Settled"}</span>
                  </span>
                </div>

                {/* Sub info inside transaction */}
                <div className="grid grid-cols-2 gap-y-1 pb-3 text-[11px] text-gray-600 dark:text-gray-400 border-b border-gray-50 dark:border-slate-850 font-semibold">
                  <div>{language === "vi" ? "Người thụ hưởng:" : "Customer Name:"}</div>
                  <div className="text-right text-gray-900 dark:text-white font-bold">{tx.customerName || "Customer"}</div>
                  <div>{language === "vi" ? "Thời gian hạch toán:" : "Settlement Date:"}</div>
                  <div className="text-right font-mono font-bold">
                    {new Date(tx.timestamp).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")} {new Date(tx.timestamp).toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US")}
                  </div>
                  <div>{language === "vi" ? "Cổng giao dịch:" : "Gateway via:"}</div>
                  <div className="text-right capitalize">{tx.paymentMethod.replace("_", " ")}</div>
                </div>

                {/* Actions bottom */}
                <div className="flex items-center justify-between pt-1">
                  <div className="font-mono text-sm font-extrabold text-emerald-650 dark:text-emerald-450">
                    {tx.amount.toLocaleString("vi-VN")}đ
                  </div>

                  <button
                    id={`print-tx-btn-${tx.id}`}
                    onClick={() => handlePrintTransaction(tx)}
                    className="flex items-center space-x-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-800 px-2.5 py-1 rounded-lg hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>{language === "vi" ? "In chứng từ đỏ" : "Print Voucher Slips"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
