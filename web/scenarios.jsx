/* ─── Scenarios list ─────────────────────────────── */
const CATEGORIES = [
  { key:"all",   label:"全部",   count:0,  icon:null },
  { key:"work",  label:"职场",   count:0, icon:"Briefcase"},
  { key:"travel",label:"旅行",   count:0, icon:"Plane"  },
  { key:"life",  label:"日常",   count:0, icon:"Coffee" },
  { key:"hotel", label:"住宿",   count:0, icon:"Bed"    },
  { key:"shop",  label:"购物",   count:0, icon:"Cart"   },
];

function ScenariosPage() {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    API.scenarios().then(data => {
      if (Array.isArray(data)) setScenes(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = scenes.filter(s =>
    (cat==="all" || s.cat===cat) &&
    (level==="all" || s.level===level) &&
    (q==="" || s.t.includes(q) || (s.en||"").toLowerCase().includes(q.toLowerCase()))
  );

  const featured = scenes.find(s => s.featured) || scenes[0];
  const cats = useMemo(() => {
    const c = {};
    scenes.forEach(s => { c[s.cat] = (c[s.cat]||0) + 1; });
    return CATEGORIES.map(k => ({ ...k, count: k.key==="all" ? scenes.length : (c[k.key]||0) }));
  }, [scenes]);

  if (loading) return <div style={{padding:80, textAlign:"center", color:"var(--ink-3)"}}>加载中...</div>;

  return (
    <main className="wrap" style={{padding:"56px 32px 96px"}}>
      <PageHeader
        eyebrow={`场景库 · ${scenes.length} 个对话`}
        title={<>挑一个<i style={{color:"var(--green)"}}>今天</i>就用得上的。</>}
        sub="从真实生活场景出发，每节课只有一个目标——把那段对话听懂、说顺。"
      />

      {/* search */}
      <div style={{position:"relative", marginBottom:24}}>
        <input className="input" placeholder="搜场景，如「值机」「面试」"
               value={q} onChange={(e)=>setQ(e.target.value)}
               style={{width:320, paddingLeft:38}}/>
        <span style={{position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)"}}>
          <Icon.Search/>
        </span>
      </div>

      {/* category bar */}
      <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
        {cats.map(c=>(
          <button key={c.key}
                  onClick={()=>setCat(c.key)}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    height:36, padding:"0 14px",
                    borderRadius:"999px", fontWeight:500, fontSize:13.5,
                    border:"1px solid " + (cat===c.key ? "var(--ink)" : "var(--line)"),
                    background: cat===c.key ? "var(--ink)" : "transparent",
                    color: cat===c.key ? "var(--bg)" : "var(--ink-2)",
                    cursor:"pointer", transition:"all .15s"
                  }}>
            {c.icon && React.createElement(Icon[c.icon])}
            {c.label}
            <span style={{opacity:.5, fontFamily:"var(--mono)", fontSize:11}}>{c.count}</span>
          </button>
        ))}
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <span style={{fontSize:13, color:"var(--ink-3)"}}>共 {filtered.length} 个场景</span>
        <select value={level} onChange={e=>setLevel(e.target.value)} className="input" style={{width:120, height:32, fontSize:12}}>
          <option value="all">全部等级</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
        </select>
      </div>

      {/* featured */}
      {featured && cat==="all" && level==="all" && q==="" && (
        <FeaturedSceneCard scene={featured}/>
      )}

      {/* grid */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:18, marginTop: cat==="all" && q==="" && level==="all" ? 18 : 0}}>
        {filtered.filter(s => !(cat==="all" && q==="" && level==="all" && s.id===(featured||{}).id)).map(s=>(
          <SceneCard key={s.id} scene={s}/>
        ))}
      </div>
    </main>
  );
}

/* ── SceneCard ───────────────────────────────────────── */
function SceneCard({ scene }) {
  const catIcons = { work:"Briefcase", travel:"Plane", life:"Coffee", hotel:"Bed", shop:"Cart" };
  const catColors = { work:"#7C5CFB", travel:"#4F8EF7", life:"#FF6B4A", hotel:"#34C759", shop:"#FFB800" };
  const bgColors = { work:"#7C5CFB18", travel:"#4F8EF718", life:"#FF6B4A18", hotel:"#34C75918", shop:"#FFB80018" };
  const bgColor = bgColors[scene.cat] || "#4F8EF718";
  const iconColor = catColors[scene.cat] || "#4F8EF7";
  return (
    <a href="#" className="card" onClick={e=>{e.preventDefault(); isLoggedIn() ? navigate("detail", { id: scene.id }) : navigate("login");}}
       style={{padding:20, display:"flex", flexDirection:"column", gap:14, transition:"border-color .15s, transform .12s", cursor:"pointer"}}
       onMouseEnter={e=>e.currentTarget.style.borderColor="var(--green)"}
       onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{width:40, height:40, borderRadius:12, background:bgColor, color:iconColor, display:"grid", placeItems:"center", fontSize:20}}>
          {React.createElement(Icon[catIcons[scene.cat] || "Plane"])}
        </span>
        {scene.level && <span className="chip" style={{fontFamily:"var(--mono)", fontSize:11}}>{scene.level}</span>}
      </div>
      <div>
        <div style={{fontWeight:600, fontSize:17, marginBottom:2}}>{scene.t}</div>
        <div style={{fontSize:12, color:"var(--ink-3)", fontStyle:"italic"}}>{scene.en}</div>
      </div>
      <p style={{margin:0, color:"var(--ink-2)", fontSize:13.5, lineHeight:1.5, flex:1}}>{scene.desc}</p>
      <div className="hr"/>
      <div style={{display:"flex", justifyContent:"space-between", color:"var(--ink-3)", fontSize:12.5}}>
        <span style={{display:"inline-flex", alignItems:"center", gap:6}}><Icon.Book/> {scene.lessons}节</span>
        <span style={{display:"inline-flex", alignItems:"center", gap:6}}><Icon.Clock/> {scene.time}分</span>
        <span style={{fontFamily:"var(--mono)"}}>{scene.learners || "0"}学过</span>
      </div>
    </a>
  );
}

