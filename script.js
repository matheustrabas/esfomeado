
// ========== SCRIPT.JS: a lógica do Esfomeado ==========
// $ = atalho para document.querySelector (pega um elemento da página pelo seletor CSS).
const $=s=>document.querySelector(s);
// brl = formata um número como moeda brasileira (ex.: 18.9 vira R$ 18,90).
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
// cats = lista de categorias [nome, emoji] usada na lateral e nos chips.
const cats=[["Todos","🍽️"],["Hambúrguer","🍔"],["Pizza","🍕"],["Japonesa","🍣"],["Marmita","🍛"],["Açaí","🫐"],["Salgados","🥟"],["Massas","🍝"],["Doces","🍫"]];
// F = lista de filtros [código, texto, emoji]: frete grátis, melhor avaliados, mais rápidos e abertos agora.
const F=[["free","Entrega grátis","🛵"],["rate","Melhor avaliados","⭐"],["fast","Mais rápidos","⏱️"],["open","Abertos agora","🟢"]];
// R = os dados dos 8 restaurantes fictícios.
// Campos: id, n (nome), c (categoria), r (nota), v (nº de avaliações), t (tempo de entrega),
// f (frete), b (selo), d (descrição) e m (cardápio: [nome, preço, emoji, descrição]).
const R=[{id:1,n:"Sushi Kaze",c:"Japonesa",r:4.9,v:2105,t:"40–55 min",f:8.99,b:"Melhor avaliado",d:"Sushi, sashimi e temaki fresquinhos",m:[["Combo 20 peças",69.9,"🍣","Mix de uramaki, niguiri e sashimi"],["Temaki de Salmão",32,"🌯","Salmão, cream cheese e cebolinha"],["Gyoza (6 un.)",24,"🥟","Pastelzinho grelhado de carne"]]},{id:2,n:"Doce Encanto",c:"Doces",r:4.9,v:1330,t:"25–35 min",f:0,b:"Entrega grátis",d:"Bolos, brigadeiros e sobremesas",m:[["Fatia de Bolo de Chocolate",18.9,"🍰","Camadas de brigadeiro com morango"],["Caixa com 6 brigadeiros",34,"🍫","Tradicional, ninho, pistache e mais"],["Cookie Recheado",12.5,"🍪","Chocolate meio amargo e nutella"]]},{id:3,n:"Brasa Burger",c:"Hambúrguer",r:4.8,v:1240,t:"25–35 min",f:5.99,b:"Mais pedido",d:"Hambúrgueres artesanais na brasa",m:[["Smash Duplo",32.9,"🍔","Dois blends de 90 g, cheddar e molho da casa"],["Batata Rústica",18,"🍟","Porção crocante com alecrim"],["Milkshake de Ovomaltine",19.9,"🥤","400 ml bem cremoso"]]},{id:4,n:"Açaí do Norte",c:"Açaí",r:4.8,v:1710,t:"15–25 min",f:0,b:"Entrega grátis",d:"Açaí na tigela do jeito que você montar",m:[["Tigela 500 ml",22.9,"🫐","Com granola, banana e leite condensado"],["Tigela 700 ml",29.9,"🫐","Para quem está esfomeado de verdade"],["Vitamina de Açaí",16,"🥤","Batida com guaraná em pó"]]},{id:5,n:"Forno di Napoli",c:"Pizza",r:4.7,v:980,t:"30–45 min",f:0,b:"Entrega grátis",d:"Massa de fermentação lenta, forno a lenha",m:[["Margherita",49.9,"🍕","Molho de tomate, muçarela e manjericão"],["Calabresa Acebolada",54.9,"🍕","Calabresa artesanal e cebola roxa"],["Guaraná 2 L",12,"🥤","Bem gelado"]]},{id:6,n:"Cantina Bella",c:"Massas",r:4.7,v:860,t:"35–50 min",f:6.99,b:null,d:"Massas frescas e molhos caseiros",m:[["Fettuccine ao Alfredo",42.9,"🍝","Molho cremoso de queijo parmesão"],["Lasanha à Bolonhesa",46.9,"🍝","Porção individual gratinada"],["Nhoque ao Sugo",38.5,"🍅","Molho de tomate fresco e manjericão"]]},{id:7,n:"Tempero da Vó",c:"Marmita",r:4.8,v:645,t:"20–30 min",f:3.99,b:null,d:"Comida caseira feita todo dia",m:[["Prato Feito Completo",28.9,"🍛","Arroz, feijão, carne, farofa e salada"],["Strogonoff de Frango",31.5,"🍲","Com arroz e batata palha"],["Suco de Maracujá",9,"🧃","Copo de 500 ml"]]},{id:8,n:"Pastelaria do Zé",c:"Salgados",r:4.5,v:420,t:"20–30 min",f:4.99,b:null,d:"Pastéis e coxinhas na hora",m:[["Combo 6 coxinhas",22.9,"🍗","Frango cremoso com catupiry"],["Pastel de Carne",12.5,"🥟","Grande e bem crocante"],["Caldo de Cana",8,"🥤","Gelado, 400 ml"]]}];
// ls = ajudante do localStorage: get lê e set grava valores (com prefixo "esf_"), sem quebrar se o navegador bloquear o armazenamento.
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem("esf_"+k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem("esf_"+k,JSON.stringify(v))}catch(e){}}};
// Restaurantes cadastrados pelo painel admin entram na lista junto com os de exemplo.
ls.get("rests",[]).forEach(r=>R.push(r));
// Alterações feitas pelos restaurantes (cardápio, frete, taxa, entrega) nos restaurantes de exemplo.
{const ov=ls.get("ovr",{});R.forEach(r=>ov[r.id]&&Object.assign(r,ov[r.id]))}
// esc = escapa caracteres especiais do HTML (&, <, >, aspas) para que texto digitado pelo usuário não vire código na página.
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// nm = normaliza texto: tira acentos e põe em minúsculas, para a busca ignorar acento e maiúscula.
const nm=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
// Estado do app (variáveis globais):
// cat = categoria escolhida; q = texto da busca; fl = filtro ativo; cur = restaurante aberto (null = tela inicial);
// addr = endereço; cart = sacola {rid, items}; coupon = cupom aplicado; tt = timer do aviso (toast);
// note = observações do pedido; tip = gorjeta; pay = forma de pagamento; troco = troco para quanto;
// orders = histórico de pedidos; shown = número do pedido que está aberto no painel.
let cat="Todos",q="",fl="",cur=null,addr=ls.get("addr",""),cart=ls.get("cart",{rid:null,items:{}}),coupon=false,tt,note="",tip=0,pay="Pix",troco="",orders=ls.get("orders",[]),shown=0;
// Estado da conta: users = contas cadastradas (nome, e-mail, salt e hash da senha, nunca a senha em si);
// sess = e-mail da pessoa logada ("" = ninguém); fails = tentativas erradas seguidas; lockUntil = até quando o login fica bloqueado.
let users=ls.get("users",[]),sess=ls.get("sess",""),fails=0,lockUntil=0,adm=false,admTab="r";
// HR = horários especiais [abre, fecha] por id de restaurante (os demais usam 10h às 23h).
// OUT = itens esgotados, no formato "idRestaurante-indiceDoItem".
const HR={5:[18,23],6:[11,23]},OUT={"3-1":1};
// Itens esgotados marcados pelos restaurantes substituem a lista inicial.
{const so=ls.get("out",null);if(so){Object.keys(OUT).forEach(k=>delete OUT[k]);Object.assign(OUT,so)}}
// hrs = devolve o horário de funcionamento [abre, fecha] de um restaurante.
const hrs=r=>r.h||HR[r.id]||[10,23];
// isOpen = diz se o restaurante está aberto agora, comparando a hora atual com o horário dele.
const isOpen=r=>{const h=new Date().getHours(),[a,b]=hrs(r);return h>=a&&h<b};
// btn = gera o botão "+" de um item do cardápio; mostra "Esgotado" se o item acabou e nada se o restaurante está fechado.
const btn=(r,i)=>OUT[r.id+"-"+i]?'<span class="out">Esgotado</span>':isOpen(r)?`<button class="plus" onclick="add(${i})" aria-label="Adicionar ${r.m[i][0]}">+</button>`:"";
// save = grava sacola, endereço e pedidos no localStorage (para não perder ao recarregar a página).
function save(){ls.set("cart",cart);ls.set("addr",addr);ls.set("orders",orders)}

