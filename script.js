function go(element, pageId) {
    // 1. Quitamos la clase 'on' de todos los botones del menú
    document.querySelectorAll('.ni').forEach(el => el.classList.remove('on'));
    
    // 2. Le ponemos la clase 'on' solo al botón al que le hicimos clic
    if (element) {
        element.classList.add('on');
    }

    // 3. Escondemos todas las páginas
    document.querySelectorAll('.page').forEach(page => page.classList.remove('on'));

    // 4. Mostramos solo la página que queremos ver
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('on');
    }

    // 5. Cerramos el menú en móviles (opcional)
    console.log("Navegando a: " + pageId);
}
function finishOnboarding(){
  var nameEl = document.getElementById('ob-name');
  var name = nameEl ? nameEl.value.trim() : '';
  if(!name){ if(nameEl) nameEl.focus(); return; }
  try{localStorage.setItem('username', name);}catch(e){}
  var ob = document.getElementById('onboarding');
  if(ob) ob.classList.add('hide');
  if(typeof initUI === 'function') initUI();
  if(typeof publishMyStats === 'function') publishMyStats();
}
// ══════════════════════════════════════════════════
// STATE — todo lo del usuario en localStorage
// Leaderboard y feed en window.storage (compartido)
// ══════════════════════════════════════════════════
const LS = {
  get: (k,d) => { try{ const v=localStorage.getItem('tos_'+k); return v!==null?JSON.parse(v):d; }catch(e){return d;} },
  set: (k,v) => { try{ localStorage.setItem('tos_'+k,JSON.stringify(v)); }catch(e){} }
};

let USERNAME = LS.get('username','');
let MY_TRADES = LS.get('trades',[]);
let MY_MODULES = LS.get('mods', defaultMods());
let MY_CHK = LS.get('chk',{});
let MY_EMO = LS.get('emo',0);
let MY_STREAK = LS.get('streak',0);
let API_KEY = LS.get('key','');
let lastAiAnalysis = '';

function defaultMods(){return[
  {id:0,name:"Introducción al Trading",desc:"Tipos de mercados e instrumentos base.",ico:"📚",p:0,c:"b"},
    {id:1, name:"Cómo Funciona el Mercado", ico:"🌍", c:"b", p:0,
    nivel:"Básico", tiempo:"15 min",
    desc:"Bull/Bear, participantes, oferta y demanda.",
    contenido:[
      {t:"¿Qué es el mercado?", txt:"El mercado es simplemente el lugar donde compradores y vendedores se encuentran para intercambiar activos. Cuando hay más compradores que vendedores, el precio sube (mercado Bull 🐂). Cuando hay más vendedores, el precio baja (mercado Bear 🐻)."},
      {t:"Participantes clave", txt:"• Minoristas (vos): operamos pequeños volúmenes\n• Market Makers: dan liquidez, siempre están en ambos lados\n• Institucionales: fondos, bancos, mueven el mercado\n• Algoritmos (HFT): ejecutan miles de órdenes por segundo"},
      {t:"Oferta y Demanda", txt:"El precio de cualquier activo lo determina la oferta (cantidad disponible) vs la demanda (cuánto quiere comprar la gente). Si Apple reporta ganancias récord → más gente quiere AAPL → precio sube."},
      {t:"💡 Consejo práctico", txt:"Antes de operar cualquier activo, preguntate: ¿quién está comprando y por qué? ¿quién está vendiendo? La respuesta te da el contexto fundamental básico."}
    ]
  },
  {id:2, name:"Análisis Fundamental", ico:"📊", c:"y", p:0,
    nivel:"Básico", tiempo:"20 min",
    desc:"Earnings, PIB, tasas de interés, macro.",
    contenido:[
      {t:"¿Qué es el análisis fundamental?", txt:"Es analizar el VALOR REAL de un activo basándose en datos económicos y financieros. La pregunta es: ¿está barato o caro respecto a lo que vale realmente?"},
      {t:"Earnings (Ganancias)", txt:"Cada trimestre, las empresas reportan cuánto ganaron. Si ganan más de lo esperado → precio sube (beat). Si ganan menos → precio cae (miss). En TradeDIOS miramos el calendario para saber cuándo son los earnings de nuestros activos."},
      {t:"Tasas de interés (Fed)", txt:"Cuando la Fed SUBE tasas → el dinero se va a bonos (más seguros y rentables) → acciones y cripto bajan. Cuando BAJA tasas → el dinero fluye a activos de riesgo → acciones y cripto suben. Este es el driver macro más importante."},
      {t:"PIB y empleo", txt:"PIB alto = economía sana = empresas ganan más = acciones suben. Desempleo bajo = consumo alto = buenos earnings. Inflación alta = Fed sube tasas = presión bajista."},
      {t:"💡 Consejo práctico", txt:"Para tus activos argentinos (YPFD, PAMP, GGAL) mirá además: riesgo país, tipo de cambio y decisiones del BCRA. Para cripto: adopción institucional, regulación y narrativas de mercado."}
    ]
  },
  {id:3, name:"Velas Japonesas", ico:"🕯️", c:"y", p:0,
    nivel:"Básico", tiempo:"25 min",
    desc:"Candlesticks y todos los patrones clave.",
    contenido:[
      {t:"Anatomía de una vela", txt:"Cada vela tiene: Cuerpo (diferencia entre apertura y cierre) + Mechas (máximo y mínimo del período). Vela verde = cerró más arriba de como abrió (compradores ganaron). Vela roja = cerró más abajo (vendedores ganaron)."},
      {t:"Patrones de reversión alcista 🟢", txt:"• Martillo (Hammer): cuerpo pequeño arriba, mecha larga abajo → rechazo de precios bajos, señal de compra\n• Envolvente alcista: vela roja seguida de vela verde más grande → compradores tomaron el control\n• Estrella del amanecer: 3 velas, patrón de reversión fuerte después de caída"},
      {t:"Patrones de reversión bajista 🔴", txt:"• Estrella fugaz (Shooting Star): cuerpo pequeño abajo, mecha larga arriba → rechazo de precios altos, señal de venta\n• Envolvente bajista: vela verde seguida de vela roja más grande → vendedores tomaron control\n• Hombre colgado: igual al martillo pero en tendencia alcista = señal bajista"},
      {t:"Patrones de continuación", txt:"• Doji: apertura = cierre, indecisión del mercado\n• Tres soldados blancos: 3 velas verdes seguidas = continuación alcista fuerte\n• Tres cuervos negros: 3 velas rojas seguidas = continuación bajista fuerte"},
      {t:"💡 Consejo práctico", txt:"Una sola vela no es suficiente señal. Siempre confirmá con volumen: si hay un martillo con volumen 3x el promedio, es mucho más confiable. Usá las velas en timeframes D1 para señales más limpias."}
    ]
  },
  {id:4, name:"Soportes y Resistencias", ico:"📐", c:"y", p:0,
    nivel:"Intermedio", tiempo:"20 min",
    desc:"Niveles clave y zonas de oferta/demanda.",
    contenido:[
      {t:"¿Qué son?", txt:"Soporte = nivel de precio donde históricamente la demanda supera la oferta → el precio 'rebota' hacia arriba. Resistencia = nivel donde la oferta supera la demanda → el precio 'rebota' hacia abajo."},
      {t:"Cómo identificarlos", txt:"Buscá zonas donde el precio tocó el mismo nivel 2 o más veces y rebotó. Cuantas más veces fue testeado sin romperlo, más fuerte es el nivel. Los números redondos (50.000 para BTC, 200 para NVDA) son niveles psicológicos importantes."},
      {t:"La regla de la polaridad", txt:"Cuando una resistencia es rota con volumen → se convierte en soporte. Cuando un soporte es roto → se convierte en resistencia. Esta es una de las reglas más útiles del análisis técnico."},
      {t:"Zonas vs niveles exactos", txt:"No pienses en líneas exactas sino en ZONAS. Si el soporte está en $50.000, la zona es $49.500-$50.500. El precio no es un robot, puede perforar levemente el nivel antes de rebotar."},
      {t:"💡 Consejo práctico", txt:"En TradeDIOS, antes de entrar a cualquier operación, identificá el soporte más cercano debajo del precio actual → ese es tu stop loss natural. Y la resistencia más cercana arriba → ese es tu target mínimo."}
    ]
  },
  {id:5, name:"Indicadores Técnicos", ico:"📉", c:"b", p:0,
    nivel:"Intermedio", tiempo:"30 min",
    desc:"RSI, MACD, Medias Móviles, Bollinger.",
    contenido:[
      {t:"RSI — Índice de Fuerza Relativa", txt:"Oscila entre 0 y 100. Por encima de 70 = sobrecomprado (posible corrección). Por debajo de 30 = sobrevendido (posible rebote). Lo más valioso: la DIVERGENCIA. Si el precio sube pero el RSI baja → señal bajista. Si el precio baja pero el RSI sube → señal alcista."},
      {t:"MACD — Convergencia/Divergencia", txt:"Dos medias móviles (12 y 26 períodos) más una línea de señal (9 períodos). Señal de compra: cuando la línea MACD cruza hacia arriba la línea de señal. Señal de venta: cuando la cruza hacia abajo. El histograma muestra la fuerza del momentum."},
      {t:"Medias Móviles (EMA/SMA)", txt:"La EMA200 es la media más importante: si el precio está ARRIBA = tendencia alcista de largo plazo. Si está ABAJO = tendencia bajista. La EMA50 y EMA20 se usan para entradas y salidas. El 'Golden Cross' (EMA50 cruza arriba la EMA200) es señal alcista potente."},
      {t:"Bandas de Bollinger", txt:"Una media móvil (20) con bandas a 2 desviaciones estándar. El precio tiende a volver a la media. Cerca de la banda superior = posible sobrecompra. Cerca de la inferior = posible sobreventa. El 'squeeze' (bandas muy juntas) predice un movimiento explosivo próximo."},
      {t:"💡 Consejo práctico", txt:"Nunca uses un indicador solo. Combinación ideal: RSI para momentum + MACD para tendencia + Bollinger para volatilidad. Si los tres coinciden en una señal, la probabilidad de acierto es mucho mayor."}
    ]
  },
  {id:6, name:"Patrones de Precio", ico:"🔺", c:"b", p:0,
    nivel:"Intermedio", tiempo:"25 min",
    desc:"H&S, doble techo, triángulos, banderas.",
    contenido:[
      {t:"Hombro-Cabeza-Hombro (H&S)", txt:"Patrón de reversión bajista. Tres picos: el del medio (cabeza) es el más alto, los laterales (hombros) son iguales. La línea que une los mínimos = neckline. Cuando el precio rompe el neckline hacia abajo con volumen → señal de venta fuerte. Target: distancia de la cabeza al neckline proyectada hacia abajo."},
      {t:"Doble Techo / Doble Piso", txt:"Doble Techo: el precio intenta romper una resistencia dos veces y falla → señal bajista. Doble Piso: el precio toca un soporte dos veces y rebota → señal alcista. Son de los patrones más confiables y fáciles de identificar."},
      {t:"Triángulos", txt:"• Ascendente: máximos iguales + mínimos más altos → ruptura alcista probable\n• Descendente: mínimos iguales + máximos más bajos → ruptura bajista probable\n• Simétrico: compresión del precio, la ruptura puede ser en cualquier dirección → esperá la confirmación"},
      {t:"Banderas y Pennants", txt:"Patrones de continuación. Después de un movimiento fuerte (el mástil), el precio consolida en un canal pequeño (la bandera). La ruptura suele ser en la misma dirección del movimiento original. El target es la longitud del mástil proyectada desde la ruptura."},
      {t:"💡 Consejo práctico", txt:"Los patrones necesitan confirmación con volumen. Una ruptura de neckline sin volumen es una trampa (bull/bear trap). Esperá siempre la vela de confirmación antes de entrar."}
    ]
  },
  {id:7, name:"Gestión de Riesgo", ico:"🛡️", c:"g", p:0,
    nivel:"Avanzado", tiempo:"20 min",
    desc:"Position sizing, stop-loss, ratio R:R.",
    contenido:[
      {t:"La regla del 1-2%", txt:"Nunca arriesgues más del 1-2% de tu capital total en una sola operación. Si tenés $1.000, el máximo que podés perder en un trade es $10-20. Esto asegura que una racha de pérdidas no te destruya la cuenta."},
      {t:"Stop Loss — tu seguro de vida", txt:"El stop loss es la orden que cierra tu operación automáticamente si el precio va en tu contra. Siempre lo definís ANTES de entrar. Nunca lo movás en contra de tu posición (moverlo más lejos para 'esperar recuperación' es el peor error del trader novato)."},
      {t:"Ratio Riesgo:Recompensa (R:R)", txt:"Si arriesgás $100 para ganar $100 → R:R 1:1 (mediocre). Si arriesgás $100 para ganar $300 → R:R 1:3 (excelente). Con un R:R de 1:2, podés ganar dinero incluso acertando solo el 40% de las operaciones. Nunca entres a un trade con R:R menor a 1:2."},
      {t:"Position Sizing — cuánto comprar", txt:"Fórmula: (Capital × % riesgo) ÷ (Precio entrada - Stop Loss) = cantidad de acciones/monedas. Ejemplo: $10.000 capital × 2% riesgo = $200 de riesgo máximo. Si el stop está a $5 del precio de entrada → comprás 40 acciones."},
      {t:"💡 Consejo práctico", txt:"Usá la Calculadora de Riesgo de TradeDIOS. Ingresás tu capital, el precio de entrada y el stop loss → te dice automáticamente cuánto comprar. Es la herramienta más importante para no destruir tu cuenta."}
    ]
  },
  {id:8, name:"Estrategia y Plan de Trading", ico:"⚙️", c:"g", p:0,
    nivel:"Avanzado", tiempo:"25 min",
    desc:"Backtesting, plan de trading, journaling.",
    contenido:[
      {t:"¿Qué es un plan de trading?", txt:"Es un conjunto de reglas escritas que definen CUÁNDO entrás, cuándo salís, cuánto arriesgás y qué activos operás. Sin plan = operás con emociones. Con plan = operás con lógica. El Checklist Pre-Trade de TradeDIOS es tu plan en formato digital."},
      {t:"Backtesting", txt:"Antes de operar una estrategia con dinero real, la 'testeás' en datos históricos. Pregunta: 'Si hubiera aplicado esta estrategia en los últimos 100 trades históricos, ¿cuánto habría ganado/perdido?' Un backtest positivo no garantiza éxito futuro, pero da confianza."},
      {t:"El diario de trading", txt:"El diario es la herramienta más subestimada. Registrás cada entrada y salida con el motivo, las emociones, el resultado y las lecciones. Después de 50 trades, el diario te muestra patrones: ¿en qué horario ganás más? ¿qué setup funciona mejor? ¿qué errores repetís?"},
      {t:"Setup y edge", txt:"Un 'setup' es una situación específica del mercado donde tu estrategia tiene ventaja estadística. Tu trabajo como trader es esperar ese setup, no operar todo el tiempo. La disciplina de NO operar cuando no hay setup es lo que separa a los traders rentables."},
      {t:"💡 Consejo práctico", txt:"Anotá cada operación en el Diario Inteligente de TradeDIOS, incluyendo el estado emocional. Después de 20 operaciones, analizá los patrones en la sección Análisis de Patrones. Vas a descubrir cosas sobre vos mismo que no sabías."}
    ]
  },
  {id:9, name:"Psicología del Trading", ico:"🧠", c:"g", p:0,
    nivel:"Avanzado", tiempo:"20 min",
    desc:"Control emocional, disciplina, mindset.",
    contenido:[
      {t:"Los 4 enemigos del trader", txt:"1. FOMO (Fear of Missing Out): entrar tarde por miedo a perderte un movimiento\n2. Revenge Trading: operar más para recuperar pérdidas\n3. Overtrading: operar demasiado por aburrimiento o exceso de confianza\n4. Paralización: miedo a entrar aunque el setup sea perfecto"},
      {t:"El ciclo emocional del mercado", txt:"Optimismo → Emoción → Euforia (máximo del mercado) → Ansiedad → Negación → Miedo → Capitulación → Depresión (mínimo del mercado) → Esperanza → Optimismo. La mayoría compra en la euforia y vende en la depresión. Hacé lo contrario."},
      {t:"Cómo controlar las emociones", txt:"• Definí el plan ANTES de entrar (cuando estás frío)\n• Nunca operés justo después de una pérdida grande\n• Tomá breaks después de 2-3 pérdidas seguidas\n• El Checklist Pre-Trade de TradeDIOS te obliga a pensar antes de actuar"},
      {t:"Mindset del trader rentable", txt:"El trader rentable no intenta ganar en cada trade → acepta que perder es parte del proceso. No juzga un trade por su resultado sino por si siguió el plan. Un trade perdedor bien ejecutado es un buen trade. Un trade ganador por suerte es un mal trade."},
      {t:"💡 Consejo práctico", txt:"Registrá tu estado emocional en cada entrada del Diario. Después de 30 trades, vas a ver una correlación clara entre emociones y resultados. Ese insight vale más que cualquier indicador técnico."}
    ]
  },
];}

function changeUser(){
  const n = prompt('Nuevo nombre:', USERNAME);
  if(n && n.trim()){ USERNAME=n.trim(); LS.set('username',USERNAME); initUI(); publishMyStats(); }
}
if(USERNAME){ document.getElementById('onboarding').classList.add('hide'); }
document.getElementById('ob-name').addEventListener('keydown', e=>{ if(e.key==='Enter') finishOnboarding(); });

// ══════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════
const TITLES={dashboard:'Dashboard',radar:'Radar de Noticias — Impacto en Mercados',alertas:'Alertas IA — Scanner de Patrones',charts:'Gráfico Live',screener:'Screener',leaderboard:'Leaderboard del Grupo',feed:'Feed del Grupo',checklist:'Checklist Pre-Trade',diario:'Diario Inteligente',patrones:'Análisis de Patrones',riesgo:'Calculadora de Riesgo',conversor:'Conversor de Monedas',ai:'Análisis con IA',aprendizaje:'Ruta de Aprendizaje',calendario:'Calendario'};
function go(el, page){
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  if(el) el.classList.add('on');
  const pg = document.getElementById('p-'+page);
  if(pg) pg.classList.add('on');
  document.getElementById('ptitle').textContent = TITLES[page]||page;
  if(page==='charts') setTimeout(()=>initChart(curSym),80);
  if(page==='dashboard'){ updateStats(); renderMiniCal(); refreshDashboardCommunity(); }
  if(page==='leaderboard'){ refreshLeaderboard(); }
  if(page==='feed'){ refreshFeed(); }
  if(page==='checklist'){ renderChk(); renderEmo(); }
  if(page==='patrones') renderPatterns();
  if(page==='aprendizaje') renderMods();
  if(page==='calendario') loadCalendar();
  if(page==='riesgo') calcR();
  if(page==='conversor'){ fetchRates(); }
  if(page==='radar'){ initRadar(); }
  if(page==='alertas'){ renderWatchlist(); renderAlertFeed(); }
}

// ══════════════════════════════════════════════════
// CLOCK + STREAK
// ══════════════════════════════════════════════════
setInterval(()=>{ document.getElementById('clock').textContent = new Date().toLocaleTimeString('es-AR',{hour12:false})+' ART'; },1000);

