import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  Building2,
  ArrowUpRight
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100/40 to-slate-200/50 font-sans antialiased text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        
        {/* ================= HEADER SECTION ================= */}
<div className="text-center max-w-2xl mx-auto mb-16">
  
  {/* แก้ไขบรรทัดนี้: ลบ text-slate-900 ออกไปเรียบร้อยแล้ว */}
  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mt-4 mb-4 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent">
    ติดต่อเรา
  </h1>
  <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
    สอบถามข้อมูลสินค้า ขอใบเสนอราคา หรือแจ้งปัญหาการใช้งาน 
    ทีมงาน MaxTech Electric พร้อมให้บริการและตอบกลับคุณอย่างรวดเร็ว
  </p>
</div>

        {/* ================= CONTENT GRID ================= */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: CONTACT INFO CARDS (8 Columns on Desktop) */}
          <div className="md:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
              <Building2 size={24} className="text-indigo-600" />
              ช่องทางการติดต่อฝ่ายบริการ
            </h2>

            <div className="space-y-4">
              
              {/* PHONE */}
              {/* PHONE */}
<div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
    <Phone size={22} />
  </div>
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      เบอร์โทรศัพท์
    </p>
    <a
      href="tel:0946861981"
      className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors"
    >
      094-686-1981
    </a>
  </div>
</div>

{/* EMAIL */}
<div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
    <Mail size={22} />
  </div>
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      อีเมล
    </p>
    <a
      href="mailto:maxtechelectric1@gmail.com"
      className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors break-all"
    >
      maxtechelectric1@gmail.com
    </a>
  </div>
</div>

{/* LOCATION */}
<div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
    <MapPin size={22} />
  </div>
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      ที่อยู่
    </p>

    <a
      href="https://maps.google.com/?q=13.558246,100.594413"
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
    >
      ถนนท้ายบ้าน ตำบลท้ายบ้าน
      <br />
      อำเภอเมืองสมุทรปราการ
      <br />
      จังหวัดสมุทรปราการ 10280
    </a>

    <div className="mt-2">
      <a
        href="https://maps.google.com/?q=13.558246,100.594413"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
      >
        เปิด Google Maps
        <ArrowUpRight size={16} />
      </a>
    </div>
  </div>
</div>

{/* LINE OFFICIAL */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-green-50 border border-green-200/60 hover:border-green-300 transition-colors">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-green-200 text-green-800 flex items-center justify-center shrink-0">
      <MessageSquare size={22} />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-green-800/70">
        LINE Official
      </p>
      <p className="text-lg font-bold text-green-950">
        maxtechelectric
      </p>
      <p className="text-lg font-bold text-green-950">
        @051pdsfe
      </p>
    </div>
  </div>

  <a
    href="https://lin.ee/SmaOgjw"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center gap-2 bg-green-200 hover:bg-green-300 text-green-950 font-bold px-5 py-2.5 rounded-xl transition-all"
  >
    แชทผ่าน LINE
    <ArrowUpRight size={16} />
  </a>
</div>
            

            </div>
          </div>

          {/* RIGHT SIDE: BUSINESS HOURS & ASSISTANCE (5 Columns on Desktop) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Business Hours Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-500" />
                เวลาทำการของบริษัท
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>วันจันทร์ - วันเสาร์</span>
                  <span className="font-semibold text-slate-900">08:00 - 17:00 น.</span>
                </div>
                <div className="flex justify-between py-1.5 text-red-600">
                  <span>วันอาทิตย์และวันหยุดนักขัตฤกษ์</span>
                  <span className="font-semibold">ปิดทำการ</span>
                </div>
              </div>
            </div>

           

          </div>

        </div>

      </div>
    </main>
  );
}