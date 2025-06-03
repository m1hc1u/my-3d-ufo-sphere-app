import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';

// Pobieramy kontener, do którego podłączymy renderer.
const container = document.getElementById('container')!;

// Ustawiamy scenę.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00000); // Tło – czarne

// Obliczamy promień sfery w zależności od rozmiaru okna.
// Im mniejszy ekran, tym mniejsza sfera.
let sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.3;

// Ustawiamy kamerę perspektywiczną. Aby widok był z zewnątrz sfery,
// ustawiamy kamerę daleko od środka – korzystamy z mnożnika (cameraDistanceFactor).
const cameraDistanceFactor = 3;
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// Ustawiamy kamerę na osi Z, poza sferą.
camera.position.set(0, 0, sphereRadius * cameraDistanceFactor);

// Konfigurujemy renderer z antyaliasingiem i podpinamy go do DOM.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Tworzymy grupę, która będzie zawierać sferę oraz obrazki.
// Dzięki temu obracamy całość razem.
const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

// Tworzymy sferę pomocniczą – jest pokazana jako przezroczysty wireframe.
// Sfera wymodelowana jest z odpowiednim promieniem.
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x666666,
  wireframe: true,
  opacity: 0.2,
  transparent: true,
});
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereGroup.add(sphereMesh);

// Konfigurujemy loader tekstur oraz definiujemy tablicę lokalnych obrazków.
// Nazwy plików zgodne z "kosmita1.png", "kosmita2.png", itd.
const textureLoader = new THREE.TextureLoader();
const imageFiles = [
  '/images/kosmita1.png',
  '/images/kosmita2.png',
  '/images/kosmita3.png',
  '/images/kosmita4.png',
  '/images/kosmita5.png',
  '/images/kosmita6.png',
  '/images/kosmita7.png',
  '/images/kosmita8.png',
  '/images/kosmita9.png',
  '/images/kosmita10.png',
];

// Tablica na meshe obrazków.
const imageMeshes: THREE.Mesh[] = [];

/**
 * Tworzy płaski obiekt (plane) na potrzeby wyświetlania obrazka na sferze.
 * Obrazek ma kształt kwadratu. Jego rozmiar jest zależny od promienia sfery.
 * @param texture Tekstura wczytana z pliku.
 * @returns Mesh z obrazkiem.
 */
function createImagePlane(texture: THREE.Texture): THREE.Mesh {
  const planeSize = sphereRadius * 0.5;
  const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
  // Ustawiamy side na FrontSide, aby obrazek był widoczny tylko z zewnątrz sfery
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
  return new THREE.Mesh(geometry, material);
}

/**
 * Rozmieszcza obrazki równomiernie na powierzchni sfery.
 * Wykorzystuje algorytm "Fibonacci sphere" dla równomiernego rozmieszczenia.
 * Każdy obrazek zostaje przesunięty lekko na zewnątrz, aby nie stykał się z sferą.
 * @param images Tablica meshów z obrazkami.
 */
function distributeImagesOnSphere(images: THREE.Mesh[]) {
  const n = images.length;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    // Współrzędna Y zmienia się od 1 do -1.
    const y = 1 - (i / (n - 1)) * 2;
    // Obliczamy promień poziomy dla danej wysokości.
    const radiusAtY = Math.sqrt(1 - y * y);
    // Kąt dzięki złotemu podziałowi.
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    // Dodajemy mały offset, aby obrazki były nieco na zewnątrz.
    const offset = sphereRadius * 0.05;
    const pos = new THREE.Vector3(x, y, z).multiplyScalar(sphereRadius + offset);
    images[i].position.copy(pos);
    // Obracamy płaszczyznę tak, aby była styczna do powierzchni sfery.
    images[i].lookAt(images[i].position.clone().multiplyScalar(2));
  }
}

// Ładujemy wszystkie obrazki – dla każdego pliku tworzymy plane i dodajemy do grupy.
imageFiles.forEach((file) => {
  textureLoader.load(file, (texture) => {
    const imagePlane = createImagePlane(texture);
    imageMeshes.push(imagePlane);
    sphereGroup.add(imagePlane);
    // Gdy wszystkie obrazki są załadowane, rozmieszczamy je na sferze.
    if (imageMeshes.length === imageFiles.length) {
      distributeImagesOnSphere(imageMeshes);
    }
  });
});

// --- INTERAKCJE I OBSŁUGA MYSZY ---