// ══════════════════════════════════════════════════
// UI INIT
// ══════════════════════════════════════════════════
function initUI(){
  const n = USERNAME||'Trader';
  document.getElementById('sb-username').textContent = n;
  document.getElementById('user-av').textContent = n[0].toUpperCase();
  document.getElementById('streak-chip').textContent = '🔥 '+MY_STREAK+' días';
  renderT(); updateStats(); renderMiniCal();
  renderChk(); renderEmo();
  calcR(); renderMods();
  renderRules();
}

// ══════════════════════════════════════════════════
// SHARED STORAGE HELPERS
// ══════════════════════════════════════════════════
async function sharedGet(key){ try{ const r=await window.storage.get(key,true); return r?JSON.parse(r.value):null; }catch(e){ return null; } }
async function sharedSet(key,val){ try{ await window.storage.set(key,JSON.stringify(val),true); return true; }catch(e){ return false; } }

// ══════════════════════════════════════════════════
// LEADERBOARD (SHARED)
// ══════════════════════════════════════════════════
async function publishMyStats(){
  const T = MY_TRADES;
  const wins = T.filter(t=>t.pnl>0).length;
  const pnl = T.reduce((s,t)=>s+t.pnl,0);
  const wr = T.length ? (wins/T.length*100) : 0;
  const pf = (() => {
    const g=T.filter(t=>t.pnl>0).reduce((s,t)=>s+t.pnl,0);
    const l=Math.abs(T.filter(t=>t.pnl<0).reduce((s,t)=>s+t.pnl,0));
    return l>0?(g/l):g>0?99:0;
  })();
  const data = { name:USERNAME, pnl, wr, trades:T.length, pf, updated:Date.now() };
  await sharedSet('lb:'+USERNAME, data);
  renderMyStatsBox(data);
  // update lb badge
  const all = await getAllMembers();
  document.getElementById('nb-lb').textContent = all.length;
}

async function getAllMembers(){
  try{
    const keys = await window.storage.list('lb:', true);
    if(!keys||!keys.keys) return [];
    const members = [];
    for(const k of keys.keys){
      try{
        const r = await window.storage.get(k,true);
        if(r) members.push(JSON.parse(r.value));
      }catch(e){}
    }
    return members.sort((a,b)=>b.pnl-a.pnl);
  }catch(e){ return []; }
}

const AVATAR_COLORS = ['#1f6feb','#238636','#9e6a03','#b91c1c','#6e40c9','#0e7490','#b45309'];
function avatarColor(name){ let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))%AVATAR_COLORS.length; return AVATAR_COLORS[h]; }

async function refreshLeaderboard(){
  const members = await getAllMembers();
  const myIdx = members.findIndex(m=>m.name===USERNAME);
  const rankTag = myIdx>=0 ? '#'+(myIdx+1) : '#—';
  document.getElementById('lb-rank').textContent = rankTag;
  document.getElementById('lb-count-tag').textContent = members.length+' traders';

  const rnk = ['🥇','🥈','🥉','4','5','6','7','8','9','10'];
  document.getElementById('lb-list').innerHTML = members.length===0
    ? '<div style="padding:28px;text-align:center;color:var(--text3);font-size:11px">Nadie en el leaderboard aún.<br>Publicá tus stats para aparecer.</div>'
    : `<div style="display:grid;grid-template-columns:30px 36px 1fr 50px 55px 65px;padding:8px 14px;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);border-bottom:1px solid var(--border)">
        <div></div><div></div><div>Trader</div><div style="text-align:right">Trades</div><div style="text-align:right">WR</div><div style="text-align:right">P&L</div>
       </div>`
    + members.map((m,i)=>`
      <div class="lb-row">
        <div class="lb-rank">${rnk[i]||i+1}</div>
        <div class="lb-av" style="background:${avatarColor(m.name)}">${m.name[0].toUpperCase()}</div>
        <div class="lb-name ${m.name===USERNAME?'lb-me':''}">${m.name}${m.name===USERNAME?' 👈':''}</div>
        <div style="text-align:right;font-size:10px;color:var(--text3)">${m.trades}</div>
        <div style="text-align:right;font-size:11px;color:var(--text2)">${m.wr.toFixed(1)}%</div>
        <div style="text-align:right;font-size:11px;font-weight:700;color:${m.pnl>=0?'var(--green)':'var(--red)'}">${m.pnl>=0?'+':''}$${m.pnl.toFixed(0)}</div>
      </div>`).join('');
}

function renderMyStatsBox(data){
  const el = document.getElementById('my-stats-box');
  if(!el) return;
  el.innerHTML = `
    <div class="rbox" style="margin-top:0">
      <div class="rr"><span class="rl">Nombre visible</span><span class="rv" style="color:var(--blue)">${data.name}</span></div>
      <div class="rr"><span class="rl">P&L Total</span><span class="rv ${data.pnl>=0?'ok':'bad'}">${data.pnl>=0?'+':''}$${data.pnl.toFixed(2)}</span></div>
      <div class="rr"><span class="rl">Win Rate</span><span class="rv">${data.wr.toFixed(1)}%</span></div>
      <div class="rr"><span class="rl">Trades</span><span class="rv">${data.trades}</span></div>
      <div class="rr"><span class="rl">Profit Factor</span><span class="rv">${data.pf>0?data.pf.toFixed(2):'—'}</span></div>
    </div>`;
  // also update topbar stats
  document.getElementById('lb-wr').textContent = data.wr.toFixed(1)+'%';
  document.getElementById('lb-pnl').textContent = (data.pnl>=0?'+':'')+`$${data.pnl.toFixed(0)}`;
}

