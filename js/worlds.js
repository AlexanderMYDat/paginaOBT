/*
 * Mundos del hero. Todo lo visual y los enlaces salen de aquí.
 *
 * native: tamaño nativo del lienzo del mundo en px (base.png).
 * pos:    posición del lienzo dentro del racimo (desktop), en px nativos. Los mundos
 *         forman una media luna: los extremos más arriba, los centrales más abajo.
 *         Todo el racimo se escala con el mismo entero, así la composición no se deforma.
 * depth:  alto de los lados del bloque en px nativos (ubica la sombra de contacto).
 * sprites: x, y, w en % del lienzo nativo. Deben caer en píxeles enteros
 *          (x/100 * native.w), y w debe ser el ancho nativo de un frame.
 *          frames/fps para sprite sheets horizontales.
 *          idle: animación en reposo ("twinkle", "float", "flicker", "sheet",
 *                "satellite", "drive", "blink"). every: [min, max] s entre parpadeos.
 *          hover: animación al pasar el mouse ("rocket-shake", "flame-on", "satellite-orbit",
 *                 "alien-wave", "head-turn", "figure-cross", "sign-on").
 *          clip: recorta el sprite a un polígono (px nativos); x/y pasan a ser relativos al recorte.
 */
// Súbelo cada vez que reemplaces imágenes, para que el navegador no muestre las viejas.
window.ASSET_VERSION = "20";

