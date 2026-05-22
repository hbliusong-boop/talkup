/* ─── Scenarios list ─────────────────────────────── */
const CATEGORIES = [
  { key:"all",     label:"全部",   count:0,  icon:null },
  { key:"work",    label:"职场",   count:0, icon:"briefcase"},
  { key:"travel",  label:"旅行",   count:0, icon:"plane"  },
  { key:"life",    label:"日常",   count:0, icon:"coffee" },
  { key:"hotel",   label:"住宿",   count:0, icon:"bed"    },
  { key:"shop",    label:"购物",   count:0, icon:"cart"   },
];
const ICON_MAP = { plane:"Plane", briefcase:"Briefcase", coffee:"Coffee", bed:"Bed", cart:"Cart", phone:"Phone" };

function ScenariosPage() {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    API.scenarios().then(data => {
      if (Array.isArray(data)) {
        setScenes(data);
        // update category counts
        const cats = {};
        data.forEach(s => { cats[s.cat] = (cats[s.cat] || 0) + 1; });
        // counts updated via state if needed
      }
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
                  className="btn btn-sm"
                  style={{
                    background: cat===c.key ? "var(--ink)" : "var(--bg-2)",
                    color: cat===c.key ? "var(--bg)" : "var(--ink-2)",
                    border:"1px solid " + (cat===c.key ? "var(--ink)" : "var(--line)"),
                  }}>
            {c.label}
            <span style={{opacity:.5, fontFamily:"var(--mono)", fontSize:11}}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* level filter */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, color:"var(--ink-3)", fontSize:13}}>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <span style={{fontSize:12.5}}>难度</span>
          {["all","A1","A2","B1","B2","C1"].map(l=>(
            <button key={l} onClick={()=>setLevel(l)}
                    className="chip"
                    style={{
                      background: level===l ? "var(--green-4)" : "var(--bg-2)",
                      color: level===l ? "var(--green)" : "var(--ink-3)",
                      borderColor: level===l ? "color-mix(in oklab, var(--green) 22%, transparent)" : "var(--line)",
                      cursor:"pointer", fontFamily: l==="all" ? "var(--sans)" : "var(--mono)"
                    }}>
              {l==="all" ? "全部" : l}
            </button>
          ))}
        </div>
        <div style={{display:"flex", gap:18}}>
          <span>共 {filtered.length} 个场景</span>
        </div>
      </div>

      {/* featured */}
      {featured && cat==="all" && level==="all" && q==="" && (
        <FeaturedSceneCard scene={featured}/>
      )}

      {/* grid */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16}}>
        {filtered.filter(s => !(cat==="all" && q==="" && level==="all" && s.id===(featured||{}).id)).map(s=>(
          <SceneCard key={s.id} scene={s}/>
        ))}
      </div>
    </main>
  );
}

/* ── SceneCard ───────────────────────────────────────── */
function SceneCard({ scene }) {
  const catIcons = { work:"briefcase", travel:"plane", life:"coffee", hotel:"bed", shop:"cart" };
  const catColors = { work:"#7C5CFB", travel:"#4F8EF7", life:"#FF6B4A", hotel:"#34C759", shop:"#FFB800" };
  return (
    <a href="#" className="scene-card" onClick={e=>{e.preventDefault(); isLoggedIn() ? navigate("detail", { id: scene.id }) : navigate("login");}}>
      <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
        <span style={{
          width:32, height:32, borderRadius:8,
          background: catColors[scene.cat] + "22",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16
        }}>
          {(()=>{ const C=Icon[Icon[catIcons[scene.cat]||"Plane"]||"Plane"]; return null; })()}
        </span>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontWeight:600, fontSize:15, marginBottom:2}}>{scene.t}</div>
          <div style={{fontSize:12, color:"var(--ink-3)"}}>{scene.en}</div>
        </div>
        {scene.level && <span className="chip" style={{fontFamily:"var(--mono)", fontSize:11}}>{scene.level}</span>}
      </div>
      <p style={{fontSize:13, color:"var(--ink-2)", margin:"0 0 14px", lineHeight:1.5}}>{scene.desc}</p>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, color:"var(--ink-3)"}}>
        <span>{scene.time}分钟 · {scene.lessons}课</span>
        <span>{scene.learners || "0"}学过</span>
      </div>
      {scene.progress > 0 && (
        <div style={{marginTop:10, height:3, background:"var(--line)", borderRadius:2}}>
          <div style={{width:scene.progress+"%", height:"100%", background:"var(--green)", borderRadius:2}}/>
        </div>
      )}
    </a>
  );
}

/* ── FeaturedSceneCard ───────────────────────────── */
function FeaturedSceneCard({ scene }) {
  return (
    <a href="#" className="scene-card featured" onClick={e=>{e.preventDefault(); isLoggedIn() ? navigate("detail", { id: scene.id }) : navigate("login");}}
       style={{display:"block", padding:"28px 32px", marginBottom:28, background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderRadius:16, color:"inherit", textDecoration:"none"}}>
      <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:16}}>
        <GreenRibbon label="精选" num={scene.cat === "work" ? "职场" : scene.cat === "travel" ? "旅行" : "日常"}/>
        <span style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--green-3)"}}>{scene.level}</span>
      </div>
      <h2 style={{fontSize:28, fontWeight:600, margin:"0 0 8px", color:"var(--bg)"}}>{scene.t}</h2>
      <p style={{color:"rgba(255,255,255,0.6)", fontSize:15, margin:"0 0 20px"}}>{scene.en}</p>
      <p style={{color:"rgba(255,255,255,0.5)", fontSize:13, margin:0, lineHeight:1.6}}>{scene.desc}</p>
      <div style={{display:"flex", gap:24, marginTop:20, fontSize:13, color:"rgba(255,255,255,0.5)"}}>
        <span>{scene.time}分钟</span>
        <span>{scene.lessons}课</span>
        <span>{scene.learners}学过</span>
      </div>
    </a>
  );
}
