/* ─── Landing ─────────────────────────────────────── */
function LandingPage() {
  return (
    <main>
      <Hero/>
      <SocialProof/>
      <HowItWorks/>
      <SceneShowcase/>
      <PricingTeaser/>
      <Footer/>
    </main>
  );
}

function Hero() {
  return (
    <section style={{padding:"72px 32px 80px"}}>
      <div className="wrap" style={{display:"grid", gridTemplateColumns:"1.05fr 1fr", gap:64, alignItems:"center"}}>
        <div>
          <GreenRibbon label="新增 124 个真实场景" num="2026 春季更新"/>
          <h1 className="display" style={{fontSize:88, margin:"22px 0 18px", letterSpacing:"-0.025em"}}>
            把英语<br/>
            <span style={{fontStyle:"italic", color:"var(--green)"}}>说</span>出口。
          </h1>
          <p style={{fontSize:19, lineHeight:1.5, color:"var(--ink-2)", maxWidth:520, margin:0}}>
            在咖啡店、机场、面试现场，先用耳朵听，再让嘴巴动起来。<br/>
            每天 <b>15 分钟</b>，跟着真实对话练就一口自然英语。
          </p>
          <div style={{display:"flex", gap:12, marginTop:32}}>
            <button className="btn btn-primary btn-lg" onClick={()=>navigate("scenarios")}>
              免费开始练习 <Icon.Arrow/>
            </button>
            <button className="btn btn-outline btn-lg" onClick={()=>navigate("detail")}>
              <Icon.Play/> 看看一节课
            </button>
          </div>
          <div style={{display:"flex", gap:28, marginTop:36, color:"var(--ink-3)", fontSize:13.5}}>
            <Stat n="600+" label="真实生活场景"/>
            <Stat n="98%" label="坚持 14 天的用户"/>
            <Stat n="4.8" label="App Store 评分"/>
          </div>
        </div>

        <HeroVisual/>
      </div>
    </section>
  );
}
function Stat({ n, label }) {
  return (
    <div>
      <div style={{fontFamily:"var(--serif)", fontSize:30, color:"var(--ink)", lineHeight:1}}>{n}</div>
      <div style={{marginTop:6}}>{label}</div>
    </div>
  );
}

/* A composed hero visual — phone-shaped card showing a dialog turn,
   plus a small "today" card and a subtle backdrop. */
