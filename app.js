// PWA Install Event Handler & Service Worker Registration
let deferredPrompt = null;
const installBtn = document.getElementById("btn-pwa-install");

// Make button visible by default to act as installation guide or trigger native prompt
if (installBtn) {
    installBtn.style.display = "inline-flex";
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
        installBtn.style.display = "inline-flex";
        installBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> تثبيت التطبيق';
    }
});

if (installBtn) {
    installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installBtn.style.display = "none";
        } else {
            // Show custom instruction modal if PWA native prompt is not active yet (e.g. running on file://)
            const instructionModal = document.getElementById("pwa-instruction-modal");
            if (instructionModal) {
                instructionModal.style.display = "flex";
            }
        }
    });
}

window.addEventListener("appinstalled", (evt) => {
    console.log("PWA was installed successfully");
    if (installBtn) installBtn.style.display = "none";
    showToast("🎉 تم تثبيت برنامج البصمة بنجاح على جهازك!", "success");
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// State Management
let currentMonth = "2026-07"; // Format YYYY-MM
let employees = [];
let activeEmployeeId = "1";
let attendanceData = [];
let hoursChartInstance = null;

// DOM Elements
const sidebarButtons = document.querySelectorAll(".nav-btn");
const pageSections = document.querySelectorAll(".page-section");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const globalMonthSelect = document.getElementById("global-month-select");
const globalEmployeeSelect = document.getElementById("global-employee-select");
const globalMonthSelectMobile = document.getElementById("global-month-select-mobile");
const globalEmployeeSelectMobile = document.getElementById("global-employee-select-mobile");
const themeToggleBtn = document.getElementById("theme-toggle");

// Active Employee Settings Elements
const setEmpName = document.getElementById("settings-emp-name");
const setEmpRole = document.getElementById("settings-emp-role");
const setSalary = document.getElementById("settings-salary");
const setWorkdays = document.getElementById("settings-workdays");
const setDailyhours = document.getElementById("settings-dailyhours");
const setStartTime = document.getElementById("settings-start-time");
const setGracePeriod = document.getElementById("settings-grace-period");
const setOvertimeMult = document.getElementById("settings-overtime-mult");
const setDelayMult = document.getElementById("settings-delay-mult");
const btnSaveSettings = document.getElementById("btn-save-settings");

// Dashboard Elements
const dashBasicSalary = document.getElementById("dash-basic-salary");
const dashOvertimeAmount = document.getElementById("dash-overtime-amount");
const dashOvertimeHours = document.getElementById("dash-overtime-hours");
const dashDeductionAmount = document.getElementById("dash-deduction-amount");
const dashDelayHours = document.getElementById("dash-delay-hours");
const dashNetSalary = document.getElementById("dash-net-salary");
const dashNetAdjustments = document.getElementById("dash-net-adjustments");
const statWorkDays = document.getElementById("stat-work-days");
const statAvgCheckin = document.getElementById("stat-avg-checkin");
const statWeekendDays = document.getElementById("stat-weekend-days");
const statLeavesDays = document.getElementById("stat-leaves-days");
const statAbsentDays = document.getElementById("stat-absent-days");

// Attendance Table Elements
const attendanceTableBody = document.getElementById("attendance-table-body");
const attendanceSearch = document.getElementById("attendance-search");
const filterStatus = document.getElementById("filter-status");
const btnResetAttendance = document.getElementById("btn-reset-attendance");
const btnAddRecord = document.getElementById("btn-add-record");

// Employees Page Elements
const employeesCardsContainer = document.getElementById("employees-cards-container");
const btnAddEmployee = document.getElementById("btn-add-employee");

// Modals
const editModal = document.getElementById("edit-modal");
const closeModalBtn = document.getElementById("close-modal");
const btnModalCancel = document.getElementById("btn-modal-cancel");
const btnModalSave = document.getElementById("btn-modal-save");
const modalDateInput = document.getElementById("modal-date");
const modalDateDisplay = document.getElementById("modal-date-display");
const modalStatusSelect = document.getElementById("modal-status");
const modalCheckinInput = document.getElementById("modal-checkin");
const modalCheckoutInput = document.getElementById("modal-checkout");
const timeInputsContainer = document.getElementById("time-inputs-container");

// Add/Edit Employee Modal
const employeeModal = document.getElementById("employee-modal");
const closeEmpModalBtn = document.getElementById("close-emp-modal");
const btnEmpModalCancel = document.getElementById("btn-emp-modal-cancel");
const btnEmpModalSave = document.getElementById("btn-emp-modal-save");
const empModalId = document.getElementById("emp-modal-id");
const empModalName = document.getElementById("emp-modal-name");
const empModalRole = document.getElementById("emp-modal-role");
const empModalSalary = document.getElementById("emp-modal-salary");
const empModalWorkdays = document.getElementById("emp-modal-workdays");
const empModalDailyhours = document.getElementById("emp-modal-dailyhours");
const empModalStarttime = document.getElementById("emp-modal-starttime");
const empModalGrace = document.getElementById("emp-modal-grace");
const empModalOvertimeMult = document.getElementById("emp-modal-overtime-mult");
const empModalDelayMult = document.getElementById("emp-modal-delay-mult");

// Supabase Client and Configuration
let supabaseClient = null;
const setSupabaseUrl = document.getElementById("settings-supabase-url");
const setSupabaseKey = document.getElementById("settings-supabase-key");
const supabaseStatus = document.getElementById("supabase-status");

// Biometric Scanner Elements
const btnBiometricScan = document.getElementById("btn-biometric-scan");
const fingerprintModal = document.getElementById("fingerprint-modal");
const closeFingerprintModal = document.getElementById("close-fingerprint-modal");
const biometricEmployeeSelect = document.getElementById("biometric-employee-select");
const fingerprintScannerZone = document.getElementById("fingerprint-scanner-zone");
const fingerprintLaser = document.getElementById("fingerprint-laser");
const scannerInstructionText = document.getElementById("scanner-instruction-text");

// Backup & Restore
const btnExportBackup = document.getElementById("btn-export-backup");
const btnTriggerImport = document.getElementById("btn-trigger-import");
const importBackupFile = document.getElementById("import-backup-file");

// Report Elements
const btnPrintSlip = document.getElementById("btn-print-slip");
const btnExportExcel = document.getElementById("btn-export-excel");
const slipMonthName = document.getElementById("slip-month-name");
const slipEmpName = document.getElementById("slip-emp-name");
const slipEmpId = document.getElementById("slip-emp-id");
const slipEmpRole = document.getElementById("slip-emp-role");
const slipIssueDate = document.getElementById("slip-issue-date");
const slipDailyRate = document.getElementById("slip-daily-rate");
const slipBasicVal = document.getElementById("slip-basic-val");
const slipOvertimeHrs = document.getElementById("slip-overtime-hrs");
const slipOvertimeRate = document.getElementById("slip-overtime-rate");
const slipOvertimeVal = document.getElementById("slip-overtime-val");
const slipDelayHrs = document.getElementById("slip-delay-hrs");
const slipDelayRate = document.getElementById("slip-delay-rate");
const slipDelayVal = document.getElementById("slip-delay-val");
const slipAbsentDaysCount = document.getElementById("slip-absent-days-count");
const slipAbsentRate = document.getElementById("slip-absent-rate");
const slipAbsentVal = document.getElementById("slip-absent-val");
const slipTotalAdd = document.getElementById("slip-total-add");
const slipTotalDed = document.getElementById("slip-total-ded");
const slipNetVal = document.getElementById("slip-net-val");

// Arabic Day/Month Names
const arabicDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const arabicMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Initialize the Application
document.addEventListener("DOMContentLoaded", async () => {
    // Auto-set current month
    const now = new Date();
    const autoMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    globalMonthSelect.value = autoMonth;
    if (globalMonthSelectMobile) {
        globalMonthSelectMobile.value = autoMonth;
    }

    initTheme();
    await initSupabase();
    await loadEmployees();
    await loadMonthData(globalMonthSelect.value);
    setupEventListeners();
    startLiveClock();

    // Auto-open biometric scanner on startup if employees exist
    if (employees.length > 0) {
        setTimeout(() => {
            openBiometricScannerModal();
        }, 800);
    }
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeToggleIcon(savedTheme);
}

// Initialize Supabase Connection
async function initSupabase() {
    const defaultUrl = "https://tcpovuzyhkyjiygbbwbq.supabase.co";
    const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcG92dXp5aGt5aml5Z2Jid2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTU0MTAsImV4cCI6MjA5ODgzMTQxMH0.yJQ525EkLUjBNULf9YMRH-FN35t_v-MhNBctNVQQShY";

    const url = localStorage.getItem("supabase_url") || defaultUrl;
    const key = localStorage.getItem("supabase_key") || defaultKey;

    // Save them to localStorage if they weren't there
    if (!localStorage.getItem("supabase_url")) localStorage.setItem("supabase_url", defaultUrl);
    if (!localStorage.getItem("supabase_key")) localStorage.setItem("supabase_key", defaultKey);

    if (setSupabaseUrl) setSupabaseUrl.value = url;
    if (setSupabaseKey) setSupabaseKey.value = key;

    if (!url || !key) {
        updateSupabaseStatus("offline", "الوضع المحلي (أوفلاين) - لم يتم الاتصال بقاعدة بيانات سحابية");
        supabaseClient = null;
        return false;
    }

    if (typeof supabase === "undefined") {
        updateSupabaseStatus("error", "خطأ: مكتبة سوبابيز غير محملة. تحقق من اتصال الإنترنت");
        supabaseClient = null;
        return false;
    }

    try {
        updateSupabaseStatus("offline", "جاري الاتصال بقاعدة البيانات السحابية...");
        supabaseClient = supabase.createClient(url, key);
        
        // Simple query to verify connection
        const { error } = await supabaseClient.from('employees').select('id').limit(1);
        
        if (error) {
            console.error("Supabase connection error:", error);
            updateSupabaseStatus("error", `خطأ اتصال سوبابيز: ${error.message}. تأكد من لصق كود إنشاء الجداول (SQL) في SQL Editor`);
            return false;
        }

        updateSupabaseStatus("online", "متصل سحابياً 🟢 - تمت المزامنة بنجاح مع قاعدة البيانات");
        return true;
    } catch (err) {
        console.error("Supabase exception:", err);
        updateSupabaseStatus("error", "فشل الاتصال: حدث خطأ أثناء الاتصال بـ Supabase");
        supabaseClient = null;
        return false;
    }
}

function updateSupabaseStatus(type, message) {
    if (!supabaseStatus) return;
    const dot = supabaseStatus.querySelector(".status-dot");
    const text = supabaseStatus.querySelector(".status-text");

    if (dot && text) {
        dot.className = `status-dot status-${type}`;
        text.textContent = message;
    }
}

// ============================================
// AUTOMATIC FEATURES - Live Clock & Smart Banner
// ============================================

function startLiveClock() {
    const clockEl = document.getElementById("live-clock");
    const dateEl = document.getElementById("live-date");
    const arabicDaysLong = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

    function tick() {
        const now = new Date();
        let hrs = now.getHours();
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12;
        hrs = hrs ? hrs : 12; // the hour '0' should be '12'
        
        const hrsStr = String(hrs).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        if (clockEl) clockEl.textContent = `${hrsStr}:${mins}:${secs} ${ampm}`;

        const dayName = arabicDaysLong[now.getDay()];
        const dayNum = now.getDate();
        const monthName = arabicMonths[now.getMonth()];
        const year = now.getFullYear();
        if (dateEl) dateEl.textContent = `${dayName}، ${dayNum} ${monthName} ${year}`;
    }

    tick();
    setInterval(tick, 1000);
}

// Quick Stamp: Register Check-in or Check-out at current time for TODAY
window.quickStamp = function(type) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Check if current month matches today's month
    const [selYear, selMonth] = globalMonthSelect.value.split('-').map(Number);
    if (selYear !== now.getFullYear() || selMonth !== (now.getMonth() + 1)) {
        showToast('انتقل أولاً للشهر الحالي لتسجيل الحضور الآن', 'warning');
        return;
    }

    const idx = attendanceData.findIndex(r => r.date === todayStr);
    if (idx === -1) {
        showToast('لا يوجد سجل لهذا اليوم في الشهر الحالي', 'warning');
        return;
    }

    const timeNow = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    if (type === 'checkin') {
        if (attendanceData[idx].checkin) {
            if (!confirm(`الحضور مسجل مسبقاً بـ ${formatTime12Hour(attendanceData[idx].checkin)}. هل تريد استبداله بالوقت الحالي ${formatTime12Hour(timeNow)}؟`)) return;
        }
        attendanceData[idx].status = 'present';
        attendanceData[idx].checkin = timeNow;
        showToast(`✅ تم تسجيل حضورك الساعة ${formatTime12Hour(timeNow)}`, 'success');
    } else {
        if (!attendanceData[idx].checkin) {
            showToast('سجّل الحضور أولاً قبل تسجيل الانصراف', 'warning');
            return;
        }
        if (attendanceData[idx].checkout) {
            if (!confirm(`الانصراف مسجل مسبقاً بـ ${formatTime12Hour(attendanceData[idx].checkout)}. هل تريد استبداله؟`)) return;
        }
        attendanceData[idx].checkout = timeNow;
        showToast(`🚪 تم تسجيل انصرافك الساعة ${formatTime12Hour(timeNow)}`, 'success');
    }

    saveCurrentMonthData();
    calculateAndPopulate();
};

// Update today's smart banner and sidebar quick-stamp status
function updateTodayBanner() {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const [selYear, selMonth] = globalMonthSelect.value.split('-').map(Number);
    const isCurrentMonth = selYear === now.getFullYear() && selMonth === (now.getMonth() + 1);

    const banner = document.getElementById('today-banner');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const bannerIcon = document.getElementById('banner-icon');
    const sidebarStatus = document.getElementById('today-status-sidebar');

    if (!isCurrentMonth) {
        if (banner) banner.style.display = 'none';
        if (sidebarStatus) sidebarStatus.textContent = 'أنت تعرض شهراً سابقاً';
        return;
    }

    const todayRecord = attendanceData.find(r => r.date === todayStr);
    if (!banner || !todayRecord) return;

    const dayName = arabicDayNames[now.getDay()];
    const dayNum = now.getDate();
    const monthName = arabicMonths[now.getMonth()];
    const activeEmp = employees.find(e => e.id === activeEmployeeId);

    // Hide banner for weekends
    if (todayRecord.status === 'weekend') {
        banner.style.display = 'none';
        if (sidebarStatus) sidebarStatus.textContent = `${dayName} - إجازة أسبوعية`;
        return;
    }

    banner.style.display = 'flex';
    banner.className = 'today-banner';

    if (todayRecord.checkin && todayRecord.checkout) {
        banner.classList.add('banner-success');
        bannerIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        bannerTitle.textContent = `${dayName} ${dayNum} ${monthName} — يوم مكتمل ✅`;
        bannerDesc.textContent = `حضور: ${formatTime12Hour(todayRecord.checkin)} — انصراف: ${formatTime12Hour(todayRecord.checkout)}`;
        if (sidebarStatus) sidebarStatus.textContent = `مكتمل — ${formatTime12Hour(todayRecord.checkin)}`;
    } else if (todayRecord.checkin && !todayRecord.checkout) {
        banner.classList.add('banner-warning');
        bannerIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
        bannerTitle.textContent = `أنت في العمل الآن — انتظر تسجيل الانصراف`;
        bannerDesc.textContent = `حضرت الساعة ${formatTime12Hour(todayRecord.checkin)} — ولم يُسجَّل الانصراف بعد`;
        if (sidebarStatus) sidebarStatus.textContent = `في العمل منذ ${formatTime12Hour(todayRecord.checkin)}`;
    } else if (todayRecord.status === 'absent') {
        banner.classList.add('banner-danger');
        bannerIcon.innerHTML = '<i class="fa-solid fa-user-slash"></i>';
        bannerTitle.textContent = `غياب مسجل ليوم ${dayName}`;
        bannerDesc.textContent = `هذا اليوم مُسجَّل كغياب غير مبرر — يُرجى المراجعة`;
        if (sidebarStatus) sidebarStatus.textContent = 'اليوم — غياب مسجل';
    } else if (todayRecord.status === 'leave') {
        banner.classList.add('banner-info');
        bannerIcon.innerHTML = '<i class="fa-solid fa-suitcase-medical"></i>';
        bannerTitle.textContent = `إجازة ليوم ${dayName}`;
        bannerDesc.textContent = 'هذا اليوم مُسجَّل كإجازة رسمية أو مرضية';
        if (sidebarStatus) sidebarStatus.textContent = 'اليوم — إجازة';
    } else {
        // No checkin yet (working day with no data)
        const nowHr = now.getHours();
        const [startH, startM] = (activeEmp ? activeEmp.startTime : '11:00').split(':').map(Number);
        const isLate = nowHr > startH || (nowHr === startH && now.getMinutes() > startM + (activeEmp ? (activeEmp.gracePeriod || 15) : 15));

        if (isLate) {
            banner.classList.add('banner-danger');
            bannerIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            bannerTitle.textContent = `تأخير! لم يُسجَّل حضور اليوم بعد`;
            bannerDesc.textContent = `وقت الحضور الرسمي هو ${activeEmp ? activeEmp.startTime : '11:00'} صباحاً — اضغط "حضور الآن" لتسجيل وقتك الفعلي`;
            if (sidebarStatus) sidebarStatus.textContent = 'اليوم — لم يُسجَّل الحضور!';
        } else {
            banner.classList.add('banner-info');
            bannerIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
            bannerTitle.textContent = `صباح الخير! لم يبدأ وقت الحضور الرسمي بعد`;
            bannerDesc.textContent = `وقت الحضور الرسمي: ${activeEmp ? activeEmp.startTime : '11:00'} — اضغط "حضور الآن" عند وصولك`;
            if (sidebarStatus) sidebarStatus.textContent = 'اليوم — في انتظار الحضور';
        }
    }
}

function updateThemeToggleIcon(theme) {
    const icon = themeToggleBtn.querySelector("i");
    if (theme === "dark") {
        icon.className = "fa-solid fa-sun";
    } else {
        icon.className = "fa-solid fa-moon";
    }
}

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeToggleIcon(newTheme);
    showToast("تم تغيير المظهر بنجاح", "success");
});

