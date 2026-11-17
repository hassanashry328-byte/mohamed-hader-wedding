// رابط الـ Web App الخاص بجوجل شيت
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxGQdg7yieR4ArMhSIYQQlVXbK059VjrfdgPC8gdxr-qxCR8K6yGa-FYB6M4yNH4Ive/exec";

// تعريف ملف الأغنية
const bgMusic = new Audio('song.mp3');
bgMusic.loop = true; // لتكرار الأغنية تلقائياً
let isPlaying = false;

// 1. فتح شاشة الترحيب وتشغيل الأغنية فوراً كاستجابة لزر الفتح
function openInvitation() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  splash.classList.add('hidden-splash');
  window.scrollTo({ top: 0, behavior: 'auto' });
  
  // التشغيل الفوري لحظة الضغط لتجاوز قيود السيرفر على الإنترنت
  bgMusic.currentTime = 0;
  bgMusic.play().then(() => {
    isPlaying = true;
    const musicIcon = document.getElementById('music-icon');
    if (musicIcon) musicIcon.textContent = '❚❚';
  }).catch(error => {
    console.log("Autoplay prevented by browser:", error);
  });
}

// 2. التحكم اليدوي في الموسيقى (تشغيل / إيقاف) عبر أيقونة الصوت
function toggleMusic() {
  if (isPlaying) {
    bgMusic.pause();
    isPlaying = false;
    const musicIcon = document.getElementById('music-icon');
    if (musicIcon) musicIcon.textContent = '♪';
    showToast('تم إيقاف الموسيقى');
  } else {
    bgMusic.play().then(() => {
      isPlaying = true;
      const musicIcon = document.getElementById('music-icon');
      if (musicIcon) musicIcon.textContent = '❚❚';
      showToast('تم تشغيل أغنية الليلادي 🎵');
    }).catch(e => {
      showToast('تعذر تشغيل الموسيقى');
    });
  }
}

// 3. العد التنازلي لحفل الزفاف (4 ديسمبر 2026 - الساعة 7:00 مساءً بتوقيت القاهرة)
const weddingDate = new Date('2026-12-04T19:00:00+02:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, weddingDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 4. نسخ رابط الموقع/القاعة
function copyLocation() {
  const url = 'https://share.google/8MyrDvoZ94dbffSTs';
  navigator.clipboard.writeText(url).then(() => {
    showToast('تم نسخ رابط الموقع بنجاح');
  });
}

// 5. حائط التهاني المرتبط بـ Google Sheets
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function getOwnedWishIds() {
  try {
    return JSON.parse(localStorage.getItem('ownedWishIds') || '[]');
  } catch (error) {
    return [];
  }
}

function getOwnerToken() {
  let token = localStorage.getItem('wishOwnerToken');
  if (!token) {
    token = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    localStorage.setItem('wishOwnerToken', token);
  }
  return token;
}

function rememberOwnedWish(id) {
  if (!id) return;
  const ownedWishIds = getOwnedWishIds();
  if (!ownedWishIds.includes(String(id))) {
    ownedWishIds.push(String(id));
    localStorage.setItem('ownedWishIds', JSON.stringify(ownedWishIds));
  }
}

async function renderWishes() {
  const list = document.getElementById('wishes-list');
  if (!list) return;
  list.innerHTML = `<div class="text-center text-muted py-4 text-sm">جاري تحميل التهاني...</div>`;
  const ownedWishIds = getOwnedWishIds();
  
  try {
    const response = await fetch(WEB_APP_URL);
    const wishes = await response.json();
    
    if (!Array.isArray(wishes) || wishes.length === 0) {
      list.innerHTML = `<p class="text-center text-muted py-4 text-sm">كن أول من يترك تهنئة للعروسين ♡</p>`;
      return;
    }

    list.innerHTML = wishes.reverse().map(w => `
      <div class="editorial-card p-5 text-right relative">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-sage text-sm sm:text-base">${escapeHTML(w.name)}</span>
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-gold">${escapeHTML(String(w.time || ''))}</span>
            ${ownedWishIds.includes(String(w.id)) ? `<button onclick="editWish('${escapeHTML(String(w.id))}')" class="text-xs text-sage hover:text-sageDark transition" title="تعديل تهنئتك">تعديل</button>` : ''}
            <button onclick="deleteWish('${w.id}')" class="text-xs text-red-500 hover:text-red-700 transition" title="حذف التهنئة">✕</button>
          </div>
        </div>
        <p class="text-sm text-ink leading-relaxed">${escapeHTML(w.message)}</p>
      </div>
    `).join('');
  } catch (error) {
    list.innerHTML = `<p class="text-center text-red-500 py-4 text-sm">عفواً، تعذر تحميل التهاني حالياً.</p>`;
  }
}

function launchLoveBurst() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const submitButton = document.querySelector('#wish-form button[type="submit"]');
  if (!submitButton) return;

  const bounds = submitButton.getBoundingClientRect();
  const hearts = ['♥', '♡', '✦'];
  const colors = ['#C56A83', '#D99AA9', '#C5A059', '#E3B6C2'];
  const burst = document.createElement('div');
  burst.className = 'love-burst';
  burst.setAttribute('aria-hidden', 'true');
  document.body.appendChild(burst);

  for (let i = 0; i < 18; i++) {
    const particle = document.createElement('span');
    const delay = Math.random() * 0.25;
    const duration = 1.8 + Math.random() * 0.8;
    particle.className = 'love-burst-heart';
    particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    particle.style.left = `${bounds.left + bounds.width / 2 + (Math.random() - 0.5) * 90}px`;
    particle.style.top = `${bounds.top + bounds.height / 2 + (Math.random() - 0.5) * 18}px`;
    particle.style.color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.fontSize = `${15 + Math.random() * 15}px`;
    particle.style.setProperty('--heart-drift', `${(Math.random() - 0.5) * 150}px`);
    particle.style.setProperty('--heart-rotation', `${(Math.random() - 0.5) * 70}deg`);
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    burst.appendChild(particle);
    setTimeout(() => particle.remove(), (delay + duration) * 1000 + 100);
  }

  setTimeout(() => burst.remove(), 3200);
}

