// Function to check password strength
function isPasswordStrong(password) {
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordPattern.test(password);
}

// Function to show notifications
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = isError ? '#dc3545' : '#28a745';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to hash the password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to load users from localStorage
function loadUsers() {
    const users = localStorage.getItem('usersDB');
    return users ? JSON.parse(users) : {};
}

// Function to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('usersDB', JSON.stringify(users));
}

// Function to register a new user
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!isPasswordStrong(password)) {
        showNotification('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.', true);
        return;
    }

    const usersDB = loadUsers();

    if (username in usersDB) {
        showNotification('Username already exists! Please try another one.', true);
    } else {
        const hashedPassword = await hashPassword(password);
        usersDB[username] = hashedPassword;
        saveUsers(usersDB);
        showNotification('User registered successfully!');
        clearFields();
    }
}

// Function to login a user
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const hashedPassword = await hashPassword(password);
    const usersDB = loadUsers();

    if (username in usersDB && usersDB[username] === hashedPassword) {
        localStorage.setItem('loggedInUser', username);
        send2FACode(username);
        showNotification('2FA code sent. Please check your email.');
    } else {
        showNotification('Invalid username or password!', true);
    }
}

// Simulate sending 2FA code
function send2FACode(username) {
    const code = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code
    localStorage.setItem('2faCode', code);
    document.getElementById('2fa-prompt').style.display = 'block';
    document.querySelector('.container').style.display = 'none';
    console.log(`2FA Code for ${username}: ${code}`); // Simulate sending the code
}

// Function to verify 2FA code
function verify2FA() {
    const inputCode = document.getElementById('2fa-code').value;
    const savedCode = localStorage.getItem('2faCode');

    if (inputCode == savedCode) {
        const username = localStorage.getItem('loggedInUser');
        accessSecuredPage(username);
        localStorage.removeItem('2faCode');
    } else {
        showNotification('Invalid 2FA code!', true);
    }
}

// Function to logout a user
function logout() {
    localStorage.removeItem('loggedInUser');
    showNotification('You have been logged out.');
    location.reload();
}

// Function to access the secured page
function accessSecuredPage(username) {
    document.getElementById('secured-page').style.display = 'block';
    document.getElementById('2fa-prompt').style.display = 'none';
    document.getElementById('user-name').innerText = username;
}

// Function to clear input fields
function clearFields() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Auto-login if already logged in
window.onload = function() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        send2FACode(loggedInUser);
    }
};

// Toggle Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Simulate "Forgot Password" functionality
function forgotPassword() {
    showNotification('Password reset link sent to your email.');
}
