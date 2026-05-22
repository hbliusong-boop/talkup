/* ─── App: router + tweaks ─────────────────────── */

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [route, setRoute] = useState(initialRoute());
  const [params, setParams] = useState({});

  function initialRoute() {
    const h = window.location.hash.replace(/^#/,"");
    if (!h || h==="/")   return "landing";
    if (h.startsWith("/scenarios")) return "scenarios";
    if (h.startsWith("/calendar"))  return "calendar";
    if (h.startsWith("/me"))        return "profile";
    if (h.startsWith("/lesson"))    return "detail";
    if (h.startsWith("/login"))     return "login";
    return "landing";
  }

  useEffect(() => {
    const onNav = (e) => {
      const k = e.detail.routeKey;
      // Login guard: redirect to login if accessing protected routes without auth
      const protectedRoutes = ["detail", "calendar", "profile", "scenarios"];
      if (protectedRoutes.includes(k) && !isLoggedIn()) {
        navigate("login");
        return;
      }
      setRoute(k);
      setParams(e.detail.params || {});
      const path = ({
        landing:"/", scenarios:"/scenarios", calendar:"/calendar",
        profile:"/me", detail:"/lesson", login:"/login"
      })[k] || "/";
      if (window.location.hash.replace(/^#/,"") !== path) window.location.hash = path;
      window.scrollTo({ top:0, behavior:"instant" });
    };
    const onHash = () => setRoute(initialRoute());
    window.addEventListener("nav", onNav);
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("nav", onNav); window.removeEventListener("hashchange", onHash); };
  }, []);

  // apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t.dark]);

  return (
    <div data-screen-label={routeLabel(route)}>
      {route !== "login" && <Nav route={route}/>}
      {route === "landing"   && <LandingPage/>}
      {route === "scenarios" && <ScenariosPage/>}
      {route === "detail"    && <DetailPage tweaks={t} setTweak={setTweak} params={params}/>}
      {route === "calendar"  && <CalendarPage/>}
      {route === "profile"   && <ProfilePage tweaks={t} setTweak={setTweak}/>}
      {route === "login"     && <AuthPage/>}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="对话显示"/>
        <TweakRadio
          label="模式"
          value={t.dialogMode}
          options={[
            { value:"english-only", label:"仅英文" },
            { value:"bilingual",    label:"中英" },
          ]}
          onChange={(v)=>setTweak("dialogMode", v)}
        />
        <TweakSection label="主题"/>
        <TweakToggle
          label="深色模式"
          value={t.dark}
          onChange={(v)=>setTweak("dark", v)}
        />
      </TweaksPanel>
    </div>
  );
}

function routeLabel(r) {
  return ({
    landing:"01 Landing", login:"02 Login",
    scenarios:"03 Scenarios", detail:"04 Lesson detail",
    calendar:"05 Calendar", profile:"06 Profile"
  })[r] || r;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
