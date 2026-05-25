import { ShoppingBag, Landmark, Sparkles, Receipt, BarChart3, ShoppingCart, Sun, Moon, Languages } from "lucide-react";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
}

export default function Navbar({ activeTab, setActiveTab, cartCount }: NavbarProps) {
  const { theme, language, toggleTheme, setLanguage, t } = useThemeLanguage();

  const tabs = [
    { id: "store", labelKey: "nav.store", icon: ShoppingBag },
    { id: "bills", labelKey: "nav.bills", icon: Landmark },
    { id: "ai", labelKey: "nav.ai", icon: Sparkles },
    { id: "stats", labelKey: "nav.stats", icon: BarChart3 },
    { id: "history", labelKey: "nav.history", icon: Receipt },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("store")}
          className="flex cursor-pointer items-center space-x-2"
          id="brand-logo"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-200 dark:shadow-none">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              VinaMart Super
            </h1>
            <p className="text-[10px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
              {t("brand.sub")}
            </p>
          </div>
        </div>

        {/* Desktop Tabs Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" id="desktop-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/75 dark:bg-emerald-950/40" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`} />
                <span>{t(tab.labelKey)}</span>
                {tab.id === "ai" && (
                  <span className="absolute -top-1 right-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tool actions: Language, Theme, Cart */}
        <div className="flex items-center space-x-2.5" id="nav-actions">
          
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
            title="Switch Language / Chọn ngôn ngữ"
            id="lang-switcher"
            className="flex h-11 px-3 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-bold text-xs gap-1.5 cursor-pointer"
          >
            <Languages className="h-4 w-4 text-emerald-600" />
            <span className="font-mono tracking-wider">{language.toUpperCase()}</span>
          </button>

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            id="theme-toggler"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-indigo-500" />
            ) : (
              <Sun className="h-5 w-5 text-amber-400 animate-pulse" />
            )}
          </button>

          {/* Cart Trigger */}
          <button
            id="cart-trigger"
            onClick={() => setActiveTab("cart")}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
              activeTab === "cart"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:border-emerald-600 dark:hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sticky Tab bar (includes inline translation) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2.5 z-40 shadow-lg px-2 text-gray-700 dark:text-gray-200 transition-colors duration-200">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 transition-all ${
                  isActive ? "text-emerald-600 dark:text-emerald-400 scale-105" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{t(tab.labelKey).split(" ")[0]}</span>
              </button>
            );
          })}
          {/* Mobile Cart tab */}
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex flex-col items-center space-y-1 relative transition-all ${
              activeTab === "cart" ? "text-emerald-600 dark:text-emerald-400 scale-105" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-[10px] font-semibold">{t("nav.cart")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
