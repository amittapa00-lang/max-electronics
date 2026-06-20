import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowUpRight
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-radial from-slate-50 via-slate-100/50 to-slate-200/40 font-sans antialiased text-slate-800 relative overflow-hidden">
      
      {/* Decorative Ambient Light Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-75 bg-linear-to-b from-indigo-500/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="text-center max-w-2xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-100 px-4 py-1.5 rounded-full backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase">
              Contact Center
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-5 mb-5 bg-linear-to-b from-slate-950 via-slate-900 to-indigo-950 bg-clip-text text-transparent">
            ติดต่อเรา
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
            สอบถามข้อมูลสินค้า ขอใบเสนอราคา หรือแจ้งปัญหาการใช้งาน <br className="hidden sm:block" />
            ทีมงาน MaxTech Electric พร้อมให้บริการและตอบกลับคุณอย่างรวดเร็ว
          </p>
        </div>

        {/* ================= CONTENT GRID ================= */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: PREMIUM CONTACT CARDS (7 Columns) */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2 px-1 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Direct Channels
              </span>
            </div>

            {/* 1. PHONE CARD */}
            <div className="group relative bg-white/80 border border-slate-200/60 rounded-2xl p-4 shadow-xl shadow-slate-100/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Phone size={20} className="stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotline</p>
                  <a href="tel:0946861981" className="text-base font-bold text-slate-900 mt-0.5 block hover:text-indigo-600 transition-colors">
                    094-686-1981
                  </a>
                </div>
              </div>
              <a href="tel:0946861981" className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:inline-flex items-center gap-1">
                โทรออก <ArrowUpRight size={12} />
              </a>
            </div>

            {/* 2. LINE OFFICIAL CARD */}
            <div className="group relative bg-white/80 border border-slate-200/60 rounded-2xl p-4 shadow-xl shadow-slate-100/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/40 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center shrink-0 p-3 group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738s-12 4.369-12 9.738c0 4.814 4.269 8.846 10.036 9.564.39.084.922.258 1.057.592.12.313.079.803.039 1.121l-.171 1.027c-.052.31-.241 1.217 1.042.665 1.284-.553 6.923-4.077 9.441-6.976 1.733-1.859 2.556-3.896 2.556-6.013zm-16.945 3.328c0 .225-.183.407-.407.407h-1.341c-.225 0-.407-.182-.407-.407v-3.725c0-.225.182-.407.407-.407.225 0 .407.182.407.407v3.318h1.341c.224 0 .407.182.407-.407zm2.254 0c0 .225-.183.407-.408.407h-.001c-.225 0-.407-.182-.407-.407v-3.725c0-.225.182-.407.407-.407.225 0 .408.182.408.407v3.725zm3.824 0c0 .167-.101.318-.255.381-.05.021-.102.031-.153.031-.109 0-.214-.044-.29-.124l-1.637-1.722v1.432c0 .225-.182.407-.407.407s-.407-.182-.407-.407v-3.725c0-.167.101-.318.255-.381.154-.063.332-.027.449.091l1.625 1.708v-1.417c0-.225.182-.407.407-.407s.407.182.407.407v3.725zm2.973-1.124c0 .225-.183.407-.407.407h-1.353v.717h1.353c.225 0 .407.182.407.407 0 .225-.182.407-.407.407h-1.761c-.224 0-.407-.182-.407-.407v-3.725c0-.225.183-.407.407-.407h1.761c.225 0 .407.182.407.407 0 .225-.182.407-.407.407h-1.353v.673h1.353c.225 0 .407.182.407.407z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Official</p>
                  <a href="https://lin.ee/SmaOgjw" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-slate-900 mt-0.5 block hover:text-emerald-600 transition-colors">
                    @051pdsfe
                  </a>
                </div>
              </div>
              <a href="https://lin.ee/SmaOgjw" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/60 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs hover:bg-emerald-100 transition-colors">
                เพิ่มเพื่อน <ArrowUpRight size={12} />
              </a>
            </div>

            {/* 3. FACEBOOK CARD */}
            <div className="group relative bg-white/80 border border-slate-200/60 rounded-2xl p-4 shadow-xl shadow-slate-100/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/40 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1877f2] flex items-center justify-center shrink-0 p-3 group-hover:scale-105 transition-transform duration-300">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facebook Page</p>
                  <a href="https://facebook.com/MaxTech Electric/" target="_blank" rel="noopener noreferrer" className="text-base font-bold text-slate-900 mt-0.5 block hover:text-blue-600 transition-colors truncate">
                    MaxTech Electric
                  </a>
                </div>
              </div>
              <a href="https://facebook.com/MaxTech Electric/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100/60 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs hover:bg-blue-100 transition-colors shrink-0 ml-2">
                เปิดเพจ <ArrowUpRight size={12} />
              </a>
            </div>

            {/* 4. EMAIL CARD */}
            <div className="group relative bg-white/80 border border-slate-200/60 rounded-2xl p-4 shadow-xl shadow-slate-100/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/50 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Mail size={20} className="stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <a href="mailto:maxtechelectric1@gmail.com" className="text-sm sm:text-base font-bold text-slate-900 mt-0.5 block hover:text-indigo-600 transition-colors truncate">
                    maxtechelectric1@gmail.com
                  </a>
                </div>
              </div>
              <a href="mailto:maxtechelectric1@gmail.com" className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:inline-flex items-center gap-1">
                ส่งเมล <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: BUSINESS HOURS & MAP (5 Columns) */}
          <div className="md:col-span-5 bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/20 text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />
            
            {/* เวลาทำการ */}
            <div>
              <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} className="stroke-[2.5]" />
                Business Hours
              </h3>
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400 font-medium">วันจันทร์ - วันเสาร์</span>
                  <span className="font-semibold text-slate-100 bg-slate-800 px-2.5 py-1 rounded-lg">08:00 - 17:00 น.</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">วันอาทิตย์ / วันหยุด</span>
                  <span className="font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg">ปิดทำการ</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800" />

            {/* ที่อยู่สำนักงาน */}
            <div>
              <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} className="stroke-[2.5]" />
                Headquarters
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  ถนนท้ายบ้าน ตำบลท้ายบ้าน <br />
                  อำเภอเมืองสมุทรปราการ <br />
                  จังหวัดสมุทรปราการ 10280
                </p>
                
                <div className="pt-2">
                  <a
                    href="https://maps.google.com/?q=13.558246,100.594413"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
                  >
                    เปิดแผนที่ Google Maps
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}