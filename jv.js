// ——— Carga inicial y arranque de módulos ———
document.addEventListener('DOMContentLoaded', () => {
  // Oculta el loading después de 1s
  setTimeout(() => {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }, 1000);

  // Inicializa cada sección
  initIntersectionAnimations();
  initCountdownTimer();
  initSmoothScroll();
  initParallax();
  initLazyLoadMap();
  initColorRoulette();
  initSongSubmission();
  initFormSubmission();
});

// ——— Animaciones al hacer scroll ———
function initIntersectionAnimations() {
  const handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (entry.target.classList.contains('timeline-item')) {
          const index = Array.from(document.querySelectorAll('.timeline-item')).indexOf(entry.target);
          entry.target.style.animationDelay = `${index * 0.1}s`;
        }
        observer.unobserve(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(handleIntersection, {
    root: null, rootMargin: '0px', threshold: 0.2
  });
  document.querySelectorAll('.info-block, .timeline-item')
          .forEach(el => observer.observe(el));
}

// ——— Countdown hasta el evento ———
function initCountdownTimer() {
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;
  const target = new Date("May 30, 2025 18:00:00").getTime();
  const ids = ['days','hours','minutes','seconds'];
  function update() {
    const diff = target - Date.now();
    if (diff < 0) {
      clearInterval(interval);
      countdownElement.innerHTML = "<div class='alert alert-warning w-100'>¡La fiesta ha comenzado!</div>";
      return;
    }
    const d = Math.floor(diff/86400000),
          h = Math.floor(diff%86400000/3600000),
          m = Math.floor(diff%3600000/60000),
          s = Math.floor(diff%60000/1000);
    [d,h,m,s].forEach((v,i) => {
      const el = document.getElementById(ids[i]);
      if (el) el.textContent = String(v).padStart(2,'0');
    });
  }
  const interval = setInterval(update,1000);
  update();
}

// ——— Scroll suave para "#anclas" ———
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ——— Efecto parallax sencillo ———
function initParallax() {
  const brush = document.querySelector('.brush-stroke');
  const ball   = document.querySelector('.basketball-decoration');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (brush) brush.style.transform = `translateY(${y*0.05}px)`;
    if (ball)  ball.style.transform  = `rotate(${-15 + y*0.02}deg)`;
  });
}

// ——— Lazy load para el mapa de Google ———
function initLazyLoadMap() {
  const iframe = document.querySelector('iframe[src*="google.com/maps"]');
  if (!iframe) return;
  const load = () => {
    const top = iframe.getBoundingClientRect().top;
    if (top < window.innerHeight + 200) {
      iframe.setAttribute('loading','eager');
      window.removeEventListener('scroll', load);
    }
  };
  window.addEventListener('scroll', load);
  load();
}

// ——— Ruleta de color CORREGIDA (solo una vez) ———
function initColorRoulette() {
  const colorsArr = [
    'Rojo', 'Azul', 'Amarillo', 'Verde', 'Naranja', 'Morado',
    'Rosa', 'Marrón', 'Negro', 'Blanco', 'Gris', 'Celeste'
  ];

  const per   = 360 / colorsArr.length;            // 30° por segmento (360/12)
  const wheel = document.getElementById('roulette');
  const btn   = document.getElementById('spinBtn');
  const out   = document.getElementById('colorResult');
  const inp   = document.getElementById('selectedColor');
  const disp  = document.getElementById('displaySelectedColor');

  if (!wheel || !btn) return;

  let hasSpun = false; // Variable para controlar si ya se giró

  btn.addEventListener('click', () => {
    // Si ya se giró, no hacer nada
    if (hasSpun) {
      alert('¡Ya giraste la ruleta! Tu color seleccionado es: ' + formData.colorSeleccionado);
      return;
    }

    btn.disabled = true;                           // evita doble clic
    hasSpun = true;                               // Marca que ya se giró

    const idx = Math.floor(Math.random() * colorsArr.length);
    
    // CLAVE: El puntero está en la parte superior (12 en punto)
    // Para que el puntero apunte al color correcto, necesitamos:
    // 1. Calcular el ángulo donde debe quedar el segmento seleccionado
    // 2. El segmento idx debe quedar centrado en la parte superior (0°)
    
    const turns = 5 * 360;                         // 5 vueltas completas para efecto
    
    // Ángulo del centro del segmento seleccionado
    const segmentCenterAngle = idx * per + (per / 2);
    
    // Para que el segmento quede en la parte superior (donde está el puntero),
    // necesitamos rotar -(segmentCenterAngle) grados adicionales
    const finalAngle = turns - segmentCenterAngle;
    
    wheel.style.transform = `rotate(${finalAngle}deg)`;

    // espera a que termine la animación (4 s)
    setTimeout(() => {
      const elegido = colorsArr[idx];
      out.textContent      = `¡Tu color es: ${elegido}!`;
      inp.value            = elegido;
      disp.textContent     = elegido;
      formData.colorSeleccionado = elegido;
      
      // Cambiar el texto del botón para indicar que ya no se puede usar
      btn.textContent = '✅ Color seleccionado';
      btn.style.opacity = '0.6';
      btn.style.cursor = 'not-allowed';
      // NO reactivamos el botón (btn.disabled sigue siendo true)
    }, 4000);
  });
}

