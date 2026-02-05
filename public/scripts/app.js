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
let allUsers = [];

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
const saveProfileBtn = document.getElementById('saveProfileBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const currentPassword = document.getElementById('currentPassword');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');

// Settings elements
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Users elements
const addUserBtn = document.getElementById('addUserBtn');
const usersTableBody = document.getElementById('usersTableBody');
const usersLoading = document.getElementById('usersLoading');
const userSearch = document.getElementById('userSearch');

// Modals
const addUserModal = document.getElementById('addUserModal');
const closeAddUserModal = document.getElementById('closeAddUserModal');
const cancelAddUser = document.getElementById('cancelAddUser');
const addUserForm = document.getElementById('addUserForm');
const addUserAlert = document.getElementById('addUserAlert');

const editUserModal = document.getElementById('editUserModal');
const closeEditUserModal = document.getElementById('closeEditUserModal');
const cancelEditUser = document.getElementById('cancelEditUser');
const editUserForm = document.getElementById('editUserForm');
const editUserAlert = document.getElementById('editUserAlert');

// Helper functions for roles
function isChief(role) {
    return ['cto', 'ceo', 'cfo'].includes(role);
}

function getRoleDisplayName(role) {
    const roles = {
        'cto': 'CTO - Chief Technology Officer',
        'ceo': 'CEO - Chief Executive Officer',
        'cfo': 'CFO - Chief Financial Officer',
        'capocantiere': 'Capocantiere',
        'operaio': 'Operaio',
        'amministrativo': 'Amministrativo'
    };
    return roles[role] || role;
}

function getRoleBadgeClass(role) {
    const badgeClasses = {
        'cto': 'badge-cto',
        'ceo': 'badge-ceo',
        'cfo': 'badge-cfo',
        'capocantiere': 'badge-warning',
        'operaio': 'badge-success',
        'amministrativo': 'badge-primary'
    };
    return badgeClasses[role] || 'badge-primary';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

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
    userDropdownToggle.addEventListener('click', toggleUserDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userDropdownToggle.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Profile events
    saveProfileBtn.addEventListener('click', saveProfile);
    changePasswordBtn.addEventListener('click', changePassword);
    
    // Settings events
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Users events
    addUserBtn.addEventListener('click', () => {
        addUserModal.classList.add('show');
        addUserAlert.classList.add('hidden');
        addUserForm.reset();
    });
    
    closeAddUserModal.addEventListener('click', () => {
        addUserModal.classList.remove('show');
    });
    
    cancelAddUser.addEventListener('click', () => {
        addUserModal.classList.remove('show');
    });
    
    addUserForm.addEventListener('submit', addNewUser);
    
    closeEditUserModal.addEventListener('click', () => {
        editUserModal.classList.remove('show');
    });
    
    cancelEditUser.addEventListener('click', () => {
        editUserModal.classList.remove('show');
    });
    
    editUserForm.addEventListener('submit', updateUser);
    
    // Search users
    userSearch?.addEventListener('input', filterUsers);
    
    // User dropdown navigation
    document.querySelector('.user-dropdown a[data-section]')?.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('a').getAttribute('data-section');
        window.location.hash = section;
    });
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
    
    // Carica la sidebar dinamicamente
    loadSidebar();
    
    // Carica utenti se siamo nella sezione users
    if (window.location.hash === '#users') {
        loadUsers();
    }
    
    // Carica settings se siamo nella sezione settings
    if (window.location.hash === '#settings') {
        loadSettings();
    }
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
                role: 'operaio', // Default role
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

// Toggle user dropdown
function toggleUserDropdown() {
    userDropdown.classList.toggle('show');
}

