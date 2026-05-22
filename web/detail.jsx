/* ─── Learning Detail (dialogue) ─────────────────── */

/* Airport Check-in — full dialogue + word-level vocab */
const DIALOG = [
  { sp:"Agent",     a:"agent",   en:"Good morning. May I see your passport and ticket, please?",
                    zh:"早上好。可以让我看一下您的护照和机票吗？",
                    vocab:["passport","ticket"] },
  { sp:"Passenger", a:"you",     en:"Here you are. I'm flying to San Francisco.",
                    zh:"给您。我要飞旧金山。",
                    vocab:["flying"] },
  { sp:"Agent",     a:"agent",   en:"Thank you. Are you checking any bags today?",
                    zh:"谢谢。今天有要托运的行李吗？",
                    vocab:["checking","bags"] },
  { sp:"Passenger", a:"you",     en:"Just one suitcase. My carry-on goes with me.",
                    zh:"只有一件行李箱。这个随身包我带上飞机。",
                    vocab:["suitcase","carry-on"] },
  { sp:"Agent",     a:"agent",   en:"Could you place it on the scale, please?",
                    zh:"麻烦把它放上称重台好吗？",
                    vocab:["scale"] },
  { sp:"Passenger", a:"you",     en:"Sure. Is it within the weight limit?",
                    zh:"好的。在重量范围里吗？",
                    vocab:["weight","limit"] },
  { sp:"Agent",     a:"agent",   en:"You're good — 22 kilos. Would you prefer a window or an aisle seat?",
                    zh:"没问题——22 公斤。您想要靠窗还是靠过道的座位？",
                    vocab:["kilos","window","aisle"] },
  { sp:"Passenger", a:"you",     en:"A window seat, please.",
                    zh:"靠窗的，谢谢。",
                    vocab:[] },
  { sp:"Agent",     a:"agent",   en:"Here's your boarding pass. Gate 14, boarding starts at 9:45. Have a pleasant flight.",
                    zh:"这是您的登机牌。14 号登机口，9 点 45 开始登机。祝您旅途愉快。",
                    vocab:["boarding pass","gate","boarding","pleasant"] },
];

const VOCAB_DEFS = {
  "passport":     { ipa:"/ˈpæs.pɔːrt/", pos:"n.", zh:"护照", ex:"Please show me your passport." },
  "ticket":       { ipa:"/ˈtɪk.ɪt/",    pos:"n.", zh:"机票；票据", ex:"I lost my ticket." },
  "flying":       { ipa:"/ˈflaɪ.ɪŋ/",   pos:"v.", zh:"飞往；正在飞", ex:"I'm flying to Tokyo tonight." },
  "checking":     { ipa:"/ˈtʃek.ɪŋ/",   pos:"v.", zh:"托运（行李）", ex:"Are you checking any bags?" },
  "bags":         { ipa:"/bæɡz/",       pos:"n.", zh:"行李，包", ex:"How many bags do you have?" },
  "suitcase":     { ipa:"/ˈsuːt.keɪs/", pos:"n.", zh:"行李箱", ex:"My suitcase is over there." },
  "carry-on":     { ipa:"/ˈker.i.ɑːn/", pos:"n.", zh:"随身行李", ex:"This is a carry-on bag." },
  "scale":        { ipa:"/skeɪl/",      pos:"n.", zh:"秤；称重台", ex:"Put your luggage on the scale." },
  "weight":       { ipa:"/weɪt/",       pos:"n.", zh:"重量", ex:"What is the weight limit?" },
  "limit":        { ipa:"/ˈlɪm.ɪt/",    pos:"n.", zh:"限额", ex:"There's a baggage weight limit." },
  "kilos":        { ipa:"/ˈkiː.loʊz/",  pos:"n.", zh:"公斤", ex:"It weighs 22 kilos." },
  "window":       { ipa:"/ˈwɪn.doʊ/",   pos:"n.", zh:"靠窗（位）", ex:"I'd like a window seat." },
  "aisle":        { ipa:"/aɪl/",        pos:"n.", zh:"靠过道", ex:"An aisle seat, please." },
  "boarding pass":{ ipa:"/ˈbɔːr.dɪŋ pæs/", pos:"n.", zh:"登机牌", ex:"Here is your boarding pass." },
  "gate":         { ipa:"/ɡeɪt/",       pos:"n.", zh:"登机口", ex:"Boarding at Gate 14." },
  "boarding":     { ipa:"/ˈbɔːr.dɪŋ/",  pos:"n.", zh:"登机", ex:"Boarding starts at 9:45." },
  "pleasant":     { ipa:"/ˈplez.ənt/",  pos:"adj.", zh:"愉快的", ex:"Have a pleasant flight." },
};

