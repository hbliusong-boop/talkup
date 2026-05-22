/* ─── Learning Calendar ─────────────────────────── */

function CalendarPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) { setLoading(false); return; }
    API.studyCalendar(userId).then(res => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:80, textAlign:"center", color:"var(--ink-3)"}}>加载中...</div>;
  if (!data) return <div style={{padding:80, textAlign:"center", color:"var(--ink-3)"}}>请先登录</div>;

  const streak = data.streak || 0;
  const longest = data.longest || 0;
  const totalMinutes = data.totalMinutes || 0;
  const sessions = data.sessions || 0;

  // Build heatmap from history (last 18 weeks)
  const heatmap = buildHeatmap(data.history || {});

  return (
    <main className="wrap" style={{padding:"56px 32px 96px"}}>
      <PageHeader
        eyebrow="学习日历"
        title={<>你已经坚持<i style={{color:"var(--green)"}}>{streak} 天</i>了。</>}
        sub="把每一次开口都记在这里。看见自己一直在前进，比成为完美的人更重要。"
        right={
          <div style={{display:"flex", gap:10}}>
            <button className="btn btn-outline btn-sm"><Icon.Globe/> 公开主页</button>
            <button className="btn btn-primary btn-sm" onClick={()=>navigate("scenarios")}>今日去练习</button>
          </div>
        }
      />

      {/* top stats */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:32}}>
        <BigStat icon={<Icon.Flame/>} label="当前连击" big={streak} unit="天" tint="gold"/>
        <BigStat icon={<Icon.Spark/>} label="最长连击" big={longest} unit="天"/>
        <BigStat icon={<Icon.Clock/>} label="累计时长" big={Math.floor(totalMinutes/60)} unit={`小时 ${totalMinutes%60} 分`}/>
        <BigStat icon={<Icon.Book/>}  label="完成对话" big={sessions} unit="节"/>
      </div>

      {/* Streak bar */}
      <StreakBar history={data.history || {}}/>

      {/* GitHub-style heatmap */}
      <Heatmap heatmap={heatmap} totalSessions={sessions}/>

      {/* split: month calendar + activity feed */}
      <div style={{display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:24, marginTop:32}}>
        <MonthCalendar history={data.history || {}}/>
        <ActivityFeed history={data.history || {}}/>
      </div>
    </main>
  );
}

/* Build 18-week heatmap from history */
function buildHeatmap(history) {
  const today = new Date();
  const weeks = 18;
  const data = [];
  // start from 17 weeks ago Monday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);
  const startDay = startDate.getDay() || 7; // Monday = 1
  startDate.setDate(startDate.getDate() - startDay + 1); // go back to Monday

  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      const dateStr = date.toISOString().slice(0, 10);
      const dayData = history[dateStr];
      let v = 0;
      if (dayData) {
        const mins = dayData.totalMinutes || 0;
        if (mins >= 30) v = 4;
        else if (mins >= 20) v = 3;
        else if (mins >= 10) v = 2;
        else if (mins > 0) v = 1;
      }
      // Don't show future days as colored
      if (date > today) v = 0;
      col.push(v);
    }
    data.push(col);
  }
  return data;
}

function BigStat({ icon, label, big, unit, tint }) {
  return (
    <div className="card" style={{padding:"20px 22px", display:"flex", flexDirection:"column", gap:14}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontSize:12, color:"var(--ink-3)", letterSpacing:0.08, textTransform:"uppercase", fontWeight:500}}>{label}</span>
        <span style={{
          width:32, height:32, borderRadius:10,
          background: tint==="gold" ? "var(--gold-2)" : "var(--green-4)",
          color: tint==="gold" ? "var(--gold)" : "var(--green)",
          display:"grid", placeItems:"center",
        }}>{icon}</span>
      </div>
      <div style={{display:"flex", alignItems:"baseline", gap:8}}>
        <span style={{fontFamily:"var(--serif)", fontSize:54, letterSpacing:"-0.02em", lineHeight:1, color:"var(--ink)"}}>{big}</span>
        <span style={{color:"var(--ink-3)", fontSize:14}}>{unit}</span>
      </div>
    </div>
  );
}

