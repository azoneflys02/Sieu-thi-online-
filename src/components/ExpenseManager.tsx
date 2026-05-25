import { useState, FormEvent, useEffect } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingDown, TrendingUp, Sparkles, Award, 
  Square, CheckSquare, ShieldCheck 
} from "lucide-react";
import { ExpenseRecord } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface ExpenseManagerProps {
  expenses: ExpenseRecord[];
  activeBudget: number;
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#6366f1"];

export default function ExpenseManager({ expenses, activeBudget }: ExpenseManagerProps) {
  const { theme, language, t } = useThemeLanguage();

  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, text: "", checked: true, savedEst: "80.000đ" },
    { id: 2, text: "", checked: false, savedEst: "35.000đ" },
    { id: 3, text: "", checked: true, savedEst: "110.000đ" },
    { id: 4, text: "", checked: false, savedEst: "20.000đ" },
  ]);

  const [customGoal, setCustomGoal] = useState("");

  const handleToggleGoal = (id: number) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, checked: !g.checked } : g));
  };

  const handleAddGoal = (e: FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    setSavingsGoals(prev => [
      ...prev,
      { id: Date.now(), text: customGoal, checked: false, savedEst: "15.000đ" }
    ]);
    setCustomGoal("");
  };

  // Helper to translate default descriptions dynamically
  const getGoalText = (id: number, customText: string) => {
    if (language === "vi") {
      switch (id) {
        case 1: return "Bật điều hòa máy lạnh ở mức 26°C kết hợp quạt điện quay nhẹ";
        case 2: return "Không trữ thực phẩm quá tải trong xoong nồi tủ đông lạnh";
        case 3: return "Nhờ Trợ lý AI gợi ý set cơm 100k đi chợ đúng kế hoạch nhu yếu phẩm";
        case 4: return "Điều chỉnh vòi hoa sen áp suất nước tiết kiệm dòng Sawaco";
        default: return customText;
      }
    } else {
      switch (id) {
        case 1: return "Turn A/C thermostat to 26°C paired with low electric fan breezes";
        case 2: return "Avoid storing unorganized or excess items in cold storage spaces";
        case 3: return "Request AI suggestions for budget menus to check daily costs";
        case 4: return "Adjust water faucet valves to conserve Sawaco running pipelines";
        default: return customText;
      }
    }
  };

  // Calculations for budget versus active paid total
  const latestMonth = expenses[expenses.length - 1];
  const currentTotalExpense = latestMonth["Điện"] + latestMonth["Nước"] + latestMonth["Siêu thị"] + latestMonth["Khác"];
  const budgetUtilizationPercent = Math.min((currentTotalExpense / activeBudget) * 100, 100);

  // Pie chart breakdown data format
  const pieData = [
    { name: language === "vi" ? "Điện lực" : "EVN Electricity", value: latestMonth["Điện"] },
    { name: language === "vi" ? "Nước Sawaco" : "Sawaco Tap Water", value: latestMonth["Nước"] },
    { name: language === "vi" ? "Siêu thị hàng hóa" : "VinaMart Groceries", value: latestMonth["Siêu thị"] },
    { name: language === "vi" ? "Tiện ích & Khác" : "Broadband / Others", value: latestMonth["Khác"] },
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="expense-manager">
      
      {/* Total Budget tracker meter bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Budget Utilization */}
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">{t("stats.utilization")}</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight block mt-1.5 font-mono">
                {currentTotalExpense.toLocaleString("vi-VN")}đ <span className="text-sm font-medium text-gray-400">/ {activeBudget.toLocaleString("vi-VN")}đ</span>
              </span>
            </div>
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${
              currentTotalExpense < activeBudget ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400"
            }`}>
              {currentTotalExpense < activeBudget ? (
                <>
                  <TrendingDown className="h-4 w-4" />
                  <span>{language === "vi" ? `Dưới hạn mức (+${(activeBudget - currentTotalExpense).toLocaleString("vi-VN")}đ)` : `Under Limit (+${(activeBudget - currentTotalExpense).toLocaleString("vi-VN")}đ)`}</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>{language === "vi" ? `Vượt hạn mức! (-${(currentTotalExpense - activeBudget).toLocaleString("vi-VN")}đ)` : `Exceeded Limit! (-${(currentTotalExpense - activeBudget).toLocaleString("vi-VN")}đ)`}</span>
                </>
              )}
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-slate-950 overflow-hidden relative">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilizationPercent > 90 ? "bg-red-500" : budgetUtilizationPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${budgetUtilizationPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500">
              <span>0%</span>
              <span>{budgetUtilizationPercent.toFixed(1)}% {language === "vi" ? "ĐÃ CONTAINER CHỈ" : "USED"}</span>
              <span>100% {language === "vi" ? "NGÂN SÁCH" : "LIMIT"}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Savings */}
        <div className="rounded-2xl border border-teal-100 dark:border-teal-950/40 bg-teal-50/20 dark:bg-teal-950/10 p-5 space-y-3.5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 uppercase tracking-widest block flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{t("stats.optimized")}</span>
            </span>
            <span className="text-2xl font-extrabold text-teal-950 dark:text-teal-400 tracking-tight block mt-1.5 font-mono">
              225.000đ
            </span>
            <p className="text-[11px] text-teal-850 dark:text-teal-500 leading-relaxed mt-1 font-semibold">
              {language === "vi"
                ? "Thành tích tuyệt vời! Nhờ hoàn thành các kiểm định bảo vệ môi trường và hạch toán đúng kế hoạch, bạn đã tiết kiệm tối ưu chi tiêu gia đình."
                : "Great accomplishment! By ticking active eco-friendly checklists, you have managed to reduce redundant home power and food waste costs."}
            </p>
          </div>
          <div className="text-[9.5px] font-bold text-teal-600 dark:text-teal-500 tracking-wider uppercase flex items-center gap-1 pt-1.5 border-t border-teal-100 dark:border-teal-950/50">
            <ShieldCheck className="h-4 w-4" />
            <span>{language === "vi" ? "Bảo chứng từ VinaMart AI" : "Verified by VinaMart AI"}</span>
          </div>
        </div>
      </div>

      {/* Recharts Graphic layouts split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Month bar expenditures comparisons */}
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("stats.history_title")}</h3>
            <p className="text-[10.5px] text-gray-400 dark:text-gray-500">{t("stats.history_desc")}</p>
          </div>

          <div className="h-64 sm:h-72 w-full text-[10px]" id="monthly-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#1e293b" : "#f3f4f6"} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={10.5} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10.5} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => `${value.toLocaleString("vi-VN")}đ`} 
                  contentStyle={
                    theme === "dark" 
                      ? { backgroundColor: "#0f172a", borderRadius: "12px", fontSize: "11px", border: "1px solid #334155", color: "#fff" }
                      : { borderRadius: "12px", fontSize: "11px", border: "1px solid #f3f4f6" }
                  }
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Điện" name={language === "vi" ? "Điện EVN" : "Electricity"} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nước" name={language === "vi" ? "Nước Sawaco" : "Water"} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Siêu thị" name={language === "vi" ? "Siêu thị" : "VinaMart"} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Piece distribution breakdowns */}
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t("stats.breakdown_title")}</h3>
            <p className="text-[10.5px] text-gray-400 dark:text-gray-500">{t("stats.breakdown_desc")}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="h-48 w-48 text-[11px]" id="proportion-pie-chart">
              <ResponsiveContainer width="100%" height="105%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value.toLocaleString("vi-VN")}đ`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Legends custom */}
            <div className="space-y-2.5 w-full sm:w-auto text-xs" id="pie-legends">
              {pieData.map((item, idx) => {
                const total = pieData.reduce((s, o) => s + o.value, 0);
                const percent = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center justify-between gap-10">
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="font-bold text-gray-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-550 font-mono font-bold">
                      {(percent).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Savings goals checklist box */}
      <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 shadow-sm space-y-5" id="savings-tracker-checklist">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("stats.goals")}</span>
            </h3>
            <p className="text-[10.5px] text-gray-400 dark:text-gray-500 mt-1">{t("stats.goals_desc")}</p>
          </div>

          {/* Goals form bento */}
          <form onSubmit={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              placeholder={language === "vi" ? "Thêm mục tiêu tiết kiệm riêng..." : "Add custom task item..."}
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-white outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              id="add-goal-submit"
              className="rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
            >
              {language === "vi" ? "Thêm" : "Add"}
            </button>
          </form>
        </div>

        {/* Lists of tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map((g) => {
            const labelText = getGoalText(g.id, g.text);
            return (
              <div
                key={g.id}
                onClick={() => handleToggleGoal(g.id)}
                className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  g.checked
                    ? "border-emerald-250 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10 text-emerald-950 dark:text-emerald-300"
                    : "border-gray-100 dark:border-slate-850 hover:bg-gray-50 dark:hover:bg-slate-850 text-gray-650 dark:text-slate-350"
                }`}
                id={`goal-row-${g.id}`}
              >
                <div className="flex items-start space-x-3 pr-2 select-none">
                  {g.checked ? (
                    <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
                  )}
                  <span className={`text-xs font-bold leading-tight ${g.checked ? "line-through text-gray-400 dark:text-gray-500 font-medium" : ""}`}>
                    {labelText}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    g.checked ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400" : "bg-gray-100 dark:bg-slate-950 text-gray-500 dark:text-gray-400"
                  }`}>
                    Est: -{g.savedEst}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
