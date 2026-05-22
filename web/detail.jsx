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

function DetailPage({ tweaks, setTweak }) {
  const bilingual = tweaks.dialogMode !== "english-only";
  const [activeIdx, setActiveIdx] = useState(-1);
  const [activeWord, setActiveWord] = useState(-1); // word index within line
  const [playMode, setPlayMode] = useState(null);   // null | "all" | "single"
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState("US-Female");
  const [openVocab, setOpenVocab] = useState(null); // {word, lineEl}
  const playRef = useRef({ stop:false });

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
    const line = DIALOG[i];
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
    for (let i=0; i<DIALOG.length; i++) {
      if (playRef.current.stop) break;
      setActiveIdx(i); setActiveWord(-1);
      const line = DIALOG[i];
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
  const progressPct = playMode==="all"
    ? Math.round(((activeIdx+1)/DIALOG.length)*100)
    : Math.round((completedThrough/DIALOG.length)*100);

  // cleanup speech on unmount
  useEffect(()=>()=>{ window.speechSynthesis?.cancel(); }, []);

  return (
    <main style={{padding:"32px 32px 80px"}}>
      <div className="wrap" style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:40}}>
        {/* ── main column ── */}
        <div>
          {/* breadcrumb + back */}
          <div style={{display:"flex", alignItems:"center", gap:14, color:"var(--ink-3)", fontSize:13, marginBottom:18}}>
            <a href="#" onClick={(e)=>{e.preventDefault(); navigate("scenarios");}} style={{color:"var(--ink-3)"}}>场景库</a>
            <span>›</span>
            <span>旅行</span>
            <span>›</span>
            <span style={{color:"var(--ink)"}}>机场值机</span>
          </div>

          {/* lesson header */}
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:24, marginBottom:28}}>
            <div>
              <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:10}}>
                <span style={{width:44, height:44, borderRadius:13, background:"var(--green-4)", color:"var(--green)", display:"grid", placeItems:"center"}}>
                  <Icon.Plane/>
                </span>
                <div>
                  <div style={{fontSize:11, color:"var(--ink-3)", letterSpacing:0.05, textTransform:"uppercase", fontWeight:500, marginBottom:2}}>Lesson 02 / 06 · 听说练习</div>
                  <h1 style={{fontFamily:"var(--serif)", fontSize:42, margin:0, letterSpacing:"-0.02em", lineHeight:1.1}}>Airport check-in</h1>
                </div>
              </div>
              <p style={{margin:"4px 0 0", color:"var(--ink-3)", maxWidth:560, fontSize:14.5, lineHeight:1.55}}>
                把行李递上去、说要靠窗——这段对话是出差和旅行的第一道关。
              </p>
            </div>
            <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8}}>
              <span style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--ink-3)"}}>{progressPct}% · {DIALOG.length} 句</span>
              <div style={{width:180, height:6, background:"var(--bg-3)", borderRadius:99, overflow:"hidden"}}>
                <div style={{width:progressPct+"%", height:"100%", background:"var(--green)", transition:"width .3s", borderRadius:99}}/>
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
            {DIALOG.map((line, i) => (
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
                onWordClick={(w, el)=>{ setOpenVocab({ word: w.toLowerCase(), x:el.offsetLeft, y:el.offsetTop, width:el.offsetWidth }); }}
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
            <button className="btn btn-primary" onClick={()=>navigate("scenarios")}>完成本节，下一课 <Icon.Arrow/></button>
          </div>
        </div>

        {/* ── side panel ── */}
        <SidePanel speak={(t)=>speak(t)}/>
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
      onClick={()=>{ if (!playing) onPlay(); }}
      style={{
        display:"flex", gap:14, padding:"16px 20px", borderRadius:16,
        background: active ? "color-mix(in oklab, var(--green) 8%, var(--bg-2))" : "var(--bg-2)",
        border: "1px solid " + (active ? "color-mix(in oklab, var(--green) 30%, var(--line))" : "var(--line)"),
        cursor: playing ? "default" : "pointer",
        transition: "all 0.15s",
        opacity: done && !active ? 0.72 : 1,
      }}
    >
      {/* speaker badge */}
      <div style={{flex:"0 0 auto", width:36, height:36, borderRadius:99, background: isYou ? "var(--green-4)" : "var(--ink)", color: isYou ? "var(--green)" : "var(--bg)", display:"grid", placeItems:"center", fontSize:13, fontWeight:600, alignSelf:"flex-start"}}>
        {isYou ? "你" : "AI"}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
          <span style={{fontSize:12, color:"var(--ink-3)", fontWeight:500}}>
            {isYou ? "你的回答" : "AI 助手"}
          </span>
          {done && <span title="已掌握" style={{color:"var(--green)"}}><Icon.Check/></span>}
        </div>
        {/* English */}
        <div style={{fontSize:15.5, lineHeight:1.55, marginBottom: bilingual ? 6 : 0, color:"var(--ink)"}}>
          {words.map((w, wi) => (
            <span key={wi}
              style={{
                background: activeWord===wi ? "color-mix(in oklab, var(--green) 25%, transparent)" : "transparent",
                borderRadius:2, padding:"0 1px", cursor:"pointer",
                transition:"background .1s"
              }}
              onClick={(e) => { e.stopPropagation(); onWordClick(w, e.target); }}
            >{w}{" "}</span>
          ))}
        </div>
        {/* Chinese */}
        {bilingual && (
          <div style={{fontSize:13.5, color:"var(--ink-3)", lineHeight:1.5}}>{line.zh}</div>
        )}
        {/* vocab tags */}
        {line.vocab && line.vocab.length > 0 && (
          <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:10}}>
            {line.vocab.map(w => (
              <span key={w} style={{fontSize:11.5, padding:"2px 9px", borderRadius:999, background:"var(--green-4)", color:"var(--green)", fontFamily:"var(--mono)"}}>{w}</span>
            ))}
          </div>
        )}
      </div>
      {/* play indicator */}
      {playing && (
        <div style={{flex:"0 0 auto", alignSelf:"center"}}>
          <span style={{display:"flex", gap:2}}>
            {[0,1,2].map(i => <span key={i} style={{width:4, height:16, background:"var(--green)", borderRadius:2, animation:"wave 0.6s ease-in-out infinite", animationDelay:`${i*0.1}s`}}/>)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Side panel ── */
function SidePanel({ speak }) {
  const [activeTab, setActiveTab] = useState("vocab");
  const vocabList = useMemo(() => {
    const seen = new Set();
    const list = [];
    DIALOG.forEach(line => {
      (line.vocab || []).forEach(w => {
        if (!seen.has(w)) { seen.add(w); list.push(w); }
      });
    });
    return list;
  }, []);

  return (
    <div style={{display:"flex", flexDirection:"column", gap:0}}>
      <div style={{display:"flex", borderBottom:"1px solid var(--line)", marginBottom:16}}>
        {[["vocab","词汇"],["tips","提示"]].map(([k,l]) => (
          <button key={k} onClick={()=>setActiveTab(k)}
            style={{flex:1, padding:"10px 0", background:"none", border:"none", borderBottom:"2px solid " + (activeTab===k ? "var(--green)" : "transparent"), color: activeTab===k ? "var(--ink)" : "var(--ink-3)", fontSize:13.5, cursor:"pointer", fontWeight:500}}>
            {l} {k==="vocab" ? `(${vocabList.length})` : ""}
          </button>
        ))}
      </div>
      {activeTab === "vocab" && (
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {vocabList.map(w => (
            <div key={w} style={{padding:"12px 14px", background:"var(--bg-2)", borderRadius:12, border:"1px solid var(--line)"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4}}>
                <span style={{fontFamily:"var(--mono)", fontSize:14, fontWeight:600}}>{w}</span>
                <button onClick={()=>speak(w)} style={{background:"none", border:"none", cursor:"pointer", color:"var(--green)", padding:2}}><Icon.Speaker/></button>
              </div>
              {VOCAB_DEFS[w] && (
                <>
                  <div style={{fontSize:12, color:"var(--ink-3)", marginBottom:2}}>{VOCAB_DEFS[w].ipa} · {VOCAB_DEFS[w].pos}</div>
                  <div style={{fontSize:13, color:"var(--ink)"}}>{VOCAB_DEFS[w].zh}</div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {activeTab === "tips" && (
        <div style={{padding:"16px", background:"var(--bg-2)", borderRadius:12, border:"1px solid var(--line)", fontSize:13.5, color:"var(--ink-2)", lineHeight:1.6}}>
          <p style={{margin:"0 0 12px"}}>💡 <strong>练习技巧</strong></p>
          <ul style={{margin:0, paddingLeft:18}}>
            <li>先听 AI 说的内容，理解意思</li>
            <li>点击某一句跟读，模仿发音语调</li>
            <li>点击单词查看详细解释</li>
            <li>点击「播放全部」连续听完整对话</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Vocab popover ── */
function VocabPopover({ info, word, x, y, width, onClose, onPlay }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div ref={ref} tabIndex={-1}
      style={{
        position:"absolute", left:x, top:y+30, width:280,
        background:"var(--bg)", border:"1px solid var(--line)",
        borderRadius:14, padding:"14px 16px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
        zIndex:200, outline:"none"
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
        <span style={{fontFamily:"var(--mono)", fontSize:16, fontWeight:700}}>{word}</span>
        <div style={{display:"flex", gap:8}}>
          <button onClick={onPlay} style={{background:"none", border:"none", cursor:"pointer", color:"var(--green)"}}><Icon.Speaker/></button>
          <button onClick={onClose} style={{background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)"}}>✕</button>
        </div>
      </div>
      <div style={{fontSize:12, color:"var(--ink-3)", marginBottom:6}}>{info.ipa} · {info.pos}</div>
      <div style={{fontSize:14, color:"var(--ink)", marginBottom:8}}>{info.zh}</div>
      {info.ex && <div style={{fontSize:12.5, color:"var(--ink-3)", fontStyle:"italic"}}>"{info.ex}"</div>}
    </div>
  );
}

window.DetailPage = DetailPage;