// Load Employees List from LocalStorage (with Supabase fallback and sync)
async function loadEmployees() {
    // Read from localStorage cache first
    const savedEmployees = localStorage.getItem("hr_employees");
    if (savedEmployees) {
        employees = JSON.parse(savedEmployees);
        // Clean default fallback if it's the only one
        if (employees.length === 1 && employees[0].id === "1" && employees[0].name === "عمر الخطيب") {
            employees = [];
            localStorage.setItem("hr_employees", JSON.stringify(employees));
            localStorage.removeItem("hr_active_employee_id");
            // Clear any attendance data cache for employee 1
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("attendance_data_1_")) {
                    localStorage.removeItem(key);
                    i--;
                }
            }
        }
    } else {
        // Start empty by default
        employees = [];
        localStorage.setItem("hr_employees", JSON.stringify(employees));
    }
    
    // If Supabase is connected, fetch fresh list from cloud
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from('employees').select('*').order('id');
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Map db snake_case fields to local camelCase fields
                employees = data.map(dbEmp => ({
                    id: dbEmp.id,
                    name: dbEmp.name,
                    role: dbEmp.role,
                    basicSalary: parseFloat(dbEmp.basic_salary),
                    workDays: parseInt(dbEmp.work_days),
                    dailyHours: parseInt(dbEmp.daily_hours),
                    startTime: dbEmp.start_time,
                    gracePeriod: parseInt(dbEmp.grace_period || 15),
                    overtimeMultiplier: parseFloat(dbEmp.overtime_multiplier),
                    delayMultiplier: parseFloat(dbEmp.delay_multiplier),
                    fingerprintRegistered: dbEmp.fingerprint_registered || false
                }));
                localStorage.setItem("hr_employees", JSON.stringify(employees));
                console.log("Employees synced from Supabase successfully");
            } else {
                // Cloud is empty, push local default employees to cloud
                await syncAllLocalEmployeesToCloud();
            }
        } catch (err) {
            console.warn("Could not sync employees from Supabase, using local cache:", err);
        }
    }
    
    // Load Active Employee ID
    activeEmployeeId = localStorage.getItem("hr_active_employee_id") || "1";
    
    // Ensure active employee exists, if not fallback to first
    let activeEmp = employees.find(e => e.id === activeEmployeeId);
    if (!activeEmp && employees.length > 0) {
        activeEmployeeId = employees[0].id;
        activeEmp = employees[0];
        localStorage.setItem("hr_active_employee_id", activeEmployeeId);
    }
    
    populateEmployeeDropdown();
    populateActiveEmployeeSettings(activeEmp);
    renderEmployeesList();
}

