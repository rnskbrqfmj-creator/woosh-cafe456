import React, { useState, useEffect } from 'react';
import { MENU_DATA } from '../data/menu';
import { InventoryItem, Order, OrderItem, MenuItem, SocialPost, ProductIdea, FeedbackItem, Goal, ESGItem } from '../types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
    Package, TrendingUp, AlertCircle, DollarSign, Leaf, Users, 
    Cloud, CloudRain, CloudSun, Upload, Download, Plus, Trash2, ShoppingCart, CheckCircle, Heart,
    Coffee, Camera, Utensils, MessageSquare, Target, Facebook, Instagram, Star, Send, RefreshCw, X, Loader2,
    Bell, Calendar, Clock, MapPin, ThumbsUp, ThumbsDown, Sparkles, History
} from './icons';
import { GoogleGenAI } from "@google/genai";

interface ToolsProps {
  activeTab: string;
  isGuest: boolean;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  // New props for modules
  posts?: SocialPost[];
  setPosts?: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  ideas?: ProductIdea[];
  setIdeas?: React.Dispatch<React.SetStateAction<ProductIdea[]>>;
  feedbacks?: FeedbackItem[];
  setFeedbacks?: React.Dispatch<React.SetStateAction<FeedbackItem[]>>;
  goals?: Goal[];
  setGoals?: React.Dispatch<React.SetStateAction<Goal[]>>;
  esgItems?: ESGItem[];
  setEsgItems?: React.Dispatch<React.SetStateAction<ESGItem[]>>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// WMO Weather Codes Interpretation
const getWeatherDesc = (code: number): { desc: string; advice: string } => {
    switch (code) {
        case 0: return { desc: "晴朗無雲", advice: "天氣很好，戶外座位區可以多加利用！" };
        case 1: case 2: case 3: return { desc: "多雲時晴", advice: "舒適的天氣，預計人流穩定。" };
        case 45: case 48: return { desc: "有霧/霧霾", advice: "能見度低，點亮門口燈光吸引過路客。" };
        case 51: case 53: case 55: return { desc: "毛毛雨", advice: "或許可以推播『雨天第二杯半價』活動。" };
        case 61: case 63: case 65: return { desc: "降雨", advice: "雨勢明顯，加強外送平台廣告投放。" };
        case 71: case 73: case 75: return { desc: "降雪", advice: "極端天氣，推出熱可可或熱湯暖客。" };
        case 80: case 81: case 82: return { desc: "雷陣雨", advice: "注意午後雷陣雨，提醒客人帶傘。" };
        case 95: case 96: case 99: return { desc: "雷雨/風暴", advice: "天氣惡劣，檢查門窗，注意外送員安全。" };
        default: return { desc: "多雲", advice: "天氣穩定。" };
    }
};

// Encouraging Quotes for the Manager
const ENCOURAGING_QUOTES = [
    "每一杯咖啡都是一次溫暖的傳遞。",
    "今天也是讓客人帶著笑容離開的一天！",
    "辛苦了！你的用心，客人都喝得出來。",
    "慢下來，品味經營的苦與甜。",
    "保持熱情，好事正在發生。",
    "今天的努力，是未來豐收的養分。"
];

export const Tools: React.FC<ToolsProps> = ({ 
    activeTab, isGuest, inventory, setInventory, orders, setOrders,
    posts = [], setPosts, ideas = [], setIdeas, feedbacks = [], setFeedbacks, goals = [], setGoals,
    esgItems = [], setEsgItems
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(MENU_DATA[0].title);
  
  // -- Guest Cart State --
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // -- Inventory Order Input State --
  const [restockInputs, setRestockInputs] = useState<{[key: string]: number}>({});

  // -- Weather State --
  const [weather, setWeather] = useState<{temp: number, code: number, desc: string, advice: string} | null>(null);

  // -- Modal States for Manual Inputs --
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [newIdea, setNewIdea] = useState({ name: '', notes: '' });
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);

  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ customer: '', rating: 5, comment: '' });
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', current: '', unit: '' });

  const [showAddEsg, setShowAddEsg] = useState(false);
  const [newEsg, setNewEsg] = useState({ name: '', score: 80 });

  // -- Social Media State --
  const [socialDraft, setSocialDraft] = useState("");
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);

  // -- Load Weather on Mount --
  useEffect(() => {
    if (!isGuest && activeTab === 'daily') {
        const fetchWeather = async (latitude: number, longitude: number) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
                const data = await res.json();
                
                // Map WMO codes
                const code = data.current_weather.weathercode;
                const info = getWeatherDesc(code);

                setWeather({
                    temp: data.current_weather.temperature,
                    code: code,
                    desc: info.desc,
                    advice: info.advice
                });
            } catch (e) {
                console.error("Weather fetch failed", e);
                // Fallback to offline mock
                setWeather({ temp: 24, code: 0, desc: "晴朗 (預設)", advice: "目前無法取得天氣，預設為晴天。" });
            }
        };

        // Yilan City coordinates (Woosh Cafe Location)
        const YILAN_LAT = 24.7570;
        const YILAN_LNG = 121.7530;

        // Try geolocation, fallback to Yilan
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeather(pos.coords.latitude, pos.coords.longitude);
            }, 
            (err) => {
                console.warn("Geolocation denied, using Yilan default", err);
                fetchWeather(YILAN_LAT, YILAN_LNG);
            }
        );
    }
  }, [isGuest, activeTab]);

  // -- CSV Helper Functions --
  const handleExportCSV = (data: any[], filename: string) => {
      if (!data || !data.length) return;
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
      const csvContent = "data:text/csv;charset=utf-8," + "\ufeff" + headers + "\n" + rows; // \ufeff for BOM/Chinese support
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>, setFunc: (data: any) => void) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const result = [];
          for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const currentLine = lines[i].split(',');
              const obj: any = {};
              for (let j = 0; j < headers.length; j++) {
                  let val: string | number = currentLine[j]?.trim();
                  // Simple type guessing
                  if (val !== '' && !isNaN(Number(val))) val = Number(val); 
                  obj[headers[j]] = val;
              }
              result.push(obj);
          }
          setFunc((prev: any) => [...prev, ...result]); // Append or replace based on logic
          alert("匯入成功！");
      };
      reader.readAsText(file);
  };

  // -- Manual Input & AI Handlers --
  const handleAddIdea = async () => {
    if (!newIdea.name) return;
    setIsGeneratingProduct(true);

    let recipe = "";
    let imageUrl = "";

    try {
        if (!process.env.API_KEY) {
            alert("錯誤：找不到 API Key，請檢查環境變數設定。");
            setIsGeneratingProduct(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // 1. Generate Recipe (Generally faster and more reliable)
        try {
            const recipePrompt = `Create a short, appealing recipe for a cafe item named "${newIdea.name}". Keep it concise: Ingredients list and 3 simple steps. Notes: ${newIdea.notes}`;
            const recipeResp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: recipePrompt
            });
            recipe = recipeResp.text || "無法生成食譜";
        } catch (textError) {
            console.error("Recipe generation failed", textError);
            recipe = "食譜生成失敗";
        }

        // 2. Generate Image (Heavier, wrap in separate try-catch so recipe is saved even if image fails)
        try {
            const imagePrompt = `A professional, high-quality, delicious food photography close-up shot of ${newIdea.name} in a cafe setting. ${newIdea.notes}`;
            const imageResp = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] },
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });
            
            // Extract image
            for (const part of imageResp.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }
        } catch (imageError) {
            console.error("Image generation failed", imageError);
            // We just proceed without an image
        }
        
        // Save result
        setIdeas?.(prev => [{ 
            id: Date.now().toString(), 
            name: newIdea.name, 
            stage: 'Idea', 
            notes: newIdea.notes,
            recipe: recipe,
            imageUrl: imageUrl
        }, ...prev]);

        setNewIdea({ name: '', notes: '' });
        setShowAddIdea(false);

    } catch (error) {
        console.error("AI Generation Critical Failure", error);
        alert("生成服務暫時無法使用，請稍後再試。");
    } finally {
        setIsGeneratingProduct(false);
    }
  };

  const handleGenerateSocialCopy = async () => {
      if (!socialDraft) {
          alert("請先輸入一些活動想法或關鍵字！");
          return;
      }
      setIsGeneratingSocial(true);
      try {
          if (process.env.API_KEY) {
              const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
              const prompt = `你是一位專業的社群小編。請根據以下想法寫一篇吸引人的咖啡廳社群貼文 (適用於 Facebook/Instagram)："${socialDraft}"。
              要求：
              1. 語氣親切、有活力，吸引顧客上門。
              2. 加入適當的 Emoji 表情符號。
              3. 文末加入 3-5 個熱門 Hashtag。
              4. 使用繁體中文。`;
              
              const resp = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: prompt
              });
              
              if (resp.text) {
                  setSocialDraft(resp.text);
              }
          }
      } catch (e) {
          console.error("Social generation failed", e);
          alert("AI 連線失敗，請稍後再試");
      } finally {
          setIsGeneratingSocial(false);
      }
  };

  const handlePublishSocialPost = () => {
      if (!socialDraft) return;
      const newPost: SocialPost = {
          id: Date.now().toString(),
          content: socialDraft,
          date: new Date().toLocaleString('zh-TW'),
          likes: 0,
          shares: 0,
          platform: 'IG' // Default to IG for now
      };
      setPosts?.(prev => [newPost, ...prev]);
      setSocialDraft(""); // Clear draft
      alert("貼文已發布並存入歷史紀錄！");
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.customer) return;
    setIsAnalyzingFeedback(true);
    
    let positivePoints: string[] = [];
    let negativePoints: string[] = [];
    let advice = "";

    try {
        if (process.env.API_KEY) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze this cafe customer review: "${newFeedback.comment}". 
            1. Extract specific positive points (pros) into a list.
            2. Extract specific negative points (cons) into a list.
            3. Provide 1 short sentence of actionable advice for the cafe owner based on the cons (or pros if no cons).
            Output format: JSON { "positivePoints": ["..."], "negativePoints": ["..."], "advice": "..." }`;
            
            const resp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const jsonText = resp.text || "{}";
            const result = JSON.parse(jsonText);
            positivePoints = result.positivePoints || [];
            negativePoints = result.negativePoints || [];
            advice = result.advice || '無法分析';
        }
    } catch (e) {
        console.error("Feedback analysis failed", e);
        advice = "AI 分析服務目前不可用";
    }

    setFeedbacks?.(prev => [{ 
        id: Date.now().toString(), 
        customer: newFeedback.customer, 
        rating: newFeedback.rating, 
        comment: newFeedback.comment, 
        date: new Date().toLocaleDateString('zh-TW'),
        positivePoints: positivePoints,
        negativePoints: negativePoints,
        advice: advice
    }, ...prev]);
    setNewFeedback({ customer: '', rating: 5, comment: '' });
    setIsAnalyzingFeedback(false);
    setShowAddFeedback(false);
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    setGoals?.(prev => [...prev, { 
        id: Date.now().toString(), 
        title: newGoal.title, 
        target: Number(newGoal.target), 
        current: Number(newGoal.current), 
        unit: newGoal.unit 
    }]);
    setNewGoal({ title: '', target: '', current: '', unit: '' });
    setShowAddGoal(false);
  };

  const handleAddEsg = () => {
      if (!newEsg.name) return;
      setEsgItems?.(prev => [...prev, {
          id: Date.now().toString(),
          name: newEsg.name,
          score: Number(newEsg.score),
          fullMark: 100
      }]);
      setNewEsg({ name: '', score: 80 });
      setShowAddEsg(false);
  };

  // -- Guest Functions --
  const addToCart = (item: MenuItem) => {
      if (typeof item.price !== 'number') return;
      setCart(prev => {
          const existing = prev.find(i => i.name === item.name);
          if (existing) {
              return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { name: item.name, price: item.price as number, quantity: 1 }];
      });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
      if (cart.length === 0) return;
      
      const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9),
          items: [...cart],
          total: cartTotal,
          timestamp: new Date(),
          status: 'Pending'
      };

      setOrders(prev => [newOrder, ...prev]);
      setCart([]);
      setIsCheckoutModalOpen(false);
      setCheckoutComplete(true);
      setTimeout(() => setCheckoutComplete(false), 5000);
  };

  // -- Skeleton Visual for Empty States --
  const SkeletonOverlay = ({ children, title, onClick, buttonText }: { children?: React.ReactNode, title: string, onClick?: () => void, buttonText?: string }) => (
    <div className="relative rounded-2xl overflow-hidden border border-[#78350f]/10 bg-white group">
        {/* Directly visible content, slightly faded to imply it's just a preview */}
        <div className="pointer-events-none select-none opacity-70 transition-opacity group-hover:opacity-50"> 
            {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/5 backdrop-blur-[1px]"> 
             <div className="bg-white/95 p-6 rounded-2xl shadow-xl border border-stone-100 text-center space-y-3">
                 <p className="font-bold text-stone-600">{title}</p>
                 <p className="text-xs text-stone-400">目前尚無數據，背景為範例預覽</p>
                 {onClick && (
                    <button onClick={onClick} className="flex items-center gap-2 px-6 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm shadow-md transition-all transform hover:scale-105 mx-auto">
                        <Plus size={16} /> {buttonText}
                    </button>
                 )}
             </div>
        </div>
    </div>
  );

  const EmptyState = ({ message, onClick, buttonText }: { message: string, onClick?: () => void, buttonText?: string }) => (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
          <p className="text-stone-400 mb-4">{message}</p>
          {onClick && (
              <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm transition-colors">
                  <Plus size={16} /> {buttonText}
              </button>
          )}
      </div>
  );

  // -- GUEST VIEW: MENU --
  if (isGuest && activeTab === 'menu') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-12 animate-fade-in pb-24">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-3xl font-serif font-bold text-stone-800">WOOSH CAFE</h2>
          <p className="text-stone-500 italic">讓時間慢下來的咖啡角落</p>
        </div>

        {/* Categories */}
        {MENU_DATA.map((category, idx) => (
          <section key={idx} className="space-y-6">
            <h3 className="text-xl font-bold border-b border-stone-200 pb-2 text-stone-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#b45309] rounded-full"></span>
              {category.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className={`flex justify-between items-start group p-2 rounded-lg hover:bg-stone-100 transition-colors ${item.soldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-1">
                    <div className="font-medium text-stone-800 flex items-center gap-2">
                      {item.name}
                      {item.soldOut && <span className="text-xs bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded">售完</span>}
                    </div>
                    {item.description && <div className="text-xs text-stone-500">{item.description}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-serif font-bold text-stone-600">
                        {typeof item.price === 'number' ? `$${item.price}` : item.price}
                    </span>
                    {typeof item.price === 'number' && !item.soldOut && (
                        <button 
                            onClick={() => addToCart(item)}
                            className="text-xs bg-[#b45309] text-white px-2 py-1 rounded hover:bg-[#92400e] transition-colors"
                        >
                            + 加入
                        </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        
        {/* Floating Cart Button */}
        {cart.length > 0 && (
            <div className="fixed bottom-20 md:bottom-10 right-6 z-40">
                <button 
                    onClick={() => setIsCheckoutModalOpen(true)}
                    className="flex items-center gap-3 bg-stone-800 text-white px-6 py-4 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                    <div className="relative">
                        <ShoppingCart size={24} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {cart.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                    </div>
                    <span className="font-bold text-lg">${cartTotal}</span>
                </button>
            </div>
        )}

        {/* Checkout Modal */}
        {isCheckoutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShoppingCart size={20} /> 您的點單
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-2 mb-4 border-t border-b py-2">
                        {cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg mb-6 text-[#b45309]">
                        <span>總計</span>
                        <span>${cartTotal}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-3 text-stone-500 hover:bg-stone-100 rounded-xl">再看看</button>
                        <button onClick={handleCheckout} className="flex-1 py-3 bg-[#b45309] text-white rounded-xl hover:bg-[#92400e]">確認點餐</button>
                    </div>
                </div>
            </div>
        )}

        {/* Success Modal */}
        {checkoutComplete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center space-y-4 animate-scale-in">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-stone-800">點餐成功！</h3>
                    <p className="text-stone-500">
                        請至櫃檯結帳付款。<br/>
                        您的訂單已傳送至店長系統。
                    </p>
                    <button onClick={() => setCheckoutComplete(false)} className="w-full py-2 bg-stone-100 text-stone-600 rounded-lg">關閉</button>
                </div>
            </div>
        )}

        <div className="text-center text-xs text-stone-400 mt-12 pb-8">
          - 內用低消一杯飲品，禁帶外食 -
        </div>
      </div>
    );
  }

  // -- MANAGER VIEW: MENU PROFIT ANALYSIS --
  if (!isGuest && activeTab === 'menu') {
    const currentCategory = MENU_DATA.find(c => c.title === selectedCategory) || MENU_DATA[0];
    const categoryData = currentCategory.items
        .filter(item => typeof item.price === 'number')
        .map(item => ({
            name: item.name,
            price: item.price as number,
            cost: Math.floor((item.price as number) * 0.35) // Mock cost
        }));

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-[#78350f]">菜單獲利分析</h2>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {MENU_DATA.map((cat, i) => (
                    <button 
                        key={i}
                        onClick={() => setSelectedCategory(cat.title)}
                        className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                            selectedCategory === cat.title 
                            ? 'bg-[#b45309] text-white' 
                            : 'bg-white border border-[#b45309]/20 text-[#78350f] hover:bg-[#b45309]/5'
                        }`}
                    >
                        {cat.title.split(' ')[0]}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
              <div className="text-sm text-gray-500 mb-1">類別平均毛利</div>
              <div className="text-3xl font-bold text-[#3f6212]">65%</div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
              <div className="text-sm text-gray-500 mb-1">該類別品項數</div>
              <div className="text-3xl font-bold text-[#b45309]">{currentCategory.items.length} 項</div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
              <div className="text-sm text-gray-500 mb-1">熱銷潛力</div>
              <div className="text-3xl font-bold text-blue-600">High</div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10 h-[300px] md:h-[500px]">
            <h3 className="font-bold text-[#78350f] mb-4">{selectedCategory}：售價 vs 成本結構</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="cost" stackId="a" fill="#d6d3d1" name="估算成本" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="price" stackId="a" fill="#b45309" name="售價毛利" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // -- MANAGER VIEW: DAILY --
  if (!isGuest && activeTab === 'daily') {
      const quote = ENCOURAGING_QUOTES[new Date().getDate() % ENCOURAGING_QUOTES.length];
      
      const criticalInventory = inventory.filter(i => i.status === 'Critical');
      const warningInventory = inventory.filter(i => i.status === 'Warning');
      const pendingOrders = orders.filter(o => o.status === 'Pending');

      return (
          <div className="p-4 md:p-6 space-y-8">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#78350f] mb-2 flex items-center gap-2">
                        早安，店長！ 
                        <span className="text-sm font-normal bg-[#ecfccb] text-[#3f6212] px-2 py-1 rounded-full flex items-center gap-1">
                            <Clock size={14} /> 營業中
                        </span>
                    </h2>
                    <p className="text-[#78350f]/70 flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  
                  {/* Real Weather Widget (Yilan) */}
                  <div className="w-full md:w-auto bg-white px-6 py-4 rounded-2xl shadow-sm border border-[#78350f]/10">
                      {weather ? (
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                                <div className="text-4xl">
                                    {weather.code <= 3 ? <CloudSun className="text-yellow-500" /> : <CloudRain className="text-blue-500" />}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        {weather.temp}°C 
                                        <span className="text-base font-normal text-stone-500">宜蘭市</span>
                                    </div>
                                    <div className="text-sm text-gray-500">{weather.desc}</div>
                                </div>
                             </div>
                             <div className="bg-[#b45309]/5 p-3 rounded-lg border border-[#b45309]/20 text-sm text-[#78350f]">
                                <span className="font-bold">💡 經營建議：</span> {weather.advice}
                             </div>
                          </div>
                      ) : (
                          <div className="flex items-center gap-2 text-stone-400">
                             <Loader2 className="animate-spin" size={20} />
                             載入天氣資訊中...
                          </div>
                      )}
                  </div>
              </header>

              {/* Quote of the Day */}
              <div className="bg-gradient-to-r from-[#b45309] to-[#92400e] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <Heart className="absolute -top-4 -right-4 text-white/10 w-32 h-32 transform rotate-12" />
                  <div className="relative z-10">
                      <h3 className="font-serif font-bold text-lg mb-2 flex items-center gap-2">
                          <Coffee size={18} /> 給店長的一句話
                      </h3>
                      <p className="text-xl font-light italic">"{quote}"</p>
                  </div>
              </div>

              {/* Action Items List */}
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#78350f] flex items-center gap-2">
                      <Bell size={20} /> 今日待辦與提醒
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* 1. Critical Inventory Alert */}
                      {criticalInventory.length > 0 && (
                          <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex flex-col justify-between">
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                      <AlertCircle size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-red-800">緊急補貨提醒</h4>
                                      <p className="text-sm text-red-600 mt-1">有 {criticalInventory.length} 項商品庫存過低，請立即處理。</p>
                                  </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-red-100/50">
                                  <ul className="text-sm text-red-700 space-y-1 mb-3">
                                      {criticalInventory.slice(0, 3).map(item => (
                                          <li key={item.id}>• {item.name} (剩 {item.quantity}{item.unit})</li>
                                      ))}
                                      {criticalInventory.length > 3 && <li>...等 {criticalInventory.length - 3} 項</li>}
                                  </ul>
                              </div>
                          </div>
                      )}

                      {/* 2. Pending Orders Alert */}
                      {pendingOrders.length > 0 ? (
                          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 flex flex-col justify-between">
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                                      <ShoppingCart size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-yellow-800">有待結帳訂單</h4>
                                      <p className="text-sm text-yellow-700 mt-1">來自訪客模式的即時訂單</p>
                                  </div>
                              </div>
                              <div className="mt-4 text-3xl font-bold text-yellow-800">
                                  {pendingOrders.length} <span className="text-sm font-normal text-yellow-600">筆</span>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 flex flex-col justify-between opacity-70">
                               <div className="flex items-start gap-3">
                                  <div className="p-2 bg-stone-200 rounded-lg text-stone-500">
                                      <CheckCircle size={20} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-stone-600">目前無待處理訂單</h4>
                                      <p className="text-sm text-stone-400 mt-1">櫃檯狀況良好</p>
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* 3. Routine Tasks */}
                      <div className="bg-white p-5 rounded-xl border border-[#78350f]/10 shadow-sm flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-[#ecfccb] rounded-lg text-[#3f6212]">
                                  <CheckCircle size={20} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-[#3f6212]">每日例行檢查</h4>
                                  <p className="text-sm text-[#3f6212]/70 mt-1">開店前/中準備事項</p>
                              </div>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-stone-600">
                              <li className="flex items-center gap-2">
                                  <input type="checkbox" className="accent-[#b45309]" /> 咖啡機壓力校正 (9 bar)
                              </li>
                              <li className="flex items-center gap-2">
                                  <input type="checkbox" className="accent-[#b45309]" /> 檢查收銀機零錢
                              </li>
                              <li className="flex items-center gap-2">
                                  <input type="checkbox" className="accent-[#b45309]" /> 確認 Google Maps 營業資訊
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // -- MANAGER VIEW: INVENTORY --
  if (!isGuest && activeTab === 'inventory') {
      const getAiSuggestion = (status: string) => {
          if (status === 'Critical') return 10;
          if (status === 'Warning') return 5;
          return 0;
      };

      const handleRestockChange = (id: string, val: string) => {
          setRestockInputs(prev => ({...prev, [id]: parseInt(val) || 0}));
      };

      const submitOrder = (id: string) => {
          alert(`已送出採購單：${restockInputs[id]} 單位`);
          setRestockInputs(prev => ({...prev, [id]: 0}));
      };

      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2">
                      <Package /> 庫存管理
                  </h2>
                  <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 text-sm">
                          <Upload size={16} />
                          匯入 CSV
                          <input type="file" accept=".csv" className="hidden" onChange={(e) => handleImportCSV(e, setInventory)} />
                      </label>
                      <button 
                        onClick={() => handleExportCSV(inventory, 'woosh_inventory')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                      >
                          <Download size={16} />
                          匯出 CSV
                      </button>
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#78350f]/10 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-stone-50 border-b border-stone-100">
                          <tr>
                              <th className="p-4 text-sm font-bold text-stone-600">品項名稱</th>
                              <th className="p-4 text-sm font-bold text-stone-600">當前數量</th>
                              <th className="p-4 text-sm font-bold text-stone-600">狀態</th>
                              <th className="p-4 text-sm font-bold text-blue-600 bg-blue-50/50">AI 建議補貨</th>
                              <th className="p-4 text-sm font-bold text-stone-600">實際叫貨</th>
                              <th className="p-4 text-sm font-bold text-stone-600 text-right">操作</th>
                          </tr>
                      </thead>
                      <tbody>
                          {inventory.map((item) => {
                              const suggestion = getAiSuggestion(item.status);
                              return (
                                  <tr key={item.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                                      <td className="p-4 font-medium text-stone-800">{item.name}</td>
                                      <td className="p-4 text-stone-600">{item.quantity} {item.unit}</td>
                                      <td className="p-4">
                                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                              item.status === 'Critical' ? 'bg-red-100 text-red-600' :
                                              item.status === 'Warning' ? 'bg-yellow-100 text-yellow-600' :
                                              'bg-green-100 text-green-600'
                                          }`}>
                                              {item.status === 'Critical' ? '緊急缺貨' : item.status === 'Warning' ? '庫存偏低' : '庫存正常'}
                                          </span>
                                      </td>
                                      <td className="p-4 bg-blue-50/30">
                                          {suggestion > 0 ? (
                                              <span className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                                                  <TrendingUp size={14} /> +{suggestion} {item.unit}
                                              </span>
                                          ) : <span className="text-stone-300">-</span>}
                                      </td>
                                      <td className="p-4">
                                          <div className="flex items-center gap-2">
                                              <input 
                                                  type="number" 
                                                  className="w-20 border border-stone-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#b45309]"
                                                  placeholder="數量"
                                                  value={restockInputs[item.id] || ''}
                                                  onChange={(e) => handleRestockChange(item.id, e.target.value)}
                                              />
                                              <button 
                                                  onClick={() => setRestockInputs(prev => ({...prev, [item.id]: suggestion}))}
                                                  className="text-xs text-blue-500 hover:text-blue-700 underline"
                                              >
                                                  自動填入
                                              </button>
                                          </div>
                                      </td>
                                      <td className="p-4 text-right">
                                          <button 
                                              onClick={() => submitOrder(item.id)}
                                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                                  (restockInputs[item.id] || 0) > 0 
                                                  ? 'bg-[#b45309] text-white hover:bg-[#92400e]' 
                                                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                              }`}
                                              disabled={(restockInputs[item.id] || 0) <= 0}
                                          >
                                              下單
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }

  // -- MANAGER VIEW: REVENUE --
  if (!isGuest && activeTab === 'revenue') {
      const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
      
      return (
          <div className="p-4 md:p-6 space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2">
                      <DollarSign /> 營收儀表板
                  </h2>
                  <button 
                        onClick={() => handleExportCSV(orders, 'woosh_orders')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                  >
                      <Download size={16} />
                      匯出訂單記錄
                  </button>
               </div>
               
               {orders.length === 0 ? (
                  <SkeletonOverlay title="營收儀表板範例">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
                               <h3 className="text-stone-500 mb-2">即時總營收</h3>
                               <p className="text-4xl font-bold text-[#b45309]">$28,450</p>
                               <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={14}/> 較昨日成長 12%</p>
                           </div>
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
                               <h3 className="text-stone-500 mb-2">訪客點單數 (待結帳)</h3>
                               <p className="text-4xl font-bold text-stone-800">8 筆</p>
                               <p className="text-sm text-stone-400 mt-2">來自訪客模式的即時數據</p>
                           </div>
                       </div>
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10 mt-6">
                            <h3 className="font-bold text-stone-800 mb-4">最新訂單明細 (來自訪客模式)</h3>
                            <div className="h-40 bg-stone-100 rounded-lg"></div>
                       </div>
                  </SkeletonOverlay>
               ) : (
                   <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
                            <h3 className="text-stone-500 mb-2">即時總營收</h3>
                            <p className="text-4xl font-bold text-[#b45309]">${totalRevenue.toLocaleString()}</p>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={14}/> 較昨日成長 12%</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
                            <h3 className="text-stone-500 mb-2">訪客點單數 (待結帳)</h3>
                            <p className="text-4xl font-bold text-stone-800">{orders.length} 筆</p>
                            <p className="text-sm text-stone-400 mt-2">來自訪客模式的即時數據</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#78350f]/10">
                        <h3 className="font-bold text-stone-800 mb-4">最新訂單明細 (來自訪客模式)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-stone-500">
                                    <tr>
                                        <th className="p-3">訂單編號</th>
                                        <th className="p-3">內容</th>
                                        <th className="p-3">金額</th>
                                        <th className="p-3">時間</th>
                                        <th className="p-3">狀態</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className="border-b border-stone-100">
                                            <td className="p-3 font-mono text-sm">#{order.id}</td>
                                            <td className="p-3 text-sm">{order.items.map(i => `${i.name}x${i.quantity}`).join(', ')}</td>
                                            <td className="p-3 font-bold">${order.total}</td>
                                            <td className="p-3 text-sm text-stone-500">{order.timestamp.toLocaleTimeString()}</td>
                                            <td className="p-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">待櫃檯付款</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                   </>
               )}
          </div>
      );
  }

  // -- MANAGER VIEW: ESG --
  if (!isGuest && activeTab === 'esg') {
      const mockEsgData = [
          { name: '不鏽鋼吸管使用率', score: 80, fullMark: 100 },
          { name: '咖啡渣回收率', score: 95, fullMark: 100 },
          { name: '在地食材比例', score: 60, fullMark: 100 },
          { name: '節能設備', score: 70, fullMark: 100 },
          { name: '無紙化交易', score: 50, fullMark: 100 },
      ];

      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2"><Leaf /> ESG 永續指標</h2>
                 <button 
                    onClick={() => setShowAddEsg(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                  >
                      <Plus size={16} /> 新增指標
                  </button>
              </div>

              {esgItems?.length === 0 ? (
                  <SkeletonOverlay title="永續發展指標範例" onClick={() => setShowAddEsg(true)} buttonText="新增 ESG 項目">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10 h-[300px] md:h-[400px] flex flex-col items-center justify-center">
                              <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockEsgData}>
                                      <PolarGrid />
                                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                      <Radar name="Woosh Cafe" dataKey="score" stroke="#3f6212" fill="#3f6212" fillOpacity={0.6} />
                                  </RadarChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="space-y-4">
                              <div className="bg-[#ecfccb] p-6 rounded-2xl">
                                  <h3 className="font-bold text-[#3f6212] mb-2">永續管理列表</h3>
                                  <ul className="list-disc list-inside space-y-2 text-[#3f6212]/80">
                                      <li>範例: 不鏽鋼吸管使用率 (80分)</li>
                                      <li>範例: 咖啡渣回收率 (95分)</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </SkeletonOverlay>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10 h-[300px] md:h-[400px] flex flex-col items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={esgItems}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                  <Radar name="Woosh Cafe" dataKey="score" stroke="#3f6212" fill="#3f6212" fillOpacity={0.6} />
                                  <Tooltip />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="space-y-4">
                          <div className="bg-[#ecfccb] p-6 rounded-2xl">
                              <h3 className="font-bold text-[#3f6212] mb-2">永續管理列表</h3>
                              <ul className="list-disc list-inside space-y-2 text-[#3f6212]/80">
                                  {esgItems?.map(item => (
                                      <li key={item.id}>{item.name}: {item.score} / 100</li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
              )}

              {/* Add ESG Modal */}
              {showAddEsg && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                          <button onClick={() => setShowAddEsg(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20} /></button>
                          <h3 className="text-xl font-bold mb-4 text-[#78350f]">新增 ESG 指標</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">指標名稱</label>
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newEsg.name}
                                    placeholder="例如：減塑達成率"
                                    onChange={(e) => setNewEsg({...newEsg, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">分數 (0-100)</label>
                                  <input 
                                    type="number" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newEsg.score}
                                    onChange={(e) => setNewEsg({...newEsg, score: Number(e.target.value)})}
                                  />
                              </div>
                              <button onClick={handleAddEsg} className="w-full bg-[#b45309] text-white py-3 rounded-xl font-bold hover:bg-[#92400e]">新增</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // -- MANAGER VIEW: SOCIAL MEDIA --
  if (!isGuest && activeTab === 'social') {
      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2"><Camera /> 社群小編</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Draft Area */}
                  <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10 space-y-4 h-full flex flex-col">
                      <div className="flex justify-between items-center">
                          <h3 className="font-bold text-stone-700">靈感草稿區</h3>
                          <button 
                            onClick={() => setSocialDraft("推廣燕麥奶拿鐵，強調健康與口感滑順，適合乳糖不耐症")}
                            className="text-xs text-[#b45309] hover:underline flex items-center gap-1"
                          >
                              <Sparkles size={12}/> 帶入範例
                          </button>
                      </div>
                      <textarea 
                          className="w-full flex-1 p-3 border rounded-xl focus:outline-none focus:border-[#b45309] min-h-[200px]"
                          placeholder="輸入活動想法，例如：新品上市、節日促銷..."
                          value={socialDraft}
                          onChange={(e) => setSocialDraft(e.target.value)}
                      ></textarea>
                      <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={handleGenerateSocialCopy}
                            disabled={isGeneratingSocial}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 shadow-sm"
                          >
                              {isGeneratingSocial ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
                              {isGeneratingSocial ? 'AI 生成中...' : 'AI 生成文案'}
                          </button>
                          {socialDraft && (
                              <button 
                                onClick={handlePublishSocialPost}
                                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 flex items-center gap-2 shadow-sm"
                              >
                                  <Send size={18} /> 發布至排程
                              </button>
                          )}
                      </div>
                  </div>

                  {/* History / Recent Posts */}
                  <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10 space-y-4 max-h-[600px] overflow-y-auto">
                      <h3 className="font-bold text-stone-700 flex items-center gap-2">
                          <History size={18}/> 歷史發布紀錄
                      </h3>
                      <div className="space-y-4">
                          {posts && posts.length > 0 ? (
                              posts.map(post => (
                                  <div key={post.id} className="border border-stone-100 rounded-xl p-4 hover:shadow-md transition-all bg-stone-50/30">
                                      <div className="flex justify-between items-start mb-3">
                                          <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${post.platform === 'IG' ? 'bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-blue-600'}`}>
                                              {post.platform === 'IG' ? <Instagram size={12} /> : <Facebook size={12} />}
                                              {post.platform}
                                          </div>
                                          <div className="text-xs text-stone-400 font-mono">{post.date}</div>
                                      </div>
                                      
                                      <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                                          {post.content}
                                      </div>
                                      
                                      <div className="mt-4 flex gap-4 text-xs font-bold text-stone-500 border-t border-stone-200/60 pt-3">
                                           <span className="flex items-center gap-1 hover:text-red-500 cursor-pointer"><Heart size={12} /> {post.likes} Likes</span>
                                           <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"><MessageSquare size={12} /> {post.shares} Comments</span>
                                      </div>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center text-stone-400 py-12 flex flex-col items-center">
                                  <div className="bg-stone-100 p-4 rounded-full mb-3"><Camera size={24} className="text-stone-300"/></div>
                                  <p>尚無貼文記錄</p>
                                  <p className="text-xs mt-1">產生的文案發布後將顯示於此</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // -- MANAGER VIEW: PRODUCT DEV --
  if (!isGuest && activeTab === 'product') {
      const getStageColor = (stage: string) => {
          if (stage === 'Idea') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          if (stage === 'Testing') return 'bg-blue-100 text-blue-800 border-blue-200';
          return 'bg-green-100 text-green-800 border-green-200';
      };

      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2"><Utensils /> 新品開發看板</h2>
                  <button 
                    onClick={() => setShowAddIdea(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                  >
                      <Plus size={16} /> 新增想法
                  </button>
              </div>
              
              {ideas && ideas.length === 0 ? (
                   <SkeletonOverlay title="新品開發看板範例" onClick={() => setShowAddIdea(true)} buttonText="新增想法">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                          {['Idea', 'Testing', 'Launch'].map(stage => (
                              <div key={stage} className="bg-stone-100/50 p-4 rounded-2xl min-w-[250px]">
                                  <h3 className="font-bold text-stone-600 mb-4 px-2">{stage === 'Idea' ? '靈感發想' : stage === 'Testing' ? '試做調整' : '準備上市'}</h3>
                                  <div className="space-y-3">
                                      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 h-24"></div>
                                      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 h-24"></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                   </SkeletonOverlay>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                      {['Idea', 'Testing', 'Launch'].map(stage => (
                          <div key={stage} className="bg-stone-100/50 p-4 rounded-2xl min-w-[250px]">
                              <h3 className="font-bold text-stone-600 mb-4 px-2">{stage === 'Idea' ? '靈感發想' : stage === 'Testing' ? '試做調整' : '準備上市'}</h3>
                              <div className="space-y-3">
                                  {ideas?.filter(i => i.stage === stage).map(idea => (
                                      <div key={idea.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                                          {idea.imageUrl && (
                                              <img src={idea.imageUrl} alt={idea.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                                          )}
                                          <div className="font-bold text-stone-800">{idea.name}</div>
                                          <p className="text-xs text-stone-500 mt-2">{idea.notes}</p>
                                          {idea.recipe && (
                                              <details className="mt-2 text-xs text-stone-500">
                                                  <summary className="cursor-pointer hover:text-[#b45309]">AI 食譜建議</summary>
                                                  <div className="p-2 bg-stone-50 rounded mt-1 whitespace-pre-wrap">{idea.recipe}</div>
                                              </details>
                                          )}
                                          <div className={`text-[10px] px-2 py-0.5 rounded inline-block mt-3 border ${getStageColor(idea.stage)}`}>
                                              {idea.stage}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* Add Idea Modal */}
              {showAddIdea && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                          <button onClick={() => setShowAddIdea(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20} /></button>
                          <h3 className="text-xl font-bold mb-4 text-[#78350f]">新增新品想法</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">產品名稱</label>
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newIdea.name}
                                    placeholder="例如：海鹽焦糖拿鐵"
                                    onChange={(e) => setNewIdea({...newIdea, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">備註 / 靈感來源</label>
                                  <textarea 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309] h-24"
                                    value={newIdea.notes}
                                    placeholder="例如：希望用燕麥奶製作，口感要滑順..."
                                    onChange={(e) => setNewIdea({...newIdea, notes: e.target.value})}
                                  ></textarea>
                              </div>
                              <button 
                                onClick={handleAddIdea} 
                                disabled={isGeneratingProduct}
                                className="w-full bg-[#b45309] text-white py-3 rounded-xl font-bold hover:bg-[#92400e] flex items-center justify-center gap-2"
                              >
                                  {isGeneratingProduct ? (
                                      <>
                                          <Loader2 className="animate-spin" size={20} />
                                          AI 生成食譜與圖片中...
                                      </>
                                  ) : "建立並生成內容"}
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // -- MANAGER VIEW: FEEDBACK --
  if (!isGuest && activeTab === 'feedback') {
      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2"><MessageSquare /> 評論分析</h2>
                  <div className="flex flex-wrap gap-2">
                       <button 
                        onClick={() => setShowAddFeedback(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                       >
                           <Plus size={16} /> 手動新增評論 (AI 分析)
                       </button>
                       <a 
                        href="https://www.google.com/maps/search/?api=1&query=無所時時+Woosh+Cafe+宜蘭" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 text-sm shadow-sm"
                       >
                           <MapPin size={16} /> 前往 Google Maps
                       </a>
                  </div>
              </div>
              
              {feedbacks && feedbacks.length === 0 ? (
                  <EmptyState message="目前沒有評論資料，請手動新增評論讓 AI 幫您分析正負面評價" onClick={() => setShowAddFeedback(true)} buttonText="新增評論" />
              ) : (
                  <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10">
                          <h3 className="font-bold text-stone-700 mb-4">顧客留言與 AI 觀點提取</h3>
                          <div className="space-y-6">
                              {feedbacks?.map(fb => (
                                  <div key={fb.id} className="border-b border-stone-100 pb-6 last:border-0">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                              <span className="font-bold text-stone-800 text-lg">{fb.customer}</span>
                                          </div>
                                          <div className="flex text-yellow-400">
                                              {[...Array(fb.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                          </div>
                                      </div>
                                      <p className="text-stone-600 mb-3 bg-stone-50 p-3 rounded-lg italic">"{fb.comment}"</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {/* Pros */}
                                         <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-green-700 flex items-center gap-1 uppercase"><ThumbsUp size={12}/> 正面評價</h4>
                                            {fb.positivePoints && fb.positivePoints.length > 0 ? (
                                                <ul className="list-none space-y-1">
                                                    {fb.positivePoints.map((point, i) => (
                                                        <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                                                            <span className="text-green-500 mt-1">✓</span> {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <span className="text-xs text-stone-400">無明顯正面評價</span>}
                                         </div>

                                         {/* Cons */}
                                         <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-red-700 flex items-center gap-1 uppercase"><ThumbsDown size={12}/> 待改進</h4>
                                            {fb.negativePoints && fb.negativePoints.length > 0 ? (
                                                <ul className="list-none space-y-1">
                                                    {fb.negativePoints.map((point, i) => (
                                                        <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                                                            <span className="text-red-500 mt-1">✗</span> {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <span className="text-xs text-stone-400">無明顯負面評價</span>}
                                         </div>
                                      </div>

                                      {fb.advice && (
                                          <div className="mt-4 bg-[#ecfccb]/30 border border-[#ecfccb] p-3 rounded-lg text-sm text-[#3f6212] flex items-start gap-2">
                                              <span className="font-bold shrink-0">💡 AI 建議:</span> {fb.advice}
                                          </div>
                                      )}
                                      <div className="text-xs text-stone-400 mt-2 text-right">{fb.date}</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* Add Feedback Modal */}
              {showAddFeedback && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                          <button onClick={() => setShowAddFeedback(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20} /></button>
                          <h3 className="text-xl font-bold mb-4 text-[#78350f]">手動新增評論</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">顧客姓名</label>
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newFeedback.customer}
                                    onChange={(e) => setNewFeedback({...newFeedback, customer: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">評分 (1-5)</label>
                                  <select 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]"
                                    value={newFeedback.rating}
                                    onChange={(e) => setNewFeedback({...newFeedback, rating: Number(e.target.value)})}
                                  >
                                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} 星</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">評論內容</label>
                                  <textarea 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309] h-24"
                                    value={newFeedback.comment}
                                    onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                                  ></textarea>
                              </div>
                              <button 
                                onClick={handleAddFeedback} 
                                disabled={isAnalyzingFeedback}
                                className="w-full bg-[#b45309] text-white py-3 rounded-xl font-bold hover:bg-[#92400e] flex items-center justify-center gap-2"
                              >
                                  {isAnalyzingFeedback ? (
                                      <>
                                          <Loader2 className="animate-spin" size={20} />
                                          AI 分析觀點中...
                                      </>
                                  ) : "新增並分析"}
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // -- MANAGER VIEW: KPI --
  if (!isGuest && activeTab === 'kpi') {
      return (
          <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-[#78350f] flex items-center gap-2"><Target /> 年度目標追蹤</h2>
                  <button 
                    onClick={() => setShowAddGoal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-lg hover:bg-[#92400e] text-sm"
                  >
                      <Plus size={16} /> 設定新目標
                  </button>
              </div>
              
              {goals && goals.length === 0 ? (
                  <SkeletonOverlay title="年度目標範例" onClick={() => setShowAddGoal(true)} buttonText="設定目標">
                       <div className="space-y-6">
                          <div className="bg-white p-6 rounded-2xl border border-[#78350f]/10 shadow-sm">
                              <div className="flex justify-between items-end mb-4">
                                  <div>
                                      <h3 className="font-bold text-stone-700 text-lg">年度營收目標</h3>
                                      <p className="text-stone-400 text-sm">Target: 1200 萬</p>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-3xl font-bold text-[#b45309]">850 <span className="text-sm font-normal text-stone-500">萬</span></div>
                                      <div className="text-sm text-[#b45309]">70%</div>
                                  </div>
                              </div>
                              <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-orange-400 to-[#b45309]" style={{ width: `70%` }}></div>
                              </div>
                          </div>
                      </div>
                  </SkeletonOverlay>
              ) : (
                  <div className="space-y-6">
                      {goals?.map(goal => {
                          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                          return (
                              <div key={goal.id} className="bg-white p-6 rounded-2xl border border-[#78350f]/10 shadow-sm">
                                  <div className="flex justify-between items-end mb-4">
                                      <div>
                                          <h3 className="font-bold text-stone-700 text-lg">{goal.title}</h3>
                                          <p className="text-stone-400 text-sm">Target: {goal.target} {goal.unit}</p>
                                      </div>
                                      <div className="text-right">
                                          <div className="text-3xl font-bold text-[#b45309]">{goal.current} <span className="text-sm font-normal text-stone-500">{goal.unit}</span></div>
                                          <div className="text-sm text-[#b45309]">{percent}%</div>
                                      </div>
                                  </div>
                                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-gradient-to-r from-orange-400 to-[#b45309] transition-all duration-1000 ease-out"
                                          style={{ width: `${percent}%` }}
                                      ></div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}

               {/* Add Goal Modal */}
               {showAddGoal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                          <button onClick={() => setShowAddGoal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20} /></button>
                          <h3 className="text-xl font-bold mb-4 text-[#78350f]">設定年度目標</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">目標項目</label>
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newGoal.title}
                                    placeholder="例如：會員成長數"
                                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                                  />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-medium text-stone-700 mb-1">目標數值</label>
                                      <input 
                                        type="number" 
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                        value={newGoal.target}
                                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-stone-700 mb-1">當前進度</label>
                                      <input 
                                        type="number" 
                                        className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                        value={newGoal.current}
                                        onChange={(e) => setNewGoal({...newGoal, current: e.target.value})}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-stone-700 mb-1">單位</label>
                                  <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2 focus:outline-none focus:border-[#b45309]" 
                                    value={newGoal.unit}
                                    placeholder="例如：人、萬元、則"
                                    onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                                  />
                              </div>
                              <button onClick={handleAddGoal} className="w-full bg-[#b45309] text-white py-3 rounded-xl font-bold hover:bg-[#92400e]">建立目標</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  return null;
};