async function refreshDashboardCommunity(){
  const members = await getAllMembers();
  document.getElementById('nb-lb').textContent = members.length;
  const rnk = ['🥇','🥈','🥉'];
  document.getElementById('dash-lb-count').textContent = members.length+' traders';
  document.getElementById('dash-lb').innerHTML = members.slice(0,5).map((m,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:11px">
      <span style="font-size:14px">${rnk[i]||i+1}</span>
      <div style="width:22px;height:22px;border-radius:50%;background:${avatarColor(m.name)};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff">${m.name[0].toUpperCase()}</div>
      <span style="flex:1;font-weight:600;color:${m.name===USERNAME?'var(--blue)':'var(--text)'}">${m.name}</span>
      <span style="font-weight:700;color:${m.pnl>=0?'var(--green)':'var(--red)'}">${m.pnl>=0?'+':''}$${m.pnl.toFixed(0)}</span>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--text3);font-size:11px">Sin datos aún</div>';

  // feed preview
  const feed = await sharedGet('group-feed') || [];
  document.getElementById('nb-feed').textContent = feed.length;
  const icons={win:'✅',loss:'❌',be:'➖'};
  document.getElementById('dash-feed').innerHTML = feed.slice(0,3).map(f=>`
    <div style="padding:8px 14px;border-bottom:1px solid var(--border);font-size:11px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span style="font-weight:700;color:var(--text)">${f.user}</span>
        <span>${icons[f.result]||'📊'}</span>
        <span style="color:var(--blue)">${f.asset}</span>
        <span style="font-size:9px;color:var(--text3);margin-left:auto">${f.time}</span>
      </div>
      <div style="color:var(--text2);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.note}</div>
    </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--text3);font-size:11px">Sin posts aún</div>';
}

// ══════════════════════════════════════════════════
// FEED (SHARED)
// ══════════════════════════════════════════════════
async function postFeed(withWA=false){
  const asset = document.getElementById('share-asset').value.trim();
  const result = document.getElementById('share-result').value;
  const pnl = parseFloat(document.getElementById('share-pnl').value)||0;
  const note = document.getElementById('share-note').value.trim();
  if(!asset||!note){ alert('Completá activo y notas'); return; }
  const entry = {id:Date.now(), user:USERNAME, asset:asset.toUpperCase(), result, pnl, note, time:new Date().toLocaleString('es-AR')};
  let feed = await sharedGet('group-feed') || [];
  feed.unshift(entry);
  if(feed.length>50) feed=feed.slice(0,50);
  await sharedSet('group-feed', feed);
  document.getElementById('share-asset').value='';
  document.getElementById('share-pnl').value='';
  document.getElementById('share-note').value='';
  await refreshFeed();
  if(withWA) shareToWhatsApp('feed-post', entry);
}
function postAndWhatsApp(){ postFeed(true); }

async function refreshFeed(){
  const feed = await sharedGet('group-feed') || [];
  document.getElementById('nb-feed').textContent = feed.length;
  document.getElementById('feed-count-tag').textContent = feed.length+' posts';
  const icons={win:'✅',loss:'❌',be:'➖'};
  document.getElementById('feed-list').innerHTML = feed.length===0
    ? '<div style="padding:28px;text-align:center;color:var(--text3);font-size:11px">Nadie compartió un trade aún.<br>¡Sé el primero!</div>'
    : feed.map(f=>`
      <div style="padding:12px 14px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:24px;height:24px;border-radius:50%;background:${avatarColor(f.user)};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff">${f.user[0].toUpperCase()}</div>
          <span style="font-size:11px;font-weight:700;color:${f.user===USERNAME?'var(--blue)':'var(--text)'}">${f.user}</span>
          <span style="font-size:14px">${icons[f.result]||'📊'}</span>
          <span style="font-size:11px;font-weight:700;color:var(--blue)">${f.asset}</span>
          ${f.pnl?`<span style="font-size:11px;font-weight:700;color:${f.pnl>=0?'var(--green)':'var(--red)'}">${f.pnl>=0?'+':''}$${f.pnl.toFixed(0)}</span>`:''}
          <span style="font-size:9px;color:var(--text3);margin-left:auto">${f.time}</span>
        </div>
        <div style="font-size:11px;color:var(--text2);line-height:1.6;padding-left:32px">${f.note}</div>
      </div>`).join('');
}

// ══════════════════════════════════════════════════
// WHATSAPP SHARING
// ══════════════════════════════════════════════════
async function shareToWhatsApp(type, data){
  let msg = '';
  if(type==='leaderboard'){
    const members = await getAllMembers();
    msg = '🏆 *TradeDIOS — Leaderboard del Grupo*\n\n';
    const rnk=['🥇','🥈','🥉'];
    members.slice(0,10).forEach((m,i)=>{
      msg += `${rnk[i]||i+1+'. '} *${m.name}* — ${m.pnl>=0?'+':''}$${m.pnl.toFixed(0)} | WR: ${m.wr.toFixed(1)}%\n`;
    });
    msg += '\n📊 _Datos en tiempo real desde TradeDIOS_';
  }
  else if(type==='mystats'){
    const T = MY_TRADES;
    const pnl = T.reduce((s,t)=>s+t.pnl,0);
    const wr = T.length?(T.filter(t=>t.pnl>0).length/T.length*100):0;
    msg = `📊 *Mis Stats — ${USERNAME}*\n\n`;
    msg += `💰 P&L: ${pnl>=0?'+':''}$${pnl.toFixed(2)}\n`;
    msg += `🎯 Win Rate: ${wr.toFixed(1)}%\n`;
    msg += `📋 Trades: ${T.length}\n`;
    msg += '\n_TradeDIOS v3_';
  }
  else if(type==='feed'){
    const feed = await sharedGet('group-feed') || [];
    msg = '💬 *Feed del Grupo — Últimos Trades*\n\n';
    const icons={win:'✅',loss:'❌',be:'➖'};
    feed.slice(0,5).forEach(f=>{
      msg += `${icons[f.result]} *${f.user}* — ${f.asset}\n_${f.note.substring(0,80)}${f.note.length>80?'…':''}_\n\n`;
    });
  }
  else if(type==='feed-post' && data){
    const icons={win:'✅',loss:'❌',be:'➖'};
    msg = `${icons[data.result]} *${data.user}* operó *${data.asset}*`;
    if(data.pnl) msg += ` — ${data.pnl>=0?'+':''}$${data.pnl.toFixed(0)}`;
    msg += `\n\n📝 ${data.note}\n\n_TradeDIOS v3_`;
  }
  if(msg){
    const url = 'https://wa.me/?text='+encodeURIComponent(msg);
    window.open(url,'_blank');
  }
}

function inviteWhatsApp(){
  const msg = `📊 *TradeDIOS — Dashboard de Trading del Grupo*\n\nTe invito al leaderboard compartido donde podemos comparar resultados, compartir trades y aprender juntos.\n\n➡️ Abrí este link: ${window.location.href}\n\n_Cuando lo abrís, ponés tu nombre y aparecés en el leaderboard automáticamente._`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}
function copyLink(){
  navigator.clipboard.writeText(window.location.href)
    .then(()=>alert('Link copiado ✅\nPegalo en el grupo de WhatsApp.'))
    .catch(()=>alert('Copiá esta URL:\n'+window.location.href));
}
function shareAItoWhatsApp(){
  if(!lastAiAnalysis) return;
  const asset = document.getElementById('ai-sym').value;
  const msg = `🤖 *Análisis IA — ${asset}*\n\n${lastAiAnalysis.replace(/<[^>]+>/g,'').substring(0,800)}\n\n⚠️ _Análisis educativo, no asesoramiento financiero._\n_TradeDIOS v3_`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

// ══════════════════════════════════════════════════
// TRADES
// ══════════════════════════════════════════════════
function addTrade(){
  const a = document.getElementById('ta').value.trim();
  const pnl = parseFloat(document.getElementById('tpnl').value);
  if(!a){ alert('Ingresá el activo'); return; }
  if(isNaN(pnl)){ alert('Ingresá el P&L'); return; }
  const t = {
    id:Date.now(), date:new Date().toLocaleDateString('es-AR'),
    dow:new Date().toLocaleDateString('es-AR',{weekday:'short'}),
    asset:a.toUpperCase(), dir:document.getElementById('td').value,
    market:document.getElementById('tm').value,
    entry:parseFloat(document.getElementById('te').value)||0,
    exit:parseFloat(document.getElementById('tx').value)||0,
    pnl, setup:document.getElementById('tsetup').value||'Sin setup',
    timeSlot:document.getElementById('ttime').value,
    emotion:parseInt(document.getElementById('temo').value)||3,
    notes:document.getElementById('tn').value,
  };
  MY_TRADES.unshift(t);
  LS.set('trades', MY_TRADES);
  MY_STREAK++; LS.set('streak', MY_STREAK);
  document.getElementById('streak-chip').textContent='🔥 '+MY_STREAK+' días';
  clearF(); renderT(); updateStats();
  publishMyStats(); // sync leaderboard
}
function clearF(){ ['ta','te','tx','tpnl','tn'].forEach(i=>{ const el=document.getElementById(i); if(el)el.value=''; }); }
function delTrade(id){ MY_TRADES=MY_TRADES.filter(t=>t.id!==id); LS.set('trades',MY_TRADES); renderT(); updateStats(); publishMyStats(); }

function renderT(){
  document.getElementById('tbl-badge').textContent=MY_TRADES.length+' trades';
  document.getElementById('nb-trades').textContent=MY_TRADES.length;
  const emos=['','😤','😟','😐','🙂','😎'];
  const tb=document.getElementById('tbod');
  if(!MY_TRADES.length){ tb.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">Sin operaciones aún.</td></tr>'; return; }
  tb.innerHTML=MY_TRADES.map(t=>`<tr>
    <td>${t.date}</td>
    <td style="color:var(--text);font-weight:600">${t.asset}</td>
    <td><span class="${t.dir==='LONG'?'bl2':'bs2'}">${t.dir}</span></td>
    <td style="font-size:10px;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.setup||'—'}</td>
    <td title="${['','Estrés','Ansioso','Neutro','Calmado','En zona'][t.emotion||3]}">${emos[t.emotion||3]}</td>
    <td class="${t.pnl>=0?'pw':'pl'}">${t.pnl>=0?'+':''}$${t.pnl.toFixed(2)}</td>
    <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text3);font-size:10px">${t.notes||'—'}</td>
    <td><button class="btn bd" onclick="delTrade(${t.id})">✕</button></td>
  </tr>`).join('');
}

// ══════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════
function updateStats(){
  const T=MY_TRADES;
  document.getElementById('eq-tag').textContent=T.length+' trades';
  if(!T.length){
    ['k-pnl','k-wr','k-pf','k-dd'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent = id==='k-pnl'?'$0.00':id==='k-wr'?'0%':id==='k-pf'?'—':'0%'; });
    document.getElementById('k-wrs').textContent='0 ops';
    document.getElementById('qstats').innerHTML='<div style="padding:28px;text-align:center;color:var(--text3);font-size:11px">Registrá operaciones.</div>';
    drawEQ([]); return;
  }
  const wins=T.filter(t=>t.pnl>0), losses=T.filter(t=>t.pnl<0);
  const wr=(wins.length/T.length*100).toFixed(1);
  const tot=T.reduce((s,t)=>s+t.pnl,0);
  const gw=wins.reduce((s,t)=>s+t.pnl,0);
  const gl=Math.abs(losses.reduce((s,t)=>s+t.pnl,0));
  const pf=gl>0?(gw/gl).toFixed(2):gw>0?'∞':'—';
  let pk=0,eq=0,dd=0;
  [...T].reverse().forEach(t=>{ eq+=t.pnl; if(eq>pk)pk=eq; const d=pk>0?(pk-eq)/pk*100:0; if(d>dd)dd=d; });
  const set=(id,v)=>{ const el=document.getElementById(id); if(el)el.textContent=v; };
  set('k-pnl',(tot>=0?'+':'')+`$${tot.toFixed(2)}`);
  set('k-wr',wr+'%'); set('k-wrs',`${T.length} ops · ${wins.length}W ${losses.length}L`);
  set('k-pf',pf); set('k-dd',dd.toFixed(1)+'%');
  document.getElementById('qstats').innerHTML=`<table style="width:100%;border-collapse:collapse">
    <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 14px;font-size:11px;color:var(--text2)">Gan. promedio</td><td style="padding:8px 14px;font-size:11px;color:var(--green);font-weight:700;text-align:right">+$${wins.length?(gw/wins.length).toFixed(2):'0.00'}</td></tr>
    <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 14px;font-size:11px;color:var(--text2)">Pérd. promedio</td><td style="padding:8px 14px;font-size:11px;color:var(--red);font-weight:700;text-align:right">-$${losses.length?(gl/losses.length).toFixed(2):'0.00'}</td></tr>
    <tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 14px;font-size:11px;color:var(--text2)">Mejor trade</td><td style="padding:8px 14px;font-size:11px;color:var(--green);font-weight:700;text-align:right">+$${T.length?Math.max(...T.map(t=>t.pnl)).toFixed(2):'0.00'}</td></tr>
    <tr><td style="padding:8px 14px;font-size:11px;color:var(--text2)">P&L Total</td><td style="padding:8px 14px;font-size:14px;font-weight:800;font-family:'Syne',sans-serif;color:${tot>=0?'var(--green)':'var(--red)'};text-align:right">${tot>=0?'+':''}$${tot.toFixed(2)}</td></tr>
  </table>`;
  let re=0; const pts=[0,...[...T].reverse().map(t=>{ re+=t.pnl; return re; })];
  drawEQ(pts);
}

function drawEQ(pts){
  const c=document.getElementById('eqCanvas'); if(!c)return;
  const dpr=window.devicePixelRatio||1;
  c.width=c.offsetWidth*dpr; c.height=130*dpr;
  const ctx=c.getContext('2d'); ctx.scale(dpr,dpr);
  const W=c.offsetWidth/dpr, H=130;
  ctx.clearRect(0,0,W,H);
  if(!pts||pts.length<2){ ctx.fillStyle='#484f58'; ctx.font='11px JetBrains Mono'; ctx.textAlign='center'; ctx.fillText('Sin datos aún',W/2,H/2); return; }
  const mn=Math.min(...pts), mx=Math.max(...pts), rng=(mx-mn)||1;
  ctx.strokeStyle='#21262d'; ctx.lineWidth=0.5;
  for(let i=0;i<=3;i++){ const y=8+(H-16)*i/3; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const co=pts.map((v,i)=>({x:i/(pts.length-1)*W, y:H-8-(v-mn)/rng*(H-16)}));
  const pos=pts[pts.length-1]>=0, cl=pos?'#3fb950':'#f85149';
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, pos?'rgba(63,185,80,.15)':'rgba(248,81,73,.15)'); g.addColorStop(1,'transparent');
  ctx.beginPath(); ctx.moveTo(co[0].x,H); co.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(co[co.length-1].x,H); ctx.closePath(); ctx.fillStyle=g; ctx.fill();
  ctx.beginPath(); ctx.moveTo(co[0].x,co[0].y); co.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.strokeStyle=cl; ctx.lineWidth=2; ctx.stroke();
  const L=co[co.length-1]; ctx.beginPath(); ctx.arc(L.x,L.y,4,0,Math.PI*2); ctx.fillStyle=cl; ctx.fill();
}

// ══════════════════════════════════════════════════
// CHECKLIST
// ══════════════════════════════════════════════════
const CHK_LIST=[
  {id:'plan', title:'Tengo un plan claro para esta operación', sub:'Sé exactamente por qué entro, no es una corazonada'},
  {id:'stop', title:'El stop-loss está definido ANTES de entrar', sub:'Sin stop no hay operación, es la regla número uno'},
  {id:'rr',   title:'El ratio R:R es mayor a 1:2', sub:'Por cada $ arriesgado puedo ganar al menos $2'},
  {id:'news',  title:'Revisé el calendario económico', sub:'No hay noticias de alto impacto en la próxima hora'},
  {id:'trend', title:'Opero a favor de la tendencia dominante', sub:'No estoy peleando contra el mercado'},
  {id:'size',  title:'El position size no supera el 2% de riesgo', sub:'Lo calculé con la calculadora de riesgo'},
  {id:'emo',   title:'No estoy operando por FOMO o revenge', sub:'Esta decisión la tomé en calma, no bajo presión'},
  {id:'sys',   title:'Esta operación está dentro de mi sistema', sub:'Es un setup que conozco y que está en mi plan'},
];
function renderChk(){
  document.getElementById('chk-items').innerHTML = CHK_LIST.map(item=>`
    <div class="chk-item ${MY_CHK[item.id]?'checked':''}" onclick="toggleChk('${item.id}')">
      <div class="chk-box">${MY_CHK[item.id]?'✓':''}</div>
      <div>
        <div style="font-size:12px;color:var(--text)">${item.title}</div>
        <div style="font-size:10px;color:var(--text3);margin-top:1px">${item.sub}</div>
      </div>
    </div>`).join('');
  const done = CHK_LIST.filter(i=>MY_CHK[i.id]).length;
  const pct = Math.round(done/CHK_LIST.length*100);
  document.getElementById('chk-bar').style.width = pct+'%';
  document.getElementById('chk-pct').textContent = `${pct}% — ${done}/${CHK_LIST.length} completados`;
  document.getElementById('chk-tag').textContent = `${done} / ${CHK_LIST.length}`;
  const btn = document.getElementById('btn-open-diario');
  const nbchk = document.getElementById('nb-chk');
  if(pct===100){ btn.disabled=false; btn.style.opacity='1'; nbchk.style.display='none'; }
  else { btn.disabled=true; btn.style.opacity='.4'; nbchk.style.display=''; }
}
function toggleChk(id){ MY_CHK[id]=!MY_CHK[id]; LS.set('chk',MY_CHK); renderChk(); }
function resetChk(){ MY_CHK={}; LS.set('chk',MY_CHK); renderChk(); }

// ══════════════════════════════════════════════════
// EMOTION
// ══════════════════════════════════════════════════
const EMOS=[
  {v:1,i:'😤',l:'Estrés',  c:'var(--red)',   fb:'⛔ No operés hoy. El estrés destruye el juicio. Cerrá la plataforma.'},
  {v:2,i:'😟',l:'Ansioso', c:'var(--orange)', fb:'⚠️ Alta precaución. Si operás, reducí el tamaño de posición a la mitad.'},
  {v:3,i:'😐',l:'Neutro',  c:'var(--yellow)', fb:'🟡 Podés operar pero mantenete en tus parámetros habituales.'},
  {v:4,i:'🙂',l:'Calmado', c:'var(--green)',  fb:'✅ Buen estado. Seguí tu plan y confiá en el sistema.'},
  {v:5,i:'😎',l:'En zona', c:'var(--blue)',   fb:'🚀 Estado óptimo. Operar con convicción y tamaño normal de posición.'},
];
function renderEmo(){
  document.getElementById('emo-btns').innerHTML = EMOS.map(e=>`
    <div class="emo-btn ${MY_EMO===e.v?'sel':''}" onclick="setEmo(${e.v})">
      <div style="font-size:18px">${e.i}</div>
      <div style="font-size:9px;color:var(--text3);margin-top:3px">${e.l}</div>
    </div>`).join('');
  if(MY_EMO){
    const e = EMOS.find(x=>x.v===MY_EMO);
    const fb = document.getElementById('emo-feedback');
    fb.textContent = e.fb; fb.style.color = e.c;
  }
}
function setEmo(v){ MY_EMO=v; LS.set('emo',v); renderEmo(); }

// ══════════════════════════════════════════════════
// PATTERNS
// ══════════════════════════════════════════════════
function renderPatterns(){
  const T = MY_TRADES;
  const empty = '<div style="color:var(--text3);font-size:11px;padding:16px;text-align:center">Necesitás más operaciones para ver patrones claros.</div>';
  if(T.length < 3){
    ['pat-days','pat-setups','pat-emos','pat-mkts','pat-insights'].forEach(id=>{ const el=document.getElementById(id); if(el)el.innerHTML=empty; });
    return;
  }
  const group=(key)=>{
    const d={};
    T.forEach(t=>{
      const k=t[key]||'?';
      if(!d[k])d[k]={pnl:0,count:0,wins:0};
      d[k].pnl+=t.pnl; d[k].count++; if(t.pnl>0)d[k].wins++;
    });
    return d;
  };
  const emoLabels=['','😤 Estrés','😟 Ansioso','😐 Neutro','🙂 Calmado','😎 En zona'];
  const dayData=group('dow');
  const setupData=group('setup');
  const mktData=group('market');
  const emoData={};
  T.forEach(t=>{ const e=t.emotion||3; const l=emoLabels[e]; if(!emoData[l])emoData[l]={pnl:0,count:0,wins:0}; emoData[l].pnl+=t.pnl; emoData[l].count++; if(t.pnl>0)emoData[l].wins++; });

  const renderBar=(id,data)=>{
    const el=document.getElementById(id); if(!el)return;
    const entries=Object.entries(data);
    if(!entries.length){el.innerHTML=empty;return;}
    const vals=entries.map(e=>e[1].pnl);
    const maxAbs=Math.max(...vals.map(Math.abs),1);
    el.innerHTML='<div style="display:flex;flex-direction:column;gap:5px">'+entries.map(([k,v])=>{
      const pct=Math.abs(v.pnl)/maxAbs*100, pos=v.pnl>=0;
      const wr=v.count?Math.round(v.wins/v.count*100):0;
      return `<div style="display:flex;align-items:center;gap:8px;font-size:11px">
        <div style="width:85px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0">${k}</div>
        <div style="flex:1;height:16px;background:var(--bg3);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${pos?'rgba(63,185,80,.5)':'rgba(248,81,73,.5)'};border-radius:3px"></div>
        </div>
        <div style="width:65px;text-align:right;color:${pos?'var(--green)':'var(--red)'};font-weight:700">${pos?'+':''}$${v.pnl.toFixed(0)}</div>
        <div style="width:32px;text-align:right;color:var(--text3);font-size:9px">${wr}%</div>
      </div>`;
    }).join('')+'</div>';
  };
  renderBar('pat-days',dayData);
  renderBar('pat-setups',setupData);
  renderBar('pat-emos',emoData);
  renderBar('pat-mkts',mktData);

  // Bests
  const bestOf=(data,metric='pnl')=>Object.entries(data).sort((a,b)=>b[1][metric]-a[1][metric])[0];
  const worstOf=(data,metric='pnl')=>Object.entries(data).sort((a,b)=>a[1][metric]-b[1][metric])[0];
  const bd=bestOf(dayData); const wd=worstOf(dayData);
  const bs=bestOf(setupData); const be=bestOf(emoData);
  const timeData={}; T.forEach(t=>{ const ts=(t.timeSlot||'?').split(' ')[0]; if(!timeData[ts])timeData[ts]={pnl:0}; timeData[ts].pnl+=t.pnl; });
  const bt=Object.entries(timeData).sort((a,b)=>b[1].pnl-a[1].pnl)[0];

  const setEl=(id,v)=>{ const el=document.getElementById(id); if(el)el.textContent=v; };
  if(bd) setEl('pat-bd',bd[0]);
  if(wd) setEl('pat-wd',wd[0]);
  if(bs) setEl('pat-bs',bs[0].split(' ')[0]);
  if(be) setEl('pat-be',be[0].split(' ')[0]);
  if(bt) setEl('pat-bt',bt[0]);

  // Auto insights
  const insights=[];
  const tot=T.reduce((s,t)=>s+t.pnl,0);
  const allWR=T.filter(t=>t.pnl>0).length/T.length*100;
  const hiEmo=T.filter(t=>(t.emotion||3)<=2);
  if(hiEmo.length>=2){
    const hiWR=hiEmo.filter(t=>t.pnl>0).length/hiEmo.length*100;
    if(hiWR<allWR-10) insights.push({t:'warn',i:'😟',txt:`Cuando operás con <strong>ansiedad o estrés</strong> tu win rate cae al ${hiWR.toFixed(0)}% vs tu promedio de ${allWR.toFixed(0)}%. Evitá operar en esos estados.`});
  }
  if(bd&&bd[1].pnl>0) insights.push({t:'good',i:'📅',txt:`Tus <strong>mejores resultados</strong> son los días ${bd[0]}. Considerá concentrar tus operaciones esos días.`});
  if(wd&&wd[1].pnl<0) insights.push({t:'warn',i:'⚠️',txt:`Los días <strong>${wd[0]}</strong> tenés resultados negativos consistentes. Evaluá reducir actividad o revisar qué sucede.`});
  if(bs&&bs[1].pnl>0) insights.push({t:'good',i:'🎯',txt:`Tu setup más rentable es <strong>"${bs[0]}"</strong>. Enfocate en encontrar más oportunidades de este tipo y evitá operar otros setups.`});
  if(tot>0) insights.push({t:'good',i:'📈',txt:`Tu curva de equity es <strong>positiva</strong> con +$${tot.toFixed(2)} neto. El sistema funciona, seguí con el plan.`});
  else if(tot<0) insights.push({t:'warn',i:'📉',txt:`Tu curva de equity es <strong>negativa</strong> con -$${Math.abs(tot).toFixed(2)}. Revisá tu proceso antes de seguir operando.`});
  if(!insights.length) insights.push({t:'info',i:'📊',txt:'Registrá más operaciones para obtener insights personalizados. Con 10+ trades empezarán a aparecer patrones claros.'});
  document.getElementById('pat-insights').innerHTML = insights.map(i=>`<div class="ins ${i.t}"><span class="ins-ico">${i.i}</span><div class="ins-txt">${i.txt}</div></div>`).join('');
}

// ══════════════════════════════════════════════════
// RISK CALC
// ══════════════════════════════════════════════════
function calcR(){
  const cap=+document.getElementById('cc').value||0, rp=+document.getElementById('cr').value||0;
  const en=+document.getElementById('ce').value||0, sl=+document.getElementById('cs').value||0;
  const tp2=+document.getElementById('ctp').value||0, mn=+document.getElementById('cm').value||2;
  const amt=cap*rp/100, sld=Math.abs(en-sl), tpd=Math.abs(tp2-en);
  const sz=sld>0?Math.floor(amt/sld):0, rr=sld>0?tpd/sld:0, ok=rr>=mn;
  const s=(id,v)=>{ const el=document.getElementById(id); if(el)el.textContent=v; };
  s('r-amt',`$${amt.toFixed(2)}`);
  s('r-sz',`${sz} uds.`);
  s('r-sl',`$${sld.toFixed(2)} (${en>0?(sld/en*100).toFixed(2):0}%)`);
  s('r-tp',`$${tpd.toFixed(2)} (${en>0?(tpd/en*100).toFixed(2):0}%)`);
  s('r-rr',`1:${rr.toFixed(2)}`);
  const oel=document.getElementById('r-ok'); if(!oel)return;
  oel.textContent = ok?`✅ SÍ — Válida (R:R ${rr.toFixed(1)})`:`❌ NO — R:R ${rr.toFixed(1)} < mínimo ${mn}`;
  oel.className='rv '+(ok?'ok':'bad');
}
function renderRules(){
  const el=document.getElementById('rules'); if(!el)return;
  el.innerHTML=[
    {i:'h',t:'Máximo 1-2% de riesgo por trade',s:'Con $10k → máx $200 en riesgo por operación'},
    {i:'h',t:'Stop-Loss activo antes de entrar',s:'Sin stop = apuesta, no trading'},
    {i:'m',t:'Ratio R:R mínimo 1:2',s:'Con 40% win rate seguís siendo rentable'},
    {i:'m',t:'Daily Stop: si perdés 3%, cerrá el día',s:'Protegé tu capital y tu psicología'},
    {i:'l',t:'No amplíes el stop-loss nunca',s:'Ampliar el stop es negarte la realidad'},
    {i:'l',t:'Cero revenge trading',s:'Después de una pérdida, tomá distancia'},
  ].map(r=>`<div class="ev"><div class="dot ${r.i}"></div><div style="flex:1"><div style="color:var(--text);font-size:11px">${r.t}</div><div style="color:var(--text3);font-size:10px;margin-top:1px">${r.s}</div></div></div>`).join('');
}

// ══════════════════════════════════════════════════
// AI ANALYSIS
// ══════════════════════════════════════════════════
function saveKey(){ API_KEY=document.getElementById('api-key').value.trim(); LS.set('key',API_KEY); alert(API_KEY?'API Key guardada ✅':'Key borrada.'); }
async function runAI(){
  const asset=document.getElementById('ai-sym').value;
  const btn=document.getElementById('ai-btn');
  btn.disabled=true; btn.textContent='Analizando…';
  document.getElementById('ai-out').innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:16px;color:var(--text3);font-size:11px"><div class="spinner"></div>Analizando ${asset}…</div>`;
  const prompt=`Eres un analista de mercados experto. Analiza ${asset} en formato educativo.\n\nResponde EXACTAMENTE en este formato:\n\n**SESGO:** [ALCISTA/BAJISTA/NEUTRAL] — [una línea explicando por qué]\n\n**CONTEXTO TÉCNICO:**\n[2-3 líneas sobre tendencia, niveles clave, indicadores]\n\n**CONTEXTO FUNDAMENTAL:**\n[2-3 líneas sobre catalizadores actuales]\n\n**NIVELES CLAVE:**\n- Soporte: [nivel]\n- Resistencia: [nivel]\n- Stop sugerido: [nivel]\n- Target 1: [nivel] | Target 2: [nivel]\n\n**RATIO R:R ESTIMADO:** 1:X\n\n**APRENDIZAJE — POR QUÉ ESTE ANÁLISIS:**\n[3-4 líneas explicando la lógica para que el estudiante aprenda a replicarla]\n\n**SEÑALES A MONITOREAR:**\n[2-3 cosas concretas a observar]\n\n⚠️ Análisis educativo, no asesoramiento financiero.`;
  try{
    let txt='';
    if(API_KEY){
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})});
      const data=await res.json();
      txt=data.content?.map(c=>c.text||'').join('')||'Error en la respuesta.';
    } else {
      await new Promise(r=>setTimeout(r,1200));
      txt=DEMO_ANALYSIS[asset]||DEMO_ANALYSIS['default'];
    }
    lastAiAnalysis=txt;
    const isAlcista=txt.includes('ALCISTA'), isBajista=txt.includes('BAJISTA');
    const fmt=txt.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    document.getElementById('ai-out').innerHTML=`<div class="ai-bubble">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:16px">🤖</span>
        <span style="font-size:11px;font-weight:700;color:var(--purple)">TradeDIOS AI</span>
        <span style="font-size:9px;color:var(--text3);margin-left:auto">${new Date().toLocaleTimeString('es-AR',{hour12:false})} ${API_KEY?'(Live)':'(Demo)'}</span>
      </div>
      <div class="ai-body">${fmt}</div>
      <div class="ai-tags" style="margin-top:10px">
        <span class="ai-tag ${isAlcista?'bull':isBajista?'bear':'neu'}">${isAlcista?'📈 ALCISTA':isBajista?'📉 BAJISTA':'➖ NEUTRAL'}</span>
        <span class="ai-tag neu">🎓 Educativo</span>
        <span class="ai-tag neu">⚠️ No es asesoramiento</span>
      </div>
    </div>`;
    document.getElementById('ai-wa-btn').style.display='';
  }catch(e){
    document.getElementById('ai-out').innerHTML=`<div class="ai-bubble"><div class="ai-body" style="color:var(--red)">Error: ${e.message}</div></div>`;
  }
  btn.disabled=false; btn.textContent='🤖 Analizar';
}
const DEMO_ANALYSIS={
'NVDA':`**SESGO:** ALCISTA — NVIDIA sigue siendo el líder indiscutido en semiconductores para IA con fundamentales excepcionales.\n\n**CONTEXTO TÉCNICO:**\nEl precio cotiza sobre su EMA50 confirmando tendencia alcista de mediano plazo. El RSI en zona 55-65 muestra momentum positivo sin sobrecompra. La zona $185-190 es soporte clave donde confluyen EMA20 y nivel de consolidación previo.\n\n**CONTEXTO FUNDAMENTAL:**\nQ4 FY2026 superó todas las estimaciones: $68.1B ingresos (+73% YoY). Data Center sigue creciendo impulsado por demanda de GPUs para IA. Guidance Q1 FY2027 de $78B confirma el momentum.\n\n**NIVELES CLAVE:**\n- Soporte: $185-187 (EMA20 + zona de consolidación)\n- Resistencia: $205-210 (máximos recientes)\n- Stop sugerido: $182\n- Target 1: $205 | Target 2: $220\n\n**RATIO R:R ESTIMADO:** 1:2.5\n\n**APRENDIZAJE — POR QUÉ ESTE ANÁLISIS:**\nEste análisis combina fundamentales (sesgo) con técnico (timing y niveles). Los fundamentales dicen HACIA DÓNDE va el precio en el mediano plazo. El análisis técnico dice CUÁNDO y DÓNDE entrar. Nunca los uses por separado: un activo con fundamentales alcistas sigue necesitando un punto técnico correcto de entrada para optimizar el R:R.\n\n**SEÑALES A MONITOREAR:**\n1. Cierre diario >$200 con volumen confirmaría ruptura hacia $210\n2. Rebote en soporte $185-187 = entrada en retroceso\n3. Noticias sobre regulación de chips a China podrían invalidar el sesgo`,
'BTC':`**SESGO:** NEUTRAL — Bitcoin en consolidación entre rangos esperando catalizador definitivo.\n\n**CONTEXTO TÉCNICO:**\nBTC en rango lateral de mediano plazo. Estructura de máximos y mínimos similares indica indecisión. El MACD cerca del cero confirma equilibrio entre compradores y vendedores. Volumen decreciente sugiere acumulación silenciosa.\n\n**CONTEXTO FUNDAMENTAL:**\nETFs de BTC spot mantienen flujos positivos institucionales. El contexto macro (decisiones Fed, risk-on/off global) sigue siendo el driver principal de corto plazo. El halving sigue siendo un catalizador estructural de largo plazo.\n\n**NIVELES CLAVE:**\n- Soporte: $82,000-$84,000 (demanda institucional)\n- Resistencia: $92,000-$95,000 (zona de oferta)\n- Stop sugerido: $79,500\n- Target 1: $92,000 | Target 2: $100,000\n\n**RATIO R:R ESTIMADO:** 1:2.2\n\n**APRENDIZAJE — POR QUÉ ESTE ANÁLISIS:**\nEn mercados laterales (ranging) la estrategia óptima es operar los extremos del rango: comprar cerca del soporte con stop debajo, tomar ganancias cerca de la resistencia. El error más común es buscar rupturas en el medio del rango donde el precio no tiene dirección definida. Esperá la confirmación en los extremos.\n\n**SEÑALES A MONITOREAR:**\n1. Ruptura con volumen >$95k → sesgo fuertemente alcista\n2. Cierre <$82k → sesgo bajista hacia $75k\n3. Datos de inflación USA y decisiones Fed son los drivers macro`,
'default':`**SESGO:** NEUTRAL — Análisis demo. Configurá tu API key para análisis en tiempo real.\n\n**CONTEXTO TÉCNICO:**\nEste es un análisis de demostración. Con tu Anthropic API key, TradeDIOS AI analiza el contexto actual del mercado en tiempo real, incluyendo tendencia, indicadores y niveles clave específicos.\n\n**CONTEXTO FUNDAMENTAL:**\nCon la API key activada, el análisis considera noticias recientes, earnings, contexto macro y catalizadores fundamentales actuales del activo seleccionado.\n\n**NIVELES CLAVE:**\n- Los niveles específicos requieren API key activa\n- El análisis demo muestra la estructura del output\n\n**RATIO R:R ESTIMADO:** Variable según condiciones\n\n**APRENDIZAJE — POR QUÉ ESTE ANÁLISIS:**\nTradeDIOS AI está diseñado para enseñarte a pensar como un trader profesional. Cada análisis explica el razonamiento detrás de cada decisión para que puedas replicar la lógica por tu cuenta, no solo seguir señales ciegamente.\n\n**SEÑALES A MONITOREAR:**\n1. Configurá tu API key en el panel de configuración\n2. Los análisis en tiempo real usan contexto actual del mercado\n3. Siempre combiná con tu propio análisis y gestión de riesgo`
};

