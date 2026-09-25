/* =========================================================
   CONFIG — این تنها بخشی است که باید با اطلاعات خودتان پر شود
   ========================================================= */
const CONFIG = {
  // ایمیل پشتیبانی — سفارش‌ها به این آدرس می‌رسند
  supportEmail: "hkay7645@gmail.com",

  // ★ آدرس کیف Trust Wallet شما ★
  // پرداخت‌ها: تتر (USDT) روی شبکه اتریوم — ERC-20
  networks: [
    {
      id: "erc20",
      label: "USDT · Ethereum",
      sub: "ERC-20",
      address: "0xE1E3e1c2978c74f43Bb095023135C3278303aF34",
      fee: "شبکه اتریوم کارمزد دارد؛ برای مبالغ کوچک آن را در نظر بگیرید",
      recommended: true,
    },
  ],
};

/* =========================================================
   Helpers
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const toastEl = $("#toast");
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/* =========================================================
   Mobile nav
   ========================================================= */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");
navToggle?.addEventListener("click", () => navLinks.classList.toggle("is-open"));
$$("#navLinks a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("is-open"))
);

/* =========================================================
   Footer / contact bits
   ========================================================= */
$("#year").textContent = new Date().getFullYear();
const contactLink = $("#contactEmail");
contactLink.href = `mailto:${CONFIG.supportEmail}`;
contactLink.textContent = CONFIG.supportEmail;

/* =========================================================
   Buy modal
   ========================================================= */
const modal = $("#buyModal");
const netTabsEl = $("#networkTabs");
const payAddressEl = $("#payAddress");
const netNoteEl = $("#netNote");
const modalTitle = $("#modalTitle");
const modalPrice = $("#modalPrice");

let activeNet = CONFIG.networks[0];
let currentProduct = null;

function renderNetworks() {
  netTabsEl.innerHTML = "";
  CONFIG.networks.forEach((net) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "net-tab" + (net.id === activeNet.id ? " is-active" : "");
    b.innerHTML = `${net.label}<span class="net-tab__badge">${
      net.recommended ? "★ " + net.sub + " · توصیه" : net.sub
    }</span>`;
    b.addEventListener("click", () => {
      activeNet = net;
      renderNetworks();
      renderAddress();
    });
    netTabsEl.appendChild(b);
  });
}

function renderAddress() {
  payAddressEl.value = activeNet.address;
  netNoteEl.innerHTML = `<strong>شبکه انتقال: ${activeNet.sub}</strong> — ${activeNet.fee}. حتماً همان شبکه را در کیف پول خود انتخاب کنید، در غیر این صورت وجوه قابل بازیابی نخواهد بود.`;
}

function openModal(product) {
  currentProduct = product;
  modalTitle.textContent = product.name;
  modalPrice.textContent = `$${product.price}`;
  activeNet = CONFIG.networks.find((n) => n.recommended) || CONFIG.networks[0];
  renderNetworks();
  renderAddress();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$$(".buy-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    const card = btn.closest(".product");
    openModal({
      id: card.dataset.id,
      name: card.dataset.name,
      price: card.dataset.price,
    });
  })
);

$$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

$("#copyBtn").addEventListener("click", async () => {
  const ok = await copyText(payAddressEl.value);
  toast(ok ? "✓ آدرس کپی شد" : "کپی انجام نشد — دستی کپی کنید");
});

/* =========================================================
   Order form → mailto with everything pre-filled
   ========================================================= */
$("#orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = $("#buyerEmail").value.trim();
  const tx = $("#txHash").value.trim();

  if (!email || !tx) return;

  const subject = `Order: ${currentProduct.name} ($${currentProduct.price})`;
  const body = [
    "Hello, I just completed a payment.",
    "",
    `Product   : ${currentProduct.name}`,
    `Amount    : $${currentProduct.price} USDT`,
    `Network   : ${activeNet.sub}`,
    `TX hash   : ${tx}`,
    `Buyer email: ${email}`,
    "",
    "Please send me the download link. Thank you!",
  ].join("\n");

  window.location.href =
    `mailto:${CONFIG.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  toast("✓ ایمیل آماده شد — آن را ارسال کنید");
});
