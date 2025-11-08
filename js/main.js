// ===== متغيرات التطبيق =====
let currentUser = null;
let complaints = [];
let orders = [];
let workers = [];

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
});

// ===== وظائف إدارة الصفحات =====
function showPage(pageId) {
    // إخفاء جميع الصفحات
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // إظهار الصفحة المطلوبة
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // إعادة تحميل البيانات إذا لزم الأمر
        if (pageId === 'residentDashboard') {
            loadResidentData();
        } else if (pageId === 'workerDashboard') {
            loadWorkerData();
        } else if (pageId === 'adminDashboard') {
            loadAdminData();
        }
    }
}

function showSection(sectionId) {
    // التنقل بين الأقسام في الصفحة الرئيسية
    const sections = ['services', 'about'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            if (section === sectionId) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// ===== وظائف لوحة تحكم الساكن =====
function showDashboardSection(sectionId) {
    const sections = document.querySelectorAll('#residentDashboard .dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // تحديث القوائم الجانبية
        updateSidebarActiveState('residentDashboard', sectionId);
    }
}

function updateSidebarActiveState(dashboardType, sectionId) {
    const navItems = document.querySelectorAll(`#${dashboardType} .nav-item`);
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`#${dashboardType} .nav-item[onclick*="${sectionId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// ===== وظائف لوحة تحكم الصنايعي =====
function showWorkerSection(sectionId) {
    const sections = document.querySelectorAll('#workerDashboard .dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        updateSidebarActiveState('workerDashboard', sectionId);
        
        // تحميل البيانات الخاصة بكل قسم
        if (sectionId === 'workerOrders') {
            loadWorkerOrders();
        } else if (sectionId === 'workerSchedule') {
            loadWorkerSchedule();
        } else if (sectionId === 'workerEarnings') {
            loadWorkerEarnings();
        }
    }
}

// ===== وظائف لوحة تحكم المسؤول =====
function showAdminSection(sectionId) {
    const sections = document.querySelectorAll('#adminDashboard .dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        updateSidebarActiveState('adminDashboard', sectionId);
        
        // تحميل البيانات الخاصة بكل قسم
        if (sectionId === 'adminComplaints') {
            loadAdminComplaints();
        } else if (sectionId === 'adminUsers') {
            loadAdminUsers();
        } else if (sectionId === 'adminWorkers') {
            loadAdminWorkers();
        }
    }
}

// ===== وظائف المصادقة =====
function showLogin() {
    showPage('loginPage');
}

function showRegister() {
    showPage('authPage');
}

function showForgotPassword() {
    showPage('forgotPasswordPage');
}

// ===== معالجة النماذج =====
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        userType: document.getElementById('userType').value
    };
    
    if (formData.password !== document.getElementById('confirmPassword').value) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }
    
    // محاكاة تسجيل المستخدم
    registerUser(formData);
});

document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    // محاكاة تسجيل الدخول
    loginUser(formData);
});

document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    
    // محاكاة استعادة كلمة المرور
    showNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
    setTimeout(() => showLogin(), 2000);
});

// ===== وظائف المستخدم =====
function registerUser(userData) {
    // محاكاة API call
    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            name: userData.fullName,
            email: userData.email,
            type: userData.userType,
            avatar: 'images/user-avatar.jpg'
        };
        
        showNotification('تم إنشاء الحساب بنجاح!', 'success');
        
        // توجيه المستخدم حسب نوع الحساب
        redirectUser(userData.userType);
    }, 1000);
}

function loginUser(credentials) {
    // محاكاة API call
    setTimeout(() => {
        // بيانات وهمية للمستخدمين
        const users = {
            'resident@example.com': { type: 'resident', name: 'أحمد محمد' },
            'worker@example.com': { type: 'worker', name: 'محمد أحمد' },
            'admin@example.com': { type: 'admin', name: 'إبراهيم أحمد' }
        };
        
        const user = users[credentials.email];
        
        if (user && credentials.password === '123456') {
            currentUser = {
                id: Date.now(),
                name: user.name,
                email: credentials.email,
                type: user.type,
                avatar: user.type === 'worker' ? 'images/worker-profile.jpg' : 
                        user.type === 'admin' ? 'images/admin-avatar.jpg' : 'images/user-avatar.jpg'
            };
            
            showNotification(`مرحباً ${user.name}!`, 'success');
            redirectUser(user.type);
        } else {
            showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
        }
    }, 1000);
}

function redirectUser(userType) {
    switch(userType) {
        case 'resident':
            showPage('residentDashboard');
            loadResidentData();
            break;
        case 'worker':
            showPage('workerDashboard');
            loadWorkerData();
            break;
        case 'admin':
            showPage('adminDashboard');
            loadAdminData();
            break;
        default:
            showPage('homePage');
    }
}

// ===== تحميل البيانات =====
function initializeApp() {
    // إضافة معالجات للأحداث
    setupEventListeners();
    
    // تحميل البيانات الأولية
    loadSampleData();
}

function setupEventListeners() {
    // معالجة نموذج البلاغ الجديد
    const complaintForm = document.querySelector('.complaint-form');
    if (complaintForm) {
        complaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewComplaint();
        });
    }
    
    // معالجة نموذج الملف الشخصي
    const profileForms = document.querySelectorAll('.profile-form');
    profileForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile(this);
        });
    });
}

function loadSampleData() {
    // بيانات وهمية للبلاغات
    complaints = [
        {
            id: 1,
            title: 'انقطاع التيار الكهربائي',
            description: 'انقطاع التيار في المبنى أ منذ ساعتين',
            type: 'electricity',
            status: 'pending',
            date: '2024-01-15',
            resident: 'أحمد محمد'
        },
        {
            id: 2,
            title: 'تسرب مياه في الحمام',
            description: 'تسرب مياه من السقف في الحمام الرئيسي',
            type: 'plumbing',
            status: 'in-progress',
            date: '2024-01-14',
            resident: 'أحمد محمد'
        }
    ];
    
    // بيانات وهمية للطلبات
    orders = [
        {
            id: 1,
            title: 'إصلاح تسرب مياه',
            description: 'تسرب مياه في الحمام الرئيسي - يحتاج إلى فحص وصيانة',
            price: 150,
            client: { name: 'أحمد محمود', location: 'شارع النصر، مدينة نصر' },
            date: 'منذ 2 ساعة',
            status: 'pending'
        },
        {
            id: 2,
            title: 'تركيب حنفية جديدة',
            description: 'تركيب حنفية مطبخ جديدة مع توصيلات المياه',
            price: 200,
            client: { name: 'سارة خالد', location: 'حي الأندلس، المعادي' },
            date: 'منذ 5 ساعات',
            status: 'pending'
        }
    ];
    
    // بيانات وهمية للصناعيين
    workers = [
        {
            id: 1,
            name: 'محمد أحمد',
            specialty: 'plumbing',
            rating: 4.8,
            completedTasks: 47,
            earnings: 5400
        }
    ];
}

function loadResidentData() {
    renderComplaintsList();
    updateResidentProfile();
}

function loadWorkerData() {
    loadWorkerOrders();
    updateWorkerProfile();
    loadWorkerSchedule();
    loadWorkerEarnings();
}

function loadAdminData() {
    updateAdminStats();
    loadAdminComplaints();
    loadAdminUsers();
}

// ===== وظائف عرض البيانات =====
function renderComplaintsList() {
    const complaintsList = document.querySelector('.complaints-list');
    if (!complaintsList) return;
    
    complaintsList.innerHTML = complaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4>${complaint.title}</h4>
                <span class="status-badge ${complaint.status}">
                    ${getStatusText(complaint.status)}
                </span>
            </div>
            <p class="complaint-desc">${complaint.description}</p>
            <div class="complaint-footer">
                <span class="complaint-date">${complaint.date}</span>
                <span class="complaint-type">${getComplaintTypeText(complaint.type)}</span>
            </div>
        </div>
    `).join('');
}

function loadWorkerOrders() {
    const ordersList = document.querySelector('#workerOrders .orders-list');
    if (!ordersList) return;
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>${order.title}</h4>
                <span class="order-price">${order.price} جنيه</span>
            </div>
            <p class="order-desc">${order.description}</p>
            <div class="order-client">
                <img src="images/client${order.id}.jpg" alt="العميل" onerror="this.src='images/user-avatar.jpg'">
                <div class="client-info">
                    <h5>${order.client.name}</h5>
                    <span>${order.client.location}</span>
                </div>
            </div>
            <div class="order-footer">
                <span class="order-date">${order.date}</span>
                <div class="order-actions">
                    <button class="btn btn-sm btn-primary" onclick="acceptOrder(${order.id})">قبول الطلب</button>
                    <button class="btn btn-sm btn-secondary" onclick="rejectOrder(${order.id})">رفض</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadWorkerSchedule() {
    // محاكاة تحميل جدول المواعيد
    console.log('تحميل جدول المواعيد...');
}

function loadWorkerEarnings() {
    const worker = workers[0];
    if (!worker) return;
    
    const earningsStats = document.querySelector('.earnings-stats');
    if (earningsStats) {
        earningsStats.innerHTML = `
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="earning-info">
                    <h3>${worker.earnings.toLocaleString()} جنيه</h3>
                    <p>إجمالي الأرباح هذا الشهر</p>
                </div>
            </div>
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="earning-info">
                    <h3>${worker.completedTasks} مهمة</h3>
                    <p>عدد المهام المكتملة</p>
                </div>
            </div>
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="earning-info">
                    <h3>${worker.rating} / 5</h3>
                    <p>متوسط التقييم</p>
                </div>
            </div>
        `;
    }
}

function updateAdminStats() {
    const stats = {
        newComplaints: 125,
        activeWorkers: 45,
        registeredUsers: 1250,
        totalTransactions: 85400
    };
    
    document.querySelectorAll('.stat-number').forEach((element, index) => {
        const values = Object.values(stats);
        if (values[index] !== undefined) {
            element.textContent = values[index].toLocaleString();
        }
    });
}

function loadAdminComplaints() {
    const complaintsTable = document.querySelector('.complaints-table tbody');
    if (!complaintsTable) return;
    
    complaintsTable.innerHTML = complaints.map(complaint => `
        <tr>
            <td>#00${complaint.id}</td>
            <td>${getComplaintTypeText(complaint.type)}</td>
            <td>${complaint.resident}</td>
            <td>${complaint.date}</td>
            <td><span class="status-badge ${complaint.status}">${getStatusText(complaint.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">تعيين صنايعي</button>
                <button class="btn btn-sm btn-secondary">تفاصيل</button>
            </td>
        </tr>
    `).join('');
}

function loadAdminUsers() {
    const usersTable = document.querySelector('.users-table tbody');
    if (!usersTable) return;
    
    const users = [
        { name: 'أحمد محمد', email: 'ahmed.mohamed@example.com', type: 'resident', date: '2024-01-10', status: 'active' },
        { name: 'محمد أحمد', email: 'mohamed.ahmed@example.com', type: 'worker', date: '2024-01-08', status: 'active' }
    ];
    
    usersTable.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="images/${user.type}-avatar.jpg" alt="صورة ${user.type}" onerror="this.src='images/user-avatar.jpg'">
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="user-type ${user.type}">${getUserTypeText(user.type)}</span></td>
            <td>${user.date}</td>
            <td><span class="status-badge active">نشط</span></td>
            <td>
                <button class="btn btn-sm btn-primary">تعديل</button>
                <button class="btn btn-sm btn-danger">حذف</button>
            </td>
        </tr>
    `).join('');
}

function loadAdminWorkers() {
    // محاكاة تحميل بيانات الصناعيين
    console.log('تحميل بيانات الصناعيين...');
}

// ===== وظائف المساعدة =====
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد المراجعة',
        'in-progress': 'جاري المعالجة',
        'completed': 'مكتمل',
        'resolved': 'تم الحل'
    };
    return statusMap[status] || status;
}

function getComplaintTypeText(type) {
    const typeMap = {
        'electricity': 'كهرباء',
        'plumbing': 'سباكة',
        'carpentry': 'نجارة',
        'cleaning': 'نظافة',
        'other': 'أخرى'
    };
    return typeMap[type] || type;
}

function getUserTypeText(type) {
    const typeMap = {
        'resident': 'ساكن',
        'worker': 'صنايعي',
        'admin': 'مسؤول'
    };
    return typeMap[type] || type;
}

// ===== وظائف التفاعل =====
function submitNewComplaint() {
    const title = document.getElementById('complaintTitle').value;
    const type = document.getElementById('complaintType').value;
    const description = document.getElementById('complaintDescription').value;
    
    const newComplaint = {
        id: complaints.length + 1,
        title: title,
        type: type,
        description: description,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        resident: currentUser?.name || 'مستخدم'
    };
    
    complaints.unshift(newComplaint);
    
    showNotification('تم إرسال البلاغ بنجاح', 'success');
    showDashboardSection('residentComplaints');
    renderComplaintsList();
    
    // إعادة تعيين النموذج
    document.querySelector('.complaint-form').reset();
}

function acceptOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'accepted';
        showNotification(`تم قبول طلب: ${order.title}`, 'success');
        
        // إعادة تحميل القائمة
        loadWorkerOrders();
    }
}

function rejectOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        orders = orders.filter(o => o.id !== orderId);
        showNotification(`تم رفض طلب: ${order.title}`, 'warning');
        loadWorkerOrders();
    }
}

function saveProfile(form) {
    // محاكاة حفظ البيانات
    setTimeout(() => {
        showNotification('تم حفظ التغييرات بنجاح', 'success');
    }, 1000);
}

function updateResidentProfile() {
    if (!currentUser) return;
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName) profileName.value = currentUser.name;
    if (profileEmail) profileEmail.value = currentUser.email;
}

function updateWorkerProfile() {
    const worker = workers[0];
    if (!worker) return;
    
    const workerName = document.getElementById('workerName');
    const workerBio = document.getElementById('workerBio');
    
    if (workerName) workerName.value = worker.name;
    if (workerBio) workerBio.value = `سباك محترف بخبرة 8 سنوات في مجال السباكة المنزلية والتجارية. متخصص في إصلاح التسربات وتركيب التمديدات.`;
}

function showServiceDetails(serviceType) {
    const serviceNames = {
        'plumbing': 'خدمات السباكة',
        'electricity': 'خدمات الكهرباء',
        'carpentry': 'خدمات النجارة'
    };
    
    showNotification(`عرض تفاصيل ${serviceNames[serviceType]}`, 'info');
}

// ===== نظام الإشعارات =====
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة أنماط CSS للإشعارات
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                left: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                border-right: 4px solid #2563eb;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .notification-success { border-right-color: #10b981; }
            .notification-error { border-right-color: #ef4444; }
            .notification-warning { border-right-color: #f59e0b; }
            .notification-info { border-right-color: #2563eb; }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #6b7280;
                padding: 0.25rem;
            }
            
            @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ===== وظائف إضافية =====
function logout() {
    currentUser = null;
    showPage('homePage');
    showNotification('تم تسجيل الخروج بنجاح', 'info');
}

// جعل الدوال متاحة عالمياً للاستدعاء من HTML
window.showPage = showPage;
window.showSection = showSection;
window.showDashboardSection = showDashboardSection;
window.showWorkerSection = showWorkerSection;
window.showAdminSection = showAdminSection;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showForgotPassword = showForgotPassword;
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.showServiceDetails = showServiceDetails;
window.logout = logout;