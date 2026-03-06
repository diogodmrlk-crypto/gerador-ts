
/* ============================================================
   DISCORD WEBHOOK
   ============================================================ */
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1446276085397590018/Uwj0sKu8SKD4ZqVtnkdz4nhfEd_DlKE_AdeEde3EX9NglfGPhuTz9pXLPSiROrBNmhXy';

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const translations = {
  en:{keys_generated:'Keys Generated',pending:'Pending',active:'Active',create_key:'Create Key',copy_all:'Copy All',profile:'Profile',recent_activations:'Recent Activations',keys_per_day:'Keys generated per day',latest_keys:'Latest Keys',see_all:'See all →',logout:'Logout',notifications:'Notifications',group:'Group',change_profile:'Change profile info',change_password:'Change password',key_alias:'Key alias',login_session:'Login session',twofa:'2FA setting',privacy:'Privacy and policy',support:'Support',language:'Language',integration_code:'Integration Code',clear_keys:'Clear all keys',version:'Version: 1.0.0 (Prod)',clear:'Clear',nav_home:'Home',nav_keys:'Keys',nav_devices:'Devices',nav_packages:'Packages',nav_profile:'Profile'},
  pt:{keys_generated:'Keys Geradas',pending:'Pendentes',active:'Ativas',create_key:'Criar Key',copy_all:'Copiar All',profile:'Perfil',recent_activations:'Ativações Recentes',keys_per_day:'Keys geradas por dia',latest_keys:'Últimas Keys',see_all:'Ver todas →',logout:'Sair',notifications:'Notificações',group:'Grupo',change_profile:'Alterar dados do perfil',change_password:'Alterar senha',key_alias:'Alias da key',login_session:'Sessão de login',twofa:'Configuração 2FA',privacy:'Privacidade e política',support:'Suporte',language:'Idioma',integration_code:'Código de Integração',clear_keys:'Limpar todas as keys',version:'Versão: 1.0.0 (Prod)',clear:'Limpar',nav_home:'Home',nav_keys:'Keys',nav_devices:'Devices',nav_packages:'Pacotes',nav_profile:'Perfil'},
  vi:{keys_generated:'Keys Đã Tạo',pending:'Chờ xử lý',active:'Đang hoạt động',create_key:'Tạo Key',copy_all:'Sao chép tất cả',profile:'Hồ sơ',recent_activations:'Kích hoạt gần đây',keys_per_day:'Keys được tạo mỗi ngày',latest_keys:'Keys gần nhất',see_all:'Xem tất cả →',logout:'Đăng xuất',notifications:'Thông báo',group:'Nhóm',change_profile:'Thay đổi thông tin',change_password:'Đổi mật khẩu',key_alias:'Bí danh key',login_session:'Phiên đăng nhập',twofa:'Cài đặt 2FA',privacy:'Quyền riêng tư',support:'Hỗ trợ',language:'Ngôn ngữ',integration_code:'Mã tích hợp',clear_keys:'Xóa tất cả keys',version:'Phiên bản: 1.0.0 (Sản xuất)',clear:'Xóa',nav_home:'Trang chủ',nav_keys:'Keys',nav_devices:'Thiết bị',nav_packages:'Gói',nav_profile:'Hồ sơ'}
};
let currentLang = localStorage.getItem('ferrao_lang') || 'en';
function applyLanguage(lang){
  currentLang=lang; localStorage.setItem('ferrao_lang',lang);
  const t=translations[lang]||translations['en'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(t[k])el.textContent=t[k];});
  const labels={en:'English',pt:'Português (BR)',vi:'Tiếng Việt'};
  const el=document.getElementById('current-lang-label'); if(el) el.textContent=labels[lang]||'English';
  ['en','pt','vi'].forEach(l=>{const c=document.getElementById('lang-check-'+l);if(c)c.className='lang-check'+(l===lang?' selected':'');});
}
function setLanguage(lang){ applyLanguage(lang); closeModal('lang-modal'); showToast('🌐 Language changed!'); }

/* ============================================================
   STORAGE
   ============================================================ */
const STORAGE_KEYS={keys:'ferrao_keys',packages:'ferrao_packages',limit:'ferrao_limit',chartData:'ferrao_chart',apiKeys:'ferrao_api_keys',deleted:'ferrao_deleted'};
const KEY_LIMIT=5000;
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function load(k,def=null){try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):def;}catch(e){return def;}}

