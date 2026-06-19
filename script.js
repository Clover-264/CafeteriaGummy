const PIX_KEY = "22993525674"; // chave PIX para pagamento
const PIX_RECEIVER = "Gummy & Gostosuras";

const USE_AI_BACKEND = false; //chatbot usa cérebro local

//Array com todos os produtos do cardápio.
const PRODUCTS = [
  { id: 1, cat: "bubble", img: "img/fotoai.jpg",    name: "Bubble Tea Taro",       desc: "Cremoso, com tapioca pearls e leite vegetal.",    price: 18.90 },
  { id: 2, cat: "bubble", img: "img/morango.jpg",   name: "Bubble Tea Morango",    desc: "Chá verde gelado com pedaços de morango fresco.", price: 17.90 },
  { id: 3, cat: "bubble", img: "img/matcha.jpg",    name: "Bubble Tea Matchá",     desc: "Matchá premium batido com leite e pearls.",       price: 19.90 },
  { id: 4, cat: "bubble", img: "img/maracuja.jpg",  name: "Bubble Tea Maracujá",   desc: "Refrescante, com calda artesanal de maracujá.",   price: 17.90 },
  { id: 5, cat: "bubble", img: "img/brownsugar.jpg",name: "Bubble Tea Brown Sugar",desc: "Leite com calda caramelizada de açúcar mascavo.", price: 19.90 },
  { id: 6, cat: "bubble", img: "img/manga.png",     name: "Bubble Tea Manga",      desc: "Chá preto com purê de manga e pearls.",           price: 18.50 },

  { id: 10, cat: "cafe", img: "img/expresso.jpg",   name: "Espresso Tradicional",  desc: "Blend de grãos torrados artesanais.",   price:  6.50 },
  { id: 11, cat: "cafe", img: "img/capuccino.jpg",  name: "Cappuccino Cremoso",    desc: "Espresso, leite vaporizado e canela.",  price: 11.90 },
  { id: 12, cat: "cafe", img: "img/latte.jpg",      name: "Latte Vanilla",         desc: "Leite cremoso com calda de baunilha.",  price: 12.90 },

  { id: 20, cat: "salgado", img: "img/croissant.jpg", name: "Croissant de Presunto", desc: "Massa folhada amanteigada.",         price: 14.00 },
  { id: 21, cat: "salgado", img: "img/joelho.jpg",    name: "Joelho de Queijo",      desc: "Pão recheado com queijo derretido.", price:  9.00 },
  { id: 22, cat: "salgado", img: "img/coxinha.jpg",   name: "Coxinha Gourmet",       desc: "Frango desfiado e catupiry.",        price:  8.50 },

  { id: 30, cat: "torta", img: "img/tortalimao.jpg",      name: "Torta de Limão",      desc: "Base crocante, creme cítrico e merengue.",    price: 16.00 },
  { id: 31, cat: "torta", img: "img/tortachocolate.jpg",  name: "Torta de Chocolate",  desc: "Ganache cremoso e brigadeiro.",               price: 17.00 },
  { id: 32, cat: "torta", img: "img/tortademorango.jpg",  name: "Torta de Morango",    desc: "Base Crocante, creme de morango e merengue",  price: 18.00 },

  { id: 40, cat: "macaron", img: "img/macaronpistache.jpg", name: "Macaron Pistache",  desc: "Crocante por fora, cremoso por dentro.", price:  7.50 },
  { id: 41, cat: "macaron", img: "img/macaronmorango.webp", name: "Macaron Framboesa", desc: "Sabor frutado e marcante.",              price:  7.50 },

  { id: 50, cat: "doce", img: "img/brownienozes.jpg",     name: "Brownie de Nozes",   desc: "Massa densa de chocolate belga.", price: 10.00 },
  { id: 51, cat: "doce", img: "img/cupcakeredvelvet.jpg", name: "Cupcake Red Velvet", desc: "Cobertura de cream cheese.",      price:  9.50 },
];

let currentCategory = "todos"; //Categoria filtrada
let searchTerm = ""; //Texto digitado na barra de busca
const cart = new Map(); //Mapeamento de produto e quantidade no carrinho
let currentUser = null; //Mapeamento feito depois do "get_user.php"

//Formata números para real
function money(v){ return "R$ " + Number(v).toFixed(2).replace(".", ","); }