/* ── Streak bar — last 30 days ── */
function StreakBar({ history }) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const mins = history[dateStr]?.totalMinutes || 0;
    days.push(mins);
  }
  const todayMins = days[days.length - 1];
  const goal = 15;
  return (
    <div className="card" style={{padding:"22px 24px", marginBottom:24}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:18}}>
        <div>
          <div style={{fontSize:11, marginBottom:6, color:"var(--ink-3)"}}>过去 30 天 · 每日练习时长</div>
          <div style={{display:"flex", alignItems:"baseline", gap:10}}>
            <span style={{fontFamily:"var(--serif)", fontSize:32}}>{todayMins} 分钟</span>
            <span style={{fontSize:13, color:"var(--ink-3)"}}>今天 · 目标 {goal} 分</span>
          </div>
        </div>
        <div style={{display:"flex", gap:14, alignItems:"center", fontSize:12, color:"var(--ink-3)"}}>
          <LegendDot c="var(--bg-3)" l="未练"/>
          <LegendDot c="var(--green-3)" l="<15 分"/>
          <LegendDot c="var(--green)" l="≥15 分"/>
          <LegendDot c="var(--gold)" l="今天"/>
        </div>
      </div>
      <div style={{display:"flex", alignItems:"flex-end", gap:6, height:120}}>
        {days.map((v, i)=>{
          const h = Math.max(4, Math.round((v/60)*100));
          const today = i===days.length-1;
          const color = today ? "var(--gold)" : (v===0 ? "var(--bg-3)" : (v>=goal ? "var(--green)" : "var(--green-3)"));
          return (
            <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
              <div title={`${v} 分`} style={{width:"100%", height:`${h}%`, background:color, borderRadius:4, transition:"height .3s"}}/>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"var(--ink-4)", fontFamily:"var(--mono)"}}>
        <span>30 天前</span><span>15 天前</span><span>今天</span>
      </div>
    </div>
  );
}
function LegendDot({ c, l }) {
  return <span style={{display:"inline-flex", alignItems:"center", gap:6}}><span style={{width:10, height:10, borderRadius:3, background:c}}/>{l}</span>;
}