let generatedKeys=load(STORAGE_KEYS.keys,[]);
let apiKeys=load(STORAGE_KEYS.apiKeys,[]);
let packages=load(STORAGE_KEYS.packages,[{id:'default',name:'API',url:'https://teste-api-mcok.vercel.app/keys',desc:'API principal FERRAO',enabled:true,sent:0}]);
let limitCount=load(STORAGE_KEYS.limit,0);
let chartData=load(STORAGE_KEYS.chartData,{});
let selectedIds=new Set();
let deletedIds=new Set(load(STORAGE_KEYS.deleted,[]));
let activeDeviceKey=null;
// Track cleared sessions locally
let clearedSessionDevices=new Set(load('ferrao_cleared_sessions',[]));

/* ============================================================
   NAVIGATION
   ============================================================ */
const mainPages=['home','keys','devices','packages','profile'];
function navigate(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  if(mainPages.includes(page)){
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const navEl=document.getElementById('nav-'+page); if(navEl) navEl.classList.add('active');
  } else {
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    if(page==='login-session') document.getElementById('nav-profile').classList.add('active');
  }
  document.getElementById('page-'+page).classList.add('active');
  if(page==='keys') renderKeysList(getMergedKeys());
  if(page==='devices') renderDevicesList(getMergedKeys());
  if(page==='packages') renderPackages();
  if(page==='login-session') renderSessions();
}

/* ============================================================
   MERGE
   ============================================================ */
function getMergedKeys(){
  const filteredApi=apiKeys.filter(k=>!deletedIds.has(k.id));
  const apiIdSet=new Set(filteredApi.map(k=>k.id));
  const localOnly=generatedKeys.filter(k=>!apiIdSet.has(k.id)&&!deletedIds.has(k.id));
  return [...filteredApi,...localOnly];
}

/* ============================================================
   FETCH REMOTE API
   ============================================================ */
async function fetchRemoteKeys(){
  try{
    const res=await fetch('https://teste-api-mcok.vercel.app/keys',{cache:'no-store',headers:{'Accept':'application/json'}});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    if(Array.isArray(data)){apiKeys=data.filter(k=>!deletedIds.has(k.id));save(STORAGE_KEYS.apiKeys,apiKeys);}
  }catch(e){console.warn('API fetch failed:',e.message);}
}

async function deleteKeyFromApi(keyId,keyStr){
  try{const res=await fetch(`https://teste-api-mcok.vercel.app/keys/${keyId}`,{method:'DELETE',headers:{'Content-Type':'application/json','Accept':'application/json'},signal:AbortSignal.timeout(6000)});if(res.ok)return true;}catch(e){}
  try{const res=await fetch('https://teste-api-mcok.vercel.app/keys',{method:'DELETE',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({id:keyId,key:keyStr}),signal:AbortSignal.timeout(6000)});if(res.ok)return true;}catch(e){}
  return false;
}

/* ============================================================
   LOGIN SESSION — REAL DATA from API
   Real sessions = devices that have actually used keys via the API.
   We extract device info + activation data from each unique device
   in the fetched key list. IP is fetched from ipapi if available.
   ============================================================ */
let realSessions = [];

async function fetchRealSessions(){
  const el=document.getElementById('sessions-list');
  el.innerHTML='<div class="loading"><div class="spinner"></div>Buscando sessões reais...</div>';

  try{
    const res=await fetch('https://teste-api-mcok.vercel.app/keys',{cache:'no-store',headers:{'Accept':'application/json'}});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();

    if(!Array.isArray(data) || data.length===0){
      el.innerHTML='<div class="empty"><div class="empty-icon">📱</div><div class="empty-text">Nenhuma sessão encontrada na API</div></div>';
      return;
    }

    // Extract unique devices that have actually activated a key
    const seenDevices=new Map();
    data.forEach(k=>{
      if(k.used && k.device && k.device.trim()!==''){
        const dev=k.device.trim();
        if(!seenDevices.has(dev)){
          seenDevices.set(dev,{
            device: dev,
            key: k.key,
            keyId: k.id,
            activatedAt: k.activatedAt||0,
            expiresAt: k.expiresAt||0,
            type: k.type||'–',
            ip: k.ip||k.clientIp||k.userIp||k.ipAddress||null,
            platform: k.platform||k.os||detectPlatform(dev),
            version: k.version||k.osVersion||'–',
            keyCount: 1
          });
        } else {
          seenDevices.get(dev).keyCount++;
          // Use most recent activation
          if((k.activatedAt||0) > seenDevices.get(dev).activatedAt){
            seenDevices.get(dev).activatedAt=k.activatedAt;
            seenDevices.get(dev).expiresAt=k.expiresAt;
            seenDevices.get(dev).ip=k.ip||k.clientIp||k.userIp||k.ipAddress||seenDevices.get(dev).ip;
          }
        }
      }
    });

    realSessions = [...seenDevices.values()];

    if(realSessions.length===0){
      el.innerHTML='<div class="empty"><div class="empty-icon">📱</div><div class="empty-text">Nenhum device ativo encontrado</div></div>';
      return;
    }

    // Sort: most recently activated first
    realSessions.sort((a,b)=>(b.activatedAt||0)-(a.activatedAt||0));

    renderSessionCards(realSessions);

  }catch(e){
    console.warn('Sessions fetch error:', e);
    el.innerHTML=`<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">Erro ao buscar sessões<br><small style="font-size:11px;color:#9ca3af;">${e.message}</small></div></div>`;
  }
}