// ══════════════════════════════════════════════════
// MODULES
// ══════════════════════════════════════════════════
let ACTIVE_MOD = null;

function renderMods(){
  var done = MY_MODULES.filter(function(m){return m.p===100;}).length;
  var pct = Math.round(done/MY_MODULES.length*100);
  function s(id,v){var el=document.getElementById(id);if(el)el.textContent=v;}
  s('lp', pct+'%');
  s('ld', done);
  s('lps', done+'/'+MY_MODULES.length);
  var nxt = MY_MODULES.find(function(m){return m.p>0&&m.p<100;})||MY_MODULES.find(function(m){return m.p===0;});
  s('ln', nxt ? nxt.name : '🏆 Completado!');
  s('l-nivel', done<3?'Básico':done<6?'Intermedio':'Avanzado');
  var grid = document.getElementById('mod-grid');
  if(!grid) return;
  var html = '';
  MY_MODULES.forEach(function(m){
    var d = m.p===100;
    var active = ACTIVE_MOD===m.id;
    var nivel = m.nivel||'Básico';
    var tiempo = m.tiempo||'15 min';
    var chk = d ? '✅' : '⬜';
    html += '<div style="padding:10px 14px;border-bottom:1px solid var(--border);cursor:pointer" onclick="openMod('+m.id+')">';
    html += '<div style="display:flex;align-items:center;gap:8px">';
    html += '<span style="font-size:16px">'+m.ico+'</span>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--text)">'+m.name+'</div>';
    html += '<div style="font-size:9px;color:var(--text3)">'+nivel+' &middot; '+tiempo+'</div>';
    html += '</div>';
    html += '<span style="font-size:13px">'+chk+'</span>';
    html += '</div>';
    html += '<div class="pb" style="margin-top:6px"><div class="pf '+m.c+'" style="width:'+m.p+'%"></div></div>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

function openMod(id){
  ACTIVE_MOD = id;
  var m = MY_MODULES.find(function(x){return x.id===id;});
  if(!m) return;
  renderMods();
  var header = document.getElementById('mod-content-header');
  var body = document.getElementById('mod-content-body');
  var footer = document.getElementById('mod-content-footer');
  var btn = document.getElementById('mod-complete-btn');
  var tagColor = m.c==='b'?'bl':m.c==='y'?'y':'g';
  if(header) header.innerHTML = '<span class="ct">'+m.ico+' '+m.name+'</span><span class="ctag '+tagColor+'">'+(m.nivel||'Básico')+'</span>';
  if(body){
    var contenido = m.contenido||[];
    var borderColor = m.c==='b'?'var(--blue)':m.c==='y'?'var(--yellow)':'var(--green)';
    var bhtml = '';
    contenido.forEach(function(c){
      var txt = c.txt.replace(/
/g,'<br>');
      bhtml += '<div style="margin-bottom:16px;padding:14px;background:var(--bg2);border-radius:8px;border-left:3px solid '+borderColor+'">';
      bhtml += '<div style="font-size:11px;font-weight:700;color:var(--text);margin-bottom:8px">'+c.t+'</div>';
      bhtml += '<div style="font-size:12px;color:var(--text2);line-height:1.7">'+txt+'</div>';
      bhtml += '</div>';
    });
    if(m.p===100) bhtml += '<div style="text-align:center;padding:16px;color:var(--green)">✅ Módulo completado</div>';
    body.innerHTML = bhtml;
  }
  if(footer) footer.style.display='block';
  if(btn) btn.textContent = m.p===100 ? '↺ Reiniciar módulo' : '✅ Marcar como completado';
}

function completeCurrentMod(){
  if(!ACTIVE_MOD) return;
  var m = MY_MODULES.find(function(x){return x.id===ACTIVE_MOD;});
  if(!m) return;
  m.p = m.p===100 ? 0 : 100;
  LS.set('mods', MY_MODULES);
  openMod(ACTIVE_MOD);
  renderMods();
}

function cycMod(id){ openMod(id); }

// ══════════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════════
const CAL=[
  {t:'08:30',n:'IPC — Inflación EE.UU.',f:'🇺🇸',i:'h',d:'Mié'},
  {t:'14:30',n:'Ventas Minoristas USA',f:'🇺🇸',i:'h',d:'Mar'},
  {t:'14:30',n:'Actas FOMC — Fed',f:'🇺🇸',i:'h',d:'Mié'},
  {t:'08:30',n:'Solicitudes de Desempleo',f:'🇺🇸',i:'m',d:'Jue'},
  {t:'08:30',n:'NFP — Nóminas no Agrícolas',f:'🇺🇸',i:'h',d:'Vie'},
  {t:'08:30',n:'Tasa de Desempleo',f:'🇺🇸',i:'h',d:'Vie'},
];
function renderMiniCal(){
  const el = document.getElementById('mini-cal');
  if(el) el.innerHTML = CAL.filter(e=>e.i==='h').map(e=>`
    <div class="ev"><span style="color:var(--text2);min-width:40px">${e.t}</span><div class="dot ${e.i}"></div><span style="flex:1;color:var(--text)">${e.f} ${e.n}</span><span style="font-size:9px;color:var(--text3)">${e.d}</span></div>`).join('');
}

// ── CALENDARIO COMPLETO ──────────────────────────────
const FULL_CAL = [
  {d:'Lun',t:'10:00',n:'REM — Resultado BCRA',f:'🇦🇷',i:'h',cat:'ar',imp:'GGAL,AL30',desc:'Reservas del BCRA, impacto en tipo de cambio'},
  {d:'Lun',t:'14:30',n:'PMI Manufacturero USA',f:'🇺🇸',i:'m',cat:'us',imp:'SPY,QQQ',desc:'Actividad industrial, impacto en índices'},
  {d:'Mar',t:'08:30',n:'Inflación CPI EE.UU.',f:'🇺🇸',i:'h',cat:'us',imp:'BTC,SPY,QQQ,GLD',desc:'Dato más importante del mes. Alto CPI = Fed sube tasas = cripto y acciones bajan'},
  {d:'Mar',t:'16:00',n:'Confianza del Consumidor',f:'🇺🇸',i:'m',cat:'us',imp:'SPY,AAPL,AMZN',desc:'Indicador de gasto del consumidor'},
  {d:'Mié',t:'08:30',n:'Actas FOMC — Fed',f:'🇺🇸',i:'h',cat:'us',imp:'BTC,SPY,QQQ,GLD,XAUUSD',desc:'Decisión de tasas de interés. El evento más movedor del mercado'},
  {d:'Mié',t:'10:30',n:'Inventarios de Petróleo EIA',f:'🇺🇸',i:'m',cat:'us',imp:'XBRUSD,YPFD,PAMP',desc:'Si inventarios bajan → petróleo sube → YPF y PAMP suben'},
  {d:'Jue',t:'08:30',n:'Solicitudes de Desempleo',f:'🇺🇸',i:'m',cat:'us',imp:'SPY,QQQ',desc:'Más desempleo = economía débil = Fed puede bajar tasas'},
  {d:'Jue',t:'15:00',n:'Licitación de Letras BCRA',f:'🇦🇷',i:'h',cat:'ar',imp:'AL30,GGAL',desc:'Resultado de licitaciones del tesoro argentino'},
  {d:'Vie',t:'08:30',n:'NFP — Nóminas no Agrícolas',f:'🇺🇸',i:'h',cat:'us',imp:'SPY,QQQ,BTC,XAUUSD',desc:'Dato de empleo más importante. Mueve todos los mercados'},
  {d:'Vie',t:'08:30',n:'Tasa de Desempleo USA',f:'🇺🇸',i:'h',cat:'us',imp:'SPY,QQQ',desc:'Desempleo bajo = economía fuerte = Fed mantiene tasas altas'},
  {d:'Var',t:'—',n:'Earnings NVDA / Próx. trimestre',f:'🇺🇸',i:'h',cat:'us',imp:'NVDA,QQQ,SPY',desc:'Reporte de ganancias. Mueve NVDA ±15% en un día'},
  {d:'Var',t:'—',n:'Halvening BTC histórico',f:'₿',i:'h',cat:'crypto',imp:'BTC,ETH,SOL,DOGE',desc:'Reducción a la mitad de recompensa minera. Evento alcista estructural'},
  {d:'Var',t:'—',n:'IPC Argentina — INDEC',f:'🇦🇷',i:'h',cat:'ar',imp:'AL30,GGAL,YPFD,PAMP',desc:'Dato de inflación argentina. Impacta bonos y acciones locales'},
  {d:'Var',t:'—',n:'Decisión Fed — FOMC',f:'🇺🇸',i:'h',cat:'us',imp:'BTC,SPY,QQQ,GLD,XAUUSD',desc:'8 veces al año. Sube, baja o mantiene tasas'},
  {d:'Var',t:'—',n:'Vencimiento Bonos AL30',f:'🇦🇷',i:'h',cat:'ar',imp:'AL30,GGAL',desc:'Pagos de interés y capital del bono soberano AL30'},
];

let CAL_FILTER = 'all';

function loadCalendar(){
  renderFullCalendar();
  // KPIs
  const today = FULL_CAL.filter(e=>e.i==='h').length;
  const high = FULL_CAL.filter(e=>e.i==='h').length;
  const next = FULL_CAL.find(e=>e.i==='h');
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('cal-today', today);
  s('cal-high', high);
  s('cal-next', next ? next.n.substring(0,20)+'...' : '—');
  renderUpcoming();
}

function renderFullCalendar(){
  const filter = document.getElementById('cal-filter') ? document.getElementById('cal-filter').value : 'all';
  const items = FULL_CAL.filter(e=>{
    if(filter==='high') return e.i==='h';
    if(filter==='us') return e.cat==='us';
    if(filter==='ar') return e.cat==='ar';
    if(filter==='crypto') return e.cat==='crypto';
    return true;
  });
  const body = document.getElementById('cal-body');
  if(!body) return;
  if(!items.length){body.innerHTML='<div style="padding:30px;text-align:center;color:var(--text3)">Sin eventos para este filtro</div>';return;}
  body.innerHTML = items.map(e=>{
    const impColor = e.i==='h'?'var(--red)':e.i==='m'?'var(--yellow)':'var(--text3)';
    const impLabel = e.i==='h'?'⚠️ Alto':e.i==='m'?'◦ Medio':'· Bajo';
    const assets = (e.imp||'').split(',').map(a=>'<span style="font-size:9px;padding:2px 6px;background:var(--bg3);border-radius:4px;color:var(--text2)">'+a+'</span>').join(' ');
    return '<div style="padding:12px 14px;border-bottom:1px solid var(--border);cursor:default" onmouseenter="this.style.background='var(--bg2)'" onmouseleave="this.style.background='transparent'">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'
      +'<span style="font-size:16px">'+e.f+'</span>'
      +'<div style="flex:1">'
      +'<div style="font-size:12px;font-weight:700;color:var(--text)">'+e.n+'</div>'
      +'<div style="font-size:10px;color:var(--text3)">'+e.d+' '+e.t+'</div>'
      +'</div>'
      +'<span style="font-size:10px;color:'+impColor+'">'+impLabel+'</span>'
      +'</div>'
      +'<div style="font-size:11px;color:var(--text2);margin-bottom:6px">'+e.desc+'</div>'
      +'<div style="display:flex;gap:4px;flex-wrap:wrap">'+assets+'</div>'
    +'</div>';
  }).join('');
}

function renderCal(){ renderFullCalendar(); }

function renderUpcoming(){
  const el = document.getElementById('cal-upcoming');
  if(!el) return;
  const top = FULL_CAL.filter(e=>e.i==='h').slice(0,5);
  el.innerHTML = top.map(e=>{
    return '<div style="padding:8px;background:var(--bg2);border-radius:6px;border-left:3px solid var(--red)">'
      +'<div style="font-size:11px;font-weight:700;color:var(--text)">'+e.f+' '+e.n+'</div>'
      +'<div style="font-size:9px;color:var(--text3);margin-top:2px">'+e.d+' · '+e.imp+'</div>'
    +'</div>';
  }).join('');
}

// ══════════════════════════════════════════════════
// CHART
// ══════════════════════════════════════════════════
const CATS={
  tech:[{s:'NASDAQ:NVDA',l:'NVDA'},{s:'NASDAQ:AAPL',l:'AAPL'},{s:'NASDAQ:TSLA',l:'TSLA'},{s:'NASDAQ:MSFT',l:'MSFT'},{s:'NASDAQ:META',l:'META'},{s:'NASDAQ:GOOGL',l:'GOOGL'},{s:'NASDAQ:AMZN',l:'AMZN'},{s:'NASDAQ:NFLX',l:'NFLX'},{s:'NYSE:AMD',l:'AMD'},{s:'NASDAQ:INTC',l:'INTC'},{s:'NYSE:ORCL',l:'ORCL'},{s:'NYSE:COIN',l:'COIN'},{s:'NASDAQ:MSTR',l:'MSTR'},{s:'NYSE:PLTR',l:'PLTR'},{s:'NYSE:UBER',l:'UBER'},{s:'NASDAQ:ABNB',l:'ABNB'},{s:'NASDAQ:RIVN',l:'RIVN'},{s:'NASDAQ:ADBE',l:'ADBE'},{s:'NASDAQ:CRM',l:'CRM'}],
  cripto:[{s:'BINANCE:BTCUSDT',l:'BTC'},{s:'BINANCE:ETHUSDT',l:'ETH'},{s:'BINANCE:SOLUSDT',l:'SOL'},{s:'BINANCE:BNBUSDT',l:'BNB'},{s:'BINANCE:XRPUSDT',l:'XRP'},{s:'BINANCE:ADAUSDT',l:'ADA'},{s:'BINANCE:DOGEUSDT',l:'DOGE'},{s:'BINANCE:AVAXUSDT',l:'AVAX'},{s:'BINANCE:DOTUSDT',l:'DOT'},{s:'BINANCE:LINKUSDT',l:'LINK'},{s:'BINANCE:MATICUSDT',l:'MATIC'},{s:'BINANCE:NEARUSDT',l:'NEAR'},{s:'BINANCE:APTUSDT',l:'APT'},{s:'BINANCE:ARBUSDT',l:'ARB'},{s:'BINANCE:INJUSDT',l:'INJ'},{s:'BINANCE:SUIUSDT',l:'SUI'},{s:'BINANCE:PEPEUSDT',l:'PEPE'},{s:'BINANCE:WIFUSDT',l:'WIF'},{s:'BINANCE:BONKUSDT',l:'BONK'}],
  forex:[{s:'FX:EURUSD',l:'EUR/USD'},{s:'FX:GBPUSD',l:'GBP/USD'},{s:'FX:USDJPY',l:'USD/JPY'},{s:'FX:USDCHF',l:'USD/CHF'},{s:'FX:AUDUSD',l:'AUD/USD'},{s:'FX:NZDUSD',l:'NZD/USD'},{s:'FX:USDCAD',l:'USD/CAD'},{s:'FX:EURJPY',l:'EUR/JPY'},{s:'FX:GBPJPY',l:'GBP/JPY'},{s:'FX:USDMXN',l:'USD/MXN'},{s:'FX:USDBRL',l:'USD/BRL'},{s:'FX:USDARS',l:'USD/ARS'},{s:'FX:USDCOP',l:'USD/COP'},{s:'FX:USDCLP',l:'USD/CLP'}],
  etf:[{s:'AMEX:SPY',l:'SPY'},{s:'NASDAQ:QQQ',l:'QQQ'},{s:'AMEX:DIA',l:'DIA'},{s:'AMEX:IWM',l:'IWM'},{s:'AMEX:XLK',l:'XLK'},{s:'AMEX:XLF',l:'XLF'},{s:'AMEX:XLE',l:'XLE'},{s:'AMEX:GLD',l:'GLD'},{s:'NASDAQ:TQQQ',l:'TQQQ'},{s:'AMEX:SOXL',l:'SOXL'},{s:'NASDAQ:ARKK',l:'ARKK'},{s:'NASDAQ:IBIT',l:'IBIT'},{s:'AMEX:VXX',l:'VXX'}],
  materias:[{s:'TVC:GOLD',l:'ORO'},{s:'TVC:SILVER',l:'PLATA'},{s:'NYMEX:CL1!',l:'WTI'},{s:'NYMEX:NG1!',l:'GAS'},{s:'CBOT:ZW1!',l:'TRIGO'},{s:'CBOT:ZC1!',l:'MAÍZ'},{s:'CBOT:ZS1!',l:'SOJA'},{s:'NYMEX:HG1!',l:'COBRE'}],
  latam:[{s:'BYMA:MERVAL',l:'MERVAL'},{s:'BMFBOVESPA:IBOV',l:'IBOVESPA'},{s:'NYSE:EWZ',l:'ETF BR'},{s:'NYSE:EWW',l:'ETF MX'},{s:'BCBA:GGAL',l:'GALICIA'},{s:'BCBA:YPF',l:'YPF ARG'},{s:'NYSE:YPF',l:'YPF NYSE'},{s:'BCBA:PAMP',l:'PAMPA'},{s:'MX:IPC',l:'IPC MX'}],
};
let curSym='NASDAQ:NVDA', tvW=null;
function renderSymTabs(cat){
  document.getElementById('sym-tabs').innerHTML=(CATS[cat]||[]).map(s=>`<div class="st${s.s===curSym?' on':''}" onclick="chSym(this,'${s.s}')">${s.l}</div>`).join('');
}
function setCat(el,cat){
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('on')); el.classList.add('on');
  renderSymTabs(cat);
  const first=CATS[cat][0]; if(first){ curSym=first.s; document.getElementById('sym-cur').textContent=first.l; initChart(first.s); }
}
function chSym(el,sym){
  document.querySelectorAll('.st').forEach(t=>t.classList.remove('on')); el.classList.add('on');
  curSym=sym; document.getElementById('sym-cur').textContent=sym.split(':')[1]; initChart(sym);
}
function searchSym(){
  const v=document.getElementById('sym-search').value.trim().toUpperCase(); if(!v)return;
  const sym=v.includes(':')?v:['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX'].includes(v)?'BINANCE:'+v+'USDT':['EURUSD','GBPUSD','USDJPY','USDMXN','USDBRL','USDARS'].includes(v)?'FX:'+v:'NASDAQ:'+v;
  curSym=sym; document.getElementById('sym-cur').textContent=v; document.getElementById('sym-search').value=''; initChart(sym);
}
function initChart(sym){
  const cont=document.getElementById('tv_chart'); if(!cont)return;
  if(tvW){try{tvW.remove();}catch(e){}} cont.innerHTML='';
  if(typeof TradingView==='undefined')return;
  tvW=new TradingView.widget({width:'100%',height:'100%',symbol:sym||'NASDAQ:NVDA',interval:'D',timezone:'America/Argentina/Buenos_Aires',theme:'dark',style:'1',locale:'es',toolbar_bg:'#0d1117',enable_publishing:false,hide_side_toolbar:false,allow_symbol_change:true,container_id:'tv_chart',studies:['MASimple@tv-basicstudies','RSI@tv-basicstudies','MACD@tv-basicstudies'],show_popup_button:true});
}

// ══════════════════════════════════════════════════
// CONVERSOR DE MONEDAS
// Tasas: ExchangeRate-API (gratis, sin key) + bluelytics para ARS
// Cache de 3 horas en localStorage
// ══════════════════════════════════════════════════
const FX = {
  rates: {},          // todas las tasas vs USD
  arsRates: {},       // blue, oficial, mep, ccl
  lastFetch: 0,
  tipo: 'blue',       // tipo de cambio ARS seleccionado
  history: LS.get('fx-hist', []),
  CACHE_MS: 3 * 60 * 60 * 1000, // 3 horas

  CURRENCIES: {
    USD: { flag:'🇺🇸', name:'Dólar USA',       dec:2 },
    ARS: { flag:'🇦🇷', name:'Peso Argentino',  dec:0 },
    EUR: { flag:'🇪🇺', name:'Euro',            dec:2 },
    BRL: { flag:'🇧🇷', name:'Real Brasileño',  dec:2 },
    MXN: { flag:'🇲🇽', name:'Peso Mexicano',   dec:2 },
    CLP: { flag:'🇨🇱', name:'Peso Chileno',    dec:0 },
    COP: { flag:'🇨🇴', name:'Peso Colombiano', dec:0 },
    UYU: { flag:'🇺🇾', name:'Peso Uruguayo',   dec:2 },
    PEN: { flag:'🇵🇪', name:'Sol Peruano',     dec:2 },
    BTC: { flag:'₿',   name:'Bitcoin',         dec:8 },
    ETH: { flag:'Ξ',   name:'Ethereum',        dec:6 },
  }
};

async function fetchRates(force=false){
  const now = Date.now();
  const cached = LS.get('fx-rates-cache', null);
  const tag = document.getElementById('fx-update-tag');

  // Usar caché si no expiró (3 horas)
  if(!force && cached && (now - cached.ts) < FX.CACHE_MS){
    FX.rates   = cached.rates;
    FX.arsRates = cached.arsRates;
    FX.lastFetch = cached.ts;
    renderFXTable();
    renderARSCards();
    convertFX();
    const mins = Math.round((FX.CACHE_MS - (now - cached.ts)) / 60000);
    if(tag){ tag.className='ctag gr'; tag.textContent='Cache · actualiza en '+mins+'m'; }
    return;
  }

  if(tag){ tag.className='ctag'; tag.textContent='Actualizando...'; }

  try {
    // 1. Tasas internacionales vía exchangerate-api (open, sin key)
    const r1 = await fetch('https://open.er-api.com/v6/latest/USD');
    const d1 = await r1.json();
    FX.rates = d1.rates || {};

    // 2. Tipos de cambio ARS (bluelytics - API pública argentina)
    let arsOk = false;
    try {
      const r2 = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const d2 = await r2.json();
      FX.arsRates = {
        oficial: d2.oficial?.value_sell || FX.rates.ARS || 1000,
        blue:    d2.blue?.value_sell    || (FX.rates.ARS * 1.5) || 1500,
        mep:     d2.oficial_euro?.value_sell || (FX.rates.ARS * 1.4) || 1400,
        ccl:     d2.blue?.value_buy      || (FX.rates.ARS * 1.52) || 1520,
      };
      arsOk = true;
    } catch(e2){
      // fallback con solo el oficial
      FX.arsRates = {
        oficial: FX.rates.ARS || 1000,
        blue:    (FX.rates.ARS || 1000) * 1.48,
        mep:     (FX.rates.ARS || 1000) * 1.38,
        ccl:     (FX.rates.ARS || 1000) * 1.50,
      };
    }

    // BTC y ETH desde CoinGecko (gratis)
    try {
      const r3 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
      const d3 = await r3.json();
      if(d3.bitcoin?.usd)  FX.rates.BTC = 1 / d3.bitcoin.usd;
      if(d3.ethereum?.usd) FX.rates.ETH = 1 / d3.ethereum.usd;
    } catch(e3){}

    FX.lastFetch = now;

    // Guardar caché
    LS.set('fx-rates-cache', { rates: FX.rates, arsRates: FX.arsRates, ts: now });

    renderFXTable();
    renderARSCards();
    convertFX();

    const timeStr = new Date(now).toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
    if(tag){ tag.className='ctag gr'; tag.textContent='✓ '+timeStr+' · próx. 3h'; }

    // Actualizar badge
    const nb = document.getElementById('nb-fx');
    if(nb){ nb.textContent = 'LIVE'; }

  } catch(err){
    if(tag){ tag.className='ctag rd'; tag.textContent='⚠ Sin conexión'; }
    console.warn('FX fetch error:', err);
  }
}

function getARS_USD(){
  // Devuelve cuántos ARS vale 1 USD según el tipo seleccionado
  return FX.arsRates[FX.tipo] || FX.rates.ARS || 1000;
}

function getRateToUSD(cur){
  if(cur === 'USD') return 1;
  if(cur === 'ARS') return 1 / getARS_USD();
  if(cur === 'BTC' || cur === 'ETH') return FX.rates[cur] || 0;
  return 1 / (FX.rates[cur] || 1);
}

function getRateFromUSD(cur){
  if(cur === 'USD') return 1;
  if(cur === 'ARS') return getARS_USD();
  if(cur === 'BTC' || cur === 'ETH') return FX.rates[cur] || 0;
  return FX.rates[cur] || 1;
}

function convertFX(){
  const from   = document.getElementById('fx-from')?.value;
  const to     = document.getElementById('fx-to')?.value;
  const amount = parseFloat(document.getElementById('fx-amount')?.value) || 0;
  if(!from || !to || !Object.keys(FX.rates).length) return;

  const inUSD  = amount * getRateToUSD(from);
  const result = inUSD * getRateFromUSD(to);

  const toCur  = FX.CURRENCIES[to]  || { flag:'', dec:2 };
  const fromCur= FX.CURRENCIES[from]|| { flag:'', dec:2 };

  const fmtResult = fmtNum(result, toCur.dec);
  const rate1     = getRateFromUSD(to) / getRateToUSD(from) * 1;

  const resEl  = document.getElementById('fx-result');
  const lblEl  = document.getElementById('fx-rate-label');
  const frmEl  = document.getElementById('fx-formula');
  if(resEl) resEl.textContent  = toCur.flag + ' ' + fmtResult + ' ' + to;
  if(frmEl) frmEl.textContent  = fmtNum(amount, fromCur.dec) + ' ' + from + '  →  ' + to;
  if(lblEl) lblEl.textContent  = '1 ' + from + ' = ' + fmtNum(rate1, toCur.dec) + ' ' + to + (from==='ARS'||to==='ARS' ? '  ·  tipo: '+FX.tipo : '');

  // Guardar historial (solo si el resultado es válido)
  if(amount > 0 && result > 0){
    const entry = {
      id: Date.now(),
      from, to, amount, result,
      tipo: (from==='ARS'||to==='ARS') ? FX.tipo : null,
      time: new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})
    };
    // Evitar duplicados exactos seguidos
    const last = FX.history[0];
    if(!last || last.from!==entry.from || last.to!==entry.to || last.amount!==entry.amount){
      FX.history.unshift(entry);
      if(FX.history.length > 20) FX.history = FX.history.slice(0,20);
      LS.set('fx-hist', FX.history);
      renderFXHistory();
    }
  }
}

