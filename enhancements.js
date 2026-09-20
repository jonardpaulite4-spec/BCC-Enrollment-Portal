/* =====================================================================
   BAAOCC PORTAL UX ENHANCEMENTS v2
   This file is intentionally framework-free so it can sit beside the
   existing app.js/admin.js without changing the existing rendering model.
===================================================================== */
(() => {
  const root = document.getElementById('root');
  if (!root) return;

  const ensureStack = () => {
    let stack = document.querySelector('.ux-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ux-toast-stack';
      stack.setAttribute('aria-live', 'polite');
      stack.setAttribute('aria-atomic', 'false');
      document.body.appendChild(stack);
    }
    return stack;
  };

  const toast = (title, message = '', type = 'info', timeout = 3600) => {
    const icons = { success: '✓', error: '!', warning: '⚠', info: 'i' };
    const item = document.createElement('div');
    item.className = `ux-toast ${type}`;
    item.innerHTML = `<div class="ux-toast-icon">${icons[type] || icons.info}</div><div><div class="ux-toast-title"></div><div class="ux-toast-message"></div></div><button class="ux-toast-close" type="button" aria-label="Dismiss">×</button>`;
    item.querySelector('.ux-toast-title').textContent = title;
    item.querySelector('.ux-toast-message').textContent = message;
    item.querySelector('.ux-toast-close').addEventListener('click', () => item.remove());
    ensureStack().appendChild(item);
    window.setTimeout(() => item.remove(), timeout);
  };
  window.portalToast = toast;

  const loading = (show, label = 'Please wait…') => {
    let overlay = document.querySelector('.ux-loading-overlay');
    if (!show) { overlay?.remove(); return; }
    if (overlay) { overlay.querySelector('.ux-loading-label').textContent = label; return; }
    overlay = document.createElement('div');
    overlay.className = 'ux-loading-overlay';
    overlay.innerHTML = `<div class="ux-loading-card" role="status" aria-live="polite"><div class="ux-spinner"></div><div class="ux-loading-label"></div></div>`;
    overlay.querySelector('.ux-loading-label').textContent = label;
    document.body.appendChild(overlay);
  };
  window.portalLoading = loading;

  // Add a small password-strength meter and a visibility toggle to password fields.
  const scorePassword = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score, 4);
  };
  const attachPasswordUX = (scope = document) => {
    scope.querySelectorAll('input[type="password"]:not([data-ux-password])').forEach((input) => {
      input.dataset.uxPassword = '1';
      const wrap = input.parentElement;
      if (!wrap) return;
      wrap.style.position = 'relative';
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'ux-password-toggle';
      toggle.textContent = 'Show';
      Object.assign(toggle.style, { position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', border:'0', background:'transparent', color:'#2166a5', fontWeight:'800', fontSize:'11px', cursor:'pointer' });
      toggle.addEventListener('click', () => {
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        toggle.textContent = visible ? 'Show' : 'Hide';
      });
      wrap.appendChild(toggle);

      const meter = document.createElement('div');
      meter.className = 'ux-password-strength';
      meter.innerHTML = '<div class="ux-strength-bar"><div class="ux-strength-fill"></div></div><div class="ux-strength-label">Use 8+ characters with upper/lowercase, number, and symbol.</div>';
      wrap.parentElement?.appendChild(meter);
      const fill = meter.querySelector('.ux-strength-fill');
      const label = meter.querySelector('.ux-strength-label');
      const update = () => {
        const score = scorePassword(input.value);
        fill.style.width = `${score * 25}%`;
        label.textContent = !input.value ? 'Use 8+ characters with upper/lowercase, number, and symbol.' : ['Weak','Fair','Good','Strong','Very strong'][score];
      };
      input.addEventListener('input', update);
      update();
    });
  };

  // ESC should close the topmost modal when the existing app exposes a close button.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const close = [...root.querySelectorAll('button')].find((b) => {
      const label = `${b.getAttribute('aria-label') || ''} ${b.textContent || ''}`.toLowerCase();
      return label.includes('close') || label.trim() === '×';
    });
    if (close) close.click();
  });

  const scrollRoot = () => document.scrollingElement || document.documentElement;
  const getScrollTarget = () => {
    const candidates = [
      root.querySelector('.modal-body'),
      root.querySelector('.modal-card'),
      root.querySelector('.admin-content'),
      scrollRoot()
    ].filter(Boolean);
    return candidates.find((el) => el.scrollHeight > el.clientHeight + 24) || null;
  };
  const position = (el) => {
    if (!el) return { top: 0, max: 0 };
    if (el === scrollRoot()) return { top: window.scrollY, max: Math.max(0, el.scrollHeight - window.innerHeight) };
    return { top: el.scrollTop, max: Math.max(0, el.scrollHeight - el.clientHeight) };
  };

  const updateScroll = () => {
    const controls = document.getElementById('global-scroll-controls');
    const button = document.getElementById('global-scroll-btn');
    const icon = document.getElementById('global-scroll-icon');
    if (!controls || !button || !icon) return;
    const target = getScrollTarget();
    if (!target) { controls.classList.remove('has-target'); return; }
    const { top, max } = position(target);
    const atBottom = max <= 32 || top >= max - 32;
    const down = !atBottom;
    controls.classList.add('has-target');
    button.dataset.direction = down ? 'down' : 'up';
    icon.textContent = down ? '↓' : '↑';
    button.setAttribute('aria-label', down ? 'Scroll down' : 'Scroll to top');
    button.title = down ? 'Scroll down' : 'Scroll to top';
    button.onclick = () => {
      const latest = getScrollTarget(); if (!latest) return;
      const p = position(latest); const destination = p.top <= 32 ? p.max : 0;
      if (latest === scrollRoot()) window.scrollTo({ top: destination, behavior: 'smooth' });
      else latest.scrollTo({ top: destination, behavior: 'smooth' });
    };
  };

  let raf = 0;
  const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { attachPasswordUX(root); updateScroll(); }); };
  window.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('scroll', schedule, { passive: true, capture: true });
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  schedule();

  // Public helper for future components.
  window.BCCUX = { toast, loading, attachPasswordUX, updateScroll };
})();
