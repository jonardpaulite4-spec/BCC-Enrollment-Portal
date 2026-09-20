/* =====================================================================
   ADMIN PORTAL (MODERN BCC ADMIN DASHBOARD)
   A super-role control panel over Student, Instructor, and Registrar portals.
   Provides direct editing, creation, and deletion capability across all
   features, subjects, schedules, grades, attendance, documents, sections,
   rooms, course programs, announcements, and user accounts.
===================================================================== */

function renderAdminRole() {
  switch (state.adminScreen) {
    case "login": return adminLoginScreen();
    case "register": return adminRegisterScreen();
    case "dashboard": return adminDashboardScreen();
    default: return adminLoginScreen();
  }
}

/* ---------------- Login Screen ---------------- */
function adminLoginScreen() {
  return `
  <div class="screen">
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
          <div class="org-subtitle">SYSTEM ADMINISTRATION</div>
          <h1 class="auth-title">Admin Portal</h1>
          <p class="auth-desc">Sign in to access master portal control.</p>
        </div>
        <div class="field-group">
          <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Admin ID or Email" oninput="setDraft('adminLoginId', this.value)" value="${esc(getDraft("adminLoginId"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('adminLoginPass', this.value)" value="${esc(getDraft("adminLoginPass"))}"/></div>
          <button class="btn btn-primary" onclick="adminLoginSubmit()">Log In as Admin</button>
        </div>
        <div class="auth-footer">
          <p>Need an Admin Account?</p>
          <button class="btn btn-outline" onclick="state.adminScreen='register'; clearDrafts('adminRegister'); render();">Create Admin Account</button>
        </div>
      </div>
    </div>
  </div>`;
}

function adminLoginSubmit() {
  const query = getDraft("adminLoginId", "").trim().toLowerCase();
  const password = getDraft("adminLoginPass", "");
  const found =
    state.adminsList.find((a) => a.email && a.email.toLowerCase() === query) ||
    state.adminsList.find((a) => a.id && a.id.toLowerCase() === query);

  if (!found) {
    appAlert("No Admin Account", "No administrator account matches that Admin ID or email.");
    return;
  }
  if (found.password && found.password !== password) {
    appAlert("Invalid Password", "The password you entered is incorrect.");
    return;
  }

  state.activeAdminId = found.id;
  state.adminScreen = "dashboard";
  clearDrafts("adminLogin");
  render();
}

/* ---------------- Admin Registration ---------------- */
function adminRegisterScreen() {
  return `
  <div class="screen">
    <div class="auth-shell">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo" /></div>
          <div class="org-subtitle">SYSTEM ADMINISTRATION</div>
          <h1 class="auth-title">Create Admin Account</h1>
          <p class="auth-desc">Register a new administrator account for the BCC Admin Portal.</p>
        </div>
        <div class="field-group">
          <div class="field"><span class="icon">${ICON.user}</span><input placeholder="Full Name" oninput="setDraft('adminRegisterName', this.value)" value="${esc(getDraft("adminRegisterName"))}"/></div>
          <div class="field"><span class="icon">${ICON.mail}</span><input type="email" placeholder="Email Address" oninput="setDraft('adminRegisterEmail', this.value)" value="${esc(getDraft("adminRegisterEmail"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Password" oninput="setDraft('adminRegisterPass', this.value)" value="${esc(getDraft("adminRegisterPass"))}"/></div>
          <div class="field"><span class="icon">${ICON.lock}</span><input type="password" placeholder="Confirm Password" oninput="setDraft('adminRegisterConfirm', this.value)" value="${esc(getDraft("adminRegisterConfirm"))}"/></div>
          <button class="btn btn-primary" onclick="adminRegisterSubmit()">Create Account</button>
        </div>
        <div class="auth-footer">
          <button class="btn btn-ghost" onclick="clearDrafts('adminRegister'); state.adminScreen='login'; render();">${ICON.arrowleft} Back to Admin Login</button>
        </div>
      </div>
    </div>
  </div>`;
}

