/* ─── Login / Register ─────────────────────────────── */
function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [nickname, setNickname] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email || !pw) { setError("请填写邮箱和密码"); return; }
    if (mode === "register" && (!nickname || pw.length < 8)) {
      setError("请填写昵称，密码至少8位"); return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        console.log("DEBUG: calling API.login with", email, pw); res = await API.login(email, pw); console.log("DEBUG: API response", res);
      } else {
        if (!agree) { setError("请勾选同意服务条款"); setLoading(false); return; }
        res = await API.register(email, pw, nickname || email.split("@")[0]);
      }
      if (res.error || !res.access_token) {
        console.log("API response:", res); setError(res.error || "登录失败，请检查邮箱和密码");
        setLoading(false);
        return;
      }
      // 保存token和用户信息
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("refreshToken", res.refresh_token);
      localStorage.setItem("userId", res.id);
      localStorage.setItem("user", JSON.stringify({ id: res.id, email: res.email, nickname: res.nickname }));
      navigate("scenarios");
    } catch (e) {
      setError("网络错误，请重试");
    }
    setLoading(false);
  }

  return (
    <main style={{minHeight:"calc(100vh - 68px)", display:"grid", gridTemplateColumns:"1fr 1.1fr", background:"var(--bg)"}}>
      {/* left — illustration / brand */}
      <aside style={{
        background:"var(--green)", color:"#FFFEF6",
        padding:"56px 56px", position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column",
      }}>
        <div style={{
          position:"absolute", left:-100, bottom:-160, width:540, height:540, borderRadius:"50%",
          background:"radial-gradient(closest-side, color-mix(in oklab, #fff 18%, transparent), transparent)",
        }}/>
        <div style={{
          position:"absolute", right:-80, top:-120, width:300, height:300, borderRadius:"50%",
          border:"1px solid rgba(255,255,255,.22)"
        }}/>
        <Logo/>
        <div style={{flex:1, display:"flex", alignItems:"center"}}>
          <div>
            <h2 className="display" style={{fontSize:60, color:"#FFFEF6", margin:0, maxWidth:480}}>
              今天<br/><i>开口说</i><br/>一句英语。
            </h2>
            <p style={{marginTop:20, color:"color-mix(in oklab, #FFFEF6 80%, transparent)", maxWidth:380, fontSize:16, lineHeight:1.55}}>
              加入 80 万正在练习的成年学习者。今天的目标只有一个：把 8 句话说出口。
            </p>
            <div style={{display:"flex", gap:10, marginTop:36, alignItems:"center"}}>
              <div style={{display:"flex"}}>
                {["#F3E0BC","#D2A47A","#7A9A75","#3F5546"].map((c,i)=>(
                  <span key={i} style={{width:30, height:30, borderRadius:"50%", background:c, border:"2px solid var(--green)", marginLeft: i?0:0}}/>
                ))}
              </div>
              <span style={{fontSize:13, color:"color-mix(in oklab, #FFFEF6 70%, transparent)"}}>+ 832,491 学员正在学习</span>
            </div>
          </div>
        </div>
        <blockquote style={{margin:0, position:"relative", color:"color-mix(in oklab, #FFFEF6 92%, transparent)", maxWidth:440}}>
          <div style={{fontFamily:"var(--serif)", fontSize:22, lineHeight:1.35, fontStyle:"italic"}}>
            "第一次出差去新加坡，机场的对话我能听懂了——我学了三周。"
          </div>
          <div style={{marginTop:10, fontSize:13, color:"color-mix(in oklab, #FFFEF6 70%, transparent)"}}>
            — 林女士 · 产品经理 · 深圳
          </div>
        </blockquote>
      </aside>

      {/* right — form */}
      <section style={{padding:"56px 56px", display:"flex", alignItems:"center"}}>
        <div style={{maxWidth:420, width:"100%", margin:"0 auto"}}>
          {/* tabs */}
          <div style={{display:"flex", gap:0, padding:4, border:"1px solid var(--line)", borderRadius:999, background:"var(--bg-2)", width:"fit-content", marginBottom:32}}>
            <button onClick={()=>{setMode("login");setError("");}} style={{padding:"7px 20px", borderRadius:999, border:"none", cursor:"pointer", fontSize:13.5, fontWeight:500, transition:"all 0.15s",
              background: mode==="login" ? "var(--bg)" : "transparent", color: mode==="login" ? "var(--ink)" : "var(--ink-3)"}}>登录</button>
            <button onClick={()=>{setMode("register");setError("");}} style={{padding:"7px 20px", borderRadius:999, border:"none", cursor:"pointer", fontSize:13.5, fontWeight:500, transition:"all 0.15s",
              background: mode==="register" ? "var(--bg)" : "transparent", color: mode==="register" ? "var(--ink)" : "var(--ink-3)"}}>注册</button>
          </div>

          {error && <div style={{padding:"10px 14px", background:"#FF3B3022", border:"1px solid #FF3B3055", borderRadius:10, color:"var(--error)", fontSize:13, marginBottom:16}}>{error}</div>}

          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {mode==="register" && (
              <div className="field">
                <label className="label">昵称</label>
                <input className="input" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="你的昵称"/>
              </div>
            )}
            <div className="field">
              <label className="label">邮箱</label>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/>
            </div>
            <div className="field">
              <div style={{display:"flex", justifyContent:"space-between"}}>
                <label className="label">密码</label>
              </div>
              <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder={mode==="register" ? "至少8位，包含字母和数字" : "••••••••"}/>
            </div>

            {mode==="register" && (
              <label style={{display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:"var(--ink-3)", marginTop:4}}>
                <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} style={{marginTop:3, accentColor:"var(--green)"}}/>
                <span>我已阅读并同意 <a href="#" style={{color:"var(--ink)", textDecoration:"underline"}}>服务条款</a> 与 <a href="#" style={{color:"var(--ink)", textDecoration:"underline"}}>隐私协议</a>。</span>
              </label>
            )}

            <button className="btn btn-primary btn-lg" style={{justifyContent:"center", marginTop:6, opacity:loading?0.7:1}} onClick={handleSubmit} disabled={loading}>
              {loading ? "处理中..." : mode==="login" ? "登录" : "开始 7 天免费试用"} {!loading && <Icon.Arrow/>}
            </button>
          </div>

          <p style={{marginTop:22, fontSize:13, color:"var(--ink-3)"}}>
            {mode==="login"
              ? <>第一次来 talkup？<a href="#" onClick={e=>{e.preventDefault(); setMode("register");setError("");}} style={{color:"var(--green)"}}>创建账号</a>。</>
              : <>已经有账号了？<a href="#" onClick={e=>{e.preventDefault(); setMode("login");setError("");}} style={{color:"var(--green)"}}>立即登录</a>。</>
            }
          </p>
        </div>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" style={{flex:"0 0 auto"}}>
      <path fill="#4285F4" d="M22 12.2c0-.8-.07-1.5-.2-2.2H12v4.2h5.6a4.8 4.8 0 01-2.1 3.2v2.7h3.4c2-1.8 3.1-4.6 3.1-7.9z"/>
      <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 7-2.5l-3.4-2.7c-1 .7-2.2 1-3.6 1-2.8 0-5.1-1.9-6-4.4H2.5v2.8A10 10 0 0012 22z"/>
      <path fill="#FBBC05" d="M6 13.4a6 6 0 010-3.8V6.8H2.5a10 10 0 000 9l3.5-2.4z"/>
      <path fill="#EA4335" d="M12 5.8c1.6 0 3 .5 4 1.6l3-3A10 10 0 002.5 6.8L6 9.6c.9-2.6 3.2-4.4 6-4.4z"/>
    </svg>
  );
}
function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{flex:"0 0 auto"}}>
      <path d="M16.4 12.6a4.7 4.7 0 012.3-4 4.8 4.8 0 00-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.5-.9-1.8 0-3.5 1-4.4 2.7-1.9 3.2-.5 8 1.4 10.6.9 1.3 2 2.7 3.4 2.7 1.4-.1 1.9-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.4-1.3 3.3-2.6.7-.9 1.2-2 1.5-3.1a4.6 4.6 0 01-3.5-4.3zM13.6 4.4c.8-.9 1.3-2.2 1.1-3.4-1.1.1-2.4.8-3.2 1.7-.7.8-1.3 2-1.1 3.3 1.2.1 2.4-.6 3.2-1.6z"/>
    </svg>
  );
}

window.AuthPage = AuthPage;