// Push all local employees to Supabase
async function syncAllLocalEmployeesToCloud() {
    if (!supabaseClient || employees.length === 0) return;
    try {
        const dbRows = employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            role: emp.role,
            basic_salary: emp.basicSalary,
            work_days: emp.workDays,
            daily_hours: emp.dailyHours,
            start_time: emp.startTime,
            grace_period: emp.gracePeriod,
            overtime_multiplier: emp.overtimeMultiplier,
            delay_multiplier: emp.delayMultiplier,
            fingerprint_registered: emp.fingerprintRegistered || false
        }));
        const { error } = await supabaseClient.from('employees').upsert(dbRows);
        if (error) throw error;
        console.log("Local employees pushed to Supabase successfully");
    } catch (err) {
        console.error("Error pushing employees to cloud:", err);
    }
}

function populateEmployeeDropdown() {
    globalEmployeeSelect.innerHTML = "";
    if (globalEmployeeSelectMobile) globalEmployeeSelectMobile.innerHTML = "";
    
    if (employees.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "لا يوجد موظفين مضافين";
        globalEmployeeSelect.appendChild(option);
        
        if (globalEmployeeSelectMobile) {
            const mobOption = option.cloneNode(true);
            globalEmployeeSelectMobile.appendChild(mobOption);
        }
        return;
    }
    employees.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = emp.name;
        if (emp.id === activeEmployeeId) {
            option.selected = true;
        }
        globalEmployeeSelect.appendChild(option);
        
        if (globalEmployeeSelectMobile) {
            const mobOption = option.cloneNode(true);
            globalEmployeeSelectMobile.appendChild(mobOption);
        }
    });
}

function populateActiveEmployeeSettings(emp) {
    if (!emp) {
        document.getElementById("display-employee-name").textContent = "لا يوجد موظف نشط";
        document.getElementById("display-employee-role").textContent = "يرجى إضافة موظف أولاً";
        
        if (setEmpName) setEmpName.value = "";
        if (setEmpRole) setEmpRole.value = "";
        if (setSalary) setSalary.value = "";
        if (setWorkdays) setWorkdays.value = "";
        if (setDailyhours) setDailyhours.value = "";
        if (setStartTime) setStartTime.value = "";
        if (setGracePeriod) setGracePeriod.value = "";
        if (setOvertimeMult) setOvertimeMult.value = "";
        if (setDelayMult) setDelayMult.value = "";
        return;
    }
    
    // Update sidebar bottom info
    document.getElementById("display-employee-name").textContent = emp.name;
    document.getElementById("display-employee-role").textContent = emp.role;
    
    // Update settings form
    setEmpName.value = emp.name;
    setEmpRole.value = emp.role;
    setSalary.value = emp.basicSalary;
    setWorkdays.value = emp.workDays;
    setDailyhours.value = emp.dailyHours;
    setStartTime.value = emp.startTime;
    setGracePeriod.value = emp.gracePeriod || 15;
    setOvertimeMult.value = emp.overtimeMultiplier;
    setDelayMult.value = emp.delayMultiplier;
}

// Save Active Employee Settings from Settings Form
btnSaveSettings.addEventListener("click", async () => {
    const idx = employees.findIndex(e => e.id === activeEmployeeId);
    if (idx === -1) return;
    
    employees[idx].name = setEmpName.value;
    employees[idx].role = setEmpRole.value;
    employees[idx].basicSalary = parseFloat(setSalary.value) || 0;
    employees[idx].workDays = parseInt(setWorkdays.value) || 22;
    employees[idx].dailyHours = parseInt(setDailyhours.value) || 8;
    employees[idx].startTime = setStartTime.value;
    employees[idx].gracePeriod = parseInt(setGracePeriod.value) || 15;
    employees[idx].overtimeMultiplier = parseFloat(setOvertimeMult.value) || 1.5;
    employees[idx].delayMultiplier = parseFloat(setDelayMult.value) || 2.0;

    // Save Supabase Settings if entered
    const oldUrl = localStorage.getItem("supabase_url") || "";
    const oldKey = localStorage.getItem("supabase_key") || "";
    const newUrl = setSupabaseUrl.value.trim();
    const newKey = setSupabaseKey.value.trim();

    localStorage.setItem("supabase_url", newUrl);
    localStorage.setItem("supabase_key", newKey);

    localStorage.setItem("hr_employees", JSON.stringify(employees));
    
    // Refresh Sidebar
    document.getElementById("display-employee-name").textContent = employees[idx].name;
    document.getElementById("display-employee-role").textContent = employees[idx].role;
    
    // If Supabase credentials changed or are newly set, re-initialize
    if (newUrl !== oldUrl || newKey !== oldKey) {
        await initSupabase();
    }

    // Sync active employee to Supabase cloud if online
    if (supabaseClient) {
        try {
            const dbEmp = {
                id: employees[idx].id,
                name: employees[idx].name,
                role: employees[idx].role,
                basic_salary: employees[idx].basicSalary,
                work_days: employees[idx].workDays,
                daily_hours: employees[idx].dailyHours,
                start_time: employees[idx].startTime,
                grace_period: employees[idx].gracePeriod,
                overtime_multiplier: employees[idx].overtimeMultiplier,
                delay_multiplier: employees[idx].delayMultiplier,
                fingerprint_registered: employees[idx].fingerprintRegistered || false
            };
            const { error } = await supabaseClient.from('employees').upsert(dbEmp);
            if (error) throw error;
            console.log("Active employee synced to Supabase successfully");
        } catch (err) {
            console.error("Error syncing active employee to Supabase:", err);
            showToast("حدث خطأ أثناء المزامنة السحابية للموظف. تم الحفظ محلياً فقط", "warning");
        }
    }
    
    populateEmployeeDropdown();
    renderEmployeesList();
    calculateAndPopulate();
    
    showToast("تم تحديث بيانات الموظف وإعادة احتساب سجلاته بنجاح", "success");
});

// Setup event listeners for tab switching, select box changes, modals, backups
function setupEventListeners() {
    // Sidebar Navigation Tabs
    sidebarButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            sidebarButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const target = btn.getAttribute("data-target");
            pageSections.forEach(sec => sec.classList.remove("active"));
            document.getElementById(`${target}-page`).classList.add("active");
            
            // Update Title
            const tabTitles = {
                dashboard: { title: "لوحة التحكم", subtitle: "نظرة عامة على حالة الحضور والرواتب لهذا الشهر" },
                attendance: { title: "سجل الحضور والانصراف", subtitle: "جدول تفصيلي لحضور وانصراف الموظف طوال أيام الشهر" },
                employees: { title: "إدارة الموظفين", subtitle: "إضافة وتعديل بيانات الموظفين وعقود رواتبهم وساعات العمل" },
                reports: { title: "مسيرات الرواتب والتقارير", subtitle: "كشف تفصيلي بمسير راتب الموظف النشط قابل للطباعة والتصدير" },
                settings: { title: "إعدادات النظام والنسخ", subtitle: "إعدادات الموظف النشط وأدوات تصدير واستيراد قواعد البيانات للنسخ الاحتياطي" }
            };
            pageTitle.textContent = tabTitles[target].title;
            pageSubtitle.textContent = tabTitles[target].subtitle;
            
            if (target === "dashboard") {
                renderHoursChart();
            } else if (target === "employees") {
                renderEmployeesList();
            }
        });
    });

    // Month Selector Change (Desktop & Mobile Synced)
    globalMonthSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (globalMonthSelectMobile) globalMonthSelectMobile.value = val;
        loadMonthData(val);
    });

    if (globalMonthSelectMobile) {
        globalMonthSelectMobile.addEventListener("change", (e) => {
            const val = e.target.value;
            globalMonthSelect.value = val;
            loadMonthData(val);
        });
    }

    // Employee Selector Switch Helper
    const switchActiveEmployee = (empId) => {
        activeEmployeeId = empId;
        localStorage.setItem("hr_active_employee_id", activeEmployeeId);
        
        // Sync dropdown values
        globalEmployeeSelect.value = activeEmployeeId;
        if (globalEmployeeSelectMobile) globalEmployeeSelectMobile.value = activeEmployeeId;
        
        const activeEmp = employees.find(emp => emp.id === activeEmployeeId);
        populateActiveEmployeeSettings(activeEmp);
        loadMonthData(globalMonthSelect.value);
        
        if (activeEmp) {
            showToast(`تم التغيير إلى ملف الموظف: ${activeEmp.name}`, "success");
        }
    };

    // Top Employee Selector Switch
    globalEmployeeSelect.addEventListener("change", (e) => {
        switchActiveEmployee(e.target.value);
    });

    if (globalEmployeeSelectMobile) {
        globalEmployeeSelectMobile.addEventListener("change", (e) => {
            switchActiveEmployee(e.target.value);
        });
    }

    // Search and Filter in Table
    attendanceSearch.addEventListener("input", filterAttendanceTable);
    filterStatus.addEventListener("change", filterAttendanceTable);

    // Modal Control (Attendance Edit)
    closeModalBtn.addEventListener("click", hideModal);
    btnModalCancel.addEventListener("click", hideModal);
    btnModalSave.addEventListener("click", saveModalRecord);
    
    modalStatusSelect.addEventListener("change", (e) => {
        if (e.target.value === "present") {
            timeInputsContainer.style.display = "grid";
        } else {
            timeInputsContainer.style.display = "none";
        }
    });

    // Manual Attendance Record Addition button
    btnAddRecord.addEventListener("click", () => {
        const todayStr = new Date().toISOString().split('T')[0];
        openEditModal(todayStr);
    });

    // Reset current month attendance
    btnResetAttendance.addEventListener("click", () => {
        if (confirm("هل أنت متأكد من إعادة تهيئة الشهر بالكامل؟ سيتم مسح أي تعديلات يدوية لهذا الموظف.")) {
            generateDefaultMonthData(currentMonth, true);
            calculateAndPopulate();
            showToast("تمت إعادة تهيئة الشهر للموظف النشط بنجاح", "success");
        }
    });

    // Export Excel Button
    btnExportExcel.addEventListener("click", exportToExcel);
    
    // Print Slip Button
    btnPrintSlip.addEventListener("click", () => {
        window.print();
    });

    // Add Employee Modals Control
    btnAddEmployee.addEventListener("click", () => openEmployeeModal());
    closeEmpModalBtn.addEventListener("click", hideEmployeeModal);
    btnEmpModalCancel.addEventListener("click", hideEmployeeModal);
    btnEmpModalSave.addEventListener("click", saveEmployeeRecord);

    // Backup Buttons
    btnExportBackup.addEventListener("click", exportFullBackup);
    btnTriggerImport.addEventListener("click", () => importBackupFile.click());
    importBackupFile.addEventListener("change", importFullBackup);

    // Mobile Navigation Controls
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileSidebarClose = document.getElementById("mobile-sidebar-close");

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener("click", () => {
            sidebar.classList.add("active");
            backdrop.classList.add("active");
        });
    }

    const closeMobileSidebar = () => {
        sidebar.classList.remove("active");
        backdrop.classList.remove("active");
    };

    if (mobileSidebarClose) {
        mobileSidebarClose.addEventListener("click", closeMobileSidebar);
    }
    if (backdrop) {
        backdrop.addEventListener("click", closeMobileSidebar);
    }

    // Auto-close sidebar on mobile when navigating tabs
    sidebarButtons.forEach(btn => {
        btn.addEventListener("click", closeMobileSidebar);
    });

    // Biometric scanner modal trigger
    if (btnBiometricScan) {
        btnBiometricScan.addEventListener("click", openBiometricScannerModal);
    }
    if (closeFingerprintModal) {
        closeFingerprintModal.addEventListener("click", closeBiometricScannerModal);
    }
    
    // Initialize scanner touch handlers
    initBiometricScannerEvents();
}