function adminRegisterSubmit() {
  const name = getDraft("adminRegisterName", "").trim();
  const email = getDraft("adminRegisterEmail", "").trim().toLowerCase();
  const password = getDraft("adminRegisterPass", "");
  const confirmPassword = getDraft("adminRegisterConfirm", "");

  if (!name || !email || !password || !confirmPassword) {
    appAlert("Required Fields", "Please complete all required fields.");
    return;
  }
  if (password.length < 6) {
    appAlert("Password Too Short", "Password must be at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    appAlert("Passwords Do Not Match", "Please make sure both password fields match.");
    return;
  }
  if (state.adminsList.some((a) => (a.email || "").toLowerCase() === email)) {
    appAlert("Email Already Registered", "An Admin account with this email already exists.");
    return;
  }

  const newAdmin = { id: autoGenerateId("ADM"), name, email, password };
  addAdminGlobal(newAdmin);
  clearDrafts("adminRegister");
  appAlert("Admin Account Created", `Welcome, ${name}! Your Admin ID is ${newAdmin.id}.`, () => {
    setDraft("adminLoginId", email);
    state.adminScreen = "login";
    render();
  });
}

/* ---------------- Navigation Config ---------------- */
const ADMIN_NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: "🏠" },
  { key: "students", label: "Students", icon: "👨‍🎓" },
  { key: "instructors", label: "Instructors", icon: "👨‍🏫" },
  { key: "registrars", label: "Registrar", icon: "📝" },
  { key: "admins", label: "Admins", icon: "👤" },
  { key: "sections", label: "Sections", icon: "🏫" },
  { key: "subjects", label: "Subjects", icon: "📚" },
  { key: "rooms", label: "Rooms", icon: "🏢" },
  { key: "courses", label: "Courses & Majors", icon: "🎓" },
  { key: "announcements", label: "Announcements", icon: "📢" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

/* ---------------- Main Layout ---------------- */
function adminDashboardScreen() {
  const admin = state.adminsList.find((a) => a.id === state.activeAdminId) || state.adminsList[0];
  const ui = state.ui.admin;
  const isProfileOpen = ui.isProfileMenuOpen || false;
  const collapsed = ui.sidebarCollapsed || false;
  const activeItem = ADMIN_NAV_ITEMS.find((n) => n.key === ui.activeTab) || ADMIN_NAV_ITEMS[0];

  return `
  <div class="admin-shell ${collapsed ? "sidebar-collapsed" : ""}">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-brand">
        <div class="admin-brand-logo"><img src="BCC_LOGO.jpg" alt="Baao Community College Logo"/></div>
        <div class="admin-brand-copy">
          <div class="admin-brand-title">BAAO COMMUNITY COLLEGE</div>
          <div class="admin-brand-subtitle">ADMINISTRATION PORTAL</div>
        </div>
        <button class="admin-sidebar-close" onclick="toggleAdminSidebar()" aria-label="Collapse sidebar">‹</button>
      </div>

      <div class="admin-sidebar-campus">
        <div class="admin-campus-image"><img src="BCC.jpg" alt="Baao Community College campus"/></div>
        <div class="admin-campus-overlay"></div>
        <div class="admin-campus-copy">
          <span>San Juan, Baao</span>
          <strong>Campus Administration</strong>
        </div>
      </div>

      <nav class="admin-nav">
        <div class="admin-nav-label">MAIN MENU</div>
        ${ADMIN_NAV_ITEMS.map((item) => {
          const isActive = ui.activeTab === item.key;
          return `
            <button class="admin-nav-item ${isActive ? "active" : ""}" onclick="switchAdminTab('${item.key}')" title="${esc(item.label)}">
              <span class="admin-nav-icon">${item.icon}</span>
              <span class="admin-nav-text">${esc(item.label)}</span>
              ${isActive ? '<span class="admin-nav-active-dot"></span>' : ""}
            </button>`;
        }).join("")}
      </nav>

      <div class="admin-sidebar-bottom">
        <button class="admin-logout-sidebar" onclick="state.adminScreen='login'; clearDrafts('adminLogin'); render();">
          <span>↪</span><span class="admin-nav-text">Logout</span>
        </button>
        <div class="admin-version">BCC Academic Portal · v2.6</div>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-topbar">
        <div class="admin-topbar-left">
          <button class="admin-menu-btn" onclick="toggleAdminSidebar()" aria-label="Toggle navigation">☰</button>
          <div>
            <div class="admin-topbar-kicker">BAAO COMMUNITY COLLEGE</div>
            <div class="admin-topbar-title">${esc(activeItem.label)}</div>
          </div>
        </div>

        <div class="admin-topbar-right">
          <button class="admin-notification-btn" onclick="appAlert('Notifications', 'No unread system alerts.')" aria-label="Notifications">
            🔔<span class="admin-notification-dot"></span>
          </button>

          <div class="admin-profile-wrap">
            <button class="admin-profile-btn" onclick="toggleAdminProfileMenu()">
              <span class="admin-avatar">${esc(admin?.name ? admin.name.charAt(0) : "A")}</span>
              <span class="admin-profile-copy">
                <strong>${esc(admin?.name || "Administrator")}</strong>
                <small>System Administrator</small>
              </span>
              <span class="admin-profile-chevron">⌄</span>
            </button>

            ${isProfileOpen ? `
              <div class="admin-profile-menu">
                <div class="admin-profile-menu-head">
                  <span class="admin-avatar large">${esc(admin?.name ? admin.name.charAt(0) : "A")}</span>
                  <div>
                    <strong>${esc(admin?.name || "Administrator")}</strong>
                    <small>${esc(admin?.email || "")}</small>
                  </div>
                </div>
                <button onclick="state.adminScreen='login'; render();">↪ &nbsp; Logout</button>
              </div>` : ""}
          </div>
        </div>
      </header>

      <main class="admin-content">
        <div class="admin-page-heading">
          <div>
            <div class="admin-breadcrumb">Administration <span>›</span> ${esc(activeItem.label)}</div>
            <h1>${esc(activeItem.label)}</h1>
            <p>${ui.activeTab === "overview"
              ? "A clear overview of enrollment, people, academic resources, and portal activity."
              : "Manage users, records, academic resources, and portal settings from the administrator console."}</p>
          </div>
        </div>

        ${adminTabContent(ui.activeTab)}
      </main>
    </div>

    ${adminModals()}
  </div>`;
}

function toggleAdminProfileMenu() {
  state.ui.admin.isProfileMenuOpen = !state.ui.admin.isProfileMenuOpen;
  render();
}

function switchAdminTab(tab) {
  state.ui.admin.activeTab = tab;
  state.ui.admin.search = "";
  state.ui.admin.isProfileMenuOpen = false;
  render();
}

function toggleAdminSidebar() {
  state.ui.admin.sidebarCollapsed = !state.ui.admin.sidebarCollapsed;
  render();
}

function adminTabContent(tab) {
  switch (tab) {
    case "overview": return adminOverviewTab();
    case "students": return adminStudentsTab();
    case "instructors": return adminInstructorsTab();
    case "registrars": return adminRegistrarsTab();
    case "admins": return adminAdminsTab();
    case "sections": return adminSectionsTab();
    case "subjects": return adminSubjectsTab();
    case "rooms": return adminRoomsTab();
    case "courses": return adminCoursesTab();
    case "announcements": return adminAnnouncementsTab();
    case "settings": return adminSettingsTab();
    default: return adminOverviewTab();
  }
}

/* ---------------- Modals Router ---------------- */
function adminModals() {
  const ui = state.ui.admin;
  const editingStudent = ui.editStudentId ? state.students.find((s) => s.id === ui.editStudentId) : null;
  const editingInstructor = ui.editInstructorId ? state.instructorsList.find((i) => i.id === ui.editInstructorId) : null;
  const editingRegistrar = ui.editRegistrarId ? state.registrarsList.find((r) => r.id === ui.editRegistrarId) : null;
  const editingAdmin = ui.editAdminId ? state.adminsList.find((a) => a.id === ui.editAdminId) : null;
  const editingSection = ui.editSectionId ? state.sectionsList.find((s) => s.id === ui.editSectionId) : null;
  const editingSubject = ui.editSubjectId ? state.availableSubjects.find((s) => s.id === ui.editSubjectId) : null;
  const editingGradeStudent = ui.gradeStudentId ? state.students.find((s) => s.id === ui.gradeStudentId) : null;

  return `
    ${editingStudent ? adminEditStudentModal(editingStudent) : ""}
    ${editingGradeStudent ? adminEditGradesModal(editingGradeStudent) : ""}
    ${ui.isAddInstructorModalOpen || editingInstructor ? adminInstructorModal(editingInstructor) : ""}
    ${ui.isAddRegistrarModalOpen || editingRegistrar ? adminRegistrarModal(editingRegistrar) : ""}
    ${ui.isAddAdminModalOpen || editingAdmin ? adminAdminModal(editingAdmin) : ""}
    ${ui.isAddSectionModalOpen || editingSection ? adminSectionModal(editingSection) : ""}
    ${ui.isAddSubjModalOpen || editingSubject ? adminSubjectModal(editingSubject) : ""}
    ${ui.isAddRoomModalOpen ? adminRoomModal() : ""}
    ${ui.isAddCourseModalOpen ? adminCourseModal() : ""}
    ${ui.isAddMajorModalOpen ? adminMajorModal() : ""}
    ${ui.isAnnouncementModalOpen ? adminAnnouncementModal() : ""}
  `;
}

function closeAllAdminModals() {
  const ui = state.ui.admin;
  ui.editStudentId = null; ui.editInstructorId = null; ui.editRegistrarId = null; ui.editAdminId = null;
  ui.editSectionId = null; ui.editSubjectId = null; ui.gradeStudentId = null; ui.docStudentId = null; ui.docIndex = null;
  ui.isAddInstructorModalOpen = false; ui.isAddRegistrarModalOpen = false; ui.isAddAdminModalOpen = false;
  ui.isAddSectionModalOpen = false; ui.isAddSubjModalOpen = false; ui.isAddRoomModalOpen = false;
  ui.isAddCourseModalOpen = false; ui.isAddMajorModalOpen = false; ui.isAnnouncementModalOpen = false;
  render();
}

/* ---------------- 3 & 4 & 5. Overview & Dashboard ---------------- */
function adminOverviewTab() {
  const totalCapacity = state.sectionsList.reduce((sum, s) => sum + (s.maxCapacity || 0), 0);
  const enrolledStudents = state.students.filter(s => s.status === "Enrolled").length;
  const pendingStudents = state.students.filter(s => s.status === "Pending").length;
  const totalDocs = state.students.reduce((acc, s) => acc + (s.docs ? s.docs.length : 0), 0);
  const verifiedDocs = state.students.reduce((acc, s) => acc + (s.docs ? s.docs.filter(d => d.status === "Verified").length : 0), 0);
  const studentPct = state.students.length ? Math.round((enrolledStudents / state.students.length) * 100) : 0;
  const sectionPct = totalCapacity ? Math.min(100, Math.round((enrolledStudents / totalCapacity) * 100)) : 0;
  const docPct = totalDocs ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  const activity = [
    { icon: "👨‍🎓", title: `${state.students.length} student record${state.students.length === 1 ? "" : "s"} in system`, meta: "Student management" },
    { icon: "👨‍🏫", title: `${state.instructorsList.length} instructor account${state.instructorsList.length === 1 ? "" : "s"}`, meta: "Faculty management" },
    { icon: "📚", title: `${state.availableSubjects.length} subjects available`, meta: "Academic catalog" },
    { icon: "🏫", title: `${state.sectionsList.length} sections configured`, meta: "Section management" }
  ];

  return `
    <section class="admin-welcome-card">
      <div class="admin-welcome-image"><img src="BCC.jpg" alt="Baao Community College campus"/></div>
      <div class="admin-welcome-overlay"></div>
      <div class="admin-welcome-content">
        <div class="admin-welcome-badge">🎓 BCC ADMINISTRATION</div>
        <h2>Good day, ${esc((state.adminsList.find(a => a.id === state.activeAdminId) || state.adminsList[0])?.name || "Administrator")} 👋</h2>
        <p>Manage the Baao Community College unified enrollment system from one central dashboard.</p>
        <div class="admin-welcome-actions">
          <button onclick="switchAdminTab('students')">👨‍🎓 Student Records</button>
          <button onclick="switchAdminTab('announcements')">📢 Announcements</button>
        </div>
      </div>
      <div class="admin-welcome-logo"><img src="BCC_LOGO.jpg" alt="BCC Logo"/></div>
    </section>

    <section class="admin-stat-grid-modern">
      ${adminStatCard("👨‍🎓", state.students.length, "Total Students", `${enrolledStudents} enrolled · ${pendingStudents} pending`, "blue")}
      ${adminStatCard("👨‍🏫", state.instructorsList.length, "Instructors", "Faculty members", "purple")}
      ${adminStatCard("📝", state.registrarsList.length, "Registrars", "Registrar accounts", "orange")}
      ${adminStatCard("👤", state.adminsList.length, "Administrators", "System accounts", "green")}
      ${adminStatCard("🏫", state.sectionsList.length, "Sections", `${totalCapacity} total seats`, "teal")}
      ${adminStatCard("📚", state.availableSubjects.length, "Subjects", "Active course catalog", "indigo")}
      ${adminStatCard("📄", `${verifiedDocs}/${totalDocs}`, "Documents", "Verified submissions", "amber")}
      ${adminStatCard("🎓", state.courseOptions.length, "Programs", "Course programs", "rose")}
    </section>

    <section class="admin-dashboard-grid">
      <div class="admin-panel admin-analytics-panel">
        <div class="admin-panel-heading">
          <div>
            <span class="admin-panel-eyebrow">SYSTEM OVERVIEW</span>
            <h3>Enrollment & Resource Health</h3>
          </div>
          <span class="admin-panel-icon">📊</span>
        </div>
        <div class="admin-progress-list">
          ${adminProgressBar("Enrolled students", studentPct, `${enrolledStudents} of ${state.students.length} student records`, "blue")}
          ${adminProgressBar("Section capacity", sectionPct, `${enrolledStudents} of ${totalCapacity} available seats`, "orange")}
          ${adminProgressBar("Verified documents", docPct, `${verifiedDocs} of ${totalDocs} submitted documents`, "green")}
        </div>
        <div class="admin-mini-stats">
          <div><strong>${state.sectionsList.length}</strong><span>Sections</span></div>
          <div><strong>${state.availableSubjects.length}</strong><span>Subjects</span></div>
          <div><strong>${state.courseOptions.length}</strong><span>Programs</span></div>
          <div><strong>${state.roomOptions.length}</strong><span>Rooms</span></div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel-heading">
          <div>
            <span class="admin-panel-eyebrow">SHORTCUTS</span>
            <h3>Quick Management</h3>
          </div>
          <span class="admin-panel-icon">⚡</span>
        </div>
        <div class="admin-quick-actions">
          <button onclick="switchAdminTab('students')"><span>👨‍🎓</span><div><strong>Students</strong><small>Profiles & records</small></div><b>›</b></button>
          <button onclick="switchAdminTab('instructors')"><span>👨‍🏫</span><div><strong>Instructors</strong><small>Faculty accounts</small></div><b>›</b></button>
          <button onclick="switchAdminTab('sections')"><span>🏫</span><div><strong>Sections</strong><small>Capacity & classes</small></div><b>›</b></button>
          <button onclick="switchAdminTab('subjects')"><span>📚</span><div><strong>Subjects</strong><small>Course catalog</small></div><b>›</b></button>
        </div>
      </div>
    </section>

    <section class="admin-section-block">
      <div class="admin-section-heading-modern">
        <div>
          <span class="admin-panel-eyebrow">PORTAL CONTROL</span>
          <h3>Master Portal Controllers</h3>
          <p>Direct access to the three connected campus portals.</p>
        </div>
      </div>
      <div class="admin-portal-grid">
        <div class="admin-portal-card student">
          <div class="admin-portal-icon">👨‍🎓</div>
          <div class="admin-portal-copy"><h4>Student Portal</h4><p>Profiles, enrollment status, schedules, attendance, documents, and grades.</p></div>
          <button onclick="switchAdminTab('students')">Manage Students <span>→</span></button>
        </div>
        <div class="admin-portal-card registrar">
          <div class="admin-portal-icon">📝</div>
          <div class="admin-portal-copy"><h4>Registrar Portal</h4><p>Requirements, sections, subjects, rooms, programs, and announcements.</p></div>
          <button onclick="switchAdminTab('registrars')">Manage Registrar <span>→</span></button>
        </div>
        <div class="admin-portal-card instructor">
          <div class="admin-portal-icon">👨‍🏫</div>
          <div class="admin-portal-copy"><h4>Instructor Portal</h4><p>Instructor accounts, subject loads, attendance, and grading records.</p></div>
          <button onclick="switchAdminTab('instructors')">Manage Instructors <span>→</span></button>
        </div>
      </div>
    </section>

    <section class="admin-panel admin-activity-panel">
      <div class="admin-panel-heading">
        <div>
          <span class="admin-panel-eyebrow">SYSTEM SNAPSHOT</span>
          <h3>Current Activity</h3>
        </div>
        <span class="admin-panel-link">${Api.online ? " " : " "}</span>
      </div>
      <div class="admin-activity-list">
        ${activity.map(item => `
          <div class="admin-activity-item">
            <span class="admin-activity-icon">${item.icon}</span>
            <div><strong>${esc(item.title)}</strong><small>${esc(item.meta)}</small></div>
            <span class="admin-activity-arrow">›</span>
          </div>`).join("")}
      </div>
    </section>
  `;
}

function adminStatCard(icon, val, label, sub, tone = "blue") {
  return `
    <div class="admin-stat-card-modern ${tone}">
      <div class="admin-stat-top">
        <span class="admin-stat-icon">${icon}</span>
        <span class="admin-stat-more">•••</span>
      </div>
      <strong class="admin-stat-value">${val}</strong>
      <div class="admin-stat-label-modern">${esc(label)}</div>
      <div class="admin-stat-sub">${esc(sub)}</div>
    </div>`;
}

function adminProgressBar(label, pct, detail, tone = "blue") {
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
  return `
    <div class="admin-progress-item">
      <div class="admin-progress-head"><strong>${esc(label)}</strong><span>${safePct}%</span></div>
      <div class="admin-progress-track"><div class="admin-progress-fill ${tone}" style="width:${safePct}%"></div></div>
      <small>${esc(detail)}</small>
    </div>`;
}

/* ---------------- Student Portal Management Tab ---------------- */
function adminStudentsTab() {
  const q = (state.ui.admin.search || "").toLowerCase();
  const rows = state.students.filter((s) => !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q));

  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px;">
        <div class="field" style="flex:1; max-width:400px; margin:0;"><span class="icon">${ICON.search}</span><input placeholder="Search students by name, ID, or email" value="${esc(state.ui.admin.search)}" oninput="state.ui.admin.search=this.value; render();"/></div>
        <div style="font-size:13px; color:#64748B; font-weight:600;">Total Records: ${rows.length}</div>
      </div>

      <div class="card-box" style="border:none; padding:0;">
        ${rows.length ? rows.map((s) => {
          const assignedSubjCount = s.subjects ? s.subjects.length : 0;
          const verifiedDocs = s.docs ? s.docs.filter(d => d.status === "Verified").length : 0;
          const totalDocs = s.docs ? s.docs.length : 0;
          return `
          <div class="admin-list-row" style="flex-wrap:wrap; gap:12px; padding:14px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:10px; background:#FFF;">
            <div class="admin-list-info" style="min-width:280px; flex:1;">
              <div class="admin-list-name" style="font-weight:700; color:#0F2942;">${esc(s.name)} <span style="font-size:12px; color:#64748B; font-weight:400;">(${esc(s.id)})</span></div>
              <div class="admin-list-sub" style="font-size:12px; color:#64748B; margin-top:4px;">
                ${esc(s.program || "No Program")} &middot; ${esc(s.yearLevel || "")} &middot; Section: <b>${esc(s.section || "Unassigned")}</b> &middot; Status: <b style="color:${s.status === 'Enrolled' ? '#166534' : '#F59E0B'}">${esc(s.status)}</b>
              </div>
              <div class="admin-list-sub" style="font-size:11.5px; color:#64748B; margin-top:2px;">
                Subjects Enrolled: <b>${assignedSubjCount}</b> &middot; Documents Verified: <b>${verifiedDocs}/${totalDocs}</b>
              </div>
            </div>
            <div class="admin-list-actions" style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-outline btn-sm" onclick="state.ui.admin.editStudentId=${jsAttr(s.id)}; render();">${ICON.edit} Details</button>
              <button class="btn btn-outline btn-sm" onclick="state.ui.admin.gradeStudentId=${jsAttr(s.id)}; render();">${ICON.filetext} Grades</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteStudent(${jsAttr(s.id)})">${ICON.trash}</button>
            </div>
            
            <div style="width:100%; border-top:1px dashed #E2E8F0; padding-top:10px; margin-top:4px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:700; color:#64748B;">REQUIREMENT DOCUMENTS:</span>
              ${(s.docs || []).map((doc, idx) => `
                <div class="chip ${doc.status === 'Verified' ? 'active' : ''}" style="font-size:10.5px; padding:3px 8px; cursor:pointer;" onclick="adminToggleDocVerification(${jsAttr(s.id)}, ${idx})">
                  ${esc(doc.name)}: <b>${doc.status}</b>
                </div>
                ${doc.fileUri && doc.fileType === 'image' ? `<img src="${doc.fileUri}" alt="${esc(doc.fileName || doc.name)}" title="${esc(doc.fileName || doc.name)}" style="width:42px;height:42px;object-fit:cover;border-radius:6px;border:1px solid #CBD5E1;"/>` : ''}
              `).join("")}
            </div>
          </div>`;
        }).join("") : `<div class="muted-note" style="text-align:center; padding:20px; color:#64748B;">No students match your search query.</div>`}
      </div>
    </div>`;
}

function adminToggleDocVerification(studentId, docIndex) {
  const s = state.students.find((st) => st.id === studentId);
  if (!s || !s.docs || !s.docs[docIndex]) return;
  const currentStatus = s.docs[docIndex].status;
  const nextStatus = currentStatus === "Verified" ? "Rejected" : currentStatus === "Rejected" ? "Pending" : "Verified";
  const updatedDocs = [...s.docs];
  updatedDocs[docIndex] = { ...updatedDocs[docIndex], status: nextStatus };
  updateStudent({ ...s, docs: updatedDocs });
  render();
}

function adminDeleteStudent(id) {
  const s = state.students.find((st) => st.id === id);
  appConfirm("Delete Student Record", `Permanently remove ${s ? s.name : "this student"} (${id})? This will clear all course and grading entries.`, () => {
    deleteStudentGlobal(id);
    render();
  });
}

function adminEditStudentModal(student) {
  const selectedSubjects = getDraft("adminStuSubjects", (student.subjects || []).map(s => s.id));

  return `
  <div class="modal-overlay center"><div class="modal-card" style="max-width:560px; background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">Edit Student Record — ${esc(student.id)}</h3>
    
    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:4px;">PROFILE DETAILS</div>
    <input class="modal-input" placeholder="Full Name" value="${esc(getDraft("adminStuName", student.name))}" oninput="setDraft('adminStuName', this.value)"/>
    <input class="modal-input" placeholder="Email" value="${esc(getDraft("adminStuEmail", student.email))}" oninput="setDraft('adminStuEmail', this.value)"/>
    <input class="modal-input" placeholder="Mobile Number" value="${esc(getDraft("adminStuMobile", student.mobile))}" oninput="setDraft('adminStuMobile', this.value)"/>

    <div style="font-size:11px; font-weight:700; color:#64748B; margin:10px 0 4px;">COURSE PROGRAM</div>
    <div class="chip-row" style="margin-bottom:10px;">
      ${state.courseOptions.map((c) => `<div class="chip ${getDraft("adminStuProgram", student.program) === c ? "active" : ""}" onclick="setDraft('adminStuProgram', ${jsAttr(c)}); render();">${esc(c)}</div>`).join("")}
    </div>

    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:4px;">SECTION ASSIGNMENT</div>
    <div class="chip-row" style="margin-bottom:10px;">
      ${state.sectionsList.map((sec) => `<div class="chip ${getDraft("adminStuSection", student.section) === sec.name ? "active" : ""}" onclick="setDraft('adminStuSection', ${jsAttr(sec.name)}); render();">${esc(sec.name)}</div>`).join("")}
    </div>

    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:4px;">ENROLLMENT STATUS</div>
    <div class="chip-row" style="margin-bottom:10px;">
      ${["Pending", "Enrolled", "Rejected"].map((st) => `<div class="chip ${getDraft("adminStuStatus", student.status) === st ? "active" : ""}" onclick="setDraft('adminStuStatus', ${jsAttr(st)}); render();">${esc(st)}</div>`).join("")}
    </div>

    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:4px;">ASSIGNED SUBJECTS</div>
    <div style="max-height:120px; overflow-y:auto; border:1px solid #E2E8F0; padding:8px; border-radius:6px; margin-bottom:16px;">
      ${state.availableSubjects.map((sub) => {
        const isChecked = selectedSubjects.includes(sub.id);
        return `
          <div style="display:flex; align-items:center; gap:8px; font-size:12px; margin-bottom:6px;">
            <input type="checkbox" ${isChecked ? "checked" : ""} onchange="adminToggleSubjectForStudent(${jsAttr(sub.id)})"/>
            <span><b>${esc(sub.code)}</b> - ${esc(sub.title)} (${sub.units} units)</span>
          </div>`;
      }).join("")}
    </div>

    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminEditStudent()">Save Student Profile</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminStu'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function adminToggleSubjectForStudent(subjId) {
  const current = getDraft("adminStuSubjects", []);
  let updated = current.includes(subjId) ? current.filter(id => id !== subjId) : [...current, subjId];
  setDraft("adminStuSubjects", updated);
  render();
}

