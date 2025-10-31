import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(100, 60, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 10, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff6e5, 1.2);
sunLight.position.set(60, 100, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
scene.add(sunLight);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 140), new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const roadH = new THREE.Mesh(new THREE.BoxGeometry(180, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x222222 }));
roadH.position.y = 0.1;
scene.add(roadH);

const roadV = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 120), new THREE.MeshStandardMaterial({ color: 0x222222 }));
roadV.position.y = 0.1;
scene.add(roadV);

for (let i = -6; i <= 6; i++) {
  const stripH = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  stripH.position.set(i * 13, 0.15, 0);
  scene.add(stripH);

  const stripV = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  stripV.position.set(0, 0.15, i * 13);
  scene.add(stripV);
}

const footpathMat = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });
scene.add(
  new THREE.Mesh(new THREE.BoxGeometry(180, 0.3, 2), footpathMat).position.set(0, 0.15, -6),
  new THREE.Mesh(new THREE.BoxGeometry(180, 0.3, 2), footpathMat).position.set(0, 0.15, 6),
  new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 120), footpathMat).position.set(-6, 0.15, 0),
  new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 120), footpathMat).position.set(6, 0.15, 0)
);

const buildings = [];
const spacing = 25;
for (let x = -90; x <= 90; x += spacing) {
  for (let z = -60; z <= 60; z += spacing) {
    if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
    const energy = Math.random();
    const height = 10 + energy * 25;
    const color = new THREE.Color().lerpColors(new THREE.Color(0xffff88), new THREE.Color(0xff0000), energy);
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: energy * 0.5, metalness: 0.4, roughness: 0.4 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(6, height, 6), mat);
    b.position.set(x, height / 2, z);
    b.castShadow = true;
    b.userData.energy = energy;
    b.rotation.y = (Math.random() - 0.5) * 0.1;
    const windows = new THREE.Mesh(new THREE.BoxGeometry(6, height, 6), new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true, opacity: 0.3 }));
    windows.position.set(0, 0, 0);
    b.add(windows);
    scene.add(b);
    buildings.push(b);
  }
}

for (let i = 0; i < 25; i++) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 8), new THREE.MeshStandardMaterial({ color: 0x006400 }));
  const tree = new THREE.Group();
  trunk.position.y = 1;
  foliage.position.y = 3;
  tree.add(trunk, foliage);
  tree.position.set(Math.random() * 180 - 90, 0, Math.random() * 120 - 60);
  tree.castShadow = true;
  scene.add(tree);
}

for (let i = -5; i <= 5; i++) {
  for (let j of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3), new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffff88, emissiveIntensity: 0.6 }));
    const light = new THREE.PointLight(0xffffaa, 0.8, 14);
    pole.position.set(i * 12, 2, j * 6);
    lamp.position.set(i * 12, 4, j * 6);
    light.position.set(i * 12, 4, j * 6);
    scene.add(pole, lamp, light);
  }
}

const cars = [];
for (let i = 0; i < 6; i++) {
  const car = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 1.2), new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
  car.position.set(-90 + i * 35, 0.5, i % 2 === 0 ? 1.5 : -1.5);
  car.castShadow = true;
  scene.add(car);
  cars.push({ mesh: car, speed: (0.04 + Math.random() * 0.04) * (i % 2 === 0 ? 1 : -1) });
}

const clouds = [];
for (let i = 0; i < 6; i++) {
  const cloud = new THREE.Group();
  for (let j = 0; j < 3; j++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(3 + Math.random(), 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    puff.position.set(j * 2, Math.random(), 0);
    cloud.add(puff);
  }
  cloud.position.set(Math.random() * 120 - 60, 30 + Math.random() * 5, Math.random() * 60 - 30);
  scene.add(cloud);
  clouds.push(cloud);
}

setInterval(() => {
  buildings.forEach(b => {
    const e = Math.random();
    b.userData.energy = e;
    const c = new THREE.Color().lerpColors(new THREE.Color(0xffff88), new THREE.Color(0xff0000), e);
    b.material.color.set(c);
    b.material.emissive.set(c);
    b.material.emissiveIntensity = e * 0.5;
  });
}, 12000);

const labelDiv = document.createElement('div');
labelDiv.style.position = 'absolute';
labelDiv.style.fontSize = '16px';
labelDiv.style.fontWeight = 'bold';
labelDiv.style.padding = '6px 10px';
labelDiv.style.background = 'rgba(255,255,255,0.85)';
labelDiv.style.borderRadius = '6px';
labelDiv.style.pointerEvents = 'none';
labelDiv.style.opacity = 0;
document.body.appendChild(labelDiv);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buildings);
  if (intersects.length > 0) {
    const b = intersects[0].object;
    const e = b.userData.energy;
    labelDiv.innerHTML = `Energy: ${(e * 100).toFixed(0)}%`;
    labelDiv.style.left = event.clientX + 10 + 'px';
    labelDiv.style.top = event.clientY - 20 + 'px';
    labelDiv.style.color = e > 0.6 ? 'red' : 'green';
    labelDiv.style.opacity = 1;
  } else {
    labelDiv.style.opacity = 0;
  }
});

let angle = 0;
let dayCycle = 0;
function animate() {
  requestAnimationFrame(animate);
  angle += 0.001;
  dayCycle += 0.002;
  camera.position.x = Math.sin(angle) * 100;
  camera.position.z = Math.cos(angle) * 100;
  camera.lookAt(0, 10, 0);
  clouds.forEach(c => (c.position.x += 0.02));
  cars.forEach(c => {
    c.mesh.position.x += c.speed;
    if (c.mesh.position.x > 100) c.mesh.position.x = -100;
    if (c.mesh.position.x < -100) c.mesh.position.x = 100;
  });
  const daylight = (Math.sin(dayCycle) + 1) / 2;
  sunLight.intensity = 0.5 + daylight * 1.2;
  ambientLight.intensity = 0.4 + daylight * 0.5;
  scene.background.setHSL(0.6, 0.6, 0.7 - 0.2 * (1 - daylight));
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
