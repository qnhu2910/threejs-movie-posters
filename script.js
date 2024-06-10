import * as THREE from 'three';

let scene, camera, renderer;
let posterTextures = [];
let posterMeshes = [];
let currentPosterIndex = 0;
let leftArrow, rightArrow, bookButton;

const posters = [
  { image: 'assets/poster1.png', description: ["This is movie 1, line 1", "Line 2", "Line 3"] },
  { image: 'assets/poster2.png', description: ["This is movie 2, line A", "Line B", "Line C"] },
  // Add more posters as needed
];

init();
animate();

function init() {
  // Scene setup
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Load the poster textures
  const loader = new THREE.TextureLoader();
  posters.forEach((poster, index) => {
    loader.load(poster.image, (texture) => {
      posterTextures[index] = texture;
      if (index === 0) {
        createPoster(index);
      }
    });
  });

  // Create the arrows and booking button
  createArrows();
  createBookButton();

  // Resize handling
  window.addEventListener('resize', onWindowResize, false);
}

function createPoster(index) {
  // Remove previous poster
  if (posterMeshes[currentPosterIndex]) {
    scene.remove(posterMeshes[currentPosterIndex]);
  }

  // Create new poster mesh
  const posterGeometry = new THREE.PlaneGeometry(2, 3);
  const posterMaterial = new THREE.MeshBasicMaterial({ map: posterTextures[index] });
  const posterMesh = new THREE.Mesh(posterGeometry, posterMaterial);
  scene.add(posterMesh);
  posterMeshes[index] = posterMesh;
  currentPosterIndex = index;

  // Add movie description
  addDescription(index);
}

function createArrows() {
  const arrowMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

  const leftArrowGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.5, 0.5, 0), 
    new THREE.Vector3(0, 0, 0), 
    new THREE.Vector3(-0.5, -0.5, 0)
  ]);
  leftArrow = new THREE.Line(leftArrowGeometry, arrowMaterial);
  leftArrow.position.set(-3, 0, 0);
  leftArrow.userData = { direction: 'left' };
  scene.add(leftArrow);

  const rightArrowGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0.5, 0.5, 0), 
    new THREE.Vector3(0, 0, 0), 
    new THREE.Vector3(0.5, -0.5, 0)
  ]);
  rightArrow = new THREE.Line(rightArrowGeometry, arrowMaterial);
  rightArrow.position.set(3, 0, 0);
  rightArrow.userData = { direction: 'right' };
  scene.add(rightArrow);
}

function createBookButton() {
  const buttonGeometry = new THREE.PlaneGeometry(1, 0.5);
  const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  bookButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
  bookButton.position.set(0, -2.5, 0);
  bookButton.userData = { type: 'book' };
  scene.add(bookButton);
}

function addDescription(index) {
  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const description = posters[index].description;

    // Remove previous description texts
    const previousTexts = scene.children.filter(child => child.userData && child.userData.isDescription);
    previousTexts.forEach(text => scene.remove(text));

    description.forEach((line, i) => {
      const textGeometry = new THREE.TextGeometry(line, { font: font, size: 0.1, height: 0.01 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(-2, 1 - i * 0.2, 0);
      textMesh.userData = { isDescription: true };
      scene.add(textMesh);
    });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Add event listeners for interactions
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  event.preventDefault();

  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects([leftArrow, rightArrow, bookButton]);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.userData.type === 'book') {
      window.location.href = 'https://yourbookingpage.com';
    } else if (object.userData.direction) {
      if (object.userData.direction === 'left') {
        currentPosterIndex = (currentPosterIndex - 1 + posters.length) % posters.length;
      } else if (object.userData.direction === 'right') {
        currentPosterIndex = (currentPosterIndex + 1) % posters.length;
      }
      createPoster(currentPosterIndex);
    }
  }
}
