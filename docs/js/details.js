const wrap = document.getElementById('detail-wrap');
const params = new URLSearchParams(window.location.search);
const carId = params.get('id');

async function loadDetails() {
    if (!carId) {
        wrap.innerHTML = '<p>No car selected.</p>';
        return;
    }
    try {
        const car = await api(`/cars/${carId}`);
        wrap.innerHTML = `
            <div class="detail-grid">
                <img src="${car.image_url || 'https://via.placeholder.com/500x350?text=No+Image'}" alt="${car.make} ${car.model}">
                <div>
                    <h1>${car.year} ${car.make} ${car.model}</h1>
                    <p class="detail-price">${formatPrice(car.price)}</p>
                    <p class="detail-meta">${car.mileage.toLocaleString()} miles &middot; ${car.stock > 0 ? car.stock + ' in stock' : 'Out of stock'}</p>
                    <p class="detail-desc">${car.description || 'No description provided.'}</p>
                    <button id="add-to-cart-btn" ${car.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
                    <p id="add-status"></p>
                </div>
            </div>
        `;
        document.getElementById('add-to-cart-btn').addEventListener('click', addToCart);
    } catch (err) {
        wrap.innerHTML = `<p>${err.message}</p>`;
    }
}

async function addToCart() {
    const status = document.getElementById('add-status');
    try {
        await api('/cart', { method: 'POST', body: JSON.stringify({ car_id: Number(carId), quantity: 1 }) });
        status.textContent = 'Added to cart!';
        refreshNav();
    } catch (err) {
        if (err.message.includes('logged in')) {
            window.location.href = 'login.html';
        } else {
            status.textContent = err.message;
        }
    }
}

loadDetails();