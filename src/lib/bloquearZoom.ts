/**
 * Bloquea el zoom en móviles/tablets.
 * El meta viewport (maximum-scale=1, user-scalable=no) cubre el caso general,
 * pero iOS Safari a veces lo ignora: aquí prevenimos también el gesto de pellizco
 * y el zoom por doble toque, que el viewport por sí solo no detiene.
 */
export function bloquearZoom(): void {
  // Pellizco con dos dedos (gesturestart es de Safari).
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );

  // Doble toque rápido (zoom de acercamiento en iOS).
  let ultimoToque = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const ahora = Date.now();
      if (ahora - ultimoToque <= 300) e.preventDefault();
      ultimoToque = ahora;
    },
    { passive: false },
  );

  // Zoom con Ctrl + rueda / Ctrl + '+' (por si se abre en un navegador de escritorio táctil).
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) e.preventDefault();
    },
    { passive: false },
  );
}
