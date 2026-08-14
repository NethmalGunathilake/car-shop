async function checkAdmin() {
    const { user } = await api('/auth/me');
    if (!user || user.role !== 'admin') {
        alert('Admin access only.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('cars-tab').style.display = btn.dataset.tab === 'cars-tab' ? 'block' : 'none';
        document.getElementById('orders-tab').style.display = btn.dataset.tab === 'orders-tab' ? 'block' : 'none';
        document.getElementById('accessories-tab').style.display = btn.dataset.tab === 'accessories-tab' ? 'block' : 'none';
        if (btn.dataset.tab === 'orders-tab') loadOrders();
        if (btn.dataset.tab === 'accessories-tab') loadAccessoriesTable();
    });
});

const carsTableBody = document.getElementById('cars-table-body');

async function loadCarsTable() {
    carsTableBody.innerHTML = '<tr><td colspan="4"><div class="loading-wrap"><div class="loading-spinner"></div></div></td></tr>';
    const cars = await api('/cars');
    carsTableBody.innerHTML = cars.map((car, i) => `
    <tr style="animation-delay: ${i * 0.05}s">
        <td>${car.year} ${car.make} ${car.model}</td>
        <td>${formatPrice(car.price)}</td>
        <td>${car.stock}</td>
        <td>
            <button onclick='editCar(${JSON.stringify(car)})'>Edit</button>
            <button onclick="deleteCar(${car.id})">Delete</button>
        </td>
    </tr>
`).join('');
}

const carForm = document.getElementById('car-form');
const newCarBtn = document.getElementById('new-car-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');
const carFormError = document.getElementById('car-form-error');

function showForm() { carForm.style.display = 'block'; }
function hideForm() {
    carForm.style.display = 'none';
    carForm.reset();
    document.getElementById('car-id').value = '';
    carFormError.textContent = '';
}

newCarBtn.addEventListener('click', () => { hideForm(); showForm(); });
cancelFormBtn.addEventListener('click', hideForm);

function editCar(car) {
    showForm();
    document.getElementById('car-id').value = car.id;
    document.getElementById('f-make').value = car.make;
    document.getElementById('f-model').value = car.model;
    document.getElementById('f-year').value = car.year;
    document.getElementById('f-price').value = car.price;
    document.getElementById('f-mileage').value = car.mileage;
    document.getElementById('f-stock').value = car.stock;
    document.getElementById('f-image').value = car.image_url;
    document.getElementById('f-description').value = car.description;
}

carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('car-id').value;
    const payload = {
        make: document.getElementById('f-make').value,
        model: document.getElementById('f-model').value,
        year: Number(document.getElementById('f-year').value),
        price: Number(document.getElementById('f-price').value),
        mileage: Number(document.getElementById('f-mileage').value) || 0,
        stock: Number(document.getElementById('f-stock').value) || 0,
        image_url: document.getElementById('f-image').value,
        description: document.getElementById('f-description').value
    };
    try {
        if (id) {
            await api(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await api('/cars', { method: 'POST', body: JSON.stringify(payload) });
        }
        hideForm();
        loadCarsTable();
    } catch (err) {
        carFormError.textContent = err.message;
    }
});

async function deleteCar(id) {
    if (!confirm('Delete this car?')) return;
    await api(`/cars/${id}`, { method: 'DELETE' });
    loadCarsTable();
}

const ordersTableBody = document.getElementById('orders-table-body');

async function loadOrders() {
    ordersTableBody.innerHTML = '<tr><td colspan="5"><div class="loading-wrap"><div class="loading-spinner"></div></div></td></tr>';
    const orders = await api('/orders/all');
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="5">No orders yet.</td></tr>';
        return;
    }
    ordersTableBody.innerHTML = orders.map((o, i) => `
    <tr style="animation-delay: ${i * 0.05}s">
        <td>#${o.id}</td>
        <td>${o.customer_name}</td>
        <td>${formatPrice(o.total)}</td>
        <td>${o.status}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
    </tr>
`).join('');
}

(async function init() {
    const ok = await checkAdmin();
    if (ok) loadCarsTable();
})();

const accessoriesTableBody = document.getElementById('accessories-table-body');
const accessoryForm = document.getElementById('accessory-form');
const newAccessoryBtn = document.getElementById('new-accessory-btn');
const cancelAccessoryFormBtn = document.getElementById('cancel-accessory-form-btn');
const accessoryFormError = document.getElementById('accessory-form-error');

async function loadAccessoriesTable() {
    const items = await api('/accessories');
    accessoriesTableBody.innerHTML = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${formatPrice(item.price)}</td>
            <td>${item.stock}</td>
            <td>
                <button onclick='editAccessory(${JSON.stringify(item)})'>Edit</button>
                <button onclick="deleteAccessory(${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function showAccessoryForm() { accessoryForm.style.display = 'block'; }
function hideAccessoryForm() {
    accessoryForm.style.display = 'none';
    accessoryForm.reset();
    document.getElementById('a-id').value = '';
    accessoryFormError.textContent = '';
}

newAccessoryBtn.addEventListener('click', () => { hideAccessoryForm(); showAccessoryForm(); });
cancelAccessoryFormBtn.addEventListener('click', hideAccessoryForm);

function editAccessory(item) {
    showAccessoryForm();
    document.getElementById('a-id').value = item.id;
    document.getElementById('a-name').value = item.name;
    document.getElementById('a-category').value = item.category;
    document.getElementById('a-price').value = item.price;
    document.getElementById('a-stock').value = item.stock;
    document.getElementById('a-image').value = item.image_url;
    document.getElementById('a-description').value = item.description;
}

accessoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('a-id').value;
    const payload = {
        name: document.getElementById('a-name').value,
        category: document.getElementById('a-category').value,
        price: Number(document.getElementById('a-price').value),
        stock: Number(document.getElementById('a-stock').value) || 0,
        image_url: document.getElementById('a-image').value,
        description: document.getElementById('a-description').value
    };
    try {
        if (id) {
            await api(`/accessories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        } else {
            await api('/accessories', { method: 'POST', body: JSON.stringify(payload) });
        }
        hideAccessoryForm();
        loadAccessoriesTable();
    } catch (err) {
        accessoryFormError.textContent = err.message;
    }
});

async function deleteAccessory(id) {
    if (!confirm('Delete this accessory?')) return;
    await api(`/accessories/${id}`, { method: 'DELETE' });
    loadAccessoriesTable();
}