import React, { useState } from 'react';
import { Tools } from './components/Tools';
import { Live } from './components/Live';
import { 
  Mic, Coffee, Sun, Camera, 
  MessageSquare, Utensils, DollarSign, 
  Target, Package, Leaf, Github, Users
} from './components/icons';
import { InventoryItem, Order, SocialPost, ProductIdea, FeedbackItem, Goal } from './types';

const App: React.FC = () => {
  const [showLive, setShowLive] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [isGuest, setIsGuest] = useState(false);

  // -- Shared State --
  // Orders placed by guests, visible in Manager Revenue
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([
      { id: '1', name: "燕麥拿鐵 (Oatside)", quantity: 2, unit: "瓶", status: "Critical", lastUpdated: "2023-10-24" },
      { id: '2', name: "耶加雪菲 咖啡豆", quantity: 0.5, unit: "kg", status: "Warning", lastUpdated: "2023-10-23" },
      { id: '3', name: "外帶紙杯 (12oz)", quantity: 1, unit: "條", status: "Critical", lastUpdated: "2023-10-24" },
      { id: '4', name: "光泉鮮乳", quantity: 12, unit: "瓶", status: "Normal", lastUpdated: "2023-10-24" },
      { id: '5', name: "義式濃縮配方豆", quantity: 5, unit: "kg", status: "Normal", lastUpdated: "2023-10-20" },
  ]);

  // Social Media State
  const [posts, setPosts] = useState<SocialPost[]>([
      { id: '1', content: '週末限定！草莓戚風蛋糕新上市 🍰', date: '2023-10-23', likes: 145, shares: 20, platform: 'IG' },
      { id: '2', content: '雨天來杯熱拿鐵，第二杯半價。', date: '2023-10-20', likes: 89, shares: 5, platform: 'FB' },
  ]);

  // Product Dev State
  const [ideas, setIdeas] = useState<ProductIdea[]>([
      { id: '1', name: '桂花釀拿鐵', stage: 'Testing', notes: '甜度需調整' },
      { id: '2', name: '酪梨燻雞三明治', stage: 'Idea', notes: '尋找供應商中' },
      { id: '3', name: '靜岡抹茶千層', stage: 'Launch', notes: '大受好評' },
  ]);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
      { id: '1', customer: '陳小姐', rating: 5, comment: '咖啡很好喝，環境很舒適！', date: '2023-10-24' },
      { id: '2', customer: 'Jason', rating: 4, comment: '插座有點少，但Wifi很快。', date: '2023-10-23' },
      { id: '3', customer: '林先生', rating: 5, comment: '店員服務親切，推推！', date: '2023-10-22' },
  ]);

  // KPI State
  const [goals, setGoals] = useState<Goal[]>([
      { id: '1', title: '年度營收目標', current: 850, target: 1200, unit: '萬' },
      { id: '2', title: '會員成長數', current: 1200, target: 2000, unit: '人' },
      { id: '3', title: 'Google 評論數', current: 480, target: 600, unit: '則' },
  ]);

  const allTabs = [
    { id: 'daily', label: '今日重點', icon: Sun, guest: false },
    { id: 'menu', label: isGuest ? '菜單' : '菜單獲利', icon: Coffee, guest: true },
    { id: 'inventory', label: '庫存管理', icon: Package, guest: false },
    { id: 'esg', label: 'ESG 永續', icon: Leaf, guest: false },
    { id: 'revenue', label: '營收儀表', icon: DollarSign, guest: false },
    { id: 'social', label: '社群小編', icon: Camera, guest: false },
    { id: 'product', label: '新品開發', icon: Utensils, guest: false },
    { id: 'feedback', label: '評論分析', icon: MessageSquare, guest: false },
    { id: 'kpi', label: '年度目標', icon: Target, guest: false },
  ];

  const visibleTabs = allTabs.filter(tab => !isGuest || tab.guest);

  const handleModeToggle = () => {
      const newModeIsGuest = !isGuest;
      setIsGuest(newModeIsGuest);
      if (newModeIsGuest) {
          setActiveTab('menu');
      } else {
          setActiveTab('daily');
      }
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-500 ${isGuest ? 'bg-stone-50 text-stone-800' : 'bg-[#fdfbf7] text-[#78350f]'}`}>
      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex w-64 flex-col border-r shadow-lg z-20 transition-colors duration-500 ${isGuest ? 'bg-white border-stone-200' : 'border-[#78350f]/10 bg-white'}`}>
        <div className={`p-6 border-b transition-colors duration-500 ${isGuest ? 'border-stone-100' : 'border-[#78350f]/10'}`}>
          <h1 className={`text-xl font-bold font-serif flex items-center gap-2 ${isGuest ? 'text-stone-700' : 'text-[#78350f]'}`}>
            <Coffee className={isGuest ? 'text-stone-400' : 'text-[#3f6212]'} />
            無所時時
            <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${isGuest ? 'bg-stone-100 text-stone-500' : 'bg-[#ecfccb] text-[#3f6212]'}`}>
                {isGuest ? 'Guest' : 'COO'}
            </span>
          </h1>
        </div>
        
        <div className="px-4 py-4">
            <button 
                onClick={handleModeToggle}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isGuest 
                        ? 'bg-stone-100 border-stone-200 text-stone-600' 
                        : 'bg-[#ecfccb]/20 border-[#ecfccb] text-[#3f6212]'
                }`}
            >
                <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{isGuest ? '訪客模式' : '店長模式'}</span>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${isGuest ? 'bg-stone-300' : 'bg-[#3f6212]'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isGuest ? 'left-0.5' : 'right-0.5'}`}></div>
                </div>
            </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? isGuest ? 'bg-stone-800 text-white shadow-md' : 'bg-[#3f6212] text-white shadow-md'
                  : isGuest ? 'text-stone-500 hover:bg-stone-100' : 'text-[#78350f] hover:bg-[#ecfccb]/50'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t space-y-2 ${isGuest ? 'border-stone-100' : 'border-[#78350f]/10'}`}>
           <button 
             onClick={() => setShowLive(true)}
             className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] ${
                 isGuest ? 'bg-stone-700 hover:bg-stone-600' : 'bg-[#b45309] hover:bg-[#92400e]'
             }`}
           >
             <Mic size={20} />
             <span>{isGuest ? '呼叫店員' : '呼叫營運長'}</span>
           </button>
           
           <a 
             href="https://github.com" 
             target="_blank"
             rel="noopener noreferrer"
             className={`w-full flex items-center justify-center gap-2 py-2 text-sm transition-colors ${
                 isGuest ? 'text-stone-400 hover:text-stone-600' : 'text-[#78350f]/50 hover:text-[#78350f]'
             }`}
           >
             <Github size={16} />
             <span>GitHub Repo</span>
           </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <header className={`md:hidden flex-none flex items-center justify-between p-4 bg-white border-b shadow-sm z-10 ${isGuest ? 'border-stone-200' : 'border-[#78350f]/10'}`}>
           <div className={`font-bold font-serif text-lg flex items-center gap-2 ${isGuest ? 'text-stone-700' : 'text-[#78350f]'}`}>
             <Coffee className={isGuest ? 'text-stone-400' : 'text-[#3f6212]'} /> 
             {isGuest ? '無所時時' : '數位營運長'}
           </div>
           
           <div className="flex items-center gap-3">
             <button 
                onClick={handleModeToggle}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    isGuest ? 'bg-stone-100 border-stone-200 text-stone-500' : 'bg-[#ecfccb] border-[#3f6212]/20 text-[#3f6212]'
                }`}
             >
                {isGuest ? '訪客' : '店長'}
             </button>

             <button 
               onClick={() => setShowLive(true)}
               className={`text-white p-2 rounded-full shadow-md active:scale-95 transition-transform ${
                   isGuest ? 'bg-stone-700' : 'bg-[#b45309]'
               }`}
             >
               <Mic size={20} />
             </button>
           </div>
        </header>

        {/* Content Scrollable Area - Added padding bottom for mobile nav */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
           <Tools 
                activeTab={activeTab} 
                isGuest={isGuest} 
                inventory={inventory}
                setInventory={setInventory}
                orders={orders}
                setOrders={setOrders}
                posts={posts}
                setPosts={setPosts}
                ideas={ideas}
                setIdeas={setIdeas}
                feedbacks={feedbacks}
                setFeedbacks={setFeedbacks}
                goals={goals}
                setGoals={setGoals}
           />
        </div>

        {/* Mobile Bottom Navigation (Fixed) */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex p-2 z-30 overflow-x-auto ${
            isGuest ? 'border-stone-200' : 'border-[#78350f]/10'
        }`}>
          {visibleTabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex flex-col items-center p-2 min-w-[70px] rounded-lg transition-colors shrink-0 ${
                 activeTab === tab.id 
                    ? isGuest ? 'text-stone-800 bg-stone-100' : 'text-[#3f6212] bg-[#ecfccb]/30' 
                    : 'text-gray-400'
               }`}
             >
               <tab.icon size={20} />
               <span className="text-[10px] mt-1 whitespace-nowrap">{tab.label}</span>
             </button>
          ))}
          {/* Spacer to ensure last item is clickable */}
          <div className="min-w-[10px] shrink-0"></div>
        </nav>
      </main>

      {/* Live Overlay */}
      {showLive && <Live onClose={() => setShowLive(false)} isGuest={isGuest} />}
    </div>
  );
};

export default App;