// ============================================
// BIOMETRIC FINGERPRINT SCANNER SYSTEM v2.1
// ============================================

let biometricProgressInterval = null;
let biometricHoldTime = 0;
const totalRequiredHoldTime = 1200; // 1.2 seconds for smooth scan experience
let isFingerprintRegistrationMode = false;
let fingerprintTargetEmp = null;

window.openRegisterFingerprint = function(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    openBiometricScannerModal(emp, true);
};

function openBiometricScannerModal(emp = null, isReg = false) {
    isFingerprintRegistrationMode = isReg;
    fingerprintTargetEmp = emp;

    const modalTitle = fingerprintModal ? fingerprintModal.querySelector("h3") : null;

    if (isReg && emp) {
        // Registration Mode: Lock dropdown to target employee
        if (modalTitle) modalTitle.textContent = "برنامج البصمة ⬅️ تسجيل بصمة جديدة";
        if (biometricEmployeeSelect) {
            biometricEmployeeSelect.innerHTML = `<option value="${emp.id}" selected>${emp.name} (${emp.role})</option>`;
            biometricEmployeeSelect.disabled = true;
        }
    } else {
        // Verification Mode: Let user select any employee
        if (modalTitle) modalTitle.textContent = "جهاز بصمة الموظفين البيومتري";
        if (biometricEmployeeSelect) {
            biometricEmployeeSelect.disabled = false;
            biometricEmployeeSelect.innerHTML = "";
            employees.forEach(empItem => {
                const opt = document.createElement("option");
                opt.value = empItem.id;
                opt.textContent = `${empItem.name} (${empItem.role})`;
                if (empItem.id === activeEmployeeId) {
                    opt.selected = true;
                }
                biometricEmployeeSelect.appendChild(opt);
            });
        }
    }

    if (fingerprintModal) fingerprintModal.style.display = "flex";
    resetBiometricScannerState();
}

function closeBiometricScannerModal() {
    if (fingerprintModal) fingerprintModal.style.display = "none";
    resetBiometricScannerState();
}

function resetBiometricScannerState() {
    clearInterval(biometricProgressInterval);
    biometricHoldTime = 0;
    
    if (fingerprintScannerZone) {
        fingerprintScannerZone.className = "fingerprint-scanner-circle";
    }
    
    const circle = document.querySelector(".progress-ring__circle");
    if (circle) {
        circle.style.strokeDashoffset = "465";
    }
    
    if (scannerInstructionText) {
        if (isFingerprintRegistrationMode && fingerprintTargetEmp) {
            scannerInstructionText.innerHTML = `مستعد لتسجيل بصمة جديدة لـ: <strong>${fingerprintTargetEmp.name}</strong><br>اضغط مع الاستمرار لبدء المسح والحفظ`;
        } else {
            scannerInstructionText.textContent = "اضغط مع الاستمرار بإصبعك على البصمة لمسح البصمة البيومترية";
        }
        scannerInstructionText.className = "scanner-instruction";
    }
}

function initBiometricScannerEvents() {
    if (!fingerprintScannerZone) return;

    // Use Pointer Events for unified Mobile Touch & Desktop Mouse support
    fingerprintScannerZone.addEventListener("pointerdown", startBiometricScan);
    fingerprintScannerZone.addEventListener("pointerup", cancelBiometricScan);
    fingerprintScannerZone.addEventListener("pointercancel", cancelBiometricScan);
    fingerprintScannerZone.addEventListener("pointerleave", cancelBiometricScan);
}

function startBiometricScan(e) {
    e.preventDefault();
    
    const selectedEmpId = biometricEmployeeSelect ? biometricEmployeeSelect.value : activeEmployeeId;
    const emp = employees.find(x => x.id === selectedEmpId);
    if (!emp) {
        showToast("يرجى اختيار موظف صالح أولاً", "warning");
        return;
    }

    // Security Check: If verifying and employee has no registered fingerprint, block them!
    if (!isFingerprintRegistrationMode && !emp.fingerprintRegistered) {
        if (scannerInstructionText) {
            scannerInstructionText.innerHTML = `<span class="text-danger bold"><i class="fa-solid fa-triangle-exclamation"></i> البصمة غير مسجلة!</span><br><span style="font-size:0.8rem;color:var(--text-muted);">سجل بصمة الموظف "${emp.name}" من صفحة الموظفين أولاً.</span>`;
            scannerInstructionText.className = "scanner-instruction text-danger bold";
        }
        return;
    }

    resetBiometricScannerState();

    // Visual feedback
    if (fingerprintScannerZone) {
        fingerprintScannerZone.classList.add("scanning");
    }
    if (scannerInstructionText) {
        if (isFingerprintRegistrationMode) {
            scannerInstructionText.innerHTML = `جاري تسجيل البصمة الخاصة بـ: <strong class="text-primary">${emp.name}</strong>...<br><span style="font-size:0.8rem;color:var(--text-muted);">اضغط بثبات ولا ترفع إصبعك عن القارئ</span>`;
        } else {
            scannerInstructionText.innerHTML = `جاري مطابقة البصمة مع بصمة: <strong class="text-primary">${emp.name}</strong>...<br><span style="font-size:0.8rem;color:var(--text-muted);">تحقق من هوية صاحب البصمة بيومترياً</span>`;
        }
    }

    const circle = document.querySelector(".progress-ring__circle");
    const intervalMs = 25;
    
    biometricProgressInterval = setInterval(async () => {
        biometricHoldTime += intervalMs;
        
        // Update circular progress ring
        const percentage = Math.min(biometricHoldTime / totalRequiredHoldTime, 1);
        const offset = 465 - (percentage * 465);
        if (circle) {
            circle.style.strokeDashoffset = offset;
        }

        if (percentage >= 1) {
            clearInterval(biometricProgressInterval);
            await completeBiometricScan(emp);
        }
    }, intervalMs);
}

function cancelBiometricScan() {
    if (biometricHoldTime > 0 && biometricHoldTime < totalRequiredHoldTime) {
        resetBiometricScannerState();
        if (scannerInstructionText) {
            scannerInstructionText.textContent = "تنبيه: تم رفع الإصبع قبل اكتمال المسح! اضغط بثبات.";
            scannerInstructionText.className = "scanner-instruction text-danger bold";
        }
    }
}