// Atalho de teclado: a tecla Esc fecha o painel deslizante (sacola, login, endereço...).
addEventListener("keydown",e=>{if(e.key=="Escape")closeCart()});
// PS = posições e tamanhos de recorte da imagem do restaurante, usados para dar "cara diferente" à foto de cada prato.
const PS=[["100% 100%","200% auto"],["0% 100%","300% auto"],["100% 0%","250% auto"]];
// rr = devolve o restaurante da sacola atual.
const rr=()=>R.find(r=>r.id==cart.rid);
// cnt = conta quantos itens há na sacola.
const cnt=()=>Object.values(cart.items).reduce((a,b)=>a+b,0);
// sub = calcula o subtotal da sacola (preço x quantidade de cada item).
const sub=()=>Object.entries(cart.items).reduce((s,[i,n])=>s+rr().m[i][1]*n,0);
// km = distância fictícia até o restaurante, calculada a partir do id.
const km=r=>(0.6+r.id*0.5).toFixed(1).replace(".",",");
// mn = pedido mínimo do restaurante (valor fictício calculado a partir do id).
const mn=r=>r.mn||20+(r.id%3)*5;
// ic = número da foto do restaurante (os cadastrados pelo admin escolhem uma das 8 fotos).
const ic=r=>r.img||r.id;
// nt = formata a nota com vírgula (ex.: 4.9 vira 4,9).
const nt=v=>v.toFixed(1).replace(".",",");
// frete = texto do frete: o valor em reais ou "Grátis".
const frete=r=>r.f?brl(r.f):'<span class="ok">Grátis</span>';
// toast = mostra um aviso rápido na parte de baixo da tela e some depois de 1,9 segundo.
function toast(m){const e=$("#toast");e.textContent=m;e.className="show";clearTimeout(tt);tt=setTimeout(()=>e.className="",1900)}

// go = volta para a tela inicial e rola a página para o topo.
function go(){cur=null;adm=false;draw();scrollTo(0,0)}

// showR = abre a página (cardápio) do restaurante escolhido.
function showR(id){cur=R.find(r=>r.id==id);adm=false;draw();scrollTo(0,0)}

// srch = chamada a cada letra digitada na busca; guarda o texto e atualiza a lista (ou volta para a home).
function srch(v){q=v;if(cur||adm){cur=null;adm=false;draw()}else list()}

// tg = liga ou desliga um filtro (clicar de novo no mesmo filtro remove ele).
function tg(k){fl=fl==k?"":k;list()}

// draw = desenha a tela certa: o cardápio se há restaurante aberto, senão a home com a lista; depois atualiza a sacola.
function draw(){$("#wrap").classList.toggle("full",!!cur||adm);if(adm)admin();else if(cur)menu();else{home();list()}upd()}

// home = monta o HTML da tela inicial: banner (hero), categorias, filtros e a grade de restaurantes.
function home(){$("#app").innerHTML=`<section class="hero"><div class="hc"><span class="pill">Entrega em 25–35 min</span><h1>Fome de quê?</h1><p>Bateu a fome? Bora resolver. Os melhores restaurantes da sua região, entregues quentinhos na sua porta.</p><div class="hch"><button onclick="toast('ESFOMEADO10: 10% off, máx. R$ 15, em pedidos a partir de R$ 30')">Cupom ESFOMEADO10</button><button onclick="fl='free';list()">Frete grátis</button><button onclick="fl='open';list()">Abertos agora</button></div></div></section><div class="pills" id="ct"></div><div class="fl" id="fl"></div><h2>Perto de você</h2><div class="mute" id="cn"></div><div class="grid" id="gr"></div>`;}

// card = gera o HTML do cartão de um restaurante (foto, selo, nota, tempo, frete) na lista.
const card=r=>`<article class="rcard" tabindex="0" onkeydown="if(event.key==='Enter')showR(${r.id})" onclick="showR(${r.id})"><div class="pic i${ic(r)}${isOpen(r)?"":" off"}">${!isOpen(r)?`<span class="bdg">Fechado · abre às ${hrs(r)[0]}h</span>`:r.b?`<span class="bdg${r.b=="Entrega grátis"?" g":""}">${r.b}</span>`:""}</div><div class="cb"><div class="avt">${r.n[0]}</div><div class="r1"><b>${r.n}</b><span class="rt">★ ${nt(r.r)}</span></div><div class="mute">${r.c} · ${r.v} avaliações</div><div class="r1 r2"><span class="mute">${r.t} · mín ${brl(mn(r))}</span>${r.f?`<b>${brl(r.f)}</b>`:`<span class="ok">Entrega grátis</span>`}</div></div></article>`;
// list = monta a lateral (categorias e filtros), aplica busca, categoria e filtros aos restaurantes
// e desenha os cartões; também ordena por nota ou tempo e mostra a contagem de resultados.
function list(){$("#sb").innerHTML=`<div class="box"><h3>Categorias</h3>${cats.map(([c,e])=>`<button class="si${c==cat?" on":""}" onclick="cat='${c}';list()">${e} ${c}</button>`).join("")}</div><div class="box"><h3>Filtros</h3>${F.map(([k,l,e])=>`<button class="si${fl==k?" on":""}" onclick="tg('${k}')">${e} ${l}</button>`).join("")}</div>`;$("#ct").innerHTML=cats.map(([c,e])=>`<button class="chip${c==cat?" on":""}" onclick="cat='${c}';list()">${e} ${c}</button>`).join("");$("#fl").innerHTML=F.map(([k,l])=>`<button class="chip${fl==k?" on":""}" onclick="tg('${k}')">${l}</button>`).join("");const k=nm(q.trim());const l=R.filter(r=>(cat=="Todos"||r.c==cat)&&(!k||nm(r.n+r.c+r.m.map(x=>x[0]).join(" ")).includes(k))&&(fl!="free"||!r.f)&&(fl!="open"||isOpen(r)));if(fl=="rate")l.sort((a,b)=>b.r-a.r);if(fl=="fast")l.sort((a,b)=>parseInt(a.t)-parseInt(b.t));$("#cn").textContent=`${l.length} ${l.length==1?"restaurante entregando":"restaurantes entregando"} agora`;$("#gr").innerHTML=l.length?l.map(card).join(""):`<p class="mute">Nenhum restaurante encontrado. Tente outro prato ou categoria.</p><button class="bo" onclick="q='';fl='';cat='Todos';$('#si').value='';list()">Limpar filtros</button>`;}

