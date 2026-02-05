// Carica configurazione Firebase da file JSON
let firebaseConfig = {};
let auth, db;

async function loadFirebaseConfig() {
    try {
        const response = await fetch('firebase_config.json');
        firebaseConfig = await response.json();
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        initApp();
    } catch (error) {
        console.error('Errore nel caricamento della configurazione Firebase:', error);
        showLoginAlert('Errore nel caricamento della configurazione. Contattare l\'amministratore.');
    }
}

// Current user data
let currentUser = null;
let currentUserData = null;

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginAlert = document.getElementById('loginAlert');
const logoutBtn = document.getElementById('logoutBtn');
const userDropdownToggle = document.getElementById('userDropdownToggle');
const userDropdown = document.getElementById('userDropdown');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const userAvatar = document.getElementById('userAvatar');
const alertContainer = document.getElementById('alertContainer');

// Profile elements
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileRole = document.getElementById('profileRole');
const profilePhone = document.getElementById('profilePhone');
const profileAddress = document.getElementById('profileAddress');
const profileCreated = document.getElementById('profileCreated');
const lastLogin = document.getElementById('lastLogin');
const userId = document.getElementById('userId');
const saveProfileBtn = document.getElementById('saveProfileBtn');

// Password elements
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const passwordStrength = document.getElementById('passwordStrength');
const passwordStrengthText = document.getElementById('passwordStrengthText');

// Initialize the application
function initApp() {
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            await loadUserData(user.uid);
            showDashboard();
        } else {
            // No user is signed in
            showLogin();
        }
    });
    
    // Set up event listeners
    setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // User dropdown toggle
    if (userDropdownToggle) {
        userDropdownToggle.addEventListener('click', toggleUserDropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Profile events
    saveProfileBtn.addEventListener('click', saveProfile);
    changePasswordBtn.addEventListener('click', changePassword);
    
    // Password strength indicator
    if (newPassword) {
        newPassword.addEventListener('input', updatePasswordStrength);
    }
}

// Show login page
function showLogin() {
    loginPage.style.display = 'flex';
    dashboardPage.style.display = 'none';
    loginForm.reset();
    loginAlert.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    loginPage.style.display = 'none';
    dashboardPage.style.display = 'flex';
    updateUserDisplay();
}

// Toggle user dropdown
function toggleUserDropdown() {
    userDropdown.classList.toggle('show');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accesso in corso...';
    loginBtn.disabled = true;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        await loadUserData(currentUser.uid);
        showDashboard();
        showAlert('success', 'Accesso effettuato con successo!');
    } catch (error) {
        console.error('Login error:', error);
        showLoginAlert('Email o password non validi. Riprova.');
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Accedi';
        loginBtn.disabled = false;
    }
}

// Show login alert
function showLoginAlert(message) {
    loginAlert.textContent = message;
    loginAlert.className = 'alert alert-error';
    loginAlert.classList.remove('hidden');
}