function detectPlatform(deviceName){
  const d=deviceName.toLowerCase();
  if(d.includes('iphone')||d.includes('ipad')||d.includes('ipod')) return 'iOS';
  if(d.includes('android')||d.includes('samsung')||d.includes('xiaomi')||d.includes('pixel')||d.includes('huawei')||d.includes('motorola')||d.includes('oppo')||d.includes('vivo')) return 'Android';
  if(d.includes('mac')||d.includes('darwin')) return 'macOS';
  if(d.includes('win')||d.includes('windows')) return 'Windows';
  if(d.includes('linux')||d.includes('ubuntu')) return 'Linux';
  return 'Unknown';
}

function renderSessionCards(sessions){
  const el=document.getElementById('sessions-list');
  if(!sessions.length){el.innerHTML='<div class="empty"><div class="empty-icon">📱</div><div class="empty-text">Nenhuma sessão ativa</div></div>';return;}

  // Mark first as "current" (most recent)
  el.innerHTML=sessions.map((s,idx)=>{
    const isCurrent=idx===0;
    const actDate=s.activatedAt>0?new Date(s.activatedAt*1000).toLocaleString('pt-BR'):'–';
    const expDate=s.expiresAt>0?new Date(s.expiresAt*1000).toLocaleString('pt-BR'):'Lifetime';
    const isExpired=s.expiresAt>0&&s.expiresAt<Date.now()/1000;
    const statusColor=isExpired?'background:#fee2e2;color:#991b1b':'background:#dcfce7;color:#15803d';
    const statusLabel=isExpired?'Expirado':'Ativo';

    return `<div class="session-card${isCurrent?' is-current':''}">
      <div class="session-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:18px;">${s.platform==='iOS'?'📱':s.platform==='Android'?'🤖':s.platform==='Windows'?'💻':'🖥️'}</span>
          <div>
            <div class="session-device-name">${s.device}</div>
            <div style="font-size:11px;color:var(--gray);margin-top:2px;">${s.platform} ${s.version!=='–'?'· v'+s.version:''}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="badge" style="${statusColor}">${statusLabel}</span>
          ${isCurrent?'<span class="session-current-badge">📍 Recente</span>':''}
        </div>
      </div>
      <div class="session-row">
        <span class="session-label">Device name</span>
        <span class="session-value">${s.device}</span>
      </div>
      <div class="session-row">
        <span class="session-label">Platform</span>
        <span class="session-value">${s.platform}</span>
      </div>
      <div class="session-row">
        <span class="session-label">IP</span>
        <span class="session-value" style="font-family:monospace;font-size:11px;">${s.ip||'Não registrado pela API'}</span>
      </div>
      <div class="session-row">
        <span class="session-label">Ativado em</span>
        <span class="session-value">${actDate}</span>
      </div>
      <div class="session-row">
        <span class="session-label">Expira em</span>
        <span class="session-value">${expDate}</span>
      </div>
      <div class="session-row" style="margin-bottom:0;">
        <span class="session-label">Keys usadas</span>
        <span class="session-value">${s.keyCount} key(s)</span>
      </div>
    </div>`;
  }).join('');
}

function renderSessions(){ fetchRealSessions(); }
function refreshSessions(){ showToast('🔄 Atualizando sessões...'); fetchRealSessions(); }

function clearSessions(){
  if(!confirm('Marcar todas as sessões como encerradas? (não revoga as keys)')) return;
  // Save cleared list locally
  realSessions.forEach(s=>clearedSessionDevices.add(s.device));
  save('ferrao_cleared_sessions',[...clearedSessionDevices]);
  document.getElementById('sessions-list').innerHTML='<div class="empty"><div class="empty-icon">✅</div><div class="empty-text">Todas as sessões foram encerradas</div></div>';
  showToast('✅ Sessões encerradas localmente');
}

/* ============================================================
   SUPPORT
   ============================================================ */
