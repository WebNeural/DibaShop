const CART_KEY = 'diba_cart';

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadgeUI();
}
function addToCart(productId, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.product_id === productId);
    if (existing) existing.quantity += quantity;
    else cart.push({ product_id: productId, quantity });
    saveCart(cart);
}
function updateCartItemQty(productId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.product_id === productId);
    if (item) { item.quantity = quantity; saveCart(cart); }
}
function removeFromCart(productId) {
    saveCart(getCart().filter(i => i.product_id !== productId));
}
function clearCart() { saveCart([]); }
function getCartCount() { return getCart().reduce((s, i) => s + i.quantity, 0); }
function updateCartBadgeUI() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = getCartCount();
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
}

let CURRENT_USER = undefined; 

async function fetchCurrentUser() {
    try {
        const data = await apiGet('auth/me.php');
        CURRENT_USER = data.user;
    } catch {
        CURRENT_USER = null;
    }
    return CURRENT_USER;
}

function getCurrentUser() {
    return CURRENT_USER || null;
}

async function logoutUser() {
    try { await apiPost('auth/logout.php', {}); } catch {}
    window.location.href = 'index.html';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function formatPrice(num) { return Number(num).toLocaleString('en-US'); }

function renderHeader() {
    const el = document.getElementById('siteHeader');
    if (!el) return;
    const page = document.body.dataset.page || '';
    const isActive = (name) => (page === name ? 'active' : '');

    el.innerHTML = `
        <div class="header-inner">
            <a href="index.html" class="logo">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L14.4 8.4L22 9.3L16.5 14.6L18.1 22L12 18.3L5.9 22L7.5 14.6L2 9.3L9.6 8.4L12 1Z" stroke="#C79A3E" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
                <span>فروشگاه <b>دیبا</b></span>
            </a>

            <button class="menu-toggle" id="menuToggle" aria-label="باز کردن منو">
                <span></span><span></span><span></span>
            </button>

            <nav class="main-nav" id="mainNav">
                <a href="index.html" class="${isActive('home')}">خانه</a>
                <a href="products.html" class="${isActive('products')}">محصولات</a>
                <a href="cart.html" class="${isActive('cart')}">سبد خرید</a>
            </nav>

            <div class="header-actions">
                <a href="cart.html" class="cart-link" aria-label="سبد خرید">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6V20C3 20.5 3.2 21 3.6 21.4C4 21.8 4.5 22 5 22H19C19.5 22 20 21.8 20.4 21.4C20.8 21 21 20.5 21 20V6L18 2H6Z" stroke="#fff" stroke-width="1.6"/><path d="M3 6H21" stroke="#fff" stroke-width="1.6"/></svg>
                    <span class="cart-badge" id="cartBadge">0</span>
                </a>
                <span id="headerAuthLinks"></span>
            </div>
        </div>
    `;
}

function renderFooter() {
    const el = document.getElementById('siteFooter');
    if (!el) return;
    el.innerHTML = `
        <div class="footer-pattern"></div>
        <div class="footer-inner">
            <div class="footer-col footer-brand">
                <h4>فروشگاه دیبا</h4>
                <p>خرید آنلاین ساده، سریع و مطمئن. بهترین محصولات با بهترین قیمت، تحویل درب منزل.</p>
            </div>
            <div class="footer-col">
                <h4>دسترسی سریع</h4>
                <a href="index.html">صفحه اصلی</a>
                <a href="products.html">محصولات</a>
                <a href="cart.html">سبد خرید</a>
                <a href="profile.html">حساب کاربری</a>
            </div>
            <div class="footer-col">
                <h4>ارتباط با ما</h4>
                <p>تلفن پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p>ایمیل: support@diba-shop.ir</p>
                <p>ساعات کاری: همه روزه ۹ تا ۲۱</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <span id="footerYear"></span> فروشگاه دیبا - تمامی حقوق محفوظ است</p>
        </div>
    `;
    document.getElementById('footerYear').textContent = new Date().getFullYear();
}

function renderHeaderAuthState() {
    const container = document.getElementById('headerAuthLinks');
    if (!container) return;
    const user = getCurrentUser();

    if (user) {
        container.innerHTML = `
            ${user.role === 'admin' ? '<a href="admin.html">پنل مدیریت</a>' : ''}
            <a href="profile.html">${user.full_name.split(' ')[0]}</a>
            <a href="#" id="logoutBtn">خروج</a>
        `;
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    } else {
        container.innerHTML = `
            <a href="login.html">ورود</a>
            <a href="register.html" class="nav-cta">ثبت‌نام</a>
        `;
    }
}

function createProductCard(product) {
    const hasDiscount = !!product.discount_price;
    const finalPrice = hasDiscount ? product.discount_price : product.price;

    const card = document.createElement('div');
    card.className = 'product-card' + (hasDiscount ? ' has-discount' : '');
    card.innerHTML = `
        ${hasDiscount ? '<span class="sale-ribbon">تخفیف</span>' : ''}
        <a href="product.html?id=${product.id}">
            <img src="assets/images/${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
        </a>
        <p class="price">
            ${hasDiscount ? `<span class="old-price">${formatPrice(product.price)}</span>` : ''}
            ${formatPrice(finalPrice)} تومان
        </p>
        <p class="stock">${product.stock > 0 ? 'موجود' : 'ناموجود'}</p>
        <a href="product.html?id=${product.id}" class="btn">مشاهده محصول</a>
    `;
    return card;
}

function createProductSection(title, products, linkHref = null) {
    if (products.length === 0) return null;
    const section = document.createElement('section');
    section.className = 'home-section';

    const heading = document.createElement('h2');
    heading.innerHTML = linkHref
        ? `${title} <a href="${linkHref}" class="see-all">مشاهده همه</a>`
        : title;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'product-grid';
    products.forEach(p => grid.appendChild(createProductCard(p)));
    section.appendChild(grid);

    return section;
}

function initScrollAnimations(selector = '.product-card') {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll(selector).forEach(el => {
        el.classList.add('fade-in-hidden');
        observer.observe(el);
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('active');
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    renderHeader();
    renderFooter();
    initMobileMenu();
    updateCartBadgeUI();
    await fetchCurrentUser();
    renderHeaderAuthState();
    document.dispatchEvent(new CustomEvent('diba:user-ready'));
});
