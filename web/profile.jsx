/* ─── Profile / Personal center ─────────────────── */
function ProfilePage({ tweaks, setTweak }) {
  const [tab, setTab] = useState("overview");
  return (
    <main className="wrap" style={{padding:"56px 32px 96px"}}>
      {/* Hero header */}
      <div style={{display:"grid", gridTemplateColumns:"auto 1fr auto", gap:24, alignItems:"center", marginBottom:36}}>
        <div style={{
          width:96, height:96, borderRadius:"50%",
          background:"linear-gradient(135deg, #7A9A75, #3F5546)", color:"#FFFEF6",
          display:"grid", placeItems:"center", fontFamily:"var(--serif)", fontSize:36,
          border:"3px solid var(--bg-2)", boxShadow:"var(--shadow)",
        }}>LX</div>
        <div>
          <div className="eyebrow" style={{marginBottom:8}}>个人主页</div>
          <h1 className="display" style={{fontSize:44, margin:0}}>Liu Xiang</h1>
          <div style={{display:"flex", gap:14, marginTop:8, color:"var(--ink-3)", fontSize:13.5, alignItems:"center"}}>
            <span>liuxiang@outlook.com</span>
            <span>·</span>
            <span>加入于 2025 年 11 月</span>
            <span>·</span>
            <span className="chip chip-green"><Icon.Spark/> Pro 会员</span>
          </div>
        </div>
        <div style={{display:"flex", gap:10}}>
          <button className="btn btn-outline btn-sm">编辑资料</button>
          <button className="btn btn-primary btn-sm"><Icon.Settings/> 设置</button>
        </div>
      </div>

      {/* tabs */}
      <div style={{display:"flex", gap:0, borderBottom:"1px solid var(--line)", marginBottom:32}}>
        {[["overview","总览"],["progress","学习进度"],["vocab","生词本"],["account","账户与计划"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
                  className="btn btn-ghost"
                  style={{
                    height:44, padding:"0 18px", borderRadius:0, fontSize:14,
                    color: tab===k ? "var(--ink)" : "var(--ink-3)",
                    borderBottom: "2px solid " + (tab===k ? "var(--ink)" : "transparent"),
                    marginBottom:-1,
                  }}>{l}</button>
        ))}
      </div>

      {tab==="overview"  && <OverviewTab/>}
      {tab==="progress"  && <ProgressTab/>}
      {tab==="vocab"     && <VocabTab/>}
      {tab==="account"   && <AccountTab tweaks={tweaks} setTweak={setTweak}/>}
    </main>
  );
}