function fmtNum(n, dec=2){
  if(n === undefined || n === null || isNaN(n)) return '—';
  if(n >= 1000000) return (n/1000000).toFixed(2) + 'M';
  // Para números muy chicos (BTC/ETH rate)
  if(n > 0 && n < 0.0001) return n.toExponential(4);
  return n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function renderARSCards(){
  const ar = FX.arsRates;
  const s = (id, v) => { const el=document.getElementById(id); if(el) el.textContent = '$'+fmtNum(v,0); };
  s('fx-oficial', ar.oficial);
  s('fx-blue',    ar.blue);
  s('fx-mep',     ar.mep);
  s('fx-ccl',     ar.ccl);
}

function renderFXTable(){
  const el = document.getElementById('fx-table');
  if(!el) return;
  const currencies = Object.keys(FX.CURRENCIES);
  const arsUSD = getARS_USD();

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:7px 14px;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--text3);border-bottom:1px solid var(--border)">
      <div>Moneda</div><div style="text-align:right">1 USD =</div><div style="text-align:right">1 ARS =</div><div style="text-align:right">1 unidad = USD</div>
    </div>
    `+currencies.map(cur => {
      const info = FX.CURRENCIES[cur];
      let rateFromUSD, rateFromARS, rateToUSD;
      if(cur === 'USD'){
        rateFromUSD = 1; rateFromARS = 1/arsUSD; rateToUSD = 1;
      } else if(cur === 'ARS'){
        rateFromUSD = arsUSD; rateFromARS = 1; rateToUSD = 1/arsUSD;
      } else if(cur === 'BTC' || cur === 'ETH'){
        rateToUSD   = 1 / (FX.rates[cur] || 1);
        rateFromUSD = FX.rates[cur] || 0;
        rateFromARS = rateFromUSD / arsUSD;
      } else {
        rateFromUSD = FX.rates[cur] || 0;
        rateToUSD   = rateFromUSD > 0 ? 1/rateFromUSD : 0;
        rateFromARS = rateFromUSD / arsUSD;
      }
      const isARS = cur === 'ARS';
      return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;padding:9px 14px;border-bottom:1px solid var(--border);font-size:11px;cursor:pointer;transition:background .15s"
               onmouseenter="this.style.background='rgba(255,255,255,.02)'" onmouseleave="this.style.background=''"
               onclick="document.getElementById('fx-to').value='${cur}';convertFX()">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:14px">${info.flag}</span>
          <div>
            <div style="font-weight:700;color:var(--text)">${cur}</div>
            <div style="font-size:9px;color:var(--text3)">${info.name}</div>
          </div>
        </div>
        <div style="text-align:right;color:${isARS?'var(--green)':'var(--text2)'};font-weight:${isARS?'700':'400'}">${fmtNum(rateFromUSD, info.dec)}</div>
        <div style="text-align:right;color:var(--text2);font-size:10px">${fmtNum(rateFromARS, info.dec)}</div>
        <div style="text-align:right;color:var(--text2);font-size:10px">${rateToUSD>0?'$'+fmtNum(rateToUSD,2):'—'}</div>
      </div>`;
    }).join('');
}