//Filtra produtos por categoria e busca, e renderiza os cards na tela
function renderProducts() {
  const grid = document.getElementById("product-grid");
  const filtered = PRODUCTS.filter(p => {
    const matchCat = currentCategory === "todos" || p.cat === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });
  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted)">Nenhum produto encontrado 😕</p>`;
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img">${p.img ? `<img src="${p.img}" alt="${p.name}">` : (p.emoji || "🍽️")}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.desc}</div>
      <div class="product-foot">
        <span class="product-price">${money(p.price)}</span>
        <button class="btn btn-primary" onclick="addToCart(${p.id})">+ Adicionar</button>
      </div>
    </div>`).join("");
  enableButtonMotion();
}

//Manipula o carrinho e chama o "renderCart()" no final para atualizar a interface
function addToCart(id, qty = 1) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return false;
  const item = cart.get(id);
  if (item) item.qty += qty;
  else cart.set(id, { product, qty });
  renderCart();
  return true;
}

function changeQty(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.delete(id);
  renderCart();
}

function cartSubtotal(){ let t=0; cart.forEach(({product,qty})=>t+=product.price*qty); return t; }

//Lê o "Carrinho" e calcula quantidade total e o total em real
function renderCart() {
  const body = document.getElementById("cart-body");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");
  let count = 0; cart.forEach(({qty}) => count += qty);
  countEl.textContent = count;
  totalEl.textContent = money(cartSubtotal());
  if (cart.size === 0) {
    body.innerHTML = `<p style="text-align:center;color:var(--muted);padding:40px 0">Sua sacola está vazia</p>`;
    return;
  }
  body.innerHTML = Array.from(cart.values()).map(({ product, qty }) => `
    <div class="cart-item">
      <div style="font-size:32px">${product.img ? `<img src="${product.img}" style="width:40px;height:40px;border-radius:8px;object-fit:cover" alt="${product.name}">` : (product.emoji || "🍽️")}</div>
      <div style="flex:1">
        <div style="font-weight:700">${product.name}</div>
        <div style="color:var(--muted);font-size:13px">${money(product.price)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
          <button class="qty-btn" onclick="changeQty(${product.id}, -1)">−</button>
          <span>${qty}</span>
          <button class="qty-btn" onclick="changeQty(${product.id}, +1)">+</button>
        </div>
      </div>
    </div>`).join("");
  enableButtonMotion();
}

//Abre o carrinho
function openCart(){
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-backdrop").classList.add("open");
}

//Fecha o carrinho
function closeCart(){
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-backdrop").classList.remove("open");
}

//Faz o "fetch("php/get_user.php")" e se retornar "logged: true" então esconde os botões de "Entrar/Cadastrar" e mostra "Endereço/Sair" e o nome do usuário.
async function checkLogin() {
  try {
    const res = await fetch("php/get_user.php");
    const data = await res.json();
    if (data.logged) {
      currentUser = data.user;
      document.getElementById("btn-login").classList.add("hidden");
      document.getElementById("btn-cadastro").classList.add("hidden");
      document.getElementById("btn-endereco").classList.remove("hidden");
      document.getElementById("btn-logout").classList.remove("hidden");
      const nameEl = document.getElementById("user-name");
      nameEl.textContent = "Olá, " + data.user.nome.split(" ")[0];
      nameEl.classList.remove("hidden");
    }
  } catch (e) { console.log("Backend ainda não conectado — rodando em modo visual/demo"); }
}

function selectedDelivery(){ return document.querySelector('input[name="delivery"]:checked').value; } //Lê qual opção de entrega foi selecionada
function selectedPayment(){ return document.querySelector('input[name="payment"]:checked').value; } //Lê qual opção de pagamento foi selecionada
function paymentLabel(v){
  return ({pix:"PIX",credito_online:"Cartão de crédito online",debito_online:"Cartão de débito online",
           dinheiro_entrega:"Dinheiro na entrega",cartao_entrega:"Cartão na entrega"})[v] || v;
}

//Mostra instruções de acordo com a forma de pagamento escolhida
function updatePaymentHelp() {
  const box = document.getElementById("payment-help");
  const payment = selectedPayment();
  const totalText = document.getElementById("sum-total")?.textContent || "";
  if (payment === "pix") {
    box.innerHTML = `<strong>PIX selecionado.</strong><br>Chave PIX: <code>${PIX_KEY}</code><br>Nome: ${PIX_RECEIVER}<br>Valor: ${totalText}
      <br><button type="button" class="btn btn-ghost" onclick="copyPixKey()" style="margin-top:10px">Copiar chave PIX</button>`;
  } else if (payment === "credito_online" || payment === "debito_online") {
    box.innerHTML = `<strong>${paymentLabel(payment)} selecionado.</strong><br>Para cartão online funcionar é necessário um gateway (Mercado Pago, PagSeguro, etc).`;
  } else if (payment === "dinheiro_entrega") {
    box.innerHTML = `<strong>Dinheiro na entrega.</strong><br>Use observações para informar o troco.`;
  } else {
    box.innerHTML = `<strong>Cartão na entrega.</strong><br>O entregador leva a maquininha.`;
  }
  enableButtonMotion();
}
function copyPixKey(){ navigator.clipboard?.writeText(PIX_KEY).then(()=>alert("Chave PIX copiada!")); }

//Faz as validações necessárias(usuário logado, carrinho não vazio, endereço selecionado)
function openCheckout() {
  if (!currentUser) { alert("Você precisa entrar antes de finalizar o pedido!"); location.href = "login.html"; return; }
  if (cart.size === 0) { alert("Sua sacola está vazia!"); return; }
  if (!currentUser.endereco) { alert("Cadastre seu endereço primeiro!"); location.href = "endereco.html"; return; }
  document.getElementById("checkout-address").textContent =
    `${currentUser.endereco.rua}, ${currentUser.endereco.numero} — ${currentUser.endereco.bairro}, ${currentUser.endereco.cidade}/${currentUser.endereco.uf} (CEP ${currentUser.endereco.cep})`;
  updateCheckoutSummary();
  updatePaymentHelp();
  document.getElementById("checkout-modal").classList.add("open");
}

function updateCheckoutSummary() {
  const sub = cartSubtotal();
  const frete = selectedDelivery() === "entrega" ? 8 : 0;
  document.getElementById("sum-sub").textContent = money(sub);
  document.getElementById("sum-frete").textContent = money(frete);
  document.getElementById("sum-total").textContent = money(sub + frete);
  updatePaymentHelp();
}

//Envia o pedido para o "place_order.php"
async function confirmOrder() {
  const items = Array.from(cart.values()).map(({product,qty}) => ({id:product.id,name:product.name,price:product.price,qty}));
  const payload = { items, delivery: selectedDelivery(), payment: selectedPayment(), notes: document.getElementById("checkout-notes").value };
  try {
    const res = await fetch("php/place_order.php", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.ok) {
      alert("Pedido #" + data.order_id + " confirmado! Pagamento: " + paymentLabel(payload.payment));
      cart.clear(); renderCart(); closeCart();
      document.getElementById("checkout-modal").classList.remove("open");
    } else { alert("Erro: " + (data.error || "tente novamente")); }
  } catch (e) { alert("Erro ao enviar pedido. Verifique o backend PHP."); }
}

//Efeito de movimento nos botões("dataset.motionReady" evita registrar mais de 1 vez o evento no mesmo botão)
function enableButtonMotion() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("button, .btn").forEach(btn => {
    if (btn.dataset.motionReady) return;
    btn.dataset.motionReady = "1";
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      btn.style.transform = `translate(${(x/r.width-0.5)*8}px, ${(y/r.height-0.5)*8}px) scale(1.035)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = "translate(0,0) scale(1)"; });
  });
}

