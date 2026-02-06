document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');
    const toggleIcon = toggleButton.querySelector('i');

    // Mock credentials
    const VALID_EMAIL = 'recruiter@intellihire.com';
    const VALID_PASSWORD = 'password123';

    // Password visibility toggle
    toggleButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'password') {
            toggleIcon.classList.remove('ph-eye');
            toggleIcon.classList.add('ph-eye-slash');
        } else {
            toggleIcon.classList.remove('ph-eye-slash');
            toggleIcon.classList.add('ph-eye');
        }
    });

    // Form validation
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Reset previous error states
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');

        const email = emailInput.value;
        const password = passwordInput.value;

        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            // Success state
            const submitBtn = loginForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Signing in...';
            submitBtn.style.backgroundColor = '#10B981'; // Success Green

            setTimeout(() => {
                alert('Login Successful! Welcome back.');
                submitBtn.innerText = originalText;
                submitBtn.style.backgroundColor = '';
                // In a real app, you would redirect here
                // window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            // Error state
            if (email !== VALID_EMAIL) {
                emailInput.classList.add('error');
            }
            if (password !== VALID_PASSWORD) {
                passwordInput.classList.add('error');
            }

            // Shake animation or visual feedback could go here
            alert('Invalid credentials. Please use the demo account.');
        }
    });

    // Quick fill for demo (optional, makes testing easier)
    // emailInput.value = VALID_EMAIL;
    // passwordInput.value = VALID_PASSWORD;
});