function HeroVisual() {
  return (
    <div style={{position:"relative", height:560}}>
      {/* backdrop disc */}
      <div style={{
        position:"absolute", inset:"6% 6% 0 6%",
        borderRadius:32,
        background:"radial-gradient(120% 80% at 30% 20%, var(--green-3), transparent 60%), var(--green-4)",
        border:"1px solid color-mix(in oklab, var(--green) 18%, transparent)",
      }}/>
      {/* big phone card */}
      <div style={{
        position:"absolute", left:"6%", top:"5%", width:"66%", height:"92%",
        background:"var(--bg-2)", border:"1px solid var(--line)",
        borderRadius:28, boxShadow:"var(--shadow-lg)",
        padding:24, display:"flex", flexDirection:"column", gap:16,
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{width:34, height:34, borderRadius:10, background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center"}}>
              <Icon.Plane/>
            </div>
            <div>
              <div style={{fontSize:13, color:"var(--ink-3)"}}>场景 · 旅行</div>
              <div style={{fontSize:15, fontWeight:600}}>Airport check-in</div>
            </div>
          </div>
          <div className="chip chip-green">Lesson 02 / 06</div>
        </div>

        <div className="hr"/>

        <DialogTurnPreview speaker="Agent" en="May I see your passport and ticket, please?" zh="可以让我看一下您的护照和机票吗？" active/>
        <DialogTurnPreview speaker="You" en="Sure, here you are." zh="当然，给您。"/>
        <DialogTurnPreview speaker="Agent" en="Are you checking any bags today?" zh="今天有要托运的行李吗？"/>

        {/* mini play bar */}
        <div style={{marginTop:"auto", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"var(--bg-3)", borderRadius:14}}>
          <button className="btn btn-primary btn-sm" style={{height:36, width:36, padding:0, justifyContent:"center"}}><Icon.Play/></button>
          <div style={{flex:1, height:4, background:"var(--line)", borderRadius:99, overflow:"hidden"}}>
            <div style={{width:"38%", height:"100%", background:"var(--green)"}}/>
          </div>
          <span style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--ink-3)"}}>00:47 / 02:08</span>
        </div>
      </div>

      {/* small floating card — streak */}
      <div style={{
        position:"absolute", right:0, bottom:"6%", width:"42%",
        background:"var(--bg-2)", border:"1px solid var(--line)",
        borderRadius:20, boxShadow:"var(--shadow)",
        padding:18,
      }}>
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="eyebrow" style={{fontSize:11}}>本周</div>
          <span style={{color:"var(--gold)"}}><Icon.Flame/></span>
        </div>
        <div style={{fontFamily:"var(--serif)", fontSize:40, lineHeight:1, margin:"8px 0 4px"}}>14<span style={{fontSize:18, color:"var(--ink-3)"}}> 天连击</span></div>
        <div style={{display:"flex", gap:4, marginTop:14}}>
          {["M","T","W","T","F","S","S"].map((d,i)=>(
            <div key={i} style={{flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6}}>
              <div style={{
                width:"100%", height:36, borderRadius:8,
                background: i<5 ? "var(--green)" : (i===5 ? "var(--green-3)" : "var(--bg-3)"),
              }}/>
              <span style={{fontSize:11, color:"var(--ink-4)"}}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* top small card — vocab */}
      <div style={{
        position:"absolute", right:"-2%", top:"4%", width:"34%",
        background:"var(--bg-2)", border:"1px solid var(--line)",
        borderRadius:18, boxShadow:"var(--shadow)",
        padding:16, transform:"rotate(2deg)",
      }}>
        <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--ink-3)", fontSize:12}}>
          <Icon.Book/> 新生词
        </div>
        <div style={{fontFamily:"var(--serif)", fontSize:22, marginTop:6}}>boarding pass</div>
        <div style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--ink-4)"}}>/ˈbɔːr.dɪŋ pæs/</div>
        <div style={{fontSize:13, color:"var(--ink-2)", marginTop:6}}>n. 登机牌</div>
      </div>
    </div>
  );
}

function DialogTurnPreview({ speaker, en, zh, active }) {
  return (
    <div style={{
      padding:"10px 12px", borderRadius:12,
      background: active ? "var(--green-4)" : "transparent",
      border: active ? "1px solid color-mix(in oklab, var(--green) 22%, transparent)" : "1px solid transparent",
    }}>
      <div style={{fontSize:11.5, color:"var(--ink-3)", marginBottom:2, fontWeight:500}}>{speaker}</div>
      <div style={{fontSize:15, color:"var(--ink)", fontWeight: active ? 500 : 400}}>{en}</div>
      <div style={{fontSize:12.5, color:"var(--ink-3)", marginTop:2}}>{zh}</div>
    </div>
  );
}

function SocialProof() {
  return (
    <section style={{padding:"24px 32px 56px"}}>
      <div className="wrap" style={{display:"flex", flexDirection:"column", alignItems:"center", gap:18}}>
        <div className="eyebrow">已被以下团队使用</div>
        <div style={{display:"flex", gap:48, alignItems:"center", color:"var(--ink-3)", flexWrap:"wrap", justifyContent:"center", opacity:.8}}>
          {["BYD","Lenovo","SHEIN","DJI","Xiaomi","Anker","TikTok"].map(b=>(
            <span key={b} style={{fontFamily:"var(--serif)", fontSize:22, letterSpacing:"0.02em", fontWeight:500}}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n:"01", t:"挑场景", d:"从 600+ 真实生活场景里挑一个跟今天有关的：值机、点单、面试。", icon:<Icon.Globe/> },
    { n:"02", t:"听对话", d:"母语者录制的真人对话。可仅显示英文，也可中英对照。", icon:<Icon.Speaker/> },
    { n:"03", t:"说出来", d:"逐句跟读，AI 评估你的发音、节奏和语调，立刻给出反馈。", icon:<Icon.Mic/> },
    { n:"04", t:"成习惯", d:"每天 15 分钟，连击日历会替你记录每一次开口的进步。", icon:<Icon.Flame/> },
  ];
  return (
    <section style={{padding:"96px 32px", background:"var(--bg-2)", borderTop:"1px solid var(--line)", borderBottom:"1px solid var(--line)"}}>
      <div className="wrap">
        <div style={{maxWidth:680, marginBottom:56}}>
          <div className="eyebrow" style={{marginBottom:12}}>方法</div>
          <h2 className="display" style={{fontSize:48, margin:0}}>四步走，从听懂到说顺。</h2>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:24}}>
          {steps.map(s=>(
            <div key={s.n} style={{padding:"24px 4px 8px", borderTop:"1px solid var(--ink-4)"}}>
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                <span style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--ink-3)"}}>{s.n}</span>
                <span style={{color:"var(--green)"}}>{s.icon}</span>
              </div>
              <div className="display" style={{fontSize:28, margin:"32px 0 10px"}}>{s.t}</div>
              <p style={{margin:0, color:"var(--ink-3)", fontSize:14}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SceneShowcase() {
  const items = [
    { t:"机场值机", en:"Airport check-in", cat:"旅行", icon:<Icon.Plane/>, time:"8 min", level:"A2" },
    { t:"咖啡店点单", en:"Ordering coffee", cat:"日常", icon:<Icon.Coffee/>, time:"6 min", level:"A1" },
    { t:"工作面试", en:"Job interview", cat:"商务", icon:<Icon.Briefcase/>, time:"14 min", level:"B1" },
    { t:"酒店入住", en:"Hotel check-in", cat:"旅行", icon:<Icon.Bed/>, time:"9 min", level:"A2" },
  ];
  return (
    <section style={{padding:"96px 32px"}}>
      <div className="wrap">
        <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:36, gap:24}}>
          <div style={{maxWidth:540}}>
            <div className="eyebrow" style={{marginBottom:12}}>本周精选</div>
            <h2 className="display" style={{fontSize:48, margin:0}}>挑一个你<span style={{fontStyle:"italic", color:"var(--green)"}}>今天</span>就用得上的场景。</h2>
          </div>
          <button className="btn btn-outline" onClick={()=>navigate("scenarios")}>
            浏览全部场景 <Icon.Arrow/>
          </button>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16}}>
          {items.map(s=>(
            <a key={s.t} className="card" href="#"
               onClick={(e)=>{e.preventDefault(); navigate("detail");}}
               style={{padding:20, display:"flex", flexDirection:"column", gap:18, minHeight:200, transition:"transform .15s, border-color .15s"}}
               onMouseEnter={(e)=>e.currentTarget.style.borderColor="var(--ink-3)"}
               onMouseLeave={(e)=>e.currentTarget.style.borderColor="var(--line)"}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{width:38, height:38, borderRadius:12, background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center"}}>{s.icon}</span>
                <span className="chip">{s.cat}</span>
              </div>
              <div>
                <div className="display" style={{fontSize:24}}>{s.t}</div>
                <div style={{color:"var(--ink-3)", fontSize:13, marginTop:2, fontStyle:"italic"}}>{s.en}</div>
              </div>
              <div style={{marginTop:"auto", display:"flex", alignItems:"center", justifyContent:"space-between", color:"var(--ink-3)", fontSize:12.5}}>
                <span style={{display:"inline-flex", alignItems:"center", gap:6}}><Icon.Clock/>{s.time}</span>
                <span style={{fontFamily:"var(--mono)"}}>{s.level}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section style={{padding:"96px 32px"}}>
      <div className="wrap">
        <div style={{
          padding:"64px 64px", borderRadius:24,
          background:"var(--ink)", color:"var(--bg)",
          display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:48, alignItems:"center",
          position:"relative", overflow:"hidden"
        }}>
          {/* decorative arc */}
          <div style={{position:"absolute", right:-160, top:-160, width:520, height:520, borderRadius:"50%", border:"1px solid color-mix(in oklab, var(--green) 60%, transparent)", opacity:.35}}/>
          <div style={{position:"absolute", right:-120, top:-120, width:440, height:440, borderRadius:"50%", border:"1px solid color-mix(in oklab, var(--green) 80%, transparent)", opacity:.25}}/>
          <div style={{position:"relative"}}>
            <div className="eyebrow" style={{color:"color-mix(in oklab, var(--bg) 70%, transparent)", marginBottom:14}}>开始</div>
            <h2 className="display" style={{fontSize:56, margin:0, color:"var(--bg)"}}>
              30 天<br/>
              <span style={{fontStyle:"italic", color:"var(--green-2)"}}>把英语</span>变成习惯。
            </h2>
            <p style={{maxWidth:440, marginTop:18, color:"color-mix(in oklab, var(--bg) 70%, transparent)"}}>
              免费试用 7 天。随时取消。
            </p>
            <div style={{display:"flex", gap:12, marginTop:28}}>
              <button className="btn btn-lg" style={{background:"var(--bg)", color:"var(--ink)"}} onClick={()=>navigate("login")}>
                免费创建账号 <Icon.Arrow/>
              </button>
              <button className="btn btn-lg btn-ghost" style={{color:"var(--bg)"}}>看看价格</button>
            </div>
          </div>
          <div style={{position:"relative", display:"flex", flexDirection:"column", gap:12}}>
            {["真人录音的 600+ 场景对话", "AI 发音评估 + 复读机式跟读", "中英双语切换，照顾不同水平", "桌面、iOS、Android 多端同步"].map(t=>(
              <div key={t} style={{display:"flex", gap:12, alignItems:"flex-start", padding:"14px 16px", borderRadius:14, background:"color-mix(in oklab, var(--bg) 8%, transparent)", border:"1px solid color-mix(in oklab, var(--bg) 16%, transparent)"}}>
                <span style={{color:"var(--green-2)", marginTop:1}}><Icon.Check/></span>
                <span style={{fontSize:15}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.LandingPage = LandingPage;