async function sendSupportTicket(){
  const name=document.getElementById('support-name').value.trim();
  const problem=document.getElementById('support-problem').value;
  const desc=document.getElementById('support-desc').value.trim();
  if(!name){showToast('⚠️ Informe seu nome');return;}
  if(!problem){showToast('⚠️ Selecione o tipo de problema');return;}
  if(!desc||desc.length<10){showToast('⚠️ Descreva o problema com mais detalhes');return;}
  const btn=document.getElementById('support-send-btn');
  btn.disabled=true; btn.textContent='⏳ Enviando...';
  const now=new Date();
  const embed={title:'🎫 Novo Ticket de Suporte',color:0x1a56e8,fields:[
    {name:'👤 Nome',value:name,inline:true},
    {name:'🔴 Problema',value:problem,inline:true},
    {name:'📝 Descrição',value:desc.length>1024?desc.substring(0,1021)+'...':desc,inline:false},
    {name:'🕐 Data/Hora',value:now.toLocaleString('pt-BR'),inline:true},
    {name:'📱 Plataforma',value:navigator.userAgent.includes('iPhone')||navigator.userAgent.includes('iPad')?'iOS':navigator.userAgent.includes('Android')?'Android':'Web/Desktop',inline:true}
  ],footer:{text:'Ghost Dash · Support System'},timestamp:now.toISOString()};
  try{
    const res=await fetch(DISCORD_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'🛟 Ghost Support',embeds:[embed]}),signal:AbortSignal.timeout(10000)});
    if(res.ok||res.status===204){
      showToast('✅ Ticket enviado!');closeModal('support-modal');
      document.getElementById('support-name').value='';
      document.getElementById('support-problem').value='';
      document.getElementById('support-desc').value='';
    }else throw new Error('HTTP '+res.status);
  }catch(e){showToast('⚠️ Erro ao enviar. Verifique o webhook.');}
  btn.disabled=false; btn.textContent='📨 Enviar para o Suporte';
}

function confirmLogout(){ if(confirm('Tem certeza que deseja sair?')) showToast('👋 Até logo!'); }

/* ============================================================
   STATS & LIMIT
   ============================================================ */
function updateLimit(added=0){
  if(added>0) limitCount=Math.min(limitCount+added,KEY_LIMIT);
  save(STORAGE_KEYS.limit,limitCount);
  const pct=(limitCount/KEY_LIMIT)*100;
  document.getElementById('limit-count-text').textContent=`${limitCount.toLocaleString('pt-BR')} / 5.000`;
  document.getElementById('limit-bar').style.width=pct+'%';
  document.getElementById('limit-bar').style.background=pct>90?'linear-gradient(90deg,#f87171,#ef4444)':pct>70?'linear-gradient(90deg,#fbbf24,#f59e0b)':'linear-gradient(90deg,#4ade80,#22c55e)';
}
function renderStats(){
  const all=getMergedKeys();
  document.getElementById('stat-total').textContent=all.length;
  document.getElementById('stat-pending').textContent=all.filter(k=>!k.used).length;
  document.getElementById('stat-devices').textContent=all.filter(k=>k.used).length;
  document.getElementById('stat-active').textContent=all.filter(k=>k.used).length;
  document.getElementById('keys-count-pill').textContent=all.length;
}

/* ============================================================
   CHART
   ============================================================ */
function buildChartData(){const out={};for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);out[k]=chartData[k]||0;}return out;}
function renderChart(){
  const canvas=document.getElementById('mainChart');if(!canvas)return;
  const ctx=canvas.getContext('2d'),dpr=window.devicePixelRatio||1,W=canvas.offsetWidth||340,H=170;
  canvas.width=W*dpr;canvas.height=H*dpr;ctx.scale(dpr,dpr);
  const raw=buildChartData(),labels=Object.keys(raw).map(d=>d.slice(5)),values=Object.values(raw),maxV=Math.max(...values,5);
  const pad={l:36,r:14,t:14,b:30},W2=W-pad.l-pad.r,H2=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);ctx.setLineDash([3,4]);ctx.strokeStyle='#e9ecf3';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=pad.t+(H2/4)*i;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();ctx.fillStyle='#9ca3af';ctx.font='9px DM Sans';ctx.textAlign='right';ctx.fillText(Math.round(maxV-(maxV/4)*i),pad.l-4,y+4);}
  ctx.setLineDash([]);
  const pts=values.map((v,i)=>({x:pad.l+(W2/(values.length-1||1))*i,y:pad.t+H2-(v/maxV)*H2}));
  const grad=ctx.createLinearGradient(0,pad.t,0,pad.t+H2);grad.addColorStop(0,'rgba(26,86,232,0.18)');grad.addColorStop(1,'rgba(26,86,232,0)');
  ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);pts.forEach((p,i)=>{if(i>0)ctx.lineTo(p.x,p.y);});ctx.lineTo(pts[pts.length-1].x,pad.t+H2);ctx.lineTo(pts[0].x,pad.t+H2);ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();ctx.strokeStyle='#1a56e8';ctx.lineWidth=2.5;ctx.lineJoin='round';pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));ctx.stroke();
  pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#1a56e8';ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();});
  ctx.fillStyle='#9ca3af';ctx.font='9px DM Sans';ctx.textAlign='center';labels.forEach((l,i)=>ctx.fillText(l,pts[i].x,H-6));
}

