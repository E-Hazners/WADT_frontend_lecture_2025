const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Pizza Data
const pizzas = [
  { name: "Margherita", type: "veg", price: 6.99, emoji: "🍅", desc: "Fresh tomato, mozzarella, and basil." },
  { name: "Pepperoni", type: "nonveg", price: 8.99, emoji: "🌶️", desc: "Spicy pepperoni and mozzarella." },
  { name: "Veggie Delight", type: "veg", price: 7.99, emoji: "🥕", desc: "Peppers, mushrooms, onions, olives." },
  { name: "BBQ Chicken", type: "nonveg", price: 9.49, emoji: "🍗", desc: "BBQ sauce, chicken, red onions, cheddar." },
  { name: "Four Cheese", type: "veg", price: 8.49, emoji: "🧀", desc: "Mozzarella, parmesan, gouda, blue cheese." },
];

// Config
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: 'pizza_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to set cart
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = {};
  res.locals.cart = req.session.cart;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { pizzas });
});

app.post('/add-to-cart', (req, res) => {
  const { name } = req.body;
  const pizza = pizzas.find(p => p.name === name);
  if (!pizza) return res.status(404).send('Pizza not found');

  const cart = req.session.cart;
  if (!cart[name]) {
    cart[name] = { ...pizza, qty: 1 };
  } else {
    cart[name].qty++;
  }

  res.redirect('/');
});

app.post('/update-cart', (req, res) => {
  const { name, action } = req.body;
  const cart = req.session.cart;
  if (cart[name]) {
    if (action === 'inc') cart[name].qty++;
    if (action === 'dec') cart[name].qty--;
    if (cart[name].qty <= 0) delete cart[name];
  }
  res.redirect('/');
});

app.post('/remove-item', (req, res) => {
  const { name } = req.body;
  delete req.session.cart[name];
  res.redirect('/');
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

// Fade-in Animation
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.card').forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('fade-in');
    }, i * 150);
  });

  // Load Dark Mode from localStorage
  if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
  }
});

// Toggle Dark Mode
document.getElementById('toggleMode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
});

// Filter Pizzas by type
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.filter;
    document.querySelectorAll('.card').forEach(card => {
      const isVeg = card.innerText.includes("🥕") || card.innerText.includes("🧀") || card.innerText.includes("🍅");
      const isNonVeg = card.innerText.includes("🍗") || card.innerText.includes("🌶️");

      if (
        type === "all" ||
        (type === "veg" && isVeg) ||
        (type === "nonveg" && isNonVeg)
      ) {
        card.parentElement.style.display = "block";
      } else {
        card.parentElement.style.display = "none";
      }
    });
  });
});

// SweetAlert for Add to Cart
document.querySelectorAll('form[action="/add-to-cart"]').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const pizzaName = this.querySelector('input[name="name"]').value;

    fetch('/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name: pizzaName })
    })
    .then(() => {
      Swal.fire({
        title: `${pizzaName} added to cart!`,
        icon: 'success',
        toast: true,
        timer: 2000,
        position: 'top-end',
        showConfirmButton: false
      }).then(() => window.location.reload());
    });
  });
});
