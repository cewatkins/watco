import * as THREE from "three";
import {
  RWY_LENGTH,
  RWY_WIDTH,
  RWY_YAW,
  THRESH_X,
  THRESH_Z,
  WIND_X,
  WIND_Z,
  basis,
  runwayCenter,
  runwayForward,
  runwayRight,
  type Ship,
  DEFAULT_WEATHER,
  windAt,
  type Weather,
} from "./fdm";

export type CamMode = "chase" | "tower" | "wing" | "spot" | "cockpit";

export type FlightWorld = {
  setNight: (night: boolean) => void;
  render: (player: Ship, traffic: Ship, dt: number, cam: CamMode, weather?: Readonly<Weather>) => void;
  resize: () => void;
  dispose: () => void;
};

const _m = new THREE.Matrix4();
const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _desired = new THREE.Vector3();
const _look = new THREE.Vector3();
const _fwd = new THREE.Vector3();

function applyAttitude(obj: THREE.Object3D, ship: Ship) {
  const b = basis(ship.yaw, ship.pitch, ship.roll);
  _x.set(b.r.x, b.r.y, b.r.z);
  _y.set(b.u.x, b.u.y, b.u.z);
  _z.set(b.f.x, b.f.y, b.f.z);
  _m.makeBasis(_x, _y, _z);
  obj.quaternion.setFromRotationMatrix(_m);
  obj.position.set(ship.x, ship.y, ship.z);
}

