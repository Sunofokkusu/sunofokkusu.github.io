import "./style.css";

import * as THREE from "three";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const scene = new THREE.Scene();

// add a ground picture
const groundTexture = new THREE.TextureLoader().load("./depositphotos_10589691-stock-photo-ground-background.webp");
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });
const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), groundMaterial);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -5;
scene.add(groundMesh);

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(-4);
camera.rotateY(3.15);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

scene.add(pointLight);

// reduce the amount of light in the scene


const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

function addTree(number){
    for(let i = 0; i < number; i++){
      let loader = new FBXLoader();
      loader.load('./oak_01.fbx', function (object) {
            let randX = Math.random() * 200 - 100;
            let randZ = Math.random() * 200 - 100;
            object.position.set(randX, -5, randZ);
            scene.add(object);
        });
    }
}

addTree(5);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: false,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * 0.5);

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;
renderer.setAnimationLoop(function () {
    renderer.render( scene, camera );
});

renderer.xr.getController(0); 
renderer.xr.getControllerGrip(0);
const controller = new GLTFLoader();
controller.load(
  "scene.gltf",
  (gltf) => {
    controller1.add( gltf.scene );
  }
);

const lineSegments=10;
const lineGeometry = new BufferGeometry();
const lineGeometryVertices = new Float32Array((lineSegments +1) * 3);
lineGeometryVertices.fill(0);
lineGeometry.setAttribute('position', new 
BufferAttribute(lineGeometryVertices, 3));
const lineMaterial = new LineBasicMaterial({ color: 0x888888, blending: AdditiveBlending });
const guideline = new Line( lineGeometry, lineMaterial );

const loader = new GLTFLoader();
loader.load(
  "voiture.glb",
  (gltf) => {
    gltf.scene.position.setY(-5);
    gltf.scene.position.setX(12);
    scene.add(gltf.scene);
  }
);
let controls = new PointerLockControls(camera, renderer.domElement);

controls.addEventListener("lock", (event) => {
  document.body.style.cursor = "none";
});

controls.addEventListener("unlock", () => {
  document.body.style.cursor = "auto";
});

document.body.addEventListener("click", () => {
  controls.lock();
});

scene.add(controls.getObject());

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now();
  let directionCollision = "none";
  if (controls.isLocked === true) {
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      if(directionCollision === "front") {
        camera.position.z -= 0.1;
      }
      if(directionCollision === "back") {
        camera.position.z += 0.1;
      }
      if(directionCollision === "right") {
        camera.position.x -= 0.1;
      }
      if(directionCollision === "left") {
        camera.position.x += 0.1;
      }
    } else {
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);

      controls.getObject().position.y += velocity.y * delta; // new behavior

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
      }
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}

animate();

document.addEventListener("keydown", function (event) {
  if (event.code === "ArrowUp" || event.code === "KeyW") {
    moveForward = true;
  }
  if (event.code === "ArrowDown" || event.code === "KeyS") {
    moveBackward = true;
  }
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    moveLeft = true;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    moveRight = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.code === "ArrowUp" || event.code === "KeyW") {
    moveForward = false;
  }
  if (event.code === "ArrowDown" || event.code === "KeyS") {
    moveBackward = false;
  }
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    moveLeft = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    moveRight = false;
  }
});
