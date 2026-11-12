let ADMIN_TAB = 'dashboard';
let ADMIN_CATEGORIES = [];

function statusLabel(status) {
    const labels = { pending: 'در حال بررسی', completed: 'تکمیل شده', cancelled: 'لغو شده' };
    return labels[status] || status;
}

function adminShell(innerHtml) {
    return `
        <div class="admin-panel">
            <nav class="admin-nav">
                <a href="#" data-tab="dashboard" class="${ADMIN_TAB === 'dashboard' ? 'active' : ''}">داشبورد</a>
                <a href="#" data-tab="products" class="${ADMIN_TAB === 'products' ? 'active' : ''}">محصولات</a>
                <a href="#" data-tab="categories" class="${ADMIN_TAB === 'categories' ? 'active' : ''}">دسته‌بندی‌ها</a>
                <a href="#" data-tab="orders" class="${ADMIN_TAB === 'orders' ? 'active' : ''}">سفارش‌ها</a>
                <a href="#" data-tab="users" class="${ADMIN_TAB === 'users' ? 'active' : ''}">کاربران</a>
            </nav>
            <div id="adminTabContent">${innerHtml}</div>
        </div>
    `;
}

function bindTabNav(container) {
    container.querySelectorAll('.admin-nav a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            ADMIN_TAB = a.dataset.tab;
            renderAdmin();
        });
    });
}

async function renderDashboard() {
    const container = document.getElementById('adminContainer');
    try {
        const { stats } = await apiGet('admin/get_stats.php');
        container.innerHTML = adminShell(`
            <div class="stats-grid">
                <div class="stat-box"><h3>${stats.products_count}</h3><p>تعداد محصولات</p></div>
                <div class="stat-box"><h3>${stats.users_count}</h3><p>تعداد کاربران</p></div>
                <div class="stat-box"><h3>${stats.orders_count}</h3><p>تعداد سفارش‌ها</p></div>
                <div class="stat-box"><h3>${stats.pending_orders_count}</h3><p>سفارش‌های در انتظار بررسی</p></div>
                <div class="stat-box"><h3>${formatPrice(stats.revenue)}</h3><p>درآمد از سفارش‌های تکمیل‌شده (تومان)</p></div>
            </div>
        `);
        bindTabNav(container);
    } catch (err) {
        container.innerHTML = adminShell(`<p>خطا در دریافت آمار: ${err.message}</p>`);
        bindTabNav(container);
    }
}

let editingProductId = null;