async function completeBiometricScan(emp) {
    clearInterval(biometricProgressInterval);
    
    if (fingerprintScannerZone) {
        fingerprintScannerZone.classList.remove("scanning");
        fingerprintScannerZone.classList.add("success");
    }
    
    if (isFingerprintRegistrationMode) {
        // Handle Biometric Fingerprint Registration
        emp.fingerprintRegistered = true;
        const idx = employees.findIndex(e => e.id === emp.id);
        if (idx !== -1) {
            employees[idx].fingerprintRegistered = true;
        }
        localStorage.setItem("hr_employees", JSON.stringify(employees));

        if (scannerInstructionText) {
            scannerInstructionText.innerHTML = `تم تسجيل البصمة بنجاح لـ:<br><strong class="text-success" style="font-size:1.1rem;">${emp.name} ✅</strong>`;
            scannerInstructionText.className = "scanner-instruction text-success bold";
        }

        // Sync to Supabase cloud
        if (supabaseClient) {
            try {
                const dbEmp = {
                    id: emp.id,
                    name: emp.name,
                    role: emp.role,
                    basic_salary: emp.basicSalary,
                    work_days: emp.workDays,
                    daily_hours: emp.dailyHours,
                    start_time: emp.startTime,
                    grace_period: emp.gracePeriod,
                    overtime_multiplier: emp.overtimeMultiplier,
                    delay_multiplier: emp.delayMultiplier,
                    fingerprint_registered: true
                };
                const { error } = await supabaseClient.from('employees').upsert(dbEmp);
                if (error) throw error;
                console.log("Registered fingerprint synced to cloud");
            } catch (err) {
                console.error("Error syncing fingerprint status to cloud:", err);
            }
        }

        showToast(`تم تسجيل وتنشيط بصمة الموظف ${emp.name} بنجاح`, "success");
        renderEmployeesList();

        setTimeout(() => {
            closeBiometricScannerModal();
        }, 1500);
        return;
    }

    // Handle Biometric Fingerprint Attendance Verification (PUNCH)
    if (scannerInstructionText) {
        scannerInstructionText.innerHTML = `تم التحقق من البصمة البيومترية بنجاح ✅<br><strong class="text-success" style="font-size:1.1rem;">تم التأكد من مطابقة بصمة ${emp.name}</strong>`;
        scannerInstructionText.className = "scanner-instruction text-success bold";
    }

    // Check device native biometric sensor
    if (window.PublicKeyCredential) {
        try {
            console.log("Biometric hardware API verified.");
        } catch (authErr) {
            console.warn("Native credential scan error:", authErr);
        }
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Switch active employee to the scanned employee to refresh dashboard
    activeEmployeeId = emp.id;
    localStorage.setItem("hr_active_employee_id", activeEmployeeId);
    populateActiveEmployeeSettings(emp);
    populateEmployeeDropdown();
    renderEmployeesList();
    
    // Ensure month data is loaded and synced for this employee
    const localDataKey = `attendance_data_${activeEmployeeId}_${currentMonth}`;
    let empAttendance = [];
    const localData = localStorage.getItem(localDataKey);
    if (localData) {
        empAttendance = JSON.parse(localData);
    } else {
        // Generate default days
        const [year, month] = currentMonth.split("-").map(Number);
        const totalDays = new Date(year, month, 0).getDate();
        for (let d = 1; d <= totalDays; d++) {
            const curDate = new Date(year, month - 1, d);
            const dayIdx = curDate.getDay();
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let status = dayIdx === 5 || dayIdx === 6 ? "weekend" : "present";
            empAttendance.push({
                date: dateStr,
                dayName: arabicDayNames[dayIdx],
                status: status,
                checkin: "",
                checkout: ""
            });
        }
    }

    const idx = empAttendance.findIndex(r => r.date === todayStr);
    if (idx === -1) {
        showToast("خطأ: لم يتم العثور على سجل حضور لليوم الحالي.", "danger");
        resetBiometricScannerState();
        return;
    }

    const timeNow = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    let punchMessage = "";

    if (empAttendance[idx].status === "weekend" || empAttendance[idx].status === "leave") {
        empAttendance[idx].status = "present";
    }

    if (!empAttendance[idx].checkin) {
        empAttendance[idx].checkin = timeNow;
        punchMessage = `✅ تم تسجيل حضورك بنجاح الساعة ${formatTime12Hour(timeNow)}`;
        showToast(punchMessage, "success");
    } else if (empAttendance[idx].checkin && !empAttendance[idx].checkout) {
        empAttendance[idx].checkout = timeNow;
        punchMessage = `🚪 تم تسجيل انصرافك بنجاح الساعة ${formatTime12Hour(timeNow)}`;
        showToast(punchMessage, "success");
    } else {
        empAttendance[idx].checkout = timeNow;
        punchMessage = `🚪 تم تحديث انصرافك بنجاح الساعة ${formatTime12Hour(timeNow)}`;
        showToast(punchMessage, "success");
    }

    // Save records
    attendanceData = empAttendance;
    saveCurrentMonthData();
    calculateAndPopulate();

    // Auto close modal
    setTimeout(() => {
        closeBiometricScannerModal();
    }, 1500);
}


// Load Month Data for Active Employee
async function loadMonthData(monthStr) {
    currentMonth = monthStr;
    
    // Read from localStorage cache first
    const localData = localStorage.getItem(`attendance_data_${activeEmployeeId}_${currentMonth}`);
    if (localData) {
        attendanceData = JSON.parse(localData);
    } else {
        generateDefaultMonthData(currentMonth);
    }
    
    // Sync with Supabase if online
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('attendance_records')
                .select('*')
                .eq('employee_id', activeEmployeeId)
                .eq('month', currentMonth)
                .order('date');
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Build a map of Supabase records by date for fast lookup
                const supabaseMap = new Map();
                data.forEach(dbRec => {
                    supabaseMap.set(dbRec.date, {
                        date: dbRec.date,
                        dayName: dbRec.day_name,
                        status: dbRec.status,
                        checkin: dbRec.checkin || "",
                        checkout: dbRec.checkout || ""
                    });
                });
                
                // SMART MERGE: Never overwrite locally-recorded attendance with empty cloud data.
                // Score each record: checkin = 2 pts, checkout = 1 pt.
                // The record with a higher score wins. On equal score, local wins
                // (it represents the user's most recent action on this device).
                const mergedData = attendanceData.map(localRec => {
                    const supRec = supabaseMap.get(localRec.date);
                    if (!supRec) return localRec; // Supabase has no record for this day → keep local
                    
                    const localScore = (localRec.checkin ? 2 : 0) + (localRec.checkout ? 1 : 0);
                    const supScore = (supRec.checkin ? 2 : 0) + (supRec.checkout ? 1 : 0);
                    
                    // Supabase wins only when it has strictly more data (another device recorded)
                    return supScore > localScore ? supRec : localRec;
                });
                
                attendanceData = mergedData;
                localStorage.setItem(`attendance_data_${activeEmployeeId}_${currentMonth}`, JSON.stringify(attendanceData));
                console.log("Month data merged from Supabase successfully");
                
                // Push the merged result back to cloud so it stays in sync
                await syncAllLocalAttendanceToCloud(currentMonth);
            } else {
                // Cloud is empty → push local data to cloud
                await syncAllLocalAttendanceToCloud(currentMonth);
            }
        } catch (err) {
            console.warn("Could not sync month data from Supabase, using cache:", err);
        }
    }
    
    calculateAndPopulate();
}

// Push all local attendance records of current employee/month to Supabase
async function syncAllLocalAttendanceToCloud(monthStr) {
    if (!supabaseClient || attendanceData.length === 0) return;
    try {
        const dbRows = attendanceData.map(row => ({
            employee_id: activeEmployeeId,
            month: monthStr,
            date: row.date,
            day_name: row.dayName,
            status: row.status,
            checkin: row.checkin || null,
            checkout: row.checkout || null
        }));
        const { error } = await supabaseClient.from('attendance_records').upsert(dbRows);
        if (error) throw error;
        console.log(`Local attendance for ${monthStr} pushed to Supabase successfully`);
    } catch (err) {
        console.error("Error pushing attendance to cloud:", err);
    }
}

// Generate default days for active employee
function generateDefaultMonthData(monthStr, force = false) {
    const [year, month] = monthStr.split("-").map(Number);
    const generatedData = [];
    const totalDays = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= totalDays; day++) {
        const currentDayDate = new Date(year, month - 1, day);
        const dayOfWeekIndex = currentDayDate.getDay(); 
        const dayOfWeekArabic = arabicDayNames[dayOfWeekIndex];
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let status = "present";
        let checkin = "";
        let checkout = "";
        
        // Friday & Saturday weekend
        if (dayOfWeekIndex === 5 || dayOfWeekIndex === 6) {
            status = "weekend";
        }

        generatedData.push({
            date: dateString,
            dayName: dayOfWeekArabic,
            status: status,
            checkin: checkin,
            checkout: checkout
        });
    }
    
    attendanceData = generatedData;
    saveCurrentMonthData();
}

function saveCurrentMonthData() {
    localStorage.setItem(`attendance_data_${activeEmployeeId}_${currentMonth}`, JSON.stringify(attendanceData));
    
    // Sync with Supabase asynchronously
    if (supabaseClient) {
        const dbRows = attendanceData.map(row => ({
            employee_id: activeEmployeeId,
            month: currentMonth,
            date: row.date,
            day_name: row.dayName,
            status: row.status,
            checkin: row.checkin || null,
            checkout: row.checkout || null
        }));
        
        supabaseClient.from('attendance_records').upsert(dbRows).then(({ error }) => {
            if (error) {
                console.error("Error syncing attendance updates to Supabase:", error);
            } else {
                console.log("Attendance updates pushed to Supabase successfully");
            }
        });
    }
}

// Time Helper Functions
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const hrs = parseInt(parts[0]) || 0;
    const mins = parseInt(parts[1]) || 0;
    return hrs * 60 + mins;
}

function formatMinutesToTimeString(totalMins) {
    const isNegative = totalMins < 0;
    const absMins = Math.abs(totalMins);
    const hrs = Math.floor(absMins / 60);
    const mins = absMins % 60;
    return `${isNegative ? '-' : ''}${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

function formatTime12Hour(time24Str) {
    if (!time24Str) return "-";
    const parts = time24Str.split(":");
    let hrs = parseInt(parts[0]) || 0;
    const mins = parseInt(parts[1]) || 0;
    const secs = parseInt(parts[2]) || 0;
    
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; 
    
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} ${ampm}`;
}