// ——— Guardado de canción sugerida ———
function initSongSubmission() {
  const btn      = document.getElementById('submitSong');
  const input    = document.getElementById('songInput');
  const feedback = document.getElementById('songFeedback');
  const saved    = document.getElementById('savedSong');
  if (!btn||!input||!feedback) return;

  btn.addEventListener('click', () => {
    const song = input.value.trim();
    if (song) {
      feedback.textContent = `Gracias por tu sugerencia: "${song}" 🎶`;
      saved.value = song;
      formData.cancionSugerida = song;
    } else {
      feedback.textContent = 'Por favor, escribe el nombre de una canción.';
    }
  });
}

// ——— Manejo del envío del formulario ———
function initFormSubmission() {
  const form = document.getElementById('attendanceForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validar que la ruleta ya haya sido girada
    if (!formData.colorSeleccionado) {
      alert('¡Por favor gira la ruleta para seleccionar tu color!');
      return;
    }

    // Rellenar los inputs ocultos
    document.getElementById('selectedColor').value = formData.colorSeleccionado;
    document.getElementById('savedSong').value    = formData.cancionSugerida || 'Sin canción';

    // Envía el <form> al iframe oculto (sin CORS ni fetch)
    form.submit();

    // Feedback al usuario
    alert('✅ ¡Gracias! Tu asistencia ha sido registrada.');
    form.reset();
    document.getElementById('displaySelectedColor').textContent = 'Formulario enviado correctamente';
  });
}

// ——— Envío a Google Forms (funciona) ———
function enviarAGoogleForms(data) {
  const url = 'https://docs.google.com/forms/d/e/1FAIpQLSe_djtth-DTJVzvDeqdkRKCyTiza4fh4JcZuZtYNC30UxeC9A/formResponse';
  // IDs reales del formResponse
  const ENTRY_NOMBRE  = 'entry.1329467715';
  const ENTRY_ASISTE  = 'entry.401355680';
  const ENTRY_COLOR   = 'entry.1744192272';
  const ENTRY_CANCION = 'entry.203115501';

  const f = new FormData();
  f.append(ENTRY_NOMBRE,  data.nombre);
  f.append(ENTRY_ASISTE,  data.asistencia);
  f.append(ENTRY_COLOR,   data.colorSeleccionado);
  f.append(ENTRY_CANCION, data.cancionSugerida || 'Sin canción');

  // El modo 'no-cors' es obligatorio para Google Forms
  fetch(url, {
    method: 'POST',
    mode:   'no-cors',
    body:   f
  })
  .then(() => {
    alert('✅ ¡Gracias! Tu respuesta ya está registrada.');
    document.getElementById('attendanceForm').reset();
    document.getElementById('displaySelectedColor').textContent = 'Formulario enviado correctamente';
  })
  .catch(err => {
    console.error('Error al enviar:', err);
    alert('❌ Hubo un error al enviar. Revisa la consola.');
  });
}

// ——— Datos globales del formulario ———
let formData = {
  nombre: '',
  asistencia: '',
  colorSeleccionado: '',
  cancionSugerida: ''
};