
function statusLabel(status) {
    const labels = { pending: 'در حال بررسی', completed: 'تکمیل شده', cancelled: 'لغو شده' };
    return labels[status] || status;
}

async function renderProfile() {
    const container = document.getElementById('profileContainer');
    const user = getCurrentUser();

    if (!user) {
        container.innerHTML = `<p>برای مشاهده پنل کاربری ابتدا <a href="login.html">وارد شوید</a>.</p>`;
        return;
    }

    let orders = [];
    try {
        ({ orders } = await apiGet('orders/get_my_orders.php'));
    } catch (err) {
        showToast('خطا در دریافت سفارش‌ها.', 'error');
    }

    let ordersHtml = '';
    if (orders.length === 0) {
        ordersHtml = `<p>شما هنوز سفارشی ثبت نکرده‌اید. <a href="products.html">مشاهده محصولات</a></p>`;
    } else {
        orders.forEach(order => {
            ordersHtml += `
                <div class="order-card">
                    <p><strong>شماره سفارش:</strong> #${order.id}</p>
                    <p><strong>تاریخ:</strong> ${order.created_at}</p>
                    <p><strong>مبلغ:</strong> ${formatPrice(order.total_price)} تومان</p>
                    <p><strong>وضعیت:</strong> <span class="status-${order.status}">${statusLabel(order.status)}</span></p>
                    <a href="order-success.html?order=${order.id}" class="btn-small">مشاهده جزئیات</a>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="profile-page">
            <h2>پنل کاربری</h2>
            <div class="user-info">
                <p><strong>نام:</strong> ${user.full_name}</p>
                <p><strong>ایمیل:</strong> ${user.email}</p>
            </div>
            <h3>سفارش‌های من</h3>
            <div class="orders-list">${ordersHtml}</div>
        </div>
    `;
}

document.addEventListener('diba:user-ready', renderProfile);