function DetailPage({ tweaks, setTweak, params }) {
  const bilingual = tweaks.dialogMode !== "english-only";
  const [activeIdx, setActiveIdx] = useState(-1);
  const [activeWord, setActiveWord] = useState(-1); // word index within line
  const [playMode, setPlayMode] = useState(null);   // null | "all" | "single"
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState("US-Female");
  const [openVocab, setOpenVocab] = useState(null); // {word, lineEl}
  const playRef = useRef({ stop:false });
  const [sceneData, setSceneData] = useState(null);
  const [sceneLoading, setSceneLoading] = useState(true);

  // Load scenario from API
  useEffect(() => {
    if (!params?.id) { setSceneLoading(false); return; }
    API.scenario(params.id).then(data => {
      setSceneData(data);
      setSceneLoading(false);
    }).catch(() => setSceneLoading(false));
  }, [params?.id]);

  // Speech synthesis
  const speak = useCallback((text, opts={}) => new Promise((res)=>{
    if (!("speechSynthesis" in window)) { setTimeout(res, 1200); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = speed;
    u.pitch = voice.includes("Female") ? 1.05 : 0.9;
    // try to pick a matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      const wantFem = voice.includes("Female");
      const pref = voices.find(v => v.lang.startsWith("en") && /female|samantha|victoria|karen|moira/i.test(v.name) === wantFem) || voices.find(v => v.lang.startsWith("en"));
      if (pref) u.voice = pref;
    }
    // approx word timing — sync highlight by char boundary
    u.onboundary = (ev) => {
      if (ev.name === "word") {
        opts.onWordAt && opts.onWordAt(ev.charIndex);
      }
    };
    u.onend = () => res();
    u.onerror = () => res();
    window.speechSynthesis.speak(u);
  }), [speed, voice]);

  const playLine = async (i) => {
    setActiveIdx(i);
    setActiveWord(-1);
    setPlayMode("single");
    const line = dialogues[i];
    const words = line.en.split(/\s+/);
    // word index lookup by char index
    const offsets = [];
    let acc = 0;
    for (const w of words) { offsets.push(acc); acc += w.length + 1; }
    await speak(line.en, {
      onWordAt: (ci) => {
        let idx = 0;
        for (let k=0; k<offsets.length; k++) if (ci >= offsets[k]) idx = k;
        setActiveWord(idx);
      }
    });
    setActiveWord(-1);
    setPlayMode(null);
  };

  const playAll = async () => {
    if (playMode==="all") { // stop
      playRef.current.stop = true;
      window.speechSynthesis.cancel();
      setPlayMode(null); setActiveIdx(-1); setActiveWord(-1);
      return;
    }
    playRef.current.stop = false;
    setPlayMode("all");
    for (let i=0; i<dialogues.length; i++) {
      if (playRef.current.stop) break;
      setActiveIdx(i); setActiveWord(-1);
      const line = dialogues[i];
      const words = line.en.split(/\s+/);
      const offsets = []; let acc=0;
      for (const w of words) { offsets.push(acc); acc += w.length + 1; }
      await speak(line.en, {
        onWordAt: (ci) => {
          let idx = 0;
          for (let k=0; k<offsets.length; k++) if (ci >= offsets[k]) idx = k;
          setActiveWord(idx);
        }
      });
      if (!playRef.current.stop) await new Promise(r=>setTimeout(r, 380));
    }
    setActiveIdx(-1); setActiveWord(-1); setPlayMode(null);
  };

  // overall progress is 4/9 completed for visual demo + active line
  const completedThrough = 4;
  const dialogues = sceneData?.dialogues || DIALOG;
  const progressPct = playMode==="all"
    ? Math.round(((activeIdx+1)/dialogues.length)*100)
    : Math.round((completedThrough/dialogues.length)*100);

  // cleanup speech on unmount
  useEffect(()=>()=>{ window.speechSynthesis?.cancel(); }, []);

  if (sceneLoading) return <div style={{padding:80, textAlign:"center", color:"var(--ink-3)"}}>加载中...</div>;

  // Category labels
  const catLabels = { work:"职场", travel:"旅行", life:"日常", hotel:"住宿", shop:"购物" };
  const catLabel = catLabels[sceneData?.cat] || sceneData?.cat || "场景";
  const sceneTitle = sceneData?.t || "机场值机";
  const sceneEn = sceneData?.en || "Airport check-in";

  return (
    <main style={{padding:"32px 32px 80px"}}>
      <div className="wrap" style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:40}}>
        {/* ── main column ── */}
        <div>
          {/* breadcrumb + back */}
          <div style={{display:"flex", alignItems:"center", gap:14, color:"var(--ink-3)", fontSize:13, marginBottom:18}}>
            <a href="#" onClick={(e)=>{e.preventDefault(); navigate("scenarios");}} style={{color:"var(--ink-3)"}}>场景库</a>
            <span>›</span>
            <span>{catLabel}</span>
            <span>›</span>
            <span style={{color:"var(--ink)"}}>{sceneTitle}</span>
          </div>

          {/* lesson header */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:24, marginBottom:28}}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                <span style={{width:44, height:44, borderRadius:13, background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center"}}>
                  <Icon.Plane/>
                </span>
                <div>
                  <div className="eyebrow" style={{fontSize:11, marginBottom:2}}>{sceneTitle} · 听说练习</div>
                  <h1 className="display" style={{fontSize:42, margin:0}}>{sceneEn}</h1>
                </div>
              </div>
              <p style={{margin:"4px 0 0", color:"var(--ink-3)", maxWidth:560}}>
                {sceneData?.desc || ''}
              </p>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8}}>
              <span style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--ink-3)"}}>{progressPct}% · {dialogues.length} 句</span>
              <div style={{width:180, height:6, background:"var(--bg-3)", borderRadius:99, overflow:"hidden"}}>
                <div style={{width:progressPct+"%", height:"100%", background:"var(--green)", transition:"width .3s"}}/>
              </div>
            </div>
          </div>

          {/* control bar */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 16px", background:"var(--bg-2)", border:"1px solid var(--line)",
            borderRadius:16, marginBottom:24
          }}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <button className="btn btn-primary" onClick={playAll}>
                {playMode==="all" ? <><Icon.Pause/> 暂停全部</> : <><Icon.Play/> 播放全部</>}
              </button>
              <button className="btn btn-outline btn-sm" onClick={()=>{ window.speechSynthesis?.cancel(); setActiveIdx(0); }}>
                <Icon.Repeat/> 从头来
              </button>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:14}}>
              {/* dialog mode quick toggle */}
              <div style={{display:"flex", padding:3, border:"1px solid var(--line)", borderRadius:999, background:"var(--bg)"}}>
                {[["english-only","仅英文"],["bilingual","中英"]].map(([k,l])=>(
                  <button key={k}
                    onClick={()=>setTweak("dialogMode", k)}
                    className="btn btn-sm"
                    style={{
                      height:28, padding:"0 12px", fontSize:12.5,
                      background: tweaks.dialogMode===k ? "var(--ink)" : "transparent",
                      color:      tweaks.dialogMode===k ? "var(--bg)" : "var(--ink-3)",
                      borderRadius:999
                    }}>{l}</button>
                ))}
              </div>
              {/* speed */}
              <div style={{display:"flex", padding:3, border:"1px solid var(--line)", borderRadius:999, background:"var(--bg)"}}>
                {[0.75,1,1.25].map(s=>(
                  <button key={s} onClick={()=>setSpeed(s)} className="btn btn-sm"
                          style={{height:28, padding:"0 10px", fontSize:12, fontFamily:"var(--mono)",
                                  background: speed===s ? "var(--ink)" : "transparent",
                                  color: speed===s ? "var(--bg)" : "var(--ink-3)",
                                  borderRadius:999}}>
                    {s}×
                  </button>
                ))}
              </div>
              {/* voice */}
              <select value={voice} onChange={(e)=>setVoice(e.target.value)}
                      style={{height:34, padding:"0 10px", border:"1px solid var(--line)", borderRadius:99, background:"var(--bg)", color:"var(--ink-2)", fontFamily:"var(--sans)", fontSize:12.5}}>
                <option>US-Female</option><option>US-Male</option><option>UK-Female</option>
              </select>
            </div>
          </div>

          {/* dialogue stream */}
          <div style={{position:"relative", display:"flex", flexDirection:"column", gap:14}} onClick={()=>setOpenVocab(null)}>
            {dialogues.map((line, i) => (
              <DialogTurn
                key={i}
                line={line}
                idx={i}
                active={activeIdx===i}
                activeWord={activeIdx===i ? activeWord : -1}
                bilingual={bilingual}
                done={i < completedThrough}
                playing={playMode==="all" && activeIdx===i}
                onPlay={()=>playLine(i)}
                onWordClick={(w, el)=>{ setOpenVocab({ word:w.toLowerCase(), x:el.offsetLeft, y:el.offsetTop, width:el.offsetWidth }); }}
              />
            ))}

            {/* vocab popover */}
            {openVocab && VOCAB_DEFS[openVocab.word] && (
              <VocabPopover info={VOCAB_DEFS[openVocab.word]} word={openVocab.word}
                            x={openVocab.x} y={openVocab.y} width={openVocab.width}
                            onClose={()=>setOpenVocab(null)} onPlay={()=>speak(openVocab.word)}/>
            )}
          </div>

          {/* bottom nav */}
          <div style={{display:"flex", justifyContent:"space-between", marginTop:36, paddingTop:24, borderTop:"1px solid var(--line)"}}>
            <button className="btn btn-outline">← Lesson 01 · 安检</button>
            <button className="btn btn-primary">完成本节，下一课 <Icon.Arrow/></button>
          </div>
        </div>

        {/* ── side panel ── */}
        <SidePanel speak={(t)=>speak(t)} goals={sceneData?.goals || []} phrases={sceneData?.phrases || []} vocab={sceneData?.vocab || []}/>
      </div>
    </main>
  );
}

