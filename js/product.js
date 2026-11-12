function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderProductDetails(product) {
    const container = document.getElementById('productDetailsContainer');
    const hasDiscount = !!product.discount_price;

    container.innerHTML = `
        <div class="product-details">
            <div class="product-image">
                <img src="assets/images/${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                ${product.category_name ? `<p class="category-tag">${product.category_name}</p>` : ''}
                <h1>${product.name}</h1>
                <p class="description">${product.description || 'توضیحات کامل محصول به‌زودی از طریق پنل ادمین قابل ویرایش خواهد بود.'}</p>

                <div class="price-box">
                    ${hasDiscount ? `<span class="old-price">${formatPrice(product.price)} تومان</span>` : ''}
                    <span class="final-price">${formatPrice(hasDiscount ? product.discount_price : product.price)} تومان</span>
                </div>

                <p class="stock-status ${product.stock === 0 ? 'out-of-stock' : ''}">
                    ${product.stock > 0 ? `موجود در انبار (${product.stock} عدد)` : 'ناموجود'}
                </p>

                ${product.stock > 0 ? `
                    <form id="addToCartForm">
                        <div class="qty-control">
                            <button type="button" class="qty-btn qty-minus">−</button>
                            <input type="number" id="quantityInput" value="1" min="1" max="${product.stock}">
                            <button type="button" class="qty-btn qty-plus">+</button>
                        </div>
                        <button type="submit" class="btn">افزودن به سبد خرید</button>
                    </form>
                ` : `<button class="btn disabled" disabled>ناموجود</button>`}
            </div>
        </div>
    `;

    if (product.stock > 0) {
        const form = document.getElementById('addToCartForm');
        const qtyInput = document.getElementById('quantityInput');

        form.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                let value = parseInt(qtyInput.value) || 1;
                const max = parseInt(qtyInput.max);
                if (btn.classList.contains('qty-plus')) value = Math.min(value + 1, max);
                else value = Math.max(value - 1, 1);
                qtyInput.value = value;
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const quantity = parseInt(qtyInput.value) || 1;
            addToCart(product.id, quantity);
            showToast('محصول به سبد خرید اضافه شد.', 'success');
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('productDetailsContainer');
    const productId = parseInt(getQueryParam('id'));

    try {
        const { product } = await apiGet(`products/get_product.php?id=${productId}`);
        renderProductDetails(product);
    } catch (err) {
        container.innerHTML = '<p>محصول مورد نظر یافت نشد.</p>';
    }
});