// Load user data from Firestore
async function loadUserData(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            currentUserData = userDoc.data();
        } else {
            // Create user data if it doesn't exist
            currentUserData = {
                name: currentUser.displayName || currentUser.email.split('@')[0],
                email: currentUser.email,
                role: 'Operaio',
                phone: '',
                address: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            await db.collection('users').doc(uid).set(currentUserData);
        }
        
        // Update last login time
        await db.collection('users').doc(uid).update({
            lastLogin: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error loading user data:', error);
        showAlert('error', 'Errore nel caricamento dei dati utente');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    auth.signOut().then(() => {
        currentUser = null;
        currentUserData = null;
        showLogin();
        showAlert('success', 'Logout effettuato con successo');
    }).catch((error) => {
        console.error('Logout error:', error);
        showAlert('error', 'Errore durante il logout');
    });
}

// Update user display information
function updateUserDisplay() {
    if (!currentUserData) return;
    
    // Update navbar
    userName.textContent = currentUserData.name;
    userRole.textContent = currentUserData.role;
    userAvatar.textContent = getInitials(currentUserData.name);
    
    // Update profile page
    profileName.value = currentUserData.name;
    profileEmail.value = currentUserData.email;
    profileRole.value = currentUserData.role;
    profilePhone.value = currentUserData.phone || '';
    profileAddress.value = currentUserData.address || '';
    userId.textContent = currentUser.uid.substring(0, 8) + '...';
    
    // Format dates
    if (currentUserData.createdAt) {
        const createdDate = new Date(currentUserData.createdAt);
        profileCreated.textContent = createdDate.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    if (currentUserData.lastLogin) {
        const lastLoginDate = new Date(currentUserData.lastLogin);
        lastLogin.textContent = lastLoginDate.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Save profile changes
async function saveProfile() {
    if (!currentUser || !currentUserData) return;
    
    const updatedData = {
        name: profileName.value.trim(),
        phone: profilePhone.value.trim(),
        address: profileAddress.value.trim(),
        updatedAt: new Date().toISOString()
    };
    
    // Validate name
    if (!updatedData.name) {
        showAlert('error', 'Il nome è obbligatorio');
        return;
    }
    
    saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';
    saveProfileBtn.disabled = true;
    
    try {
        // Update in Firestore
        await db.collection('users').doc(currentUser.uid).update(updatedData);
        
        // Update local data
        Object.assign(currentUserData, updatedData);
        
        // Update display
        updateUserDisplay();
        
        showAlert('success', 'Profilo aggiornato con successo!');
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('error', 'Errore durante il salvataggio del profilo');
    } finally {
        saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Salva Modifiche';
        saveProfileBtn.disabled = false;
    }
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = newPassword.value;
    let strength = 0;
    let text = 'Debole';
    let color = '#dc3545';
    
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        text = 'Forte';
        color = '#28a745';
    } else if (strength >= 50) {
        text = 'Media';
        color = '#ffc107';
    } else if (strength >= 25) {
        text = 'Debole';
        color = '#dc3545';
    }
    
    passwordStrength.style.width = strength + '%';
    passwordStrength.style.backgroundColor = color;
    passwordStrengthText.textContent = 'Forza password: ' + text;
    passwordStrengthText.style.color = color;
}

// Change password
async function changePassword() {
    const currentPwd = currentPassword.value;
    const newPwd = newPassword.value;
    const confirmPwd = confirmPassword.value;
    
    // Validate
    if (!currentPwd || !newPwd || !confirmPwd) {
        showAlert('error', 'Tutti i campi sono obbligatori');
        return;
    }
    
    if (newPwd.length < 6) {
        showAlert('error', 'La nuova password deve avere almeno 6 caratteri');
        return;
    }
    
    if (newPwd !== confirmPwd) {
        showAlert('error', 'Le password non corrispondono');
        return;
    }
    
    changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aggiornamento...';
    changePasswordBtn.disabled = true;
    
    try {
        // Reauthenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email, 
            currentPwd
        );
        await currentUser.reauthenticateWithCredential(credential);
        
        // Update password
        await currentUser.updatePassword(newPwd);
        
        // Clear form
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        
        // Reset strength indicator
        passwordStrength.style.width = '0%';
        passwordStrengthText.textContent = 'Forza password: debole';
        passwordStrengthText.style.color = '#6c757d';
        
        showAlert('success', 'Password aggiornata con successo!');
    } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
            showAlert('error', 'La password corrente non è corretta');
        } else {
            showAlert('error', 'Errore durante la modifica della password');
        }
    } finally {
        changePasswordBtn.innerHTML = '<i class="fas fa-key"></i> Cambia Password';
        changePasswordBtn.disabled = false;
    }
}

// Show alert
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Inizia il caricamento dell'app quando la pagina è pronta
document.addEventListener('DOMContentLoaded', loadFirebaseConfig);