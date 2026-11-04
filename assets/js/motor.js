// El motor: arma el marco de la aplicación, recorre los pasos y atiende el teclado.
// No usa módulos ni dependencias, para que funcione con doble clic y sin internet.
(function () {
  'use strict';
  const D = window.SIPAU_DATOS, ESC = window.SIPAU_ESCENAS, I = window.SIPAU_ICONOS;
  const qs = new URLSearchParams(location.search);
  const IMPRIMIR = qs.has('imprimir');
  const PRESENTADOR = qs.get('modo') === 'presentador';
  const QUIETO = qs.has('estatico') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escenario = document.getElementById('escenario');
  const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${I[n] || ''}</svg>`;

  // Cada posición de la presentación es un paso de una lámina, y pertenece a una vista con su título y sus notas.
  const VISTAS = [], PASOS = [];
  ESC.forEach((lam, li) => {
    lam.vistas.forEach((v, vi) => {
      const hasta = vi + 1 < lam.vistas.length ? lam.vistas[vi + 1].desde - 1 : lam.pasos;
      const vista = Object.assign({}, D.vistas[v.id], { id: v.id, lam: li, desde: v.desde, hasta, numero: VISTAS.length + 1 });
      VISTAS.push(vista);
      for (let p = v.desde; p <= hasta; p++) PASOS.push({ lam: li, paso: p, vista: vista.numero - 1 });
    });
  });

  /* ---------- El marco ---------- */

  function construirMarco() {
    let i = 0;
    const grupos = D.riel.map(g => `
      <div class="riel-grupo">
        <div class="riel-et" style="--i:${i++}">${g.grupo}</div>
        ${g.ligas.map(l => `<div class="riel-liga" data-riel="${l.id}" style="--i:${i++}">${ic(l.icono)}<span>${l.texto}</span></div>`).join('')}
      </div>`).join('');
    const m = document.createElement('div');
    m.className = 'marco';
    m.innerHTML = `
      <div class="riel-fondo"></div>
      <main class="pagina"></main>
      <div class="muro"><canvas class="red" width="1920" height="1080"></canvas></div>
      <nav class="riel" aria-label="Secciones de la presentación">
        <div class="riel-listas" style="position:relative"><div class="riel-activo"></div>${grupos}</div>
        <div class="riel-pie">${D.proyecto.version}<span>${D.proyecto.universidad}</span></div>
      </nav>
      <header class="barra">
        <div class="barra-izq">${ic('Menu')}<span class="barra-logo"><img src="assets/img/logo-upzmg.png" alt=""></span><span class="barra-marca"><b>${D.proyecto.marca}</b><small>UPZMG · Planeación</small></span></div>
        <div class="barra-buscar">${ic('Search')}<span>${D.proyecto.busqueda}</span></div>
        <div class="barra-der">
          <span class="barra-sinteticos">${ic('Science')}${D.proyecto.sinteticos}</span>
          <span class="barra-cuenta"><i></i><span></span></span>
          <span class="barra-num"></span>
        </div>
      </header>`;
    return m;
  }

  function pintarMarco(marco, vista, conMovimiento) {
    const lam = ESC[vista.lam];
    marco.classList.toggle('muro-abierto', !!lam.muro);
    const orador = D.oradores[vista.orador] || D.oradores.E;
    marco.querySelector('.barra-cuenta i').textContent = orador.inicial;
    marco.querySelector('.barra-cuenta span').textContent = orador.nombre;
    marco.querySelector('.barra-num').textContent = `${vista.numero} / ${VISTAS.length}`;
    if (!lam.muro && vista.riel) {
      marco.querySelectorAll('.riel-liga').forEach(l => l.classList.toggle('activa', l.dataset.riel === vista.riel));
      const liga = marco.querySelector(`[data-riel="${vista.riel}"]`), activo = marco.querySelector('.riel-activo');
      const y = liga.offsetTop + liga.parentElement.offsetTop;
      if (!conMovimiento) activo.style.transition = 'none';
      activo.style.transform = `translateY(${y}px)`;
      if (!conMovimiento) { void activo.offsetWidth; activo.style.transition = ''; }
    }
  }

  function construirCab(vista) {
    const chips = (vista.chips || []).map(c => `<span class="chip-cab r r-tinta" data-en="${vista.desde}" style="--d:320ms">${ic(c.icono)}${c.texto}</span>`).join('');
    return `<div class="cab-t"><h1 class="r r-barre" data-en="${vista.desde}">${vista.titulo}</h1><p class="r r-sube" data-en="${vista.desde}" style="--d:150ms">${vista.sub || ''}</p></div>
      <div class="cab-chips">${chips}</div>
      <div class="cab-regla r r-regla" data-en="${vista.desde}" style="--d:90ms"></div>`;
  }

  /* ---------- Contexto de cada lámina: temporizadores y animaciones que se pueden cancelar de golpe ---------- */

  const salidaExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function crearContexto(raiz) {
    const relojes = new Set(), animaciones = new Set(), cuadros = new Set();
    const x = {
      raiz, datos: {}, demora: 0, vivo: !IMPRIMIR && !QUIETO,
      q: s => raiz.querySelector(s),
      qq: s => [...raiz.querySelectorAll(s)],
      tras(ms, fn) {
        const t = setTimeout(() => { relojes.delete(t); fn(); }, ms + x.demora);
        relojes.add(t);
        return t;
      },
      animar(el, kf, op) {
        const a = el.animate(kf, op);
        animaciones.add(a);
        a.finished.then(() => animaciones.delete(a)).catch(() => {});
        return a;
      },
      // Llama a fn en cada cuadro hasta que devuelva false.
      cuadro(fn) {
        const c = { id: 0 };
        const giro = ahora => {
          if (fn(ahora) === false) { cuadros.delete(c); fn(ahora + 1e6); return; }
          c.id = requestAnimationFrame(giro);
        };
        c.id = requestAnimationFrame(giro);
        cuadros.add(c);
      },
      contar(el, desde, hasta, ms, retraso = 0, o = {}) {
        const dec = o.dec || 0, pre = o.pre || '', suf = o.suf || '';
        const fmt = v => pre + Number(v).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        el.textContent = fmt(desde);
        x.tras(retraso, () => {
          const inicio = performance.now();
          x.cuadro(ahora => {
            const t = Math.min(1, (ahora - inicio) / ms);
            el.textContent = fmt(desde + (hasta - desde) * salidaExpo(t));
            return t < 1;
          });
        });
      },
      paquete(capa, ruta, o = {}) {
        const p = document.createElement('i');
        p.className = 'paq temporal ' + (o.clase || '');
        p.style.offsetPath = `path('${ruta}')`;
        capa.appendChild(p);
        x.animar(p, [
          { offsetDistance: '0%', opacity: 0 }, { offset: .05, opacity: 1 },
          { offset: .95, opacity: 1 }, { offsetDistance: '100%', opacity: 0 },
        ], { duration: o.dur || 1400, iterations: Infinity, delay: (o.desfase || 0) + x.demora, easing: o.suave ? 'cubic-bezier(.4,0,.2,1)' : 'linear', fill: 'backwards' });
      },
      limpiar() {
        relojes.forEach(clearTimeout); relojes.clear();
        cuadros.forEach(c => cancelAnimationFrame(c.id)); cuadros.clear();
        animaciones.forEach(a => a.cancel()); animaciones.clear();
        raiz.querySelectorAll('.temporal').forEach(e => e.remove());
      },
    };
    return x;
  }

  /* ---------- Pasos ---------- */

  function marcar(raiz, paso) {
    raiz.querySelectorAll('[data-en]').forEach(el => el.classList.toggle('on', +el.dataset.en <= paso));
    raiz.querySelectorAll('[data-hasta]').forEach(el => el.classList.toggle('off', +el.dataset.hasta < paso));
  }

  function numeros(lam, x, antes, paso, animar) {
    x.qq('[data-cifra]').forEach(el => {
      const padre = el.closest('[data-en]');
      const en = padre ? +padre.dataset.en : 0;
      const fin = +el.dataset.cifra, o = { dec: +el.dataset.dec || 0, pre: el.dataset.pre || '', suf: el.dataset.suf || '' };
      if (animar && antes < en && en <= paso && fin !== 0) {
        const d = parseFloat(getComputedStyle(padre).getPropertyValue('--d')) || 0;
        x.contar(el, 0, fin, 1100, d, o);
      } else {
        el.textContent = o.pre + fin.toLocaleString('es-MX', { minimumFractionDigits: o.dec, maximumFractionDigits: o.dec }) + o.suf;
      }
    });
  }

  function aplicar(lam, paso, animar) {
    const raiz = lam._raiz, x = lam._x, antes = lam._paso;
    x.limpiar();
    if (!animar) raiz.classList.add('no-anim');
    marcar(raiz, paso);
    numeros(lam, x, antes, paso, animar);
    if (lam.alPaso) lam.alPaso(x, paso, animar, antes);
    lam._paso = paso;
    if (!animar) { void raiz.offsetWidth; raiz.classList.remove('no-anim'); }
    x.demora = 0;
    raiz.style.removeProperty('--dg');
  }

  function construirLamina(lam, destinoPagina, destinoMuro) {
    const raiz = document.createElement('section');
    raiz.className = 'lamina' + (lam.muro ? ' lamina-muro' : '');
    raiz.dataset.lamina = lam.id;
    if (lam.muro) {
      raiz.innerHTML = lam.html();
      destinoMuro.appendChild(raiz);
    } else {
      // Una lámina con dos vistas lleva un encabezado por vista: se ve el del paso actual.
      const cabs = lam.vistas.map((v, i) => {
        const vista = VISTAS.find(w => w.id === v.id);
        const hasta = vista.hasta;
        return `<header class="cab"${i + 1 < lam.vistas.length ? ` data-hasta="${hasta}"` : ''}>${construirCab(vista)}</header>`;
      }).join('');
      raiz.innerHTML = `${cabs}<div class="contenido">${lam.html()}</div>`;
      destinoPagina.appendChild(raiz);
    }
    lam._raiz = raiz;
    lam._x = crearContexto(raiz);
    lam._paso = -1;
    return raiz;
  }

  /* ---------- La red del muro: la misma de la pantalla de inicio de sesión ---------- */

  function iniciarRed(canvas, inmovil) {
    const W = 1920, H = 1080, N = 48, MAX = 210, VEL = .4;
    const g = canvas.getContext('2d');
    let s = 7;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const nodos = Array.from({ length: N }, () => ({ x: azar() * W, y: azar() * H, vx: (azar() - .5) * VEL * 2, vy: (azar() - .5) * VEL * 2, r: 2.2 + azar() * 2.2 }));
    const pintar = () => {
      g.clearRect(0, 0, W, H);
      g.lineWidth = 1.2;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = nodos[i], b = nodos[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < MAX) {
            g.strokeStyle = `rgba(196,226,255,${(1 - d / MAX) * .48})`;
            g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
          }
        }
      }
      g.fillStyle = 'rgba(226,241,255,.92)';
      nodos.forEach(n => { g.beginPath(); g.arc(n.x, n.y, n.r, 0, 6.2832); g.fill(); });
    };
    const mover = () => nodos.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
    pintar();
    if (inmovil) return { activar() {} };
    let id = 0;
    const ciclo = () => { mover(); pintar(); id = requestAnimationFrame(ciclo); };
    return { activar(si) { cancelAnimationFrame(id); id = si ? requestAnimationFrame(ciclo) : 0; } };
  }

  /* ---------- Impresión: una hoja por vista, en su último paso ---------- */

  function modoImpresion() {
    document.documentElement.classList.add('imprimir');
    document.body.classList.add('imprimir');
    VISTAS.forEach(vista => {
      const lam = ESC[vista.lam];
      const hoja = document.createElement('div');
      hoja.className = 'hoja';
      const marco = construirMarco();
      hoja.appendChild(marco);
      escenario.appendChild(hoja);
      construirLamina(lam, marco.querySelector('.pagina'), marco.querySelector('.muro'));
      lam._raiz.classList.add('activa');
      marco.classList.add('no-anim');
      pintarMarco(marco, vista, false);
      aplicar(lam, vista.hasta, false);
      if (lam.muro) iniciarRed(marco.querySelector('.red'), true);
    });
  }

  /* ---------- Ventana del presentador ---------- */

  function modoPresentador() {
    document.documentElement.classList.add('con-presentador');
    document.body.classList.add('presentador');
    const principal = window.opener;
    if (!principal) {
      document.body.innerHTML = '<p class="pres-sin-ventana">Abre esta ventana desde la presentación, con la tecla P.</p>';
      return;
    }
    document.body.innerHTML = `
      <div class="pres">
        <div class="pres-barra"><b>Notas del presentador</b><span class="p-pos"></span><span class="p-plan"></span><span class="pres-tiempo">00:00</span></div>
        <div class="pres-info"><h1 class="p-tit"></h1><span class="sello nopal p-orador"></span><div class="pres-puntos"></div></div>
        <div class="pres-notas"></div>
        <div class="pres-pie"><span>Sigue: <b class="p-sig"></b></span><div class="pres-botones"><button class="p-ant">Anterior</button><button class="p-sigb">Siguiente</button><button class="p-reloj">Reiniciar reloj</button></div></div>
      </div>`;
    document.title = 'Notas · SIPAU';
    const $ = s => document.querySelector(s);
    let inicio = null;
    const total = VISTAS.reduce((s, v) => s + (v.segundos || 0), 0);
    const mmss = t => String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(Math.floor(t % 60)).padStart(2, '0');
    setInterval(() => {
      const t = inicio ? (Date.now() - inicio) / 1000 : 0;
      const el = $('.pres-tiempo');
      el.textContent = mmss(t);
      el.classList.toggle('tarde', t > 600);
    }, 500);
    const enviar = m => principal.postMessage(Object.assign({ sipau: true }, m), '*');
    $('.p-ant').onclick = () => enviar({ orden: 'anterior' });
    $('.p-sigb').onclick = () => enviar({ orden: 'siguiente' });
    $('.p-reloj').onclick = () => { inicio = Date.now(); };
    addEventListener('message', e => {
      if (!e.data || !e.data.sipau || e.data.orden) return;
      const v = VISTAS[e.data.vista], paso = e.data.paso;
      if (!inicio && e.data.pos > 0) inicio = Date.now();
      const acum = VISTAS.slice(0, e.data.vista).reduce((s, w) => s + (w.segundos || 0), 0);
      const orador = D.oradores[v.orador] || D.oradores.E;
      $('.p-pos').textContent = `Lámina ${v.numero} de ${VISTAS.length}`;
      $('.p-plan').textContent = `Plan: ${v.segundos} s · llegar aquí en ${mmss(acum)} de ${mmss(total)}`;
      $('.p-tit').textContent = v.titulo;
      $('.p-orador').textContent = orador.nombre;
      const pasos = v.hasta - v.desde + 1, hecho = paso - v.desde;
      $('.pres-puntos').innerHTML = Array.from({ length: pasos }, (_, i) => `<i class="${i <= hecho ? 'hecho-paso' : ''}"></i>`).join('');
      $('.pres-notas').innerHTML = (v.notas || []).map((n, i) => `<p class="${i === hecho ? 'ahora' : i < hecho ? 'pasado' : ''}">${n}</p>`).join('')
        + (v.ojo ? `<div class="pres-ojo">${ic('WarningAmber')}<span>${v.ojo}</span></div>` : '');
      const sig = VISTAS[e.data.vista + 1];
      $('.p-sig').textContent = hecho < pasos - 1 ? 'otro paso de esta lámina' : sig ? `${sig.numero}. ${sig.titulo}` : 'fin de la presentación';
    });
    addEventListener('keydown', e => {
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); enviar({ orden: 'siguiente' }); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); enviar({ orden: 'anterior' }); }
    });
    enviar({ orden: 'estado' });
  }

  /* ---------- Modo normal ---------- */

  function modoEscena() {
    document.body.classList.toggle('quieto', QUIETO);
    const marco = construirMarco();
    escenario.appendChild(marco);
    const pagina = marco.querySelector('.pagina'), muro = marco.querySelector('.muro');
    ESC.forEach(lam => construirLamina(lam, pagina, muro));
    marco.insertAdjacentHTML('beforeend', `
      <div class="capa-notas"></div>
      <div class="capa-ayuda"><h2>Teclas de la presentación</h2><dl>
        <dt>→ ↓ Espacio AvPág Intro</dt><dd>Siguiente paso. Un clic o deslizar también avanza.</dd>
        <dt>← ↑ RePág Retroceso</dt><dd>Paso anterior, sin animación.</dd>
        <dt>Número + Intro</dt><dd>Ir a esa lámina. Inicio y Fin van a la primera y la última.</dd>
        <dt>P</dt><dd>Abre las notas, el reloj y lo que sigue en otra ventana. Pásala a tu pantalla.</dd>
        <dt>N</dt><dd>Muestra las notas aquí mismo, para ensayar. El público también las ve.</dd>
        <dt>F</dt><dd>Pantalla completa.</dd>
        <dt>B</dt><dd>Apaga la pantalla, para conversar con el jurado.</dd>
        <dt>?</dt><dd>Esta ayuda.</dd>
      </dl></div>
      <div class="apagon"></div>`);
    const red = iniciarRed(marco.querySelector('.red'), QUIETO);

    let pos = -1, buffer = '', notas = null, ventana = null;

    function escalar() {
      const k = Math.min(innerWidth / 1920, innerHeight / 1080);
      escenario.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
    }
    addEventListener('resize', escalar);
    escalar();

    function avisarPresentador() {
      if (ventana && !ventana.closed) {
        const e = PASOS[pos];
        ventana.postMessage({ sipau: true, pos, vista: e.vista, paso: e.paso }, '*');
      }
    }

    function pintarNotas() {
      if (!notas) return;
      const e = PASOS[pos], v = VISTAS[e.vista];
      const capa = marco.querySelector('.capa-notas');
      const texto = (v.notas || [])[e.paso - v.desde] || '';
      capa.innerHTML = `<small>${v.numero}. ${v.titulo} · ${v.segundos} s</small><p>${texto}</p>${v.ojo ? `<p>${v.ojo}</p>` : ''}`;
    }

    function ir(nueva, opciones = {}) {
      nueva = Math.max(0, Math.min(PASOS.length - 1, nueva));
      if (nueva === pos) return;
      const a = PASOS[pos], b = PASOS[nueva];
      const adelante = nueva === pos + 1;
      const animar = adelante && !QUIETO && !opciones.instantaneo;
      const lamB = ESC[b.lam];
      const primera = pos === -1;

      // Al abrir la presentación el marco ya está en su lugar: el muro no entra deslizándose.
      if (primera) {
        marco.classList.add('no-anim');
        pintarMarco(marco, VISTAS[b.vista], false);
        void marco.offsetWidth;
        marco.classList.remove('no-anim');
      }

      if (a && a.lam === b.lam) {
        aplicar(lamB, b.paso, animar);
      } else {
        const lamA = a && ESC[a.lam];
        if (lamA) {
          lamA._x.limpiar();
          lamA._raiz.classList.remove('activa');
          lamA._raiz.classList.add('saliendo');
          const saliente = lamA._raiz;
          setTimeout(() => saliente.classList.remove('saliendo'), 200);
        }
        const raiz = lamB._raiz;
        // Al entrar se parte de nada; con animación, los elementos llegan en su orden.
        raiz.classList.add('no-anim');
        marcar(raiz, -1);
        lamB._paso = -1;
        void raiz.offsetWidth;
        raiz.classList.remove('saliendo');
        raiz.classList.add('activa');
        if (animar) {
          raiz.classList.remove('no-anim');
          void raiz.offsetWidth;
          // Al abrirse o plegarse el muro, el contenido espera a que haya terminado de moverse.
          const cruzaMuro = lamA && !!lamA.muro !== !!lamB.muro;
          if (cruzaMuro) {
            raiz.style.setProperty('--dg', lamB.muro ? '220ms' : '360ms');
            lamB._x.demora = lamB.muro ? 220 : 360;
          }
        }
        if (animar || primera) {
          if (primera && !QUIETO) { raiz.classList.remove('no-anim'); void raiz.offsetWidth; }
          aplicar(lamB, b.paso, !QUIETO && (animar || primera));
        } else {
          aplicar(lamB, b.paso, false);
          raiz.classList.remove('no-anim');
        }
      }

      pintarMarco(marco, VISTAS[b.vista], !primera);
      if (primera) marco.classList.add('marco-listo');
      red.activar(!!lamB.muro && !QUIETO);
      pos = nueva;
      const v = VISTAS[b.vista];
      const relativo = b.paso - v.desde;
      history.replaceState(null, '', `#${v.numero}${relativo ? '.' + relativo : ''}`);
      pintarNotas();
      avisarPresentador();
    }

    function irAVista(n, relativo = 0) {
      const v = VISTAS[n - 1];
      if (!v) return;
      const destino = PASOS.findIndex(e => e.vista === n - 1 && e.paso === v.desde + relativo);
      ir(destino < 0 ? PASOS.findIndex(e => e.vista === n - 1) : destino, { instantaneo: true });
    }

    const siguiente = () => ir(pos + 1);
    const anterior = () => ir(pos - 1);

    addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) { buffer += k; return; }
      if (k === 'Enter' && buffer) { irAVista(+buffer); buffer = ''; return; }
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); siguiente(); }
      else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); anterior(); }
      else if (k === 'Home') irAVista(1);
      else if (k === 'End') irAVista(VISTAS.length);
      // El botón de presentación de muchos señaladores envía F5: aquí no debe recargar la página.
      else if (k === 'f' || k === 'F' || k === 'F5') {
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {});
      }
      else if (k === 'n' || k === 'N') { notas = !notas; marco.querySelector('.capa-notas').classList.toggle('visible', !!notas); pintarNotas(); }
      else if (k === 'p' || k === 'P') {
        ventana = window.open(location.href.split(/[?#]/)[0] + '?modo=presentador', 'sipau-notas', 'width=1000,height=720');
      }
      else if (k === 'b' || k === 'B' || k === '.') marco.querySelector('.apagon').classList.toggle('visible');
      else if (k === '?') marco.querySelector('.capa-ayuda').classList.toggle('visible');
      else if (k === 'Escape') marco.querySelector('.capa-ayuda').classList.remove('visible');
      buffer = '';
    });

    escenario.addEventListener('click', e => {
      if (e.detail > 1) return;
      marco.querySelector('.capa-ayuda').classList.remove('visible');
      siguiente();
    });
    let toque = null;
    addEventListener('touchstart', e => { toque = e.changedTouches[0].clientX; }, { passive: true });
    addEventListener('touchend', e => {
      if (toque === null) return;
      const dx = e.changedTouches[0].clientX - toque;
      toque = null;
      if (dx < -60) siguiente();
      if (dx > 60) anterior();
    }, { passive: true });

    let reposo = 0;
    addEventListener('mousemove', () => {
      document.body.classList.remove('cursor-oculto');
      clearTimeout(reposo);
      reposo = setTimeout(() => document.body.classList.add('cursor-oculto'), 2200);
    });

    addEventListener('message', e => {
      if (!e.data || !e.data.sipau || !e.data.orden) return;
      if (e.data.orden === 'siguiente') siguiente();
      if (e.data.orden === 'anterior') anterior();
      if (e.data.orden === 'estado') avisarPresentador();
    });

    window.SIPAU = { ir, irAVista, siguiente, anterior, PASOS, VISTAS, estado: () => ({ pos, ...PASOS[pos] }) };

    const inicio = /^#(\d+)(?:\.(\d+))?$/.exec(location.hash);
    if (inicio) irAVista(+inicio[1], +(inicio[2] || 0)); else ir(0);
  }

  if (PRESENTADOR) modoPresentador();
  else if (IMPRIMIR) modoImpresion();
  else modoEscena();
})();