function paintRunway(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 1024;
  const g = c.getContext("2d");
  if (!g) throw new Error("no 2d context");
  g.fillStyle = "#3c4148";
  g.fillRect(0, 0, 128, 1024);
  for (let i = 0; i < 400; i++) {
    g.fillStyle = Math.random() > 0.5 ? "#343940" : "#454b54";
    g.fillRect(Math.random() * 128, Math.random() * 1024, 3, 2);
  }
  g.fillStyle = "#f3f1ea";
  g.fillRect(5, 0, 3, 1024);
  g.fillRect(120, 0, 3, 1024);
  for (let y = 24; y < 1000; y += 40) g.fillRect(61, y, 6, 20);
  // threshold bars
  g.fillRect(16, 36, 96, 10);
  g.fillRect(16, 978, 96, 10);
  g.font = "700 72px 'IBM Plex Sans', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.save();
  g.translate(64, 150);
  g.rotate(Math.PI);
  g.fillText("28", 0, 0);
  g.restore();
  g.save();
  g.translate(64, 874);
  g.fillText("10", 0, 0);
  g.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function paintGround(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  if (!g) throw new Error("no 2d context");
  g.fillStyle = "#c2b07a";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = i % 2 ? "#8e9960" : "#d2c08a";
    g.globalAlpha = 0.4;
    g.beginPath();
    g.ellipse(
      Math.random() * 512,
      Math.random() * 512,
      18 + Math.random() * 60,
      10 + Math.random() * 24,
      Math.random() * 3,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
  g.globalAlpha = 0.22;
  for (let i = 0; i < 1800; i++) {
    g.fillStyle = Math.random() > 0.5 ? "#6e6246" : "#efe0a8";
    g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(48, 48);
  tex.anisotropy = 8;
  return tex;
}

function buildTrainer(stripe: number): { group: THREE.Group; prop: THREE.Object3D; beacon: THREE.Mesh } {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.48, metalness: 0.04 });
  const accent = new THREE.MeshStandardMaterial({ color: stripe, roughness: 0.45, metalness: 0.08 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.62, metalness: 0.2 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xb7d4de,
    roughness: 0.08,
    metalness: 0.45,
    transparent: true,
    opacity: 0.55,
  });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

  const fuse = new THREE.Mesh(new THREE.SphereGeometry(0.62, 22, 16), white);
  fuse.scale.set(0.92, 0.78, 5.15);
  fuse.position.set(0, 0.02, -0.15);
  g.add(fuse);

  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 4.4), accent);
  belly.position.set(0, 0.42, -0.05);
  g.add(belly);

  const cabin = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), glass);
  cabin.scale.set(0.92, 0.72, 1.35);
  cabin.position.set(0, 0.38, 0.72);
  g.add(cabin);

  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.85, 16), white);
  cowl.rotation.x = Math.PI / 2;
  cowl.position.set(0, -0.02, 1.85);
  g.add(cowl);

  const wingGeo = new THREE.BoxGeometry(5.15, 0.08, 1.42);
  const left = new THREE.Mesh(wingGeo, white);
  left.position.set(-2.7, 0.78, 0.15);
  left.rotation.z = -0.045;
  const right = new THREE.Mesh(wingGeo, white);
  right.position.set(2.7, 0.78, 0.15);
  right.rotation.z = 0.045;
  g.add(left, right);

  const tipGeo = new THREE.BoxGeometry(0.18, 0.1, 1.5);
  const tipL = new THREE.Mesh(tipGeo, accent);
  tipL.position.set(-5.2, 0.9, 0.15);
  const tipR = new THREE.Mesh(tipGeo, accent);
  tipR.position.set(5.2, 0.66, 0.15);
  g.add(tipL, tipR);

  const strutGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6);
  for (const side of [-1, 1]) {
    const strut = new THREE.Mesh(strutGeo, dark);
    strut.position.set(side * 1.7, 0.22, 0.05);
    strut.rotation.z = side * 0.18;
    g.add(strut);
  }

  const hstab = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.06, 0.72), white);
  hstab.position.set(0, 0.28, -3.15);
  const vstab = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.25, 0.9), white);
  vstab.position.set(0, 0.95, -3.2);
  const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.95, 0.28), accent);
  rudder.position.set(0, 0.95, -3.55);
  g.add(hstab, vstab, rudder);

  const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.15, 6);
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.14, 12);
  const mains: Array<[number, number]> = [
    [-1.15, -0.15],
    [1.15, -0.15],
  ];
  for (const [x, z] of mains) {
    const leg = new THREE.Mesh(legGeo, dark);
    leg.position.set(x, -0.55, z);
    const wheel = new THREE.Mesh(wheelGeo, rubber);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, -1.22, z);
    g.add(leg, wheel);
  }
  const noseLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 6), dark);
  noseLeg.position.set(0, -0.55, 1.45);
  const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12), rubber);
  noseWheel.rotation.z = Math.PI / 2;
  noseWheel.position.set(0, -1.18, 1.45);
  g.add(noseLeg, noseWheel);

  const prop = new THREE.Group();
  prop.position.set(0, -0.02, 2.32);
  const bladeGeo = new THREE.BoxGeometry(0.1, 1.7, 0.035);
  const b1 = new THREE.Mesh(bladeGeo, dark);
  const b2 = new THREE.Mesh(bladeGeo, dark);
  b2.rotation.z = Math.PI / 2;
  prop.add(b1, b2);
  g.add(prop);

  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 12), dark);
  spinner.rotation.x = Math.PI / 2;
  spinner.position.set(0, -0.02, 2.5);
  g.add(spinner);

  const lampMat = (color: number) =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.4 });
  const navL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lampMat(0xc4492c));
  navL.position.set(-5.25, 0.9, 0.15);
  const navR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), lampMat(0x3d9a54));
  navR.position.set(5.25, 0.66, 0.15);
  const beaconMat = lampMat(0xc4492c);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), beaconMat);
  beacon.position.set(0, 1.62, -3.15);
  g.add(navL, navR, beacon);

  g.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  return { group: g, prop, beacon };
}

function distToCenterline(x: number, z: number): number {
  const f = runwayForward();
  const dx = x - THRESH_X;
  const dz = z - THRESH_Z;
  const t = Math.max(0, Math.min(RWY_LENGTH, dx * f.x + dz * f.z));
  const px = THRESH_X + f.x * t;
  const pz = THRESH_Z + f.z * t;
  return Math.hypot(x - px, z - pz);
}