/* CHATBOT:
1- Funciona como "cérebro local" (sem internet)
2- Normaliza a frase (minúscula, sem acentos)
3- Para cada produto do cardápio, gera "palavras-chave" do nome
4- Procura essas palavras na frase do cliente
5- Tenta achar uma quantidade antes da palavra (ex: "2 morango")
6- Adiciona ao carrinho
*/

function normalize(s){
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"") // remove acentos
    .replace(/[^a-z0-9\s]/g," ");
}

// converte "dois", "três"... em número
const NUM_WORDS = { um:1, uma:1, dois:2, duas:2, tres:3, "três":3, quatro:4, cinco:5,
                    seis:6, sete:7, oito:8, nove:9, dez:10, uns:1, umas:1 };

// palavras-chave únicas do produto
function productKeywords(p){
  const stop = new Set(["bubble","tea","de","do","da","com","tradicional","cremoso","gourmet","vanilla"]);
  return normalize(p.name).split(/\s+/).filter(w => w && !stop.has(w));
}

// Encontra produtos mencionados na frase e a quantidade
function parseOrderLocal(text){
  const norm = " " + normalize(text) + " ";
  const tokens = norm.trim().split(/\s+/);
  const found = []; // {product, qty}

  PRODUCTS.forEach(p => {
    const kws = productKeywords(p);
    if (kws.length === 0) return;
    // produto bate se TODAS as keywords aparecem
    const allMatch = kws.every(k => norm.includes(" " + k + " ") || norm.includes(" " + k));
    if (!allMatch) return;

    // procura quantidade antes da primeira palavra-chave
    const idx = tokens.findIndex(t => t.includes(kws[0]));
    let qty = 1;
    for (let i = Math.max(0, idx-3); i < idx; i++){
      const t = tokens[i];
      if (/^\d+$/.test(t)) { qty = parseInt(t,10); break; }
      if (NUM_WORDS[t])    { qty = NUM_WORDS[t];   break; }
    }
    found.push({ product: p, qty });
  });
  return found;
}

