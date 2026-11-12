function showError(message) {
    const box = document.getElementById('errorBox');
    if (!box) return;
    box.textContent = message;
    box.style.display = 'block';
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const full_name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        if (!full_name || !email || !password) {
            showError('لطفاً همه فیلدها را پر کنید.');
            return;
        }

        try {
            await apiPost('auth/register.php', { full_name, email, password });
            showToast('ثبت‌نام با موفقیت انجام شد!', 'success');
            setTimeout(() => window.location.href = 'index.html', 800);
        } catch (err) {
            showError(err.message);
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        try {
            await apiPost('auth/login.php', { email, password });
            showToast('با موفقیت وارد شدید.', 'success');
            setTimeout(() => window.location.href = 'index.html', 600);
        } catch (err) {
            showError(err.message);
        }
    });
}
