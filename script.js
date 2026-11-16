

// استبدل النص التالي برابط الـ Web App الذي نسخْته من جوجل
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw88LCKAJ8QCXDsFQUZSCk-_JEgdIPcnKBEN2tautwfim2hkQrmJF88J07mTKuC3_sT/exec";

// 1. Open Splash Screen & Start Soft Romantic Piano/Harp Melody
function openInvitation() {
  const splash = document.getElementById('splash-screen');
  splash.classList.add('hidden-splash');
  startRomanticMusic();
}

// 2. Built-in Soft Romantic Piano & Harp Generator (Web Audio API)
let audioCtx = null;
let isPlaying = false;
let musicInterval = null;

const melodyNotes = [
  261.63, 329.63, 392.00, 493.88,
  220.00, 261.63, 329.63, 392.00,
  174.61, 220.00, 261.63, 349.23,
  196.00, 246.94, 293.66, 392.00
];
let noteIndex = 0;

function playSoftNote(freq) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 2.3);
}

function startRomanticMusic() {
  if (isPlaying) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  isPlaying = true;
  document.getElementById('music-icon').textContent = '❚❚';
  playSoftNote(melodyNotes[noteIndex % melodyNotes.length]);
  noteIndex++;
  musicInterval = setInterval(() => {
    if (!isPlaying) return;
    playSoftNote(melodyNotes[noteIndex % melodyNotes.length]);
    noteIndex++;
  }, 650);
}

function stopRomanticMusic() {
  isPlaying = false;
  clearInterval(musicInterval);
  document.getElementById('music-icon').textContent = '♪';
}

function toggleMusic() {
  if (isPlaying) {
    stopRomanticMusic();
    showToast('تم إيقاف الموسيقى');
  } else {
    startRomanticMusic();
    showToast('تم تشغيل الموسيقى الهادئة');
  }
}

// 3. Countdown Timer to Dec 4, 2026 7:00 PM (Cairo Time UTC+2)
const weddingDate = new Date('2026-12-04T19:00:00+02:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, weddingDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 4. Copy Location Link
function copyLocation() {
  const url = 'https://share.google/8MyrDvoZ94dbffSTs';
  navigator.clipboard.writeText(url).then(() => {
    showToast('تم نسخ رابط الموقع بنجاح');
  });
}

// 5. Google Sheets Wishes Wall Integration
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

// 6. Scroll Reveal & Hall Animation Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      if (entry.target.id === 'venue') {
        document.getElementById('hall-illustration').classList.add('hall-animated');
      }
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));

// Active Nav Link Highlight
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

// 7. Toast Helper
function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.classList.remove('opacity-0', 'translate-y-4');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 2800);
}

// Load wishes on startup
renderWishes();