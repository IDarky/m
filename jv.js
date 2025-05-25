class PartyInvitationManager {
  constructor() {
    this.config = {
      webAppUrl: 'https://script.google.com/macros/s/AKfycbxmZ4G82M0-oPkc5560pUlMULI8KEfqhVyTigQAUjIFVZ6p52HwO33VV4XyBR2ELFKkZg/exec',
      eventDate: "May 30, 2025 18:00:00",
      loadingDelay: 1000,
      parallaxFactor: { brush: 0.05, ball: 0.02 },
      animationDelay: 0.1,
      spinDuration: 4000
    };
    
    this.state = {
      hasSpunRoulette: false,
      countdownInterval: null,
      isSubmitting: false,
      currentRotation: 0 // Agregar para tracking de rotación
    };

    this.colors = [
      'Rojo','Azul','Amarillo','Verde',
      'Naranja','Morado','Rosa','Marrón',
      'Negro','Blanco','Gris','Celeste'
    ];

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeModules());
    } else {
      this.initializeModules();
    }
  }

  initializeModules() {
    try {
      this.handleInitialLoading();
      this.initIntersectionAnimations();
      this.initCountdownTimer();
      this.initSmoothScroll();
      this.initParallax();
      this.initLazyLoadMap();
      this.initColorRoulette();
      this.initSongSubmission();
      this.initFormSubmission();
      this.initKeyboardNavigation();
      this.initProgressIndicator();
      console.log('PartyInvitationManager inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar módulos:', error);
      this.showErrorMessage('Error al cargar la página. Por favor, recarga.');
    }
  }

  handleInitialLoading() {
    setTimeout(() => {
      const overlay = document.querySelector('.loading-overlay');
      if (overlay) {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.classList.add('hidden'), 300);
      }
    }, this.config.loadingDelay);
  }

  initIntersectionAnimations() {
    const opts = { root: null, rootMargin: '-50px 0px', threshold: [0.1,0.5] };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target, obs);
        }
      });
    }, opts);

    document.querySelectorAll('.info-block, .timeline-item, .section-animate')
            .forEach(el => {
              el.classList.add('animate-on-scroll');
              observer.observe(el);
            });
  }

  animateElement(el, obs) {
    el.classList.add('in-view');
    if (el.classList.contains('timeline-item')) {
      const items = Array.from(document.querySelectorAll('.timeline-item'));
      el.style.animationDelay = `${items.indexOf(el) * this.config.animationDelay}s`;
    }
    obs.unobserve(el);
  }

  initCountdownTimer() {
    const cntEl = document.getElementById('countdown');
    if (!cntEl) return;

    const target = new Date(this.config.eventDate).getTime();
    if (isNaN(target)) {
      console.error('Fecha de evento inválida');
      return;
    }

    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        this.handleEventStarted(cntEl);
        return;
      }
      const days    = Math.floor(diff / 86400000);
      const hours   = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      [['days',days],['hours',hours],['minutes',minutes],['seconds',seconds]]
        .forEach(([id,val]) => {
          const el = document.getElementById(id);
          if (el) {
            el.textContent = String(val).padStart(2,'0');
            if (id==='seconds') {
              el.style.animation = 'pulse 1s ease-in-out';
              setTimeout(() => el.style.animation = '', 1000);
            }
          }
        });
    };

    update();
    this.state.countdownInterval = setInterval(update, 1000);
  }

  handleEventStarted(cntEl) {
    clearInterval(this.state.countdownInterval);
    cntEl.innerHTML = `
      <div class="alert alert-success w-100 text-center animate__animated animate__bounceIn">
        🎉 ¡La fiesta ha comenzado! 🎉
      </div>
    `;
  }

  initSmoothScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const tgt = document.querySelector(a.getAttribute('href'));
      if (tgt) this.smoothScrollTo(tgt);
      this.updateActiveNavigation(a.getAttribute('href'));
    });
  }

  smoothScrollTo(el) {
    const headerOffset = document.querySelector('header')?.offsetHeight || 0;
    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  updateActiveNavigation(activeId) {
    document.querySelectorAll('.nav-link')
      .forEach(link => link.classList.toggle('active', link.getAttribute('href')===activeId));
  }

  initParallax() {
    const brush = document.querySelector('.brush-stroke');
    const ball  = document.querySelector('.basketball-decoration');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.pageYOffset;
          if (brush) brush.style.transform = `translate3d(0,${y*this.config.parallaxFactor.brush}px,0)`;
          if (ball)  ball.style.transform  = `rotate(${ -15 + y*this.config.parallaxFactor.ball }deg)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  initLazyLoadMap() {
    const iframe = document.querySelector('iframe[data-src][src=""]');
    if (!iframe) return;
    const obs = new IntersectionObserver((entries, o) => {
      if (entries[0].isIntersecting) {
        iframe.src = iframe.dataset.src;
        iframe.loading = 'eager';
        o.unobserve(iframe);
      }
    }, { rootMargin: '200px' });
    obs.observe(iframe);
  }

  // ——— RULETA DE COLOR CORREGIDA ———
  initColorRoulette() {
    const elements = this.getRouletteElements();
    
    // Verificar que todos los elementos existan
    if (!elements.wheel || !elements.button) {
      console.warn('Elementos de ruleta no encontrados');
      return;
    }

    console.log('Inicializando ruleta con elementos:', elements);

    const segmentAngle = 360 / this.colors.length;
    
    // Agregar event listener con verificación
    elements.button.addEventListener('click', (e) => {
      console.log('Botón de ruleta clickeado');
      e.preventDefault();
      
      if (this.state.hasSpunRoulette) {
        this.showMessage(`¡Ya giraste la ruleta! Tu color es: ${elements.hiddenForm?.value || 'No definido'}`, 'info');
        return;
      }
      
      this.spinRoulette(elements, segmentAngle);
    });

    // Restaurar estado previo
    this.restoreRouletteState(elements);
  }
getRouletteElements() {
  return {
    wheel: document.getElementById('roulette'),
    button: document.getElementById('spinBtn'),
    display: document.getElementById('colorResult'),
    hiddenSorteo: document.getElementById('selectedColorSorteo'),
    hiddenForm: document.getElementById('selectedColor')
      };
}

  async spinRoulette(elements, segmentAngle) {
    console.log('Iniciando giro de ruleta');
    
    try {
      this.setSpinningState(elements.button, true);
      
      // Seleccionar color aleatorio
      const selectedIndex = Math.floor(Math.random() * this.colors.length);
      const selectedColor = this.colors[selectedIndex];
      
      console.log(`Color seleccionado: ${selectedColor} (índice: ${selectedIndex})`);
      
      // Calcular ángulo final
      // Agregamos múltiples vueltas completas para efecto visual
      const extraSpins = 1800; // 5 vueltas completas
      const targetAngle = selectedIndex * segmentAngle;
      const finalRotation = this.state.currentRotation + extraSpins + (360 - targetAngle);
      
      console.log(`Rotación final: ${finalRotation}°`);
      
      // Aplicar rotación
      elements.wheel.style.transition = `transform ${this.config.spinDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      elements.wheel.style.transform = `rotate(${finalRotation}deg)`;
      
      // Actualizar estado de rotación actual
      this.state.currentRotation = finalRotation % 360;
      
      // Esperar a que termine la animación
      await new Promise(resolve => setTimeout(resolve, this.config.spinDuration));
      
      // Mostrar resultado
      this.displayRouletteResult(elements, selectedColor);
      
    } catch (error) {
      console.error('Error en spinRoulette:', error);
      this.showMessage('Error al girar la ruleta. Inténtalo de nuevo.', 'error');
      this.setSpinningState(elements.button, false);
    }
  }

  displayRouletteResult(elements, selectedColor) {
    console.log('Mostrando resultado:', selectedColor);
    
    // Actualizar display
    if (elements.display) {
      elements.display.innerHTML = `¡Tu color es: <strong>${selectedColor}</strong>! 🎨`;
      elements.display.style.display = 'block';
    }
    
    // Actualizar campos ocultos
    if (elements.hiddenSorteo) elements.hiddenSorteo.value = selectedColor;
    if (elements.hiddenForm) elements.hiddenForm.value = selectedColor;
    
    // Actualizar estado
    this.state.hasSpunRoulette = true;
    
    // Actualizar botón
    elements.button.textContent = '✅ Color seleccionado';
    elements.button.disabled = true;
    elements.button.classList.add('completed');
    
    // Guardar en sessionStorage
    try {
      sessionStorage.setItem('selectedColor', selectedColor);
      console.log('Color guardado en sessionStorage');
    } catch (error) {
      console.warn('No se pudo guardar en sessionStorage:', error);
    }
    
    // Mostrar mensaje de éxito
    this.showMessage(`¡Perfecto! Tu color es ${selectedColor} 🎨`, 'success');
  }

  setSpinningState(button, spinning) {
    if (!button) return;
    
    button.disabled = spinning;
    button.textContent = spinning ? 'Girando…' : 'Girar Ruleta';
    
    if (spinning) {
      button.classList.add('spinning');
    } else {
      button.classList.remove('spinning');
    }
  }

  restoreRouletteState(elements) {
    try {
      const savedColor = sessionStorage.getItem('selectedColor');
      console.log('Color guardado encontrado:', savedColor);
      
      if (savedColor && this.colors.includes(savedColor)) {
        this.state.hasSpunRoulette = true;
        
        if (elements.hiddenForm) elements.hiddenForm.value = savedColor;
        if (elements.hiddenSorteo) elements.hiddenSorteo.value = savedColor;
        
        if (elements.display) {
          elements.display.innerHTML = `Tu color guardado: <strong>${savedColor}</strong> 🎨`;
          elements.display.style.display = 'block';
        }
        
        if (elements.button) {
          elements.button.textContent = '✅ Color seleccionado';
          elements.button.disabled = true;
          elements.button.classList.add('completed');
        }
        
        console.log('Estado de ruleta restaurado');
      }
    } catch (error) {
      console.warn('Error al restaurar estado de ruleta:', error);
    }
  }

  // ——— Resto del código sin cambios ———
  initSongSubmission() {
    const btn      = document.getElementById('submitSong');
    const input    = document.getElementById('songInput');
    const feedback = document.getElementById('songFeedback');
    const hidden   = document.querySelector('#confirmacion-form #savedSong');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const song = input.value.trim();
      if (song.length < 2) {
        this.showFeedback(feedback, 'Escribe un nombre válido.', 'error');
      } else {
        hidden.value = song;
        this.showFeedback(feedback, `Gracias por tu sugerencia: "${song}" 🎶`, 'success');
        input.disabled = true;
      }
    });
  }

  initFormSubmission() {
    const form = document.getElementById('attendanceForm');
    if (!form) return;
    form.addEventListener('submit', e => this.handleFormSubmission(e, form));
    this.initRealTimeValidation(form);
  }

  async handleFormSubmission(e, form) {
    e.preventDefault();
    if (this.state.isSubmitting) return;

    const { isValid, message } = this.validateForm(form);
    if (!isValid) {
      this.showMessage(message, 'error');
      return;
    }

    try {
      this.state.isSubmitting = true;
      this.setSubmissionState(form, true);

      await this.submitForm(form);

      this.showMessage('✅ Confirmación enviada correctamente.', 'success');
      this.disableFormAfterSubmission(form);

    } catch (err) {
      console.error(err);
      this.showMessage('✅ Confirmación enviada correctamente.', 'error');
    } finally {
      this.state.isSubmitting = false;
      this.setSubmissionState(form, false);
    }
  }

  validateForm(form) {
    if (!form.querySelector('#selectedColor')?.value) {
      return { isValid: false, message: '¡Por favor gira la ruleta!' };
    }
    if (!form.querySelector('#nombre')?.value.trim()) {
      return { isValid: false, message: 'Por favor ingresa tu nombre.' };
    }
    if (!form.querySelector('input[name="entryAsistencia"]:checked')) {
      return { isValid: false, message: 'Selecciona Sí o No.' };
    }
    return { isValid: true };
  }

  async submitForm(form) {
    const url = this.config.webAppUrl;
    const params = new URLSearchParams(new FormData(form));
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const json = await resp.json();
    if (json.status !== 'OK') {
      throw new Error('Respuesta inválida del servidor');
    }
    return json;
  }

  setSubmissionState(form, submitting) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = submitting;
    btn.textContent = submitting ? 'Enviando...' : 'Confirmar Asistencia';
  }

  disableFormAfterSubmission(form) {
    form.querySelectorAll('input, button').forEach(el => {
      el.disabled = true;
      el.style.opacity = '0.7';
    });
  }

  initRealTimeValidation(form) {
    const name = form.querySelector('#nombre');
    if (!name) return;
    name.addEventListener('blur', () => {
      const ok = name.value.trim().length >= 2;
      name.classList.toggle('is-valid', ok);
      name.classList.toggle('is-invalid', !ok);
    });
  }

  initKeyboardNavigation() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeModals();
    });
  }
  
  closeModals() {
    document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
  }

  initProgressIndicator() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.innerHTML = '<div class="progress-fill"></div>';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      document.querySelector('.progress-fill').style.width = `${Math.min(pct, 100)}%`;
    }, { passive: true });
  }

  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  showMessage(msg, type = 'success') {
  // Referencia al elemento Toast
  const toastEl = document.getElementById('submissionToast');
  const toastBody = toastEl.querySelector('.toast-body');
  const toastClasses = ['bg-success','bg-danger','bg-info'];

  // Ajusta la clase de fondo según el tipo
  toastClasses.forEach(cls => toastEl.classList.remove(cls));
  toastEl.classList.add(
    type === 'error' ? 'bg-danger' :
    type === 'info'  ? 'bg-info'  :
    'bg-success'
  );

  // Inserta el mensaje
  toastBody.textContent = msg;

  // Inicializa y muestra el Toast (Bootstrap 5)
  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();
}


  showFeedback(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = `feedback feedback-${type}`;
    el.style.display = 'block';
  }
  
  showErrorMessage(msg) {
    const err = document.createElement('div');
    err.className = 'alert alert-danger fixed-top';
    err.textContent = msg;
    document.body.prepend(err);
    setTimeout(() => err.remove(), 5000);
  }

  destroy() {
    clearInterval(this.state.countdownInterval);
  }
}

// Inicializar
window.partyManager = new PartyInvitationManager();
window.addEventListener('beforeunload', () => partyManager.destroy());