/* ── one dialogue turn ── */
function DialogTurn({ line, idx, active, activeWord, bilingual, done, playing, onPlay, onWordClick }) {
  const isYou = line.a === "you";
  const words = line.en.split(/\s+/);
  return (
    <div
      data-comment-anchor={`dialog-turn-${idx}`}
      style={{
        display:"flex", gap:14,
        flexDirection: isYou ? "row-reverse" : "row",
        alignItems:"flex-start",
      }}>
      {/* avatar */}
      <div style={{flex:"0 0 auto", width:40, height:40, borderRadius:"50%",
                   background: isYou ? "var(--ink)" : "var(--green-4)",
                   color: isYou ? "var(--bg)" : "var(--green)",
                   display:"grid", placeItems:"center",
                   fontFamily:"var(--serif)", fontSize:16,
                   marginTop:6,
                   border: active ? `2px solid var(--green)` : "2px solid transparent"
                  }}>
        {isYou ? "You" : "A"}
      </div>

      {/* bubble */}
      <div style={{
        position:"relative", maxWidth:"82%",
        padding:"16px 20px", borderRadius:18,
        background: active ? "var(--green-4)" : "var(--bg-2)",
        border: "1px solid " + (active ? "color-mix(in oklab, var(--green) 25%, transparent)" : "var(--line)"),
        boxShadow: active ? "0 4px 18px -8px color-mix(in oklab, var(--green) 60%, transparent)" : "none",
        transition:"background .2s, border-color .2s",
      }} onClick={(e)=>e.stopPropagation()}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:6}}>
          <span style={{fontSize:11.5, color:"var(--ink-3)", fontWeight:600, letterSpacing:0.08, textTransform:"uppercase"}}>
            {line.sp} · {String(idx+1).padStart(2,"0")}
          </span>
          <div style={{display:"flex", gap:6, alignItems:"center"}}>
            {done && <span title="已掌握" style={{color:"var(--green)"}}><Icon.Check/></span>}
            <button className="btn btn-ghost btn-sm" onClick={onPlay} style={{height:30, width:30, padding:0, justifyContent:"center", color: active ? "var(--green)" : "var(--ink-3)"}}>
              {playing ? <Icon.Pause/> : <Icon.Play/>}
            </button>
          </div>
        </div>

        {/* English with word-level highlight + click */}
        <p style={{margin:0, fontFamily:"var(--serif)", fontSize:24, lineHeight:1.4, color:"var(--ink)", letterSpacing:"-0.01em"}}>
          {words.map((w,i)=>{
            const clean = w.replace(/[.,?!]/g,"").toLowerCase();
            const isVocab = line.vocab.some(v => clean===v || v.includes(clean) || clean.includes(v.split(/[\s-]/)[0]));
            const isActiveW = active && activeWord===i;
            return (
              <React.Fragment key={i}>
                <span
                  onClick={(e)=>{
                    e.stopPropagation();
                    if (isVocab) onWordClick(clean, e.currentTarget);
                  }}
                  style={{
                    background: isActiveW ? "color-mix(in oklab, var(--green) 28%, transparent)" : "transparent",
                    borderRadius:4, padding:"1px 2px",
                    transition:"background .12s",
                    textDecoration: isVocab ? "underline" : "none",
                    textDecorationStyle:"dotted",
                    textDecorationColor: "var(--green)",
                    textUnderlineOffset:6,
                    cursor: isVocab ? "pointer" : "default",
                  }}>{w}</span>
                {i<words.length-1 && " "}
              </React.Fragment>
            );
          })}
        </p>

        {/* Chinese */}
        {bilingual && (
          <p style={{margin:"8px 0 0", fontSize:14, color:"var(--ink-3)"}}>{line.zh}</p>
        )}
      </div>
    </div>
  );
}

