const itemsWrap = document.getElementById('cart-items');
const summaryWrap = document.getElementById('cart-summary');
const totalEl = document.getElementById('cart-total');
const stripe = Stripe('pk_test_51U3un8RqaKujsIoOtN7tcSp3iNGruuSVlaBBu83cj1w12GuuRBCbipaDB6w1jFeZaZm68qlnwdo7xou3YJiGgpQO00iyS3ZJwB');
const elements = stripe.elements();
const stripeInputStyle = {
    style: {
        base: {
            color: '#e8e8e8',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '16px',
            '::placeholder': { color: '#6b7078' }
        }
    }
};

const cardNumberElement = elements.create('cardNumber', stripeInputStyle);
const cardExpiryElement = elements.create('cardExpiry', stripeInputStyle);
const cardCvcElement = elements.create('cardCvc', stripeInputStyle);

const checkoutBtn = document.getElementById('checkout-btn');
const paymentFormWrap = document.getElementById('payment-form-wrap');
const payBtn = document.getElementById('pay-btn');
const paymentStatus = document.getElementById('payment-status');
let currentOrderTotal = 0;

async function loadCart() {
    itemsWrap.innerHTML = '<div class="loading-wrap"><div class="loading-spinner"></div><p>Loading your cart...</p></div>';
    try {
        const items = await api('/cart');
        lastLoadedItems = items;
        renderCart(items);
    } catch (err) {
        if (err.message.includes('logged in')) {
            window.location.href = 'login.html';
        } else {
            itemsWrap.innerHTML = `<p>${err.message}</p>`;
        }
    }
}

function renderCart(items) {
    if (items.length === 0) {
        itemsWrap.innerHTML = '<p>Your cart is empty. <a href="index.html">Browse cars</a></p>';
        summaryWrap.style.display = 'none';
        return;
    }

    itemsWrap.innerHTML = items.map((item, i) => {
        const label = item.item_type === 'car'
            ? `${item.year} ${item.make} ${item.model}`
            : `${item.name} <span class="category-tag">${item.category}</span>`;

        return `
            <div class="cart-item" style="animation-delay: ${i * 0.08}s">
                <div>
                    <strong>${label}</strong><br>
                    <span class="price">${formatPrice(item.price)}</span>
                </div>
                <div class="qty-controls">
                    <button onclick="changeQty(${item.cart_id}, ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${item.cart_id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${item.cart_id})">Remove</button>
            </div>
        `;
    }).join('');

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalEl.textContent = `Total: ${formatPrice(total)}`;
    summaryWrap.style.display = 'block';
}

async function changeQty(cartId, newQty) {
    if (newQty < 1) return removeItem(cartId);
    await api(`/cart/${cartId}`, { method: 'PUT', body: JSON.stringify({ quantity: newQty }) });
    loadCart();
    refreshNav();
}

async function removeItem(cartId) {
    await api(`/cart/${cartId}`, { method: 'DELETE' });
    loadCart();
    refreshNav();
}

checkoutBtn.addEventListener('click', () => {
    const items = lastLoadedItems;
    if (!items || items.length === 0) return;

    currentOrderTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    checkoutBtn.style.display = 'none';
    paymentFormWrap.style.display = 'block';
    cardNumberElement.mount('#card-number-element');
    cardExpiryElement.mount('#card-expiry-element');
    cardCvcElement.mount('#card-cvc-element');
});

payBtn.addEventListener('click', async () => {
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="spinner"></span> Processing...';

    try {
        const { clientSecret } = await api('/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify({ amount: currentOrderTotal })
        });

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardNumberElement }
        });

        if (result.error) {
            paymentStatus.textContent = result.error.message;
            payBtn.disabled = false;
            payBtn.innerHTML = 'Pay Now';
            return;
        }

        const order = await api('/orders', { method: 'POST' });
        showToast(`Payment successful! Order #${order.orderId} confirmed.`);
paymentFormWrap.style.display = 'none';
loadCart();
refreshNav();
    } catch (err) {
        paymentStatus.textContent = err.message;
        payBtn.disabled = false;
        payBtn.innerHTML = 'Pay Now';
    }
});

loadCart();