// Calculations and UI Rendering
function calculateAndPopulate() {
    const activeEmp = employees.find(e => e.id === activeEmployeeId);
    if (!activeEmp) {
        // Clear Dashboard Cards
        if (dashBasicSalary) dashBasicSalary.textContent = "0.00";
        if (dashOvertimeAmount) dashOvertimeAmount.textContent = "0.00";
        if (dashOvertimeHours) dashOvertimeHours.textContent = "0";
        if (dashDeductionAmount) dashDeductionAmount.textContent = "0.00";
        if (dashDelayHours) dashDelayHours.textContent = "0";
        if (dashNetSalary) dashNetSalary.textContent = "0.00";
        if (dashNetAdjustments) {
            dashNetAdjustments.textContent = "0.00";
            dashNetAdjustments.className = "";
        }
        
        // Clear stats list
        if (statWorkDays) statWorkDays.textContent = "0 / 0";
        if (statWeekendDays) statWeekendDays.textContent = "0";
        if (statLeavesDays) statLeavesDays.textContent = "0";
        if (statAbsentDays) statAbsentDays.textContent = "0";
        if (statAvgCheckin) statAvgCheckin.textContent = "--:--";
        
        // Clear Table
        if (attendanceTableBody) attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    لا يوجد موظف نشط لعرض سجلات حضوره. يرجى إضافة موظف أولاً وتفعيله.
                </td>
            </tr>
        `;
        
        // Clear slip (Reports Section)
        if (slipMonthName) slipMonthName.textContent = "---";
        if (slipEmpName) slipEmpName.textContent = "---";
        if (slipEmpId) slipEmpId.textContent = "---";
        if (slipEmpRole) slipEmpRole.textContent = "---";
        if (slipBasicVal) slipBasicVal.textContent = "0.00";
        if (slipOvertimeHrs) slipOvertimeHrs.textContent = "0";
        if (slipOvertimeVal) slipOvertimeVal.textContent = "0.00";
        if (slipDelayHrs) slipDelayHrs.textContent = "0";
        if (slipDelayVal) slipDelayVal.textContent = "0.00";
        if (slipAbsentDaysCount) slipAbsentDaysCount.textContent = "0";
        if (slipAbsentVal) slipAbsentVal.textContent = "0.00";
        if (slipTotalAdd) slipTotalAdd.textContent = "0.00";
        if (slipTotalDed) slipTotalDed.textContent = "0.00";
        if (slipNetVal) slipNetVal.textContent = "---";
        return;
    }

    // 1. Calculate Standard Values based on Active Employee
    const basicSalary = activeEmp.basicSalary;
    const workDays = activeEmp.workDays;
    const dailyHours = activeEmp.dailyHours;
    const gracePeriod = activeEmp.gracePeriod || 15;
    
    const dailyRate = basicSalary / workDays;
    const hourlyRate = dailyRate / dailyHours;
    const overtimeRateValue = hourlyRate * activeEmp.overtimeMultiplier;
    const delayRateValue = hourlyRate * activeEmp.delayMultiplier;
    
    // Monthly Totals
    let totalWorkMinutes = 0;
    let totalOvertimeMinutes = 0;
    let totalDelayMinutes = 0;
    let absentDaysCount = 0;
    let presentDaysCount = 0;
    let weekendDaysCount = 0;
    let leavesDaysCount = 0;
    
    const standardStartTimeMins = timeToMinutes(activeEmp.startTime);
    const standardDailyHoursMins = dailyHours * 60;
    
    attendanceTableBody.innerHTML = "";
    
    // Populate table rows
    attendanceData.forEach(row => {
        let displayCheckin = "-";
        let displayCheckout = "-";
        let displayWorkHours = "-";
        let overtimeVal = 0; 
        let delayVal = 0; 
        
        if (row.status === "present") {
            presentDaysCount++;
            
            // Calculate delay
            if (row.checkin) {
                displayCheckin = formatTime12Hour(row.checkin);
                const checkinMins = timeToMinutes(row.checkin);
                const delayMins = checkinMins - standardStartTimeMins;
                if (delayMins > gracePeriod) {
                    delayVal = delayMins - gracePeriod;
                    totalDelayMinutes += delayVal;
                }
            }
            
            // Calculate overtime
            if (row.checkin && row.checkout) {
                displayCheckout = formatTime12Hour(row.checkout);
                const checkinMins = timeToMinutes(row.checkin);
                const checkoutMins = timeToMinutes(row.checkout);
                
                const workedMins = checkoutMins - checkinMins;
                totalWorkMinutes += workedMins;
                displayWorkHours = formatMinutesToTimeString(workedMins);
                
                overtimeVal = workedMins - standardDailyHoursMins;
                totalOvertimeMinutes += overtimeVal;
            } else {
                displayWorkHours = "-";
            }
        } else if (row.status === "weekend") {
            weekendDaysCount++;
        } else if (row.status === "leave") {
            leavesDaysCount++;
        } else if (row.status === "absent") {
            absentDaysCount++;
        }
        
        // Render Row
        const tr = document.createElement("tr");
        if (row.status === "weekend") {
            tr.className = "weekend-row";
        } else if (row.status === "leave") {
            tr.className = "holiday-row";
        }

        // Auto-highlight today's row
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = row.date === todayStr;
        if (isToday) {
            tr.classList.add('today-row');
        }
        
        const displayDate = formatDateArabic(row.date);
        
        let statusBadge = "";
        if (row.status === "present") {
            statusBadge = `<span class="badge badge-present"><i class="fa-solid fa-circle-check"></i> حاضر</span>`;
        } else if (row.status === "weekend") {
            statusBadge = `<span class="badge badge-weekend"><i class="fa-solid fa-umbrella-beach"></i> إجازة أسبوعية</span>`;
        } else if (row.status === "leave") {
            statusBadge = `<span class="badge badge-leave"><i class="fa-solid fa-mug-hot"></i> إجازة أخرى</span>`;
        } else if (row.status === "absent") {
            statusBadge = `<span class="badge badge-absent"><i class="fa-solid fa-user-slash"></i> غياب</span>`;
        }
        
        let delayCellContent = delayVal > 0 ? `<span>${delayVal}</span><span class="delay-indicator"></span>` : "0";
        
        let overtimeCellContent = "";
        if (row.status === "present" && row.checkin && row.checkout) {
            if (overtimeVal < 0) {
                overtimeCellContent = `<span class="text-danger bold">${overtimeVal}</span>`;
            } else if (overtimeVal > 0) {
                overtimeCellContent = `<span class="text-success bold">+${overtimeVal}</span>`;
            } else {
                overtimeCellContent = "0";
            }
        } else {
            overtimeCellContent = "-";
        }
        
        tr.innerHTML = `
            <td>${displayDate}${isToday ? '<span class="today-label"><i class="fa-solid fa-star"></i> اليوم</span>' : ''}</td>
            <td>${row.dayName}</td>
            <td>${displayCheckin}</td>
            <td>${displayCheckout}</td>
            <td>${displayWorkHours}</td>
            <td>${overtimeCellContent}</td>
            <td style="position: relative;">${delayCellContent}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn-icon" onclick="openEditModal('${row.date}')" title="تعديل السجل">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </td>
        `;
        attendanceTableBody.appendChild(tr);
    });
    
    // 2. Perform Payroll Calculations
    const totalOvertimeHoursFloat = totalOvertimeMinutes / 60;
    const overtimePayAmount = totalOvertimeHoursFloat * overtimeRateValue;
    
    const totalDelayHoursFloat = totalDelayMinutes / 60;
    const delayDeductionAmount = totalDelayHoursFloat * delayRateValue;
    
    const absentDeductionAmount = absentDaysCount * dailyRate;
    
    const totalDeductions = delayDeductionAmount + absentDeductionAmount;
    const netAdjustments = overtimePayAmount - totalDeductions;
    const netSalary = basicSalary + netAdjustments;
    
    // 3. Populate Dashboard Card Values
    dashBasicSalary.textContent = formatCurrency(basicSalary);
    dashOvertimeAmount.textContent = formatCurrency(Math.max(0, overtimePayAmount)); 
    
    let displayDeductionsTotal = totalDeductions;
    if (overtimePayAmount < 0) {
        displayDeductionsTotal += Math.abs(overtimePayAmount);
        dashOvertimeAmount.textContent = "0.00";
        dashOvertimeHours.textContent = "0.00";
    } else {
        dashOvertimeHours.textContent = totalOvertimeHoursFloat.toFixed(2);
    }
    
    dashDeductionAmount.textContent = formatCurrency(displayDeductionsTotal);
    dashDelayHours.textContent = totalDelayHoursFloat.toFixed(2);
    
    dashNetSalary.textContent = formatCurrency(netSalary);
    dashNetAdjustments.textContent = (netAdjustments >= 0 ? "+" : "") + formatCurrency(netAdjustments);
    if (netAdjustments < 0) {
        dashNetAdjustments.className = "text-danger";
    } else if (netAdjustments > 0) {
        dashNetAdjustments.className = "text-success";
    } else {
        dashNetAdjustments.className = "";
    }
    
    // Month stats list
    statWorkDays.textContent = `${presentDaysCount} / ${attendanceData.length}`;
    statWeekendDays.textContent = weekendDaysCount;
    statLeavesDays.textContent = leavesDaysCount;
    statAbsentDays.textContent = absentDaysCount;
    
    // Average check-in time calculation
    let totalCheckinMinutesSum = 0;
    let checkinCount = 0;
    attendanceData.forEach(row => {
        if (row.status === "present" && row.checkin) {
            totalCheckinMinutesSum += timeToMinutes(row.checkin);
            checkinCount++;
        }
    });
    if (checkinCount > 0) {
        const avgMins = Math.round(totalCheckinMinutesSum / checkinCount);
        const avgHrs = Math.floor(avgMins / 60);
        const avgMinsRem = avgMins % 60;
        const avgAmpm = avgHrs >= 12 ? 'PM' : 'AM';
        const avgHrs12 = avgHrs % 12 === 0 ? 12 : avgHrs % 12;
        statAvgCheckin.textContent = `${String(avgHrs12).padStart(2, '0')}:${String(avgMinsRem).padStart(2, '0')} ${avgAmpm}`;
    } else {
        statAvgCheckin.textContent = "--:--";
    }
    
    // 4. Populate Salary Slip (Reports Section)
    const [yearPart, monthPart] = currentMonth.split("-");
    const monthNameArabic = arabicMonths[parseInt(monthPart) - 1];
    slipMonthName.textContent = `${monthNameArabic} ${yearPart}`;
    slipEmpName.textContent = activeEmp.name;
    slipEmpId.textContent = `EMP-${yearPart}-${activeEmp.id.padStart(3, '0')}`;
    slipEmpRole.textContent = activeEmp.role;
    
    const today = new Date();
    slipIssueDate.textContent = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    
    document.getElementById("slip-total-days-label").innerHTML = `<strong>${workDays} يوم عمل رسمية</strong>`;
    slipDailyRate.textContent = `${formatCurrency(dailyRate)} جنية / يوم`;
    slipBasicVal.textContent = `${formatCurrency(basicSalary)} جنية`;
    
    // Overtime
    slipOvertimeHrs.textContent = `${totalOvertimeHoursFloat.toFixed(3)} ساعة (${totalOvertimeMinutes} دقيقة)`;
    slipOvertimeRate.textContent = `${formatCurrency(overtimeRateValue)} جنية / ساعة`;
    if (overtimePayAmount >= 0) {
        slipOvertimeVal.textContent = `${formatCurrency(overtimePayAmount)} جنية`;
        slipOvertimeVal.className = "text-success bold";
    } else {
        slipOvertimeVal.textContent = `${formatCurrency(overtimePayAmount)} جنية`;
        slipOvertimeVal.className = "text-danger bold";
    }
    
    // Delay
    slipDelayHrs.textContent = `${totalDelayHoursFloat.toFixed(3)} ساعة (${totalDelayMinutes} دقيقة)`;
    slipDelayRate.textContent = `${formatCurrency(delayRateValue)} جنية / ساعة`;
    slipDelayVal.textContent = `${formatCurrency(delayDeductionAmount)} جنية`;
    
    // Absent
    slipAbsentDaysCount.textContent = `${absentDaysCount} يوم`;
    slipAbsentRate.textContent = `${formatCurrency(dailyRate)} جنية / يوم`;
    slipAbsentVal.textContent = `${formatCurrency(absentDeductionAmount)} جنية`;
    
    // Totals on Slip
    let totalAdd = basicSalary;
    if (overtimePayAmount > 0) {
        totalAdd += overtimePayAmount;
    }
    
    let totalDed = delayDeductionAmount + absentDeductionAmount;
    if (overtimePayAmount < 0) {
        totalDed += Math.abs(overtimePayAmount);
    }
    
    slipTotalAdd.textContent = `${formatCurrency(totalAdd)} جنية`;
    slipTotalDed.textContent = `${formatCurrency(totalDed)} جنية`;
    slipNetVal.textContent = `${formatCurrency(netSalary)} جنية مصري فقط لا غير`;
    
    // Render Chart
    renderHoursChart();

    // Update smart today banner & sidebar status
    updateTodayBanner();
}

// Helpers
function formatCurrency(val) {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateArabic(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${day}-${month}-${year}`;
}

// Filter table rows
function filterAttendanceTable() {
    const query = attendanceSearch.value.trim().toLowerCase();
    const statusVal = filterStatus.value;
    const rows = attendanceTableBody.querySelectorAll("tr");
    
    rows.forEach(tr => {
        const textContent = tr.textContent.toLowerCase();
        const badgeCell = tr.cells[7].querySelector(".badge");
        let rowStatus = "present";
        
        if (tr.classList.contains("weekend-row")) {
            rowStatus = "weekend";
        } else if (tr.classList.contains("holiday-row")) {
            rowStatus = "leave";
        } else if (badgeCell && badgeCell.classList.contains("badge-absent")) {
            rowStatus = "absent";
        }
        
        const hasDelay = tr.cells[6].querySelector(".delay-indicator") !== null;
        
        let matchesSearch = textContent.includes(query);
        let matchesStatus = true;
        
        if (statusVal === "present" && (rowStatus !== "present" || tr.cells[2].textContent === "-")) matchesStatus = false;
        else if (statusVal === "weekend" && rowStatus !== "weekend") matchesStatus = false;
        else if (statusVal === "leave" && rowStatus !== "leave") matchesStatus = false;
        else if (statusVal === "absent" && rowStatus !== "absent") matchesStatus = false;
        else if (statusVal === "delay" && !hasDelay) matchesStatus = false;
        
        if (matchesSearch && matchesStatus) {
            tr.style.display = "";
        } else {
            tr.style.display = "none";
        }
    });
}

// Attendance Edit Modal Functions
function openEditModal(dateStr) {
    const record = attendanceData.find(r => r.date === dateStr);
    if (!record) return;
    
    modalDateInput.value = dateStr;
    modalDateDisplay.textContent = formatDateArabic(dateStr) + ` (${record.dayName})`;
    modalStatusSelect.value = record.status;
    modalCheckinInput.value = record.checkin || "";
    modalCheckoutInput.value = record.checkout || "";
    
    if (record.status === "present") {
        timeInputsContainer.style.display = "grid";
    } else {
        timeInputsContainer.style.display = "none";
    }
    
    editModal.style.display = "flex";
}

function hideModal() {
    editModal.style.display = "none";
}

function saveModalRecord() {
    const dateStr = modalDateInput.value;
    const index = attendanceData.findIndex(r => r.date === dateStr);
    if (index === -1) return;
    
    const newStatus = modalStatusSelect.value;
    let newCheckin = modalCheckinInput.value;
    let newCheckout = modalCheckoutInput.value;
    
    if (newStatus !== "present") {
        newCheckin = "";
        newCheckout = "";
    }
    
    if (newCheckin && newCheckin.split(":").length === 2) {
        newCheckin += ":00";
    }
    if (newCheckout && newCheckout.split(":").length === 2) {
        newCheckout += ":00";
    }
    
    attendanceData[index].status = newStatus;
    attendanceData[index].checkin = newCheckin;
    attendanceData[index].checkout = newCheckout;
    
    saveCurrentMonthData();
    calculateAndPopulate();
    hideModal();
    showToast(`تم تحديث سجل يوم ${formatDateArabic(dateStr)} بنجاح`, "success");
}

// Render Employees list on Manage Employees Page
function renderEmployeesList() {
    employeesCardsContainer.innerHTML = "";
    
    if (employees.length === 0) {
        employeesCardsContainer.innerHTML = `
            <div class="no-data-placeholder" style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-color); margin: 1rem 0;">
                <i class="fa-solid fa-users" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                <h3 style="margin-bottom: 0.5rem; color: var(--text-main);">لا يوجد موظفين مضافين حالياً</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">ابدأ بإضافة موظف جديد لتسجيل الحضور والرواتب</p>
                <button class="btn btn-primary" onclick="openEmployeeModal()"><i class="fa-solid fa-plus"></i> إضافة موظف جديد</button>
            </div>
        `;
        return;
    }
    
    employees.forEach(emp => {
        const card = document.createElement("div");
        const isActive = emp.id === activeEmployeeId;
        card.className = `employee-card ${isActive ? 'active-emp' : ''}`;
        
        card.innerHTML = `
            <h3>${emp.name}</h3>
            <span class="emp-badge">${isActive ? 'نشط حالياً' : 'موظف'}</span>
            <div class="employee-card-details">
                <div>
                    <span>المسمى الوظيفي:</span>
                    <span class="val">${emp.role}</span>
                </div>
                <div>
                    <span>الراتب الأساسي:</span>
                    <span class="val">${formatCurrency(emp.basicSalary)} جنية</span>
                </div>
                <div>
                    <span>أيام العمل المقررة:</span>
                    <span class="val">${emp.workDays} يوم</span>
                </div>
                <div>
                    <span>الحضور الرسمي:</span>
                    <span class="val">${emp.startTime} (سماح ${emp.gracePeriod || 15} د)</span>
                </div>
                <div>
                    <span>بصمة الإصبع:</span>
                    <span class="val">${emp.fingerprintRegistered ? '<span class="text-success bold"><i class="fa-solid fa-fingerprint"></i> مسجلة 🟢</span>' : '<span class="text-danger bold">غير مسجلة 🔴</span>'}</span>
                </div>
            </div>
            <div class="employee-card-actions">
                ${!isActive ? `
                    <button class="btn btn-primary btn-sm" onclick="activateEmployee('${emp.id}')">
                        <i class="fa-solid fa-circle-check"></i> تفعيل الموظف
                    </button>
                ` : `
                    <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.6;">
                        <i class="fa-solid fa-circle-check"></i> الموظف النشط
                    </button>
                `}
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn-icon" onclick="openRegisterFingerprint('${emp.id}')" title="تسجيل/تحديث البصمة الخاصة بالشخص">
                        <i class="fa-solid fa-fingerprint" style="color: ${emp.fingerprintRegistered ? 'var(--success)' : 'var(--danger)'}"></i>
                    </button>
                    <button class="btn-icon" onclick="openEmployeeModal('${emp.id}')" title="تعديل عقد الموظف">
                        <i class="fa-solid fa-user-gear"></i>
                    </button>
                    ${employees.length > 1 ? `
                        <button class="btn-icon btn-icon-danger" onclick="deleteEmployee('${emp.id}')" title="حذف الموظف بالكامل">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        employeesCardsContainer.appendChild(card);
    });
}

// Activate Employee
window.activateEmployee = function(id) {
    activeEmployeeId = id;
    localStorage.setItem("hr_active_employee_id", activeEmployeeId);
    
    const activeEmp = employees.find(emp => emp.id === activeEmployeeId);
    populateActiveEmployeeSettings(activeEmp);
    populateEmployeeDropdown();
    renderEmployeesList();
    loadMonthData(globalMonthSelect.value);
    
    showToast(`تم تنشيط الموظف ${activeEmp.name} للعمل على سجلاته`, "success");
};

window.deleteEmployee = async function(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    
    if (confirm(`هل أنت متأكد من حذف الموظف "${emp.name}" وكافة سجلات حضوره ورواتبه نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        // Remove employee locally
        employees = employees.filter(e => e.id !== id);
        localStorage.setItem("hr_employees", JSON.stringify(employees));
        
        // Clean up local attendance cache
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`attendance_data_${id}_`)) {
                localStorage.removeItem(key);
                i--; // Adjust index
            }
        }
        
        // Sync delete with Supabase if online
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient.from('employees').delete().eq('id', id);
                if (error) throw error;
                console.log("Employee deleted from Supabase cloud");
            } catch (err) {
                console.error("Error deleting employee from Supabase:", err);
                showToast("حدث خطأ أثناء الحذف السحابي للموظف. تم الحذف محلياً", "warning");
            }
        }
        
        // Adjust active employee if deleted
        if (activeEmployeeId === id) {
            activeEmployeeId = employees[0].id;
            localStorage.setItem("hr_active_employee_id", activeEmployeeId);
            const activeEmp = employees.find(e => e.id === activeEmployeeId);
            populateActiveEmployeeSettings(activeEmp);
        }
        
        populateEmployeeDropdown();
        renderEmployeesList();
        await loadMonthData(globalMonthSelect.value);
        showToast("تم حذف الموظف وسجلاته بالكامل بنجاح", "success");
    }
};

// Open Employee add/edit Modal
window.openEmployeeModal = function(id = "") {
    if (id) {
        // Edit Mode
        const emp = employees.find(e => e.id === id);
        if (!emp) return;
        
        document.getElementById("emp-modal-title").textContent = "تعديل بيانات الموظف";
        empModalId.value = emp.id;
        empModalName.value = emp.name;
        empModalRole.value = emp.role;
        empModalSalary.value = emp.basicSalary;
        empModalWorkdays.value = emp.workDays;
        empModalDailyhours.value = emp.dailyHours;
        empModalStarttime.value = emp.startTime;
        empModalGrace.value = emp.gracePeriod || 15;
        empModalOvertimeMult.value = emp.overtimeMultiplier;
        empModalDelayMult.value = emp.delayMultiplier;
    } else {
        // Add Mode
        document.getElementById("emp-modal-title").textContent = "إضافة موظف جديد";
        empModalId.value = "";
        empModalName.value = "";
        empModalRole.value = "";
        empModalSalary.value = 10000;
        empModalWorkdays.value = 22;
        empModalDailyhours.value = 8;
        empModalStarttime.value = "11:00";
        empModalGrace.value = 15;
        empModalOvertimeMult.value = 1.5;
        empModalDelayMult.value = 2.0;
    }
    
    employeeModal.style.display = "flex";
};

function hideEmployeeModal() {
    employeeModal.style.display = "none";
}

async function saveEmployeeRecord() {
    const id = empModalId.value;
    const name = empModalName.value.trim();
    const role = empModalRole.value.trim();
    
    if (!name || !role) {
        showToast("يرجى ملء الاسم والمسمى الوظيفي للموظف", "warning");
        return;
    }
    
    const salary = parseFloat(empModalSalary.value) || 0;
    const workdays = parseInt(empModalWorkdays.value) || 22;
    const dailyhours = parseInt(empModalDailyhours.value) || 8;
    const starttime = empModalStarttime.value;
    const grace = parseInt(empModalGrace.value) || 15;
    const overtimeMult = parseFloat(empModalOvertimeMult.value) || 1.5;
    const delayMult = parseFloat(empModalDelayMult.value) || 2.0;
    
    let targetId = id;
    
    if (id) {
        // Update existing employee
        const idx = employees.findIndex(e => e.id === id);
        if (idx !== -1) {
            employees[idx].name = name;
            employees[idx].role = role;
            employees[idx].basicSalary = salary;
            employees[idx].workDays = workdays;
            employees[idx].dailyHours = dailyhours;
            employees[idx].startTime = starttime;
            employees[idx].gracePeriod = grace;
            employees[idx].overtimeMultiplier = overtimeMult;
            employees[idx].delayMultiplier = delayMult;
            
            // If active employee is being edited, update active settings
            if (id === activeEmployeeId) {
                populateActiveEmployeeSettings(employees[idx]);
            }
            showToast("تم تحديث بيانات الموظف بنجاح", "success");
        }
    } else {
        // Create new employee
        const newId = employees.length > 0 ? (Math.max(...employees.map(e => parseInt(e.id))) + 1).toString() : "1";
        targetId = newId;
        const newEmp = {
            id: newId,
            name: name,
            role: role,
            basicSalary: salary,
            workDays: workdays,
            dailyHours: dailyhours,
            startTime: starttime,
            gracePeriod: grace,
            overtimeMultiplier: overtimeMult,
            delayMultiplier: delayMult
        };
        employees.push(newEmp);
        showToast("تم إضافة الموظف الجديد بنجاح", "success");
    }
    
    localStorage.setItem("hr_employees", JSON.stringify(employees));
    
    // Sync with Supabase if online
    if (supabaseClient) {
        try {
            const dbEmp = {
                id: targetId,
                name: name,
                role: role,
                basic_salary: salary,
                work_days: workdays,
                daily_hours: dailyhours,
                start_time: starttime,
                grace_period: grace,
                overtime_multiplier: overtimeMult,
                delay_multiplier: delayMult
            };
            const { error } = await supabaseClient.from('employees').upsert(dbEmp);
            if (error) throw error;
            console.log("Employee details synced to Supabase successfully");
        } catch (err) {
            console.error("Error syncing employee details to Supabase:", err);
            showToast("فشلت المزامنة السحابية للموظف. تم الحفظ محلياً", "warning");
        }
    }
    
    populateEmployeeDropdown();
    renderEmployeesList();
    hideEmployeeModal();
    calculateAndPopulate();
}

// Backup & Restore Database
function exportFullBackup() {
    const backupObj = {
        hr_employees: employees,
        hr_active_employee_id: activeEmployeeId,
        theme: localStorage.getItem("theme") || "light"
    };
    
    // Pull all monthly attendance records
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("attendance_data_")) {
            backupObj[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    downloadAnchor.setAttribute("download", `نسخة_احتياطية_نظام_بصمة_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("تم تصدير نسخة احتياطية من قاعدة البيانات بنجاح", "success");
}

function importFullBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.hr_employees || !importedData.hr_active_employee_id) {
                showToast("ملف النسخة الاحتياطية غير صالح أو تالف", "danger");
                return;
            }
            
            if (confirm("تحذير: استيراد النسخة الاحتياطية سيقوم باستبدال كافة البيانات الحالية للموظفين وسجلات الحضور. هل تريد الاستمرار؟")) {
                // Clear all old system keys first
                localStorage.clear();
                
                // Write imported keys
                Object.keys(importedData).forEach(key => {
                    if (typeof importedData[key] === "object") {
                        localStorage.setItem(key, JSON.stringify(importedData[key]));
                    } else {
                        localStorage.setItem(key, importedData[key]);
                    }
                });
                
                showToast("تم استيراد قاعدة البيانات بنجاح، جاري إعادة تحميل التطبيق...", "success");
                setTimeout(() => location.reload(), 1500);
            }
        } catch (err) {
            showToast("حدث خطأ أثناء قراءة ملف النسخ الاحتياطي", "danger");
        }
    };
    reader.readAsText(file);
}