window.WORLDS = [
  {
    id: "simulab",
    label: "SimuLab",
    title: "Exploración planetaria & simulación",
    description:
      "Simulaciones de sistemas complejos impulsadas por IA generativa. Temática cósmica, astrobiología hipotética y escenarios de supervivencia en el espacio.",
    base: "assets/simulab/base.png",
    native: { w: 128, h: 128 },
    depth: 18,
    pos: { x: 112, y: 64 },
    sprites: [
      { id: "star-1", src: "assets/simulab/star.png", x: 4.6875, y: 18.75, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "star-2", src: "assets/simulab/star.png", x: 31.25, y: 6.25, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "star-3", src: "assets/simulab/star.png", x: 85.9375, y: 23.4375, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "star-4", src: "assets/simulab/star.png", x: 54.6875, y: 1.5625, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "star-5", src: "assets/simulab/star.png", x: 14.0625, y: 40.625, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "star-6", src: "assets/simulab/star.png", x: 75, y: 3.125, w: 3.90625, z: 1, frames: 3, fps: 4, idle: "twinkle" },
      { id: "asteroid-1", src: "assets/simulab/asteroid-1.png", x: 10.9375, y: 32.8125, w: 5.46875, z: 1, idle: "float" },
      { id: "asteroid-2", src: "assets/simulab/asteroid-2.png", x: 21.875, y: 23.4375, w: 3.90625, z: 1, idle: "float" },
      { id: "satellite", src: "assets/simulab/satellite.png", x: 62.5, y: 7.8125, w: 14.0625, z: 2, frames: 4, fps: 5, idle: "satellite", hover: "satellite-orbit" },
      { id: "flame", src: "assets/simulab/flame.png", x: 47.65625, y: 46.875, w: 4.6875, z: 2, frames: 4, fps: 12, hidden: true, hover: "flame-on" },
      { id: "rocket", src: "assets/simulab/rocket.png", x: 44.53125, y: 25, w: 10.9375, z: 3, hover: "rocket-shake" },
      { id: "alien", src: "assets/simulab/alien.png", x: 28.125, y: 57.8125, w: 7.03125, z: 3, frames: 2, fps: 4, hover: "alien-wave" },
      { id: "rover", src: "assets/simulab/rover.png", x: 59.375, y: 54.6875, w: 15.625, z: 3, frames: 2, idle: "drive" },
      { id: "flag", src: "assets/simulab/flag.png", x: 50, y: 62.5, w: 6.25, z: 2, frames: 3, fps: 3, idle: "sheet" },
      { id: "sign", src: "assets/simulab/sign.png", x: 29.6875, y: 81.25, w: 41.40625, z: 4, frames: 2, hover: "sign-on" },
      { id: "beacon", src: "assets/simulab/beacon.png", x: 80.46875, y: 36.71875, w: 2.34375, z: 2, frames: 2, idle: "blink" }
    ],
    socials: [
      { network: "youtube", label: "YouTube", url: "https://www.youtube.com/@SimuLabOBT" },
      { network: "instagram", label: "Instagram", url: "https://www.instagram.com/simulabobt/" },
      { network: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@simulabobt" },
      { network: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61583916613723" }
    ]
  },
  {
    id: "liminalcore",
    label: "LiminalCore",
    title: "Espacios liminales & lo inquietante",
    description:
      "Lugares que no deberían existir, pero que todos recordamos haber visitado en sueños. Estéticas de lo inquietante y arquitecturas al borde de la realidad.",
    note: "// más plataformas próximamente",
    base: "assets/liminalcore/base.png",
    native: { w: 128, h: 128 },
    depth: 10,
    pos: { x: 248, y: 64 },
    sprites: [
      { id: "light-1", src: "assets/liminalcore/light-1.png", x: 9.375, y: 32.8125, w: 9.375, z: 1, frames: 2 , idle: "flicker", every: [5, 12] },
      { id: "light-2", src: "assets/liminalcore/light-2.png", x: 78.125, y: 29.6875, w: 9.375, z: 1, frames: 2, idle: "flicker", every: [2, 5] },
      { id: "light-3", src: "assets/liminalcore/light-3.png", x: 31.25, y: 29.6875, w: 9.375, z: 1, frames: 2 , idle: "flicker", every: [5, 12] },
      { id: "light-4", src: "assets/liminalcore/light-4.png", x: 59.375, y: 31.25, w: 9.375, z: 1, frames: 2 , idle: "flicker", every: [5, 12] },
      {
        // Cruza por la puerta trasera izquierda: se recorta a la forma exacta de la puerta (px nativos).
        id: "shadow-figure", src: "assets/liminalcore/shadow-figure.png", x: 11.12, y: 10, w: 5.46875, z: 1, hidden: true, hover: "figure-cross",
        clip: { x: 36, y: 35, w: 9, h: 20, poly: [[0, 4], [1, 4], [1, 3], [3, 3], [3, 2], [5, 2], [5, 1], [7, 1], [7, 0], [9, 0], [9, 16], [7, 16], [7, 17], [5, 17], [5, 18], [3, 18], [3, 19], [1, 19], [1, 20], [0, 20]] }
      },
      { id: "sign", src: "assets/liminalcore/sign.png", x: 22.65625, y: 82.8125, w: 55.46875, z: 4, frames: 2, hover: "sign-on" },
      { id: "character", src: "assets/liminalcore/character.png", x: 45.3125, y: 62.5, w: 7.8125, z: 3, frames: 2, fps: 2, hover: "head-turn" }
    ],
    socials: [
      { network: "youtube", label: "YouTube", url: "https://www.youtube.com/@LiminalCoreOBT" }
    ]
  },
  // Bloques de tierra reservados para proyectos futuros (con letrero "PRÓXIMAMENTE").
  { id: "ground-1", empty: true, base: "assets/empty/ground-1.png", native: { w: 128, h: 128 }, depth: 18, pos: { x: 0, y: 0 }, sprites: [{ id: "sign", src: "assets/empty/sign-soon.png", x: 17.96875, y: 81.25, w: 63.28125, z: 4 }] },
  { id: "ground-2", empty: true, base: "assets/empty/ground-2.png", native: { w: 128, h: 128 }, depth: 18, pos: { x: 360, y: 0 }, sprites: [{ id: "sign", src: "assets/empty/sign-soon.png", x: 17.96875, y: 81.25, w: 63.28125, z: 4 }] }
];
