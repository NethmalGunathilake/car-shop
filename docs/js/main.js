const grid = document.getElementById('car-grid');

async function loadCars(params = {}) {
    grid.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Loading cars...</p></div>';
    try {
        const query = new URLSearchParams(params).toString();
        const cars = await api(`/cars${query ? '?' + query : ''}`);
        renderCars(cars);
    } catch (err) {
        grid.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

function renderCars(cars) {
    if (cars.length === 0) {
        grid.innerHTML = '<p>No cars available.</p>';
        return;
    }

    grid.innerHTML = cars.map((car, i) => `
        <div class="car-card" style="animation-delay: ${i * 0.08}s">
            <a href="car-details.html?id=${car.id}">
                <img src="${car.image_url || 'https://via.placeholder.com/400x250?text=No+Image'}" alt="${car.make} ${car.model}">
                <h3>${car.year} ${car.make} ${car.model}</h3>
            </a>
            <p class="price">${formatPrice(car.price)}</p>
            <button onclick="addToCart(${car.id})">Add to Cart</button>
        </div>
    `).join('');
}

async function addToCart(carId) {
    try {
        await api('/cart', { method: 'POST', body: JSON.stringify({ car_id: carId, quantity: 1 }) });
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
    loadCars({
        search: document.getElementById('search-input').value.trim(),
        minPrice: document.getElementById('min-price').value,
        maxPrice: document.getElementById('max-price').value
    });
});

loadCars();