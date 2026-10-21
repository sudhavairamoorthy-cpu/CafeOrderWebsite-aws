// Cafe Bliss frontend. Update API_URL if your API Gateway endpoint changes.
const API_URL = "https://2uifu0p2kc.execute-api.ap-south-1.amazonaws.com/order";
const PACKAGING_FEE = 0; // Change to e.g. 10 if you want a packaging fee.

const menuItems = [
  { id: "espresso", name: "Espresso", category: "Coffee", price: 90, emoji: "☕", tag: "Classic", description: "A bold, rich shot for coffee lovers.", color: "coffee" },
  { id: "cappuccino", name: "Cappuccino", category: "Coffee", price: 150, emoji: "☕", tag: "Popular", description: "Espresso with steamed milk and soft foam.", color: "coffee" },
  { id: "latte", name: "Cafe Latte", category: "Coffee", price: 160, emoji: "🥛", tag: "Smooth", description: "A comforting coffee with silky steamed milk.", color: "coffee" },
  { id: "mocha", name: "Chocolate Mocha", category: "Coffee", price: 180, emoji: "🍫", tag: "Sweet pick", description: "Coffee and chocolate in one cosy cup.", color: "coffee" },
  { id: "masala-tea", name: "Masala Chai", category: "Tea", price: 60, emoji: "🍵", tag: "House favourite", description: "Indian tea brewed with warming spices.", color: "tea" },
  { id: "green-tea", name: "Green Tea", category: "Tea", price: 70, emoji: "🍃", tag: "Light", description: "A gentle, refreshing cup of green tea.", color: "tea" },
  { id: "iced-coffee", name: "Iced Coffee", category: "Cold Drinks", price: 140, emoji: "🧋", tag: "Chilled", description: "Chilled coffee for a refreshing break.", color: "cold" },
  { id: "lemonade", name: "Fresh Lemonade", category: "Cold Drinks", price: 90, emoji: "🍋", tag: "Refreshing", description: "Bright lemon flavour served ice cold.", color: "cold" },
  { id: "croissant", name: "Butter Croissant", category: "Snacks", price: 110, emoji: "🥐", tag: "Fresh bake", description: "Flaky, buttery layers in every bite.", color: "snack" },
  { id: "sandwich", name: "Veg Sandwich", category: "Snacks", price: 130, emoji: "🥪", tag: "Filling", description: "A fresh veggie sandwich, toasted just right.", color: "snack" },
  { id: "muffin", name: "Choco Muffin", category: "Desserts", price: 100, emoji: "🧁", tag: "Chocolate", description: "A soft muffin with chocolatey goodness.", color: "dessert" },
  { id: "cheesecake", name: "Cheesecake Slice", category: "Desserts", price: 190, emoji: "🍰", tag: "Treat yourself", description: "Creamy cheesecake for a sweet finish.", color: "dessert" }
];

let activeCategory = "All";
let cart = loadCart();

const menuGrid = document.getElementById("menuGrid");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const packagingEl = document.getElementById("packaging");
const checkoutForm = document.getElementById("checkoutForm");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const orderMessage = document.getElementById("orderMessage");
const toast = document.getElementById("toast");

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("cafeBlissCart") || "[]");
    return Array.isArray(saved) ? saved.filter(row => row && typeof row.id === "string" && Number.isInteger(row.quantity) && row.quantity > 0) : [];
  } catch { return []; }
}