// menu = monta a página do restaurante: capa, informações, destaques e cardápio completo.
function menu(){const r=cur,ph=(i,c)=>`<div class="ph ${c} i${ic(r)}" style="background-position:${PS[i%3][0]};background-size:${PS[i%3][1]}">${btn(r,i)}</div>`;$("#app").innerHTML=`<div class="cv i${ic(r)}"><button class="bk" onclick="go()" aria-label="Voltar">←</button></div><section class="rc"><div class="lg big">${r.n[0]}</div><h1>${r.n}</h1><div class="mute">${r.d}</div><div class="inf">Entrega ${r.dl=="rest"?"feita pelo restaurante":"rastreável pela Esfomeado"} · ${km(r)} km · Mín ${brl(mn(r))}</div><div class="inf">⭐ ${nt(r.r)} (${r.v} avaliações) · ${r.c}</div><div class="inf">Padrão · ${r.t} · ${frete(r)}</div><div class="club">🧾 Preço claro: ${r.svc?"taxa de serviço de "+brl(r.svc):"sem taxa de serviço"} e sem taxa dinâmica. O frete aparece antes de você pedir.</div>${isOpen(r)?"":`<div class="club warn">⏰ Fechado agora, abre às ${hrs(r)[0]}h. Dá para ver o cardápio, mas não para pedir.</div>`}<h2>Destaques</h2><div class="hs">${r.m.slice(0,2).map((m,i)=>`<div class="dc">${ph(i,"")}<b class="price">${brl(m[1])}</b><div>${m[0]}</div></div>`).join("")}</div><h2>Cardápio</h2>${r.m.map((m,i)=>`<div class="item"><div class="grow"><b>${m[0]}</b><div class="mute">${m[3]}</div><b class="price">${brl(m[1])}</b></div>${ph(i,"sm")}</div>`).join("")}</section>`;}

// add = adiciona o item i do cardápio à sacola. Bloqueia se estiver fechado ou esgotado
// e, se a sacola for de outro restaurante, pergunta se quer trocar (só dá para pedir de um restaurante por vez).
function add(i,ok){if(!isOpen(cur)||OUT[cur.id+"-"+i])return;if(cart.rid&&cart.rid!==cur.id&&!ok){show(`<h2>Trocar de restaurante?</h2><p class="mute">Sua sacola tem itens de ${esc(rr().n)}. Só dá para pedir de um restaurante por vez. Esvaziar a sacola e começar este pedido?</p><button class="cta" onclick="closeCart();add(${i},1)">Sim, trocar</button><button class="cta sec" onclick="closeCart()">Manter minha sacola</button>`);return}
if(cart.rid!==cur.id)cart={rid:cur.id,items:{}};cart.items[i]=(cart.items[i]||0)+1;upd();toast("Adicionado à sacola");}

// chg = muda a quantidade do item i na sacola (d = +1 ou -1); remove o item se chegar a zero e esvazia a sacola se não sobrar nada.
function chg(i,d){cart.items[i]+=d;if(cart.items[i]<=0)delete cart.items[i];if(!cnt())cart={rid:null,items:{}};upd();sheet();}

// upd = atualiza a interface: contador do carrinho, endereço no topo e a barra fixa da sacola; também salva os dados.
function upd(){save();authUI();const n=cnt();$("#cc").textContent=n;$("#ad").textContent=addr||"Escolher endereço";const b=$("#bar");b.hidden=!n;b.innerHTML=n?`<span>🛒 ${n} ${n>1?"itens":"item"} · ${rr().n}</span><span>Ver sacola · ${brl(sub())}</span>`:"";}

// show = coloca o HTML recebido dentro do painel deslizante e abre o painel.
function show(h){shown=0;$("#sheet").innerHTML=h;$("#ov").hidden=false}

// openCart = abre o painel com o conteúdo da sacola.
function openCart(){shown=0;$("#ov").hidden=false;sheet()}

// closeCart = fecha o painel deslizante.
function closeCart(){shown=0;$("#ov").hidden=true}

// ---------- Conta: cadastro, login e sessão ----------
// normEmail = deixa o e-mail em minúsculas e sem espaços, para "Ana@x.com " e "ana@x.com" serem a mesma conta.
const normEmail=e=>e.trim().toLowerCase();
// okEmail = confere o formato do e-mail (algo@dominio.tld).
const okEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)&&e.length<=120;
// pwOk = regra de senha: no mínimo 8 caracteres, com pelo menos uma letra e um número.
const pwOk=p=>p.length>=8&&p.length<=64&&/[A-Za-z]/.test(p)&&/\d/.test(p);
// user = devolve a conta da pessoa logada (ou undefined se ninguém estiver logado).
const user=()=>users.find(u=>u.email==sess);
// b2h = converte bytes em texto hexadecimal; rndSalt = gera um "salt" aleatório de 16 bytes (único para cada conta).
const b2h=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const rndSalt=()=>b2h(crypto.getRandomValues(new Uint8Array(16)));
// hashPw = transforma a senha em um hash irreversível (PBKDF2 com SHA-256, 120 mil voltas e o salt da conta).
// A senha digitada nunca é guardada. Se o navegador não tiver crypto.subtle (página fora de https), usa um hash simples e mais fraco.
const hasSub=!!(window.crypto&&crypto.subtle);
async function hashPw(pw,salt,alg){alg=alg||(hasSub?"p":"f");
if(alg=="p"){if(!hasSub)return null;const enc=new TextEncoder(),k=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveBits"]);
return b2h(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:120000},k,256))}
let h=0x811c9dc5;const s=salt+pw;for(let r=0;r<2000;r++)for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
return(h>>>0).toString(16)}
// cred = gera salt + hash + algoritmo para guardar na conta. checkPw = confere a senha usando o algoritmo guardado na conta
// (contas antigas, sem algoritmo guardado, são testadas nos dois e atualizadas). Devolve "ok", "bad" ou "nocrypto".
async function cred(pw){const salt=rndSalt(),alg=hasSub?"p":"f";return{salt,alg,hash:await hashPw(pw,salt,alg)}}
async function checkPw(u,pw){const algs=u.alg?[u.alg]:["p","f"];let miss=0;
for(const a of algs){const h=await hashPw(pw,u.salt,a);if(h===null){miss++;continue}if(h===u.hash){if(!u.alg){u.alg=a;ls.set("users",users)}return"ok"}}
return miss==algs.length?"nocrypto":"bad"}
// aerr = mostra uma mensagem de erro dentro do formulário de login/cadastro.
const aerr=m=>{$("#aerr").textContent=m};
// authUI = atualiza o botão do topo: "Entrar" se ninguém está logado, ou "Olá, Nome" se estiver.
function authUI(){const u=user();$("#lg").textContent=u?"Olá, "+u.nome.split(" ")[0]:"Entrar"}
// login = chamada pelo botão do topo: abre a tela da conta se já está logado; senão, o formulário de entrar/criar conta.
function login(){user()?accountSheet():authSheet("in")}
// authSheet = desenha o formulário. t="in" mostra Entrar (e-mail e senha); t="up" mostra Criar conta (nome, e-mail, senha e confirmação).
function authSheet(t){const up=t=="up";
show(`<h2>${up?"Criar conta":"Entrar"}</h2><div class="tips"><button type="button" class="chip${up?"":" on"}" onclick="authSheet('in')">Entrar</button><button type="button" class="chip${up?" on":""}" onclick="authSheet('up')">Criar conta</button></div><form onsubmit="${up?"doSignup":"doLogin"}(event)" novalidate>${up?`<div class="cp"><input id="an" aria-label="Nome" placeholder="Seu nome" autocomplete="name" maxlength="60"></div>`:""}<div class="cp"><input id="em" type="email" aria-label="E-mail" placeholder="email@email.com.br" autocomplete="email" maxlength="120"></div><div class="cp"><input id="pw" type="password" aria-label="Senha" placeholder="${up?"Senha (mín. 8, com letra e número)":"Senha"}" autocomplete="${up?"new-password":"current-password"}" maxlength="64"></div>${up?`<div class="cp"><input id="pw2" type="password" aria-label="Confirmar senha" placeholder="Repita a senha" autocomplete="new-password" maxlength="64"></div>`:""}<label class="mute sm"><input type="checkbox" onchange="['#pw','#pw2'].forEach(s=>{const e=$(s);if(e)e.type=this.checked?'text':'password'})"> Mostrar senha</label><div id="aerr" class="warn" role="alert"></div><button class="cta" id="asub" type="submit">${up?"Criar conta":"Entrar"}</button></form><p class="mute sm">Entrar é opcional: você também pode pedir como convidado.</p><button type="button" class="bo" onclick="adminAuthSheet()">🔐 Acesso administrativo</button>`);
const f=$("#an")||$("#em");f&&f.focus()}
// doSignup = cria a conta: valida nome, e-mail, senha e confirmação, impede e-mail repetido,
// guarda só o hash da senha e já deixa a pessoa logada.
async function doSignup(ev){ev.preventDefault();
const nome=$("#an").value.trim().replace(/\s+/g," "),email=normEmail($("#em").value),pw=$("#pw").value,pw2=$("#pw2").value;
if(nome.length<2)return aerr("Digite seu nome (mínimo 2 letras).");
if(!okEmail(email))return aerr("Digite um e-mail válido.");
if(!pwOk(pw))return aerr("A senha precisa ter de 8 a 64 caracteres, com letras e números.");
if(pw!==pw2)return aerr("As senhas não conferem.");
if(ADMINS.some(a=>a[1]==email))return aerr("Este e-mail é reservado. Use outro.");
if(users.some(u=>u.email==email))return aerr("Já existe uma conta com esse e-mail. Tente entrar.");
const b=$("#asub");b.disabled=true;
try{const cr=await cred(pw);users.push({nome,email,...cr,criado:Date.now()});ls.set("users",users);sess=email;ls.set("sess",sess);closeCart();upd();toast("Conta criada! Bem-vindo(a), "+nome.split(" ")[0])}
catch(e){aerr("Não foi possível criar a conta. Tente novamente.");b.disabled=false}}
// doLogin = entra na conta: confere e-mail e senha comparando o hash. A mensagem de erro é a mesma para
// "e-mail não existe" e "senha errada" (não revela quais e-mails têm conta) e, após 5 erros seguidos, bloqueia por 30 segundos.
async function doLogin(ev){ev.preventDefault();await tryLogin(false)}
async function doAdminLogin(ev){ev.preventDefault();await tryLogin(true)}
async function tryLogin(onlyAdm){await ready;
const wait=Math.ceil((lockUntil-Date.now())/1000);
if(wait>0)return aerr("Muitas tentativas. Aguarde "+wait+"s.");
const email=normEmail($("#em").value),pw=$("#pw").value;
if(!okEmail(email)||!pw)return aerr("Informe e-mail e senha.");
const b=$("#asub");b.disabled=true;
try{const u=users.find(x=>x.email==email&&(!onlyAdm||x.role=="admin"));
const r=u?await checkPw(u,pw):(await hashPw(pw,"0".repeat(32)),"bad");
if(r=="nocrypto")aerr("Este navegador não consegue verificar a senha neste endereço. Abra o site por https:// ou localhost.");
else if(r=="ok"){fails=0;sess=email;ls.set("sess",sess);closeCart();upd();toast("Bem-vindo(a) de volta, "+u.nome.split(" ")[0]);if(u.role=="admin"||u.role=="rest")adminOpen();return}
else if(++fails>=5){fails=0;lockUntil=Date.now()+30000;aerr("Muitas tentativas. Aguarde 30s.")}
else aerr(onlyAdm?"Credenciais de administrador inválidas.":"E-mail ou senha incorretos.")}
catch(e){aerr("Não foi possível entrar. Tente novamente.")}
b.disabled=false}
// accountSheet = tela da conta logada: mostra nome e e-mail, atalho para os pedidos e o botão de sair.
function accountSheet(){const u=user();if(!u)return authSheet("in");
show(`<h2>Olá, ${esc(u.nome.split(" ")[0])}!</h2><div class="mute">${esc(u.nome)} · ${esc(u.email)}${u.cargo?" · "+esc(u.cargo):""}</div>${u.role=="admin"||u.role=="rest"?`<button class="cta" onclick="closeCart();adminOpen()">${u.role=="rest"?"🏪 Painel do restaurante":"⚙️ Painel administrativo"}</button>`:""}<button class="cta sec" onclick="ordersSheet()">Meus pedidos</button><button class="cta sec" onclick="logout()">Sair da conta</button>`)}
// logout = encerra a sessão (a conta continua cadastrada; só a pessoa deixa de estar logada).
function logout(){sess="";ls.set("sess","");closeCart();upd();toast("Você saiu da conta")}