/* ============================================================
   HOME KEYS
   ============================================================ */
function renderHomeKeys(){
  const el=document.getElementById('home-keys-list');
  const all=getMergedKeys().slice(0,5);
  if(!all.length){el.innerHTML='<div style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">Nenhuma key ainda</div>';return;}
  el.innerHTML=all.map(k=>{
    const b=k.used?'active">Ativa':'pending">Pendente';
    return `<div class="list-item" style="border-radius:12px;margin-bottom:5px;box-shadow:var(--shadow);border:none;"><div class="item-body"><div class="item-key" style="font-size:12.5px;">${k.key}</div><div class="item-meta">${getTypeLabel(k)}</div></div><span class="badge ${b}</span><button class="copy-btn" onclick="copyText('${k.key}');event.stopPropagation();"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>`;
  }).join('');
}
function getTypeLabel(k){if(k.type==='weekly')return '1 semana';if(k.type==='monthly')return '1 mês';if(k.type==='lifetime')return 'Lifetime';if(k.expire)return `${k.expire} ${k.type}`;return k.type;}

/* ============================================================
   KEYS PAGE
   ============================================================ */
function renderKeysList(keys){
  const el=document.getElementById('keys-list');
  if(!keys.length){el.innerHTML='<div class="empty"><div class="empty-icon">🔑</div><div class="empty-text">Nenhuma key encontrada</div></div>';return;}
  el.innerHTML=keys.map(k=>{
    const badge=k.used?'active">Ativa':'pending">Pendente';
    const isRed=k.key.toUpperCase().includes('-VH');
    const sel=selectedIds.has(k.id);
    return `<div class="list-item${sel?' selected':''}" onclick="toggleSelect('${k.id}',this)"><div class="item-check${sel?' checked':''}" id="chk-${k.id}"></div><div class="item-body"><div class="item-key${isRed?' red-key':''}">${k.key}</div><div class="item-meta">${getTypeLabel(k)} ${k.device?'· 📱 em uso':''}</div></div><span class="badge ${badge}</span><button class="copy-btn" onclick="copyText('${k.key}');event.stopPropagation();"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>`;
  }).join('');
}
function filterKeys(val){const v=val.toLowerCase();renderKeysList(getMergedKeys().filter(k=>k.key.toLowerCase().includes(v)||k.type.toLowerCase().includes(v)));}
function toggleSelect(id,row){const chk=document.getElementById('chk-'+id);if(selectedIds.has(id)){selectedIds.delete(id);chk?.classList.remove('checked');row.classList.remove('selected');}else{selectedIds.add(id);chk?.classList.add('checked');row.classList.add('selected');}}
async function deleteSelected(){
  if(!selectedIds.size){showToast('⚠️ Selecione keys primeiro');return;}
  const n=selectedIds.size; showToast(`⏳ Excluindo ${n} key(s)...`);
  const toDelete=getMergedKeys().filter(k=>selectedIds.has(k.id));
  selectedIds.forEach(id=>deletedIds.add(id)); save(STORAGE_KEYS.deleted,[...deletedIds]);
  generatedKeys=generatedKeys.filter(k=>!deletedIds.has(k.id)); apiKeys=apiKeys.filter(k=>!deletedIds.has(k.id));
  save(STORAGE_KEYS.keys,generatedKeys);save(STORAGE_KEYS.apiKeys,apiKeys);
  selectedIds.clear(); renderKeysList(getMergedKeys()); renderStats(); renderHomeKeys();
  let apiDeletedCount=0;
  for(const k of toDelete){const ok=await deleteKeyFromApi(k.id,k.key);if(ok)apiDeletedCount++;}
  showToast(`🗑️ ${n} key(s) removida(s)${apiDeletedCount>0?` (${apiDeletedCount} da API)`:''}`);
}

/* ============================================================
   DEVICES PAGE
   ============================================================ */
