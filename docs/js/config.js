const API_BASE = 'http://127.0.0.1:5000/api';

async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
    }
    return data;
}

function formatPrice(n) {
    return '$' + Number(n).toLocaleString('en-US');
}

async function refreshNav() {
    const authLink = document.getElementById('auth-link');
    const cartCount = document.getElementById('cart-count');
    const cartLink = document.getElementById('cart-link');
    if (!authLink) return;

    const { user } = await api('/auth/me');

    if (user) {
        if (cartLink) cartLink.style.display = 'inline';
        authLink.textContent = `Logout (${user.name})`;
        authLink.href = '#';
        authLink.onclick = async (e) => {
    e.preventDefault();
    await api('/auth/logout', { method: 'POST' });
    showToast('Logged out successfully.');
    setTimeout(() => window.location.href = 'index.html', 800);
};

        const cart = await api('/cart');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = count;
    } else {
        if (cartLink) cartLink.style.display = 'none';
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', refreshNav);

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}