function submitAdminEditStudent() {
  const ui = state.ui.admin;
  const student = state.students.find((s) => s.id === ui.editStudentId);
  if (!student) return;

  const chosenSubjIds = getDraft("adminStuSubjects", (student.subjects || []).map(s => s.id));
  const newSubjectsList = state.availableSubjects
    .filter(s => chosenSubjIds.includes(s.id))
    .map(s => {
      const existingSubj = (student.subjects || []).find(es => es.id === s.id);
      return existingSubj || {
        ...s,
        instructor: state.instructorsList[0]?.name || "Unassigned",
        schedule: "MWF 9:00 AM - 10:00 AM",
        roomLab: state.roomOptions[0] || "Room 101"
      };
    });

  const updated = {
    ...student,
    name: getDraft("adminStuName", student.name).trim() || student.name,
    email: getDraft("adminStuEmail", student.email).trim(),
    mobile: getDraft("adminStuMobile", student.mobile).trim(),
    program: getDraft("adminStuProgram", student.program),
    section: getDraft("adminStuSection", student.section),
    status: getDraft("adminStuStatus", student.status),
    subjects: newSubjectsList
  };

  updateStudent(updated);
  clearDrafts("adminStu");
  ui.editStudentId = null;
  appAlert("Student Record Saved", `${updated.name}'s master record has been updated.`, () => render());
}

