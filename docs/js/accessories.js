const grid = document.getElementById('car-grid');

async function loadAccessories(params = {}) {
    grid.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Loading cars...</p></div>';
    try {
        const query = new URLSearchParams(params).toString();
        const items = await api(`/accessories${query ? '?' + query : ''}`);
        renderAccessories(items);
    } catch (err) {
        grid.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

function renderAccessories(items) {
    if (items.length === 0) {
        grid.innerHTML = '<p>No accessories found.</p>';
        return;
    }

    grid.innerHTML = items.map((item, i) => `
        <div class="car-card" style="animation-delay: ${i * 0.08}s">
            <img src="${item.image_url || 'https://via.placeholder.com/400x250?text=No+Image'}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="category-tag">${item.category}</p>
            <p class="price">${formatPrice(item.price)}</p>
            <button onclick="addAccessoryToCart(${item.id})" ${item.stock === 0 ? 'disabled' : ''}>
                ${item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `).join('');
}

async function addAccessoryToCart(accessoryId) {
    try {
        await api('/cart', { method: 'POST', body: JSON.stringify({ accessory_id: accessoryId, quantity: 1 }) });
        refreshNav();
        alert('Added to cart!');
    } catch (err) {
        if (err.message.includes('logged in')) {
            window.location.href = 'login.html';
        } else {
            alert(err.message);
        }
    }
}

document.getElementById('filter-btn').addEventListener('click', () => {
    loadAccessories({
        search: document.getElementById('search-input').value.trim(),
        category: document.getElementById('category-filter').value
    });
});

loadAccessories();