async function addWish(e) {
  e.preventDefault();
  const nameInput = document.getElementById('guest-name');
  const msgInput = document.getElementById('guest-message');
  if (!nameInput || !msgInput) return;

  const name = nameInput.value.trim();
  const message = msgInput.value.trim();
  if (!name || !message) return;

  showToast('جاري إرسال تهنئتك...');

  try {
    const ownerToken = getOwnerToken();
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        name: name,
        message: message,
        ownerToken: ownerToken,
        time: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
      })
    });
    const result = await response.json();
    if (result?.id) rememberOwnedWish(result.id);
    if (result?.status === 'error') throw new Error(result.message || 'Failed to add wish');

    launchLoveBurst();
    nameInput.value = '';
    msgInput.value = '';
    renderWishes();
    showToast('تمت إضافة تهنئتك إلى حائط الذكريات بنجاح ♡');
  } catch (error) {
    showToast('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
  }
}

async function editWish(id) {
  const wishCard = Array.from(document.querySelectorAll('#wishes-list .editorial-card'))
    .find(card => card.querySelector(`[onclick="editWish('${id}')"]`));
  const messageElement = wishCard?.querySelector('p');
  const currentMessage = messageElement?.textContent || '';
  const newMessage = prompt('عدّل تهنئتك:', currentMessage);
  if (newMessage === null) return;

  const message = newMessage.trim();
  if (!message) {
    showToast('لا يمكن أن تكون التهنئة فارغة');
    return;
  }

  showToast('جاري تعديل تهنئتك...');
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'edit',
        id: id,
        ownerToken: getOwnerToken(),
        message: message
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      await renderWishes();
      showToast('تم تعديل تهنئتك بنجاح');
    } else {
      showToast(result.message || 'لا يمكن تعديل هذه التهنئة');
    }
  } catch (error) {
    showToast('حدث خطأ أثناء تعديل التهنئة');
  }
}

async function deleteWish(id) {
  const password = prompt("أدخل كلمة مرور المشرف للحذف:");
  if (!password) return;

  showToast('جاري حذف التهنئة...');

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'delete',
        id: id,
        password: password
      })
    });
    const result = await res.json();
    
    if (result.status === 'success') {
      renderWishes();
      showToast('تم حذف التهنئة بنجاح');
    } else {
      alert('كلمة المرور غير صحيحة!');
      showToast('فشل الحذف');
    }
  } catch (error) {
    showToast('حدث خطأ أثناء الحذف');
  }
}

// 6. تأثيرات ظهور الأقسام أثناء التمرير
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
      if (entry.target.id === 'venue') {
        const hallIllustration = document.getElementById('hall-illustration');
        if (hallIllustration) hallIllustration.classList.add('hall-animated');
      }
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
document.querySelectorAll('.photo-frame').forEach(el => {
  el.classList.add('photo-reveal');
  observer.observe(el);
});

// تمييز القائمة النشطة أثناء التمرير
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 180) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', updateActiveNavLink, { passive: true });
updateActiveNavLink();

// 7. مساعد التنبيهات (Toast)
function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.remove('opacity-0', 'translate-y-4');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 2800);
}

// تحميل التهاني تلقائياً عند فتح الموقع
renderWishes();