/* ── GitHub heatmap ── */
function Heatmap({ heatmap, totalSessions }) {
  const months = getMonthsForHeatmap(heatmap);
  return (
    <div className="card" style={{padding:"22px 24px", marginBottom:0}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <div>
          <div style={{fontSize:11, marginBottom:6, color:"var(--ink-3)"}}>年度热力图</div>
          <span style={{fontFamily:"var(--serif)", fontSize:24}}>过去 18 周 · {totalSessions} 次练习</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--ink-3)"}}>
          <span>少</span>
          {[0,1,2,3,4].map(l=>(
            <span key={l} style={{width:14, height:14, borderRadius:3, background: heatColor(l)}}/>
          ))}
          <span>多</span>
        </div>
      </div>
      <div style={{display:"flex", gap:14}}>
        <div style={{display:"flex", flexDirection:"column", justifyContent:"space-around", fontSize:11, color:"var(--ink-4)", paddingTop:2, paddingBottom:2}}>
          {["一","","三","","五",""].map((d,i)=> <span key={i} style={{height:16}}>{d}</span>)}
        </div>
        <div style={{flex:1, display:"flex", gap:4}}>
          {heatmap.map((week, wi)=>(
            <div key={wi} style={{display:"flex", flexDirection:"column", gap:4, flex:1}}>
              {week.map((v, di)=>(
                <div key={di} title={`${["未练","轻量","中量","充足","完美"][v]}`}
                     style={{aspectRatio:"1", borderRadius:3, background: heatColor(v), border:"1px solid color-mix(in oklab, var(--ink) 4%, transparent)"}}/>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:"var(--ink-4)", paddingLeft:30}}>
        {months.map((m,i)=>(<span key={i}>{m}</span>))}
      </div>
    </div>
  );
}

function getMonthsForHeatmap(heatmap) {
  const today = new Date();
  const months = [];
  const start = new Date(today);
  start.setDate(start.getDate() - (heatmap.length * 7) + 1);
  for (let i = 0; i < heatmap.length; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    if (d.getDate() <= 7) {
      months.push(d.toLocaleString("zh-CN", {month:"short"}).replace("月",""));
    } else {
      months.push("");
    }
  }
  return months;
}

function heatColor(v) {
  return ["var(--bg-3)","color-mix(in oklab, var(--green) 18%, var(--bg-3))","color-mix(in oklab, var(--green) 38%, var(--bg-2))","color-mix(in oklab, var(--green) 65%, var(--bg-2))","var(--green)"][v];
}

/* ── Month calendar ── */
function MonthCalendar({ history }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const view = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthName = view.toLocaleString("zh-CN", { year:"numeric", month:"long" });
  const firstDow = (view.getDay() + 6) % 7; // make Monday = 0
  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();

  // build sessions per day from history
  const sessionsByDay = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${view.getFullYear()}-${String(view.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (history[dateStr]) {
      sessionsByDay[d] = (history[dateStr].scenarios || []).length;
    }
  }

  return (
    <div className="card" style={{padding:"22px 24px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <div>
          <div style={{fontSize:11, marginBottom:6, color:"var(--ink-3)"}}>月历</div>
          <span style={{fontFamily:"var(--serif)", fontSize:24}}>{monthName}</span>
        </div>
        <div style={{display:"flex", gap:6}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setMonthOffset(o=>o-1)} style={{width:32, height:32, padding:0, justifyContent:"center"}}>‹</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setMonthOffset(0)} style={{height:32}}>今天</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>setMonthOffset(o=>o+1)} style={{width:32, height:32, padding:0, justifyContent:"center"}}>›</button>
        </div>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6, fontSize:11.5, color:"var(--ink-4)", marginBottom:6}}>
        {["一","二","三","四","五","六","日"].map(d=> <div key={d} style={{textAlign:"center"}}>{d}</div>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:6}}>
        {Array.from({length: firstDow}).map((_,i)=> <div key={"e"+i}/>)}
        {Array.from({length: daysInMonth}, (_,i)=>{
          const d = i+1;
          const isToday = monthOffset===0 && d===today.getDate();
          const sessions = sessionsByDay[d] || 0;
          const isFuture = new Date(view.getFullYear(), view.getMonth(), d) > today;
          return (
            <div key={d}
                 style={{
                   aspectRatio:"1.05", padding:6, borderRadius:10,
                   background: isToday ? "var(--green)" :
                               (isFuture ? "var(--bg)" :
                                sessions ? "var(--green-4)" : "var(--bg-3)"),
                   border: isToday ? "1px solid var(--green-2)" : "1px solid var(--line)",
                   color: isToday ? "#FFFEF6" : (isFuture ? "var(--ink-4)" : "var(--ink-2)"),
                   display:"flex", flexDirection:"column", justifyContent:"space-between",
                   transition:"background .15s",
                 }}>
              <span style={{fontSize:12, fontFamily:"var(--mono)", fontWeight: isToday?600:400}}>{d}</span>
              {sessions>0 && !isFuture && (
                <div style={{display:"flex", gap:2, justifyContent:"flex-end"}}>
                  {Array.from({length: Math.min(3, sessions)}).map((_,k)=>(
                    <span key={k} style={{width:5, height:5, borderRadius:99, background: isToday ? "rgba(255,254,246,.85)" : "var(--green)"}}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity feed ── */
function ActivityFeed({ history }) {
  // Build feed items from history, sorted by date descending
  const items = [];
  const today = new Date();
  const itemMap = new Map();

  Object.entries(history).forEach(([dateStr, dayData]) => {
    const d = new Date(dateStr);
    if (d > today) return;
    const label = isToday(dateStr) ? "今天" : (isYesterday(dateStr) ? "昨天" : d.toLocaleString("zh-CN", {month:"numeric", day:"numeric"}));
    const scenarios = dayData.scenarios || [];
    scenarios.forEach(s => {
      items.push({
        date: `${label} · ${dayStr(dayData.createdAt)}`,
        t: `完成 ${s.name}`,
        sub: `${s.count || scenarios.length} 句对话 · ${s.minutes || dayData.totalMinutes} 分钟`,
        tag: `+${Math.floor((s.minutes || dayData.totalMinutes) * 0.8)} XP`,
        c: "var(--green)",
        ts: d.getTime()
      });
    });
  });

  items.sort((a, b) => b.ts - a.ts);
  const displayItems = items.slice(0, 6);

  if (displayItems.length === 0) {
    return (
      <div className="card" style={{padding:"22px 24px"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
          <div>
            <div style={{fontSize:11, marginBottom:6, color:"var(--ink-3)"}}>动态</div>
            <span style={{fontFamily:"var(--serif)", fontSize:24}}>最近的练习</span>
          </div>
        </div>
        <div style={{padding:"32px 0", textAlign:"center", color:"var(--ink-3)"}}>
          还没有练习记录，<a href="#" onClick={e=>{e.preventDefault(); navigate("scenarios");}} style={{color:"var(--green)"}}>去练习 →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{padding:"22px 24px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18}}>
        <div>
          <div style={{fontSize:11, marginBottom:6, color:"var(--ink-3)"}}>动态</div>
          <span style={{fontFamily:"var(--serif)", fontSize:24}}>最近的练习</span>
        </div>
        <a href="#" style={{fontSize:12.5, color:"var(--green)"}}>全部 →</a>
      </div>
      <div style={{display:"flex", flexDirection:"column"}}>
        {displayItems.map((it, i)=>(
          <div key={i} style={{display:"flex", gap:14, padding:"12px 0", borderTop: i?"1px dashed var(--line)":"none"}}>
            <div style={{flex:"0 0 auto", width:8, height:8, borderRadius:99, background:it.c, marginTop:8}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5, color:"var(--ink-4)", fontFamily:"var(--mono)"}}>{it.date}</div>
              <div style={{fontSize:14.5, color:"var(--ink)", marginTop:2}}>{it.t}</div>
              <div style={{fontSize:12.5, color:"var(--ink-3)", marginTop:1}}>{it.sub}</div>
            </div>
            <span className="chip" style={{height:24, alignSelf:"flex-start", marginTop:6}}>{it.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10);
}
function isYesterday(dateStr) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return dateStr === y.toISOString().slice(0, 10);
}
function dayStr(createdAt) {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  return d.toLocaleString("zh-CN", {hour:"2-digit", minute:"2-digit"});
}

window.CalendarPage = CalendarPage;