/* ---------------- Grade & Attendance Editing ---------------- */
function adminEditGradesModal(student) {
  const subjects = student.subjects || [];

  return `
  <div class="modal-overlay center"><div class="modal-card" style="max-width:550px; background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:4px; color:#0F2942;">Instructor Override — Grades</h3>
    <p style="font-size:12px; color:#64748B; margin-bottom:14px;">Updating record for: <b>${esc(student.name)} (${esc(student.id)})</b></p>

    ${subjects.length ? subjects.map((sub) => {
      const g = getSubjectGrade(student, sub.id);
      return `
      <div style="border:1px solid #E2E8F0; padding:12px; border-radius:8px; margin-bottom:10px; background:#F8FAFC;">
        <div style="font-weight:700; font-size:13px; color:#0F2942; margin-bottom:8px;">${esc(sub.code)} - ${esc(sub.title)}</div>
        <div style="display:flex; gap:10px;">
          <div style="flex:1;">
            <label style="font-size:10px; font-weight:700; color:#64748B;">MIDTERM GRADE</label>
            <input class="modal-input" type="number" step="0.1" value="${g.midterm != null ? g.midterm : ""}" oninput="setDraft('adminG_${student.id}_${sub.id}_m', this.value)"/>
          </div>
          <div style="flex:1;">
            <label style="font-size:10px; font-weight:700; color:#64748B;">FINAL GRADE</label>
            <input class="modal-input" type="number" step="0.1" value="${g.final != null ? g.final : ""}" oninput="setDraft('adminG_${student.id}_${sub.id}_f', this.value)"/>
          </div>
        </div>
      </div>`;
    }).join("") : `<div style="text-align:center; padding:16px; color:#64748B;">Student is not enrolled in any subjects.</div>`}

    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminGrades(${jsAttr(student.id)})">Save Grades</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="closeAllAdminModals()">Cancel</button>
  </div></div>`;
}

function submitAdminGrades(studentId) {
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const updatedGrades = { ...(student.grades || {}) };
  (student.subjects || []).forEach((sub) => {
    const m = parseFloat(getDraft(`adminG_${student.id}_${sub.id}_m`));
    const f = parseFloat(getDraft(`adminG_${student.id}_${sub.id}_f`));
    updatedGrades[sub.id] = {
      midterm: !isNaN(m) ? m : updatedGrades[sub.id]?.midterm || null,
      final: !isNaN(f) ? f : updatedGrades[sub.id]?.final || null,
    };
  });

  updateStudent({ ...student, grades: updatedGrades });
  closeAllAdminModals();
  appAlert("Grades Updated", "Instructor portal grades saved successfully.", () => render());
}