// Update user display information
function updateUserDisplay() {
    if (!currentUserData) return;
    
    // Update navbar
    userName.textContent = currentUserData.name;
    userRole.textContent = getRoleDisplayName(currentUserData.role);
    userAvatar.textContent = getInitials(currentUserData.name);
    
    // Update profile page
    profileName.value = currentUserData.name;
    profileEmail.value = currentUserData.email;
    profileRole.value = getRoleDisplayName(currentUserData.role);
    profilePhone.value = currentUserData.phone || '';
    profileAddress.value = currentUserData.address || '';
    
    if (currentUserData.createdAt) {
        const date = new Date(currentUserData.createdAt);
        profileCreated.value = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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

// Load settings
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('system').get();
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            
            // Update form fields
            document.getElementById('emailNotifications').checked = settings.emailNotifications || false;
            document.getElementById('systemNotifications').checked = settings.systemNotifications || false;
            document.getElementById('sessionTimeout').value = settings.sessionTimeout || 30;
            document.getElementById('passwordExpiry').value = settings.passwordExpiry || 90;
            document.getElementById('requireEmailVerification').checked = settings.requireEmailVerification || false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings
async function saveSettings() {
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        systemNotifications: document.getElementById('systemNotifications').checked,
        sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
        passwordExpiry: parseInt(document.getElementById('passwordExpiry').value),
        requireEmailVerification: document.getElementById('requireEmailVerification').checked,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid
    };
    
    saveSettingsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';
    saveSettingsBtn.disabled = true;
    
    try {
        await db.collection('settings').doc('system').set(settings, { merge: true });
        showAlert('success', 'Impostazioni salvate con successo!');
    } catch (error) {
        console.error('Error saving settings:', error);
        showAlert('error', 'Errore durante il salvataggio delle impostazioni');
    } finally {
        saveSettingsBtn.innerHTML = '<i class="fas fa-save"></i> Salva Impostazioni';
        saveSettingsBtn.disabled = false;
    }
}

// Load users
async function loadUsers() {
    usersTableBody.innerHTML = '';
    usersLoading.classList.remove('hidden');
    
    try {
        const usersSnapshot = await db.collection('users').orderBy('name').get();
        allUsers = [];
        usersTableBody.innerHTML = '';
        
        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            const userId = doc.id;
            
            allUsers.push({ id: userId, ...user });
            
            const row = document.createElement('tr');
            
            // Format last login date
            let lastLogin = 'Mai';
            if (user.lastLogin) {
                const date = new Date(user.lastLogin);
                lastLogin = date.toLocaleDateString('it-IT');
            }
            
            // Determine status badge
            let statusBadge = '<span class="badge badge-success">Attivo</span>';
            if (user.status === 'inactive') {
                statusBadge = '<span class="badge badge-danger">Disabilitato</span>';
            }
            
            row.innerHTML = `
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge ${getRoleBadgeClass(user.role)}">${getRoleDisplayName(user.role)}</span></td>
                <td>${statusBadge}</td>
                <td>${lastLogin}</td>
                <td>
                    <button class="btn btn-icon edit-user-btn" data-id="${userId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${userId !== currentUser.uid ? `
                    <button class="btn btn-icon delete-user-btn" data-id="${userId}" data-name="${user.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(
                btn.getAttribute('data-id'), 
                btn.getAttribute('data-name')
            ));
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('error', 'Errore nel caricamento degli utenti');
    } finally {
        usersLoading.classList.add('hidden');
    }
}

// Filter users
function filterUsers() {
    const searchTerm = userSearch.value.toLowerCase();
    const rows = usersTableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Add new user
async function addNewUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    const phone = document.getElementById('newUserPhone').value.trim();
    const password = document.getElementById('newUserPassword').value;
    const confirmPassword = document.getElementById('newUserConfirmPassword').value;
    
    // Validate
    if (!name || !email || !role || !password || !confirmPassword) {
        showModalAlert(addUserAlert, 'error', 'Tutti i campi obbligatori devono essere compilati');
        return;
    }
    
    if (password.length < 6) {
        showModalAlert(addUserAlert, 'error', 'La password deve avere almeno 6 caratteri');
        return;
    }
    
    if (password !== confirmPassword) {
        showModalAlert(addUserAlert, 'error', 'Le password non corrispondono');
        return;
    }
    
    const submitBtn = document.getElementById('submitAddUser');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creazione...';
    submitBtn.disabled = true;
    
    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const newUser = userCredential.user;
        
        // Create user data in Firestore
        const userData = {
            name: name,
            email: email,
            role: role,
            phone: phone,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: currentUser.uid
        };
        
        await db.collection('users').doc(newUser.uid).set(userData);
        
        // Send email verification
        await newUser.sendEmailVerification();
        
        // Close modal and reset form
        addUserModal.classList.remove('show');
        addUserForm.reset();
        
        // Reload users list
        loadUsers();
        
        showAlert('success', `Utente ${name} creato con successo!`);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'auth/email-already-in-use') {
            showModalAlert(addUserAlert, 'error', 'Questo indirizzo email è già in uso');
        } else if (error.code === 'auth/invalid-email') {
            showModalAlert(addUserAlert, 'error', 'Indirizzo email non valido');
        } else {
            showModalAlert(addUserAlert, 'error', 'Errore durante la creazione dell\'utente');
        }
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crea Utente';
        submitBtn.disabled = false;
    }
}

