function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function renderOrderSuccess() {
    const container = document.getElementById('orderSuccessContainer');
    const orderId = parseInt(getQueryParam('order'));

    if (!getCurrentUser()) {
        container.innerHTML = `<p>برای مشاهده سفارش ابتدا <a href="login.html">وارد شوید</a>.</p>`;
        return;
    }

    let order;
    try {
        ({ order } = await apiGet(`orders/get_order.php?id=${orderId}`));
    } catch (err) {
        container.innerHTML = `<p>${err.message}</p>`;
        return;
    }

    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `
            <div class="order-item">
                <img src="assets/images/${item.image}" alt="${item.name}">
                <p>${item.name} × ${item.quantity}</p>
                <p>${formatPrice(item.price * item.quantity)} تومان</p>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="order-success">
            <h2>✅ سفارش شما با موفقیت ثبت شد!</h2>
            <p>شماره سفارش: #${order.id}</p>
            <p>تاریخ ثبت: ${order.created_at}</p>
            <p>وضعیت: در حال بررسی</p>
            <h3 style="margin-top:20px;">اقلام سفارش:</h3>
            <div class="order-items-list">${itemsHtml}</div>
            <h3 style="margin-top:16px;">مبلغ کل: ${formatPrice(order.total_price)} تومان</h3>
            <div style="margin-top:18px; display:flex; gap:10px;">
                <a href="index.html" class="btn">بازگشت به صفحه اصلی</a>
                <a href="profile.html" class="btn btn-gold">مشاهده سفارش‌های من</a>
            </div>
        </div>
    `;
}

document.addEventListener('diba:user-ready', renderOrderSuccess);
