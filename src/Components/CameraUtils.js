// src/Components/CameraUtils.js
import * as THREE from "three";
import { gsap } from "gsap";

// Vettori riutilizzati per evitare allocazioni ad ogni chiamata
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vC = new THREE.Vector3();
const _edge1 = new THREE.Vector3();
const _edge2 = new THREE.Vector3();
const _faceNormal = new THREE.Vector3();

/**
 * Analizza le facce del mesh per trovare il lato "esterno" dell'edificio.
 *
 * Algoritmo:
 * 1. Per ogni triangolo calcola la normale (non normalizzata → lunghezza = 2 × area)
 * 2. La trasforma nello spazio world (applica rotazione del mesh)
 * 3. La pesa ulteriormente per quanto si allinea con la direzione
 *    "dall'origine della scena verso il centro dell'edificio" (direzione outward)
 * 4. Somma tutti i contributi → il vettore risultante punta verso il lato più esposto
 *
 * Funziona bene per edifici con più dettaglio geometrico sul fronte,
 * e per layout masterplan dove i fronti tendono a guardare verso l'esterno.
 * Fallback: direzione outward pura se il mesh è troppo simmetrico.
 */
function computeFrontDirection(mesh) {
  const geometry = mesh.geometry;
  if (!geometry?.attributes?.position) return null;

  const box = new THREE.Box3().setFromObject(mesh);
  const buildingCenter = box.getCenter(new THREE.Vector3());

  // Direzione "verso l'esterno" del masterplan: dal centro scena all'edificio
  const outward = new THREE.Vector3(buildingCenter.x, 0, buildingCenter.z);
  if (outward.lengthSq() < 0.0001) return null;
  outward.normalize();

  const pos = geometry.attributes.position;
  const idx = geometry.index;
  const triCount = idx ? idx.count / 3 : pos.count / 3;

  const accumulated = new THREE.Vector3();

  for (let i = 0; i < triCount; i++) {
    const a = idx ? idx.getX(i * 3) : i * 3;
    const b = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const c = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;

    _vA.fromBufferAttribute(pos, a);
    _vB.fromBufferAttribute(pos, b);
    _vC.fromBufferAttribute(pos, c);

    _edge1.subVectors(_vB, _vA);
    _edge2.subVectors(_vC, _vA);
    _faceNormal.crossVectors(_edge1, _edge2);
    // Non normalizziamo: la lunghezza = 2 × area del triangolo (peso automatico)

    // Porta la normale nello spazio world (rotazione del mesh)
    _faceNormal.transformDirection(mesh.matrixWorld);

    // Peso aggiuntivo: quanto questa faccia guarda verso "fuori" del masterplan
    // dot > 0 → faccia esterna, dot ≤ 0 → faccia interna → scartata
    const dot = Math.max(
      0,
      _faceNormal.x * outward.x + _faceNormal.z * outward.z,
    );

    accumulated.x += _faceNormal.x * dot;
    accumulated.z += _faceNormal.z * dot;
  }

  if (accumulated.x === 0 && accumulated.z === 0) return outward; // fallback simmetria

  return new THREE.Vector3(accumulated.x, 0, accumulated.z).normalize();
}

/**
 * Calcola automaticamente posizione camera e lookAt partendo dal bounding box del mesh.
 * La direzione di approccio è determinata dalla normale del fronte dell'edificio.
 */
export function computeCameraFromMesh(mesh, camera, minDistance = 15) {
  const box = new THREE.Box3().setFromObject(mesh);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Footprint XZ per calcolare la distanza necessaria
  const footprint = Math.max(size.x, size.z, 0.5);

  // Distanza basata sul FOV: d = (footprint/2) / tan(fov/2), con padding 1.5x
  const fovRad = ((camera?.fov ?? 35) * Math.PI) / 180;
  const distance = Math.max((footprint / 2 / Math.tan(fovRad / 2)) * 1.5, minDistance);
  //const distance = (footprint / 2 / Math.tan(fovRad / 2)) * 1.5;

  // Direzione del fronte dell'edificio (fallback: leggermente di lato)
  const front =
    computeFrontDirection(mesh) ?? new THREE.Vector3(0.9, 0, 0.1).normalize();

  const cameraPosition = new THREE.Vector3(
    center.x + front.x * distance,
    center.y + distance,
    center.z + front.z * distance,
  );

  return { cameraPosition, lookAt: center.clone() };
}