function renderDevicesList(keys){
  const el=document.getElementById('devices-list');
  const usedKeys=keys.filter(k=>k.used&&k.device);
  if(!usedKeys.length){el.innerHTML='<div class="empty"><div class="empty-icon">📱</div><div class="empty-text">Nenhum device conectado</div></div>';return;}
  const grouped={};
  usedKeys.forEach(k=>{const dev=k.device||'(desconhecido)';if(!grouped[dev])grouped[dev]=[];grouped[dev].push(k);});
  el.innerHTML=Object.entries(grouped).map(([dev,devKeys])=>{
    const firstKey=devKeys[0];
    const isExpired=firstKey.expiresAt>0&&firstKey.expiresAt<Date.now()/1000;
    const activatedAt=firstKey.activatedAt?new Date(firstKey.activatedAt*1000).toLocaleString('pt-BR'):'–';
    const keysSubHtml=devKeys.map(k=>{
      const exp=k.expiresAt>0&&k.expiresAt<Date.now()/1000;
      return `<div class="device-key-sub-row"><div class="device-key-sub-text">${k.key}</div><span class="badge" style="flex-shrink:0;${exp?'background:#fee2e2;color:#991b1b':'background:#dcfce7;color:#15803d'}">${exp?'Expirada':'Ativa'}</span><button class="copy-btn" style="width:24px;height:24px;margin-left:6px;" onclick="copyText('${k.key}');event.stopPropagation();"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>`;
    }).join('');
    return `<div class="device-item"><div class="device-item-header"><button class="device-action-btn" onclick="openDeviceActionModal('${firstKey.id}',event)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="5" r="1.5" fill="#6366f1"/><circle cx="12" cy="12" r="1.5" fill="#6366f1"/><circle cx="12" cy="19" r="1.5" fill="#6366f1"/></svg></button><div class="item-body"><div class="item-key" style="font-size:13px;">📱 ${dev}</div><div class="item-meta" style="font-size:11px;">Ativado: ${activatedAt} · ${devKeys.length} key(s)</div></div><span class="badge" style="${isExpired?'background:#fee2e2;color:#991b1b':'background:#dcfce7;color:#15803d'}">${isExpired?'Expirado':'Online'}</span></div><div class="device-keys-sub"><div style="font-size:10px;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Keys vinculadas</div>${keysSubHtml}</div></div>`;
  }).join('');
}
function filterDevices(val){const v=val.toLowerCase();renderDevicesList(getMergedKeys().filter(k=>k.device?.toLowerCase().includes(v)||k.key.toLowerCase().includes(v)));}

/* ============================================================
   DEVICE ACTION MODAL
   ============================================================ */