function productFormHtml(product = null) {
    const currentImage = product ? product.image : 'placeholder.jpg';
    return `
        <form id="productForm" class="admin-form">
            <label>نام محصول</label>
            <input type="text" id="pf_name" required value="${product ? product.name : ''}">

            <label>دسته‌بندی</label>
            <select id="pf_category">
                <option value="">بدون دسته‌بندی</option>
                ${ADMIN_CATEGORIES.map(c => `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>

            <label>قیمت (تومان)</label>
            <input type="number" id="pf_price" required min="0" value="${product ? product.price : ''}">

            <label>قیمت با تخفیف (اختیاری)</label>
            <input type="number" id="pf_discount" min="0" value="${product && product.discount_price ? product.discount_price : ''}">

            <label>موجودی</label>
            <input type="number" id="pf_stock" required min="0" value="${product ? product.stock : 0}">

            <label>تصویر محصول</label>
            <div style="display:flex; align-items:center; gap:14px;">
                <img id="pf_image_preview" src="assets/images/${currentImage}" alt="پیش‌نمایش" style="width:70px; height:70px; object-fit:cover; border-radius:8px; border:1px solid var(--border);">
                <input type="file" id="pf_image_file" accept="image/jpeg,image/png,image/webp,image/gif" style="flex-grow:1;">
            </div>
            <input type="hidden" id="pf_image_current" value="${currentImage}">
            <p style="font-size:12px; color:var(--muted); margin-top:-6px;">جی‌پگ، پی‌ان‌جی، وب‌پی یا گیف — حداکثر ۵ مگابایت. اگه چیزی انتخاب نکنی، عکس فعلی می‌مونه.</p>

            <label>توضیحات</label>
            <textarea id="pf_description" rows="3">${product && product.description ? product.description : ''}</textarea>

            <div style="display:flex; gap:10px;">
                <button type="submit" class="btn btn-gold">${product ? 'ذخیره تغییرات' : 'افزودن محصول'}</button>
                <button type="button" id="cancelProductForm" class="btn">انصراف</button>
            </div>
        </form>
    `;
}

async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('api/products/upload_image.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    });

    let data;
    try { data = await res.json(); }
    catch { throw new Error('پاسخ سرور نامعتبر بود.'); }

    if (!res.ok || data.success === false) {
        throw new Error(data.message || 'خطا در آپلود تصویر.');
    }
    return data.filename;
}

async function renderProducts() {
    const container = document.getElementById('adminContainer');
    try {
        const [{ products }, { categories }] = await Promise.all([
            apiGet('products/get_products.php'),
            apiGet('categories/get_categories.php')
        ]);
        ADMIN_CATEGORIES = categories;

        const rows = products.map(p => {
            const cat = categories.find(c => c.id === p.category_id);
            return `
                <tr>
                    <td><img class="admin-thumb" src="assets/images/${p.image}" alt=""></td>
                    <td>${p.name}</td>
                    <td>${cat ? cat.name : '—'}</td>
                    <td>${formatPrice(p.discount_price || p.price)} تومان</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="btn-small edit-product-btn" data-id="${p.id}">ویرایش</button>
                        <button class="btn-small delete-product-btn" data-id="${p.id}">حذف</button>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = adminShell(`
            <div class="admin-form-inline">
                <button id="showAddProductBtn" class="btn btn-gold">+ افزودن محصول جدید</button>
            </div>
            <div id="productFormWrap"></div>
            <table class="admin-table">
                <thead><tr><th>تصویر</th><th>نام</th><th>دسته‌بندی</th><th>قیمت</th><th>موجودی</th><th>عملیات</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `);
        bindTabNav(container);

        document.getElementById('showAddProductBtn').addEventListener('click', () => {
            editingProductId = null;
            document.getElementById('productFormWrap').innerHTML = productFormHtml(null);
            bindProductForm(products);
        });

        container.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = products.find(p => p.id === parseInt(btn.dataset.id));
                editingProductId = product.id;
                document.getElementById('productFormWrap').innerHTML = productFormHtml(product);
                bindProductForm(products);
            });
        });

        container.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('محصول حذف شود؟')) return;
                try {
                    await apiPost('products/delete_product.php', { id: parseInt(btn.dataset.id) });
                    showToast('محصول حذف شد.', 'success');
                    renderProducts();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });

    } catch (err) {
        container.innerHTML = adminShell(`<p>خطا: ${err.message}</p>`);
        bindTabNav(container);
    }
}

function bindProductForm() {
    const form = document.getElementById('productForm');
    document.getElementById('cancelProductForm').addEventListener('click', () => {
        document.getElementById('productFormWrap').innerHTML = '';
    });

    const fileInput = document.getElementById('pf_image_file');
    const preview = document.getElementById('pf_image_preview');
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        preview.src = URL.createObjectURL(file);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            let imageFilename = document.getElementById('pf_image_current').value;
            const file = fileInput.files[0];

            if (file) {
                submitBtn.textContent = 'در حال آپلود عکس...';
                imageFilename = await uploadProductImage(file);
            }

            const payload = {
                name: document.getElementById('pf_name').value.trim(),
                category_id: document.getElementById('pf_category').value || null,
                price: parseInt(document.getElementById('pf_price').value),
                discount_price: document.getElementById('pf_discount').value || null,
                stock: parseInt(document.getElementById('pf_stock').value),
                image: imageFilename,
                description: document.getElementById('pf_description').value.trim()
            };

            submitBtn.textContent = editingProductId ? 'در حال ذخیره...' : 'در حال افزودن...';

            if (editingProductId) {
                await apiPost('products/update_product.php', { id: editingProductId, ...payload });
                showToast('محصول ویرایش شد.', 'success');
            } else {
                await apiPost('products/add_product.php', payload);
                showToast('محصول اضافه شد.', 'success');
            }
            renderProducts();
        } catch (err) {
            showToast(err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = editingProductId ? 'ذخیره تغییرات' : 'افزودن محصول';
        }
    });
}