// Edit user
async function editUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            showAlert('error', 'Utente non trovato');
            return;
        }
        
        const user = userDoc.data();
        
        // Fill form
        document.getElementById('editUserId').value = userId;
        document.getElementById('editUserName').value = user.name || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserRole').value = user.role || 'operaio';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserAddress').value = user.address || '';
        document.getElementById('editUserStatus').value = user.status || 'active';
        
        // Clear alert and show modal
        editUserAlert.classList.add('hidden');
        editUserModal.classList.add('show');
    } catch (error) {
        console.error('Error loading user for edit:', error);
        showAlert('error', 'Errore nel caricamento dei dati utente');
    }
}

// Update user
async function updateUser(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value.trim();
    const role = document.getElementById('editUserRole').value;
    const phone = document.getElementById('editUserPhone').value.trim();
    const address = document.getElementById('editUserAddress').value.trim();
    const status = document.getElementById('editUserStatus').value;
    
    // Validate
    if (!name || !role) {
        showModalAlert(editUserAlert, 'error', 'Nome e ruolo sono obbligatori');
        return;
    }
    
    const submitBtn = document.getElementById('submitEditUser');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvataggio...';
    submitBtn.disabled = true;
    
    try {
        const updatedData = {
            name: name,
            role: role,
            phone: phone,
            address: address,
            status: status,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.uid
        };
        
        await db.collection('users').doc(userId).update(updatedData);
        
        // Close modal
        editUserModal.classList.remove('show');
        
        // Reload users list
        loadUsers();
        
        showAlert('success', 'Utente aggiornato con successo!');
    } catch (error) {
        console.error('Error updating user:', error);
        showModalAlert(editUserAlert, 'error', 'Errore durante l\'aggiornamento dell\'utente');
    } finally {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Salva Modifiche';
        submitBtn.disabled = false;
    }
}

// Delete user
async function deleteUser(userId, userName) {
    if (!confirm(`Sei sicuro di voler eliminare l'utente "${userName}"?`)) {
        return;
    }
    
    try {
        // Delete from Firestore
        await db.collection('users').doc(userId).delete();
        
        // Reload users list
        loadUsers();
        
        showAlert('success', `Utente "${userName}" eliminato con successo!`);
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('error', 'Errore durante l\'eliminazione dell\'utente');
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

// Show modal alert
function showModalAlert(container, type, message) {
    container.textContent = message;
    container.className = `alert alert-${type}`;
    container.classList.remove('hidden');
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Load sidebar
function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebarContainer');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h3><i class="fas fa-tachometer-alt"></i> Menu Principale</h3>
                </div>
                <div class="sidebar-menu">
                    <div class="menu-section">
                        <h4><i class="fas fa-home"></i> Dashboard</h4>
                        <a href="#" class="menu-item active" data-section="dashboard">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </a>
                    </div>
                    
                    <div class="menu-section">
                        <h4><i class="fas fa-user"></i> Gestione Personale</h4>
                        <a href="#profile" class="menu-item" data-section="profile">
                            <i class="fas fa-user"></i>
                            <span>Il Mio Profilo</span>
                        </a>
                        <a href="#users" class="menu-item" data-section="users">
                            <i class="fas fa-users"></i>
                            <span>Gestione Utenti</span>
                        </a>
                        <a href="#roles" class="menu-item" data-section="roles">
                            <i class="fas fa-user-tag"></i>
                            <span>Gestione Ruoli</span>
                        </a>
                    </div>
                    
                    <div class="menu-section">
                        <h4><i class="fas fa-cog"></i> Sistema</h4>
                        <a href="#settings" class="menu-item" data-section="settings">
                            <i class="fas fa-cog"></i>
                            <span>Impostazioni</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to sidebar items
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                
                // Update active state
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Navigate to section
                if (section !== 'dashboard') {
                    window.location.hash = section;
                } else {
                    window.location.hash = '';
                    document.getElementById('welcomeSection').style.display = 'block';
                    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
                }
                
                // Close sidebar on mobile
                if (window.innerWidth <= 991.98) {
                    document.getElementById('sidebar').classList.remove('show');
                }
            });
        });
        
        // Add event listener for menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('show');
        });
    }
}

// Inizia il caricamento dell'app quando la pagina è pronta
document.addEventListener('DOMContentLoaded', loadFirebaseConfig);