function OverviewTab() {
  return (
    <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:24}}>
      <div style={{display:"flex", flexDirection:"column", gap:24}}>
        {/* level card */}
        <div className="card" style={{padding:"24px 26px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div>
              <div className="eyebrow" style={{fontSize:11, marginBottom:6}}>水平评估 · CEFR</div>
              <div style={{display:"flex", alignItems:"baseline", gap:14}}>
                <span style={{fontFamily:"var(--serif)", fontSize:60, lineHeight:1, color:"var(--ink)"}}>A2</span>
                <div>
                  <div style={{fontSize:15, color:"var(--ink)"}}>初级 · 旅行口语</div>
                  <div style={{fontSize:12.5, color:"var(--ink-3)"}}>距离 B1 还差 12 节核心课程</div>
                </div>
              </div>
            </div>
            <button className="btn btn-outline btn-sm">重新测评 →</button>
          </div>
          {/* level bar */}
          <div style={{display:"flex", gap:6, marginTop:24}}>
            {["A1","A2","B1","B2","C1","C2"].map((lv,i)=>{
              const passed = i<=1, current = i===1;
              return (
                <div key={lv} style={{flex:1, display:"flex", flexDirection:"column", gap:8}}>
                  <div style={{height:6, borderRadius:99,
                                background: passed ? "var(--green)" : "var(--bg-3)"}}/>
                  <span style={{fontSize:11.5, fontFamily:"var(--mono)", color: current ? "var(--ink)" : "var(--ink-4)", fontWeight: current?600:400}}>{lv}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* in-progress courses */}
        <div className="card" style={{padding:"24px 26px"}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:18}}>
            <span className="display" style={{fontSize:24}}>正在学习</span>
            <a href="#" style={{fontSize:13, color:"var(--green)"}}>全部 →</a>
          </div>
          {[
            { t:"机场值机", en:"Airport check-in", p:33, icon:"Plane" },
            { t:"酒店入住", en:"Hotel check-in",   p:60, icon:"Bed"   },
            { t:"超市购物", en:"At the grocery store", p:25, icon:"Cart" },
          ].map((c,i)=>{
            const IconC = Icon[c.icon];
            return (
              <div key={i} style={{display:"flex", gap:14, alignItems:"center", padding:"14px 0", borderTop: i?"1px dashed var(--line)":"none"}}>
                <span style={{width:42, height:42, borderRadius:12, background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center", flex:"0 0 auto"}}>
                  <IconC/>
                </span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--serif)", fontSize:18, color:"var(--ink)"}}>{c.t}</div>
                  <div style={{fontSize:12.5, color:"var(--ink-3)", fontStyle:"italic"}}>{c.en}</div>
                </div>
                <div style={{width:160}}>
                  <div style={{height:4, background:"var(--bg-3)", borderRadius:99, overflow:"hidden"}}>
                    <div style={{height:"100%", width:c.p+"%", background:"var(--green)"}}/>
                  </div>
                  <div style={{fontSize:11.5, color:"var(--ink-3)", marginTop:4, fontFamily:"var(--mono)"}}>{c.p}%</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>navigate("detail")}><Icon.Arrow/></button>
              </div>
            );
          })}
        </div>

        {/* recommendations */}
        <div className="card" style={{padding:"24px 26px"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
            <span className="display" style={{fontSize:24}}>给你的下一步</span>
            <span style={{fontSize:12, color:"var(--ink-3)"}}>基于你 33% 完成的旅行场景</span>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14}}>
            {[
              ["机场安检","Security check","Plane"],
              ["登机口对话","At the gate","Plane"],
              ["遇上误机","Missed flight","Plane"],
            ].map(([t,en,ic],i)=>{
              const IconC = Icon[ic];
              return (
                <a key={i} href="#" onClick={(e)=>{e.preventDefault(); navigate("detail");}}
                   style={{display:"flex", flexDirection:"column", gap:8, padding:"14px 16px", borderRadius:14, background:"var(--bg-3)", color:"var(--ink-2)"}}>
                  <IconC/>
                  <div style={{fontFamily:"var(--serif)", fontSize:16, color:"var(--ink)"}}>{t}</div>
                  <div style={{fontSize:12, color:"var(--ink-3)", fontStyle:"italic"}}>{en}</div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* right column */}
      <div style={{display:"flex", flexDirection:"column", gap:24}}>
        {/* achievements */}
        <div className="card" style={{padding:"22px 24px"}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:14}}>
            <div className="eyebrow" style={{fontSize:11}}>成就 · 6 / 18</div>
            <a href="#" style={{fontSize:12, color:"var(--green)"}}>全部</a>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10}}>
            {[
              ["首次开口","var(--green)", true],
              ["7 天连击","var(--gold)",  true],
              ["100 词","var(--green)",   true],
              ["对话 10 节","var(--green)",true],
              ["夜猫学者","var(--ink-3)", false],
              ["500 词","var(--ink-3)",   false],
            ].map(([t, c, ok], i)=>(
              <div key={i} style={{display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"12px 4px", borderRadius:12, background: ok?"var(--bg-3)":"transparent", border: ok?"1px solid var(--line)":"1px dashed var(--line)", opacity: ok?1:.55}}>
                <span style={{
                  width:36, height:36, borderRadius:"50%",
                  background: ok ? c : "var(--bg-3)",
                  color: ok ? "#FFFEF6" : "var(--ink-4)",
                  display:"grid", placeItems:"center",
                }}>
                  <Icon.Spark/>
                </span>
                <span style={{fontSize:11, color: ok?"var(--ink-2)":"var(--ink-4)", textAlign:"center"}}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* goal */}
        <div style={{padding:"22px 24px", borderRadius:20, background:"var(--ink)", color:"var(--bg)"}}>
          <div style={{fontSize:11, color:"color-mix(in oklab, var(--bg) 60%, transparent)", letterSpacing:0.12, textTransform:"uppercase", marginBottom:8}}>本月目标</div>
          <div style={{fontFamily:"var(--serif)", fontSize:24, lineHeight:1.35}}>
            5 月份完成 <span style={{color:"var(--green-2)"}}>20 节</span> 旅行对话。
          </div>
          <div style={{margin:"16px 0 8px", height:6, background:"color-mix(in oklab, var(--bg) 14%, transparent)", borderRadius:99, overflow:"hidden"}}>
            <div style={{width:"58%", height:"100%", background:"var(--green-2)"}}/>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:12, color:"color-mix(in oklab, var(--bg) 70%, transparent)"}}>
            <span>11 / 20</span>
            <span>还有 10 天</span>
          </div>
        </div>

        {/* daily reminder card */}
        <div className="card" style={{padding:"22px 24px"}}>
          <div className="eyebrow" style={{fontSize:11, marginBottom:10}}>每日提醒</div>
          <div style={{fontSize:14, color:"var(--ink-2)", lineHeight:1.5}}>
            晚上 9:00 给你一条小通知，「今天就练 8 句」。
          </div>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14}}>
            <span style={{fontSize:13, color:"var(--ink-3)"}}>已开启</span>
            <Toggle on={true}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressTab() {
  return (
    <div className="card" style={{padding:"40px 28px"}}>
      <div style={{textAlign:"center", color:"var(--ink-3)"}}>
        <Icon.Book/>
        <div style={{marginTop:8, fontFamily:"var(--serif)", fontSize:22, color:"var(--ink-2)"}}>学习进度</div>
        <div style={{marginTop:6, fontSize:14}}>这里会展示你每个分类下的完成率与学习路径。</div>
      </div>
    </div>
  );
}
function VocabTab() {
  const words = [
    ["boarding pass","登机牌","已掌握"],
    ["aisle","靠过道","学习中"],
    ["passport","护照","已掌握"],
    ["carry-on","随身行李","学习中"],
    ["scale","秤","新词"],
    ["pleasant","愉快的","学习中"],
    ["overweight","超重的","新词"],
    ["gate","登机口","已掌握"],
  ];
  return (
    <div className="card" style={{padding:"22px 24px"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
        <div>
          <div className="eyebrow" style={{fontSize:11, marginBottom:4}}>生词本 · 124 词</div>
          <span className="display" style={{fontSize:26}}>最近添加</span>
        </div>
        <button className="btn btn-primary btn-sm">抽认卡复习 →</button>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:14}}>
        {words.map(([en, zh, s], i)=>(
          <div key={i} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", border:"1px solid var(--line)", borderRadius:14, background:"var(--bg-2)"}}>
            <div>
              <div style={{fontFamily:"var(--serif)", fontSize:18, color:"var(--ink)"}}>{en}</div>
              <div style={{fontSize:12.5, color:"var(--ink-3)"}}>{zh}</div>
            </div>
            <span className={"chip " + (s==="已掌握"?"chip-green":s==="新词"?"chip-gold":"")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function AccountTab({ tweaks, setTweak }) {
  return (
    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:24}}>
      <div className="card" style={{padding:"24px 26px"}}>
        <div className="eyebrow" style={{fontSize:11, marginBottom:10}}>订阅计划</div>
        <div style={{display:"flex", alignItems:"baseline", gap:8, marginBottom:10}}>
          <span style={{fontFamily:"var(--serif)", fontSize:34, color:"var(--ink)"}}>Pro 年付</span>
          <span className="chip chip-green">活跃</span>
        </div>
        <p style={{margin:0, color:"var(--ink-3)", fontSize:13.5}}>下一次续费：2026 年 11 月 8 日 · ¥ 588 / 年</p>
        <div className="hr" style={{margin:"18px 0"}}/>
        <div style={{display:"flex", flexDirection:"column", gap:10, color:"var(--ink-2)", fontSize:14}}>
          {["所有 600+ 场景对话","AI 角色扮演对话","离线下载音频","CEFR 等级评估"].map(t=>(
            <div key={t} style={{display:"flex", gap:10, alignItems:"center"}}><span style={{color:"var(--green)"}}><Icon.Check/></span> {t}</div>
          ))}
        </div>
        <div style={{display:"flex", gap:10, marginTop:18}}>
          <button className="btn btn-outline btn-sm">管理订阅</button>
          <button className="btn btn-ghost btn-sm">取消</button>
        </div>
      </div>

      <div className="card" style={{padding:"24px 26px"}}>
        <div className="eyebrow" style={{fontSize:11, marginBottom:14}}>偏好</div>
        <SettingRow title="深色模式" sub="夜里更柔和" right={<Toggle on={tweaks.dark} onChange={(v)=>setTweak("dark", v)}/>}/>
        <SettingRow title="对话默认显示" sub="新课程的默认设置" right={
          <div style={{display:"flex", padding:3, border:"1px solid var(--line)", borderRadius:999, background:"var(--bg)"}}>
            {[["english-only","仅英文"],["bilingual","中英"]].map(([k,l])=>(
              <button key={k} onClick={()=>setTweak("dialogMode",k)} className="btn btn-sm"
                      style={{height:26, padding:"0 12px", fontSize:12,
                              background: tweaks.dialogMode===k ? "var(--ink)" : "transparent",
                              color: tweaks.dialogMode===k ? "var(--bg)" : "var(--ink-3)",
                              borderRadius:999}}>{l}</button>
            ))}
          </div>
        }/>
        <SettingRow title="每日提醒" sub="晚上 9:00" right={<Toggle on={true}/>}/>
        <SettingRow title="自动播放下一句" sub="听完一句后停顿 1 秒" right={<Toggle on={false}/>}/>
        <SettingRow title="发音评估" sub="使用麦克风录音评估" right={<Toggle on={true}/>} last/>
      </div>
    </div>
  );
}
function SettingRow({ title, sub, right, last }) {
  return (
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom: last?"none":"1px dashed var(--line)"}}>
      <div>
        <div style={{fontSize:14.5, color:"var(--ink)"}}>{title}</div>
        <div style={{fontSize:12.5, color:"var(--ink-3)", marginTop:2}}>{sub}</div>
      </div>
      {right}
    </div>
  );
}
function Toggle({ on, onChange }) {
  const [internal, setInternal] = useState(on);
  const val = onChange ? on : internal;
  const set = (v) => onChange ? onChange(v) : setInternal(v);
  return (
    <button onClick={()=>set(!val)}
            style={{
              width:42, height:24, borderRadius:99,
              background: val ? "var(--green)" : "var(--bg-3)",
              border:"1px solid " + (val ? "var(--green-2)" : "var(--line)"),
              padding:2, transition:"background .2s"
            }}>
      <span style={{
        display:"block", width:18, height:18, borderRadius:"50%",
        background:"#FFFEF6",
        boxShadow:"0 1px 2px rgba(0,0,0,.2)",
        transform: val ? "translateX(18px)" : "translateX(0)",
        transition:"transform .2s",
      }}/>
    </button>
  );
}

window.ProfilePage = ProfilePage;