async function renderCategories() {
    const container = document.getElementById('adminContainer');
    try {
        const { categories } = await apiGet('categories/get_categories.php');
        ADMIN_CATEGORIES = categories;

        const rows = categories.map(c => `
            <tr id="cat-row-${c.id}">
                <td>${c.id}</td>
                <td class="cat-name-cell" id="cat-name-${c.id}">${c.name}</td>
                <td class="cat-actions-cell" id="cat-actions-${c.id}">
                    <button class="btn-small edit-cat-btn" data-id="${c.id}">ویرایش</button>
                    <button class="btn-small delete-cat-btn" data-id="${c.id}">حذف</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = adminShell(`
            <form id="addCategoryForm" class="admin-form-inline">
                <input type="text" id="newCategoryName" placeholder="نام دسته‌بندی جدید" required>
                <button type="submit" class="btn btn-gold">افزودن</button>
            </form>
            <table class="admin-table">
                <thead><tr><th>شناسه</th><th>نام</th><th>عملیات</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `);
        bindTabNav(container);

        document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('newCategoryName').value.trim();
            if (!name) return;
            try {
                await apiPost('categories/add_category.php', { name });
                showToast('دسته‌بندی اضافه شد.', 'success');
                renderCategories();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        function bindCategoryRowActions() {
            container.querySelectorAll('.edit-cat-btn').forEach(btn => {
                btn.addEventListener('click', () => startEditCategory(parseInt(btn.dataset.id)));
            });
            container.querySelectorAll('.delete-cat-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteCategory(parseInt(btn.dataset.id)));
            });
        }

        function startEditCategory(id) {
            const cat = categories.find(c => c.id === id);
            const nameCell = document.getElementById(`cat-name-${id}`);
            const actionsCell = document.getElementById(`cat-actions-${id}`);

            nameCell.innerHTML = `<input type="text" id="edit-cat-input-${id}" value="${cat.name}" style="padding:6px 10px; border:1px solid var(--border); border-radius:5px; font-family:var(--font-body); width:100%;">`;
            actionsCell.innerHTML = `
                <button class="btn-small save-cat-btn" data-id="${id}">ذخیره</button>
                <button class="btn-small cancel-cat-btn" data-id="${id}">انصراف</button>
            `;

            document.getElementById(`edit-cat-input-${id}`).focus();

            actionsCell.querySelector('.save-cat-btn').addEventListener('click', async () => {
                const newName = document.getElementById(`edit-cat-input-${id}`).value.trim();
                if (!newName) { showToast('نام نمی‌تواند خالی باشد.', 'error'); return; }
                try {
                    await apiPost('categories/update_category.php', { id, name: newName });
                    showToast('دسته‌بندی ویرایش شد.', 'success');
                    renderCategories();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });

            actionsCell.querySelector('.cancel-cat-btn').addEventListener('click', () => {
                renderCategories();
            });
        }

        async function deleteCategory(id) {
            if (!confirm('این دسته‌بندی حذف شود؟')) return;
            try {
                await apiPost('categories/delete_category.php', { id });
                showToast('دسته‌بندی حذف شد.', 'success');
                renderCategories();
            } catch (err) {
                showToast(err.message, 'error');
            }
        }

        bindCategoryRowActions();

    } catch (err) {
        container.innerHTML = adminShell(`<p>خطا: ${err.message}</p>`);
        bindTabNav(container);
    }
}

async function renderOrders() {
    const container = document.getElementById('adminContainer');
    try {
        const { orders } = await apiGet('orders/get_all_orders.php');

        const rows = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.full_name}<br><span style="color:var(--muted); font-size:12px;">${o.email}</span></td>
                <td>${formatPrice(o.total_price)} تومان</td>
                <td>${o.created_at}</td>
                <td>
                    <div class="status-form">
                        <select data-id="${o.id}" class="order-status-select">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>در حال بررسی</option>
                            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>تکمیل شده</option>
                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>لغو شده</option>
                        </select>
                    </div>
                </td>
                <td><button class="btn-small view-order-items-btn" data-id="${o.id}">مشاهده اقلام</button></td>
            </tr>
            <tr class="order-items-row" id="order-items-row-${o.id}" style="display:none;">
                <td colspan="6"><div class="order-items-detail" id="order-items-detail-${o.id}">در حال بارگذاری...</div></td>
            </tr>
        `).join('');

        container.innerHTML = adminShell(`
            <table class="admin-table">
                <thead><tr><th>شماره</th><th>مشتری</th><th>مبلغ</th><th>تاریخ</th><th>وضعیت</th><th>اقلام</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `);
        bindTabNav(container);

        container.querySelectorAll('.order-status-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                try {
                    await apiPost('orders/update_order_status.php', { id: parseInt(sel.dataset.id), status: sel.value });
                    showToast('وضعیت سفارش به‌روزرسانی شد.', 'success');
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });

        container.querySelectorAll('.view-order-items-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const row = document.getElementById(`order-items-row-${id}`);
                const isOpen = row.style.display !== 'none';

                if (isOpen) {
                    row.style.display = 'none';
                    btn.textContent = 'مشاهده اقلام';
                    return;
                }

                row.style.display = 'table-row';
                btn.textContent = 'بستن اقلام';
                const detailBox = document.getElementById(`order-items-detail-${id}`);

                try {
                    const { order } = await apiGet(`orders/get_order.php?id=${id}`);
                    detailBox.innerHTML = `
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${order.items.map(item => `
                                <div style="display:flex; align-items:center; gap:12px;">
                                    <img src="assets/images/${item.image}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
                                    <span>${item.name}</span>
                                    <span style="color:var(--muted);">× ${item.quantity}</span>
                                    <span style="margin-right:auto; font-weight:700;">${formatPrice(item.price * item.quantity)} تومان</span>
                                </div>
                            `).join('')}
                        </div>
                    `;
                } catch (err) {
                    detailBox.innerHTML = `<p>خطا در دریافت اقلام سفارش.</p>`;
                }
            });
        });

    } catch (err) {
        container.innerHTML = adminShell(`<p>خطا: ${err.message}</p>`);
        bindTabNav(container);
    }
}