function saveCart() {
  localStorage.setItem("cafeBlissCart", JSON.stringify(cart));
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

function renderMenu() {
  const query = document.getElementById("menuSearch").value.trim().toLowerCase();
  const filtered = menuItems.filter(item => {
    const categoryMatch = activeCategory === "All" || item.category === activeCategory;
    const queryMatch = `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });

  if (!filtered.length) {
    menuGrid.innerHTML = '<div class="no-results">No menu items found. Try another search. ☕</div>';
    return;
  }

  menuGrid.innerHTML = filtered.map(item => `
    <article class="menu-card">
      <div class="food-art"><span class="food-tag">${item.tag}</span><span class="food-emoji" aria-hidden="true">${item.emoji}</span></div>
      <div class="menu-info">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <div class="menu-bottom"><span class="price">${money(item.price)}</span>
          <button class="add-button" type="button" data-add="${item.id}">+ Add to cart</button>
        </div>
      </div>
    </article>`).join("");
}

function renderCart() {
  cart = cart.filter(row => menuItems.some(item => item.id === row.id) && row.quantity > 0);
  const totalQuantity = cart.reduce((sum, row) => sum + row.quantity, 0);
  const subtotal = cart.reduce((sum, row) => {
    const item = menuItems.find(product => product.id === row.id);
    return sum + (item ? item.price * row.quantity : 0);
  }, 0);
  const packaging = cart.length ? PACKAGING_FEE : 0;
  cartCountEl.textContent = totalQuantity;
  subtotalEl.textContent = money(subtotal);
  packagingEl.textContent = money(packaging);
  totalEl.textContent = money(subtotal + packaging);

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is waiting for something delicious. ☕</p>';
  } else {
    cartItemsEl.innerHTML = cart.map(row => {
      const item = menuItems.find(product => product.id === row.id);
      if (!item) return "";
      return `<div class="cart-item">
        <div class="cart-emoji">${item.emoji}</div>
        <div><div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-price">${money(item.price)} each</div>
          <div class="quantity-controls">
            <button type="button" data-qty="${item.id}" data-delta="-1" aria-label="Decrease ${escapeHtml(item.name)} quantity">−</button>
            <span>${row.quantity}</span>
            <button type="button" data-qty="${item.id}" data-delta="1" aria-label="Increase ${escapeHtml(item.name)} quantity">+</button>
          </div>
        </div>
        <div><b>${money(item.price * row.quantity)}</b><br><button class="remove-item" type="button" data-remove="${item.id}" aria-label="Remove ${escapeHtml(item.name)}">×</button></div>
      </div>`;
    }).join("");
  }
  saveCart();
}

function addToCart(id) {
  const existing = cart.find(row => row.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  renderCart();
  showToast(`${menuItems.find(item => item.id === id).name} added to your cart!`);
}

function changeQuantity(id, delta) {
  const row = cart.find(item => item.id === id);
  if (!row) return;
  row.quantity += delta;
  if (row.quantity <= 0) cart = cart.filter(item => item.id !== id);
  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function showOrderMessage(type, message) {
  orderMessage.className = `order-message ${type}`;
  orderMessage.textContent = message;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

document.getElementById("categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("active", chip === button));
  renderMenu();
});

document.getElementById("menuSearch").addEventListener("input", renderMenu);

menuGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItemsEl.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(quantityButton.dataset.qty, Number(quantityButton.dataset.delta));
  if (removeButton) {
    cart = cart.filter(row => row.id !== removeButton.dataset.remove);
    renderCart();
  }
});

document.getElementById("clearCart").addEventListener("click", () => {
  cart = [];
  renderCart();
  showToast("Your cart has been cleared.");
});

document.getElementById("cartJump").addEventListener("click", () => {
  document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
});

checkoutForm.addEventListener("submit", async event => {
  event.preventDefault();
  orderMessage.className = "order-message";
  orderMessage.textContent = "";

  if (!cart.length) {
    showOrderMessage("error", "Your cart is empty. Add at least one item before placing an order.");
    document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const orderType = document.getElementById("orderType").value;
  const specialNotes = document.getElementById("specialNotes").value.trim();
  if (!customerName) {
    showOrderMessage("error", "Please enter your name.");
    return;
  }

  const subtotal = cart.reduce((sum, row) => {
    const item = menuItems.find(product => product.id === row.id);
    return sum + (item ? item.price * row.quantity : 0);
  }, 0);
  const orderItems = cart.map(row => {
    const item = menuItems.find(product => product.id === row.id);
    return { name: item.name, item_id: item.id, quantity: row.quantity, unit_price: item.price, line_total: item.price * row.quantity };
  });
  const order = {
    customer: customerName,
    customer_phone: customerPhone,
    order_type: orderType,
    items: orderItems,
    item: orderItems.map(row => `${row.name} x${row.quantity}`).join(", "),
    quantity: cart.reduce((sum, row) => sum + row.quantity, 0),
    amount: Number((subtotal + (cart.length ? PACKAGING_FEE : 0)).toFixed(2)),
    total_amount: Number((subtotal + (cart.length ? PACKAGING_FEE : 0)).toFixed(2)),
    special_instructions: specialNotes,
    payment: "Not collected",
    status: "PLACED"
  };

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Sending order…";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const raw = await response.text();
    let result;
    try { result = JSON.parse(raw); } catch { result = { message: raw }; }

    // API Gateway may return the Lambda proxy response, whose body is a JSON string.
    let payload = result;
    if (typeof result.body === "string") {
      try { payload = JSON.parse(result.body); } catch { /* keep original */ }
    }

    if (!response.ok || result.statusCode >= 400) {
      throw new Error(payload.error || payload.message || result.message || `Request failed (${response.status})`);
    }

    const orderId = payload.orderId || payload.order_id || (payload.order && payload.order.order_id) || "Submitted";
    showOrderMessage("success", `🎉 Order placed successfully! Your order ID is ${orderId}. The order has been sent to AWS. Please save this ID for reference.`);
    cart = [];
    renderCart();
    checkoutForm.reset();
    showToast("Your order was sent successfully!");
  } catch (error) {
    console.error("Order submission error:", error);
    showOrderMessage("error", `We couldn't submit your order. ${error.message || "Please try again."} Check your internet connection and API Gateway CORS/settings.`);
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = 'Place my order <span>→</span>';
  }
});

renderMenu();
renderCart();