// addrSheet = abre o painel para informar o endereço de entrega e confirma o que foi digitado.
function addrSheet(){show(`<h2>Onde vamos entregar?</h2><div class="cp"><input id="ai" value="${esc(addr)}" placeholder="Rua, número, bairro" autocomplete="street-address"></div><button class="cta" onclick="addr=$('#ai').value||addr;upd();closeCart()">Confirmar endereço</button>`)}

// cup = valida o cupom digitado: ESFOMEADO10 dá 10% de desconto (máx. R$ 15) em pedidos a partir de R$ 30.
function cup(){const v=$("#cp").value.trim().toUpperCase();if(v=="ESFOMEADO10"){coupon=true;toast(sub()<30?"Cupom guardado: vale a partir de R$ 30,00":"Cupom aplicado: 10% de desconto")}
else if(v)toast("Cupom inválido. Confira o código");sheet();}

// sheet = desenha o conteúdo da sacola: itens com + e -, pedido mínimo, observações, cupom, gorjeta,
// subtotal, desconto, frete, total, forma de pagamento e o botão "Finalizar pedido".
function sheet(){const s=$("#sheet");if(!cnt()){s.innerHTML=`<h2>Sua sacola</h2><p class="mute">Está vazia. Escolha um restaurante e monte seu pedido.</p><button class="cta" onclick="closeCart();go()">Ver restaurantes</button>`;return}
const r=rr(),sb=sub(),mi=mn(r),falta=mi-sb,open=isOpen(r),d=coupon&&sb>=30?Math.min(sb*.1,15):0,tot=sb-d+r.f+(r.svc||0)+tip;s.innerHTML=`<h2>Sua sacola</h2><div class="mute">${esc(r.n)} · 📍 ${esc(addr)||"Escolher endereço"}</div>${Object.entries(cart.items).map(([i,n])=>`<div class="line"><span>${r.m[i][2]} ${r.m[i][0]}</span><span class="qty"><button aria-label="Remover um ${r.m[i][0]}" onclick="chg(${i},-1)">−</button>${n}<button aria-label="Adicionar mais um ${r.m[i][0]}" onclick="chg(${i},1)">+</button></span><b>${brl(r.m[i][1]*n)}</b></div>`).join("")}${open?"":`<div class="warn">${esc(r.n)} está fechado agora (abre às ${hrs(r)[0]}h).</div>`}${falta>0?`<div class="warn">Faltam ${brl(falta)} para o pedido mínimo de ${brl(mi)}.</div><div class="prog"><i style="width:${Math.max(5,sb/mi*100)}%"></i></div>`:""}<textarea id="obs" rows="2" maxlength="200" aria-label="Observações do pedido" placeholder="Observações (ex.: sem cebola, alergia a amendoim)" oninput="note=this.value">${esc(note)}</textarea>${coupon?`<div class="row ok"><span>Cupom ESFOMEADO10 aplicado</span><button class="bo" onclick="coupon=false;sheet()">Remover</button></div>`:`<div class="cp"><input id="cp" aria-label="Cupom" placeholder="Cupom (tente ESFOMEADO10)"><button onclick="cup()">Aplicar</button></div>`}<div class="mute sm">ESFOMEADO10: 10% de desconto, máx. R$ 15, em pedidos a partir de R$ 30.</div>${coupon&&sb<30?`<div class="warn">O cupom precisa de um pedido a partir de R$ 30,00.</div>`:""}<div class="mute" style="margin-top:10px">Gorjeta para o entregador (opcional, 100% dele)</div><div class="tips">${[0,2,5,8].map(v=>`<button class="chip${tip==v?" on":""}" onclick="tip=${v};sheet()">${v?brl(v):"Sem gorjeta"}</button>`).join("")}</div><div class="row"><span>Subtotal</span><span>${brl(sb)}</span></div>${d?`<div class="row ok"><span>Desconto</span><span>− ${brl(d)}</span></div>`:""}<div class="row"><span>Entrega</span><span>${r.f?brl(r.f):"Grátis"}</span></div><div class="row"><span>Taxa de serviço</span><span>${r.svc?brl(r.svc):'<span class="ok">Não cobramos</span>'}</span></div>${tip?`<div class="row"><span>Gorjeta</span><span>${brl(tip)}</span></div>`:""}<div class="row tot"><span>Total</span><span>${brl(tot)}</span></div><label class="mute" for="pay">Pagamento</label><select id="pay" onchange="pay=this.value;sheet()">${["Pix","Cartão de crédito","Dinheiro na entrega"].map(p=>`<option${p==pay?" selected":""}>${p}</option>`).join("")}</select>${pay=="Dinheiro na entrega"?`<div class="cp"><input aria-label="Troco" inputmode="decimal" placeholder="Troco para quanto? (opcional)" value="${esc(troco)}" oninput="troco=this.value"></div>`:""}<div class="mute sm">Você pode cancelar sem custo até o restaurante começar a preparar. Reembolso imediato.</div><button class="cta" ${falta>0||!open?"disabled":""} onclick="finish()">Finalizar pedido · ${brl(tot)}</button>`;}