// Flaga automatycznej rotacji – domyślnie włączona.
let autoRotate = true;
// Flaga informująca, czy użytkownik przeciąga sferę.
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Używamy raycastera do wykrywania, czy kursor znajduje się nad sferą lub obrazkami.
const raycaster = new Raycaster();
const mouse = new Vector2();

// Pobieramy elementy modalu (pełnoekranowego wyświetlania obrazka).
const modal = document.getElementById('modal')!;
const modalImage = document.getElementById('modal-image') as HTMLImageElement;
const modalClose = document.getElementById('modal-close')!;

/**
 * Aktualizuje pozycje kamery, promień sfery i rozmieszcza obrazki
 * przy zmianie rozmiaru okna.
 */
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  sphereRadius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Przesuwamy kamerę poza sferę według aktualnego promienia.
  camera.position.set(0, 0, sphereRadius * cameraDistanceFactor);
  sphereMesh.geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
  distributeImagesOnSphere(imageMeshes);
}

/**
 * Funkcja pomocnicza przeliczająca współrzędne kursora do Normalized Device Coordinates
 * i wykrywająca obiekty znajdujące się pod kursorem.
 */
function getIntersects(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects(sphereGroup.children, true);
}

/**
 * Obsługa zdarzenia mousedown – zapisuje pozycję początkową kursora.
 */
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
function onMouseDown(event: MouseEvent) {
  isDragging = false;
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

/**
 * Obsługa zdarzenia mousemove – rozróżniamy przypadek przeciągania (przy wciśniętym lewym przycisku)
 * oraz zwykłego ruchu wskazując, czy kursor znajduje się nad sferą.
 */
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event: MouseEvent) {
  if (event.buttons === 1) {
    // Jeśli przycisk myszy wciśnięty – traktujemy ruch jako przeciąganie.
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };
    if (Math.abs(deltaMove.x) > 2 || Math.abs(deltaMove.y) > 2) {
      isDragging = true;
      autoRotate = false; // Podczas przeciągania wyłączamy automatyczną rotację.
      // Obracamy sferę zgodnie z ruchem kursora.
      sphereGroup.rotation.y += deltaMove.x * 0.005;
      sphereGroup.rotation.x += deltaMove.y * 0.005;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  }
  // Usuwamy warunek else z autoRotate, bo obrót ma być zawsze włączony poza przeciąganiem/modalem
}

/**
 * Obsługa zdarzenia mouseup – w przypadku kliknięcia (bez przeciągania) sprawdzamy,
 * czy został kliknięty któryś z obrazków.
 */
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
function onMouseUp(event: MouseEvent) {
  if (!isDragging) {
    const intersects = getIntersects(event);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      // Jeśli kliknięty obiekt to jeden z obrazków, wyświetlamy modal.
      if (imageMeshes.includes(clickedObject as THREE.Mesh)) {
        showModal((clickedObject as THREE.Mesh).material);
      }
    }
  }
  isDragging = false;
  autoRotate = true; // Po zakończeniu przeciągania wznawiamy obrót (jeśli modal nie jest otwarty)
}

/**
 * Funkcja wyświetlająca modal z obrazkiem w pełnej rozdzielczości.
 * Obrazek wyświetlany jest w formie okrągłej (stylizowany jak zdjęcie profilowe),
 * a modal posiada animację fade-in/out.
 * @param material Materiał z którego pobieramy teksturę.
 */
function showModal(material: THREE.Material | THREE.Material[]) {
  let texture: THREE.Texture | undefined;
  if (Array.isArray(material)) {
    texture = (material[0] as THREE.MeshBasicMaterial).map ?? undefined;
  } else {
    texture = (material as THREE.MeshBasicMaterial).map ?? undefined;
  }
  if (texture && texture.image && texture.image.src) {
    modalImage.src = texture.image.src;
  }
  modal.classList.remove('hidden');
  modal.classList.add('show');
  autoRotate = false; // Zatrzymujemy obrót, gdy modal jest aktywny.
}

/**
 * Obsługa przycisku zamknięcia modalu.
 */
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.remove('show');
    modal.classList.add('hidden');
    autoRotate = true;
  }
});

/**
 * Główna pętla animacji – renderuje scenę oraz obraca sferę, jeśli autoRotate jest włączone.
 */
function animate() {
  requestAnimationFrame(animate);
  if (autoRotate) {
    sphereGroup.rotation.y += 0.001; // Bardzo powolny, przyjemny obrót
  }
  renderer.render(scene, camera);
}
animate();