// رابط الـ Web App الخاص بجوجل شيت
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw88LCKAJ8QCXDsFQUZSCk-_JEgdIPcnKBEN2tautwfim2hkQrmJF88J07mTKuC3_sT/exec";

// تعريف ملف الأغنية
const bgMusic = new Audio('song.mp3');
bgMusic.loop = true; // لتكرار الأغنية تلقائياً
let isPlaying = false;

// 1. فتح شاشة الترحيب وتشغيل الأغنية فوراً كاستجابة لزر الفتح
function openInvitation() {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.classList.add('hidden-splash');
  
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

async function renderWishes() {
  const list = document.getElementById('wishes-list');
  if (!list) return;
  list.innerHTML = `<div class="text-center text-muted py-4 text-sm">جاري تحميل التهاني...</div>`;
  
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
    await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        name: name,
        message: message,
        time: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
      })
    });

    nameInput.value = '';
    msgInput.value = '';
    renderWishes();
    showToast('تمت إضافة تهنئتك إلى حائط الذكريات بنجاح ♡');
  } catch (error) {
    showToast('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
  }
}

async function deleteWish(id) {
  const password = prompt("أدخل كلمة مرور المشرف للحذف:");
  if (!password) return;

  showToast('جاري حذف التهنئة...');

  try {
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
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
      if (entry.target.id === 'venue') {
        const hallIllustration = document.getElementById('hall-illustration');
        if (hallIllustration) hallIllustration.classList.add('hall-animated');
      }
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));

// تمييز القائمة النشطة أثناء التمرير
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 180) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

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
