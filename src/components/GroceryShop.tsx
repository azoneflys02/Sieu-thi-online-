import { useState, useMemo } from "react";
import { Search, Plus, Minus, Star, Flame, ShieldCheck } from "lucide-react";
import { Product } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface GroceryShopProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onRemoveFromCart: (product: Product) => void;
  cartCountById: (id: string) => number;
}

const CATEGORIES = [
  "Tất cả",
  "Rau củ",
  "Thịt trứng",
  "Sữa bơ",
  "Trái cây",
  "Gia vị gạo",
  "Sản phẩm khô",
  "Bánh ngọt"
];

export default function GroceryShop({
  products,
  onAddToCart,
  onRemoveFromCart,
  cartCountById,
}: GroceryShopProps) {
  const { theme, language, t } = useThemeLanguage();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === "Tất cả" || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Translate category values dynamically
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "Tất cả": return t("store.all");
      case "Rau củ": return t("store.vegetables");
      case "Thịt trứng": return t("store.meat_eggs");
      case "Sữa bơ": return t("store.dairy");
      case "Trái cây": return t("store.fruits");
      case "Gia vị gạo": return t("store.rice_spices");
      case "Sản phẩm khô": return t("store.dry_goods");
      case "Bánh ngọt": return t("store.bakery");
      default: return cat;
    }
  };

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

  return (
    <div className="space-y-8" id="grocery-shop">
      {/* Dynamic Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white shadow-xl shadow-emerald-50 dark:shadow-none md:p-12 animate-fade-in"
        id="shop-hero-banner"
      >
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md">
            <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>{language === "vi" ? "Mừng khai trương giảm giá 20% toàn siêu thị" : "Grand Opening: Flat 20% discount on groceries"}</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
            {language === "vi" ? (
              <>
                Đi chợ tươi ngon <br/>
                An tâm <span className="underline decoration-amber-400 decoration-wavy underline-offset-4">mỗi ngày</span>
              </>
            ) : (
              <>
                Freshly Handpicked <br/>
                Delivered <span className="underline decoration-amber-400 decoration-wavy underline-offset-4">Today</span>
              </>
            )}
          </h2>
          <p className="text-sm font-medium text-emerald-100/90 leading-relaxed max-w-md">
            {t("store.desc")}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-emerald-50">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>{language === "vi" ? "Chuẩn sạch VietGAP" : "Certificated VietGAP Clean"}</span>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-300"></div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-emerald-300 fill-emerald-300" />
              <span>{language === "vi" ? "Giao nhanh 2h mọi chung cư" : "Super fast 2 hours flat delivery"}</span>
            </div>
          </div>
        </div>

        {/* Abstract Background patterns */}
        <div className="absolute right-0 top-0 hidden h-full w-1/2 opacity-25 md:block">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-emerald-500/40 blur-3xl"></div>
          <div className="absolute right-12 bottom-0 h-48 w-48 rounded-full bg-teal-400/35 blur-3xl"></div>
        </div>
      </div>

      {/* Control bar / Category pills + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" id="shop-controls">
        {/* Category Carousel / Pills */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" id="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-pill-${cat.replace(/\s+/g, "-")}`}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-150 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Search input bar */}
        <div className="relative w-full max-w-xs sm:w-64" id="search-box">
          <input
            type="text"
            placeholder={t("store.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Main product mesh */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/20 p-12 text-center" id="empty-results">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{t("store.no_products")}</h3>
        </div>
      ) : (
        <div 
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4"
          id="product-grid"
        >
          {filteredProducts.map((p) => {
            const count = cartCountById(p.id);
            return (
              <div
                key={p.id}
                id={`product-card-${p.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-250/70 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-all duration-300 hover:border-emerald-400 hover:shadow-xl dark:hover:border-emerald-400/50 hover:shadow-emerald-500/5"
              >
                {/* Hot Tag */}
                <div className="absolute left-2.5 top-2.5 z-10 flex items-center justify-between pointer-events-none">
                  {p.price > 80000 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                      Hot Deal
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-950 relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {count > 0 && (
                    <div className="absolute inset-0 bg-emerald-900/10 pointer-events-none transition-opacity duration-300" />
                  )}
                </div>

                {/* Card Content & Operations */}
                <div className="flex flex-1 flex-col p-3.5 sm:p-4 justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-450 block">
                      {getCategoryLabel(p.category)}
                    </span>
                    <h4 className="line-clamp-2 text-xs font-bold text-gray-800 dark:text-gray-150 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 min-h-[32px] leading-tight">
                      {p.name}
                    </h4>
                    <p className="text-[10.5px] font-semibold text-gray-400 dark:text-gray-550">
                      {language === "vi" ? "Đơn vị:" : "Unit:"} {getUnitLabel(p.unit)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-mono text-gray-900 dark:text-white block">
                        {p.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    {/* Counter or Standard button */}
                    {count > 0 ? (
                      <div className="flex items-center space-x-1.5 rounded-lg border border-emerald-100 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/25 p-1">
                        <button
                          id={`qt-minus-${p.id}`}
                          onClick={() => onRemoveFromCart(p)}
                          className="flex h-5 w-5 items-center justify-center rounded bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-sm hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[11px] font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                          {count}
                        </span>
                        <button
                          id={`qt-plus-${p.id}`}
                          onClick={() => onAddToCart(p)}
                          className="flex h-5 w-5 items-center justify-center rounded bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 shadow-sm hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`add-btn-${p.id}`}
                        onClick={() => onAddToCart(p)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none transition-transform duration-250 active:scale-90 hover:bg-emerald-700 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
