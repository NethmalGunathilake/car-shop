const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const formError = document.getElementById('form-error');

if (loginForm) {
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            showToast('Login successful! Welcome back.');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch (err) {
            formError.textContent = err.message;
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    });
}

if (registerForm) {
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.textContent = '';
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating account...';

        try {
            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });
            showToast('Account created! Welcome to Veloce Motors.');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch (err) {
            formError.textContent = err.message;
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Register';
        }
    });
}