/* ── vocab popover ── */
function VocabPopover({ info, word, onClose, onPlay }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:60, pointerEvents:"none",
      display:"grid", placeItems:"center",
    }}>
      <div style={{
        pointerEvents:"auto",
        background:"var(--bg-2)", border:"1px solid var(--line)",
        borderRadius:16, padding:"18px 20px", width:340, boxShadow:"var(--shadow-lg)",
      }}>
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"var(--serif)", fontSize:28, color:"var(--ink)"}}>{word}</div>
            <div style={{display:"flex", gap:10, alignItems:"center", marginTop:2}}>
              <span style={{fontFamily:"var(--mono)", fontSize:13, color:"var(--ink-3)"}}>{info.ipa}</span>
              <button className="btn btn-ghost btn-sm" onClick={onPlay} style={{height:26, padding:"0 8px", color:"var(--green)"}}>
                <Icon.Speaker/> 听
              </button>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{height:30, width:30, padding:0, justifyContent:"center"}}><Icon.X/></button>
        </div>
        <div className="hr" style={{margin:"14px 0"}}/>
        <div style={{display:"flex", gap:8, alignItems:"baseline"}}>
          <span className="chip" style={{height:22, fontStyle:"italic"}}>{info.pos}</span>
          <span style={{fontSize:15, color:"var(--ink)"}}>{info.zh}</span>
        </div>
        <p style={{margin:"14px 0 0", fontFamily:"var(--serif)", fontSize:15, color:"var(--ink-2)", fontStyle:"italic", lineHeight:1.5}}>
          "{info.ex}"
        </p>
        <div style={{display:"flex", gap:8, marginTop:16}}>
          <button className="btn btn-outline btn-sm grow" style={{justifyContent:"center"}}>加入生词本</button>
          <button className="btn btn-primary btn-sm grow" style={{justifyContent:"center"}}>抽认卡复习</button>
        </div>
      </div>
    </div>
  );
}

