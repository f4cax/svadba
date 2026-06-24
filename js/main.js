(function () {
  const WEDDING_DATE = new Date('2026-09-26T15:00:00+03:00');
  const MUSIC_START_SEC = 32;

  const introScreen = document.getElementById('intro-screen');
  const unlockCurtain = document.getElementById('unlock-curtain');
  const openBtn = document.getElementById('open-btn');
  const mainContent = document.getElementById('main-content');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const rsvpForm = document.getElementById('rsvp-form');
  const formStatus = document.getElementById('form-status');

  let musicPlaying = false;
  let isUnlocking = false;
  let touchStartY = 0;

  openBtn.addEventListener('click', openInvitation);

  unlockCurtain.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  unlockCurtain.addEventListener('touchend', (e) => {
    const deltaY = touchStartY - e.changedTouches[0].clientY;
    if (deltaY > 50) openInvitation();
  }, { passive: true });

  function openInvitation() {
    if (isUnlocking) return;
    isUnlocking = true;

    introScreen.classList.add('unlocked');

    setTimeout(() => {
      introScreen.classList.add('hidden');
      mainContent.hidden = false;
      document.body.classList.add('intro-open');
      musicToggle.hidden = false;
      startMusic();
      initRevealAnimations();
    }, 1100);
  }

  musicToggle.addEventListener('click', toggleMusic);

  function startMusic() {
    bgMusic.currentTime = MUSIC_START_SEC;
    bgMusic.play().then(() => {
      musicPlaying = true;
      updateMusicIcon();
    }).catch(() => {
      musicPlaying = false;
      updateMusicIcon();
    });
  }

  function toggleMusic() {
    if (musicPlaying) {
      bgMusic.pause();
      musicPlaying = false;
    } else {
      if (bgMusic.currentTime < MUSIC_START_SEC) {
        bgMusic.currentTime = MUSIC_START_SEC;
      }
      bgMusic.play();
      musicPlaying = true;
    }
    updateMusicIcon();
  }

  function updateMusicIcon() {
    const onIcon = musicToggle.querySelector('.icon-music-on');
    const offIcon = musicToggle.querySelector('.icon-music-off');
    if (musicPlaying) {
      onIcon.hidden = false;
      offIcon.hidden = true;
      musicToggle.classList.add('playing');
      musicToggle.setAttribute('aria-label', 'Выключить музыку');
    } else {
      onIcon.hidden = true;
      offIcon.hidden = false;
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('aria-label', 'Включить музыку');
    }
  }

  bgMusic.addEventListener('ended', () => {
    bgMusic.currentTime = MUSIC_START_SEC;
    bgMusic.play();
  });

  function updateCountdown() {
    const now = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      setCountdown(0, 0, 0, 0);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    setCountdown(days, hours, minutes, seconds);
  }

  function setCountdown(d, h, m, s) {
    document.getElementById('days').textContent = String(d).padStart(2, '0');
    document.getElementById('hours').textContent = String(h).padStart(2, '0');
    document.getElementById('minutes').textContent = String(m).padStart(2, '0');
    document.getElementById('seconds').textContent = String(s).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';
      formStatus.textContent = '';
      formStatus.className = 'form-note';

      try {
        const formData = new FormData(rsvpForm);
        const response = await fetch(rsvpForm.action, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          formStatus.textContent = 'Спасибо! Ваша анкета отправлена.';
          formStatus.className = 'form-note success';
          rsvpForm.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        formStatus.textContent = 'Не удалось отправить. Попробуйте ещё раз или напишите на dians.ts.29.09@gmail.com';
        formStatus.className = 'form-note error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить анкету';
      }
    });
  }
})();