export function mountWorld(canvas: HTMLCanvasElement): FlightWorld {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#9ec4d6");
  scene.fog = new THREE.Fog("#d5ddd6", 1400, 9000);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.25, 14000);

  const skyLight = new THREE.HemisphereLight("#e7f1f8", "#c2a36a", 1.05);
  const ambient = new THREE.AmbientLight("#fff6e8", 0.38);
  scene.add(skyLight, ambient);
  const sun = new THREE.DirectionalLight("#fff0d0", 2.6);
  sun.position.set(-420, 640, 280);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(14000, 14000),
    new THREE.MeshStandardMaterial({ map: paintGround(), roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const f = runwayForward();
  const r = runwayRight();
  const center = runwayCenter();

  const shoulder = new THREE.Mesh(
    new THREE.BoxGeometry(RWY_WIDTH + 28, 0.12, RWY_LENGTH + 40),
    new THREE.MeshStandardMaterial({ color: "#a89878", roughness: 1 }),
  );
  {
    const b = basis(RWY_YAW, 0, 0);
    _x.set(b.r.x, b.r.y, b.r.z);
    _y.set(b.u.x, b.u.y, b.u.z);
    _z.set(b.f.x, b.f.y, b.f.z);
    _m.makeBasis(_x, _y, _z);
    shoulder.quaternion.setFromRotationMatrix(_m);
    shoulder.position.set(center.x, 0.06, center.z);
    shoulder.receiveShadow = true;
    scene.add(shoulder);
  }

  const rwyGeo = new THREE.PlaneGeometry(RWY_WIDTH, RWY_LENGTH);
  rwyGeo.rotateX(Math.PI / 2);
  rwyGeo.translate(0, 0.2, RWY_LENGTH / 2);
  const rwy = new THREE.Mesh(
    rwyGeo,
    new THREE.MeshStandardMaterial({ map: paintRunway(), roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide }),
  );
  {
    const b = basis(RWY_YAW, 0, 0);
    _x.set(b.r.x, b.r.y, b.r.z);
    _y.set(b.u.x, b.u.y, b.u.z);
    _z.set(b.f.x, b.f.y, b.f.z);
    _m.makeBasis(_x, _y, _z);
    rwy.quaternion.setFromRotationMatrix(_m);
  }
  rwy.position.set(THRESH_X, 0, THRESH_Z);
  rwy.receiveShadow = true;
  scene.add(rwy);

  const edgeLights = new THREE.Group();
  const lampGeometry = new THREE.SphereGeometry(0.6, 6, 4);
  const lampMaterial = new THREE.MeshBasicMaterial({ color: "#fff0c0" });
  for (let distance = 0; distance <= RWY_LENGTH; distance += 60) {
    for (const side of [-1, 1]) {
      const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
      lamp.position.set(
        THRESH_X + f.x * distance + r.x * side * (RWY_WIDTH / 2 + 2),
        0.65,
        THRESH_Z + f.z * distance + r.z * side * (RWY_WIDTH / 2 + 2),
      );
      edgeLights.add(lamp);
    }
  }
  edgeLights.visible = false;
  scene.add(edgeLights);

  function setNight(night: boolean) {
    scene.background = new THREE.Color(night ? "#0b1528" : "#9ec4d6");
    scene.fog = new THREE.Fog(night ? "#142239" : "#d5ddd6", 1400, 9000);
    skyLight.intensity = night ? 0.35 : 1.05;
    ambient.intensity = night ? 0.18 : 0.38;
    sun.intensity = night ? 0.15 : 2.6;
    edgeLights.visible = night;
  }

  const taxi = new THREE.Mesh(
    new THREE.BoxGeometry(18, 0.16, 220),
    new THREE.MeshStandardMaterial({ color: "#4a5058", roughness: 0.95 }),
  );
  {
    const b = basis(RWY_YAW, 0, 0);
    _x.set(b.r.x, b.r.y, b.r.z);
    _y.set(b.u.x, b.u.y, b.u.z);
    _z.set(b.f.x, b.f.y, b.f.z);
    _m.makeBasis(_x, _y, _z);
    taxi.quaternion.setFromRotationMatrix(_m);
    taxi.position.set(center.x + r.x * (RWY_WIDTH * 0.5 + 70), 0.1, center.z + r.z * (RWY_WIDTH * 0.5 + 70));
    scene.add(taxi);
  }

  const bldgMat = new THREE.MeshStandardMaterial({ color: "#d9d3c6", roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: "#8d4d3a", roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: "#9ec4d4",
    roughness: 0.15,
    metalness: 0.3,
    emissive: "#1a3038",
    emissiveIntensity: 0.3,
  });
  const terminal = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(34, 8, 70), bldgMat);
  block.position.y = 4;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(36, 0.6, 72), roofMat);
  roof.position.y = 8.2;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 16, 6), bldgMat);
  tower.position.set(14, 8, -28);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 8), glassMat);
  cab.position.set(14, 17.2, -28);
  terminal.add(block, roof, tower, cab);
  terminal.position.set(center.x + r.x * 210 + f.x * 80, 0, center.z + r.z * 210 + f.z * 80);
  {
    const b = basis(RWY_YAW, 0, 0);
    _x.set(b.r.x, b.r.y, b.r.z);
    _y.set(b.u.x, b.u.y, b.u.z);
    _z.set(b.f.x, b.f.y, b.f.z);
    _m.makeBasis(_x, _y, _z);
    terminal.quaternion.setFromRotationMatrix(_m);
  }
  terminal.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  scene.add(terminal);

  const hangar = new THREE.Mesh(
    new THREE.BoxGeometry(28, 7, 22),
    new THREE.MeshStandardMaterial({ color: "#c5bfb2", roughness: 0.85 }),
  );
  hangar.position.set(center.x + r.x * 200 - f.x * 140, 3.5, center.z + r.z * 200 - f.z * 140);
  hangar.castShadow = true;
  hangar.receiveShadow = true;
  scene.add(hangar);

  const butteMat = new THREE.MeshStandardMaterial({ color: "#8a7352", roughness: 1 });
  const butteGeo = new THREE.ConeGeometry(1, 1, 6);
  const buttes: Array<[number, number, number, number]> = [
    [-2200, -2600, 520, 340],
    [-900, -3400, 380, 210],
    [1600, -2800, 640, 260],
    [2800, -600, 420, 180],
    [-3000, 400, 700, 300],
  ];
  for (const [x, z, radius, height] of buttes) {
    const mesh = new THREE.Mesh(butteGeo, butteMat);
    mesh.scale.set(radius, height, radius);
    mesh.position.set(x, height * 0.5, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  const bushGeo = new THREE.ConeGeometry(1.1, 2.4, 5);
  const bushMat = new THREE.MeshStandardMaterial({ color: "#6f7a48", roughness: 1 });
  const bushes = new THREE.InstancedMesh(bushGeo, bushMat, 220);
  const dummy = new THREE.Object3D();
  let n = 0;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  while (n < 220) {
    const x = (rnd() - 0.5) * 7000;
    const z = (rnd() - 0.5) * 7000;
    if (distToCenterline(x, z) < 80) continue;
    if (Math.hypot(x - center.x - r.x * 210, z - center.z - r.z * 210) < 80) continue;
    dummy.position.set(x, 0, z);
    const s = 0.5 + rnd() * 1.1;
    dummy.scale.set(s, 0.6 + rnd() * 1.2, s);
    dummy.rotation.y = rnd() * 6;
    dummy.updateMatrix();
    bushes.setMatrixAt(n, dummy.matrix);
    n++;
  }
  bushes.instanceMatrix.needsUpdate = true;
  scene.add(bushes);

  const sockPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 8, 6),
    new THREE.MeshStandardMaterial({ color: "#d9d3c6", roughness: 0.6 }),
  );
  const sockBase = THRESH_X - r.x * 42 + f.x * 50;
  const sockBaseZ = THRESH_Z - r.z * 42 + f.z * 50;
  sockPole.position.set(sockBase, 4, sockBaseZ);
  scene.add(sockPole);
  const sock = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 2.4, 8),
    new THREE.MeshStandardMaterial({ color: "#e24b3a", roughness: 0.7 }),
  );
  sock.rotation.x = Math.PI / 2;
  const windLen = Math.hypot(WIND_X, WIND_Z) || 1;
  sock.position.set(sockBase + (WIND_X / windLen) * 1.3, 7.6, sockBaseZ + (WIND_Z / windLen) * 1.3);
  sock.lookAt(sock.position.x + WIND_X, sock.position.y, sock.position.z + WIND_Z);
  scene.add(sock);

  const playerCraft = buildTrainer(0x1d3557);
  const trafficCraft = buildTrainer(0xe0a32a);
  scene.add(playerCraft.group, trafficCraft.group);

  const blobGeo = new THREE.CircleGeometry(6, 20);
  blobGeo.rotateX(-Math.PI / 2);
  const blobMat = new THREE.MeshBasicMaterial({ color: 0x1a140c, transparent: true, opacity: 0.28, depthWrite: false });
  const blobA = new THREE.Mesh(blobGeo, blobMat);
  const blobB = new THREE.Mesh(blobGeo, blobMat.clone());
  scene.add(blobA, blobB);

  let camReady = false;
  let lastCam: CamMode | null = null;
  let elapsed = 0;

  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  function placeBlob(blob: THREE.Mesh, ship: Ship) {
    blob.position.set(ship.x, 0.35, ship.z);
    const s = Math.max(0.35, 1.15 - ship.y / 90);
    blob.scale.setScalar(s);
    (blob.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.32 - ship.y / 240);
  }

  function render(player: Ship, traffic: Ship, dt: number, cam: CamMode, weather: Readonly<Weather> = DEFAULT_WEATHER) {
    elapsed += dt;
    const wind = windAt(weather, sockBase, sockBaseZ);
    const windSpeed = Math.hypot(wind.x, wind.z);
    sock.position.set(sockBase + wind.x / Math.max(windSpeed, 1) * 1.3, 7.6, sockBaseZ + wind.z / Math.max(windSpeed, 1) * 1.3);
    if (windSpeed > 0.05) sock.lookAt(sock.position.x + wind.x, sock.position.y, sock.position.z + wind.z);
    else sock.lookAt(sock.position.x, sock.position.y - 1, sock.position.z);
    if (cam !== lastCam) {
      camReady = false;
      lastCam = cam;
    }
    playerCraft.group.visible = cam !== "cockpit";
    blobA.visible = cam !== "cockpit";
    applyAttitude(playerCraft.group, player);
    applyAttitude(trafficCraft.group, traffic);
    playerCraft.prop.rotation.z += (player.rpm / 60) * Math.PI * 2 * dt;
    trafficCraft.prop.rotation.z += (traffic.rpm / 60) * Math.PI * 2 * dt;
    const blink = Math.sin(elapsed * 5.2) > 0.55 ? 1.6 : 0.05;
    (playerCraft.beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    (trafficCraft.beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    placeBlob(blobA, player);
    placeBlob(blobB, traffic);

    const b = basis(player.yaw, player.pitch, player.roll);
    _fwd.set(b.f.x, 0, b.f.z);
    if (_fwd.lengthSq() < 1e-4) _fwd.set(0, 0, -1);
    _fwd.normalize();

    if (cam === "cockpit") {
      camera.position.set(
        player.x + b.f.x * 0.55 + b.u.x * 1.05,
        player.y + b.f.y * 0.55 + b.u.y * 1.05,
        player.z + b.f.z * 0.55 + b.u.z * 1.05,
      );
      camera.up.set(b.u.x, b.u.y, b.u.z);
      _look.set(
        camera.position.x + b.f.x * 100,
        camera.position.y + b.f.y * 100,
        camera.position.z + b.f.z * 100,
      );
      camReady = true;
    } else if (cam === "tower") {
      camera.up.set(0, 1, 0);
      _desired.set(center.x + r.x * 260, 28, center.z + r.z * 260);
      _look.set(player.x, player.y + 2, player.z);
      if (!camReady) camera.position.copy(_desired);
      else camera.position.lerp(_desired, 1 - Math.exp(-2 * dt));
      camReady = true;
    } else if (cam === "wing") {
      camera.up.set(0, 1, 0);
      _desired.set(
        player.x - b.r.x * 7 + b.u.x * 1.4 - _fwd.x * 1.5,
        player.y - b.r.y * 7 + b.u.y * 1.4 + 1.4,
        player.z - b.r.z * 7 + b.u.z * 1.4 - _fwd.z * 1.5,
      );
      _look.set(player.x + _fwd.x * 40, player.y + 1, player.z + _fwd.z * 40);
      camera.position.copy(_desired);
      camReady = true;
    } else if (cam === "spot") {
      camera.up.set(0, 1, 0);
      _desired.set(
        player.x - b.f.x * 20 + b.r.x * 15 + b.u.x * 8,
        player.y - b.f.y * 20 + b.r.y * 15 + b.u.y * 8,
        player.z - b.f.z * 20 + b.r.z * 15 + b.u.z * 8,
      );
      _look.set(
        player.x - b.u.x * 5,
        player.y - b.u.y * 5,
        player.z - b.u.z * 5,
      );
      if (!camReady) camera.position.copy(_desired);
      else camera.position.lerp(_desired, 1 - Math.exp(-3.2 * dt));
      camReady = true;
    } else {
      camera.up.set(0, 1, 0);
      _desired.set(player.x - _fwd.x * 18, player.y + 6.4, player.z - _fwd.z * 18);
      _look.set(player.x, player.y + 1.1, player.z);
      if (!camReady) {
        camera.position.copy(_desired);
      } else {
        camera.position.lerp(_desired, 1 - Math.exp(-3.2 * dt));
      }
      camReady = true;
    }
    if (cam !== "cockpit" && camera.position.y < 1.6) camera.position.y = 1.6;
    camera.lookAt(_look);

    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
  }

  resize();
  return { render, resize, dispose, setNight };
}