/**
 * Muove la camera verso un oggetto (mesh) o verso coordinate specifiche.
 * Se non sono definite coordinate custom, calcola automaticamente dal bounding box.
 */
export function moveCameraToObject(camera, controls, mesh, options = {}) {
  const { customPosition, customTarget } = options;
  const minDist = controls?.minDistance ?? 15;
  const auto = computeCameraFromMesh(mesh, camera, minDist);

  //const auto = computeCameraFromMesh(mesh, camera);

  const lookTarget = customTarget
    ? new THREE.Vector3(...customTarget)
    : auto.lookAt;

  const targetPos = customPosition
    ? new THREE.Vector3(...customPosition)
    : auto.cameraPosition;

  if (controls) controls.enabled = false;

  // ----------------------------
  // 🔥 SAFE BOUNDING SPHERE
  // ----------------------------
  const sphere = new THREE.Sphere();
  new THREE.Box3().setFromObject(mesh).getBoundingSphere(sphere);

  const safeRadius = sphere.radius * 2.2;

  // ----------------------------
  // CAMERA BASE (NO SCATTI)
  // ----------------------------
  const currentPos = camera.position.clone();

  // IMPORTANTISSIMO: aggiorna world matrix per evitare offset sporchi
  camera.updateMatrixWorld(true);

  const startOffsetRaw = currentPos.clone().sub(lookTarget);

  const startRadiusRaw = Math.hypot(startOffsetRaw.x, startOffsetRaw.z);
  const startRadius = Math.max(startRadiusRaw, safeRadius);

  // normalizza posizione iniziale su orbita coerente (FIX SCATTO)
  const startOffset = new THREE.Vector3(
    (startOffsetRaw.x / Math.max(startRadiusRaw, 0.0001)) * startRadius,
    startOffsetRaw.y,
    (startOffsetRaw.z / Math.max(startRadiusRaw, 0.0001)) * startRadius
  );

  const startPos = lookTarget.clone().add(startOffset);

  // ----------------------------
  // END OFFSET
  // ----------------------------
  const endOffsetRaw = targetPos.clone().sub(lookTarget);

  const endRadiusRaw = Math.hypot(endOffsetRaw.x, endOffsetRaw.z);
  const endRadius = Math.max(endRadiusRaw, safeRadius);

  // ----------------------------
  // ANGOLI ORBITA
  // ----------------------------
  let startAngle = Math.atan2(startOffset.z, startOffset.x);
  let endAngle = Math.atan2(endOffsetRaw.z, endOffsetRaw.x);

  let deltaAngle = endAngle - startAngle;

  if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
  if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

  const maxAngle = Math.PI * 0.85;
  deltaAngle = THREE.MathUtils.clamp(deltaAngle, -maxAngle, maxAngle);

  // ----------------------------
  // HEIGHT
  // ----------------------------
  const startHeight = startOffset.y;
  const endHeight = targetPos.y - lookTarget.y;

  // ----------------------------
  // TARGET STABILE (NO SCATTO)
  // ----------------------------
  const startTarget = controls?.target?.clone?.() ?? lookTarget.clone();

  const tweenData = { t: 0 };

  gsap.to(tweenData, {
    t: 1,
    duration: 2.4,
    ease: "sine.inOut",

    onUpdate: () => {
      const t = tweenData.t;

      const angle = startAngle + deltaAngle * t;
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);
      const height = THREE.MathUtils.lerp(startHeight, endHeight, t);

      const x = lookTarget.x + Math.cos(angle) * radius;
      const z = lookTarget.z + Math.sin(angle) * radius;
      const y = lookTarget.y + height;

      camera.position.set(x, y, z);

      if (controls?.target) {
        controls.target.lerpVectors(startTarget, lookTarget, t);
        controls.update?.();
      }
    },

    onComplete: () => {
      if (controls) {
        controls.target.copy(lookTarget);
        controls.enabled = true;
        controls.update?.();
      }
    }
  });
}
/**
 * Muove la camera direttamente a coordinate specifiche (senza bisogno di un mesh).
 * Utile per la ricerca quando si seleziona un edificio.
 */