/* ── right side panel ── */
function SidePanel({ speak, goals, phrases, vocab }) {
  const goalsList = goals.length ? goals : [
    "听懂本场景的核心词汇和常用表达",
    "能够用简单句子回应对方",
    "掌握本场景核心词汇",
    "能够进行基础的角色扮演对话",
  ];
  const phrasesList = phrases.length ? phrases : [
    { tpl: ["Hello, ", "__"], blank: "example", use: "开场表达", ex: "Hello!", exZh: "你好！" },
    { tpl: ["Nice to ", "__", " you!"], blank: "meet", use: "初次见面", ex: "Nice to meet you!", exZh: "很高兴认识你！" },
  ];
  const vocabList = vocab.length ? vocab.map(v => [v.word, v.zh || v.ipa]) : [
    ["word", "释义"],
    ["example", "示例"],
  ];
  return (
    <aside style={{display:"flex", flexDirection:"column", gap:18, position:"sticky", top:88, alignSelf:"flex-start"}}>
      {/* scene context card */}
      <div className="card" style={{padding:18}}>
        <div className="eyebrow" style={{fontSize:11, marginBottom:12}}>这节课在练什么</div>
        <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10, fontSize:13.5, color:"var(--ink-2)"}}>
          {goalsList.map((t,i)=>(
            <li key={i} style={{display:"flex", gap:10}}>
              <span style={{flex:"0 0 auto", width:18, height:18, borderRadius:"50%", background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center", fontSize:11, fontFamily:"var(--mono)"}}>{i+1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* sentence patterns */}
      <div className="card" style={{padding:18}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14}}>
          <div className="eyebrow" style={{fontSize:11}}>常用句式 · {phrasesList.length}</div>
          <a href="#" style={{fontSize:12, color:"var(--green)"}}>全部</a>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:14}}>
          {phrasesList.map((p,i)=>(
            <div key={i} style={{
              padding:"12px 14px", borderRadius:12,
              background:"var(--bg)", border:"1px dashed var(--line)"
            }}>
              <div style={{
                fontFamily:"var(--serif)", fontSize:16.5, lineHeight:1.4,
                color:"var(--ink)", display:"flex", flexWrap:"wrap", alignItems:"baseline", gap:"0 4px"
              }}>
                {p.tpl.map((seg, k) => seg==="__" ? (
                  <span key={k} style={{
                    display:"inline-block",
                    padding:"1px 8px",
                    fontFamily:"var(--sans)",
                    fontSize:12.5,
                    color:"var(--green)",
                    background:"var(--green-4)",
                    border:"1px dashed color-mix(in oklab, var(--green) 35%, transparent)",
                    borderRadius:6,
                    fontStyle:"italic",
                  }}>{p.blank}</span>
                ) : <span key={k}>{seg}</span>)}
              </div>
              <div style={{fontSize:11.5, color:"var(--ink-4)", marginTop:6, letterSpacing:0.05}}>
                {p.use}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginTop:8, paddingTop:8, borderTop:"1px dashed var(--line)"}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, color:"var(--ink-2)", fontStyle:"italic"}}>"{p.ex}"</div>
                  <div style={{fontSize:11.5, color:"var(--ink-3)", marginTop:2}}>{p.exZh}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={()=>speak(p.ex)}
                        style={{width:28, height:28, padding:0, justifyContent:"center", color:"var(--ink-3)", flex:"0 0 auto"}}>
                  <Icon.Speaker/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* vocab list */}
      <div className="card" style={{padding:18}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
          <div className="eyebrow" style={{fontSize:11}}>本课生词 · {vocabList.length}</div>
          <a href="#" style={{fontSize:12, color:"var(--green)"}}>全部</a>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:2}}>
          {vocabList.map(([en,zh])=>(
            <div key={en} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderTop:"1px dashed var(--line)"}}>
              <div>
                <div style={{fontFamily:"var(--serif)", fontSize:16, color:"var(--ink)"}}>{en}</div>
                <div style={{fontSize:12, color:"var(--ink-3)", marginTop:1}}>{zh}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>speak(en)} style={{width:30, height:30, padding:0, justifyContent:"center", color:"var(--ink-3)"}}>
                <Icon.Speaker/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* tips */}
      <div style={{padding:18, borderRadius:20, background:"var(--green)", color:"#FFFEF6"}}>
        <div style={{fontSize:11, letterSpacing:0.12, textTransform:"uppercase", opacity:.7, marginBottom:8}}>地道说法</div>
        <div style={{fontFamily:"var(--serif)", fontSize:18, lineHeight:1.45}}>
          地勤问 "Window or aisle?"——直接回答 "Window, please." 就够礼貌了，无需完整句。
        </div>
      </div>
    </aside>
  );
}

window.DetailPage = DetailPage;
