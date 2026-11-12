function calcUnitPrice(product) {
    return product.discount_price || product.price;
}

async function renderCheckout() {
    const container = document.getElementById('checkoutContainer');
    const user = getCurrentUser();

    if (!user) {
        container.innerHTML = `<p>برای ثبت سفارش ابتدا <a href="login.html">وارد شوید</a>.</p>`;
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `<p>سبد خرید شما خالی است. <a href="products.html">مشاهده محصولات</a></p>`;
        return;
    }

    let items;
    try {
        const { products } = await apiGet('products/get_products.php');
        items = cart.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return product ? { ...item, product } : null;
        }).filter(Boolean);
    } catch (err) {
        container.innerHTML = '<p>خطا در دریافت اطلاعات محصولات.</p>';
        return;
    }

    let total = 0;
    let html = '<div class="checkout-list">';
    items.forEach(({ product, quantity }) => {
        const unitPrice = calcUnitPrice(product);
        total += unitPrice * quantity;
        html += `
            <div class="checkout-item">
                <img src="assets/images/${product.image}" alt="${product.name}">
                <p>${product.name} × ${quantity}</p>
                <p>${formatPrice(unitPrice * quantity)} تومان</p>
            </div>
        `;
    });
    html += '</div>';
    html += `<h3 style="margin-top:20px;">مبلغ نهایی: ${formatPrice(total)} تومان</h3>`;
    html += `<button id="confirmOrderBtn" class="btn btn-gold" style="margin-top:16px;">تایید و ثبت نهایی سفارش</button>`;

    container.innerHTML = html;

    document.getElementById('confirmOrderBtn').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = 'در حال ثبت سفارش...';

        try {
            const payload = { items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) };
            const { order_id } = await apiPost('orders/create_order.php', payload);
            clearCart();
            window.location.href = `order-success.html?order=${order_id}`;
        } catch (err) {
            showToast(err.message, 'error');
            btn.disabled = false;
            btn.textContent = 'تایید و ثبت نهایی سفارش';
        }
    });
}

document.addEventListener('diba:user-ready', renderCheckout);