async function renderUsers() {
    const container = document.getElementById('adminContainer');
    try {
        const { users } = await apiGet('users/get_users.php');
        const me = getCurrentUser();

        const rows = users.map(u => `
            <tr>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.role}">${u.role === 'admin' ? 'ادمین' : 'کاربر'}</span></td>
                <td>
                    <select data-id="${u.id}" class="user-role-select" ${u.id === me.id ? 'disabled' : ''}>
                        <option value="user" ${u.role === 'user' ? 'selected' : ''}>کاربر</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>ادمین</option>
                    </select>
                </td>
                <td>
                    <button class="btn-small delete-user-btn" data-id="${u.id}" ${u.id === me.id ? 'disabled' : ''}>حذف</button>
                </td>
            </tr>
        `).join('');

        container.innerHTML = adminShell(`
            <table class="admin-table">
                <thead><tr><th>نام</th><th>ایمیل</th><th>نقش</th><th>تغییر نقش</th><th>عملیات</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `);
        bindTabNav(container);

        container.querySelectorAll('.user-role-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                try {
                    await apiPost('users/update_user_role.php', { id: parseInt(sel.dataset.id), role: sel.value });
                    showToast('نقش کاربر تغییر کرد.', 'success');
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });

        container.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('این کاربر حذف شود؟')) return;
                try {
                    await apiPost('users/delete_user.php', { id: parseInt(btn.dataset.id) });
                    showToast('کاربر حذف شد.', 'success');
                    renderUsers();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });

    } catch (err) {
        container.innerHTML = adminShell(`<p>خطا: ${err.message}</p>`);
        bindTabNav(container);
    }
}

function renderAdmin() {
    if (ADMIN_TAB === 'dashboard') return renderDashboard();
    if (ADMIN_TAB === 'products') return renderProducts();
    if (ADMIN_TAB === 'categories') return renderCategories();
    if (ADMIN_TAB === 'orders') return renderOrders();
    if (ADMIN_TAB === 'users') return renderUsers();
}

document.addEventListener('diba:user-ready', () => {
    const user = getCurrentUser();
    const container = document.getElementById('adminContainer');

    if (!user) {
        container.innerHTML = `<p>برای دسترسی به پنل مدیریت ابتدا <a href="login.html">وارد شوید</a>.</p>`;
        return;
    }
    if (user.role !== 'admin') {
        container.innerHTML = `<p>شما اجازه‌ی دسترسی به پنل مدیریت را ندارید.</p>`;
        return;
    }
    renderAdmin();
});