function addChatMessage(who, text){
  const box = document.getElementById("chatbot-messages");
  const div = document.createElement("div");
  div.className = "chat-msg " + who;
  div.innerHTML = text; // permite quebra de linha <br>
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

// respostas pra dúvidas comuns
function smallTalk(text){
  const t = normalize(text);
  if (/(oi|ola|bom dia|boa tarde|boa noite)/.test(t)) return "Oi! 👋 Me diz o que você quer pedir, ex: <em>“2 bubble tea de morango e 1 coxinha”</em>.";
  if (/(horario|abre|fecha)/.test(t))    return "Funcionamos de terça a domingo, das 09h às 20h.";
  if (/(endereco|onde|rua)/.test(t))     return "Estamos na Rua Paratinga, 163 — Cabo Frio/RJ.";
  if (/(frete|entrega)/.test(t))         return "Entrega R$ 8,00 • Frete grátis acima de R$ 50 em Cabo Frio.";
  if (/(pix|pagamento|cartao)/.test(t))  return "Aceitamos PIX, cartão online, dinheiro e cartão na entrega.";
  if (/(cardapio|menu|sabores|tem o que)/.test(t))
    return "Temos Bubble Tea, Cafés, Salgados, Tortas, Macarons e Doces. Quer que eu te ajude a montar o pedido?";
  return null;
}

// Processa a frase do cliente 
async function handleChat(text){
  // 1) Bate-papo simples
  const small = smallTalk(text);
  if (small) { addChatMessage("bot", small); return; }

  // 2) Caso fosse usar IA real
  if (USE_AI_BACKEND){
    try {
      const res = await fetch("php/chatbot.php", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message: text, menu: PRODUCTS.map(p=>({id:p.id,name:p.name,price:p.price})) })
      });
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length){
        data.items.forEach(({id, qty}) => addToCart(id, qty || 1));
        openCart();
      }
      addChatMessage("bot", data.reply || "Pedido adicionado ao carrinho! 🛒");
      return;
    } catch (e) {
      addChatMessage("bot", "⚠️ Não consegui falar com a IA. Usando modo local.");
      // cai no modo local abaixo
    }
  }

  // 3) Cérebro local: tenta extrair pedido da frase
  const items = parseOrderLocal(text);
  if (items.length === 0){
    addChatMessage("bot",
      "Não entendi o pedido 🤔. Tenta assim: <em>“2 bubble tea de morango e 1 croissant”</em>.<br>" +
      "Também posso responder sobre horário, entrega, pagamento e cardápio.");
    return;
  }

  let resumo = "Adicionei ao seu carrinho:<br>";
  items.forEach(({product, qty}) => {
    addToCart(product.id, qty);
    resumo += `• ${qty}× <strong>${product.name}</strong> — ${money(product.price * qty)}<br>`;
  });
  resumo += `<br>Total parcial: <strong>${money(cartSubtotal())}</strong>.<br>Quando quiser fechar, é só clicar em <em>Finalizar pedido</em> no carrinho 🛒.`;
  addChatMessage("bot", resumo);
  openCart();
}

function setupChatbot() {
  const toggle = document.getElementById("chatbot-toggle");
  const win    = document.getElementById("chatbot-window");
  const close  = document.getElementById("chatbot-close");
  const form   = document.getElementById("chatbot-form");
  const input  = document.getElementById("chatbot-input");
  if (!toggle || !win || !form) return;

  toggle.addEventListener("click", () => {
    win.classList.add("open");
    toggle.style.display = "none";
    if (!win.dataset.started) {
      addChatMessage("bot",
        "Oi! Eu sou o assistente IA da Gummy & Gostosuras :)<br>" +
        "Me diga o que você quer pedir em uma frase só que adicionarei o pedido direto em seu carrinho, ex:<br>" +
        "<em>“2 bubble tea de taro, 1 croissant e 1 torta de limão”</em>.");
      win.dataset.started = "1";
    }
    input.focus();
  });
  close.addEventListener("click", () => {
    win.classList.remove("open");
    toggle.style.display = "block";
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addChatMessage("user", text);
    input.value = "";
    setTimeout(() => handleChat(text), 250);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  checkLogin();
  setupChatbot();
  enableButtonMotion();

  document.getElementById("search-input").addEventListener("input", e => {
    searchTerm = e.target.value; renderProducts();
  });
  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderProducts();
    });
  });
  document.getElementById("cart-btn").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-backdrop").addEventListener("click", closeCart);
  document.getElementById("checkout-btn").addEventListener("click", openCheckout);
  document.getElementById("checkout-close").addEventListener("click", () => {
    document.getElementById("checkout-modal").classList.remove("open");
  });
  document.querySelectorAll('input[name="delivery"]').forEach(r => r.addEventListener("change", updateCheckoutSummary));
  document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener("change", updatePaymentHelp));
  document.getElementById("confirm-order").addEventListener("click", confirmOrder);

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", async () => {
    await fetch("php/logout.php"); location.reload();
  });
});