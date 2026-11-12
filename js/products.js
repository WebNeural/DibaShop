function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderFilterBar(categories, activeCategoryId) {
    const bar = document.getElementById('filterBar');
    if (!bar) return;

    const allLink = document.createElement('a');
    allLink.href = 'products.html';
    allLink.textContent = 'همه';
    allLink.className = activeCategoryId ? '' : 'active';
    bar.appendChild(allLink);

    categories.forEach(cat => {
        const link = document.createElement('a');
        link.href = `products.html?category=${cat.id}`;
        link.textContent = cat.name;
        link.className = (activeCategoryId && parseInt(activeCategoryId) === cat.id) ? 'active' : '';
        bar.appendChild(link);
    });
}

function renderProductGrid(products) {
    const grid = document.getElementById('productGrid');
    const emptyMsg = document.getElementById('emptyMessage');
    if (!grid) return;

    if (products.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }
    products.forEach(p => grid.appendChild(createProductCard(p)));
}

document.addEventListener('DOMContentLoaded', async () => {
    const categoryId = getQueryParam('category');

    try {
        const [{ categories }, { products }] = await Promise.all([
            apiGet('categories/get_categories.php'),
            apiGet(categoryId ? `products/get_products.php?category_id=${categoryId}` : 'products/get_products.php')
        ]);

        if (categoryId) {
            const cat = categories.find(c => c.id === parseInt(categoryId));
            document.getElementById('categoryTitle').textContent = cat ? cat.name : 'محصولات';
        }

        renderFilterBar(categories, categoryId);
        renderProductGrid(products);
        initScrollAnimations();
    } catch (err) {
        console.error(err);
        showToast('خطا در دریافت محصولات.', 'error');
    }
});