function renderFXHistory(){
  const el = document.getElementById('fx-history');
  const cnt = document.getElementById('fx-hist-count');
  if(!el) return;
  if(cnt) cnt.textContent = FX.history.length;
  if(!FX.history.length){
    el.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text3);font-size:11px">Las conversiones que hagás aparecen acá.</div>';
    return;
  }
  const fromCur = (c) => FX.CURRENCIES[c] || { flag:'', dec:2 };
  el.innerHTML = FX.history.map(h => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid var(--border);font-size:11px;cursor:pointer"
         onclick="document.getElementById('fx-amount').value='${h.amount}';document.getElementById('fx-from').value='${h.from}';document.getElementById('fx-to').value='${h.to}';convertFX()">
      <span style="font-size:13px">${fromCur(h.from).flag}</span>
      <span style="color:var(--text2)">${fmtNum(h.amount, fromCur(h.from).dec)} ${h.from}</span>
      <span style="color:var(--text3)">→</span>
      <span style="font-size:13px">${fromCur(h.to).flag}</span>
      <span style="color:var(--blue);font-weight:700">${fmtNum(h.result, fromCur(h.to).dec)} ${h.to}</span>
      ${h.tipo ? `<span style="font-size:9px;color:var(--text3);margin-left:auto">${h.tipo}</span>` : ''}
      <span style="font-size:9px;color:var(--text3);${h.tipo?'':'margin-left:auto'}">${h.time}</span>
    </div>`).join('');
}

function setTipo(el, tipo){
  FX.tipo = tipo;
  document.querySelectorAll('.fx-tipo').forEach(b=>{
    b.classList.remove('on');
    b.style.color=''; b.style.borderColor=''; b.style.background='';
  });
  el.classList.add('on');
  el.style.color='var(--blue)'; el.style.borderColor='rgba(88,166,255,.4)'; el.style.background='var(--glow)';
  renderFXTable();
  renderARSCards();
  convertFX();
}

function swapFX(){
  const from = document.getElementById('fx-from');
  const to   = document.getElementById('fx-to');
  const tmp  = from.value;
  from.value = to.value;
  to.value   = tmp;
  convertFX();
}

function setAmt(v){
  // Pone el monto en USD y cambia "desde" a USD
  document.getElementById('fx-amount').value = v;
  document.getElementById('fx-from').value = 'USD';
  convertFX();
}

// Auto-actualizar tasas cada 3 horas si la página está abierta
setInterval(()=>{
  if(document.getElementById('p-conversor').classList.contains('on')){
    fetchRates(true);
  }
}, FX.CACHE_MS);

// Render historial al iniciar
renderFXHistory();

// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
// RADAR DE NOTICIAS — IMPACTO EN MERCADOS
// ══════════════════════════════════════════════════
const RADAR = {
  items: [],
  autoTimer: null,
  autoHours: 2,
  running: false,
};

function initRadar(){
  renderRadarFeed();
  renderRadarAssets();
  // auto-refresh
  if(RADAR.autoHours > 0 && !RADAR.autoTimer){
    RADAR.autoTimer = setInterval(()=>{
      if(document.getElementById('p-radar').classList.contains('on')) runRadar();
    }, RADAR.autoHours * 3600000);
  }
}

function setRadarAuto(el, h){
  RADAR.autoHours = h;
  document.querySelectorAll('.rd-auto').forEach(b=>{ b.classList.remove('on'); b.style.color=''; });
  el.classList.add('on'); el.style.color='var(--blue)';
  clearInterval(RADAR.autoTimer); RADAR.autoTimer = null;
  if(h > 0){
    RADAR.autoTimer = setInterval(()=>{
      if(document.getElementById('p-radar').classList.contains('on')) runRadar();
    }, h * 3600000);
  }
}

async function runRadar(){
  if(RADAR.running) return;
  RADAR.running = true;

  const dot = document.getElementById('radar-dot');
  const btn = document.getElementById('radar-btn');
  if(dot){ dot.style.background='var(--yellow)'; dot.style.boxShadow='0 0 6px rgba(227,179,65,.6)'; }
  if(btn){ btn.textContent='⏳ Analizando...'; btn.disabled=true; }
  setRadarStatus('🔍 Consultando noticias globales y analizando impacto...');

  // Watchlist del scanner
  const watchlist = AL.watchlist.map(w=>w.sym).join(', ');

  // Filtros activos
  const focos = [];
  if(document.getElementById('rd-geo')?.checked)    focos.push('geopolítica y conflictos internacionales');
  if(document.getElementById('rd-macro')?.checked)  focos.push('macroeconomía, Fed, tasas de interés, inflación');
  if(document.getElementById('rd-crypto')?.checked) focos.push('criptomonedas, blockchain, regulación cripto');
  if(document.getElementById('rd-ar')?.checked)     focos.push('Argentina: economía, dólar, MERVAL, política fiscal');
  if(document.getElementById('rd-tech')?.checked)   focos.push('tecnología, inteligencia artificial, semiconductores');
  if(document.getElementById('rd-energy')?.checked) focos.push('energía, petróleo, commodities');

  const prompt = `Sos un analista de mercados financieros experto. La fecha de hoy es ${new Date().toLocaleDateString('es-AR')}. 

TAREA: Analizá las noticias más importantes del mundo ahora mismo y su impacto directo en los mercados financieros.

WATCHLIST DEL USUARIO: ${watchlist}
FOCOS DE ANÁLISIS: ${focos.join(', ')}

CONTEXTO IMPORTANTE que sabés:
- Conflicto Trump vs Iran: tensión geopolítica afecta petróleo y oro
- DOGE-1 satélite SpaceX: lanzamiento pendiente, afecta DOGE
- Mercado cripto en "miedo extremo" (índice 13)
- Bitcoin bajó de $106k, en zona de soporte
- Fed sin cambios en tasas, esperando dato de inflación
- Argentina: proceso de estabilización económica, riesgo país bajando
- Nvidia: earnings fuertes pero acción bajó con el mercado tech
- X (Twitter) anunció trading integrado de acciones y cripto

Respondé ÚNICAMENTE con JSON válido, sin texto extra, sin markdown:
{
  "sentiment": {
    "label": "MIEDO EXTREMO|MIEDO|NEUTRAL|OPTIMISMO|EUFORIA",
    "emoji": "😱|😰|😐|😊|🚀",
    "score": 1-10,
    "description": "resumen del clima global en 1 línea"
  },
  "news": [
    {
      "id": 1,
      "headline": "titular de la noticia (máx 80 chars)",
      "category": "GEOPOLITICA|MACRO|CRIPTO|ARGENTINA|TECH|ENERGIA",
      "type": "RIESGO|OPORTUNIDAD|NEUTRO",
      "impact": "ALTO|MEDIO|BAJO",
      "affected_assets": ["SYM1","SYM2"],
      "direction": "ALCISTA|BAJISTA|MIXTO",
      "summary": "qué pasó y por qué importa (2 líneas)",
      "action": "qué hacer o monitorear con este activo (1 línea)",
      "urgency": "AHORA|HOY|ESTA_SEMANA"
    }
  ],
  "top_watch": ["SYM1","SYM2","SYM3"],
  "avoid": ["SYM_RIESGO1"],
  "key_event": "el evento más importante de hoy para los mercados (1 línea)"
}

Generá entre 6 y 10 noticias relevantes. Priorizá las más recientes y de mayor impacto. Enfocate en eventos REALES que estén pasando ahora.`;

  let result;
  try {
    if(API_KEY){
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:2000,
          messages:[{role:'user',content:prompt}]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||'').join('')||'';
      result = JSON.parse(txt.replace(/```json|```/g,'').trim());
    } else {
      // DEMO MODE
      await new Promise(r=>setTimeout(r,1500));
      result = getRadarDemo();
    }
  } catch(e){
    console.warn('Radar error:', e);
    setRadarStatus('❌ Error al analizar. Intentá de nuevo.');
    if(dot){ dot.style.background='var(--red)'; dot.style.boxShadow='none'; }
    if(btn){ btn.textContent='🌍 Analizar ahora'; btn.disabled=false; }
    RADAR.running = false;
    return;
  }

  RADAR.items = result.news || [];
  const now = new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  
  // KPIs
  const risks = RADAR.items.filter(n=>n.type==='RIESGO').length;
  const opps  = RADAR.items.filter(n=>n.type==='OPORTUNIDAD').length;
  const assets = [...new Set(RADAR.items.flatMap(n=>n.affected_assets||[]))].length;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('rd-risk',risks); s('rd-opp',opps); s('rd-assets',assets);
  s('rd-updated', now);

  // Sentiment
  if(result.sentiment){
    const se = result.sentiment;
    s('rd-sentiment-emoji', se.emoji||'😐');
    s('rd-sentiment-label', se.label||'NEUTRAL');
    s('rd-sentiment-desc', se.description||'');
    const sentColors = {'MIEDO EXTREMO':'var(--red)','MIEDO':'var(--orange)','NEUTRAL':'var(--text2)','OPTIMISMO':'var(--green)','EUFORIA':'var(--blue)'};
    const sentEl = document.getElementById('rd-sentiment-label');
    if(sentEl) sentEl.style.color = sentColors[se.label]||'var(--text2)';
  }

  // Badge
  const nb = document.getElementById('nb-radar');
  if(nb){ nb.textContent = risks > 0 ? risks+'⚠' : opps+'✓'; nb.style.background = risks>2?'rgba(248,81,73,.2)':'rgba(63,185,80,.2)'; }

  renderRadarFeed();
  renderRadarAssets(result.top_watch, result.avoid, result.key_event);
  setRadarStatus('✅ Análisis completado · '+now+(result._demo?' · Modo Demo':''));

  if(dot){ dot.style.background='var(--green)'; dot.style.boxShadow='0 0 6px rgba(63,185,80,.5)'; }
  if(btn){ btn.textContent='🌍 Analizar ahora'; btn.disabled=false; }
  const rt = document.getElementById('radar-time');
  if(rt) rt.textContent = 'Próx: '+new Date(Date.now()+(RADAR.autoHours||2)*3600000).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  RADAR.running = false;
}

function setRadarStatus(txt){ const el=document.getElementById('radar-status'); if(el) el.textContent=txt; }

function filterRadar(){ renderRadarFeed(); }

function renderRadarFeed(){
  const el = document.getElementById('rd-feed'); if(!el) return;
  const filter = document.getElementById('rd-filter')?.value||'all';
  let items = RADAR.items;
  if(filter==='risk')   items = items.filter(n=>n.type==='RIESGO');
  if(filter==='opp')    items = items.filter(n=>n.type==='OPORTUNIDAD');
  if(filter==='crypto') items = items.filter(n=>n.category==='CRIPTO');
  if(filter==='ar')     items = items.filter(n=>n.category==='ARGENTINA');
  if(filter==='usa')    items = items.filter(n=>['TECH','MACRO'].includes(n.category));

  if(!items.length){
    el.innerHTML=`<div style="padding:40px;text-align:center;color:var(--text3)">
      <div style="font-size:28px;margin-bottom:8px">🌍</div>
      <div style="font-size:12px">${RADAR.items.length?'Sin noticias para este filtro':'Presioná Analizar ahora para empezar'}</div>
    </div>`; return;
  }

  const catColors = {GEOPOLITICA:'var(--red)',MACRO:'var(--blue)',CRIPTO:'var(--yellow)',ARGENTINA:'var(--green)',TECH:'var(--purple)',ENERGIA:'var(--orange)'};
  const catIco = {GEOPOLITICA:'⚔️',MACRO:'🏦',CRIPTO:'₿',ARGENTINA:'🇦🇷',TECH:'💻',ENERGIA:'🛢️'};
  const urgColors = {AHORA:'var(--red)',HOY:'var(--yellow)',ESTA_SEMANA:'var(--text3)'};

  el.innerHTML = items.map(n => {
    const cc = catColors[n.category]||'var(--text3)';
    const isRisk = n.type==='RIESGO';
    const isOpp  = n.type==='OPORTUNIDAD';
    const typeColor = isRisk?'var(--red)':isOpp?'var(--green)':'var(--text3)';
    const typeIco   = isRisk?'⚠️':isOpp?'🚀':'ℹ️';
    const impactW   = n.impact==='ALTO'?700:n.impact==='MEDIO'?600:400;
    const assets    = (n.affected_assets||[]).filter(a=>AL.watchlist.find(w=>w.sym===a));

    return `<div style="padding:15px 18px;border-bottom:1px solid var(--border);position:relative">
      <!-- Header -->
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
        <div style="width:34px;height:34px;border-radius:8px;background:${cc}22;border:1px solid ${cc}44;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${catIco[n.category]||'📰'}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
            <span style="font-size:9px;padding:1px 6px;border-radius:3px;background:${cc}22;color:${cc};border:1px solid ${cc}44;font-weight:700">${n.category}</span>
            <span style="font-size:9px;padding:1px 6px;border-radius:3px;background:${typeColor}22;color:${typeColor};border:1px solid ${typeColor}44;font-weight:700">${typeIco} ${n.type}</span>
            <span style="font-size:9px;color:var(--text3);font-weight:${impactW}">Impacto ${n.impact}</span>
            <span style="font-size:9px;color:${urgColors[n.urgency]||'var(--text3)'};margin-left:auto">⏱ ${n.urgency?.replace('_',' ')||''}</span>
          </div>
          <div style="font-size:12px;color:var(--text);font-weight:700;line-height:1.4">${n.headline}</div>
        </div>
      </div>

      <!-- Summary -->
      <div style="font-size:11px;color:var(--text2);line-height:1.6;margin-bottom:8px;padding:7px 10px;background:var(--bg3);border-radius:5px;border-left:3px solid ${cc}">${n.summary||''}</div>

      <!-- Assets affected -->
      ${(n.affected_assets||[]).length?`<div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;flex-wrap:wrap">
        <span style="font-size:9px;color:var(--text3)">Activos:</span>
        ${n.affected_assets.map(a=>{
          const inWL = AL.watchlist.find(w=>w.sym===a);
          return `<span style="font-size:10px;padding:2px 8px;border-radius:4px;font-weight:700;background:${inWL?'rgba(88,166,255,.15)':'var(--bg3)'};color:${inWL?'var(--blue)':'var(--text3)'};border:1px solid ${inWL?'rgba(88,166,255,.3)':'var(--border)'}">${a}${inWL?'⭐':''}</span>`;
        }).join('')}
        <span style="font-size:9px;color:${n.direction==='ALCISTA'?'var(--green)':n.direction==='BAJISTA'?'var(--red)':'var(--yellow)'}">→ ${n.direction||''}</span>
      </div>`:''}

      <!-- Action -->
      <div style="font-size:10px;color:${typeColor};padding:5px 8px;background:${typeColor}08;border-radius:4px;border:1px solid ${typeColor}20">
        💡 ${n.action||'Monitoreá este activo de cerca.'}
      </div>
    </div>`;
  }).join('');
}

function renderRadarAssets(topWatch=[], avoid=[], keyEvent=''){
  const el = document.getElementById('rd-assets-list'); if(!el) return;

  // Merge from news
  const affectedMap = {};
  RADAR.items.forEach(n=>{
    (n.affected_assets||[]).forEach(a=>{
      if(!affectedMap[a]) affectedMap[a]={sym:a,risk:0,opp:0,news:[]};
      if(n.type==='RIESGO') affectedMap[a].risk++;
      if(n.type==='OPORTUNIDAD') affectedMap[a].opp++;
      affectedMap[a].news.push(n.headline?.substring(0,40)+'…');
    });
  });

  const sorted = Object.values(affectedMap).sort((a,b)=>(b.risk+b.opp)-(a.risk+a.opp));

  if(!sorted.length){
    el.innerHTML='<div style="padding:12px;font-size:10px;color:var(--text3)">Corré el análisis primero.</div>';
    return;
  }

  let html = '';
  if(keyEvent){
    html += `<div style="padding:8px 12px;background:rgba(240,136,62,.08);border-bottom:1px solid var(--border)">
      <div style="font-size:9px;color:var(--orange);font-weight:700;margin-bottom:2px">🔑 EVENTO CLAVE HOY</div>
      <div style="font-size:10px;color:var(--text2)">${keyEvent}</div>
    </div>`;
  }

  html += sorted.map(a=>{
    const inWL = AL.watchlist.find(w=>w.sym===a.sym);
    const isTop = topWatch.includes(a.sym);
    const isAvoid = avoid.includes(a.sym);
    const color = isAvoid?'var(--red)':a.risk>a.opp?'var(--orange)':a.opp>0?'var(--green)':'var(--text3)';
    return `<div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:5px">
          <span style="font-size:12px;font-weight:700;color:${inWL?'var(--blue)':'var(--text)'}">${a.sym}</span>
          ${isTop?'<span style="font-size:8px;padding:1px 4px;background:rgba(63,185,80,.15);color:var(--green);border-radius:3px">TOP</span>':''}
          ${isAvoid?'<span style="font-size:8px;padding:1px 4px;background:rgba(248,81,73,.15);color:var(--red);border-radius:3px">CUIDADO</span>':''}
          ${inWL?'<span style="font-size:8px;color:var(--text3)">⭐ WL</span>':''}
        </div>
        <div style="font-size:9px;color:var(--text3);margin-top:1px">${a.risk} riesgo · ${a.opp} oport.</div>
      </div>
      <div style="font-size:18px">${isAvoid?'🔴':a.opp>a.risk?'🟢':a.risk>0?'🟡':'⚪'}</div>
    </div>`;
  }).join('');

  el.innerHTML = html;
}

// DEMO para modo sin API key
function getRadarDemo(){
  return {
    _demo: true,
    sentiment: { label:'MIEDO', emoji:'😰', score:3, description:'Tensión geopolítica Trump-Iran domina el mercado. Inversores en modo defensivo.' },
    key_event: 'Trump endurece sanciones contra Irán — petróleo y oro en zona de máximos',
    top_watch: ['GLD','XAUUSD','BTC','NVDA','PAMP'],
    avoid: ['YPF','TSLA'],
    news: [
      { id:1, headline:'Trump impone nuevas sanciones a Irán — petróleo en tensión', category:'GEOPOLITICA', type:'RIESGO', impact:'ALTO', affected_assets:['XBRUSD','GLD','XAUUSD','YPF'], direction:'ALCISTA', summary:'La Casa Blanca anunció sanciones adicionales al programa nuclear iraní. Los mercados energéticos reaccionan con volatilidad inmediata. El Brent sube 2.3% en la apertura.', action:'Monitorear XBRUSD y GLD de cerca. El oro suele ser refugio en estos escenarios.', urgency:'AHORA' },
      { id:2, headline:'DOGE-1: SpaceX confirma ventana de lanzamiento próxima', category:'CRIPTO', type:'OPORTUNIDAD', impact:'ALTO', affected_assets:['DOGE','BTC'], direction:'ALCISTA', summary:'Documentos de la FCC y declaraciones del equipo de SpaceX sugieren que el satélite DOGE-1 está en fase final de preparación. La comunidad cripto responde con volumen inusual.', action:'DOGE en zona de acumulación. El evento del lanzamiento podría ser un catalizador significativo.', urgency:'ESTA_SEMANA' },
      { id:3, headline:'Fed mantiene tasas — próximo dato de inflación es clave', category:'MACRO', type:'NEUTRO', impact:'ALTO', affected_assets:['SPY','QQQ','GLD','BTC'], direction:'MIXTO', summary:'La Fed no modificó tasas pero el mercado espera el próximo CPI. Un dato alto de inflación podría retrasar los recortes y presionar a las acciones growth.', action:'Reducir exposición a QQQ si el CPI supera expectativas. Esperar datos antes de entrar.', urgency:'ESTA_SEMANA' },
      { id:4, headline:'NVDA: institucionales siguen comprando en la caída', category:'TECH', type:'OPORTUNIDAD', impact:'MEDIO', affected_assets:['NVDA','QQQ'], direction:'ALCISTA', summary:'A pesar de la baja del mercado tech, los datos de opciones muestran compra institucional masiva en puts cubiertos sobre NVDA. El soporte en $100 se mantiene firme.', action:'NVDA en soporte histórico clave. Zona de entrada con stop en $97 y target en $130.', urgency:'HOY' },
      { id:5, headline:'Argentina: riesgo país en mínimos de 5 años', category:'ARGENTINA', type:'OPORTUNIDAD', impact:'ALTO', affected_assets:['AL30','GGAL','PAMP','YPF'], direction:'ALCISTA', summary:'El riesgo país argentino perforó los 700 puntos por primera vez desde 2019. Los bonos soberanos lideran las subas en mercados emergentes de la región.', action:'AL30 y GGAL con momentum positivo. Pampa Energía se beneficia adicionalmente por el contexto energético global.', urgency:'HOY' },
      { id:6, headline:'Bitcoin en zona de soporte crítico — Fear & Greed en 13', category:'CRIPTO', type:'OPORTUNIDAD', impact:'ALTO', affected_assets:['BTC','ETH','SOL'], direction:'ALCISTA', summary:'Históricamente, lecturas de Fear & Greed por debajo de 15 han marcado pisos de mercado en los últimos 3 ciclos. El volumen de compra on-chain aumentó 40% esta semana.', action:'BTC acumulando en zona $80k-82k. Considerar posición pequeña con stop en $76k.', urgency:'HOY' },
      { id:7, headline:'X anuncia trading integrado de acciones y cripto', category:'TECH', type:'OPORTUNIDAD', impact:'ALTO', affected_assets:['TSLA','DOGE','BTC'], direction:'ALCISTA', summary:'X (Twitter) lanzará Smart Cashtags permitiendo operar directamente desde la app. Cada mención de un ticker en la plataforma se convierte en un botón de compra. Se espera efecto amplificador masivo.', action:'Cualquier activo mencionado por Musk en X podría tener movimientos exponenciales. Monitorear DOGE especialmente.', urgency:'ESTA_SEMANA' },
      { id:8, headline:'Cobre (FCX) cae por datos débiles de manufactura China', category:'MACRO', type:'RIESGO', impact:'MEDIO', affected_assets:['FCX'], direction:'BAJISTA', summary:'Los PMI de manufactura chinos decepcionaron nuevamente. El cobre es el indicador más sensible a la actividad industrial global y FCX correlaciona directamente.', action:'FCX bajo presión. Esperar confirmación de rebote antes de entrar. Soporte en $38.', urgency:'HOY' },
    ]
  };
}

// Compartir a WhatsApp
function shareRadarWA(){
  if(!RADAR.items.length){ alert('Corré el análisis primero.'); return; }
  const top = RADAR.items.filter(n=>n.impact==='ALTO').slice(0,4);
  let msg = '🌍 *TradeDIOS — Radar de Noticias*\n';
  msg += new Date().toLocaleDateString('es-AR')+'\n\n';
  top.forEach(n=>{
    const ico = n.type==='RIESGO'?'⚠️':n.type==='OPORTUNIDAD'?'🚀':'ℹ️';
    msg += ico+' *'+n.headline+'*\n';
    msg += '_'+(n.summary.split('.')[0])+'._\n';
    msg += '→ '+(n.affected_assets||[]).join(', ')+' — '+n.direction+'\n\n';
  });
  msg += '_TradeDIOS · No es asesoramiento financiero._';
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}


// ALERTAS IA — SCANNER DE PATRONES
// ══════════════════════════════════════════════════
const AL = {
  running: false,
  timer: null,
  intervalMin: 15,
  alerts: LS.get('al-alerts', []),
  watchlist: LS.get('al-watchlist', [
    // CRIPTO
    {sym:'BTC',  type:'crypto',    market:'Cripto',          note:'El rey. Referencia del mercado total.'},
    {sym:'ETH',  type:'crypto',    market:'Cripto',          note:'Plataforma DeFi. Segunda por capitalización.'},
    {sym:'DOGE', type:'crypto',    market:'Cripto',          note:'Musk effect + satélite DOGE-1 pendiente.'},
    {sym:'SOL',  type:'crypto',    market:'Cripto',          note:'Rival de ETH. Alta velocidad y bajo costo.'},
    {sym:'GORK', type:'crypto',    market:'Cripto',          note:'Mencionado por Musk ayer. +520% en 24hs.'},
    // ACCIONES USA
    {sym:'NVDA', type:'stock',     market:'Acciones USA',    note:'IA y semiconductores. Tendencia dominante 2025.'},
    {sym:'TSLA', type:'stock',     market:'Acciones USA',    note:'Musk directo. Muy reactivo a sus tweets.'},
    {sym:'FCX',  type:'stock',     market:'Acciones USA',    note:'Freeport-McMoRan. Cobre = pulso economía global.'},
    {sym:'AAPL', type:'stock',     market:'Acciones USA',    note:'Defensivo de alto valor. Estabilidad + cash.'},
    {sym:'META', type:'stock',     market:'Acciones USA',    note:'IA + redes sociales. Crecimiento acelerado.'},
    {sym:'AMZN', type:'stock',     market:'Acciones USA',    note:'AWS + cloud + e-commerce. Sólido y creciente.'},
    // ETFs
    {sym:'SPY',  type:'etf',       market:'ETFs USA',        note:'S&P 500. Termómetro del mercado americano.'},
    {sym:'QQQ',  type:'etf',       market:'ETFs USA',        note:'Nasdaq 100. Tecnológicas puras.'},
    {sym:'GLD',  type:'etf',       market:'Commodities',     note:'Oro. Refugio en momentos de incertidumbre.'},
    // ARGENTINA
    {sym:'AL30', type:'bond',      market:'Argentina',       note:'Bono soberano. Referencia del riesgo país AR.'},
    {sym:'PAMP', type:'stock',     market:'Argentina',       note:'Pampa Energía. Líder energético del MERVAL.'},
    {sym:'GGAL', type:'stock',     market:'Argentina',       note:'Galicia. Banco más importante del MERVAL.'},
    {sym:'YPF',  type:'stock',     market:'Argentina',       note:'Petróleo estatal. Alta volatilidad política.'},
    // COMMODITIES
    {sym:'XAUUSD', type:'forex',   market:'Commodities',     note:'Oro spot. Inflación y dólar global.'},
    {sym:'XBRUSD', type:'forex',   market:'Commodities',     note:'Brent crude. Energía y geopolítica.'},
  ]),
  scanning: 0,   // índice del símbolo que se está escaneando
  bullCount: 0,
  bearCount: 0,
  scannedTotal: 0,
  confirmed: 0,
  total: 0,
};

// Guardado de key del scanner
function saveAlKey(){
  const k = document.getElementById('al-key').value.trim();
  API_KEY = k; LS.set('key', k);
  alert(k ? 'API Key guardada ✅\nEl scanner usará análisis en tiempo real.' : 'Key borrada. El scanner usará modo demo.');
}

// Watchlist
function addToWatchlist(){
  const inp = document.getElementById('al-add-sym');
  const raw = inp.value.trim().toUpperCase();
  if(!raw) return;
  const syms = raw.split(',').map(s=>s.trim()).filter(Boolean);
  syms.forEach(sym => {
    if(AL.watchlist.find(w=>w.sym===sym)) return;
    const isCrypto = ['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX','DOT','LINK','MATIC','NEAR','APT','ARB','INJ','SUI','PEPE','WIF'].includes(sym);
    const isForex  = sym.includes('/') || sym.length===6;
    const type = isCrypto?'crypto':isForex?'forex':'stock';
    const market = isCrypto?'Cripto':isForex?'Forex':'Acciones';
    AL.watchlist.unshift({sym, type, market});
  });
  LS.set('al-watchlist', AL.watchlist);
  inp.value = '';
  renderWatchlist();
}

function removeFromWatchlist(sym){
  AL.watchlist = AL.watchlist.filter(w=>w.sym!==sym);
  LS.set('al-watchlist', AL.watchlist);
  renderWatchlist();
}

function renderWatchlist(){
  const el = document.getElementById('al-watchlist');
  if(!el) return;
  const typeColor = {crypto:'var(--yellow)',forex:'var(--purple)',etf:'var(--blue)',bond:'var(--orange)',commodity:'var(--orange)',stock:'var(--green)'};
  const typeIco   = {crypto:'₿',forex:'💱',etf:'📦',bond:'📄',commodity:'🛢️',stock:'📈'};
  el.innerHTML = AL.watchlist.map(w=>`
    <div style="padding:6px 4px;border-bottom:1px solid var(--border);cursor:default">
      <div style="display:flex;align-items:center;gap:7px">
        <span style="font-size:11px;width:16px;text-align:center">${typeIco[w.type]||'📊'}</span>
        <span style="flex:1;font-size:12px;color:var(--text);font-weight:700">${w.sym}</span>
        <span style="font-size:8px;padding:1px 6px;border-radius:3px;background:${typeColor[w.type]||'var(--green)'};background:${(typeColor[w.type]||'var(--green)')}22;color:${typeColor[w.type]||'var(--green)'};border:1px solid ${typeColor[w.type]||'var(--green)'}44">${w.market}</span>
        <button onclick="removeFromWatchlist('${w.sym}')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:0 3px" title="Quitar">✕</button>
      </div>
      ${w.note?`<div style="font-size:9px;color:var(--text3);margin-top:2px;padding-left:23px;line-height:1.4">${w.note}</div>`:''}
    </div>`).join('');
}

// Intervalo
function setInterval2(el, min){
  AL.intervalMin = min;
  document.querySelectorAll('.al-ivl').forEach(b=>{
    b.classList.remove('on');
    b.style.cssText='font-size:10px;padding:3px 8px';
  });
  el.classList.add('on');
  el.style.color='var(--blue)'; el.style.borderColor='rgba(88,166,255,.4)'; el.style.background='var(--glow)';
  if(AL.running){ stopScanner(); startScanner(); }
}

// Toggle scanner
function toggleScanner(){
  if(AL.running) stopScanner(); else startScanner();
}

function startScanner(){
  if(!AL.watchlist.length){ alert('Agregá al menos un activo al watchlist primero.'); return; }
  AL.running = true;
  const btn = document.getElementById('al-start-btn');
  const dot = document.getElementById('al-status-dot');
  if(btn){ btn.textContent='⏹ Detener'; btn.style.background='rgba(248,81,73,.2)'; btn.style.color='var(--red)'; btn.style.border='1px solid rgba(248,81,73,.3)'; }
  if(dot){ dot.style.background='var(--green)'; dot.style.boxShadow='0 0 6px rgba(63,185,80,.6)'; dot.style.animation='blink 1.5s infinite'; }
  setStatus('🟢 Scanner activo — escaneando '+AL.watchlist.length+' activos');
  // escaneo inmediato del primer activo, luego el resto en cadena
  runNextScan();
  // y programa el ciclo completo
  AL.timer = setInterval(()=>{ AL.scanning=0; runNextScan(); }, AL.intervalMin*60*1000);
  scheduleNextLabel();
}

function stopScanner(){
  AL.running = false;
  clearInterval(AL.timer);
  AL.timer = null;
  const btn = document.getElementById('al-start-btn');
  const dot = document.getElementById('al-status-dot');
  if(btn){ btn.textContent='▶ Iniciar Scanner'; btn.style.background=''; btn.style.color=''; btn.style.border=''; }
  if(dot){ dot.style.background='var(--text3)'; dot.style.boxShadow='none'; dot.style.animation='none'; }
  setStatus('⏹ Scanner detenido');
  const nel = document.getElementById('al-next-scan'); if(nel) nel.textContent='—';
}

function scheduleNextLabel(){
  const nel = document.getElementById('al-next-scan');
  if(!nel||!AL.running) return;
  const next = new Date(Date.now() + AL.intervalMin*60*1000);
  nel.textContent = 'Próx. ciclo: '+next.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
}

function setStatus(txt){
  const el = document.getElementById('al-status-txt'); if(el) el.textContent = txt;
}

// Escanea el watchlist uno a uno con delay entre llamadas (no spamear API)
async function runNextScan(){
  if(!AL.running) return;
  const sym = AL.watchlist[AL.scanning];
  if(!sym){ AL.scanning=0; scheduleNextLabel(); return; }
  setStatus('🔍 Escaneando '+sym.sym+' ('+( AL.scanning+1)+'/'+AL.watchlist.length+')...');
  await scanAsset(sym);
  AL.scanning++;
  AL.scannedTotal++;
  const el = document.getElementById('al-scanned'); if(el) el.textContent = AL.scannedTotal;
  if(AL.scanning < AL.watchlist.length && AL.running){
    setTimeout(runNextScan, 3000); // 3s entre llamadas para no sobrecargar API
  } else {
    AL.scanning = 0;
    setStatus('✅ Ciclo completo · '+AL.watchlist.length+' activos analizados · '+new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}));
    scheduleNextLabel();
  }
}

// Análisis de un activo
async function scanAsset(asset){
  const filters = {
    breakout: document.getElementById('f-breakout')?.checked,
    bounce:   document.getElementById('f-bounce')?.checked,
    rsi:      document.getElementById('f-rsi')?.checked,
    macd:     document.getElementById('f-macd')?.checked,
    volume:   document.getElementById('f-volume')?.checked,
    trend:    document.getElementById('f-trend')?.checked,
  };
  const minRR = parseFloat(document.getElementById('al-min-rr')?.value)||2;
  const enabledFilters = Object.entries(filters).filter(([,v])=>v).map(([k])=>k).join(', ');

  // Contexto específico por activo para mejorar calidad del análisis
  const assetContext = {
    BTC:     'Bitcoin, crypto líder. Miedo extremo en el mercado (índice 13). Bajó de $106k. Resistencia en $88k.',
    ETH:     'Ethereum, plataforma DeFi. Cayó de $3600. Soporte clave en $2000. ETFs pendientes de aprobación.',
    DOGE:    'Dogecoin. Catalizador: DOGE-1 satélite SpaceX próximo lanzamiento. Muy sensible a tweets de Musk.',
    SOL:     'Solana, rival de ETH. Alta velocidad, bajo costo. Fuerte adopción institucional reciente.',
    GORK:    'Memecoin mencionada por Musk el 27/02/2026. Subió +520% en 24hs. Altísima volatilidad.',
    NVDA:    'Nvidia, líder en chips IA. Bajó de máximos con el mercado tech. Earnings fuertes. Soporte en $100.',
    TSLA:    'Tesla. Musk con conflictos políticos con DOGE gubernamental. Muy volátil y sensible a noticias.',
    FCX:     'Freeport-McMoRan. Cobre como indicador de economía global. Sensible a China y construcción.',
    AAPL:    'Apple. Defensivo premium. iPhone superciclo esperado con IA. Soporte en $210.',
    META:    'Meta. IA + Realidad Aumentada. Crecimiento de ingresos por publicidad. Máximos históricos.',
    AMZN:    'Amazon. AWS cloud líder. E-commerce dominante. Crecimiento sostenido de márgenes.',
    SPY:     'ETF S&P 500. Refleja el mercado americano total. Afectado por tasas de la Fed.',
    QQQ:     'ETF Nasdaq 100. Tecnológicas puras. Alta correlación con NVDA, AAPL, MSFT.',
    GLD:     'ETF de Oro. En máximos históricos por incertidumbre y dolarización global.',
    AL30:    'Bono soberano argentino 2030. Sensible al riesgo país, reservas del BCRA y política fiscal.',
    PAMP:    'Pampa Energía. Principal generadora eléctrica argentina. Beneficiada por desregulación energética.',
    GGAL:    'Grupo Galicia. Banco líder argentino. Muy sensible al tipo de cambio y política monetaria local.',
    YPF:     'YPF petróleo estatal. Vaca Muerta es el catalizador clave. Alta volatilidad política.',
    XAUUSD:  'Oro spot. En máximos históricos $2900+. Refugio ante inflación y tensiones geopolíticas.',
    XBRUSD:  'Brent crudo. Sensible a OPEP+ y tensiones en Medio Oriente. Referencia energética global.',
  };
  const ctx = assetContext[asset.sym] || 'Activo sin contexto específico. Analizá con criterio técnico general.';

  const prompt = `Sos un sistema experto de detección de patrones para trading. Analizá ${asset.sym} (${asset.market}) ahora mismo.

CONTEXTO DEL ACTIVO: ${ctx}
PATRONES A BUSCAR: ${enabledFilters}
R:R MÍNIMO PARA ALERTAR: 1:${minRR}

Respondé ÚNICAMENTE con este JSON (sin texto extra, sin markdown):
{
  "hasSignal": true/false,
  "direction": "ALCISTA" o "BAJISTA" o "NEUTRAL",
  "pattern": "nombre del patrón detectado",
  "confidence": 1-10,
  "price": "precio aproximado actual",
  "entry": "precio de entrada sugerido",
  "stop": "precio de stop-loss",
  "target1": "primer target",
  "target2": "segundo target",
  "rr": "ratio R:R ej: 1:2.5",
  "summary": "resumen de 2 líneas explicando qué detectaste y por qué es relevante",
  "reasoning": "explicación de 3-4 líneas del razonamiento técnico+fundamental para que el trader aprenda",
  "risk": "riesgo principal a considerar (1 línea)",
  "indicators": {"rsi": "valor aprox", "trend": "alcista/bajista/lateral", "volume": "normal/alto/muy alto"}
}

Si no hay señal clara que justifique alertar (hasSignal: false), igual devolvé el JSON con los demás campos vacíos o null.`;

  let result;
  try {
    if(API_KEY){
      const res = await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:600,
          messages:[{role:'user',content:prompt}]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||'').join('')||'';
      const clean = txt.replace(/```json|```/g,'').trim();
      result = JSON.parse(clean);
    } else {
      // Demo mode — simula detección aleatoria con datos realistas
      await new Promise(r=>setTimeout(r,800));
      result = getDemoAlert(asset.sym);
    }
  } catch(e){
    console.warn('Scan error for', asset.sym, e);
    return;
  }

  if(!result) return;

  // Filtrar por R:R mínimo
  const rrVal = parseFloat((result.rr||'1:0').split(':')[1])||0;
  if(result.hasSignal && rrVal < minRR) result.hasSignal = false;

  // Siempre guardamos el escaneo; solo mostramos prominente si hasSignal
  const alert = {
    id: Date.now()+Math.random(),
    sym: asset.sym,
    market: asset.market,
    time: new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}),
    date: new Date().toLocaleDateString('es-AR'),
    verdict: null,  // null=pendiente, 'yes'=acordamos, 'no'=descartamos
    ...result,
  };

  if(result.hasSignal){
    if(result.direction==='ALCISTA') AL.bullCount++; else if(result.direction==='BAJISTA') AL.bearCount++;
    AL.alerts.unshift(alert);
    if(AL.alerts.length>100) AL.alerts=AL.alerts.slice(0,100);
    LS.set('al-alerts', AL.alerts);
    // Badge
    const pending = AL.alerts.filter(a=>a.hasSignal&&a.verdict===null).length;
    const nb = document.getElementById('nb-alertas'); if(nb) nb.textContent=pending||'';
    updateAlertKPIs();
    renderAlertFeed();
    // Webhook N8N si configurado
    const wh = document.getElementById('al-webhook')?.value.trim();
    if(wh) sendWebhook(wh, alert);
  }
}

// Demo alerts para modo sin API key
function getDemoAlert(sym){
  const patterns = ['Ruptura de resistencia','Rebote en soporte','RSI sobrevendido','MACD crossover alcista','Volumen anómalo 2.4x','Pullback a EMA20','Reversión en extremo','Doble piso','Bandera alcista','Triángulo ascendente'];
  const hasSignal = Math.random() > 0.52;
  const dir = hasSignal ? (Math.random()>0.4?'ALCISTA':'BAJISTA') : 'NEUTRAL';
  const prices = {
    // Cripto
    BTC:82000, ETH:2200, DOGE:0.172, SOL:135, GORK:0.00031,
    // Acciones USA
    NVDA:118, TSLA:290, FCX:42, AAPL:228, META:615, AMZN:215,
    // ETFs
    SPY:590, QQQ:490, GLD:185,
    // Argentina
    AL30:68, PAMP:42, GGAL:38, YPF:28,
    // Commodities
    XAUUSD:2900, XBRUSD:76,
    // Fallbacks
    MSFT:415, GOOGL:195,
  };
  const base = prices[sym] || (Math.random()*200+50);
  const isBull = dir==='ALCISTA';
  const entry = base * (isBull?1.001:0.999);
  const stop  = isBull ? entry*0.975 : entry*1.025;
  const t1    = isBull ? entry*1.03  : entry*0.97;
  const t2    = isBull ? entry*1.055 : entry*0.945;
  const rrVal = Math.abs(t1-entry)/Math.abs(entry-stop);
  return {
    hasSignal,
    direction: dir,
    pattern: hasSignal ? patterns[Math.floor(Math.random()*patterns.length)] : 'Sin señal clara',
    confidence: hasSignal ? Math.floor(Math.random()*3)+6 : Math.floor(Math.random()*4)+2,
    price: '$'+base.toFixed(2),
    entry: hasSignal?'$'+entry.toFixed(2):null,
    stop:  hasSignal?'$'+stop.toFixed(2):null,
    target1: hasSignal?'$'+t1.toFixed(2):null,
    target2: hasSignal?'$'+t2.toFixed(2):null,
    rr: hasSignal?'1:'+rrVal.toFixed(1):null,
    summary: hasSignal
      ? `${sym} muestra ${dir==='ALCISTA'?'momentum alcista':'presión bajista'} con ${patterns[0].toLowerCase()}. Contexto técnico favorable.`
      : `${sym} en consolidación sin señal clara. Mejor esperar confirmación.`,
    reasoning: hasSignal
      ? `El precio ${isBull?'superó':'perdió'} el nivel clave con confirmación de volumen. Los indicadores técnicos están alineados en dirección ${dir.toLowerCase()}. El contexto de mercado general es favorable para el setup. Esta es la lógica que tenés que buscar en el gráfico para validar la entrada.`
      : `No hay alineación clara entre indicadores. El RSI está en zona neutral y el volumen es normal. En estas condiciones es mejor quedarse afuera y esperar un setup más claro.`,
    risk: hasSignal ? 'Verificar si hay noticias de alto impacto en las próximas horas antes de entrar.' : 'N/A',
    indicators: { rsi: Math.floor(Math.random()*60+20)+'', trend: isBull?'alcista':'bajista', volume: ['normal','alto','muy alto'][Math.floor(Math.random()*3)] },
    _demo: true,
  };
}

// N8N Webhook
async function sendWebhook(url, alert){
  try{
    await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        source:'TradeDIOS',
        symbol: alert.sym,
        direction: alert.direction,
        pattern: alert.pattern,
        confidence: alert.confidence,
        entry: alert.entry,
        stop: alert.stop,
        target: alert.target1,
        rr: alert.rr,
        summary: alert.summary,
        reasoning: alert.reasoning,
        time: alert.time,
        date: alert.date,
      })
    });
  }catch(e){ console.warn('Webhook error:', e); }
}

// Veredicto del usuario (acordamos / descartamos)
function setVerdict(id, v){
  const alert = AL.alerts.find(a=>a.id===id); if(!alert) return;
  alert.verdict = v;
  // Precisión
  if(v==='yes'){ AL.confirmed++; } AL.total++;
  LS.set('al-alerts', AL.alerts);
  updateAlertKPIs();
  renderAlertFeed();
  // Actualizar badge
  const pending = AL.alerts.filter(a=>a.hasSignal&&a.verdict===null).length;
  const nb = document.getElementById('nb-alertas'); if(nb) nb.textContent=pending||'0';
  // Si acordamos, preguntar si quiere registrar en el diario
  if(v==='yes'){
    setTimeout(()=>{
      if(confirm(`✅ Acordamos con ${alert.sym}.\n\n¿Querés ir al Diario a registrar la operación ahora?`)){
        go(document.querySelector('.ni[onclick*=diario]'),'diario');
        // Pre-llenar el diario
        const ta=document.getElementById('ta'); if(ta) ta.value=alert.sym;
        const tsetup=document.getElementById('tsetup'); if(tsetup) tsetup.value='Ruptura de resistencia';
      }
    }, 200);
  }
}

function updateAlertKPIs(){
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('al-bull-count', AL.bullCount);
  s('al-bear-count', AL.bearCount);
  s('al-scanned', AL.scannedTotal);
  const acc = AL.total>0 ? Math.round(AL.confirmed/AL.total*100)+'%' : '—';
  s('al-accuracy', acc);
}

function filterAlerts(){
  renderAlertFeed();
}

function clearAlerts(){
  if(!confirm('¿Borrar todas las alertas?')) return;
  AL.alerts=[]; AL.bullCount=0; AL.bearCount=0;
  LS.set('al-alerts', AL.alerts);
  updateAlertKPIs(); renderAlertFeed();
  const nb=document.getElementById('nb-alertas'); if(nb) nb.textContent='0';
}

function renderAlertFeed(){
  const el = document.getElementById('al-feed'); if(!el) return;
  const filter = document.getElementById('al-filter')?.value||'all';
  let alerts = AL.alerts.filter(a=>a.hasSignal);
  if(filter==='bull')    alerts = alerts.filter(a=>a.direction==='ALCISTA');
  if(filter==='bear')    alerts = alerts.filter(a=>a.direction==='BAJISTA');
  if(filter==='pending') alerts = alerts.filter(a=>a.verdict===null);

  if(!alerts.length){
    el.innerHTML=`<div style="padding:48px;text-align:center;color:var(--text3)">
      <div style="font-size:28px;margin-bottom:10px">${AL.running?'🔍':'🔔'}</div>
      <div style="font-size:12px">${AL.running?'Escaneando... las alertas aparecerán acá':'Sin alertas para mostrar'}</div>
    </div>`;
    return;
  }

  el.innerHTML = alerts.map(a => {
    const isBull = a.direction==='ALCISTA';
    const isPending = a.verdict===null;
    const isYes = a.verdict==='yes';
    const isNo  = a.verdict==='no';
    const conf  = a.confidence||0;
    const confColor = conf>=8?'var(--green)':conf>=6?'var(--yellow)':'var(--orange)';
    const confBar = '█'.repeat(conf)+'░'.repeat(10-conf);

    return `<div style="padding:16px 18px;border-bottom:1px solid var(--border);position:relative;${isNo?'opacity:.5':''}">
      <!-- Header -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:36px;height:36px;border-radius:8px;background:${isBull?'rgba(63,185,80,.15)':'rgba(248,81,73,.15)'};border:1px solid ${isBull?'rgba(63,185,80,.3)':'rgba(248,81,73,.3)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${isBull?'📈':'📉'}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:15px;font-weight:800;font-family:Syne,sans-serif;color:var(--text)">${a.sym}</span>
            <span style="font-size:10px;padding:2px 8px;border-radius:3px;font-weight:700;background:${isBull?'rgba(63,185,80,.15)':'rgba(248,81,73,.15)'};color:${isBull?'var(--green)':'var(--red)'};border:1px solid ${isBull?'rgba(63,185,80,.3)':'rgba(248,81,73,.3)'}">${a.direction}</span>
            <span style="font-size:9px;color:var(--text3)">${a.market}</span>
            ${a._demo?`<span style="font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(188,140,255,.1);color:var(--purple);border:1px solid rgba(188,140,255,.2)">DEMO</span>`:''}
          </div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px">${a.pattern} · ${a.time} ${a.date}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:9px;color:var(--text3)">Confianza</div>
          <div style="font-size:11px;color:${confColor};font-family:monospace">${confBar}</div>
          <div style="font-size:10px;color:${confColor};font-weight:700">${conf}/10</div>
        </div>
      </div>

      <!-- Summary -->
      <div style="font-size:11px;color:var(--text2);line-height:1.6;margin-bottom:10px;padding:8px 10px;background:var(--bg3);border-radius:5px;border-left:3px solid ${isBull?'var(--green)':'var(--red)'}">${a.summary||''}</div>

      <!-- Niveles -->
      ${a.entry?`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:7px;text-align:center">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">ENTRADA</div>
          <div style="font-size:12px;font-weight:700;color:var(--blue)">${a.entry}</div>
        </div>
        <div style="background:rgba(248,81,73,.05);border:1px solid rgba(248,81,73,.2);border-radius:5px;padding:7px;text-align:center">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">STOP</div>
          <div style="font-size:12px;font-weight:700;color:var(--red)">${a.stop}</div>
        </div>
        <div style="background:rgba(63,185,80,.05);border:1px solid rgba(63,185,80,.2);border-radius:5px;padding:7px;text-align:center">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">TARGET 1</div>
          <div style="font-size:12px;font-weight:700;color:var(--green)">${a.target1}</div>
        </div>
        <div style="background:rgba(63,185,80,.08);border:1px solid rgba(63,185,80,.25);border-radius:5px;padding:7px;text-align:center">
          <div style="font-size:9px;color:var(--text3);margin-bottom:2px">TARGET 2</div>
          <div style="font-size:12px;font-weight:700;color:var(--green)">${a.target2}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:11px">
        <span style="color:var(--text3)">R:R</span><span style="color:var(--yellow);font-weight:700">${a.rr}</span>
        <span style="color:var(--text3);margin-left:8px">RSI</span><span style="color:var(--text2)">${a.indicators?.rsi||'—'}</span>
        <span style="color:var(--text3)">Tendencia</span><span style="color:var(--text2)">${a.indicators?.trend||'—'}</span>
        <span style="color:var(--text3)">Volumen</span><span style="color:var(--text2)">${a.indicators?.volume||'—'}</span>
      </div>`:''}

      <!-- Razonamiento colapsable -->
      <details style="margin-bottom:10px">
        <summary style="font-size:10px;color:var(--blue);cursor:pointer;padding:4px 0">🎓 Ver razonamiento completo (aprendizaje)</summary>
        <div style="font-size:11px;color:var(--text2);line-height:1.7;padding:8px 10px;margin-top:6px;background:rgba(88,166,255,.04);border-radius:5px;border:1px solid rgba(88,166,255,.1)">${a.reasoning||''}</div>
      </details>

      ${a.risk?`<div style="font-size:10px;color:var(--orange);padding:5px 8px;background:rgba(240,136,62,.06);border-radius:4px;border:1px solid rgba(240,136,62,.15);margin-bottom:10px">⚠️ ${a.risk}</div>`:''}

      <!-- Botones de veredicto -->
      ${isPending ? `
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-size:10px;color:var(--text3);flex:1">¿Operamos?</span>
        <button onclick="setVerdict(${a.id},'yes')" style="padding:7px 18px;border-radius:5px;border:1px solid rgba(63,185,80,.4);background:rgba(63,185,80,.1);color:var(--green);font-family:JetBrains Mono,monospace;font-size:11px;font-weight:700;cursor:pointer">✅ Sí, operamos</button>
        <button onclick="setVerdict(${a.id},'no')"  style="padding:7px 18px;border-radius:5px;border:1px solid rgba(248,81,73,.3);background:rgba(248,81,73,.08);color:var(--red);font-family:JetBrains Mono,monospace;font-size:11px;cursor:pointer">❌ No, descarto</button>
        <button onclick="go(document.querySelector('.ni[onclick*=charts]'),'charts');curSym='NASDAQ:${a.sym}';setTimeout(()=>initChart('NASDAQ:${a.sym}'),200)" style="padding:7px 12px;border-radius:5px;border:1px solid var(--border);background:var(--bg3);color:var(--text2);font-family:JetBrains Mono,monospace;font-size:11px;cursor:pointer">📊 Ver gráfico</button>
      </div>` :
      `<div style="font-size:11px;padding:6px 12px;border-radius:5px;display:inline-flex;align-items:center;gap:6px;background:${isYes?'rgba(63,185,80,.1)':'rgba(248,81,73,.08)'};border:1px solid ${isYes?'rgba(63,185,80,.3)':'rgba(248,81,73,.2)'};color:${isYes?'var(--green)':'var(--red)'}">
        ${isYes?'✅ Acordamos — operación tomada':'❌ Descartada'}
      </div>`}
    </div>`;
  }).join('');
}

// Compartir alertas a WhatsApp
function shareAlertsWA(){
  const pending = AL.alerts.filter(a=>a.hasSignal&&a.verdict===null);
  if(!pending.length){ alert('No hay alertas pendientes para compartir.'); return; }
  let msg = '🔔 *TradeDIOS — Alertas del Scanner IA*\n\n';
  pending.slice(0,5).forEach(a=>{
    msg += `${a.direction==='ALCISTA'?'📈':'📉'} *${a.sym}* — ${a.direction}\n`;
    msg += `📊 ${a.pattern}\n`;
    if(a.entry) msg += `Entrada: ${a.entry} | Stop: ${a.stop} | T1: ${a.target1} | R:R: ${a.rr}\n`;
    msg += `_${a.summary}_\n\n`;
  });
  msg += '_TradeDIOS v3.1 · Análisis educativo, no asesoramiento financiero._';
  window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  renderSymTabs('tech');
  setTimeout(()=>{ if(document.getElementById('p-charts').classList.contains('on')) initChart(curSym); },400);
});
if(USERNAME){ initUI(); publishMyStats(); }
window.addEventListener('resize',()=>{ if(MY_TRADES.length) updateStats(); });
// Auto refresh community every 60s
setInterval(()=>{
  if(document.getElementById('p-leaderboard').classList.contains('on')) refreshLeaderboard();
  if(document.getElementById('p-feed').classList.contains('on')) refreshFeed();
  if(document.getElementById('p-dashboard').classList.contains('on')) refreshDashboardCommunity();
},60000);
</script>

  <button class="pwa-reload" onclick="location.reload()">Actualizar</button>
  <button class="pwa-later" onclick="document.getElementById('pwa-update').classList.add('hide')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0 2px">✕</button>
</div>



<!-- ═══ PWA STANDALONE — MANIFEST + SW EMBEBIDOS ═══ -->
  (function(){
  // ── 1. MANIFEST via Blob ──────────────────────────
  const manifestData = '{\n  "name": "TradeDIOS — Dashboard Pro",\n  "short_name": "TradeDIOS",\n  "description": "Dashboard profesional de trading con IA, alertas en tiempo real y análisis de patrones.",\n  "start_url": "/Trader.OS/",\n  "display": "standalone",\n  "orientation": "any",\n  "background_color": "#090C10",\n  "theme_color": "#090C10",\n  "lang": "es",\n  "icons": [\n    {"src": "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'192\' height=\'192\' viewBox=\'0 0 192 192\'%3E%3Crect width=\'192\' height=\'192\' rx=\'30\' fill=\'%23090C10\'/%3E%3Crect width=\'192\' height=\'3\' fill=\'%2358A6FF\'/%3E%3Ctext x=\'96\' y=\'118\' font-family=\'Arial Black,Arial\' font-weight=\'900\' font-size=\'90\' fill=\'%23E6EDF3\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3ET%3C/text%3E%3Ctext x=\'96\' y=\'162\' font-family=\'Arial Black,Arial\' font-weight=\'700\' font-size=\'28\' fill=\'%2358A6FF\' text-anchor=\'middle\'%3EOS%3C/text%3E%3Ccircle cx=\'152\' cy=\'46\' r=\'7\' fill=\'%233FB950\'/%3E%3C/svg%3E", "sizes": "192x192", "type": "image/svg+xml", "purpose": "any maskable"},\n    {"src": "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'512\' height=\'512\' viewBox=\'0 0 512 512\'%3E%3Crect width=\'512\' height=\'512\' rx=\'80\' fill=\'%23090C10\'/%3E%3Crect width=\'512\' height=\'6\' fill=\'%2358A6FF\'/%3E%3Ctext x=\'256\' y=\'310\' font-family=\'Arial Black,Arial\' font-weight=\'900\' font-size=\'240\' fill=\'%23E6EDF3\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3ET%3C/text%3E%3Ctext x=\'256\' y=\'420\' font-family=\'Arial Black,Arial\' font-weight=\'700\' font-size=\'72\' fill=\'%2358A6FF\' text-anchor=\'middle\'%3EOS%3C/text%3E%3Ccircle cx=\'400\' cy=\'130\' r=\'16\' fill=\'%233FB950\'/%3E%3C/svg%3E", "sizes": "512x512", "type": "image/svg+xml", "purpose": "any maskable"}\n  ],\n  "shortcuts": [\n    {"name": "Alertas IA", "short_name": "Alertas", "url": "./?page=alertas"},\n    {"name": "Diario", "short_name": "Diario", "url": "./?page=diario"},\n    {"name": "Leaderboard", "short_name": "Ranking", "url": "./?page=leaderboard"}\n  ]\n}';
  const mBlob = new Blob([manifestData], {type:'application/manifest+json'});
  const mUrl  = URL.createObjectURL(mBlob);
  const mLink = document.createElement('link');
  mLink.rel = 'manifest'; mLink.href = mUrl;
  document.head.appendChild(mLink);

  // ── 2. SERVICE WORKER — inline via blob
  if('serviceWorker' in navigator){
    const swCode = `
const CACHE='tradedios-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{
    const rc=r.clone();
    caches.open(CACHE).then(c=>c.put(e.request,rc));
    return r;
  }).catch(()=>caches.match(e.request)));
});
self.addEventListener('push',e=>{
  if(!e.data)return;
  let d;try{d=e.data.json();}catch(x){d={title:'TradeDIOS',body:e.data.text()};}
  e.waitUntil(self.registration.showNotification(d.title||'TradeDIOS',{body:d.body||'Alerta',icon:'/favicon.ico',tag:'tradedios',requireInteraction:true,vibrate:[200,100,200]}));
});`;
    try{
      const swBlob=new Blob([swCode],{type:'application/javascript'});
      const swUrl=URL.createObjectURL(swBlob);
      navigator.serviceWorker.register(swUrl,{scope:'./'})
        .then(reg=>{
          console.log('[TradeDIOS] SW OK');
          reg.addEventListener('updatefound',()=>{
            const nw=reg.installing;
            nw.addEventListener('statechange',()=>{
              if(nw.state==='installed'&&navigator.serviceWorker.controller)showUpdateToast();
            });
          });
        }).catch(e=>console.warn('[TradeDIOS] SW blob not supported:',e));
      navigator.serviceWorker.addEventListener('message',e=>{
        if(e.data?.type==='NAVIGATE'){
          const nav=document.querySelector(`.ni[onclick*="${e.data.page}"]`);
          if(nav)go(nav,e.data.page);
        }
      });
    }catch(e){console.warn('[TradeDIOS] SW error:',e);}
  }

  // ── 3. INSTALL BANNER ─────────────────────────────
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferredPrompt = e;
    if(!localStorage.getItem('pwa-dismissed'))
      setTimeout(()=>{ const b=document.getElementById('pwa-banner'); if(b) b.style.display='flex'; }, 3000);
  });
  window.installPWA = async function(){
    if(!deferredPrompt){ showIOSInstructions(); return; }
    deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;
    deferredPrompt = null; dismissBanner();
  };
  window.dismissBanner = function(){
    const b=document.getElementById('pwa-banner'); if(b) b.style.display='none';
    localStorage.setItem('pwa-dismissed','1');
  };
  window.showUpdateToast = function(){
    const t=document.getElementById('pwa-update'); if(t) t.style.display='flex';
  };
  function showIOSInstructions(){
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
    alert(isIOS
      ? 'Para instalar en iPhone:\n\n1. Tocá el botón Compartir ( ↑ ) en Safari\n2. "Agregar a pantalla de inicio"\n3. Tocá "Agregar"'
      : 'Para instalar en Android:\n\n1. Menú ⋮ del navegador\n2. "Añadir a pantalla de inicio"\n3. Confirmar'
    );
  }
  window.addEventListener('appinstalled', ()=>{
    dismissBanner();
    const c=document.getElementById('streak-chip');
    if(c){const o=c.textContent;c.textContent='📱 App instalada ✅';setTimeout(()=>c.textContent=o,3000);}
  });

  // ── 4. SHORTCUT NAVIGATION ────────────────────────
  const p = new URLSearchParams(location.search).get('page');
  if(p) window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{
    const nav=document.querySelector(`.ni[onclick*="${p}"]`); if(nav) go(nav,p);
  },800));
})();
</script>

<!-- PWA Install Banner -->
<div id="pwa-banner" style="display:none;position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9998;background:#0d1117;border:1px solid #58a6ff;border-radius:10px;padding:12px 16px;align-items:center;gap:12px;box-shadow:0 4px 24px rgba(0,0,0,.6);min-width:280px;max-width:360px;animation:slideUp .3s ease">
  <span style="font-size:26px;flex-shrink:0">📱</span>
  <div style="flex:1">
    <strong style="font-size:12px;color:#e6edf3;display:block;margin-bottom:2px">Instalá TradeDIOS</strong>
    <span style="font-size:10px;color:#484f58">Agregalo a tu pantalla de inicio</span>
  </div>
  <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button onclick="installPWA()" style="padding:5px 12px;background:#58a6ff;color:#fff;border:none;border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:inherit">Instalar</button>
    <button onclick="dismissBanner()" style="padding:3px 12px;background:none;color:#484f58;border:none;font-size:9px;cursor:pointer;font-family:inherit">Ahora no</button>
  </div>
</div>

<!-- PWA Update Toast -->
<div id="pwa-update" style="display:none;position:fixed;top:56px;right:12px;z-index:9997;background:#0d1117;border:1px solid #3fb950;border-radius:8px;padding:10px 14px;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(0,0,0,.5);font-size:11px;max-width:300px">
  <span style="font-size:18px;flex-shrink:0">🚀</span>
  <div style="flex:1;color:#8b949e"><strong style="color:#3fb950;display:block;margin-bottom:1px">Nueva versión disponible</strong>Hay cambios nuevos en TradeDIOS</div>
  <button onclick="location.reload()" style="padding:4px 10px;background:rgba(63,185,80,.15);color:#3fb950;border:1px solid rgba(63,185,80,.3);border-radius:4px;font-size:9px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">Actualizar</button>
  <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;color:#484f58;cursor:pointer;font-size:16px;padding:0 2px;flex-shrink:0">✕</button>
</div>
// --- FUNCIONES DEL BANNER PWA ---

// 1. Función para cerrar el banner con animación suave
function dismissBanner() {
    const banner = document.getElementById('pwa-banner');
    if (banner) {
        banner.style.transition = "all 0.5s ease";
        banner.style.opacity = "0";
        banner.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }
}

// 2. Función básica para el botón Instalar (evita errores en consola)
function installPWA() {
    console.log("Intentando instalar TradeDIOS...");
    // Aquí podrías añadir la lógica real de instalación más adelante
    alert("Función de instalación activada. ¡Pronto estará disponible!");
}
// --- SISTEMA DE PERSONALIZACIÓN ---

function inicializarUsuario() {
    // 1. Intentamos obtener el nombre guardado
    let nombreUsuario = localStorage.getItem('tradeDios_user');

    // 2. Si no existe, lo pedimos
    if (!nombreUsuario) {
        nombreUsuario = prompt("¡Bienvenido a TradeDIOS! ¿Cuál es tu nombre de Trader?");
        
        // Si el usuario escribió algo, lo guardamos
        if (nombreUsuario) {
            localStorage.setItem('tradeDios_user', nombreUsuario);
        } else {
            nombreUsuario = "Trader Pro"; // Nombre por defecto
        }
    }

// 3. Buscamos el logo para personalizarlo
    const welcomeMsg = document.querySelector('.logo-mark');
    if (welcomeMsg) {
        // Usamos innerHTML para mantener el estilo del <span> que definiste en CSS
        welcomeMsg.innerHTML = `Trade<span>DIOS</span> | ${nombreUsuario}`;
    }
} // Esta es la llave que cierra la función inicializarUsuario

// Ejecutamos esta función cada vez que se cargue el script

}

function installPWA() {
    console.log("Intentando instalar TradeDIOS...");
    alert("Función de instalación activada. ¡Pronto estará disponible!");
}

// --- SISTEMA DE PERSONALIZACIÓN ---

function inicializarUsuario() {
    let nombreUsuario = localStorage.getItem('tradeDios_user');

    if (!nombreUsuario) {
        nombreUsuario = prompt("¡Bienvenido a TradeDIOS! ¿Cuál es tu nombre de Trader?");
        
        if (nombreUsuario) {
            localStorage.setItem('tradeDios_user', nombreUsuario);
        } else {
            nombreUsuario = "Trader Pro";
        }
    }

    const welcomeMsg = document.querySelector('.nav-brand span') || document.querySelector('h2');
    if (welcomeMsg) {
        welcomeMsg.innerText = `TradeDIOS | ${nombreUsuario}`;
    }
}
function dismissBanner() {
    const banner = document.getElementById('pwa-banner');
    if (banner) {
        banner.style.transition = "all 0.5s ease";
        banner.style.opacity = "0";
        banner.style.transform = "translateY(20px)";
        
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }
inicializarUsuario();