export function moveCameraToPosition(
  camera,
  controls,
  cameraPosition,
  lookAt = [0, 0, 0],
) {
  if (!cameraPosition) return;

  const targetPos = new THREE.Vector3(...cameraPosition);
  const lookTarget = new THREE.Vector3(...lookAt);

  // 🔒 Disabilita controlli durante il movimento
  if (controls) controls.enabled = false;

  // Imposta il target prima di muoversi
  if (controls?.target) {
    controls.target.copy(lookTarget);
    controls.update?.();
  }

  // 🎥 Animazione fluida
  gsap.to(camera.position, {
    duration: 1.5,
    x: targetPos.x,
    y: targetPos.y,
    z: targetPos.z,
    ease: "power2.out",
    onUpdate: () => {
      camera.lookAt(lookTarget);
    },
    onComplete: () => {
      if (controls) {
        controls.enabled = true;
        controls.target.copy(lookTarget);
        controls.update?.();
      }
    },
  });
}

// Funzione per riportare la camera a una posizione salvata (smooth e coerente)
export function resetCamera(
  camera,
  controls,
  position = [-3.02, 31.26, 47.29],
  target = [-3.02, 0, 8.27],
  onComplete = null,
) {
  if (controls) controls.enabled = false;

  const lookTarget = new THREE.Vector3(...target);
  const targetPos = new THREE.Vector3(...position);

  const startPos = camera.position.clone();

  // ----------------------------
  // SAFE RADIUS (coerenza con andata)
  // ----------------------------
  const startOffsetRaw = startPos.clone().sub(lookTarget);
  const endOffsetRaw = targetPos.clone().sub(lookTarget);

  const startRadius = Math.hypot(startOffsetRaw.x, startOffsetRaw.z);
  const endRadius = Math.hypot(endOffsetRaw.x, endOffsetRaw.z);

  // ----------------------------
  // ANGOLI ORBITA
  // ----------------------------
  let startAngle = Math.atan2(startOffsetRaw.z, startOffsetRaw.x);
  let endAngle = Math.atan2(endOffsetRaw.z, endOffsetRaw.x);

  let deltaAngle = endAngle - startAngle;

  if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
  if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

  const maxAngle = Math.PI * 0.85;
  deltaAngle = THREE.MathUtils.clamp(deltaAngle, -maxAngle, maxAngle);

  // ----------------------------
  // HEIGHT
  // ----------------------------
  const startHeight = startOffsetRaw.y;
  const endHeight = targetPos.y - lookTarget.y;

  const startTarget = controls?.target?.clone?.() ?? lookTarget.clone();

  const tweenData = { t: 0 };

  gsap.to(tweenData, {
    t: 1,
    duration: 2.4,
    ease: "sine.inOut",

    onUpdate: () => {
      const t = tweenData.t;

      const angle = startAngle + deltaAngle * t;
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, t);
      const height = THREE.MathUtils.lerp(startHeight, endHeight, t);

      const x = lookTarget.x + Math.cos(angle) * radius;
      const z = lookTarget.z + Math.sin(angle) * radius;
      const y = lookTarget.y + height;

      camera.position.set(x, y, z);

      if (controls?.target) {
        controls.target.lerpVectors(startTarget, lookTarget, t);
        controls.update?.();
      }
    },

    onComplete: () => {
      if (controls) {
        controls.target.copy(lookTarget);
        controls.enabled = true;
        controls.update?.();
      }
      onComplete?.();
    }
  });
}