/* ---------------- Instructors Tab ---------------- */
function adminInstructorsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Instructors (${state.instructorsList.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddInstructorModalOpen=true; render();">+ Add Instructor</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.instructorsList.map((i) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div class="admin-list-info">
              <div style="font-weight:700; color:#0F2942;">${esc(i.name)}</div>
              <div style="font-size:12px; color:#64748B;">${esc(i.id)} &middot; ${esc(i.email)} &middot; Subjects: ${esc((i.subjects || []).join(", ") || "None assigned")}</div>
            </div>
            <div class="admin-list-actions" style="display:flex; gap:8px;">
              <button class="icon-btn-edit" onclick="state.ui.admin.editInstructorId=${jsAttr(i.id)}; render();">${ICON.edit} Edit</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteInstructor(${jsAttr(i.id)})">${ICON.trash}</button>
            </div>
          </div>`).join("") || `<div style="color:#64748B; text-align:center; padding:20px;">No instructors registered yet.</div>`}
      </div>
    </div>`;
}

function adminDeleteInstructor(id) {
  const i = state.instructorsList.find((x) => x.id === id);
  appConfirm("Delete Instructor", `Remove ${i ? i.name : "this instructor"} (${id})?`, () => { deleteInstructorGlobal(id); render(); });
}

function adminInstructorModal(instructor) {
  const isEdit = Boolean(instructor);
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">${isEdit ? `Edit Instructor — ${esc(instructor.id)}` : "Add New Instructor"}</h3>
    <input class="modal-input" placeholder="Full Name" value="${esc(getDraft("adminInsName", instructor?.name || ""))}" oninput="setDraft('adminInsName', this.value)"/>
    <input class="modal-input" placeholder="Email" value="${esc(getDraft("adminInsEmail", instructor?.email || ""))}" oninput="setDraft('adminInsEmail', this.value)"/>
    <input class="modal-input" placeholder="Subject Codes (comma-separated)" value="${esc(getDraft("adminInsSubjects", (instructor?.subjects || []).join(", ")))}" oninput="setDraft('adminInsSubjects', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminInstructor(${isEdit ? jsAttr(instructor.id) : "null"})">${isEdit ? "Save Changes" : "Create Instructor"}</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminIns'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminInstructor(existingId) {
  const existing = existingId ? state.instructorsList.find((i) => i.id === existingId) : null;
  const name = getDraft("adminInsName", existing?.name || "").trim();
  const email = getDraft("adminInsEmail", existing?.email || "").trim();
  if (!name || !email) { appAlert("Missing Fields", "Please provide name and email."); return; }
  const subjects = getDraft("adminInsSubjects", (existing?.subjects || []).join(", ")).split(",").map((s) => s.trim()).filter(Boolean);
  if (existing) {
    updateInstructor({ ...existing, name, email, subjects });
  } else {
    addInstructorGlobal({ id: autoGenerateId("INS"), name, email, subjects, notifications: [] });
  }
  clearDrafts("adminIns");
  closeAllAdminModals();
}

/* ---------------- Registrars Tab ---------------- */
function adminRegistrarsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Registrar Staff Accounts (${state.registrarsList.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddRegistrarModalOpen=true; render();">+ Add Registrar Staff</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.registrarsList.map((r) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div class="admin-list-info">
              <div style="font-weight:700; color:#0F2942;">${esc(r.name)}</div>
              <div style="font-size:12px; color:#64748B;">${esc(r.id)} &middot; ${esc(r.email)} &middot; ${esc(r.department || "Registrar Office")}</div>
            </div>
            <div class="admin-list-actions" style="display:flex; gap:8px;">
              <button class="icon-btn-edit" onclick="state.ui.admin.editRegistrarId=${jsAttr(r.id)}; render();">${ICON.edit} Edit</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteRegistrar(${jsAttr(r.id)})">${ICON.trash}</button>
            </div>
          </div>`).join("") || `<div style="color:#64748B; text-align:center; padding:20px;">No registrar accounts found.</div>`}
      </div>
    </div>`;
}

function adminDeleteRegistrar(id) {
  if (state.registrarsList.length <= 1) { appAlert("Cannot Delete", "At least one Registrar account must remain."); return; }
  const r = state.registrarsList.find((x) => x.id === id);
  appConfirm("Delete Registrar", `Remove ${r ? r.name : "this registrar"} (${id})?`, () => { deleteRegistrarGlobal(id); render(); });
}

function adminRegistrarModal(registrar) {
  const isEdit = Boolean(registrar);
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">${isEdit ? `Edit Registrar — ${esc(registrar.id)}` : "Add New Registrar Staff"}</h3>
    <input class="modal-input" placeholder="Full Name" value="${esc(getDraft("adminRegName", registrar?.name || ""))}" oninput="setDraft('adminRegName', this.value)"/>
    <input class="modal-input" placeholder="Work Email" value="${esc(getDraft("adminRegEmail", registrar?.email || ""))}" oninput="setDraft('adminRegEmail', this.value)"/>
    <input class="modal-input" placeholder="Office / Department" value="${esc(getDraft("adminRegDept", registrar?.department || ""))}" oninput="setDraft('adminRegDept', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminRegistrar(${isEdit ? jsAttr(registrar.id) : "null"})">${isEdit ? "Save Changes" : "Create Account"}</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminReg'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminRegistrar(existingId) {
  const existing = existingId ? state.registrarsList.find((r) => r.id === existingId) : null;
  const name = getDraft("adminRegName", existing?.name || "").trim();
  const email = getDraft("adminRegEmail", existing?.email || "").trim();
  if (!name || !email) { appAlert("Missing Fields", "Please provide name and email."); return; }
  const department = getDraft("adminRegDept", existing?.department || "").trim() || "Office of the Registrar";
  if (existing) {
    updateRegistrarGlobal({ ...existing, name, email, department });
  } else {
    addRegistrarGlobal({ id: autoGenerateId("REG"), name, email, department });
  }
  clearDrafts("adminReg");
  closeAllAdminModals();
}

/* ---------------- Admin Accounts Tab ---------------- */
function adminAdminsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">System Administrators (${state.adminsList.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddAdminModalOpen=true; render();">+ Add Admin</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.adminsList.map((a) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div class="admin-list-info">
              <div style="font-weight:700; color:#0F2942;">${esc(a.name)}</div>
              <div style="font-size:12px; color:#64748B;">${esc(a.id)} &middot; ${esc(a.email)}</div>
            </div>
            <div class="admin-list-actions" style="display:flex; gap:8px;">
              <button class="icon-btn-edit" onclick="state.ui.admin.editAdminId=${jsAttr(a.id)}; render();">${ICON.edit} Edit</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteAdmin(${jsAttr(a.id)})">${ICON.trash}</button>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

function adminDeleteAdmin(id) {
  if (state.adminsList.length <= 1) { appAlert("Cannot Delete", "At least one Admin account must remain."); return; }
  appConfirm("Delete Admin Account", `Remove this administrator account (${id})?`, () => {
    deleteAdminGlobal(id);
    if (state.activeAdminId === id) { state.activeAdminId = state.adminsList[0]?.id || null; state.adminScreen = "login"; }
    render();
  });
}

function adminAdminModal(admin) {
  const isEdit = Boolean(admin);
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">${isEdit ? `Edit Admin — ${esc(admin.id)}` : "Add New Admin"}</h3>
    <input class="modal-input" placeholder="Full Name" value="${esc(getDraft("adminAdmName", admin?.name || ""))}" oninput="setDraft('adminAdmName', this.value)"/>
    <input class="modal-input" placeholder="Email" value="${esc(getDraft("adminAdmEmail", admin?.email || ""))}" oninput="setDraft('adminAdmEmail', this.value)"/>
    <input class="modal-input" type="password" placeholder="Password ${isEdit ? "(leave blank to keep current)" : ""}" value="${esc(getDraft("adminAdmPass", ""))}" oninput="setDraft('adminAdmPass', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminAdmin(${isEdit ? jsAttr(admin.id) : "null"})">${isEdit ? "Save Changes" : "Create Admin"}</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminAdm'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminAdmin(existingId) {
  const existing = existingId ? state.adminsList.find((a) => a.id === existingId) : null;
  const name = getDraft("adminAdmName", existing?.name || "").trim();
  const email = getDraft("adminAdmEmail", existing?.email || "").trim();
  if (!name || !email) { appAlert("Missing Fields", "Please provide name and email."); return; }
  const password = getDraft("adminAdmPass", "").trim();
  if (existing) {
    updateAdminGlobal({ ...existing, name, email, password: password || existing.password });
  } else {
    if (!password) { appAlert("Missing Password", "Please set a password."); return; }
    addAdminGlobal({ id: autoGenerateId("ADM"), name, email, password });
  }
  clearDrafts("adminAdm");
  closeAllAdminModals();
}

/* ---------------- Sections Tab ---------------- */
function adminSectionsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Sections (${state.sectionsList.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddSectionModalOpen=true; render();">+ Add Section</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.sectionsList.map((sec) => {
          const count = state.students.filter((st) => st.section === sec.name).length;
          return `
            <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
              <div class="admin-list-info">
                <div style="font-weight:700; color:#0F2942;">${esc(sec.name)}</div>
                <div style="font-size:12px; color:#64748B;">${sec.id} &middot; ${count} / ${sec.maxCapacity} students enrolled</div>
              </div>
              <div class="admin-list-actions" style="display:flex; gap:8px;">
                <button class="icon-btn-edit" onclick="state.ui.admin.editSectionId=${jsAttr(sec.id)}; render();">${ICON.edit} Edit</button>
                <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteSection(${jsAttr(sec.id)})">${ICON.trash}</button>
              </div>
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

function adminDeleteSection(id) {
  appConfirm("Delete Section", "Remove this section?", () => { deleteSectionGlobal(id); render(); });
}

function adminSectionModal(section) {
  const isEdit = Boolean(section);
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">${isEdit ? `Edit Section — ${esc(section.id)}` : "Add New Section"}</h3>
    <input class="modal-input" placeholder="Section Name (e.g. BSIT 1-A)" value="${esc(getDraft("adminSecName", section?.name || ""))}" oninput="setDraft('adminSecName', this.value)"/>
    <input class="modal-input" type="number" placeholder="Max Capacity" value="${esc(getDraft("adminSecCap", section?.maxCapacity || 30))}" oninput="setDraft('adminSecCap', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminSection(${isEdit ? jsAttr(section.id) : "null"})">${isEdit ? "Save Changes" : "Create Section"}</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminSec'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminSection(existingId) {
  const existing = existingId ? state.sectionsList.find((s) => s.id === existingId) : null;
  const name = getDraft("adminSecName", existing?.name || "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a section name."); return; }
  const cap = parseInt(getDraft("adminSecCap", existing?.maxCapacity || "30")) || 30;
  if (existing) {
    updateSectionGlobal({ ...existing, name, maxCapacity: cap });
  } else {
    addSectionGlobal({ id: "SEC-" + Date.now().toString().slice(-4), name, maxCapacity: cap });
  }
  clearDrafts("adminSec");
  closeAllAdminModals();
}

/* ---------------- Subjects Catalog Tab ---------------- */
function adminSubjectsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Master Subjects Catalog (${state.availableSubjects.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddSubjModalOpen=true; render();">+ Add Subject</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.availableSubjects.map((subj) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div class="admin-list-info">
              <div style="font-weight:700; color:#0F2942;">${esc(subj.code)} &mdash; ${esc(subj.title)}</div>
              <div style="font-size:12px; color:#64748B;">${esc(subj.id)} &middot; ${subj.units} units</div>
            </div>
            <div class="admin-list-actions" style="display:flex; gap:8px;">
              <button class="icon-btn-edit" onclick="state.ui.admin.editSubjectId=${jsAttr(subj.id)}; render();">${ICON.edit} Edit</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteSubject(${jsAttr(subj.id)})">${ICON.trash}</button>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

function adminDeleteSubject(id) {
  appConfirm("Delete Subject", "Remove this subject from the catalog?", () => { deleteSubjectGlobal(id); render(); });
}

function adminSubjectModal(subject) {
  const isEdit = Boolean(subject);
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">${isEdit ? `Edit Subject — ${esc(subject.id)}` : "Add New Subject"}</h3>
    <input class="modal-input" placeholder="Subject Code (e.g. CC 106)" value="${esc(getDraft("adminSubjCode", subject?.code || ""))}" oninput="setDraft('adminSubjCode', this.value)"/>
    <input class="modal-input" placeholder="Subject Title" value="${esc(getDraft("adminSubjTitle", subject?.title || ""))}" oninput="setDraft('adminSubjTitle', this.value)"/>
    <input class="modal-input" type="number" placeholder="Units" value="${esc(getDraft("adminSubjUnits", subject?.units || 3))}" oninput="setDraft('adminSubjUnits', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminSubject(${isEdit ? jsAttr(subject.id) : "null"})">${isEdit ? "Save Changes" : "Create Subject"}</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminSubj'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminSubject(existingId) {
  const existing = existingId ? state.availableSubjects.find((s) => s.id === existingId) : null;
  const code = getDraft("adminSubjCode", existing?.code || "").trim();
  const title = getDraft("adminSubjTitle", existing?.title || "").trim();
  if (!code || !title) { appAlert("Missing Input", "Please provide Subject Code and Title."); return; }
  const units = parseInt(getDraft("adminSubjUnits", existing?.units || "3")) || 3;
  if (existing) {
    updateSubjectGlobal({ ...existing, code, title, units });
  } else {
    addSubjectGlobal({ id: "SUBJ-" + Date.now().toString().slice(-4), code, title, units });
  }
  clearDrafts("adminSubj");
  closeAllAdminModals();
}

/* ---------------- Rooms Tab ---------------- */
function adminRoomsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Rooms &amp; Laboratories (${state.roomOptions.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddRoomModalOpen=true; render();">+ Add Room</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.roomOptions.map((room) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div style="font-weight:700; color:#0F2942;">${esc(room)}</div>
            <div class="admin-list-actions" style="display:flex; gap:8px;">
              <button class="icon-btn-edit" onclick="adminRenameRoom(${jsAttr(room)})">${ICON.edit} Rename</button>
              <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteRoom(${jsAttr(room)})">${ICON.trash}</button>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

function adminRenameRoom(oldName) {
  const next = window.prompt("Rename room/laboratory:", oldName);
  if (next && next.trim() && next.trim() !== oldName) { updateRoomGlobal(oldName, next.trim()); render(); }
}

function adminDeleteRoom(name) {
  appConfirm("Delete Room", `Remove '${name}' from room list?`, () => { deleteRoomGlobal(name); render(); });
}

function adminRoomModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">Add New Room / Laboratory</h3>
    <input class="modal-input" placeholder="Room Name (e.g. Computer Lab 1)" value="${esc(getDraft("adminRoomName"))}" oninput="setDraft('adminRoomName', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminRoom()">Save Room</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminRoom'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminRoom() {
  const name = getDraft("adminRoomName", "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a room name."); return; }
  addRoomGlobal(name);
  clearDrafts("adminRoom");
  closeAllAdminModals();
}

/* ---------------- Courses & Majors Tab ---------------- */
function adminCoursesTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px; margin-bottom:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Course Programs (${state.courseOptions.length})</div>
        <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAddCourseModalOpen=true; render();">+ Add Course</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.courseOptions.map((c) => `
          <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
            <div style="font-weight:700; color:#0F2942;">${esc(c)}</div>
            <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteCourse(${jsAttr(c)})">${ICON.trash}</button>
          </div>`).join("")}
      </div>
    </div>

    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-weight:700; font-size:16px; color:#0F2942;">Majors / Specializations</div>
        <button class="btn btn-primary" style="background:#0F2942; color:#FFF; border:none; padding:8px 14px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="openAdminAddMajorModal()">+ Add Major</button>
      </div>
      <div class="card-box" style="border:none; padding:0;">
        ${state.courseOptions.map((c) => `
          <div style="margin-bottom:14px;">
            <div style="font-size:12px; font-weight:700; color:#2563EB; margin-bottom:6px;">${esc(c)}</div>
            ${(state.courseMajors[c] || []).length ? (state.courseMajors[c] || []).map((m) => `
              <div class="admin-list-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border:1px solid #F1F5F9; border-radius:6px; margin-bottom:4px; background:#F8FAFC;">
                <div style="font-size:13px; color:#172033;">${esc(m)}</div>
                <button class="icon-btn-delete" style="color:#EF4444; border:none; background:none; cursor:pointer;" onclick="adminDeleteMajor(${jsAttr(c)}, ${jsAttr(m)})">${ICON.trash}</button>
              </div>`).join("") : `<div style="font-size:12px; color:#64748B;">No majors set up yet.</div>`}
          </div>`).join("")}
      </div>
    </div>`;
}

function adminDeleteCourse(name) {
  appConfirm("Delete Course Program", `Remove '${name}' and all associated majors?`, () => { deleteCourseGlobal(name); render(); });
}

function adminDeleteMajor(course, major) {
  appConfirm("Delete Major", `Remove '${major}' from ${course}?`, () => { deleteMajorGlobal(course, major); render(); });
}

function adminCourseModal() {
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">Add Course Program</h3>
    <input class="modal-input" placeholder="e.g. BSCS - Computer Science" value="${esc(getDraft("adminCourseName"))}" oninput="setDraft('adminCourseName', this.value)"/>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminCourse()">Save Course</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminCourse'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminCourse() {
  const name = getDraft("adminCourseName", "").trim();
  if (!name) { appAlert("Missing Input", "Please enter a course program name."); return; }
  addCourseGlobal(name);
  clearDrafts("adminCourse");
  closeAllAdminModals();
}

function openAdminAddMajorModal() {
  setDraft("adminMajorTargetCourse", state.courseOptions[0] || "");
  state.ui.admin.isAddMajorModalOpen = true;
  render();
}

function adminMajorModal() {
  const target = getDraft("adminMajorTargetCourse", state.courseOptions[0] || "");
  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">Add Major / Specialization</h3>
    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:6px;">SELECT COURSE PROGRAM</div>
    <div class="chip-row" style="margin-bottom:12px;">
      ${state.courseOptions.map((c) => `<div class="chip ${target === c ? "active" : ""}" onclick="setDraft('adminMajorTargetCourse', ${jsAttr(c)}); render();">${esc(c)}</div>`).join("")}
    </div>
    <input class="modal-input" placeholder="e.g. Data Analytics" value="${esc(getDraft("adminMajorName"))}" oninput="setDraft('adminMajorName', this.value)"/>
    <button class="btn btn-primary" style="background:#0F2942; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminMajor()">Save Major</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminMajor'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminMajor() {
  const target = getDraft("adminMajorTargetCourse", state.courseOptions[0] || "");
  const name = getDraft("adminMajorName", "").trim();
  if (!target || !name) { appAlert("Missing Input", "Please select a course and enter a major name."); return; }
  addMajorGlobal(target, name);
  clearDrafts("adminMajor");
  closeAllAdminModals();
}

/* ---------------- Announcements Tab ---------------- */
function adminAnnouncementsTab() {
  return `
    <div style="background:#FFF; border:1px solid #E2E8F0; border-radius:12px; padding:40px; text-align:center;">
      <div style="font-size:36px; margin-bottom:10px;">📢</div>
      <h3 style="font-size:18px; font-weight:700; color:#0F2942; margin-bottom:6px;">Broadcast System Announcement</h3>
      <p style="font-size:13px; color:#64748B; max-width:420px; margin:0 auto 20px;">Send formal notices directly to student dashboards, faculty feeds, or portal notifications.</p>
      <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px 20px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="state.ui.admin.isAnnouncementModalOpen=true; render();">Broadcast Announcement</button>
    </div>`;
}

function adminAnnouncementModal() {
  const target = getDraft("adminAnnouncementTarget", "students");
  const opts = [
    { key: "students", label: "Students Portal" },
    { key: "instructor", label: "Instructors Portal" },
    { key: "both", label: "All Users (Students & Instructors)" }
  ];

  return `
  <div class="modal-overlay center"><div class="modal-card" style="background:#FFF; border-radius:12px; padding:24px;">
    <h3 class="modal-title" style="margin-bottom:12px; color:#0F2942;">Send Broadcast Notification</h3>
    <input class="modal-input" placeholder="Announcement Title" value="${esc(getDraft("adminAnnouncementTitle"))}" oninput="setDraft('adminAnnouncementTitle', this.value)"/>
    <textarea class="modal-input" style="height:90px; resize:vertical;" placeholder="Write message..." oninput="setDraft('adminAnnouncementMessage', this.value)">${esc(getDraft("adminAnnouncementMessage"))}</textarea>
    <div style="font-size:11px; font-weight:700; color:#64748B; margin-bottom:6px;">RECIPIENT PORTALS</div>
    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
      ${opts.map((opt) => `<div class="prof-option ${target === opt.key ? "selected" : ""}" onclick="setDraft('adminAnnouncementTarget', ${jsAttr(opt.key)}); render();" style="display:flex; align-items:center; gap:8px; padding:10px; border:1px solid #E2E8F0; border-radius:6px; cursor:pointer;">
        <span>${target === opt.key ? "🔘" : "⚪"}</span>
        <span style="font-size:13px; color:#172033; font-weight:${target === opt.key ? 700 : 400}">${opt.label}</span>
      </div>`).join("")}
    </div>
    <button class="btn btn-accent" style="background:#2563EB; color:#FFF; border:none; padding:10px; border-radius:6px; font-weight:600; width:100%; cursor:pointer;" onclick="submitAdminAnnouncement()">Send Announcement</button>
    <button class="btn btn-ghost" style="width:100%; margin-top:6px;" onclick="clearDrafts('adminAnnouncement'); closeAllAdminModals();">Cancel</button>
  </div></div>`;
}

function submitAdminAnnouncement() {
  const title = getDraft("adminAnnouncementTitle", "").trim();
  const message = getDraft("adminAnnouncementMessage", "").trim();
  const target = getDraft("adminAnnouncementTarget", "students");
  if (!title || !message) { appAlert("Missing Fields", "Please enter title and message."); return; }
  const notif = { id: uid(), title, message, date: "Just now", read: false };
  if (target === "students" || target === "both") {
    state.students = state.students.map((st) => ({ ...st, notifications: [{ ...notif }, ...(st.notifications || [])] }));
  }
  if (target === "instructor" || target === "both") {
    state.instructorsList = state.instructorsList.map((inst) => ({ ...inst, notifications: [{ ...notif }, ...(inst.notifications || [])] }));
  }
  syncApi(() => Api.create("announcements", { title, message, target }));
  clearDrafts("adminAnnouncement");
  closeAllAdminModals();
  appAlert("Announcement Broadcasted", "Message sent across selected portal dashboards.", () => render());
}

/* ---------------- Settings Tab ---------------- */
function adminSettingsTab() {
  const ui = state.ui.admin;
  const settings = state.systemSettings || DEFAULT_SYSTEM_SETTINGS;
  const tab = ui.settingsTab || "general";
  const tabs = [
    ["general", "⚙️", "General"],
    ["security", "🛡️", "Security"],
    ["academic", "▣", "Academic Year"],
    ["system", "▤", "System"],
    ["notifications", "🔔", "Notifications"]
  ];
  return `
    <div class="admin-settings-layout">
      <section class="admin-settings-main">
        <div class="admin-settings-tabs">
          ${tabs.map(([key, icon, label]) => `<button class="admin-settings-tab ${tab === key ? "active" : ""}" onclick="adminSettingsSelectTab('${key}')"><span>${icon}</span>${label}</button>`).join("")}
        </div>
        ${tab === "general" ? adminSettingsGeneral(settings) : ""}
        ${tab === "security" ? adminSettingsSecurity(settings) : ""}
        ${tab === "academic" ? adminSettingsAcademic(settings) : ""}
        ${tab === "system" ? adminSettingsSystem(settings) : ""}
        ${tab === "notifications" ? adminSettingsNotifications(settings) : ""}
      </section>

      <aside class="admin-settings-side">
        <section class="admin-settings-card portal-info-card">
          <div class="admin-settings-card-head"><span>ⓘ</span><strong>Portal Information</strong></div>
          <div class="portal-info-body">
            <img src="BCC_LOGO.jpg" alt="BCC Logo" class="portal-info-logo"/>
            <div>
              <h3>${esc(settings.institutionName || "Baao Community College")}</h3>
              <strong>${esc(settings.location || "San Juan, Baao, Camarines Sur")}</strong>
              <small>${esc(settings.portalName || "Unified Campus Portal")}</small>
              <div class="portal-info-meta">⌖ &nbsp; ${esc(settings.location || "San Juan, Baao, Camarines Sur")}</div>
              <div class="portal-info-meta">◎ &nbsp; www.baaocc.edu.ph</div>
              <div class="portal-info-meta">✉ &nbsp; info@baaocc.edu.ph</div>
            </div>
          </div>
        </section>

        <section class="admin-settings-card">
          <div class="admin-settings-card-head"><span>⌘</span><div><strong>System Preferences</strong><small>Configure portal behavior and display settings.</small></div></div>
          ${adminSettingSwitch("registration", "Enable Registration", "Allow new student registrations", settings.registration)}
          ${adminSettingSwitch("documentUpload", "Enable Document Upload", "Allow file uploads for requirements", settings.documentUpload)}
          ${adminSettingSwitch("maintenanceMode", "Maintenance Mode", "Temporarily disable portal access", settings.maintenanceMode)}
        </section>

        <section class="admin-settings-card quick-actions-card">
          <div class="admin-settings-card-head"><span>⚡</span><div><strong>Quick Actions</strong><small>Manage key portal functions.</small></div></div>
          <div class="admin-quick-actions-grid">
            <button onclick="adminQuickManageUsers()"><span>👥</span><div><strong>Manage Users</strong><small>Add, edit, or remove system users</small></div><b>›</b></button>
            <button onclick="adminQuickLogs()"><span>▤</span><div><strong>System Logs</strong><small>View recent system activity</small></div><b>›</b></button>
            <button onclick="adminBackupDatabase()"><span>▰</span><div><strong>Backup Database</strong><small>Export or backup your data</small></div><b>›</b></button>
          </div>
        </section>
      </aside>
    </div>`;
}

function adminSettingsSelectTab(tab) {
  state.ui.admin.settingsTab = tab;
  render();
}

function adminSettingSwitch(key, title, desc, enabled) {
  return `<div class="admin-setting-row">
    <div class="admin-setting-icon">${key === "registration" ? "▣" : key === "documentUpload" ? "◈" : "◉"}</div>
    <div class="admin-setting-copy"><strong>${title}</strong><small>${desc}</small></div>
    <button class="admin-switch ${enabled ? "on" : ""}" onclick="adminToggleSetting('${key}')" aria-label="Toggle ${title}"><span></span></button>
  </div>`;
}

function adminSettingsGeneral(s) {
  return `<section class="admin-settings-card settings-form-card">
    <div class="admin-settings-card-head"><span>▣</span><div><strong>Portal Configuration</strong><small>Basic settings for your campus portal.</small></div></div>
    <div class="admin-settings-form-grid">
      ${adminSettingInput("portalName", "Portal Name", s.portalName, true)}
      ${adminSettingInput("institutionName", "Institution Name", s.institutionName, true)}
      ${adminSettingInput("location", "Location", s.location, false)}
      ${adminSettingSelect("academicYear", "Academic Year", s.academicYear, ["2025-2026","2026-2027","2027-2028","2028-2029"], true)}
      ${adminSettingSelect("activeSemester", "Active Semester", s.activeSemester, ["1st Semester","2nd Semester","Summer / Midyear"], true)}
    </div>
    <div class="admin-settings-actions">
      <button class="admin-save-btn" onclick="adminSaveSettings()">▣ &nbsp; Save Changes</button>
      <button class="admin-reset-btn" onclick="adminResetSettings()">↺ &nbsp; Reset</button>
    </div>
  </section>`;
}
function adminSettingsSecurity(s) {
  return `<section class="admin-settings-card settings-form-card">
    <div class="admin-settings-card-head"><span>🛡️</span><div><strong>Security Settings</strong><small>Control administrator access and login protection.</small></div></div>
    ${adminSettingSwitch("twoFactor", "Two-Factor Authentication", "Require an additional verification step for admin accounts", s.twoFactor)}
    ${adminSettingSwitch("loginAlerts", "Login Alerts", "Notify administrators when a new login occurs", s.loginAlerts)}
    <div class="admin-security-note">For production use, keep strong passwords and server-side authentication enabled. Client-side settings should not be treated as a security boundary.</div>
  </section>`;
}
function adminSettingsAcademic(s) {
  return `<section class="admin-settings-card settings-form-card">
    <div class="admin-settings-card-head"><span>▣</span><div><strong>Academic Year</strong><small>Set the active academic period used by the portal.</small></div></div>
    ${adminSettingSelect("academicYear", "Current Academic Year", s.academicYear, ["2025-2026","2026-2027","2027-2028","2028-2029"], true)}
    ${adminSettingSelect("activeSemester", "Current Semester", s.activeSemester, ["1st Semester","2nd Semester","Summer / Midyear"], true)}
    <button class="admin-save-btn" onclick="adminSaveSettings()">Save Academic Settings</button>
  </section>`;
}
function adminSettingsSystem(s) {
  return `<section class="admin-settings-card settings-form-card">
    <div class="admin-settings-card-head"><span>▤</span><div><strong>System Controls</strong><small>Configure portal-wide operational behavior.</small></div></div>
    ${adminSettingSwitch("maintenanceMode", "Maintenance Mode", "Temporarily disable normal portal access", s.maintenanceMode)}
    <div class="admin-system-stat"><span>Current version</span><strong>BCC Academic Portal · v2.6</strong></div>
    <div class="admin-system-stat"><span>Data records</span><strong>${state.students.length} students · ${state.instructorsList.length} instructors</strong></div>
    <button class="admin-save-btn secondary" onclick="adminBackupDatabase()">▰ &nbsp; Export Data Backup</button>
  </section>`;
}
function adminSettingsNotifications(s) {
  return `<section class="admin-settings-card settings-form-card">
    <div class="admin-settings-card-head"><span>🔔</span><div><strong>Notification Preferences</strong><small>Choose which system alerts are enabled.</small></div></div>
    ${adminSettingSwitch("emailNotifications", "Email Notifications", "Enable portal notification preferences", s.emailNotifications)}
    ${adminSettingSwitch("loginAlerts", "Administrator Login Alerts", "Notify administrators of new sign-ins", s.loginAlerts)}
  </section>`;
}
function adminSettingInput(key, label, value, required) {
  return `<label class="admin-form-field"><span>${label}${required ? ' <b>*</b>' : ''}</span><input data-admin-setting="${key}" value="${esc(getDraft(`setting_${key}`, value || ""))}" oninput="setDraft('setting_${key}', this.value)"/></label>`;
}
function adminSettingSelect(key, label, value, options, required) {
  return `<label class="admin-form-field"><span>${label}${required ? ' <b>*</b>' : ''}</span><select data-admin-setting="${key}" onchange="setDraft('setting_${key}', this.value)">${options.map(o => `<option ${o === getDraft(`setting_${key}`, value) ? "selected" : ""}>${o}</option>`).join("")}</select></label>`;
}
function adminToggleSetting(key) {
  state.systemSettings[key] = !state.systemSettings[key];
  saveSystemSettings();
  if (key === "maintenanceMode" && state.systemSettings[key]) appAlert("Maintenance Mode", "Portal access is marked for maintenance. Remember to enforce access restrictions server-side in production.");
  render();
}
function adminResetSettings() {
  state.systemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
  try { localStorage.setItem("bccSystemSettings", JSON.stringify(state.systemSettings)); } catch (_) {}
  applySystemSettings(state.systemSettings);
  ["portalName","institutionName","location","academicYear","activeSemester"].forEach(key => clearDraft(`setting_${key}`));
  appAlert("Settings Reset", "The portal settings were restored to the default configuration.", () => render());
}

function adminSaveSettings() {
  const s = state.systemSettings;
  ["portalName","institutionName","location","academicYear","activeSemester"].forEach(key => {
    const value = getDraft(`setting_${key}`, s[key]).trim();
    if (value) s[key] = value;
  });
  saveSystemSettings();
  appAlert("Settings Saved", "Your portal configuration is ready.", () => render());
}
function adminQuickManageUsers() { switchAdminTab("students"); }
function adminQuickLogs() {
  const activity = `${new Date().toLocaleString()} — ${state.students.length} students, ${state.instructorsList.length} instructors, ${state.registrarsList.length} registrars, ${state.adminsList.length} admins.`;
  appAlert("System Logs", activity + "\n\nRecent configuration changes are stored locally in this browser.");
}
function adminBackupDatabase() {
  const payload = { exportedAt: new Date().toISOString(), settings: state.systemSettings, students: state.students, instructors: state.instructorsList, registrars: state.registrarsList, admins: state.adminsList, sections: state.sectionsList, subjects: state.availableSubjects, rooms: state.roomOptions, courses: state.courseOptions, majors: state.courseMajors };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `bcc-portal-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  appAlert("Backup Created", "A JSON backup of the current portal data was exported.");
}

