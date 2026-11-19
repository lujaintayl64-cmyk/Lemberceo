
/* =========================================
   LEMBER — INTERACTIVE STORE
   Vanilla JavaScript
   ========================================= */

(() => {
  "use strict";

  // PRODUCT DATABASE

  const PRODUCTS = [
    {
      id: "study-planner",
      name: "Study Planner",
      price: 79,
      description:
        "A clear, considered space for your priorities, study sessions and weekly goals. A digital planning concept designed to make busy days feel more intentional.",
      image:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1000&q=85",
      alt: "Minimal burgundy notebook and pen on a desk",
      tag: "Bestseller"
    },

    {
      id: "daily-journal",
      name: "Daily Journal",
      price: 69,
      description:
        "A calm place to collect thoughts, reflect on small wins and make space for new ideas. This demonstration product represents a future digital journal.",
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85",
      alt: "Elegant ivory journal",
      tag: "New"
    },

    {
      id: "creative-pack",
      name: "Creative Pack",
      price: 99,
      description:
        "A curated starter set of creative prompts, planning pages and visual inspiration for your next personal project. Sample product only.",
      image:
        "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85",
      alt: "Elegant desk with creative stationery",
      tag: "The Edit"
    }
  ];


  // STORAGE

  const STORAGE_KEY = "lember-demo-cart-v1";


  // ELEMENT SELECTORS

  const $ = (selector) =>
    document.querySelector(selector);

  const productGrid = $("#productGrid");
  const cartDrawer = $("#cartDrawer");
  const overlay = $("#overlay");
  const cartItems = $("#cartItems");
  const toast = $("#toast");

  let cart = readCart();
  let activeProduct = null;
  let toastTimer;


  // LOAD SAVED CART

  function readCart() {

    try {

      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (!Array.isArray(saved)) {
        return [];
      }

      return saved
        .filter(item =>
          PRODUCTS.some(product =>
            product.id === item.id
          )
        )
        .map(item => ({
          id: item.id,
          quantity: Math.max(
            1,
            Math.min(99, Number(item.quantity) || 1)
          )
        }));

    } catch (error) {

      console.error("Could not load cart:", error);

      return [];

    }

  }


  // SAVE CART

  function saveCart() {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

    } catch (error) {

      console.error("Could not save cart:", error);

      showToast("Your browser could not save your demo bag.");

    }

  }


  // HELPER FUNCTIONS

  function money(value) {

    return `${value.toLocaleString("en-US")} SAR`;

  }


  function productById(id) {

    return PRODUCTS.find(product =>
      product.id === id
    );

  }


  // DISPLAY PRODUCTS

  function renderProducts() {

    productGrid.innerHTML = PRODUCTS.map(product => `

      <article class="product-card">

        <button
          class="product-art"
          type="button"
          data-view="${product.id}"
          aria-label="View ${product.name}"
        >

          <span class="product-tag">
            ${product.tag}
          </span>

          <img
            src="${product.image}"
            alt="${product.alt}"
            loading="lazy"
          >

        </button>

        <div class="product-meta">

          <h3>${product.name}</h3>

          <span class="price">
            ${money(product.price)}
          </span>

        </div>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="card-actions">

          <button
            class="small-link"
            type="button"
            data-view="${product.id}"
          >
            View details ↗
          </button>

          <button
            class="small-link"
            type="button"
            data-add="${product.id}"
          >
            Add to bag +
          </button>

        </div>

      </article>

    `).join("");

  }


  // DISPLAY SHOPPING CART

  function renderCart() {

    const count = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    $("#cartCount").textContent = count;

    $("#cartTrigger").setAttribute(
      "aria-label",
      `Open shopping cart, ${count} items`
    );


    // EMPTY CART

    if (!cart.length) {

      cartItems.innerHTML = `
        <p class="empty-cart">
          Your bag is waiting for a good idea.
        </p>
      `;

    }


    // CART PRODUCTS

    else {

      cartItems.innerHTML = cart.map(item => {

        const product = productById(item.id);

        return `

          <div class="cart-row">

            <img
              class="cart-thumb"
              src="${product.image}"
              alt=""
            >

            <div>

              <h3>${product.name}</h3>

              <span class="cart-price">
                ${money(product.price)} each
              </span>

              <div
                class="quantity-control"
                aria-label="Quantity controls for ${product.name}"
              >

                <button
                  type="button"
                  data-qty="${product.id}"
                  data-change="-1"
                  aria-label="Decrease ${product.name} quantity"
                >
                  −
                </button>

                <span>${item.quantity}</span>

                <button
                  type="button"
                  data-qty="${product.id}"
                  data-change="1"
                  aria-label="Increase ${product.name} quantity"
                >
                  +
                </button>

              </div>

            </div>

            <button
              class="remove-item"
              type="button"
              data-remove="${product.id}"
              aria-label="Remove ${product.name}"
            >
              ×
            </button>

          </div>

        `;

      }).join("");

    }


    // AUTOMATIC SUBTOTAL

    const subtotal = cart.reduce(
      (sum, item) =>
        sum +
        productById(item.id).price * item.quantity,
      0
    );

    $("#cartSubtotal").textContent =
      money(subtotal);

  }


  // NOTIFICATION MESSAGE

  function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

      toast.classList.remove("show");

    }, 2300);

  }


  // ADD PRODUCT TO CART

  function addToCart(id) {

    const existing = cart.find(item =>
      item.id === id
    );

    if (existing) {

      existing.quantity = Math.min(
        99,
        existing.quantity + 1
      );

    }

    else {

      cart.push({
        id: id,
        quantity: 1
      });

    }

    saveCart();

    renderCart();

    showToast(
      `${productById(id).name} added to your bag`
    );

  }


  // CHANGE QUANTITY

  function changeQuantity(id, delta) {

    const item = cart.find(entry =>
      entry.id === id
    );

    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {

      cart = cart.filter(entry =>
        entry.id !== id
      );

    }

    saveCart();

    renderCart();

  }


  // OPEN CART

  function openCart() {

    cartDrawer.classList.add("open");

    cartDrawer.setAttribute(
      "aria-hidden",
      "false"
    );

    overlay.hidden = false;

    requestAnimationFrame(() => {

      overlay.classList.add("visible");

    });

    document.body.style.overflow = "hidden";

    $("#closeCart").focus();

  }


  // CLOSE CART

  function closeCart() {

    cartDrawer.classList.remove("open");

    cartDrawer.setAttribute(
      "aria-hidden",
      "true"
    );

    overlay.classList.remove("visible");

    document.body.style.overflow = "";

    setTimeout(() => {

      if (!cartDrawer.classList.contains("open")) {

        overlay.hidden = true;

      }

    }, 250);

    $("#cartTrigger").focus();

  }


  // PRODUCT DETAILS

  function openProduct(id) {

    const product = productById(id);

    if (!product) return;

    activeProduct = product;

    $("#dialogArt").innerHTML = `

      <img
        src="${product.image}"
        alt="${product.alt}"
      >

    `;

    $("#dialogTitle").textContent =
      product.name;

    $("#dialogDescription").textContent =
      product.description;

    $("#dialogPrice").textContent =
      money(product.price);

    $("#productDialog").showModal();

  }


  // PRODUCT BUTTON EVENTS

  productGrid.addEventListener("click", event => {

    const add = event.target.closest("[data-add]");

    const view = event.target.closest("[data-view]");

    if (add) {

      addToCart(add.dataset.add);

    }

    else if (view) {

      openProduct(view.dataset.view);

    }

  });


  // CART BUTTON EVENTS

  cartItems.addEventListener("click", event => {

    const qty = event.target.closest("[data-qty]");

    const remove = event.target.closest("[data-remove]");


    if (qty) {

      changeQuantity(
        qty.dataset.qty,
        Number(qty.dataset.change)
      );

    }


    if (remove) {

      cart = cart.filter(item =>
        item.id !== remove.dataset.remove
      );

      saveCart();

      renderCart();

    }

  });


  // CART CONTROLS

  $("#cartTrigger").addEventListener(
    "click",
    openCart
  );

  $("#closeCart").addEventListener(
    "click",
    closeCart
  );

  overlay.addEventListener(
    "click",
    closeCart
  );

  $("#continueShopping").addEventListener(
    "click",
    closeCart
  );


  // PRODUCT DIALOG CONTROLS

  $("#closeProduct").addEventListener(
    "click",
    () => $("#productDialog").close()
  );


  $("#productDialog").addEventListener(
    "click",
    event => {

      if (event.target === $("#productDialog")) {

        $("#productDialog").close();

      }

    }
  );


  $("#dialogAdd").addEventListener(
    "click",
    () => {

      if (activeProduct) {

        addToCart(activeProduct.id);

      }

      $("#productDialog").close();

    }
  );


  // CHECKOUT NOTICE

  $("#checkoutButton").addEventListener(
    "click",
    () => {

      showToast(
        "Checkout is not connected in this demonstration."
      );

    }
  );


  // ESCAPE KEY

  document.addEventListener("keydown", event => {

    if (
      event.key === "Escape" &&
      cartDrawer.classList.contains("open")
    ) {

      closeCart();

    }

  });


  // MOBILE NAVIGATION

  const menuToggle = $("#menuToggle");

  const nav = $("#primaryNav");


  menuToggle.addEventListener("click", () => {

    const open = nav.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );

  });


  nav.addEventListener("click", event => {

    if (event.target.closest("a")) {

      nav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation"
      );

    }

  });


  // CONTACT FORM

  $("#contactForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const form = new FormData(event.currentTarget);

      const subject = encodeURIComponent(
        "LEMBER website enquiry"
      );

      const body = encodeURIComponent(

        `Name: ${form.get("name")}
Email: ${form.get("email")}

${form.get("message")}`

      );

      window.location.href =
        `mailto:hello@lember.example?subject=${subject}&body=${body}`;

      showToast(
        "Your email app should open with the message prepared."
      );

    }
  );


  // NEWSLETTER FORM

  $("#newsletterForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const email = $("#newsletterEmail").value.trim();

      const subject = encodeURIComponent(
        "Join the LEMBER Letter"
      );

      const body = encodeURIComponent(
        `Please add ${email} to the LEMBER newsletter list.`
      );

      window.location.href =
        `mailto:hello@lember.example?subject=${subject}&body=${body}`;

      $("#newsletterMessage").textContent =
        "Your email app should open. Newsletter sign-up is not automated in this demo.";

    }
  );


  // AUTOMATIC COPYRIGHT YEAR

  $("#year").textContent =
    new Date().getFullYear();


  // INITIALIZE WEBSITE

  renderProducts();

  renderCart();

})();
        