function openDeviceActionModal(keyId,event){
  event.stopPropagation();
  const k=getMergedKeys().find(k=>k.id===keyId);if(!k)return;
  activeDeviceKey=k;
  document.getElementById('da-key-text').textContent=k.key;
  document.getElementById('da-dev-text').textContent='📱 '+(k.device||'Device desconhecido');
  openModal('device-action-modal');
}
async function doDeviceAction(action){
  if(!activeDeviceKey)return;
  const k=activeDeviceKey; closeModal('device-action-modal');
  if(action==='reset'){
    showToast('⏳ Resetando device...');
    const upd=a=>a.map(i=>i.id===k.id?{...i,used:false,device:'',activatedAt:0,expiresAt:0}:i);
    generatedKeys=upd(generatedKeys);apiKeys=upd(apiKeys);
    save(STORAGE_KEYS.keys,generatedKeys);save(STORAGE_KEYS.apiKeys,apiKeys);
    try{await fetch(`https://teste-api-mcok.vercel.app/keys/${k.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({used:false,device:'',activatedAt:0,expiresAt:0}),signal:AbortSignal.timeout(6000)});}catch(e){}
    renderDevicesList(getMergedKeys());renderStats();renderHomeKeys();
    showToast('✅ Device resetado! Key disponível.');
  } else if(action==='revoke'){
    showToast('⏳ Revogando device...');
    deletedIds.add(k.id);save(STORAGE_KEYS.deleted,[...deletedIds]);
    generatedKeys=generatedKeys.filter(i=>i.id!==k.id);apiKeys=apiKeys.filter(i=>i.id!==k.id);
    save(STORAGE_KEYS.keys,generatedKeys);save(STORAGE_KEYS.apiKeys,apiKeys);
    await deleteKeyFromApi(k.id,k.key);
    renderDevicesList(getMergedKeys());renderStats();renderHomeKeys();
    showToast('🚫 Device revogado e key excluída.');
  }
  activeDeviceKey=null;
}

/* ============================================================
   PACKAGES — URL OCULTA
   ============================================================ */
function renderPackages(){
  const el=document.getElementById('packages-list');
  if(!packages.length){el.innerHTML='<div class="empty"><div class="empty-icon">📦</div><div class="empty-text">Nenhum package ainda</div></div>';return;}
  el.innerHTML=packages.map((p,i)=>`
    <div class="pkg-item">
      <div class="pkg-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a56e8" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
      <div class="pkg-body">
        <div class="pkg-name">${p.name}</div>
        <!-- URL OCULTA: não exibe o endpoint real -->
        <div class="pkg-url-hidden">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          URL protegida
        </div>
        ${p.desc?`<div class="item-meta" style="margin-top:4px;font-size:11px;">${p.desc}</div>`:''}
        <div class="pkg-sent">✦ ${p.sent||0} keys enviadas</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <div class="toggle ${p.enabled?'':'off'}" onclick="togglePkg(${i})"><div class="toggle-knob"></div></div>
        <button onclick="deletePkg(${i})" style="background:none;border:none;cursor:pointer;padding:2px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    </div>`).join('');
}

function togglePkg(i){packages[i].enabled=!packages[i].enabled;save(STORAGE_KEYS.packages,packages);renderPackages();updatePkgSelect();}
function deletePkg(i){const n=packages[i].name;packages.splice(i,1);save(STORAGE_KEYS.packages,packages);renderPackages();updatePkgSelect();showToast(`📦 Package "${n}" removido`);}

function openPkgModal(){
  document.getElementById('pkg-name').value='';
  document.getElementById('pkg-url').value='';
  document.getElementById('pkg-desc').value='';
  openModal('pkg-modal');
}
function addPackage(){
  const name=document.getElementById('pkg-name').value.trim();
  const url=document.getElementById('pkg-url').value.trim();
  const desc=document.getElementById('pkg-desc').value.trim();
  if(!name){showToast('⚠️ Informe o nome');return;}
  if(!url||!url.startsWith('http')){showToast('⚠️ URL inválida');return;}
  packages.push({id:'pkg-'+Date.now(),name,url,desc,enabled:true,sent:0});
  save(STORAGE_KEYS.packages,packages);renderPackages();updatePkgSelect();
  closeModal('pkg-modal');showToast(`📦 Package "${name}" adicionado!`);
}

// Select shows only package NAME, not URL
function updatePkgSelect(){
  const sel=document.getElementById('key-package');if(!sel)return;
  const cur=sel.value;
  sel.innerHTML='<option value="">— Selecionar package —</option>'+
    packages.filter(p=>p.enabled).map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  if(cur)sel.value=cur;
}

/* ============================================================
   CREATE KEY
   ============================================================ */
function openCreateModal(){
  document.getElementById('generated-results').style.display='none';
  document.getElementById('generated-keys-list').innerHTML='';
  document.getElementById('create-btn-main').disabled=false;
  document.getElementById('create-btn-main').textContent='✦ Gerar Keys';
  updatePkgSelect();updatePreview();openModal('create-modal');
}
function updatePreview(){
  const type=document.getElementById('key-type')?.value||'weekly';
  document.getElementById('key-preview').textContent=`GHOST-${type}-${'X'.repeat(10)}${Math.floor(Math.random()*99999)}`;
}
function generateKeyString(type){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let rand='';
  for(let i=0;i<8;i++)rand+=chars[Math.floor(Math.random()*chars.length)];
  return `GHOST-${type}-${rand}${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}
async function sendKeyToApi(pkgUrl,keyData){
  try{const res=await fetch(pkgUrl,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(keyData),signal:AbortSignal.timeout(8000)});return res.ok;}catch(e){return false;}
}
async function createKeys(){
  const qty=Math.min(parseInt(document.getElementById('key-qty').value)||1,100);
  const type=document.getElementById('key-type').value;
  const dur=parseInt(document.getElementById('key-duration').value)||1;
  const pkgId=document.getElementById('key-package').value;
  if(!pkgId){showToast('⚠️ Selecione um Package!');return;}
  if(limitCount>=KEY_LIMIT){showToast('❌ Limite atingido!');return;}
  const realQty=Math.min(qty,KEY_LIMIT-limitCount);if(realQty<=0){showToast('❌ Limite atingido!');return;}
  const pkg=packages.find(p=>p.id===pkgId);if(!pkg){showToast('⚠️ Package não encontrado');return;}
  const btn=document.getElementById('create-btn-main');btn.disabled=true;btn.textContent='⏳ Gerando...';
  const today=new Date().toISOString().slice(0,10);
  const newKeys=[];const sentOk=[];
  for(let i=0;i<realQty;i++){
    const key=generateKeyString(type);
    const keyObj={id:'local-'+Date.now()+'-'+i,key,type,expire:dur,used:false,device:'',createdAt:Math.floor(Date.now()/1000),activatedAt:0,expiresAt:0,_pkg:pkg.name,_pkgId:pkgId};
    newKeys.push(keyObj);sentOk.push(await sendKeyToApi(pkg.url,keyObj));
  }
  generatedKeys.unshift(...newKeys);save(STORAGE_KEYS.keys,generatedKeys);
  updateLimit(realQty);chartData[today]=(chartData[today]||0)+realQty;save(STORAGE_KEYS.chartData,chartData);
  const pkgIdx=packages.findIndex(p=>p.id===pkgId);if(pkgIdx>=0)packages[pkgIdx].sent=(packages[pkgIdx].sent||0)+realQty;
  save(STORAGE_KEYS.packages,packages);
  document.getElementById('generated-results').style.display='block';
  document.getElementById('generated-keys-list').innerHTML=newKeys.map(k=>`<div class="result-key-item"><div class="result-key-text">${k.key}</div><button class="result-copy-btn" onclick="copyText('${k.key}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button></div>`).join('');
  btn.disabled=false;btn.textContent='✦ Gerar Mais';
  renderStats();renderHomeKeys();renderChart();
  if(document.getElementById('page-keys').classList.contains('active'))renderKeysList(getMergedKeys());
  const okCount=sentOk.filter(Boolean).length;
  showToast(`✅ ${realQty} key(s)! ${okCount===realQty?'📡 Enviadas!':okCount>0?`⚠️ ${okCount}/${realQty}`:'💾 Local'}`);
}
function copyAllGenerated(){const items=document.querySelectorAll('.result-key-text');copyText(Array.from(items).map(el=>el.textContent).join('\n'),`${items.length} keys copiadas!`);}

/* ============================================================
   MISC
   ============================================================ */
function resetAllKeys(){
  if(!confirm('Limpar TODAS as keys?'))return;
  generatedKeys=[];apiKeys=[];limitCount=0;chartData={};deletedIds=new Set();
  save(STORAGE_KEYS.keys,[]);save(STORAGE_KEYS.apiKeys,[]);save(STORAGE_KEYS.limit,0);save(STORAGE_KEYS.chartData,{});save(STORAGE_KEYS.deleted,[]);
  updateLimit(0);renderStats();renderHomeKeys();renderChart();showToast('🗑️ Todas as keys limpas');
}
function copyAllPending(){const pending=getMergedKeys().filter(k=>!k.used).map(k=>k.key);if(!pending.length){showToast('Nenhuma key pendente');return;}copyText(pending.join('\n'),`${pending.length} keys copiadas!`);}

function showIntegration(){
  const apiUrl=packages[0]?.url||'https://teste-api-mcok.vercel.app/keys';
  document.getElementById('integration-js').textContent=`// Verificar key (JavaScript / Fetch)\nconst API = "${apiUrl}";\n\nasync function verificarKey(key) {\n  const res = await fetch(API);\n  const keys = await res.json();\n  const found = keys.find(k => k.key === key);\n  if (!found) return { valid: false, reason: "Key não encontrada" };\n  if (found.used) return { valid: false, reason: "Key já usada" };\n  return { valid: true, data: found };\n}`;
  document.getElementById('integration-luau').textContent=`-- Verificar key (Luau / Roblox)\nlocal API = "${apiUrl}"\nlocal HttpService = game:GetService("HttpService")\n\nlocal function verificarKey(key: string)\n  local ok, res = pcall(function()\n    return HttpService:GetAsync(API)\n  end)\n  if not ok then return false end\n  local data = HttpService:JSONDecode(res)\n  for _, item in ipairs(data) do\n    if item.key == key and not item.used then\n      return true\n    end\n  end\n  return false\nend`;
  openModal('integration-modal');
}
function copyIntegration(type){copyText(document.getElementById('integration-'+type).textContent,'Código copiado!');}

function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function closeOnBg(e,id){if(e.target.id===id)closeModal(id);}

function toggleSearch(page){
  const el=document.getElementById('search-'+page);
  if(el.style.display==='none'||!el.style.display){el.style.display='block';el.querySelector('input').focus();}
  else{el.style.display='none';el.querySelector('input').value='';if(page==='keys')renderKeysList(getMergedKeys());if(page==='devices')renderDevicesList(getMergedKeys());}
}

async function copyText(text,msg='Copiado!'){
  try{await navigator.clipboard.writeText(text);showToast('📋 '+msg);}
  catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('📋 '+msg);}
}

function showToast(msg){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  document.querySelector('.phone').appendChild(t);setTimeout(()=>t.remove(),3400);
}

async function refreshAll(){
  showToast('🔄 Atualizando...');
  await fetchRemoteKeys();renderStats();renderHomeKeys();renderChart();
  if(document.getElementById('page-keys').classList.contains('active'))renderKeysList(getMergedKeys());
  if(document.getElementById('page-devices').classList.contains('active'))renderDevicesList(getMergedKeys());
  showToast('✅ Dados atualizados!');
}

/* ============================================================
   INIT
   ============================================================ */
async function init(){
  applyLanguage(currentLang);
  updateLimit(0);updatePkgSelect();renderStats();renderHomeKeys();renderChart();
  await fetchRemoteKeys();renderStats();renderHomeKeys();
}

window.addEventListener('resize',()=>{if(document.getElementById('mainChart'))renderChart();});
init();
