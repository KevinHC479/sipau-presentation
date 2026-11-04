// Las láminas. Cada una entrega su HTML y, si hace falta, un gancho que anima sus pasos.
// data-en="k" muestra el elemento desde el paso k; data-hasta="k" lo retira después del paso k.
// Un gancho siempre deja primero el estado final del paso y sólo luego lo anima,
// así regresar, saltar de lámina o imprimir dan el mismo resultado.
(function () {
  'use strict';
  const D = window.SIPAU_DATOS;
  const I = window.SIPAU_ICONOS;

  const ic = (n, c) => `<svg class="ic${c ? ' ' + c : ''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${I[n] || ''}</svg>`;
  const fmt = (n, dec) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  const cifra = (n, o = {}) => `<span class="cifra" data-cifra="${n}"${o.dec ? ` data-dec="${o.dec}"` : ''}${o.pre ? ` data-pre="${o.pre}"` : ''}${o.suf ? ` data-suf="${o.suf}"` : ''}>${o.pre || ''}${fmt(n, o.dec)}${o.suf || ''}</span>`;
  const cabeza = (icono, titulo, sub) => `<div class="tarjeta-cab"><div class="insignia">${ic(icono)}</div><div><div class="tarjeta-tit">${titulo}</div>${sub ? `<div class="tarjeta-sub">${sub}</div>` : ''}</div></div>`;
  const vano = (v, en, d) => `<div class="vano r r-sube" data-en="${en}" style="--d:${d}ms"><div class="vano-et">${v.et}</div><div class="vano-cifra">${cifra(v.cifra, v)}</div><div class="vano-pie">${v.delta ? `<b>${v.delta}</b>` : ''}<span>${v.pie}</span></div></div>`;
  const escala = (d0, d1, r0, r1) => { const k = (r1 - r0) / (d1 - d0); return v => r0 + (v - d0) * k; };
  const linea = ps => ps.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  // Conector en ángulo recto con esquina redondeada: sale en horizontal, cambia de altura en xm y llega en horizontal.
  const codoH = (x1, y1, xm, y2, x2, r = 14) => {
    if (Math.abs(y1 - y2) < 1) return `M${x1},${y1} H${x2}`;
    const s = y2 > y1 ? 1 : -1;
    return `M${x1},${y1} H${xm - r} Q${xm},${y1} ${xm},${y1 + s * r} V${y2 - s * r} Q${xm},${y2} ${xm + r},${y2} H${x2}`;
  };
  // Lo mismo, de arriba a abajo. Es el trazo de las aristas del árbol.
  const codoV = (x1, y1, ym, x2, y2, r = 7) => {
    if (Math.abs(x1 - x2) < 1) return `M${x1},${y1} V${y2}`;
    const s = x2 > x1 ? 1 : -1;
    return `M${x1},${y1} V${ym - r} Q${x1},${ym} ${x1 + s * r},${ym} H${x2 - s * r} Q${x2},${ym} ${x2},${ym + r} V${y2}`;
  };

  /* ---------- Portada y cierre ---------- */

  const portada = {
    id: 'portada', muro: true, pasos: 0,
    vistas: [{ id: 'portada', desde: 0 }],
    html() {
      const P = D.proyecto;
      const letras = [...P.marca].map((l, i) => `<span class="letra" data-en="0" style="--d:${i * 70}ms"><b>${l}</b></span>`).join('');
      return `
        <h1 class="p-marca" aria-label="${P.marca}">${letras}</h1>
        <div class="p-regla r r-regla" data-en="0" style="--d:520ms"></div>
        <p class="p-nombre r r-barre" data-en="0" style="--d:640ms">${P.nombre}</p>
        <p class="p-para r r-sube" data-en="0" style="--d:920ms">${P.para}</p>
        <p class="p-lema r r-sube" data-en="0" style="--d:1120ms">${P.lema}</p>
        <figure class="p-placa r r-tinta" data-en="0" style="--d:760ms"><img src="assets/img/logo-upzmg.png" alt="Logotipo de la UPZMG"></figure>
        <footer class="p-pie r r-sube" data-en="0" style="--d:1320ms">
          <p class="p-autores">${P.autores}</p>
          <p class="p-asesor">${P.asesor}</p>
          <div class="p-inst"><span>${P.institucion}</span><span>${P.programa}</span></div>
        </footer>`;
    },
  };

  const cierre = {
    id: 'cierre', muro: true, pasos: 0,
    vistas: [{ id: 'cierre', desde: 0 }],
    html() {
      const P = D.proyecto;
      return `
        <h1 class="c-gracias r r-barre" data-en="0" style="--d:420ms">${D.cierre.gracias}</h1>
        <p class="c-preguntas r r-sube" data-en="0" style="--d:700ms">${D.cierre.preguntas}</p>
        <div class="c-regla r r-regla" data-en="0" style="--d:860ms"></div>
        <p class="c-marca r r-sube" data-en="0" style="--d:960ms">${P.marca}</p>
        <p class="c-nombre r r-sube" data-en="0" style="--d:1040ms">${P.nombre}</p>
        <p class="c-lema r r-sube" data-en="0" style="--d:1160ms">${P.lema}</p>
        <figure class="p-placa r r-tinta" data-en="0" style="--d:760ms"><img src="assets/img/logo-upzmg.png" alt="Logotipo de la UPZMG"></figure>
        <footer class="p-pie r r-sube" data-en="0" style="--d:1300ms">
          <p class="p-autores">${P.autores}</p>
          <p class="p-asesor">${P.asesor}</p>
          <div class="p-inst"><span>${P.institucion}</span><span>${P.programa}</span></div>
        </footer>`;
    },
  };

  /* ---------- 2 y 3: Una pregunta, tres respuestas; una base, una respuesta ---------- */

  const Y_AREAS = [56, 188, 320, 452, 584];
  const Y_REPORTES = [95, 320, 545];
  const RUTAS_IN = Y_AREAS.map(y => codoH(340, y, 440, 320, 538));
  const RUTAS_OUT = Y_REPORTES.map(y => codoH(978, 320, 1077, y, 1176));

  const concilia = {
    id: 'concilia', pasos: 3,
    vistas: [{ id: 'problema', desde: 0 }, { id: 'hipotesis', desde: 2 }],
    html() {
      const C = D.concilia;
      return `
        <div class="diagrama">
          <svg class="lineas" viewBox="0 0 1516 640" aria-hidden="true">
            ${RUTAS_IN.map((d, i) => `<path class="linea trazo" pathLength="1" d="${d}" data-en="0" style="--d:${320 + i * 90}ms"/>`).join('')}
            ${RUTAS_OUT.map((d, i) => `<path class="linea trazo" pathLength="1" d="${d}" data-en="1" style="--d:${i * 90}ms"/>`).join('')}
          </svg>
          <div class="capa-paq"></div>
          ${C.areas.map((a, i) => `<div class="area r r-entra" data-en="0" style="top:${Y_AREAS[i] - 56}px;--d:${i * 70}ms"><div class="insignia">${ic(a.icono)}</div><span>${a.nombre}</span></div>`).join('')}
          <div class="central r r-tinta" data-en="0" style="--d:520ms">
            <div class="central-cara" data-hasta="1">
              ${cabeza('EditNote', C.planeacion.titulo, C.planeacion.sub)}
              <div class="mano">
                <div class="mano-preg">${C.planeacion.pregunta}</div>
                ${C.planeacion.filas.map(f => `<div class="mano-fila"><span>${f[0]}</span><b class="tecleo" data-tx="${f[1]}">${f[1]}</b></div>`).join('')}
                <div class="mano-aviso">${ic('Info')}${C.planeacion.aviso}</div>
              </div>
            </div>
            <div class="central-cara r r-tinta" data-en="2" style="--d:200ms">
              ${cabeza('Storage', C.base.titulo, C.base.sub)}
              <ul class="base-puntos">${C.base.puntos.map((p, i) => `<li class="r r-sube" data-en="2" style="--d:${420 + i * 130}ms">${ic('CheckCircle')}<span>${p}</span></li>`).join('')}</ul>
            </div>
          </div>
          ${C.reportes.map((r, i) => `
            <div class="reporte r r-barre" data-en="1" style="top:${Y_REPORTES[i] - 95}px;--d:${220 + i * 140}ms">
              <div class="reporte-nom">${ic(r.icono)}${r.nombre}</div>
              <div class="reporte-preg">${C.pregunta}</div>
              <div class="reporte-fila">
                <span class="reporte-cifra" data-fin="${r.cifra}">${r.cifra}</span>
                <span class="sello rosa sello-no" data-hasta="1">${C.noCoincide}</span>
                <span class="sello nopal sello-si r r-tinta" data-en="2" style="position:absolute;right:20px;--d:760ms">${C.coincide}</span>
              </div>
            </div>`).join('')}
        </div>
        <div class="concilia-pie">
          <div class="franja r r-sube" data-en="1" data-hasta="1" style="--d:640ms">${ic('WarningAmber')}<span>${C.problema}</span></div>
          <div class="franja hip r r-sube" data-en="2" style="--d:300ms">
            <div class="hip-si">${C.si}</div>
            ${C.entonces.map((t, i) => `<div class="hip-col r r-sube" data-en="3" style="--d:${i * 150}ms">${ic('CheckCircle')}<span>${t}</span></div>`).join('')}
          </div>
        </div>`;
    },
    alPaso(x, paso, animar, antes) {
      const C = D.concilia;
      x.raiz.classList.toggle('es-base', paso >= 2);
      const cifras = x.qq('.reporte-cifra');
      cifras.forEach(el => { el.textContent = paso >= 2 ? C.unica : el.dataset.fin; });
      const tecleos = x.qq('.tecleo');
      tecleos.forEach(el => { el.textContent = el.dataset.tx; });

      if (animar && paso === 0) {
        // Planeación teclea lo que le dijo cada área, un número a la vez.
        tecleos.forEach(el => { el.textContent = ' '; });
        const cursor = document.createElement('i');
        cursor.className = 'cursor temporal';
        let t = 1250;
        tecleos.forEach(el => {
          x.tras(t, () => { el.textContent = ''; el.appendChild(cursor); });
          [...el.dataset.tx].forEach((c, i) => {
            t += 150;
            x.tras(t, () => { el.textContent = el.dataset.tx.slice(0, i + 1); el.appendChild(cursor); });
          });
          t += 420;
        });
      }
      if (animar && paso === 1) {
        cifras.forEach((el, i) => x.contar(el, 0, +el.dataset.fin, 1000, 240 + i * 140));
      }
      if (animar && paso === 2 && antes === 1) {
        // Las tres respuestas se vuelven una: cada número rueda hasta la cifra única.
        cifras.forEach((el, i) => x.contar(el, +el.dataset.fin, C.unica, 1100, 500 + i * 80));
      }
      if (x.vivo) {
        const clase = paso >= 2 ? 'anil' : '';
        const dur = paso >= 2 ? 1500 : 3000;
        RUTAS_IN.forEach((d, i) => x.paquete(x.q('.capa-paq'), d, { dur, desfase: 300 + i * (dur / 5), clase }));
        if (paso >= 1) RUTAS_OUT.forEach((d, i) => x.paquete(x.q('.capa-paq'), d, { dur: dur * .6, desfase: 500 + i * (dur / 8), clase }));
      }
    },
  };

  /* ---------- 4: Tablero de Control ---------- */

  function graficaCarreras() {
    const T = D.tablero.carreras;
    const W = 830, H = 490, x0 = 62, x1 = W - 10, y0 = H - 44, y1 = 26;
    const y = escala(0, 250, y0, y1);
    const slot = (x1 - x0) / T.datos.length, ancho = 112;
    const rejilla = [0, 50, 100, 150, 200, 250].map(v => `<line class="${v ? 'rejilla' : 'eje'}" x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}"/><text class="txt-grafica" x="${x0 - 12}" y="${y(v) + 7}" text-anchor="end">${v}</text>`).join('');
    const barras = T.datos.map((d, i) => {
      const cx = x0 + slot * (i + .5), left = cx - ancho / 2, top = y(d[1]);
      const barra = d[1] ? `<path class="r r-crece" data-en="0" style="--d:${620 + i * 130}ms" fill="#073B68" d="M${left},${y0} V${top + 4} Q${left},${top} ${left + 4},${top} H${left + ancho - 4} Q${left + ancho},${top} ${left + ancho},${top + 4} V${y0} Z"/>` : '';
      return `${barra}
        <text class="txt-valor r r-tinta" data-en="0" style="--d:${1000 + i * 130}ms" x="${cx}" y="${top - 12}" text-anchor="middle">${d[1]}</text>
        <text class="txt-grafica" x="${cx}" y="${H - 12}" text-anchor="middle">${d[0]}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${T.titulo}: ${T.datos.map(d => d[0] + ' ' + d[1]).join(', ')}">${rejilla}${barras}</svg>`;
  }

  function graficaIngreso() {
    const T = D.tablero.ingreso;
    const W = 580, H = 490, x0 = 46, x1 = W - 8, y0 = H - 44, y1 = 26;
    const y = escala(0, 80, y0, y1), x = escala(0, T.valores.length - 1, x0, x1);
    const ps = T.valores.map((v, i) => [x(i), y(v)]);
    const rejilla = [0, 20, 40, 60, 80].map(v => `<line class="${v ? 'rejilla' : 'eje'}" x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}"/><text class="txt-grafica" x="${x0 - 10}" y="${y(v) + 7}" text-anchor="end">${v}</text>`).join('');
    const marcas = T.marcas.map((m, i) => `<text class="txt-grafica" x="${x(m)}" y="${H - 12}" text-anchor="${i === 0 ? 'start' : i === T.marcas.length - 1 ? 'end' : 'middle'}">${T.etiquetas[m]}</text>`).join('');
    const ult = ps[ps.length - 1], caida = ps[18];
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${T.titulo}">
      ${rejilla}${marcas}
      <path class="r r-tinta" data-en="0" style="--d:1500ms" fill="rgba(7,59,104,.1)" d="${linea(ps)} L${x1},${y0} L${x0},${y0} Z"/>
      <path class="trazo" pathLength="1" data-en="0" style="--d:600ms;--dur:1.5s" stroke="#073B68" stroke-width="3" stroke-linejoin="round" d="${linea(ps)}"/>
      <g class="r r-tinta" data-en="0" style="--d:1500ms">
        <circle class="punto" cx="${ult[0]}" cy="${ult[1]}" r="6"/>
        <text class="txt-valor" x="${ult[0] - 10}" y="${ult[1] - 14}" text-anchor="end">66</text>
        <circle class="punto" cx="${caida[0]}" cy="${caida[1]}" r="6"/>
        <text class="txt-grafica" x="${caida[0] - 12}" y="${caida[1] + 6}" text-anchor="end" style="fill:#142B42">${T.etiquetas[18]}: 11</text>
      </g>
    </svg>`;
  }

  function serieVano() {
    const v = D.tablero.ingreso.valores, W = 184, H = 66;
    const x = escala(0, v.length - 1, 0, W), y = escala(0, 70, H, 2);
    return `<svg class="vano-serie" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="trazo" pathLength="1" data-en="0" style="--d:500ms;--dur:1.3s" stroke="#073B68" stroke-width="2" d="${linea(v.map((n, i) => [x(i), y(n)]))}"/></svg>`;
  }

  const tablero = {
    id: 'tablero', pasos: 0,
    vistas: [{ id: 'tablero', desde: 0 }],
    html() {
      const T = D.tablero;
      return `
        <div class="tab-vanos">${T.vanos.map((v, i) => {
          const html = vano(v, 0, i * 90);
          return v.serie ? html.replace('<div class="vano-pie">', serieVano() + '<div class="vano-pie">') : html;
        }).join('')}</div>
        <div class="tarjeta tab-a r r-sube" data-en="0" style="--d:320ms">${cabeza('School', T.carreras.titulo, T.carreras.sub)}<div class="grafica">${graficaCarreras()}</div></div>
        <div class="tarjeta tab-b r r-sube" data-en="0" style="--d:420ms">${cabeza('ShowChart', T.ingreso.titulo, T.ingreso.sub)}<div class="grafica">${graficaIngreso()}</div></div>`;
    },
  };

  /* ---------- 5: Importación masiva ---------- */

  const importacion = {
    id: 'importacion', pasos: 1,
    vistas: [{ id: 'importacion', desde: 0 }],
    html() {
      const M = D.importacion;
      const base = 520, cada = 340;
      return `
        <div class="tarjeta imp-csv r r-entra" data-en="0">
          ${cabeza('UploadFile', M.archivo, M.archivoSub)}
          <div class="csv">
            <div class="csv-enc">${M.encabezado}</div>
            ${M.filas.map((f, i) => `<div class="csv-l ${f.ok ? 'bien' : 'mal'}" data-en="0" style="--d:${base + i * cada}ms"><i>${f.fila}</i>${f.csv}</div>`).join('')}
            <div class="csv-barra" data-en="0" style="--dg:${base}ms"></div>
          </div>
        </div>
        <div class="tarjeta imp-rev r r-sube" data-en="0" style="--d:180ms">
          ${cabeza('FactCheck', M.tituloRevision, M.subRevision)}
          <div class="rev-tabla">
            ${M.filas.map((f, i) => `
              <div class="rev-fila r r-barre" data-en="0" style="--d:${base + 120 + i * cada}ms">
                <span class="rev-num">${f.fila}</span>
                <span class="rev-nom">${f.alumno}</span>
                <span class="sello ${f.ok ? 'nopal' : 'rosa'}">${f.ok ? M.aceptada : M.rechazada}</span>
                <span class="rev-res">${f.ok ? '' : f.motivo}</span>
              </div>`).join('')}
          </div>
          <div class="rev-resumen r r-tinta" data-en="0" style="--d:${base + 7 * cada}ms"><b class="v">${M.resumen[0]}</b>${M.resumen[1]}<b class="x">${M.resumen[2]}</b>${M.resumen[3]}</div>
        </div>
        <div class="imp-hechos">
          ${M.hechos.map((h, i) => `<div class="hecho r r-sube" data-en="1" style="--d:${i * 130}ms"><b>${cifra(h.cifra, h)}</b><span>${h.texto}</span></div>`).join('')}
        </div>`;
    },
  };

  /* ---------- 6: Arquitectura ---------- */

  const X_ARQ = [0, 415, 829, 1244];
  const RUTA_ARQ = 'M136,278 H1380';

  const arquitectura = {
    id: 'arquitectura', pasos: 2,
    vistas: [{ id: 'arquitectura', desde: 0 }],
    html() {
      const A = D.arquitectura;
      const arco = 'M551,112 V58 Q551,44 565,44 H1366 Q1380,44 1380,58 V112';
      return `
        <div class="arq">
          <svg class="lineas" viewBox="0 0 1516 460" aria-hidden="true">
            ${[0, 1, 2].map(i => `<path class="arq-linea trazo" pathLength="1" data-en="0" style="--d:${420 + i * 180}ms" d="M${X_ARQ[i] + 272},278 H${X_ARQ[i + 1]}"/>`).join('')}
            <path class="arq-veto trazo" pathLength="1" data-en="1" d="${arco}" style="--dur:1.1s"/>
          </svg>
          <div class="capa-paq"></div>
          ${A.nodos.map((n, i) => `
            <div class="nodo-arq r r-sube" data-en="0" style="left:${X_ARQ[i]}px;--d:${i * 110}ms">
              <div class="insignia">${ic(n.icono)}</div>
              <h3>${n.nombre}</h3>
              <p>${n.detalle}</p>
              ${i === 2 ? `<div class="arq-permiso r r-tinta" data-en="2">${ic('Shield')}${A.permiso}</div>` : ''}
            </div>`).join('')}
          ${A.enlaces.map((t, i) => `<div class="enlace r r-tinta" data-en="0" style="left:${X_ARQ[i] + 272}px;--d:${620 + i * 180}ms">${t}</div>`).join('')}
          <div class="veto r r-barre" data-en="1" style="--d:420ms">${ic('Cancel')}${A.veto}</div>
          <div class="arq-cifras">${A.cifras.map((c, i) => vano(c, 2, 200 + i * 90)).join('')}</div>
          <div class="arq-efecto franja r r-sube" data-en="2" style="--d:700ms">${ic('Key')}<span>${A.efecto}</span></div>
        </div>`;
    },
    alPaso(x, paso) {
      if (x.vivo) x.paquete(x.q('.capa-paq'), RUTA_ARQ, { dur: 3000, desfase: 900, clase: 'anil', suave: true });
    },
  };

  /* ---------- 7: Formatos ---------- */

  const formatos = {
    id: 'formatos', pasos: 2,
    vistas: [{ id: 'formatos', desde: 0 }],
    html() {
      const F = D.formatos;
      const codigo = F.codigo.map(l => {
        const tramos = l.p.map(t => `<span class="${t[1]}">${[...t[0]].map(c => `<i>${c === '<' ? '&lt;' : c}</i>`).join('')}</span>`).join('');
        return `<span class="fmt-linea"${l.al ? ` data-al="${l.al}"` : ''}>${tramos}</span>\n`;
      }).join('');
      const celda = (r, c) => `<td><div class="fmt-input" data-r="${r}" data-c="${c}"></div></td>`;
      return `
        <div class="fmt-codigo r r-entra" data-en="0">
          <div class="fmt-tab"><span>${ic('DataObject')}${F.archivo}</span><em>${F.fragmento}</em></div>
          <pre class="fmt-pre">${codigo}</pre>
        </div>
        <div class="tarjeta fmt-form r r-sube" data-en="0" style="--d:160ms">
          <div class="fmt-preg fmt-pieza" data-parte="titulo">${F.pregunta}<span class="fmt-req fmt-pieza" data-parte="requerido">*</span></div>
          <div class="fmt-tabla fmt-pieza" data-parte="tabla">
            <table>
              <thead><tr>
                <th></th>
                ${F.columnas.map(c => `<th class="fmt-pieza" data-parte="columnas">${c}</th>`).join('')}
                <th class="fmt-pieza" data-parte="totalRenglon">${F.totalRenglon}</th>
              </tr></thead>
              <tbody>
                ${F.renglones.map((n, r) => `
                  <tr class="fmt-pieza" data-parte="renglones"><td>${n}</td>
                    ${F.columnas.map((_, c) => celda(r, c)).join('')}
                    <td class="fmt-pieza" data-parte="totalRenglon"><div class="fmt-calc" data-tr="${r}">0</div></td>
                  </tr>`).join('')}
                <tr class="fmt-pieza" data-parte="totalColumna"><td>${F.totalColumna}</td>
                  ${F.columnas.map((_, c) => `<td><div class="fmt-calc" data-tc="${c}">0</div></td>`).join('')}
                  <td><div class="fmt-calc" data-tg="1">0</div></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="fmt-ayuda r r-tinta" data-en="1" style="--d:700ms">${F.ayuda} ${F.ejemplo}.</p>
          <div class="fmt-puerta">
            <div><div class="fmt-puerta-tit">${F.puertaTitulo}</div><div class="fmt-estado falta">${ic('Error')}<span>${F.falta}</span></div></div>
            <span class="fmt-boton">${F.boton}</span>
          </div>
        </div>
        <div class="fmt-pie">
          ${F.cifras.map((c, i) => `<div class="hecho r r-sube" data-en="2" style="--d:${i * 110}ms"><b>${cifra(c.cifra)}</b><span>${c.texto}</span></div>`).join('')}
          <div class="fmt-remate r r-barre" data-en="2" style="--d:380ms">${F.remate}</div>
        </div>`;
    },
    alPaso(x, paso, animar) {
      const F = D.formatos;
      const piezas = x.qq('[data-parte]');
      const chars = x.qq('.fmt-pre i');
      const estado = x.q('.fmt-estado');
      const ponerEstado = ok => {
        estado.className = 'fmt-estado ' + (ok ? 'listo' : 'falta');
        estado.innerHTML = ic(ok ? 'CheckCircle' : 'Error') + `<span>${ok ? F.listo : F.falta}</span>`;
      };
      const totales = () => {
        const v = x.qq('.fmt-input').map(el => ({ r: +el.dataset.r, c: +el.dataset.c, n: +el.textContent || 0 }));
        F.renglones.forEach((_, r) => { x.q(`[data-tr="${r}"]`).textContent = v.filter(e => e.r === r && e.c < 2).reduce((s, e) => s + e.n, 0); });
        F.columnas.forEach((_, c) => { x.q(`[data-tc="${c}"]`).textContent = v.filter(e => e.c === c).reduce((s, e) => s + e.n, 0); });
        x.q('[data-tg]').textContent = v.filter(e => e.c < 2).reduce((s, e) => s + e.n, 0);
      };
      const llenar = lleno => {
        x.qq('.fmt-input').forEach(el => { el.classList.remove('foco'); el.textContent = lleno ? F.valores[+el.dataset.r][+el.dataset.c] : ''; });
        totales();
        ponerEstado(lleno);
      };

      // Estado final del paso.
      chars.forEach(c => { c.classList.add('v'); c.classList.remove('cur'); });
      piezas.forEach(p => p.classList.add('listo'));
      llenar(paso >= 1);

      if (animar && paso === 0) {
        // El archivo se escribe, y la pantalla se arma conforme aparece cada línea.
        chars.forEach(c => c.classList.remove('v'));
        piezas.forEach(p => p.classList.remove('listo'));
        let t = 450, previo = null;
        x.qq('.fmt-linea').forEach(l => {
          [...l.querySelectorAll('i')].forEach(c => {
            t += c.parentElement.className === '' ? 2 : 13;
            x.tras(t, () => { c.classList.add('v', 'cur'); if (previo) previo.classList.remove('cur'); previo = c; });
          });
          t += 90;
          if (l.dataset.al) {
            x.tras(t, () => x.qq(`[data-parte="${l.dataset.al}"]`).forEach(p => p.classList.add('listo')));
            t += 120;
          }
        });
        x.tras(t + 500, () => { if (previo) previo.classList.remove('cur'); });
      }
      if (animar && paso === 1) {
        // Se capturan las celdas una por una; los totales se calculan solos.
        llenar(false);
        const celdas = x.qq('.fmt-input');
        let t = 400;
        celdas.forEach((el, i) => {
          x.tras(t, () => { celdas.forEach(c => c.classList.remove('foco')); el.classList.add('foco'); });
          t += 150;
          x.tras(t, () => {
            el.textContent = F.valores[+el.dataset.r][+el.dataset.c];
            totales();
          });
          t += 90;
        });
        x.tras(t + 180, () => { celdas.forEach(c => c.classList.remove('foco')); ponerEstado(true); });
      }
    },
  };

  /* ---------- 8: Informe de Junta ---------- */

  const informe = {
    id: 'informe', pasos: 2,
    vistas: [{ id: 'informe', desde: 0 }],
    html() {
      const N = D.informe;
      return `
        <div class="tarjeta inf-lista r r-entra" data-en="0">
          ${cabeza('Article', N.tituloFormatos, N.subFormatos)}
          <div>
            ${N.formatos.map((f, i) => `
              <div class="inf-fila${f.fuente ? ' fuente' : ''} r r-barre" data-en="0" style="--d:${220 + i * 120}ms">
                <span>${f.nombre}</span>
                <span class="sello ${f.enviado ? 'nopal' : 'ambar'}">${f.enviado ? N.enviado : N.borrador}</span>
              </div>`).join('')}
          </div>
          <div class="inf-cap r r-sube" data-en="2">
            <div class="inf-cap-fila">${N.capitulos.map((c, i) => `<span class="${c === N.capituloPendiente ? 'pend' : ''}">${c}</span>`).join('')}</div>
            <p>${ic('HourglassBottom')}${N.pendienteTexto}</p>
          </div>
        </div>
        <div class="inf-ventana r r-sube" data-en="0" style="--d:260ms">
          <div class="ventana-cab"><span>${N.ventana}</span><em>${N.captura}</em></div>
          <div class="inf-visor">
            <div class="inf-camara">
              <img src="assets/img/informe-fuente.png" alt="Captura del informe a la Junta: la línea de fuente cita el Formato 911.10, enviado el 05/10/2026 por admin@upzmg.local">
              <div class="inf-marca r r-tinta" data-en="1" style="--d:1100ms"></div>
            </div>
          </div>
        </div>
        <div class="franja inf-franja r r-sube" data-en="1" style="--d:500ms">
          <div data-hasta="1">${N.fuente}</div>
          <div class="r r-sube" data-en="2" style="--d:240ms"><b>${N.remate}</b></div>
        </div>`;
    },
    alPaso(x, paso) {
      x.q('.inf-camara').classList.toggle('acerca', paso >= 1);
      x.q('.inf-fila.fuente').classList.toggle('resaltada', paso >= 1);
    },
  };

  /* ---------- 9 y 10: Distribuido ---------- */

  const Y_DIS = [0, 236, 472];
  const RUTA_WEB_API = 'M220,168 V236';
  const RUTA_API_SQL = 'M220,404 V472';

  const distribuido = {
    id: 'distribuido', pasos: 4,
    vistas: [{ id: 'caida', desde: 0 }, { id: 'choques', desde: 3 }],
    html() {
      const S = D.distribuido;
      const carriles = Array.from({ length: S.capturas }, (_, i) => i + 1);
      const yCarril = n => 4 + (n - 1) * 40;
      return `
        <div class="dis-a" data-hasta="2">
          <svg class="dis-lineas" viewBox="0 0 440 640" aria-hidden="true">
            <path class="dis-linea trazo enlace-web" pathLength="1" data-en="0" style="--d:300ms" d="${RUTA_WEB_API}"/>
            <path class="dis-linea trazo enlace-sql" pathLength="1" data-en="0" style="--d:420ms" d="${RUTA_API_SQL}"/>
          </svg>
          ${S.nodos.map((n, i) => `
            <div class="dis-nodo r r-entra${i === 1 ? ' nodo-api' : ''}" data-en="0" style="top:${Y_DIS[i]}px;--d:${i * 90}ms">
              <div class="dis-nodo-cab"><div class="insignia">${ic(n.icono)}</div><div><h3>${n.nombre}</h3><p>${n.detalle}</p></div></div>
              <span class="sello ${i === 1 ? 'sello-api nopal' : 'nopal'}">${S.enMarcha}</span>
            </div>`).join('')}
          <div class="capa-paq capa-dis"></div>
          <div class="dis-ventana r r-sube" data-en="0" style="--d:220ms">
            <div class="ventana-cab"><span>${S.direccion}</span><span class="sello nopal">${S.sesion}</span></div>
            <div class="dis-visor">
              <img class="vista-bien" src="assets/img/tablero-bien.png" alt="Tablero de Control con todas sus cifras">
              <img class="vista-caida" src="assets/img/tablero-caida.png" alt="Tablero con el aviso: No se pudieron cargar las cifras. El sistema no respondió. Vuelve a intentarlo en un momento; si sigue así, avisa a Tecnologías." style="opacity:0">
            </div>
          </div>
          <div class="dis-texto">
            ${S.textos.map((t, i) => `<div class="franja r r-sube" data-en="${i}"${i < 2 ? ` data-hasta="${i}"` : ''} style="--d:${i ? 500 : 420}ms">${ic(['Hub', 'WarningAmber', 'Refresh'][i])}<span>${t}</span></div>`).join('')}
          </div>
        </div>
        <div class="dis-b">
          <div class="car">
            ${carriles.map(n => `
              <div class="car-carril${n === S.ganador ? ' gana' : ''}" data-en="3" style="top:${yCarril(n)}px">
                <span class="car-et">Captura ${n}</span>
                <div class="car-pista"><i class="car-paq"></i></div>
              </div>
              <div class="car-res" style="top:${yCarril(n)}px"><span class="sello ${n === S.ganador ? 'nopal' : 'ambar'}" data-res="${n}">${n === S.ganador ? S.guardada : S.conflicto}</span></div>`).join('')}
            <div class="car-puerta r r-cae" data-en="3" style="--d:60ms">${ic('Key')}<b>${S.puerta}</b><span>${S.puertaSub}</span></div>
          </div>
          <div class="car-herr">
            ${S.herramientas.map((h, i) => `<div class="herr r r-sube" data-en="4" style="--d:${i * 120}ms"><code>${h.nombre}</code><p>${h.cuando}</p></div>`).join('')}
            <div class="herr herr-prueba r r-sube" data-en="4" style="--d:360ms"><b>${cifra(S.pruebas.cifra)}</b><p>${S.pruebas.texto}</p></div>
          </div>
        </div>`;
    },
    alPaso(x, paso, animar) {
      const S = D.distribuido;
      const caida = paso === 1;
      const api = x.q('.nodo-api'), sello = x.q('.sello-api');
      api.classList.toggle('caido', caida);
      sello.className = 'sello sello-api ' + (caida ? 'rosa' : 'nopal');
      sello.textContent = caida ? S.detenida : S.enMarcha;
      x.qq('.enlace-web, .enlace-sql').forEach(l => l.classList.toggle('cortada', caida));
      x.q('.vista-caida').style.opacity = caida ? 1 : 0;

      // Carrera de capturas.
      const carriles = x.qq('.car-carril'), resultados = x.qq('[data-res]');
      resultados.forEach(r => { r.style.visibility = paso >= 3 ? 'visible' : 'hidden'; });
      if (animar && paso === 3) {
        const G = S.ganador;
        const orden = [8, 3, 11, 1, 6, 12, 2, 9, 4, 10, 7];   // quién llega después del ganador
        resultados.forEach(r => { r.style.visibility = 'hidden'; });
        carriles.forEach((c, i) => {
          const n = i + 1, p = c.querySelector('.car-paq');
          const dur = n === G ? 620 : 760 + orden.indexOf(n) * 62;
          x.animar(p, [{ transform: 'translateX(0)', background: '#7D8C9B' }, { transform: 'translateX(860px)', background: '#7D8C9B' }], { duration: dur, delay: 260, easing: 'cubic-bezier(.3,.1,.5,1)', fill: 'backwards' });
          x.tras(260 + dur, () => { x.q(`[data-res="${n}"]`).style.visibility = 'visible'; });
        });
      }

      if (x.vivo && paso <= 2) {
        const capa = x.q('.capa-dis');
        if (caida) {
          // Las peticiones llegan a la API y no encuentran a nadie.
          x.paquete(capa, RUTA_WEB_API, { dur: 1300, desfase: 150, clase: 'rosa' });
        } else {
          x.paquete(capa, RUTA_WEB_API, { dur: 1100, desfase: 200, clase: 'anil' });
          x.paquete(capa, RUTA_API_SQL, { dur: 1100, desfase: 750, clase: 'anil' });
        }
      }
    },
  };

  /* ---------- 11: Árbol ---------- */

  function colocarArbol() {
    // Cada hoja toma una columna; cada nodo se centra sobre sus dos hijos.
    const ANCHO = 80, Y = [4, 146, 288, 430, 572];
    let col = 0;
    const nodos = [];
    (function visitar(n, ruta, prof) {
      const nodo = { ...n, ruta, prof, y: Y[prof] };
      if (n.l) {
        const a = visitar(n.l, ruta + 'l', prof + 1), b = visitar(n.r, ruta + 'r', prof + 1);
        nodo.x = (a.x + b.x) / 2; nodo.hijos = [a, b];
      } else {
        nodo.x = (col++ + .5) * ANCHO;
      }
      nodos.push(nodo);
      return nodo;
    })(D.arbol.raiz, '', 0);
    return nodos;
  }

  function dibujarArbol() {
    const A = D.arbol, nodos = colocarArbol();
    const ALTO = 62, W_NODO = 138, W_HOJA = 72;
    const aristas = nodos.filter(n => n.hijos).flatMap(n => n.hijos.map(h => ({ d: codoV(n.x, n.y + ALTO, n.y + ALTO + (h.y - n.y - ALTO) / 2, h.x, h.y), ruta: h.ruta, prof: h.prof })));
    const bases = aristas.map(a => `<path class="arista trazo" pathLength="1" data-en="0" style="--d:${a.prof * 300 - 120}ms;--dur:.6s" d="${a.d}"/>`).join('');
    const pasos = aristas.filter(a => A.camino.startsWith(a.ruta)).map(a => `<path class="arista arista-paso trazo paso-${a.ruta.length}" pathLength="1" d="${a.d}" style="--dur:.5s"/>`).join('');
    const cajas = nodos.map(n => {
      const hoja = !n.hijos, w = hoja ? W_HOJA : W_NODO, alerta = hoja && n.p >= A.umbral;
      const texto = hoja
        ? `<text class="n1" x="${n.x}" y="${n.y + 27}">${Math.round(n.p * 100)} %</text><text x="${n.x}" y="${n.y + 50}">${n.b} de ${n.n}</text>`
        : n.t === undefined
          ? `<text x="${n.x}" y="${n.y + 38}" style="font-size:21px">${n.f}</text>`
          : `<text x="${n.x}" y="${n.y + 25}">${n.f}</text><text class="n2" x="${n.x}" y="${n.y + 50}">≤ ${n.t}</text>`;
      return `<g class="nodo-g${hoja ? ' hoja-arbol' : ''}${alerta ? ' alerta' : ''}" data-en="0" data-ruta="${n.ruta}" style="--d:${n.prof * 300}ms"><rect x="${n.x - w / 2}" y="${n.y}" width="${w}" height="${ALTO}" rx="4"/>${texto}</g>`;
    }).join('');
    // Las respuestas se escriben junto a cada arista del camino.
    const resp = A.pasos.map((p, i) => {
      const ruta = A.camino.slice(0, i + 1);
      const h = nodos.find(n => n.ruta === ruta), padre = nodos.find(n => n.ruta === ruta.slice(0, -1));
      const yt = padre.y + ALTO + (h.y - padre.y - ALTO) / 2 - 8;
      return `<text class="resp resp-${i}" x="${(h.x + padre.x) / 2}" y="${yt}" text-anchor="middle">${p[1]}</text>`;
    }).join('');
    return `<svg class="arbol-svg" viewBox="0 0 1040 640" role="img" aria-label="Árbol de decisión publicado por el sistema, con 13 hojas. La raíz pregunta si el promedio es de 6.77 o menos.">${bases}${pasos}${cajas}${resp}</svg>`;
  }

  const arbol = {
    id: 'arbol', pasos: 2,
    vistas: [{ id: 'arbol', desde: 0 }],
    html() {
      const A = D.arbol;
      return `
        ${dibujarArbol()}
        <div class="arbol-leyenda r r-tinta" data-en="0" data-hasta="1" style="--d:1300ms">
          <span>${A.leyenda[0]}</span>
          <span><i></i>${A.leyenda[1]}</span>
          <span>${A.leyenda[2]}</span>
        </div>
        <div class="arbol-fugas r r-sube" data-en="2" style="--d:380ms">
          <h3>${A.fugas.titulo}</h3>
          <ul>${A.fugas.lista.map((t, i) => `<li class="r r-sube" data-en="2" style="--d:${500 + i * 90}ms">${ic('Shield')}<span>${t}</span></li>`).join('')}</ul>
        </div>
        <div class="tarjeta arbol-alumno r r-barre" data-en="1">
          ${cabeza('PersonSearch', A.alumno.titulo, A.alumno.sub)}
          <div class="alumno-prom">${A.alumno.promedio}</div>
          <div class="alumno-pasos">${A.pasos.map((p, i) => `<div class="alumno-paso" data-i="${i}"><span>${p[0]}</span><b>${p[1]}</b></div>`).join('')}</div>
          <div class="alumno-res">
            <div class="alumno-res-cifra"><b>${A.resultado.riesgo} %</b><span class="sello rosa">${A.resultado.nivel}</span></div>
            <p><b>${A.resultado.regla}</b></p>
            <p>${A.resultado.respaldo}.</p>
            <p>${A.resultado.intervalo}.</p>
          </div>
        </div>
        <div class="tarjeta arbol-imp r r-sube" data-en="2">
          ${cabeza('Balance', A.importancia.titulo, A.importancia.sub)}
          <div class="imp-barras">${A.importancia.datos.map((d, i) => `<div class="imp-barra"><span>${d[0]}</span><span><i class="r r-ancho" data-en="2" style="width:${d[1]}%;--d:${240 + i * 90}ms"></i></span><b>${d[1]} %</b></div>`).join('')}</div>
        </div>`;
    },
    alPaso(x, paso, animar, antes) {
      const A = D.arbol;
      const rutas = [''].concat([...A.camino].map((_, i) => A.camino.slice(0, i + 1)));
      const nodoDe = r => x.q(`.nodo-g[data-ruta="${r}"]`);
      const pisar = (i, si) => {
        const n = nodoDe(rutas[i]);
        if (n) n.classList.toggle('pisado', si);
        if (i > 0) {
          x.qq(`.paso-${i}`).forEach(p => p.classList.toggle('on', si));
          const t = x.q(`.resp-${i - 1}`);
          if (t) t.style.opacity = si ? 1 : 0;
          const f = x.q(`.alumno-paso[data-i="${i - 1}"]`);
          if (f) f.style.visibility = si ? 'visible' : 'hidden';
        }
      };
      const res = x.q('.alumno-res');
      rutas.forEach((_, i) => pisar(i, paso >= 1));
      res.style.visibility = paso >= 1 ? 'visible' : 'hidden';

      if (animar && paso === 1 && antes < 1) {
        rutas.forEach((_, i) => pisar(i, false));
        res.style.visibility = 'hidden';
        rutas.forEach((_, i) => x.tras(620 + i * 620, () => pisar(i, true)));
        x.tras(620 + rutas.length * 620, () => {
          res.style.visibility = 'visible';
          x.animar(res, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 800, easing: 'cubic-bezier(.16,1,.3,1)' });
          const b = res.querySelector('b');
          x.contar(b, 0, A.resultado.riesgo, 700, 0, { suf: ' %' });
        });
      }
    },
  };

  /* ---------- 12: Qué tan bien acierta ---------- */

  // Geometría de la matriz, en pixeles del área de contenido.
  const MATRIZ = {
    filaEt: 120, x: [128, 532], y: [44, 426], ancho: 396, alto: 372,
    celdas: { vp: [0, 0], fn: [1, 0], fp: [0, 1], vn: [1, 1] },
  };
  const COLOR = { base: [195, 208, 222], baja: [7, 59, 104], vp: [22, 116, 81], fn: [185, 56, 84], fp: [201, 130, 17], vn: [156, 195, 178] };

  function repartir() {
    const C = D.acierta.celdas, total = D.acierta.total;
    // Mezcla fija: las bajas salen dispersas, siempre en los mismos lugares.
    let s = 20261105;
    const azar = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const orden = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) { const j = Math.floor(azar() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
    const clases = [];
    ['vp', 'fn', 'fp', 'vn'].forEach(k => { for (let i = 0; i < C[k]; i++) clases.push(k); });
    const cuenta = { vp: 0, fn: 0, fp: 0, vn: 0 };
    const cuadros = new Array(total);
    orden.forEach((pos, i) => {
      const clase = clases[i], k = cuenta[clase]++;
      const [cx, cy] = MATRIZ.celdas[clase];
      cuadros[pos] = {
        clase,
        baja: clase === 'vp' || clase === 'fn',
        g: { x: 240 + (pos % 26) * 40, y: 14 + Math.floor(pos / 26) * 40, s: 32 },
        m: { x: MATRIZ.x[cx] + 18 + (k % 26) * 14, y: MATRIZ.y[cy] + 134 + Math.floor(k / 26) * 14, s: 11 },
        azar: azar(),
      };
    });
    return cuadros;
  }

  const mezcla = (a, b, t) => a + (b - a) * t;
  const colorDe = (a, b, t) => `rgb(${Math.round(mezcla(a[0], b[0], t))},${Math.round(mezcla(a[1], b[1], t))},${Math.round(mezcla(a[2], b[2], t))})`;
  const salida = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function pintarCuadros(canvas, cuadros, f) {
    const g = canvas.getContext('2d'), k = canvas.width / 1516;
    g.setTransform(k, 0, 0, k, 0, 0);
    g.clearRect(0, 0, 1516, 810);
    cuadros.forEach((c, i) => {
      const e = f(c, i);
      if (e.a <= 0) return;
      g.globalAlpha = e.a;
      g.fillStyle = e.c;
      const r = Math.min(3, e.s * .14);
      g.beginPath();
      g.roundRect(e.x, e.y, e.s, e.s, r);
      g.fill();
    });
    g.globalAlpha = 1;
  }

  const acierta = {
    id: 'acierta', pasos: 3,
    vistas: [{ id: 'acierta', desde: 0 }],
    html() {
      const A = D.acierta, M = MATRIZ;
      const celda = (k, clase) => {
        const [cx, cy] = M.celdas[k];
        return `<div class="ac-celda ${clase} ${k} r r-tinta" data-en="2" style="left:${M.x[cx]}px;top:${M.y[cy]}px;--d:320ms"><b>${cifra(A.celdas[k])}</b><span>${A.etiquetas[k]}</span></div>`;
      };
      return `
        <p class="ac-frase r r-sube" data-en="0" data-hasta="1" style="--d:760ms"><b>${A.frase0[0]}</b>${A.frase0[1]}</p>
        <p class="ac-frase dos r r-sube" data-en="1" data-hasta="1" style="--d:500ms"><b>${A.frase1[0]}</b>${A.frase1[1]}</p>
        ${A.columnas.map((c, i) => `<div class="ac-col r r-tinta" data-en="2" style="left:${M.x[i]}px;--d:200ms">${c}</div>`).join('')}
        ${A.filas.map((f, i) => `<div class="ac-fila r r-tinta" data-en="2" style="top:${M.y[i]}px;height:${M.alto}px;--d:200ms"><span>${f[0]}</span><b>${f[1]}</b></div>`).join('')}
        ${celda('vp', 'nopal')}${celda('fn', 'rosa')}${celda('fp', 'ambar')}${celda('vn', 'nopal')}
        <canvas class="cuadros" width="3032" height="1620"></canvas>
        <div class="ac-kpis">
          ${A.indicadores.map((k, i) => `
            <div class="kpi r r-entra" data-en="3" style="--d:${i * 110}ms">
              <div class="kpi-cifra"><span>${k.et}</span><b>${cifra(k.cifra, k)}</b></div>
              <div><p>${k.texto}</p>${k.ic ? `<small>${k.ic}</small>` : ''}</div>
            </div>`).join('')}
          <div class="ac-remate r r-barre" data-en="3" style="--d:520ms"><p>${A.umbral}</p><p>${A.remate}</p></div>
        </div>`;
    },
    alPaso(x, paso, animar, antes) {
      const canvas = x.q('.cuadros');
      const cuadros = x.datos.cuadros || (x.datos.cuadros = repartir());
      const estado = (c, p) => {
        if (p >= 2) return { x: c.m.x, y: c.m.y, s: c.m.s, c: colorDe(COLOR[c.clase], COLOR[c.clase], 1), a: 1 };
        return { x: c.g.x, y: c.g.y, s: c.g.s, c: p === 1 && c.baja ? colorDe(COLOR.baja, COLOR.baja, 1) : colorDe(COLOR.base, COLOR.base, 1), a: 1 };
      };
      pintarCuadros(canvas, cuadros, c => estado(c, paso));
      if (!animar) return;

      if (paso === 0) {
        // Los cuadros entran de izquierda a derecha.
        const inicio = performance.now();
        x.cuadro(ahora => {
          const t = ahora - inicio;
          pintarCuadros(canvas, cuadros, (c, i) => {
            const col = i % 26, loc = Math.max(0, Math.min(1, (t - 180 - col * 22 - (i / 26 | 0) * 8) / 420)), e = salida(loc);
            return { x: c.g.x - (1 - e) * 26, y: c.g.y, s: c.g.s, c: colorDe(COLOR.base, COLOR.base, 1), a: loc > 0 ? e : 0 };
          });
          return t < 1300;
        });
      }
      if (paso === 1) {
        // Las 47 bajas se oscurecen, y crecen un instante para que el ojo las encuentre.
        const inicio = performance.now();
        x.cuadro(ahora => {
          const t = ahora - inicio;
          pintarCuadros(canvas, cuadros, c => {
            if (!c.baja) return { x: c.g.x, y: c.g.y, s: c.g.s, c: colorDe(COLOR.base, COLOR.base, 1), a: 1 };
            const loc = Math.max(0, Math.min(1, (t - c.azar * 520) / 460)), e = salida(loc), ex = Math.sin(Math.min(1, loc * 1.3) * Math.PI) * 5;
            return { x: c.g.x - ex, y: c.g.y - ex, s: c.g.s + ex * 2, c: colorDe(COLOR.base, COLOR.baja, e), a: 1 };
          });
          return t < 1100;
        });
      }
      if (paso === 2 && antes === 1) {
        // Cada cuadro vuela a la casilla de lo que le pasó.
        const inicio = performance.now();
        x.cuadro(ahora => {
          const t = ahora - inicio;
          pintarCuadros(canvas, cuadros, c => {
            const prev = estado(c, 1), loc = Math.max(0, Math.min(1, (t - c.azar * 620) / 1050)), e = salida(loc);
            const desde = c.baja ? COLOR.baja : COLOR.base;
            return { x: mezcla(prev.x, c.m.x, e), y: mezcla(prev.y, c.m.y, e), s: mezcla(prev.s, c.m.s, e), c: colorDe(desde, COLOR[c.clase], e), a: 1 };
          });
          return t < 1700;
        });
      }
    },
  };

  /* ---------- 13: Matrícula ---------- */

  function graficaMatricula() {
    const M = D.matricula;
    const W = 1040, H = 700, x0 = 70, x1 = W - 26, y0 = H - 50, y1 = 30;
    const x = escala(0, 11, x0, x1), y = escala(450, 650, y0, y1);
    const pts = (arr, ini = 0) => arr.map((v, i) => [x(i + ini), y(v)]);
    const real = pts(M.real), todos = pts(M.real.concat(M.proyectado));
    const rejilla = [450, 500, 550, 600, 650].map(v => `<line class="${v > 450 ? 'rejilla' : 'eje'}" x1="${x0}" x2="${x1}" y1="${y(v)}" y2="${y(v)}"/><text class="txt-grafica" x="${x0 - 12}" y="${y(v) + 7}" text-anchor="end">${v}</text>`).join('');
    const marcas = [0, 3, 6, 9, 11].map(i => `<text class="txt-grafica" x="${x(i)}" y="${H - 16}" text-anchor="${i === 0 ? 'start' : i === 11 ? 'end' : 'middle'}">${M.etiquetas[i]}</text>`).join('');
    const banda = pts(M.superior).concat(pts(M.inferior).reverse());
    const caida = real[3];
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Matrícula por periodo de 2023 a 2026, con tendencia lineal e intervalo de predicción. Proyección de 584 alumnos más menos 45 para 2026 May-Ago.">
      ${rejilla}${marcas}
      <g class="r r-tinta" data-en="1">
        <rect class="mat-zona" x="${x(9)}" y="${y1}" width="${x1 - x(9)}" height="${y0 - y1}"/>
        <text class="txt-grafica" x="${x1 - 10}" y="${y1 + 26}" text-anchor="end" style="letter-spacing:.12em">${M.pronostico.toUpperCase()}</text>
      </g>
      <path class="mat-banda r r-tinta" data-en="1" style="--d:120ms" d="${linea(banda)} Z"/>
      <path class="mat-tend r r-tinta" data-en="1" style="--d:320ms" d="${linea(pts(M.tendencia))}"/>
      <path class="mat-linea trazo" pathLength="1" data-en="0" style="--d:360ms;--dur:1.6s" d="${linea(real)}"/>
      <path class="mat-proy r r-tinta" data-en="1" style="--d:620ms" d="${linea(todos.slice(9))}"/>
      ${real.map((p, i) => `<circle class="punto r r-tinta${i === 3 ? ' rosa' : ''}" data-en="0" style="--d:${360 + i * 110}ms" cx="${p[0]}" cy="${p[1]}" r="${i === 3 ? 8 : 6}"/>`).join('')}
      ${todos.slice(10).map(p => `<circle class="punto r r-tinta" data-en="1" style="--d:760ms" cx="${p[0]}" cy="${p[1]}" r="6"/>`).join('')}
      <g class="r r-tinta" data-en="0" style="--d:1500ms">
        <text class="mat-nota" x="${caida[0] + 16}" y="${caida[1] + 40}" style="fill:#B93854">${M.caida.titulo}</text>
        <text class="mat-nota2" x="${caida[0] + 16}" y="${caida[1] + 68}">${M.caida.detalle}</text>
      </g>
      <g class="r r-sube" data-en="1" style="--d:900ms">
        <text class="mat-nota" x="${x1 - 10}" y="${y(628) - 2}" text-anchor="end" style="font-weight:800;font-size:26px">${M.proyeccion}</text>
      </g>
    </svg>`;
  }

  const matricula = {
    id: 'matricula', pasos: 2,
    vistas: [{ id: 'matricula', desde: 0 }],
    html() {
      const M = D.matricula, E = M.errores, tope = 24;
      return `
        <div class="tarjeta mat-graf r r-sube" data-en="0">
          <div class="mat-leyenda">
            <span><i></i>${M.leyenda[0]}</span>
            <span class="r r-tinta" data-en="1"><i class="punteada"></i>${M.leyenda[1]}</span>
            <span class="r r-tinta" data-en="1"><i class="banda"></i>${M.leyenda[2]}</span>
          </div>
          ${graficaMatricula()}
        </div>
        <div class="mat-formula r r-entra" data-en="1" style="--d:400ms">
          <code>${M.formula.ecuacion}</code>
          <code>${M.formula.r2}</code>
          <p>${M.formula.texto}</p>
        </div>
        <div class="tarjeta mat-err r r-sube" data-en="2">
          ${cabeza('Compare', E.titulo, E.sub)}
          <div class="err-barras">
            ${E.datos.map((d, i) => `
              <div class="err${d[2] ? ' propia' : ''}">
                <span>${d[0]}</span>
                <div class="err-pista"><i class="r r-ancho" data-en="2" style="width:${d[1] / tope * 330}px;--d:${260 + i * 180}ms"></i><b>${cifra(d[1], { dec: 1 })}</b></div>
              </div>`).join('')}
          </div>
          <div class="err-sello"><span class="sello nopal r r-tinta" data-en="2" style="--d:900ms">${M.dentro}</span></div>
          <p class="mat-remate r r-barre" data-en="2" style="--d:1050ms">${M.remate}</p>
        </div>`;
    },
  };

  /* ---------- 14: Resultados ---------- */

  const resultados = {
    id: 'resultados', pasos: 1,
    vistas: [{ id: 'resultados', desde: 0 }],
    html() {
      const R = D.resultados;
      return `
        <div class="res-cifras">${R.cifras.map((c, i) => vano(c, 0, i * 120)).join('')}</div>
        <div class="res-tabla r r-sube" data-en="0" style="--d:260ms">
          <div class="res-fila res-enc"><span>${R.encabezados[0]}</span><span>${R.encabezados[1]}</span><span>${R.encabezados[2]}</span></div>
          ${R.filas.map((f, i) => `
            <div class="res-fila">
              <b class="r r-sube" data-en="0" style="--d:${380 + i * 110}ms">${f.esperado}</b>
              <span class="r r-barre" data-en="1" style="--d:${i * 340}ms">${f.obtenido}</span>
              <span class="sello ${f.clase} r r-sube" data-en="1" style="--d:${i * 340 + 480}ms">${f.estado}</span>
            </div>`).join('')}
        </div>`;
    },
  };

  /* ---------- 15: Conclusiones ---------- */

  const conclusiones = {
    id: 'conclusiones', pasos: 1,
    vistas: [{ id: 'conclusiones', desde: 0 }],
    html() {
      const C = D.conclusiones;
      return `
        <div class="tarjeta con-a r r-entra" data-en="0">
          ${cabeza('Flag', C.tituloA, C.subA)}
          <ul class="con-lista">${C.a.map((t, i) => `<li class="r r-sube" data-en="0" style="--d:${240 + i * 170}ms">${t}</li>`).join('')}</ul>
        </div>
        <div class="tarjeta con-b r r-sube" data-en="1">
          ${cabeza('ArrowForward', C.tituloB, C.subB)}
          <ul class="con-lista">${C.b.map((t, i) => `<li class="r r-sube" data-en="1" style="--d:${200 + i * 150}ms">${t}</li>`).join('')}</ul>
        </div>`;
    },
  };

  window.SIPAU_ESCENAS = [portada, concilia, tablero, importacion, arquitectura, formatos, informe, distribuido, arbol, acierta, matricula, resultados, conclusiones, cierre];
})();