/* ── FeaturedSceneCard ───────────────────────────── */
function FeaturedSceneCard({ scene }) {
  const catIcons = { work:"Briefcase", travel:"Plane", life:"Coffee", hotel:"Bed", shop:"Cart" };
  const catColors = { work:"#7C5CFB", travel:"#4F8EF7", life:"#FF6B4A", hotel:"#34C759", shop:"#FFB800" };
  const catLabels = { work:"职场", travel:"旅行", life:"日常", hotel:"住宿", shop:"购物" };
  const bgColor = catColors[scene.cat] || "#4F8EF7";
  return (
    <a href="#" className="card" onClick={e=>{e.preventDefault(); isLoggedIn() ? navigate("detail", { id: scene.id }) : navigate("login");}}
       style={{padding:0, overflow:"hidden", border:"1px solid var(--line)", display:"block", marginBottom:24, cursor:"pointer"}}
       onMouseEnter={e=>e.currentTarget.style.borderColor="var(--green)"}
       onMouseLeave={e=>e.currentTarget.style.borderColor="var(--line)"}}>
      <div style={{display:"grid", gridTemplateColumns:"1.1fr 1fr", minHeight:240}}>
        <div style={{padding:"32px 36px", display:"flex", flexDirection:"column", justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
              <span className="chip chip-gold">本周精选</span>
              <span className="chip" style={{background:bgColor+"18", color:bgColor}}>{catLabels[scene.cat] || "场景"}</span>
            </div>
            <h2 style={{fontFamily:"var(--serif)", fontSize:38, margin:"0 0 6px", letterSpacing:"-0.02em", color:"var(--ink)"}}>{scene.t}</h2>
            <div style={{fontFamily:"var(--serif)", fontStyle:"italic", color:"var(--ink-3)", fontSize:17, marginBottom:14}}>{scene.en}</div>
            <p style={{maxWidth:400, color:"var(--ink-2)", fontSize:14, lineHeight:1.55}}>{scene.desc}</p>
          </div>
          <div style={{display:"flex", gap:10, alignItems:"center", marginTop:20}}>
            <span className="chip">{scene.level}</span>
            <span style={{fontSize:13, color:"var(--ink-3)"}}><Icon.Clock/> {scene.time}分钟</span>
            <span style={{fontSize:13, color:"var(--ink-3)"}}><Icon.Book/> {scene.lessons}节</span>
          </div>
        </div>
        <div style={{background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:32}}>
          <div style={{width:80, height:80, borderRadius:20, background:bgColor+"33", display:"grid", placeItems:"center", fontSize:40}}>
            {React.createElement(Icon[catIcons[scene.cat] || "Plane"])}
          </div>
        </div>
      </div>
    </a>
  );
}

window.ScenariosPage = ScenariosPage;