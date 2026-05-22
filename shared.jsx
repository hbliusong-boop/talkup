/* ─── shared: Nav, Footer, Logo, AppShell ─── */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const ROUTES = [
  { key: "landing",   label: "首页",     path: "/" },
  { key: "scenarios", label: "场景库",   path: "/scenarios" },
  { key: "calendar",  label: "学习日历", path: "/calendar" },
  { key: "profile",   label: "我的",     path: "/me" },
];

const API_BASE = '/api';

const API = {
  scenarios() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const url = userId ? `${API_BASE}/scenarios?user_id=${userId}` : `${API_BASE}/scenarios`;
    return fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {}).then(r => r.json());
  },
  scenario(id) {
    return fetch(`${API_BASE}/scenarios/${id}`).then(r => r.json());
  },
  login(email, password) {
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json());
  },
  register(email, password, nickname) {
    return fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname })
    }).then(r => r.json());
  },
  recordStudy({ user_id, scenario_id, scenario_name, duration }) {
    return fetch(`${API_BASE}/study/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, scenario_id, scenario_name, duration })
    }).then(r => r.json());
  },
  studyStats(user_id) {
    return fetch(`${API_BASE}/study/stats?user_id=${user_id}`).then(r => r.json());
  },
  studyCalendar(user_id) {
    return fetch(`${API_BASE}/study/calendar?user_id=${user_id}`).then(r => r.json());
  },
  studyHistory(user_id) {
    return fetch(`${API_BASE}/study/history?user_id=${user_id}`).then(r => r.json());
  },
};

window.API = API;
window.API_BASE = API_BASE;

function Logo({ size = 26 }) {
  return (
    <a className="logo" href="#/" onClick={(e)=>{e.preventDefault(); navigate("landing");}}>
      <span className="logo-mark" style={{width:size,height:size,fontSize:size*0.5}}>t</span>
      <span style={{fontStyle:"italic"}}>talkup</span>
    </a>
  );
}

function navigate(routeKey, params) {
  window.dispatchEvent(new CustomEvent("nav", { detail: { routeKey, params } }));
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function Nav({ route }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);
  return (
    <header className="nav">
      <div className="nav-inner">
        <Logo />
        <nav className="nav-links" aria-label="primary">
          {ROUTES.map(r => (
            <a key={r.key}
               href={"#"+r.path}
               className={"nav-link " + (route===r.key ? "is-active":"")}
               onClick={(e)=>{e.preventDefault(); navigate(r.key);}}>
              {r.label}
            </a>
          ))}
        </nav>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("profile")}>{user.nickname || user.email}</button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("login")}>登录</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={()=>{
            if (!isLoggedIn()) { navigate("login"); }
            else { navigate("scenarios"); }
          }}>
            开始学习
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="wrap" style={{display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 1fr", gap:48}}>
        <div>
          <Logo />
          <p style={{maxWidth:300, marginTop:14, color:"var(--ink-3)", fontSize:14}}>
            为成年人设计的英语口语练习。<br/>用真实场景，把英语说出口。
          </p>
        </div>
        <FootCol title="产品" items={["场景库","学习日历","商务英语","旅行英语"]}/>
        <FootCol title="公司" items={["关于我们","团队","职位","联系"]}/>
        <FootCol title="支持" items={["帮助中心","学习指南","条款","隐私"]}/>
      </div>
      <div className="wrap" style={{marginTop:40, display:"flex", justifyContent:"space-between", color:"var(--ink-4)", fontSize:12.5}}>
        <span>© 2026 talkup, Inc. 沪 ICP 备 20250000 号</span>
        <span style={{display:"flex", gap:14}}>
          <a href="#">English</a><span>·</span><a href="#">简体中文</a><span>·</span><a href="#">日本語</a>
        </span>
      </div>
    </footer>
  );
}
function FootCol({ title, items }) {
  return (
    <div>
      <div className="eyebrow" style={{fontSize:11, marginBottom:14}}>{title}</div>
      <ul style={{listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:10, fontSize:14, color:"var(--ink-3)"}}>
        {items.map(i => <li key={i}><a href="#">{i}</a></li>)}
      </ul>
    </div>
  );
}

function PageHeader({ eyebrow, title, sub, right }) {
  return (
    <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, marginBottom:36}}>
      <div>
        {eyebrow && <div className="eyebrow" style={{marginBottom:10}}>{eyebrow}</div>}
        <h1 className="display" style={{fontSize:52, margin:0}}>{title}</h1>
        {sub && <p style={{marginTop:14, color:"var(--ink-3)", fontSize:17, maxWidth:640}}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function GreenRibbon({ label, num }) {
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:8,
      padding:"6px 12px", borderRadius:999,
      background:"var(--green-4)", color:"var(--green)",
      border:"1px solid color-mix(in oklab, var(--green) 22%, transparent)",
      fontSize:12.5, fontWeight:500, letterSpacing:0.1
    }}>
      <span style={{width:6, height:6, borderRadius:99, background:"var(--green)"}}/>
      {label}
      {num && <span style={{color:"var(--ink-4)"}}>· {num}</span>}
    </div>
  );
}

Object.assign(window, {
  ROUTES, navigate, Logo, Nav, Footer, PageHeader, GreenRibbon,
  getUser, isLoggedIn,
});
