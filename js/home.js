function renderCategories(categories) {
    const list = document.getElementById('categoryList');
    if (!list) return;
    categories.forEach(cat => {
        const link = document.createElement('a');
        link.href = `products.html?category=${cat.id}`;
        link.className = 'category-item';
        link.textContent = cat.name;
        list.appendChild(link);
    });
}

function renderHomeSections(products, categories) {
    const container = document.getElementById('productSections');
    if (!container) return;
    const append = (section) => { if (section) container.appendChild(section); };

    const newest = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
    append(createProductSection('جدیدترین محصولات', newest));

    const discounted = products.filter(p => p.discount_price).slice(0, 8);
    append(createProductSection('پیشنهادهای شگفت‌انگیز (تخفیف‌دار)', discounted));

    const bestSellers = [...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, 8);
    append(createProductSection('پرفروش‌ترین‌ها', bestSellers));

    categories.forEach(cat => {
        const items = products.filter(p => p.category_id === cat.id).slice(0, 8);
        append(createProductSection(cat.name, items, `products.html?category=${cat.id}`));
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [{ categories }, { products }] = await Promise.all([
            apiGet('categories/get_categories.php'),
            apiGet('products/get_products.php')
        ]);
        renderCategories(categories);
        renderHomeSections(products, categories);
        initScrollAnimations();
    } catch (err) {
        console.error(err);
        showToast('خطا در دریافت اطلاعات از سرور.', 'error');
    }
});