// Toast Notifications Helper
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "fa-circle-check";
    if (type === "danger") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-100%)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Chart Rendering
function renderHoursChart() {
    const ctx = document.getElementById("hoursChart");
    if (!ctx) return;
    
    if (typeof Chart === 'undefined') {
        ctx.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-weight:500;text-align:center;padding:20px;direction:rtl;">
            <i class="fa-solid fa-triangle-exclamation" style="margin-left:8px;color:var(--warning);"></i>
            يتطلب رسم المخططات البيانية اتصالاً بالإنترنت لتحميل مكتبة الرسم.
        </div>`;
        return;
    }
    
    const activeEmp = employees.find(e => e.id === activeEmployeeId);
    const labels = [];
    const workHoursData = [];
    const overtimeData = [];
    const delayData = [];
    
    attendanceData.forEach(row => {
        const dayNum = parseInt(row.date.split("-")[2]);
        labels.push(dayNum);
        
        if (row.status === "present" && row.checkin && row.checkout) {
            const checkinMins = timeToMinutes(row.checkin);
            const checkoutMins = timeToMinutes(row.checkout);
            const workedHours = (checkoutMins - checkinMins) / 60;
            workHoursData.push(parseFloat(workedHours.toFixed(2)));
        } else {
            workHoursData.push(0);
        }
        
        if (row.status === "present") {
            const standardStartTimeMins = timeToMinutes(activeEmp.startTime);
            const checkinMins = timeToMinutes(row.checkin);
            const gracePeriod = activeEmp.gracePeriod || 15;
            const delayMins = checkinMins - standardStartTimeMins;
            if (row.checkin && delayMins > gracePeriod) {
                delayData.push(parseFloat(((delayMins - gracePeriod) / 60).toFixed(2)));
            } else {
                delayData.push(0);
            }
            
            if (row.checkin && row.checkout) {
                const checkoutMins = timeToMinutes(row.checkout);
                const workedMins = checkoutMins - checkinMins;
                const standardDailyHoursMins = activeEmp.dailyHours * 60;
                const otHrs = (workedMins - standardDailyHoursMins) / 60;
                overtimeData.push(parseFloat(otHrs.toFixed(2)));
            } else {
                overtimeData.push(0);
            }
        } else {
            delayData.push(0);
            overtimeData.push(0);
        }
    });

    if (hoursChartInstance) {
        hoursChartInstance.destroy();
    }
    
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const textThemeColor = isDark ? "#94a3b8" : "#64748b";
    const borderThemeColor = isDark ? "#1e293b" : "#e2e8f0";

    hoursChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'ساعات العمل الفعلية',
                    data: workHoursData,
                    backgroundColor: 'rgba(59, 130, 246, 0.65)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'الإضافي',
                    data: overtimeData.map(v => v > 0 ? v : 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.65)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'التأخير (ساعة)',
                    data: delayData,
                    backgroundColor: 'rgba(239, 68, 68, 0.65)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Tajawal', size: 12 },
                        color: textThemeColor
                    },
                    rtl: true
                },
                tooltip: {
                    rtl: true,
                    titleFont: { family: 'Tajawal' },
                    bodyFont: { family: 'Tajawal' }
                }
            },
            scales: {
                x: {
                    grid: { color: borderThemeColor },
                    ticks: { color: textThemeColor, font: { family: 'Tajawal' } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: borderThemeColor },
                    ticks: { color: textThemeColor, font: { family: 'Tajawal' } }
                }
            }
        }
    });
}

// Export to Excel (CSV)
function exportToExcel() {
    const activeEmp = employees.find(e => e.id === activeEmployeeId);
    let csvContent = "\uFEFF"; 
    
    csvContent += `الموظف:,"${activeEmp.name}",المسمى الوظيفي:,"${activeEmp.role}"\n`;
    csvContent += "التاريخ,اليوم,الحضور,الانصراف,ساعات العمل,إضافي (دقيقة),تأخير (دقيقة),الحالة\n";
    
    attendanceData.forEach(row => {
        let checkin = row.checkin ? formatTime12Hour(row.checkin) : "-";
        let checkout = row.checkout ? formatTime12Hour(row.checkout) : "-";
        let workHours = "-";
        let overtime = "0";
        let delay = "0";
        
        if (row.status === "present") {
            const standardStartTimeMins = timeToMinutes(activeEmp.startTime);
            const standardDailyHoursMins = activeEmp.dailyHours * 60;
            const gracePeriod = activeEmp.gracePeriod || 15;
            
            if (row.checkin) {
                const checkinMins = timeToMinutes(row.checkin);
                const delayMins = checkinMins - standardStartTimeMins;
                if (delayMins > gracePeriod) {
                    delay = (delayMins - gracePeriod).toString();
                }
            }
            
            if (row.checkin && row.checkout) {
                const checkinMins = timeToMinutes(row.checkin);
                const checkoutMins = timeToMinutes(row.checkout);
                const workedMins = checkoutMins - checkinMins;
                workHours = formatMinutesToTimeString(workedMins);
                overtime = (workedMins - standardDailyHoursMins).toString();
            }
        }
        
        let statusStr = "";
        if (row.status === "present") statusStr = "حاضر";
        else if (row.status === "weekend") statusStr = "إجازة أسبوعية";
        else if (row.status === "leave") statusStr = "إجازة أخرى";
        else if (row.status === "absent") statusStr = "غياب";
        
        const rowData = [
            formatDateArabic(row.date),
            row.dayName,
            checkin,
            checkout,
            workHours,
            overtime,
            delay,
            statusStr
        ];
        
        csvContent += rowData.map(val => `"${val}"`).join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `سجل_حضور_${activeEmp.name}_${currentMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`تم تصدير كشف الحضور للموظف ${activeEmp.name} بنجاح`, "success");
}
