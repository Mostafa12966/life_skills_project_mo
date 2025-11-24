// ===== متغيرات التطبيق =====
let currentUser = null;
let complaints = [];
let users = [];
let workerOrders = [];
let workerAppointments = [];
let currentWeek = 0;
let services = [];

// ===== تهيئة التطبيق =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
    checkLoggedInUser();
    setupEventListeners();
});

// ===== إدارة الجلسات =====
function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        redirectUser(currentUser.type);
    }
}

function saveUserToStorage(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeUserFromStorage() {
    localStorage.removeItem('currentUser');
}

// ===== وظائف إدارة الصفحات =====
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        if (pageId === 'residentDashboard') {
            loadResidentData();
        } else if (pageId === 'workerDashboard') {
            loadWorkerData();
        }
    }
}

function showSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function goBack() {
    const currentPage = document.querySelector('.page.active').id;
    
    if (currentPage === 'loginPage' || currentPage === 'authPage' || currentPage === 'forgotPasswordPage') {
        showPage('homePage');
    } else if (currentPage === 'successPage') {
        showPage('authPage');
    } else {
        showPage('homePage');
    }
}

// ===== إعداد المستمعين للأحداث =====
function setupEventListeners() {
    // تفعيل/تعطيل حقل التخصص حسب نوع المستخدم
    const userTypeSelect = document.getElementById('userType');
    if (userTypeSelect) {
        userTypeSelect.addEventListener('change', function() {
            const specialtyField = document.getElementById('specialtyField');
            if (this.value === 'worker') {
                specialtyField.style.display = 'block';
            } else {
                specialtyField.style.display = 'none';
            }
        });
    }

    // نموذج التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }

    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // نموذج نسيان كلمة المرور
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }

    // نموذج البلاغ الجديد
    const newComplaintForm = document.getElementById('newComplaintForm');
    if (newComplaintForm) {
        newComplaintForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewComplaint();
        });
    }

    // نموذج الملف الشخصي للساكن
    const residentProfileForm = document.getElementById('residentProfileForm');
    if (residentProfileForm) {
        residentProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveResidentProfile();
        });
    }

    // نموذج الملف الشخصي للصنايعي
    const workerProfileForm = document.getElementById('workerProfileForm');
    if (workerProfileForm) {
        workerProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWorkerProfile();
        });
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

function handleRegistration() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        userType: document.getElementById('userType').value,
        specialty: document.getElementById('userType').value === 'worker' ? document.getElementById('specialty').value : ''
    };
    
    if (formData.password !== document.getElementById('confirmPassword').value) {
        showNotification('كلمات المرور غير متطابقة', 'error');
        return;
    }
    
    registerUser(formData);
}

function handleLogin() {
    const formData = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    loginUser(formData);
}

