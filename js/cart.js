function calcUnitPrice(product) {
    return product.discount_price || product.price;
}

async function getCartWithProductInfo() {
    const cart = getCart();
    if (cart.length === 0) return [];

    const { products } = await apiGet('products/get_products.php');
    return cart.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return product ? { ...item, product } : null;
    }).filter(Boolean);
}

async function renderCart() {
    const container = document.getElementById('cartContainer');
    let items;
    try {
        items = await getCartWithProductInfo();
    } catch (err) {
        container.innerHTML = '<p>خطا در دریافت اطلاعات سبد خرید.</p>';
        return;
    }

    if (items.length === 0) {
        container.innerHTML = `<p>سبد خرید شما خالی است. <a href="products.html">مشاهده محصولات</a></p>`;
        return;
    }

    let total = 0;
    let html = '<div class="cart-list">';

    items.forEach(({ product, quantity }) => {
        const unitPrice = calcUnitPrice(product);
        total += unitPrice * quantity;

        html += `
            <div class="cart-item">
                <img src="assets/images/${product.image}" alt="${product.name}">
                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <p>${formatPrice(unitPrice)} تومان</p>
                    <div class="quantity-form">
                        <input type="number" class="qty-input" data-id="${product.id}" value="${quantity}" min="1" max="${product.stock}">
                        <button class="btn-small update-qty-btn" data-id="${product.id}">به‌روزرسانی</button>
                    </div>
                    <button class="remove-btn" data-id="${product.id}">حذف</button>
                </div>
                <p class="item-total">${formatPrice(unitPrice * quantity)} تومان</p>
            </div>
        `;
    });

    html += '</div>';
    html += `
        <div class="cart-summary">
            <h3>مبلغ کل: ${formatPrice(total)} تومان</h3>
            <a href="checkout.html" class="btn btn-gold">ثبت سفارش</a>
        </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.update-qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const input = container.querySelector(`.qty-input[data-id="${id}"]`);
            let qty = parseInt(input.value) || 1;
            const max = parseInt(input.max);
            if (qty > max) qty = max;
            if (qty < 1) qty = 1;
            updateCartItemQty(id, qty);
            showToast('تعداد به‌روزرسانی شد.', 'success');
            renderCart();
        });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.id));
            showToast('محصول از سبد خرید حذف شد.', 'success');
            renderCart();
        });
    });
}

document.addEventListener('DOMContentLoaded', renderCart);
