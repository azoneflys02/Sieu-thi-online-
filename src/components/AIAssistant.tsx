import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Bot, User, ChefHat, BookOpen, Lightbulb, Flame, Plus, ShoppingCart
} from "lucide-react";
import { AIChatMessage, Product, CartItem } from "../types";
import { useThemeLanguage } from "../ThemeLanguageContext";

interface AIAssistantProps {
  products: Product[];
  onAddMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
  cart: CartItem[];
  expenses: any;
  onAddToast?: (msg: string) => void;
}

export default function AIAssistant({
  products,
  onAddMultipleToCart,
  cart,
  expenses,
  onAddToast,
}: AIAssistantProps) {
  const { theme, language, t } = useThemeLanguage();

  const getInitialMsgText = () => {
    if (language === "vi") {
      return "Xin chào! Tôi là Trợ lý Đi Chợ Thông Minh VinaMart AI. 🌟\n\nTôi có thể giúp bạn:\n1. Thiết kế thực đơn gia đình ngon mắt (kèm công thức chi tiết) và chuẩn bị nhanh nguyên liệu mua sắm.\n2. Tư vấn giải pháp giảm tải hóa đơn tiền điện, tiền nước hoặc tối ưu hóa tổng ngân sách đi chợ của bạn.\n\nHãy thử chọn các gợi ý bên dưới hoặc tự do nhập tin nhắn nhé!";
    } else {
      return "Hello there! I am your VinaMart AI Smart Shopping & Budgeting Assistant. 🌟\n\nI can assist you to:\n1. Design delicious family menus with step-by-step recipes and instantly populate ingredients into your shopping cart.\n2. Advise on reducing utility bills (electricity, water) or optimizing your overall grocery spendings.\n\nChoose from the prompts below or type your message!";
    }
  };

  const [messages, setMessages] = useState<AIChatMessage[]>([]);

  // Reset or initialize messages based on language
  useEffect(() => {
    setMessages([
      {
        id: "init",
        sender: "ai",
        text: getInitialMsgText(),
        timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [language]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clickable dynamic quick prompt action chips
  const quickPrompts = [
    { textVi: "Nấu Thịt Kho Tàu thơm ngon", textEn: "Recipe: Caramelized Braised Pork", type: "recipe", icon: ChefHat },
    { textVi: "Bữa ăn thanh đạm dưới 100k", textEn: "Wholesome lunch under 100k", type: "recipe", icon: Flame },
    { textVi: "Mẹo tiết kiệm điện máy lạnh", textEn: "Energy saving advice for A/C", type: "spending_advisor", icon: Lightbulb },
    { textVi: "Lên kế hoạch ăn dặm cho trẻ", textEn: "Nutritious baby weaning diet plan", type: "recipe", icon: BookOpen }
  ];

  // Logic to execute chat
  const handleSendMessage = async (textToSend: string, promptType: "general" | "recipe" | "spending_advisor" = "general") => {
    if (!textToSend.trim()) return;

    const userMsg: AIChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    const tempAiMsgId = "ai-loading-" + Date.now();
    const tempAiMsg: AIChatMessage = {
      id: tempAiMsgId,
      sender: "ai",
      isLoading: true,
      timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, tempAiMsg]);

    try {
      // Determine prompt type based on words
      let finalType = promptType;
      if (finalType === "general") {
        const lower = textToSend.toLowerCase();
        if (lower.includes("nấu") || lower.includes("món") || lower.includes("recipe") || lower.includes("thịt") || lower.includes("rau") || lower.includes("cơm") || lower.includes("cook") || lower.includes("dish")) {
          finalType = "recipe";
        } else if (lower.includes("tiết kiệm") || lower.includes("tiền") || lower.includes("hóa đơn") || lower.includes("giá") || lower.includes("chi tiêu") || lower.includes("save") || lower.includes("bill")) {
          finalType = "spending_advisor";
        }
      }

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          type: finalType,
          cart: cart.map(item => ({ name: item.product.name, qty: item.quantity, price: item.product.price })),
          expenses,
          lang: language
        })
      });

      const responseData = await response.json();

      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== tempAiMsgId));

      if (responseData.success) {
        if (finalType === "recipe" && responseData.recipeName) {
          // Success recipe response
          const aiMsg: AIChatMessage = {
            id: "ai-recipe-" + Date.now(),
            sender: "ai",
            timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }),
            recipePayload: {
              recipeName: responseData.recipeName,
              instructions: responseData.instructions,
              matchingProducts: responseData.matchingProducts,
              assistantSpeech: responseData.assistantSpeech
            }
          };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          // General Text advice
          const aiMsg: AIChatMessage = {
            id: "ai-text-" + Date.now(),
            sender: "ai",
            text: responseData.text,
            timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      } else {
        // Fallback offline suggestions
        const isThitKho = textToSend.toLowerCase().includes("kho") || textToSend.toLowerCase().includes("thịt") || textToSend.toLowerCase().includes("pork") || textToSend.toLowerCase().includes("brais");
        
        const aiMsg: AIChatMessage = {
          id: "ai-text-" + Date.now(),
          sender: "ai",
          timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" }),
          recipePayload: isThitKho ? {
            recipeName: language === "vi" ? "Thịt Kho Hột Vịt Nam Bộ" : "Vietnamese Southern Braised Pork with Eggs",
            assistantSpeech: language === "vi" 
              ? "Sau đây là danh sách nguyên liệu tươi tại VinaMart đã được chuẩn bị đầy đủ cho món Thịt Kho Hột Vịt truyền thống thơm ngọt bậm đà!"
              : "Here is the list of fresh VinaMart ingredients prepared for you to make outstanding caramelized braised pork with hardboiled eggs!",
            instructions: language === "vi" 
              ? "1. Ba rọi heo rửa sạch thái vuông cỡ lớn, ướp nước mắm, tiêu, hành tím băm và đường kính.\n2. Trứng gà ta luộc chín bóc vỏ dăm nhẹ.\n3. Đun nóng đường lấy màu cánh gián, cho thịt vào xào săn rồi đổ nước ấm vào kho nhỏ lửa.\n4. Cho trứng vào kho chung đến khi nước thịt béo sệt, màu vàng óng là hoàn hảo."
              : "1. Portion pork belly into thick bite-sized cubes, marinade with fish sauce, peppers, minced shallots, and sugar.\n2. Hardboil the fresh chicken eggs, then peel gently.\n3. Caramelize sugar in a pot, add marinated pork and seal the meat. Pour warm water and simmer on medium low.\n4. Slide in peeled eggs and cook until meat becomes tender and the broth glows honey-glazed amber.",
            matchingProducts: [
              { id: "3", name: "Thịt ba rọi heo CP 500g", quantityNeed: 1, note: language === "vi" ? "Thịt chuẩn tươi sạch" : "Grade-A certified pork belly" },
              { id: "6", name: "Trứng gà ta VietGAP hộp 10 quả", quantityNeed: 1, note: language === "vi" ? "Trứng luộc bùi ngậy" : "VietGAP country eggs" },
              { id: "8", name: "Nước mắm Nam Ngư Đệ Nhị 900ml", quantityNeed: 1, note: language === "vi" ? "Nêm nếm chuẩn vị Nam Bộ" : "Savory coastal fish sauce" }
            ]
          } : {
            recipeName: language === "vi" ? "Canh Chua Đậu Phụ Sốt Rau Củ" : "Organic Tomatoes & Bok Choy Vegetarian Stew",
            assistantSpeech: language === "vi"
              ? "Món này thanh ngọt nhẹ nhàng, đầy đủ vitamin từ rau củ hữu cơ tươi sạch của VinaMart, thích hợp cho bữa cơm tươi mát ngày hè!"
              : "A light, healthy vegan broth packed with rich vitamins from VinaMart handpicked organics. Ideal for comforting summer afternoons!",
            instructions: language === "vi"
              ? "1. Sơ chế xắt dăm rau cải thìa hữu cơ và cà chua tươi ngọt ngọt nước.\n2. Phi thơm hành tỏi dầu rồi cho cà chua băm nhuyễn vào tạo màu đỏ cam dấm chua nhẹ.\n3. Cho rau vào nấu sôi tầm 4-5 phút cho chín giòn mọng.\n4. Nêm nếm bột canh cá rắc kèm ngò tàu ăn chung cơm dẻo trắng ST25."
              : "1. Clean and chop the organic bok choy and ripe natural tomatoes.\n2. Sauté shallots in a pot, then toss in tomatoes to extract a delicious dynamic broth base.\n3. Drop in organic bok choy and boil for 4-5 minutes until mọng nước and crispy soft.\n4. Season with sea salt and serve along delicious ST25 fragrant white rice.",
            matchingProducts: [
              { id: "1", name: "Rau cải thìa hữu cơ 500g", quantityNeed: 1, note: language === "vi" ? "Rau cải mọng nước ngọt" : "Organic watery bok choy vegetables" },
              { id: "2", name: "Cà chua chín tự nhiên 1kg", quantityNeed: 1, note: language === "vi" ? "Chua dịu tự nhiên mọng" : "Glow ripe organic tomatoes" },
              { id: "7", name: "Gạo dẻo hương ST25 túi 5kg", quantityNeed: 1, note: language === "vi" ? "Cơm trắng dẻo mềm" : "Fragrant ST25 white rice" }
            ]
          }
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== tempAiMsgId));
      const errMsg: AIChatMessage = {
        id: "ai-error-" + Date.now(),
        sender: "ai",
        text: language === "vi"
          ? "Hiện máy chủ AI đang tăng tải nhẹ: " + err.message + ". Để trải nghiệm không gián đoạn, tôi gợi ý thực đơn Ba rọi heo và Trứng gà ta VietGAP sạch để nấu ăn ngon nhé!"
          : "AI Server is currently heavily loaded: " + err.message + ". We suggest trying cooking pork belly & fresh eggs options!",
        timestamp: new Date().toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action to insert multiple items into global cart
  const handleAddRecipeProductsToCart = (matchingProductsArray: Array<{ id: string; name: string; quantityNeed: number }>) => {
    const itemsToAdd = matchingProductsArray.map(m => {
      const realProduct = products.find(p => p.id === m.id);
      if (realProduct) {
        return { product: realProduct, quantity: m.quantityNeed };
      }
      return null;
    }).filter(Boolean) as Array<{ product: Product; quantity: number }>;

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      if (onAddToast) {
        onAddToast(
          language === "vi" 
            ? `Đã thêm thành công ${itemsToAdd.length} nguyên liệu nấu món vào giỏ hàng!`
            : `Successfully added ${itemsToAdd.length} organic ingredients to your cart!`
        );
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-14rem)] animate-fade-in" id="ai-assistant-container">
      {/* Sidebar: prompt suggestions list */}
      <div className="lg:col-span-1 space-y-4 hidden lg:block" id="ai-sidebar">
        <div className="rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm h-full flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span>{language === "vi" ? "Gợi ý nhanh" : "Sample Prompts"}</span>
            </h3>
            <div className="space-y-2">
              {quickPrompts.map((q, idx) => {
                const Icon = q.icon;
                const displayText = language === "vi" ? q.textVi : q.textEn;
                return (
                  <button
                    key={idx}
                    id={`quick-prompt-btn-${idx}`}
                    onClick={() => handleSendMessage(displayText, q.type as any)}
                    disabled={isLoading}
                    className="w-full flex items-start space-x-2.5 p-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-left text-xs font-bold text-gray-650 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:border-emerald-250 dark:hover:border-emerald-500 hover:text-emerald-950 dark:hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="line-clamp-2">{displayText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/25 p-4 border border-emerald-100 dark:border-emerald-900/30 text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400 space-y-1" id="ai-sidebar-disclaimer">
            <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-450" />
            <p className="font-bold">{language === "vi" ? "Gemini 2.5 Flash thông minh" : "Powered by Gemini AI"}</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {language === "vi"
                ? "Thấu hiểu từ sở thích nấu nướng của gia đình để thiết lập giỏ hàng có chi phí hợp lý nhất."
                : "Reads household shopping patterns to structure optimized cost-efficient menus dynamically."}
            </p>
          </div>
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="lg:col-span-3 flex flex-col rounded-2xl border border-gray-150 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden h-full" id="ai-chat-box">
        
        {/* Chat top info */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between" id="ai-chat-header">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
              <Bot className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">Smart VinaMart Assistant</h4>
              <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Online • Gemini-2.5-flash-latest</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message feed stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60 dark:bg-slate-950/40" id="ai-message-feed">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <div
                key={m.id}
                className={`flex gap-3.5 ${isAI ? "" : "flex-row-reverse"}`}
                id={`chat-msg-${m.id}`}
              >
                {/* Avatar */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                  isAI ? "bg-emerald-600 shadow-md shadow-emerald-50/50" : "bg-slate-650"
                }`}>
                  {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                {/* Bubble message body */}
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[70%]">
                  <span className={`text-[10px] font-bold text-gray-400 block ${isAI ? "" : "text-right"}`}>
                    {isAI ? "VINAMART AI" : language === "vi" ? "BẠN" : "YOU"} • {m.timestamp}
                  </span>

                  {m.isLoading ? (
                    <div className="rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 p-4 border border-gray-100 dark:border-slate-800 flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]"></div>
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]"></div>
                        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-600"></div>
                      </div>
                      <span className="text-xs text-gray-450 font-medium">
                        {language === "vi" ? "Đang nghiên cứu dữ liệu nấu ăn..." : "AI Assistant is thinking..."}
                      </span>
                    </div>
                  ) : (
                    <div className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed ${
                      isAI 
                        ? "rounded-tl-none bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-800 dark:text-slate-100" 
                        : "rounded-tr-none bg-emerald-600 text-white"
                    }`}>
                      
                      {m.text && (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      )}

                      {/* Customized parsed Recipe payload */}
                      {m.recipePayload && (
                        <div className="space-y-4" id={`recipe-${m.id}`}>
                          <div className="border-b border-dashed border-gray-200 dark:border-slate-800 pb-3">
                            <h5 className="flex items-center gap-1.5 font-bold text-sm text-gray-900 dark:text-white tracking-tight">
                              <ChefHat className="h-5 w-5 text-emerald-650" />
                              <span>{m.recipePayload.recipeName}</span>
                            </h5>
                            <p className="text-[11px] text-gray-500 italic mt-1 font-medium leading-relaxed">
                              "{m.recipePayload.assistantSpeech}"
                            </p>
                          </div>

                          <div className="space-y-1 text-gray-700 dark:text-slate-200 font-semibold text-[11px]" id="recipe-instructions">
                            <span className="font-bold text-gray-900 dark:text-white block uppercase tracking-wider text-[9.5px]">
                              {language === "vi" ? "Hướng dẫn cách nấu ăn:" : "Preparation Steps:"}
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed">{m.recipePayload.instructions}</p>
                          </div>

                          {/* Ingredient products shopping match cards */}
                          <div className="space-y-2.5 pt-2" id="recipe-products-list">
                            <span className="font-bold text-gray-900 dark:text-white block uppercase tracking-wider text-[9.5px]">
                              {language === "vi" ? "Thành phần nguyên liệu siêu thị khớp sẵn:" : "Matched supermarket fresh items:"}
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                              {m.recipePayload.matchingProducts.map((matchItem, idx) => {
                                const realProduct = products.find(p => p.id === matchItem.id);
                                return (
                                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 gap-3">
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      {realProduct ? (
                                        <img 
                                          src={realProduct.image} 
                                          alt={realProduct.name} 
                                          className="h-10 w-10 object-cover rounded-lg shrink-0 border border-gray-100 dark:border-slate-800"
                                          referrerPolicy="no-referrer"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 bg-emerald-105 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                          <ShoppingCart className="h-5 w-5" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <span className="font-bold text-gray-905 dark:text-white truncate block text-[11px]">
                                          {realProduct ? realProduct.name : matchItem.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                          {realProduct ? `${realProduct.price.toLocaleString("vi-VN")}đ / ${realProduct.unit}` : "Ready"}
                                        </span>
                                        {matchItem.note && (
                                          <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 block leading-tight font-medium">{matchItem.note}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Needed Quantity */}
                                    <div className="text-right shrink-0">
                                      <span className="inline-flex h-6 min-w-[24px] px-1.5 items-center justify-center bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold rounded-full font-mono">
                                        x{matchItem.quantityNeed}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* CTA buy recipe */}
                            <button
                              id={`buy-recipe-btn-${m.id}`}
                              onClick={() => handleAddRecipeProductsToCart(m.recipePayload!.matchingProducts)}
                              className="w-full flex items-center justify-center space-x-1.5 py-2.5 text-[11px] font-bold uppercase rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                              <span>
                                {language === "vi"
                                  ? `Thêm tất cả ${m.recipePayload.matchingProducts.length} nguyên liệu vào giỏ`
                                  : `Add all ${m.recipePayload.matchingProducts.length} ingredients to cart`}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form panel */}
        <div className="border-t border-gray-150 dark:border-slate-800 p-3 bg-white dark:bg-slate-900" id="ai-input-form-panel">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={language === "vi" 
                ? "Hỏi món ăn hoặc tư vấn: 'Thịt ba rọi kho hột vịt ta', 'Mẹo tiết kiệm điện máy lạnh'..." 
                : "Ask recipes or advice: 'Recipe for pork belly', 'How can I save electricity bill'..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950"
            />
            <button
              type="submit"
              id="send-chat-btn"
              disabled={!inputText.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