function handleForgotPassword() {
    const email = document.getElementById('recoveryEmail').value;
    showNotification('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
    setTimeout(() => showLogin(), 3000);
}

// ===== وظائف المستخدم =====
function registerUser(userData) {
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
        showNotification('هذا البريد الإلكتروني مسجل بالفعل', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        type: userData.userType,
        specialty: userData.specialty,
        experience: userData.userType === 'worker' ? 5 : 0,
        hourlyRate: userData.userType === 'worker' ? 100 : 0,
        bio: userData.userType === 'worker' ? 'صنايعي محترف' : '',
        rating: userData.userType === 'worker' ? 4.8 : 0,
        completedTasks: 0,
        totalEarnings: 0,
        area: userData.userType === 'worker' ? 'القاهرة' : '',
        services: userData.userType === 'worker' ? [userData.specialty] : [],
        complaints: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('تم إنشاء الحساب بنجاح!', 'success');
    showPage('successPage');
}

function loginUser(credentials) {
    // حسابات تجريبية للاختبار
    const demoAccounts = {
        'resident@example.com': { 
            password: '123456', 
            user: {
                id: 1,
                name: 'أحمد محمد',
                email: 'resident@example.com',
                phone: '01234567890',
                type: 'resident',
                complaints: [],
                createdAt: new Date().toISOString()
            }
        },
        'worker@example.com': { 
            password: '123456', 
            user: {
                id: 2,
                name: 'محمد أحمد',
                email: 'worker@example.com',
                phone: '01234567891',
                type: 'worker',
                specialty: 'plumbing',
                experience: 8,
                hourlyRate: 120,
                bio: 'سباك محترف بخبرة 8 سنوات في مجال السباكة المنزلية والتجارية',
                rating: 4.8,
                completedTasks: 47,
                totalEarnings: 5640,
                area: 'القاهرة',
                services: ['plumbing'],
                createdAt: new Date().toISOString()
            }
        }
    };
    
    let user = null;
    
    // التحقق من الحسابات التجريبية أولاً
    if (demoAccounts[credentials.email] && demoAccounts[credentials.email].password === credentials.password) {
        user = demoAccounts[credentials.email].user;
    } else {
        // ثم التحقق من المستخدمين المسجلين
        const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        user = savedUsers.find(u => u.email === credentials.email && u.password === credentials.password);
    }
    
    if (user) {
        currentUser = user;
        saveUserToStorage(user);
        
        showNotification(`مرحباً ${user.name}!`, 'success');
        redirectUser(user.type);
    } else {
        showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }
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
        default:
            showPage('homePage');
    }
}

function logout() {
    currentUser = null;
    removeUserFromStorage();
    showPage('homePage');
    showNotification('تم تسجيل الخروج بنجاح', 'info');
}

// ===== تحميل البيانات =====
function initializeApp() {
    loadUsersFromStorage();
    initializeServices();
}

function loadUsersFromStorage() {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

function initializeServices() {
    services = [
        {
            id: 'plumbing',
            name: 'سباكة',
            icon: 'fa-faucet',
            description: 'إصلاح تسربات المياه والتمديدات والصرف الصحي',
            basePrice: 100,
            rating: 4.8
        },
        {
            id: 'electricity',
            name: 'كهرباء',
            icon: 'fa-bolt',
            description: 'إصلاح أعطال الكهرباء والتركيبات والإنارة',
            basePrice: 150,
            rating: 4.9
        },
        {
            id: 'carpentry',
            name: 'نجارة',
            icon: 'fa-hammer',
            description: 'أعمال النجارة والديكور والأثاث المنزلي',
            basePrice: 200,
            rating: 4.7
        },
        {
            id: 'painting',
            name: 'دهانات',
            icon: 'fa-paint-roller',
            description: 'أعمال الدهان والديكورات المنزلية',
            basePrice: 250,
            rating: 4.6
        },
        {
            id: 'cleaning',
            name: 'نظافة',
            icon: 'fa-tools',
            description: 'تنظيف الشقق والمباني والمساحات الكبيرة',
            basePrice: 80,
            rating: 4.5
        },
        {
            id: 'furniture',
            name: 'أثاث',
            icon: 'fa-couch',
            description: 'تركيب وتجميع الأثاث المنزلي والمكتبي',
            basePrice: 180,
            rating: 4.7
        }
    ];
}

function loadSampleData() {
    // بيانات وهمية للبلاغات
    complaints = [
        {
            id: 1,
            title: 'انقطاع التيار الكهربائي',
            description: 'انقطاع التيار في المبنى أ منذ ساعتين، جميع الشقق متأثرة',
            type: 'electricity',
            status: 'pending',
            date: '2024-01-15',
            location: 'المبنى أ - الطابق الثالث',
            urgency: 'high',
            resident: 'أحمد محمد'
        },
        {
            id: 2,
            title: 'تسرب مياه في الحمام',
            description: 'تسرب مياه من السقف في الحمام الرئيسي، يحتاج إلى فحص عاجل',
            type: 'plumbing',
            status: 'in-progress',
            date: '2024-01-14',
            location: 'الشقة 301 - الحمام الرئيسي',
            urgency: 'emergency',
            resident: 'أحمد محمد'
        },
        {
            id: 3,
            title: 'إصلاح باب خشبي',
            description: 'الباب الخشبي للغرفة الرئيسية لا يغلق بشكل صحيح',
            type: 'carpentry',
            status: 'completed',
            date: '2024-01-10',
            location: 'الشقة 301 - الغرفة الرئيسية',
            urgency: 'medium',
            resident: 'أحمد محمد'
        }
    ];
    
    // بيانات وهمية لطلبات الصنايعي
    workerOrders = [
        {
            id: 1,
            title: 'إصلاح تسرب مياه',
            description: 'تسرب مياه في الحمام الرئيسي - يحتاج إلى فحص وصيانة عاجلة',
            type: 'plumbing',
            price: 150,
            client: { name: 'أحمد محمود', location: 'شارع النصر، مدينة نصر', phone: '01234567892' },
            date: 'منذ 2 ساعة',
            status: 'pending',
            urgency: 'high'
        },
        {
            id: 2,
            title: 'تركيب حنفية جديدة',
            description: 'تركيب حنفية مطبخ جديدة مع توصيلات المياه',
            type: 'plumbing',
            price: 200,
            client: { name: 'سارة خالد', location: 'حي الأندلس، المعادي', phone: '01234567893' },
            date: 'منذ 5 ساعات',
            status: 'pending',
            urgency: 'medium'
        },
        {
            id: 3,
            title: 'تنظيف بالوعة',
            description: 'انسداد في بالوعة المطبخ تحتاج إلى تنظيف فوري',
            type: 'plumbing',
            price: 120,
            client: { name: 'محمد علي', location: 'حي الزهور، المعادي', phone: '01234567894' },
            date: 'منذ يوم',
            status: 'accepted',
            urgency: 'high'
        },
        {
            id: 4,
            title: 'إصلاح مضخة مياه',
            description: 'مضخة المياه لا تعمل بشكل صحيح تحتاج إلى صيانة',
            type: 'plumbing',
            price: 300,
            client: { name: 'فاطمة أحمد', location: 'حي السيدة زينب', phone: '01234567895' },
            date: 'منذ 3 أيام',
            status: 'in-progress',
            urgency: 'medium'
        }
    ];
    
    // بيانات وهمية لمواعيد الصنايعي
    workerAppointments = [
        {
            id: 1,
            title: 'إصلاح تسرب',
            client: 'سارة خالد',
            date: '2024-01-20',
            time: '10:00',
            duration: 2,
            type: 'plumbing',
            status: 'scheduled'
        },
        {
            id: 2,
            title: 'تركيب حنفية',
            client: 'أحمد محمود',
            date: '2024-01-20',
            time: '14:00',
            duration: 1,
            type: 'plumbing',
            status: 'scheduled'
        },
        {
            id: 3,
            title: 'صيانة مضخة',
            client: 'فاطمة أحمد',
            date: '2024-01-21',
            time: '09:00',
            duration: 3,
            type: 'plumbing',
            status: 'scheduled'
        }
    ];
}

// ===== وظائف الساكن =====
function loadResidentData() {
    loadComplaintsList();
    loadResidentProfileData();
    loadServicesGrid();
}

function showDashboardSection(sectionId) {
    const sections = document.querySelectorAll('#residentDashboard .dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        updateSidebarActiveState('residentDashboard', sectionId);
        
        if (sectionId === 'residentComplaints') {
            loadComplaintsList();
        } else if (sectionId === 'residentProfile') {
            loadResidentProfileData();
        } else if (sectionId === 'residentServices') {
            loadServicesGrid();
        }
    }
}

function loadComplaintsList() {
    const complaintsList = document.getElementById('complaintsList');
    if (!complaintsList) return;
    
    const userComplaints = complaints.filter(complaint => complaint.resident === currentUser?.name);
    
    if (userComplaints.length === 0) {
        complaintsList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox"></i>
                <p>لا توجد بلاغات حتى الآن</p>
                <button class="btn btn-primary" onclick="showDashboardSection('residentNewComplaint')">تقديم بلاغ جديد</button>
            </div>
        `;
        return;
    }
    
    complaintsList.innerHTML = userComplaints.map(complaint => `
        <div class="complaint-card">
            <div class="complaint-header">
                <h4>${complaint.title}</h4>
                <span class="status-badge ${complaint.status}">
                    ${getStatusText(complaint.status)}
                </span>
            </div>
            <p class="complaint-desc">${complaint.description}</p>
            <div class="complaint-footer">
                <div>
                    <span class="complaint-date">${complaint.date}</span>
                    <span class="complaint-type">${getComplaintTypeText(complaint.type)}</span>
                    <span class="complaint-urgency urgency-${complaint.urgency}">${getUrgencyText(complaint.urgency)}</span>
                </div>
                <div>${complaint.location}</div>
            </div>
        </div>
    `).join('');
}

function loadServicesGrid() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" onclick="showServiceDetails('${service.id}')">
            <div class="service-icon">
                <i class="fas ${service.icon}"></i>
            </div>
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <div class="service-meta">
                <span class="rating">${service.rating} <i class="fas fa-star"></i></span>
                <span class="price">يبدأ من ${service.basePrice} جنيه</span>
            </div>
        </div>
    `).join('');
}

function searchServices() {
    const searchTerm = document.getElementById('serviceSearch').value.toLowerCase();
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const serviceName = card.querySelector('h4').textContent.toLowerCase();
        const serviceDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (serviceName.includes(searchTerm) || serviceDesc.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function loadResidentProfileData() {
    if (!currentUser) return;
    
    const elements = {
        userName: document.getElementById('residentUserName'),
        profileName: document.getElementById('residentProfileName'),
        profileEmail: document.getElementById('residentProfileEmail'),
        profileNameInput: document.getElementById('residentProfileNameInput'),
        profilePhone: document.getElementById('residentProfilePhone'),
        profileAddress: document.getElementById('residentProfileAddress'),
        profileBuilding: document.getElementById('residentProfileBuilding'),
        profileApartment: document.getElementById('residentProfileApartment'),
        totalComplaints: document.getElementById('totalComplaints'),
        resolvedComplaints: document.getElementById('resolvedComplaints')
    };
    
    if (elements.userName) elements.userName.textContent = currentUser.name;
    if (elements.profileName) elements.profileName.textContent = currentUser.name;
    if (elements.profileEmail) elements.profileEmail.textContent = currentUser.email;
    if (elements.profileNameInput) elements.profileNameInput.value = currentUser.name;
    if (elements.profilePhone) elements.profilePhone.value = currentUser.phone || '';
    if (elements.profileAddress) elements.profileAddress.value = currentUser.address || '';
    if (elements.profileBuilding) elements.profileBuilding.value = currentUser.building || '';
    if (elements.profileApartment) elements.profileApartment.value = currentUser.apartment || '';
    
    // إحصائيات البلاغات
    const userComplaints = complaints.filter(c => c.resident === currentUser.name);
    const resolvedComplaints = userComplaints.filter(c => c.status === 'completed').length;
    
    if (elements.totalComplaints) elements.totalComplaints.textContent = userComplaints.length;
    if (elements.resolvedComplaints) elements.resolvedComplaints.textContent = resolvedComplaints;
}

function submitNewComplaint() {
    if (!currentUser) {
        showNotification('يجب تسجيل الدخول أولاً', 'error');
        return;
    }
    
    const formData = {
        title: document.getElementById('complaintTitle').value,
        type: document.getElementById('complaintType').value,
        description: document.getElementById('complaintDescription').value,
        location: document.getElementById('complaintLocation').value,
        urgency: document.getElementById('complaintUrgency').value
    };
    
    const newComplaint = {
        id: complaints.length + 1,
        ...formData,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        resident: currentUser.name
    };
    
    complaints.unshift(newComplaint);
    
    // إنشاء طلب تلقائي للصنايعي
    const correspondingOrder = {
        id: workerOrders.length + 1,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: calculateServicePrice(formData.type, formData.urgency),
        client: { 
            name: currentUser.name, 
            location: formData.location,
            phone: currentUser.phone 
        },
        date: 'الآن',
        status: 'pending',
        urgency: formData.urgency
    };
    
    workerOrders.unshift(correspondingOrder);
    
    showNotification('تم إرسال البلاغ بنجاح', 'success');
    showDashboardSection('residentComplaints');
    loadComplaintsList();
    
    document.getElementById('newComplaintForm').reset();
}

function saveResidentProfile() {
    if (!currentUser) return;
    
    const updatedData = {
        name: document.getElementById('residentProfileNameInput').value,
        phone: document.getElementById('residentProfilePhone').value,
        address: document.getElementById('residentProfileAddress').value,
        building: document.getElementById('residentProfileBuilding').value,
        apartment: document.getElementById('residentProfileApartment').value
    };
    
    // تحديث بيانات المستخدم
    Object.assign(currentUser, updatedData);
    saveUserToStorage(currentUser);
    
    // تحديث المستخدمين في التخزين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    loadResidentProfileData();
    showNotification('تم حفظ التغييرات بنجاح', 'success');
}

// ===== وظائف الصنايعي =====
function loadWorkerData() {
    loadWorkerOrders();
    loadWorkerSchedule();
    loadWorkerEarnings();
    loadWorkerProfileData();
}

function showWorkerSection(sectionId) {
    const sections = document.querySelectorAll('#workerDashboard .dashboard-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        updateSidebarActiveState('workerDashboard', sectionId);
        
        if (sectionId === 'workerOrders') {
            loadWorkerOrders();
        } else if (sectionId === 'workerSchedule') {
            loadWorkerSchedule();
        } else if (sectionId === 'workerEarnings') {
            loadWorkerEarnings();
        } else if (sectionId === 'workerProfile') {
            loadWorkerProfileData();
        }
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

function loadWorkerOrders(filter = 'all') {
    const ordersList = document.getElementById('workerOrdersList');
    if (!ordersList) return;
    
    let filteredOrders = workerOrders;
    
    if (filter !== 'all') {
        filteredOrders = workerOrders.filter(order => order.status === filter);
    }
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-data">
                <i class="fas fa-clipboard-list"></i>
                <p>لا توجد طلبات ${filter === 'all' ? '' : getStatusText(filter)}</p>
                ${filter === 'all' ? '<small>سيظهر هنا الطلبات الجديدة فور توفرها</small>' : ''}
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>${order.title}</h4>
                <span class="order-price">${order.price} جنيه</span>
            </div>
            <p class="order-desc">${order.description}</p>
            <div class="order-client">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="client-info">
                    <h5>${order.client.name}</h5>
                    <span>${order.client.location}</span>
                    <small>${order.client.phone}</small>
                </div>
            </div>
            <div class="order-footer">
                <div>
                    <span class="order-date">${order.date}</span>
                    <span class="complaint-urgency urgency-${order.urgency}">${getUrgencyText(order.urgency)}</span>
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="acceptOrder(${order.id})">قبول</button>
                        <button class="btn btn-sm btn-danger" onclick="rejectOrder(${order.id})">رفض</button>
                    ` : order.status === 'accepted' ? `
                        <button class="btn btn-sm btn-primary" onclick="startOrder(${order.id})">بدء التنفيذ</button>
                    ` : order.status === 'in-progress' ? `
                        <button class="btn btn-sm btn-success" onclick="completeOrder(${order.id})">إكمال</button>
                    ` : ''}
                    <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails(${order.id})">تفاصيل</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterWorkerOrders(filter) {
    loadWorkerOrders(filter);
}

function loadWorkerSchedule() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    if (!scheduleGrid) return;
    
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    scheduleGrid.innerHTML = days.map(day => `
        <div class="day-column">
            <div class="day-header">${day}</div>
            <div class="appointments" id="appointments-${day}">
                ${getAppointmentsForDay(day)}
            </div>
        </div>
    `).join('');
    
    updateWeekDisplay();
}

function getAppointmentsForDay(day) {
    const dayAppointments = workerAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const appointmentDay = dayNames[appointmentDate.getDay()];
        return appointmentDay === day;
    });
    
    if (dayAppointments.length === 0) {
        return '<div class="no-appointments">لا توجد مواعيد</div>';
    }
    
    return dayAppointments.map(apt => `
        <div class="appointment" onclick="viewAppointmentDetails(${apt.id})">
            <span class="appointment-time">${apt.time}</span>
            <span class="appointment-title">${apt.title}</span>
            <span class="appointment-client">${apt.client}</span>
        </div>
    `).join('');
}

function loadWorkerEarnings() {
    const earningsStats = document.getElementById('earningsStats');
    const totalEarnings = document.getElementById('totalEarnings');
    const totalTasks = document.getElementById('totalTasks');
    const averageRating = document.getElementById('averageRating');
    const completionRate = document.getElementById('completionRate');
    const completedTasks = document.getElementById('completedTasks');
    const workerRating = document.getElementById('workerRating');
    const responseRate = document.getElementById('responseRate');
    const recentEarningsList = document.getElementById('recentEarningsList');
    const sidebarRating = document.getElementById('sidebarRating');
    
    if (!currentUser) return;
    
    const completedOrders = workerOrders.filter(order => order.status === 'completed');
    const totalEarningsValue = completedOrders.reduce((sum, order) => sum + order.price, 0);
    const totalOrders = workerOrders.length;
    const completionRateValue = totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0;
    
    // تحديث الإحصائيات
    if (earningsStats) {
        earningsStats.innerHTML = `
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-wallet"></i>
                </div>
                <div class="earning-info">
                    <h3>${totalEarningsValue} جنيه</h3>
                    <p>إجمالي الأرباح</p>
                </div>
            </div>
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="earning-info">
                    <h3>${completedOrders.length}</h3>
                    <p>مهمة مكتملة</p>
                </div>
            </div>
            <div class="earning-card">
                <div class="earning-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="earning-info">
                    <h3>${currentUser.rating || '4.8'}/5</h3>
                    <p>متوسط التقييم</p>
                </div>
            </div>
        `;
    }
    
    // تحديث العناصر الأخرى
    if (totalEarnings) totalEarnings.textContent = `${totalEarningsValue} جنيه`;
    if (totalTasks) totalTasks.textContent = completedOrders.length;
    if (averageRating) averageRating.textContent = currentUser.rating || '4.8';
    if (completionRate) completionRate.textContent = `${completionRateValue}%`;
    if (completedTasks) completedTasks.textContent = completedOrders.length;
    if (workerRating) workerRating.textContent = currentUser.rating || '4.8';
    if (responseRate) responseRate.textContent = '95%';
    if (sidebarRating) sidebarRating.textContent = currentUser.rating || '4.8';
    
    // تحديث قائمة الأرباح الأخيرة
    if (recentEarningsList) {
        const recentEarnings = completedOrders.slice(0, 5);
        if (recentEarnings.length === 0) {
            recentEarningsList.innerHTML = '<div class="no-appointments">لا توجد أرباح حديثة</div>';
        } else {
            recentEarningsList.innerHTML = recentEarnings.map(order => `
                <div class="earning-item">
                    <div>
                        <strong>${order.title}</strong>
                        <div class="date">${order.date}</div>
                    </div>
                    <div class="amount">+${order.price} جنيه</div>
                </div>
            `).join('');
        }
    }
}

function changeEarningsPeriod(period) {
    // في التطبيق الحقيقي، هنا يتم تصفية البيانات حسب الفترة
    showNotification(`تم تغيير الفترة إلى ${getPeriodText(period)}`, 'info');
    loadWorkerEarnings();
}

function loadWorkerProfileData() {
    if (!currentUser) return;
    
    const elements = {
        userName: document.getElementById('workerUserName'),
        profileName: document.getElementById('workerProfileName'),
        profileSpecialty: document.getElementById('workerProfileSpecialty'),
        profileNameInput: document.getElementById('workerProfileNameInput'),
        profilePhone: document.getElementById('workerProfilePhone'),
        workerSpecialty: document.getElementById('workerSpecialty'),
        workerBio: document.getElementById('workerBio'),
        workerExperience: document.getElementById('workerExperience'),
        workerHourlyRate: document.getElementById('workerHourlyRate'),
        workerArea: document.getElementById('workerArea')
    };
    
    if (elements.userName) elements.userName.textContent = currentUser.name;
    if (elements.profileName) elements.profileName.textContent = currentUser.name;
    if (elements.profileSpecialty) elements.profileSpecialty.textContent = getSpecialtyText(currentUser.specialty);
    if (elements.profileNameInput) elements.profileNameInput.value = currentUser.name;
    if (elements.profilePhone) elements.profilePhone.value = currentUser.phone || '';
    if (elements.workerSpecialty) elements.workerSpecialty.value = currentUser.specialty || 'plumbing';
    if (elements.workerBio) elements.workerBio.value = currentUser.bio || '';
    if (elements.workerExperience) elements.workerExperience.value = currentUser.experience || 0;
    if (elements.workerHourlyRate) elements.workerHourlyRate.value = currentUser.hourlyRate || 100;
    if (elements.workerArea) elements.workerArea.value = currentUser.area || '';
    
    // تحميل خدمات الصنايعي
    loadWorkerServices();
}

function loadWorkerServices() {
    const servicesCheckboxes = document.getElementById('servicesCheckboxes');
    if (!servicesCheckboxes) return;
    
    servicesCheckboxes.innerHTML = services.map(service => `
        <label class="service-checkbox">
            <input type="checkbox" value="${service.id}" ${currentUser.services?.includes(service.id) ? 'checked' : ''}>
            <span>${service.name}</span>
        </label>
    `).join('');
}

function saveWorkerProfile() {
    if (!currentUser) return;
    
    const updatedData = {
        name: document.getElementById('workerProfileNameInput').value,
        phone: document.getElementById('workerProfilePhone').value,
        specialty: document.getElementById('workerSpecialty').value,
        bio: document.getElementById('workerBio').value,
        experience: parseInt(document.getElementById('workerExperience').value),
        hourlyRate: parseInt(document.getElementById('workerHourlyRate').value),
        area: document.getElementById('workerArea').value
    };
    
    // جمع الخدمات المحددة
    const selectedServices = Array.from(document.querySelectorAll('#servicesCheckboxes input:checked'))
        .map(checkbox => checkbox.value);
    updatedData.services = selectedServices;
    
    // تحديث بيانات المستخدم
    Object.assign(currentUser, updatedData);
    saveUserToStorage(currentUser);
    
    // تحديث المستخدمين في التخزين
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    loadWorkerProfileData();
    showNotification('تم حفظ التغييرات بنجاح', 'success');
}

// ===== وظائف تفاعل الصنايعي =====
function acceptOrder(orderId) {
    const order = workerOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'accepted';
        showNotification(`تم قبول طلب: ${order.title}`, 'success');
        
        // إنشاء موعد تلقائي
        const newAppointment = {
            id: workerAppointments.length + 1,
            title: order.title,
            client: order.client.name,
            date: getNextAvailableDate(),
            time: '10:00',
            duration: 2,
            type: order.type,
            status: 'scheduled'
        };
        
        workerAppointments.push(newAppointment);
        
        loadWorkerOrders();
        loadWorkerSchedule();
    }
}

function rejectOrder(orderId) {
    const orderIndex = workerOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        const order = workerOrders[orderIndex];
        workerOrders.splice(orderIndex, 1);
        showNotification(`تم رفض طلب: ${order.title}`, 'warning');
        loadWorkerOrders();
    }
}

function startOrder(orderId) {
    const order = workerOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'in-progress';
        showNotification(`بدأت تنفيذ طلب: ${order.title}`, 'info');
        loadWorkerOrders();
    }
}

function completeOrder(orderId) {
    const order = workerOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        
        // تحديث إحصائيات الصنايعي
        if (currentUser) {
            currentUser.completedTasks = (currentUser.completedTasks || 0) + 1;
            currentUser.totalEarnings = (currentUser.totalEarnings || 0) + order.price;
            saveUserToStorage(currentUser);
        }
        
        showNotification(`تم إكمال طلب: ${order.title}`, 'success');
        loadWorkerOrders();
        loadWorkerEarnings();
    }
}

function viewOrderDetails(orderId) {
    const order = workerOrders.find(o => o.id === orderId);
    if (order) {
        const details = `
            <strong>تفاصيل الطلب:</strong> ${order.title}
            <br><strong>الوصف:</strong> ${order.description}
            <br><strong>السعر:</strong> ${order.price} جنيه
            <br><strong>العميل:</strong> ${order.client.name}
            <br><strong>الهاتف:</strong> ${order.client.phone}
            <br><strong>الموقع:</strong> ${order.client.location}
        `;
        showNotification(details, 'info');
    }
}

function addNewAppointment() {
    showNotification('سيتم فتح نموذج إضافة موعد جديد في التطبيق الكامل', 'info');
}

function viewAppointmentDetails(appointmentId) {
    const appointment = workerAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        const details = `
            <strong>الموعد:</strong> ${appointment.title}
            <br><strong>العميل:</strong> ${appointment.client}
            <br><strong>التاريخ:</strong> ${appointment.date}
            <br><strong>الوقت:</strong> ${appointment.time}
            <br><strong>المدة:</strong> ${appointment.duration} ساعة
        `;
        showNotification(details, 'info');
    }
}

function toggleScheduleView() {
    showNotification('تم تبديل عرض الجدول', 'info');
}

function previousWeek() {
    currentWeek--;
    loadWorkerSchedule();
}

function nextWeek() {
    currentWeek++;
    loadWorkerSchedule();
}

function updateWeekDisplay() {
    const currentWeekElement = document.getElementById('currentWeek');
    if (currentWeekElement) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + currentWeek * 7 - today.getDay());
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        currentWeekElement.textContent = `الأسبوع: ${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
}

function changeWorkerAvatar() {
    showNotification('سيتم فتح خيارات تغيير الصورة في التطبيق الكامل', 'info');
}

function previewWorkerProfile() {
    showNotification('معاينة الملف الشخصي', 'info');
}

// ===== وظائف مساعدة =====
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'in-progress': 'جاري التنفيذ',
        'completed': 'مكتمل',
        'accepted': 'مقبول'
    };
    return statusMap[status] || status;
}

function getComplaintTypeText(type) {
    const typeMap = {
        'electricity': 'كهرباء',
        'plumbing': 'سباكة',
        'carpentry': 'نجارة',
        'painting': 'دهانات',
        'cleaning': 'نظافة',
        'furniture': 'أثاث',
        'other': 'أخرى'
    };
    return typeMap[type] || type;
}

function getUrgencyText(urgency) {
    const urgencyMap = {
        'low': 'منخفض',
        'medium': 'متوسط',
        'high': 'عالي',
        'emergency': 'طارئ'
    };
    return urgencyMap[urgency] || urgency;
}

function getSpecialtyText(specialty) {
    const specialtyMap = {
        'plumbing': 'سباك',
        'electricity': 'كهربائي',
        'carpentry': 'نجار',
        'painting': 'دهان',
        'cleaning': 'عامل نظافة',
        'furniture': 'فني أثاث'
    };
    return specialtyMap[specialty] || 'صنايعي';
}

function getPeriodText(period) {
    const periodMap = {
        'week': 'هذا الأسبوع',
        'month': 'هذا الشهر',
        'year': 'هذه السنة'
    };
    return periodMap[period] || period;
}

function calculateServicePrice(type, urgency) {
    const basePrices = {
        'plumbing': 100,
        'electricity': 150,
        'carpentry': 200,
        'painting': 250,
        'cleaning': 80,
        'furniture': 180,
        'other': 120
    };
    
    const urgencyMultipliers = {
        'low': 1,
        'medium': 1.2,
        'high': 1.5,
        'emergency': 2
    };
    
    const basePrice = basePrices[type] || 120;
    const multiplier = urgencyMultipliers[urgency] || 1;
    
    return Math.round(basePrice * multiplier);
}

function getNextAvailableDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
}

function formatDate(date) {
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showServiceDetails(serviceType) {
    const service = services.find(s => s.id === serviceType);
    if (service) {
        const details = `
            <strong>${service.name}</strong>
            <br>${service.description}
            <br><strong>السعر يبدأ من:</strong> ${service.basePrice} جنيه
            <br><strong>التقييم:</strong> ${service.rating} / 5
        `;
        showNotification(details, 'info');
    }
}

// ===== نظام الإشعارات =====
function showNotification(message, type = 'info') {
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
            
            .no-data {
                text-align: center;
                padding: 3rem;
                color: var(--gray-600);
            }
            
            .no-data i {
                font-size: 3rem;
                margin-bottom: 1rem;
                color: var(--gray-400);
            }
            
            .no-data p {
                margin-bottom: 1.5rem;
                font-size: 1.1rem;
            }
            
            .no-appointments {
                text-align: center;
                padding: 2rem 1rem;
                color: var(--gray-500);
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
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

// جعل الدوال متاحة عالمياً
window.showPage = showPage;
window.showSection = showSection;
window.showDashboardSection = showDashboardSection;
window.showWorkerSection = showWorkerSection;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showForgotPassword = showForgotPassword;
window.goBack = goBack;
window.showServiceDetails = showServiceDetails;
window.logout = logout;
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.startOrder = startOrder;
window.completeOrder = completeOrder;
window.viewOrderDetails = viewOrderDetails;
window.filterWorkerOrders = filterWorkerOrders;
window.addNewAppointment = addNewAppointment;
window.viewAppointmentDetails = viewAppointmentDetails;
window.toggleScheduleView = toggleScheduleView;
window.previousWeek = previousWeek;
window.nextWeek = nextWeek;
window.changeEarningsPeriod = changeEarningsPeriod;
window.changeWorkerAvatar = changeWorkerAvatar;
window.previewWorkerProfile = previewWorkerProfile;
window.searchServices = searchServices;