// STP e ICN = etapas do pedido (recebido, preparando, saiu para entrega, entregue) e os emojis de cada etapa.
const STP=["Pedido recebido","Preparando com carinho","Saiu para entrega","Entregue. Bom apetite!"],ICN=["✅","👨‍🍳","🛵","🎉"];
// finish = finaliza o pedido: confere endereço, horário e pedido mínimo, calcula o total,
// cria o pedido no histórico, esvazia a sacola e inicia o rastreio simulado.
function finish(){if(!addr){addrSheet();toast("Informe o endereço de entrega");return}
const r=rr(),sb=sub();if(!r||!isOpen(r)||sb<mn(r))return;const d=coupon&&sb>=30?Math.min(sb*.1,15):0,tot=sb-d+r.f+(r.svc||0)+tip;const o={num:Math.floor(1000+Math.random()*9000),rid:r.id,rn:r.n,items:{...cart.items},tot,k:0,st:"Pedido recebido",obs:note,dt:new Date().toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"})};orders.unshift(o);orders=orders.slice(0,20);cart={rid:null,items:{}};coupon=false;note="";tip=0;troco="";upd();tview(o);setTimeout(()=>track(o.num,1),4000);}

// track = simula o andamento do pedido: a cada 4 segundos avança para a próxima etapa e salva; para se o pedido foi cancelado.
function track(num,k){const o=orders.find(x=>x.num==num);if(!o||o.st=="Cancelado")return;o.k=k;o.st=k<3?STP[k]:"Entregue";save();if(shown==num&&!$("#ov").hidden)tview(o);if(k<3)setTimeout(()=>track(num,k+1),4000);}

// tview = mostra a tela de rastreio do pedido (etapas, previsão, avaliação com estrelas, cancelar e ajuda).
function tview(o){const r=R.find(x=>x.id==o.rid),k=o.k,mx=parseInt(r.t.split("–")[1])+10;show(`<h2>Pedido #${o.num}</h2><div class="mute">${esc(r.n)} · previsão ${r.t}. Passou de ${mx} min? Você ganha R$ 10 de crédito automático.</div><ol class="trk">${STP.map((x,j)=>`<li class="${j<=k?"done":""}">${ICN[j]} ${x}</li>`).join("")}</ol>${k==3?`<div class="mute">Como foi? <span class="stars">${[1,2,3,4,5].map(n=>`<button aria-label="${n} estrelas" onclick="toast('Obrigado! Você deu ${n} estrelas')">★</button>`).join("")}</span></div>`:""}${k<2?`<button class="cta sec" onclick="cancelOrder(${o.num})">Cancelar sem custo</button>`:""}<button class="cta sec" onclick="help(${o.num})">Preciso de ajuda</button><button class="cta" onclick="closeCart();go()">Voltar ao início</button>`);shown=o.num;}

// cancelOrder = cancela o pedido sem custo (só até antes de sair para entrega) e mostra a confirmação.
function cancelOrder(num){const o=orders.find(x=>x.num==num);if(!o||o.k>=2)return;o.st="Cancelado";save();show(`<h2>Pedido #${num} cancelado</h2><p class="mute">Sem custo. O reembolso volta na hora para a mesma forma de pagamento.</p><button class="cta" onclick="closeCart()">Ok</button>`);}

// help = abre as opções de ajuda sobre o pedido (atraso, item errado, cobrança, outro).
function help(num){show(`<h2>Ajuda com o pedido #${num}</h2><p class="mute">Escolha o problema. Você fala direto com uma pessoa, sem menu de robô.</p>${["Pedido atrasado","Item faltando ou errado","Cobrança diferente do combinado","Outro problema"].map(t=>`<button class="si" onclick="toast('Atendente chamado: ${t}')">💬 ${t}</button>`).join("")}<button class="cta sec" onclick="tview(orders.find(x=>x.num==${num}))">Voltar</button>`);}

// ordersSheet = lista o histórico de pedidos (os últimos 20) com o botão "Pedir de novo".
function ordersSheet(){show(`<h2>Meus pedidos</h2>${orders.length?orders.map((o,j)=>`<div class="line"><span><b>#${o.num} · ${esc(o.rn)}</b><br><span class="mute">${o.dt} · ${brl(o.tot)} · ${o.st}</span></span><button class="bo" onclick="reorder(${j})">Pedir de novo</button></div>`).join(""):'<p class="mute">Você ainda não fez pedidos.</p>'}<button class="cta sec" onclick="closeCart()">Fechar</button>`);}

// reorder = refaz um pedido antigo: copia os itens para a sacola, ignorando os esgotados, e abre a sacola.
function reorder(j){const o=orders[j],r=R.find(x=>x.id==o.rid);if(!isOpen(r)){toast(r.n+" está fechado agora");return}
const it=Object.fromEntries(Object.entries(o.items).filter(([i])=>r.m[i]&&!OUT[o.rid+"-"+i]));if(!Object.keys(it).length){toast("Os itens deste pedido estão esgotados");return}
cart={rid:o.rid,items:it};upd();openCart();}

// Ao carregar a página: retoma o rastreio de pedidos que ainda estavam em andamento e desenha a tela inicial.
orders.forEach(o=>{if(o.k<3&&o.st!="Cancelado")track(o.num,o.k)});draw();

// ---------- Tema claro/escuro ----------
// thRoot = elemento <html>; thMq = preferência de tema do sistema; thEff = tema em uso agora.
const thRoot=document.documentElement,thMq=matchMedia("(prefers-color-scheme:dark)"),thEff=()=>thRoot.dataset.theme||(thMq.matches?"dark":"light");

// thIcon = atualiza o ícone (sol ou lua) e o texto do botão de tema.
function thIcon(){const b=$("#th"),d=thEff()=="dark",t=d?"Mudar para modo claro":"Mudar para modo escuro";b.textContent=d?"☀️":"🌙";b.setAttribute("aria-label",t);b.title=t}

// setTheme = alterna entre claro e escuro, com animação suave, e salva a escolha.
let thT;function setTheme(){const n=thEff()=="dark"?"light":"dark";thRoot.classList.add("tt");thRoot.dataset.theme=n;ls.set("theme",n);thIcon();clearTimeout(thT);thT=setTimeout(()=>thRoot.classList.remove("tt"),600)}

// Se o tema do sistema mudar, atualiza o ícone do botão.
thMq.addEventListener("change",thIcon);thIcon();

// ---------- Painel administrativo ----------
// isAdm = diz se a pessoa logada é administradora. CARGOS = opções de cargo dos funcionários.
const isAdm=()=>{const u=user();return !!u&&u.role=="admin"};
const CARGOS=["Gerente","Atendente","Cozinheiro(a)","Entregador(a)","Caixa"];
// cl = limpa texto digitado pelo admin (tira <, > e aspas e troca & por "e"), para não quebrar o HTML das telas.
const cl=t=>String(t).replace(/[<>"]/g,"").replace(/&/g," e ").replace(/\s+/g," ").trim();
// ADMINS = contas administradoras padrão [nome, e-mail, senha inicial]. TROQUE AS SENHAS no painel (aba Administradores).
// seedAdmin = cria/conserta essas contas. Contas com seedv antigo (ou quebradas) são refeitas UMA vez; depois disso a senha
// que você trocar no painel é respeitada. "ready" é a promessa que o login espera antes de conferir a senha.
const ADMINS=[["Administrador","admin@esfomeado.com","Admin@123"],["Gestor Esfomeado","gestor@esfomeado.com","Esfomeado@2026"]],SEED_V=2;
async function seedAdmin(){try{let ch=false;
for(const[nome,email,pw]of ADMINS){const i=users.findIndex(u=>u.email==email),o=users[i];
if(o&&o.role=="admin"&&o.seedv>=SEED_V)continue;
const nu={nome,email,...await cred(pw),criado:(o&&o.criado)||Date.now(),role:"admin",seedv:SEED_V};
if(i>=0)users[i]=nu;else users.push(nu);ch=true}
if(ch)ls.set("users",users)}catch(e){}}
// adminOpen = abre o painel (só para admin). admTabSet = troca entre as abas Restaurantes e Funcionários.
// adminLogin = abre direto o painel se já é admin; senão mostra a tela de login administrativo. Também abre com o endereço terminando em #admin.
function adminLogin(){if(isAdm()){adminOpen();return}adminAuthSheet()}
function adminAuthSheet(){show(`<h2>🔐 Acesso administrativo</h2><p class="mute sm">Área restrita à equipe do Esfomeado.</p><form onsubmit="doAdminLogin(event)" novalidate><div class="cp"><input id="em" type="email" aria-label="E-mail do administrador" placeholder="E-mail do administrador" autocomplete="username" maxlength="120"></div><div class="cp"><input id="pw" type="password" aria-label="Senha" placeholder="Senha" autocomplete="current-password" maxlength="64"></div><label class="mute sm"><input type="checkbox" onchange="$('#pw').type=this.checked?'text':'password'"> Mostrar senha</label><div id="aerr" class="warn" role="alert"></div><button class="cta" id="asub" type="submit">Entrar no painel</button></form><button class="cta sec" type="button" onclick="authSheet('in')">← Voltar ao login normal</button>`);$("#em").focus()}
function adminOpen(){if(!isAdm()&&!isRest()){toast("Acesso restrito a administradores");return}adm=true;cur=null;draw();scrollTo(0,0)}
function admTabSet(t){admTab=t;admin()}
// admin = desenha o painel com as duas abas.
function admin(){if(isRest())return restPanel();if(!isAdm()){adm=false;go();return}
const rs=R.filter(r=>r.id>8),fs=users.filter(u=>u.role=="func");
$("#app").innerHTML=`<div class="adm"><button class="bo" onclick="go()">← Voltar ao app</button><h1>⚙️ Painel administrativo</h1><div class="tips"><button class="chip${admTab=="r"?" on":""}" onclick="admTabSet('r')">🍽️ Restaurantes (${rs.length})</button><button class="chip${admTab=="f"?" on":""}" onclick="admTabSet('f')">👥 Funcionários (${fs.length})</button><button class="chip${admTab=="l"?" on":""}" onclick="admTabSet('l')">🔑 Logins de restaurante</button><button class="chip${admTab=="a"?" on":""}" onclick="admTabSet('a')">🛡️ Administradores</button></div>${admTab=="r"?admRest(rs):admTab=="f"?admFunc(fs):admTab=="a"?admAdmins():admLogins()}</div>`}
// admItem = uma linha de item do cardápio (prato, preço, emoji, descrição).
const admItem=()=>`<div class="cp mi"><input class="xn" placeholder="Prato" aria-label="Nome do prato" maxlength="40"><input class="xp" type="number" min="0" step="0.01" placeholder="Preço R$" aria-label="Preço"><input class="xe" placeholder="🍔" aria-label="Emoji" maxlength="4"><input class="xd" placeholder="Descrição do prato" aria-label="Descrição do prato" maxlength="80"></div>`;
// admRest = formulário de novo restaurante + lista dos que o admin já cadastrou.
const admRest=rs=>`<form class="box af" onsubmit="addRest(event)" novalidate><h3>Novo restaurante</h3><input id="rn" aria-label="Nome" placeholder="Nome do restaurante" maxlength="40"><select id="rc" aria-label="Categoria">${cats.slice(1).map(([c])=>`<option>${c}</option>`).join("")}</select><input id="rd" aria-label="Descrição" placeholder="Descrição curta" maxlength="80"><div class="cp"><input id="rt" type="number" min="5" placeholder="Tempo mín (min)" aria-label="Tempo mínimo"><input id="rt2" type="number" min="5" placeholder="Tempo máx (min)" aria-label="Tempo máximo"></div><div class="cp"><input id="rf" type="number" min="0" step="0.01" placeholder="Frete R$ (0 = grátis)" aria-label="Frete"><input id="rm" type="number" min="0" step="0.01" placeholder="Pedido mín R$" aria-label="Pedido mínimo"></div><div class="cp"><input id="ra" type="number" min="0" max="23" value="10" aria-label="Abre às (hora)"><input id="rz" type="number" min="1" max="24" value="23" aria-label="Fecha às (hora)"></div><select id="rimg" aria-label="Foto">${R.filter(r=>r.id<=8).map(r=>`<option value="${r.id}">Foto: ${r.n}</option>`).join("")}</select><h3>Cardápio</h3><div id="mi">${admItem()}</div><button type="button" class="bo" onclick="$('#mi').insertAdjacentHTML('beforeend',admItem())">+ Adicionar item</button><div id="aerr" class="warn" role="alert"></div><button class="cta" type="submit">Cadastrar restaurante</button></form><div class="box"><h3>Cadastrados por você</h3>${rs.length?rs.map(r=>`<div class="line"><span><b>${r.n}</b><br><span class="mute">${r.c} · ${r.m.length} itens · ${hrs(r)[0]}h–${hrs(r)[1]}h</span></span><button class="bo" onclick="delRest(${r.id})">Excluir</button></div>`).join(""):'<p class="mute">Nenhum ainda. Os 8 restaurantes de exemplo não podem ser excluídos.</p>'}</div>`;
// addRest = valida o formulário, cria o restaurante, grava no localStorage e atualiza as telas.
function addRest(ev){ev.preventDefault();if(!isAdm())return;
const v=s=>$(s).value.trim(),n=cl(v("#rn"));
const m=[...document.querySelectorAll(".mi")].map(e=>[cl(e.querySelector(".xn").value),parseFloat(e.querySelector(".xp").value),cl(e.querySelector(".xe").value)||"🍽️",cl(e.querySelector(".xd").value)||"Delícia da casa"]).filter(x=>x[0]||x[1]);
const t1=parseInt(v("#rt"))||30,t2=parseInt(v("#rt2"))||t1+15,a=parseInt(v("#ra")),z=parseInt(v("#rz")),f=parseFloat(v("#rf"))||0,mi=parseFloat(v("#rm"))||20;
if(n.length<2)return aerr("Informe o nome do restaurante.");
if(R.some(r=>nm(r.n)==nm(n)))return aerr("Já existe um restaurante com esse nome.");
if(t2<t1)return aerr("O tempo máximo não pode ser menor que o mínimo.");
if(!(a>=0&&z<=24&&a<z))return aerr("Horário inválido: a abertura precisa ser antes do fechamento.");
if(!m.length)return aerr("Adicione pelo menos um item ao cardápio.");
if(m.some(x=>!x[0]||!isFinite(x[1])||x[1]<=0))return aerr("Todo item precisa de nome e de preço maior que zero.");
R.push({id:Math.max(...R.map(x=>x.id))+1,n,c:v("#rc"),r:4.5,v:0,t:t1+"–"+t2+" min",f,b:"Novo",d:cl(v("#rd"))||"Novo no Esfomeado",m,img:+v("#rimg"),h:[a,z],mn:mi});
persistR();admin();toast("Restaurante cadastrado")}
// delRest = exclui um restaurante criado pelo admin (e esvazia a sacola se ela era dele).
function delRest(id){if(!isAdm()||id<=8||!confirm("Excluir este restaurante?"))return;R.splice(R.findIndex(r=>r.id==id),1);if(cart.rid==id)cart={rid:null,items:{}};users=users.filter(u=>!(u.role=="rest"&&u.rid==id));ls.set("users",users);persistR();upd();admin();toast("Restaurante excluído")}
// admFunc = formulário de novo funcionário + lista da equipe.
const admFunc=fs=>`<form class="box af" onsubmit="addFunc(event)" novalidate><h3>Novo funcionário</h3><input id="fn" aria-label="Nome" placeholder="Nome completo" maxlength="60" autocomplete="off"><input id="fe" type="email" aria-label="E-mail" placeholder="email@email.com.br" maxlength="120" autocomplete="off"><input id="fp" type="text" aria-label="Senha provisória" placeholder="Senha provisória (mín. 8, com letra e número)" maxlength="64" autocomplete="off"><select id="fc" aria-label="Cargo">${CARGOS.map(c=>`<option>${c}</option>`).join("")}</select><select id="fr" aria-label="Restaurante"><option value="0">Todos os restaurantes</option>${R.map(r=>`<option value="${r.id}">${r.n}</option>`).join("")}</select><div id="aerr" class="warn" role="alert"></div><button class="cta" type="submit">Cadastrar funcionário</button></form><div class="box"><h3>Equipe</h3>${fs.length?fs.map(u=>{const r=R.find(x=>x.id==u.rid);return`<div class="line"><span><b>${esc(u.nome)}</b><br><span class="mute">${esc(u.cargo)} · ${r?r.n:"Todos"} · ${esc(u.email)}</span></span><button class="bo" onclick="delFunc(${users.indexOf(u)})">Remover</button></div>`}).join(""):'<p class="mute">Nenhum funcionário cadastrado.</p>'}</div>`;
// addFunc = cria a conta do funcionário (cargo + restaurante). Ele entra pelo mesmo login, com a senha provisória.
async function addFunc(ev){ev.preventDefault();if(!isAdm())return;
const nome=cl($("#fn").value),email=normEmail($("#fe").value),pw=$("#fp").value;
if(nome.length<2)return aerr("Digite o nome do funcionário.");
if(!okEmail(email))return aerr("Digite um e-mail válido.");
if(!pwOk(pw))return aerr("A senha precisa ter de 8 a 64 caracteres, com letras e números.");
if(users.some(u=>u.email==email))return aerr("Já existe uma conta com esse e-mail.");
try{const cr=await cred(pw);users.push({nome,email,...cr,criado:Date.now(),role:"func",cargo:$("#fc").value,rid:+$("#fr").value});ls.set("users",users);admin();toast("Funcionário cadastrado")}
catch(e){aerr("Não foi possível cadastrar. Tente novamente.")}}
// delFunc = remove um funcionário (só contas com cargo de funcionário; nunca o admin).
function delFunc(i){const u=users[i];if(!isAdm()||!u||(u.role!="func"&&u.role!="rest")||!confirm("Remover "+u.nome+"?"))return;users.splice(i,1);ls.set("users",users);admin();toast("Funcionário removido")}
const ready=seedAdmin();

// ---------- Login e painel do restaurante ----------
// isRest = a pessoa logada é de um restaurante (conta com role "rest" ligada a um restaurante existente). myR = o restaurante dela.
const isRest=()=>{const u=user();return !!u&&u.role=="rest"&&!!R.find(r=>r.id==u.rid)};
const myR=()=>R.find(r=>r.id==user().rid);
// persistR = grava no navegador os restaurantes criados pelo admin e as alterações (cardápio, frete, taxa, entrega) dos 8 de exemplo.
function persistR(){ls.set("rests",R.filter(x=>x.id>8));ls.set("ovr",Object.fromEntries(R.filter(x=>x.id<=8).map(x=>[x.id,{m:x.m,svc:x.svc,dl:x.dl,f:x.f,mn:x.mn}])))}
// admLogins = aba do admin para criar e listar logins de restaurante.
const admLogins=()=>{const rl=users.filter(u=>u.role=="rest");return`<form class="box af" onsubmit="addRestLogin(event)" novalidate><h3>Novo login de restaurante</h3><select id="lr" aria-label="Restaurante">${R.map(r=>`<option value="${r.id}">${r.n}</option>`).join("")}</select><input id="le" type="email" aria-label="E-mail" placeholder="email do restaurante" maxlength="120" autocomplete="off"><input id="lp" type="text" aria-label="Senha provisória" placeholder="Senha provisória (mín. 8, com letra e número)" maxlength="64" autocomplete="off"><div id="aerr" class="warn" role="alert"></div><button class="cta" type="submit">Criar login</button></form><div class="box"><h3>Logins de restaurante</h3>${rl.length?rl.map(u=>`<div class="line"><span><b>${esc(u.nome)}</b><br><span class="mute">${esc(u.email)}</span></span><button class="bo" onclick="delFunc(${users.indexOf(u)})">Remover</button></div>`).join(""):'<p class="mute">Nenhum login de restaurante ainda.</p>'}</div>`};
// addRestLogin = cria a conta do restaurante (o dono entra pelo mesmo botão "Entrar" e cai direto no painel dele).
async function addRestLogin(ev){ev.preventDefault();if(!isAdm())return;
const r=R.find(x=>x.id==$("#lr").value),email=normEmail($("#le").value),pw=$("#lp").value;
if(!r)return aerr("Escolha o restaurante.");
if(!okEmail(email))return aerr("Digite um e-mail válido.");
if(!pwOk(pw))return aerr("A senha precisa ter de 8 a 64 caracteres, com letras e números.");
if(users.some(u=>u.email==email))return aerr("Já existe uma conta com esse e-mail.");
try{const cr=await cred(pw);users.push({nome:r.n,email,...cr,criado:Date.now(),role:"rest",cargo:"Restaurante",rid:r.id});ls.set("users",users);admin();toast("Login criado para "+r.n)}
catch(e){aerr("Não foi possível criar o login. Tente novamente.")}}
// restPanel = painel do restaurante: entrega e taxas, novo prato e lista do cardápio (esgotar / excluir).
function restPanel(){const r=myR();
$("#app").innerHTML=`<div class="adm"><button class="bo" onclick="go()">← Voltar ao app</button><h1>🏪 ${r.n}</h1><p class="mute">Painel do restaurante · ${isOpen(r)?"aberto agora":"fechado agora"} (${hrs(r)[0]}h–${hrs(r)[1]}h)</p><form class="box af" onsubmit="saveRestCfg(event)" novalidate><h3>Entrega e taxas</h3><label class="mute sm" for="xdl">Quem faz a entrega?</label><select id="xdl"><option value="esf"${r.dl=="rest"?"":" selected"}>Esfomeado (entregador da plataforma)</option><option value="rest"${r.dl=="rest"?" selected":""}>Restaurante (entrega própria)</option></select><label class="mute sm" for="xf">Frete cobrado do cliente (R$, 0 = grátis)</label><input id="xf" type="number" min="0" step="0.01" value="${r.f}"><label class="mute sm" for="xs">Taxa de serviço (R$, 0 = não cobrar)</label><input id="xs" type="number" min="0" step="0.01" value="${r.svc||0}"><label class="mute sm" for="xm">Pedido mínimo (R$)</label><input id="xm" type="number" min="0" step="0.01" value="${mn(r)}"><div id="aerr" class="warn" role="alert"></div><button class="cta" type="submit">Salvar configurações</button></form><form class="box af" onsubmit="addDish(event)" novalidate><h3>Adicionar prato</h3>${admItem()}<button class="cta" type="submit">Adicionar prato</button></form><div class="box"><h3>Cardápio (${r.m.length})</h3>${r.m.map((m,i)=>{const o=OUT[r.id+"-"+i];return`<div class="line"><span><b>${m[2]} ${m[0]}</b>${o?' · <span class="warn">esgotado</span>':""}<br><span class="mute">${brl(m[1])} · ${m[3]}</span></span><span class="acts"><button class="bo" onclick="toggleOut(${i})">${o?"Disponibilizar":"Esgotar"}</button><button class="bo" onclick="delDish(${i})">Excluir</button></span></div>`}).join("")}</div></div>`}
// saveRestCfg = salva quem entrega, frete, taxa de serviço e pedido mínimo.
function saveRestCfg(ev){ev.preventDefault();if(!isRest())return;const r=myR(),f=parseFloat($("#xf").value),s=parseFloat($("#xs").value),m=parseFloat($("#xm").value);
if(!(f>=0&&s>=0&&m>=0))return aerr("Informe valores válidos (zero ou maior).");
r.dl=$("#xdl").value;r.f=f;r.svc=s;r.mn=m;persistR();upd();restPanel();toast("Configurações salvas")}
// addDish = adiciona um prato ao cardápio do restaurante.
function addDish(ev){ev.preventDefault();if(!isRest())return;const r=myR(),e=document.querySelector(".mi"),n=cl(e.querySelector(".xn").value),p=parseFloat(e.querySelector(".xp").value);
if(!n)return toast("Informe o nome do prato");if(!(p>0))return toast("Informe um preço maior que zero");
r.m.push([n,p,cl(e.querySelector(".xe").value)||"🍽️",cl(e.querySelector(".xd").value)||"Delícia da casa"]);persistR();restPanel();toast("Prato adicionado")}
// toggleOut = marca ou desmarca um prato como esgotado.
function toggleOut(i){if(!isRest())return;const k=myR().id+"-"+i;if(OUT[k])delete OUT[k];else OUT[k]=1;ls.set("out",OUT);restPanel()}
// delDish = exclui um prato, reorganiza os "esgotados" e esvazia a sacola se ela era deste restaurante (os itens dela usam o número do prato).
function delDish(i){if(!isRest())return;const r=myR();if(r.m.length<2)return toast("O cardápio precisa ter pelo menos um prato");if(!confirm("Excluir "+r.m[i][0]+"?"))return;
r.m.splice(i,1);const n={};for(const[k,v]of Object.entries(OUT)){const[a,b]=k.split("-").map(Number);if(a!=r.id||b<i)n[k]=v;else if(b>i)n[a+"-"+(b-1)]=v}
Object.keys(OUT).forEach(k=>delete OUT[k]);Object.assign(OUT,n);ls.set("out",OUT);if(cart.rid==r.id)cart={rid:null,items:{}};persistR();upd();restPanel();toast("Prato excluído")}

// ---------- Administradores: criar outro admin, trocar a própria senha, remover ----------
// admAdmins = aba com formulário de novo admin, troca de senha e a lista de administradores.
const admAdmins=()=>{const al=users.filter(u=>u.role=="admin");return`<form class="box af" onsubmit="addAdmin(event)" novalidate><h3>Novo administrador</h3><input id="an2" aria-label="Nome" placeholder="Nome" maxlength="60" autocomplete="off"><input id="ae" type="email" aria-label="E-mail" placeholder="email do administrador" maxlength="120" autocomplete="off"><input id="ap" type="text" aria-label="Senha provisória" placeholder="Senha provisória (mín. 8, com letra e número)" maxlength="64" autocomplete="off"><div id="aerr" class="warn" role="alert"></div><button class="cta" type="submit">Criar administrador</button></form><form class="box af" onsubmit="chgPw(event)" novalidate><h3>Trocar minha senha</h3><input id="po" type="password" aria-label="Senha atual" placeholder="Senha atual" autocomplete="current-password" maxlength="64"><input id="pn" type="password" aria-label="Nova senha" placeholder="Nova senha (mín. 8, com letra e número)" autocomplete="new-password" maxlength="64"><div id="aerr2" class="warn" role="alert"></div><button class="cta" type="submit">Salvar nova senha</button></form><div class="box"><h3>Administradores</h3>${al.map(u=>`<div class="line"><span><b>${esc(u.nome)}</b><br><span class="mute">${esc(u.email)}</span></span>${u.email==sess?'<span class="mute sm">você</span>':`<button class="bo" onclick="delAdm(${users.indexOf(u)})">Remover</button>`}</div>`).join("")}</div>`};
// addAdmin = cria outra conta de administrador.
async function addAdmin(ev){ev.preventDefault();if(!isAdm())return;
const nome=cl($("#an2").value),email=normEmail($("#ae").value),pw=$("#ap").value;
if(nome.length<2)return aerr("Digite o nome do administrador.");
if(!okEmail(email))return aerr("Digite um e-mail válido.");
if(!pwOk(pw))return aerr("A senha precisa ter de 8 a 64 caracteres, com letras e números.");
if(users.some(u=>u.email==email))return aerr("Já existe uma conta com esse e-mail.");
try{const cr=await cred(pw);users.push({nome,email,...cr,criado:Date.now(),role:"admin",seedv:SEED_V});ls.set("users",users);admin();toast("Administrador criado")}
catch(e){aerr("Não foi possível criar. Tente novamente.")}}
// chgPw = troca a senha do admin logado (pede a senha atual).
async function chgPw(ev){ev.preventDefault();if(!isAdm())return;const e2=m=>{$("#aerr2").textContent=m},u=user(),po=$("#po").value,pn=$("#pn").value;
if(!po)return e2("Digite a senha atual.");
if(!pwOk(pn))return e2("A nova senha precisa ter de 8 a 64 caracteres, com letras e números.");
if(po===pn)return e2("A nova senha precisa ser diferente da atual.");
try{if(await checkPw(u,po)!="ok")return e2("Senha atual incorreta.");Object.assign(u,await cred(pn));ls.set("users",users);admin();admTab="a";toast("Senha alterada")}
catch(e){e2("Não foi possível trocar a senha.")}}
// delAdm = remove outro administrador (nunca você mesmo, o último admin ou as contas padrão).
function delAdm(i){const u=users[i];if(!isAdm()||!u||u.role!="admin"||u.email==sess)return;
if(ADMINS.some(a=>a[1]==u.email))return toast("As contas padrão não podem ser removidas");
if(!confirm("Remover o administrador "+u.nome+"?"))return;users.splice(i,1);ls.set("users",users);admin();toast("Administrador removido")}
// Atalho: abrir o site com #admin no final do endereço mostra o login administrativo.
const chkHash=()=>{if(location.hash=="#admin"){try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}adminLogin()}};
addEventListener("hashchange",chkHash);ready.then(chkHash);
