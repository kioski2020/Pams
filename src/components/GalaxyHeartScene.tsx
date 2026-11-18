import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface GalaxyHeartSceneProps {
  visible: boolean;
  photos: string[];
  onBackToHeart: () => void;
}

const COSMIC_PHRASES = [
  'I LOVE YOU ❤',
  'MAHAL KITA ❤',
  'GIHIGUGMA TIKA ❤',
  'AY-AYATEN KA',
  'KALUGURAN DAKA',
  'PALANGGA TA KA',
  'TE AMO ❤',
  'JE T’AIME',
  'TI AMO',
  'EU TE AMO',
  'ICH LIEBE DICH',
  'IK HOU VAN JOU',
  '사랑해 ❤',
  '愛してる',
  '我爱你 ❤',
  'ฉันรักคุณ',
  'ANH YÊU EM',
  'AKU CINTA KAMU',
  'SAYA CINTAKANMU',
  'JAG ÄLSKAR DIG',
  'JEG ELSKER DEG',
  'RAKASTAN SINUA',
  'ÉG ELSKA ÞIG',
  'TÁ GRÁ AGAM DUIT',
  'THA GAOL AGAM ORT',
  'RWI’N DY GARU DI',
  'KOCHAM CIĘ',
  'MILUJI TĚ',
  'ĽÚBIM ŤA',
  'SZERETLEK ❤',
  'TE IUBESC',
  'VOLIM TE ❤',
  'ОБИЧАМ ТЕ',
  'Я ТЕБЕ КОХАЮ ❤',
  'Я ТЕБЯ ЛЮБЛЮ',
  'Σ’ ΑΓΑΠΩ',
  'SENİ SEVİYORUM',
  'T’ESTIMO ❤',
  'MAITE ZAITUT',
  'AŠ TAVE MYLIU',
  'ES TEVI MĪLU',
  'MA ARMASTAN SIND',
  'أحبك ❤',
  'دوستت دارم ❤',
  'मैं तुमसे प्यार करता हूँ',
  'আমি তোমায় ভালোবাসি',
  'நான் உன்னை காதலிக்கிறேன்',
  'म तिमीलाई माया गर्छु',
  'ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ',
  'បងស្រលាញ់អូន',
  'ຂ້ອຍຮັກເຈົ້າ',
  'NAKUPENDA ❤',
  'NGIYAKUTHANDA ❤',
  'MO NIFẸ RẸ',
  'ALOHA AU IA OE',
  'AROHA NUI KI A KOE',
  'OU TE ALOFA IA TE OE',
  'BEBE PAMS ❤',
];

// Reusable math helpers outside render loop (zero GC)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function createSoftGlowTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.28, 'rgba(255, 240, 250, 0.85)');
  grad.addColorStop(0.6, 'rgba(255, 160, 220, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createAccretionCoronaTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 18, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.24, 'rgba(255, 230, 140, 0.92)');
  grad.addColorStop(0.38, 'rgba(255, 165, 55, 0.72)');
  grad.addColorStop(0.58, 'rgba(244, 63, 94, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

// Fast multi-stroke neon portal texture (zero slow shadowBlur!)
function createPortalVortexTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 384;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  const bg = ctx.createRadialGradient(half, half, 32, half, half, half - 4);
  bg.addColorStop(0, 'rgba(0, 0, 0, 0)');
  bg.addColorStop(0.18, 'rgba(255, 255, 255, 0.95)');
  bg.addColorStop(0.27, 'rgba(253, 224, 71, 0.92)');
  bg.addColorStop(0.4, 'rgba(236, 72, 153, 0.78)');
  bg.addColorStop(0.62, 'rgba(34, 211, 238, 0.34)');
  bg.addColorStop(0.84, 'rgba(168, 85, 247, 0.12)');
  bg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(half, half);
  ctx.lineCap = 'round';
  for (let arm = 0; arm < 8; arm++) {
    ctx.save();
    ctx.rotate((arm / 8) * Math.PI * 2);
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.05) {
      const r = 38 + t * (half - 48);
      const a = t * 2.25;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Wide soft outer halo stroke + crisp inner neon stroke (replaces slow GPU/CPU blur)
    ctx.strokeStyle = arm % 2 === 0 ? 'rgba(34, 211, 238, 0.24)' : 'rgba(236, 72, 153, 0.26)';
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.strokeStyle =
      arm % 3 === 0
        ? 'rgba(255, 255, 255, 0.75)'
        : arm % 3 === 1
          ? 'rgba(103, 232, 249, 0.72)'
          : 'rgba(255, 130, 198, 0.78)';
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createStarFlareTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 96;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  const halo = ctx.createRadialGradient(half, half, 0, half, half, half - 4);
  halo.addColorStop(0, 'rgba(255, 255, 255, 1)');
  halo.addColorStop(0.22, 'rgba(255, 240, 250, 0.85)');
  halo.addColorStop(0.5, 'rgba(255, 180, 230, 0.22)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(half, half);
  for (let rot = 0; rot < 2; rot++) {
    ctx.save();
    ctx.rotate((rot * Math.PI) / 2);
    const spike = ctx.createLinearGradient(-(half - 4), 0, half - 4, 0);
    spike.addColorStop(0, 'rgba(255, 255, 255, 0)');
    spike.addColorStop(0.42, 'rgba(255, 245, 255, 0.72)');
    spike.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    spike.addColorStop(0.58, 'rgba(255, 245, 255, 0.72)');
    spike.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spike;
    ctx.beginPath();
    ctx.moveTo(-(half - 4), 0);
    ctx.quadraticCurveTo(0, -3.5, half - 4, 0);
    ctx.quadraticCurveTo(0, 3.5, -(half - 4), 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createShockwaveTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 256;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(half, half, 34, half, half, half - 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.46, 'rgba(34, 211, 238, 0.3)');
  grad.addColorStop(0.64, 'rgba(253, 224, 71, 0.92)');
  grad.addColorStop(0.78, 'rgba(236, 72, 153, 0.92)');
  grad.addColorStop(0.92, 'rgba(168, 85, 247, 0.32)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

// Fast multi-pass neon phrase texture (eliminates slow CPU Canvas shadowBlur!)
function createGlowPhraseTexture(
  text: string,
  renderer: THREE.WebGLRenderer,
  goldAccent = false
): THREE.CanvasTexture {
  const w = 384;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  let fontSize = 26;
  ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  const measured = ctx.measureText(text).width;
  if (measured > 340) {
    fontSize = Math.max(15, Math.floor((340 / measured) * fontSize));
    ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  }

  // Soft wide outer halo stroke
  ctx.strokeStyle = goldAccent ? 'rgba(245, 158, 11, 0.28)' : 'rgba(255, 42, 133, 0.28)';
  ctx.lineWidth = 10;
  ctx.strokeText(text, w / 2, h / 2);

  // Tight medium neon aura stroke
  ctx.strokeStyle = goldAccent ? 'rgba(251, 191, 36, 0.52)' : 'rgba(255, 105, 180, 0.55)';
  ctx.lineWidth = 4.2;
  ctx.strokeText(text, w / 2, h / 2);

  // Crisp luminous white foreground core
  ctx.fillStyle = goldAccent ? '#fef9c3' : '#ffffff';
  ctx.fillText(text, w / 2, h / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

function createHeartOrbTexture(renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const size = 96;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const s = size / 128;

  // Radial glow halo (zero slow shadowBlur)
  const aura = ctx.createRadialGradient(48, 52, 8, 48, 48, 46);
  aura.addColorStop(0, 'rgba(255, 59, 154, 0.55)');
  aura.addColorStop(1, 'rgba(255, 59, 154, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.scale(s, s);
  const grad = ctx.createRadialGradient(50, 44, 6, 64, 68, 56);
  grad.addColorStop(0, '#ffd6ea');
  grad.addColorStop(0.45, '#ff69b4');
  grad.addColorStop(1, '#db2777');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(64, 102);
  ctx.bezierCurveTo(18, 74, 16, 40, 36, 26);
  ctx.bezierCurveTo(50, 16, 61, 26, 64, 34);
  ctx.bezierCurveTo(67, 26, 78, 16, 92, 26);
  ctx.bezierCurveTo(112, 40, 110, 74, 64, 102);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(44, 42, 7, 11, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

// Fast circular medallion texture with deferred/staggered image loader
function createCircularPhotoTexture(
  src: string | null,
  renderer: THREE.WebGLRenderer
): { texture: THREE.CanvasTexture; loadSrc: (nextSrc: string) => void } {
  const size = 224;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const drawPlaceholder = () => {
    ctx.clearRect(0, 0, size, size);
    const bg = ctx.createRadialGradient(half, half, 10, half, half, half - 14);
    bg.addColorStop(0, '#fff5f8');
    bg.addColorStop(1, '#fbcfe8');
    ctx.beginPath();
    ctx.arc(half, half, half - 16, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  drawPlaceholder();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  let loaded = false;
  const loadSrc = (photoSrc: string) => {
    if (loaded || !photoSrc) return;
    loaded = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);

      // Fast radial pink aura halo behind circular photo
      const aura = ctx.createRadialGradient(half, half, half - 22, half, half, half);
      aura.addColorStop(0, 'rgba(255, 105, 180, 0.75)');
      aura.addColorStop(1, 'rgba(255, 105, 180, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.beginPath();
      ctx.arc(half, half, half - 18, 0, Math.PI * 2);
      ctx.clip();

      const innerDia = (half - 18) * 2;
      const scale = Math.max(innerDia / img.width, innerDia / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, half - dw / 2, half - dh / 2, dw, dh);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(half, half, half - 17, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#fff1f5';
      ctx.stroke();

      tex.needsUpdate = true;
    };
    img.src = photoSrc;
  };

  if (src) loadSrc(src);
  return { texture: tex, loadSrc };
}

export function GalaxyHeartScene({
  visible,
  photos,
  onBackToHeart,
}: GalaxyHeartSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [replayNonce, setReplayNonce] = useState(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const scaleDensity = isSoftwareGl ? 0.6 : 1;
    const width = Math.max(320, container.clientWidth || window.innerWidth);
    const height = Math.max(320, container.clientHeight || window.innerHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020107);
    scene.fog = new THREE.FogExp2(0x020107, 0.0026);

    const camera = new THREE.PerspectiveCamera(72, width / height, 0.1, 280);
    camera.position.set(0, 0.4, 58);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 7;
    controls.maxDistance = 74;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.52;
    controls.update();

    let cameraIntroActive = true;
    const cancelIntroCamera = () => {
      cameraIntroActive = false;
      controls.autoRotate = true;
    };
    controls.addEventListener('start', cancelIntroCamera);

    const disposables: Array<{ dispose: () => void }> = [];

    const glowTex = createSoftGlowTexture(renderer);
    const coronaTex = createAccretionCoronaTexture(renderer);
    const portalTex = createPortalVortexTexture(renderer);
    const starFlareTex = createStarFlareTexture(renderer);
    const shockwaveTex = createShockwaveTexture(renderer);
    const heartOrbTex = createHeartOrbTexture(renderer);
    disposables.push(glowTex, coronaTex, portalTex, starFlareTex, shockwaveTex, heartOrbTex);

    // 1A. Abundant Deep Background Star Dome (360° around the galaxy heart, fog: false)
    const bgCount = Math.round(2800 * scaleDensity);
    const bgPos = new Float32Array(bgCount * 3);
    const bgCol = new Float32Array(bgCount * 3);
    const tmpColor = new THREE.Color();
    const starTints = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#e0f2fe'),
      new THREE.Color('#fef3c7'),
      new THREE.Color('#fce7f3'),
      new THREE.Color('#ddd6fe'),
    ];
    for (let i = 0; i < bgCount; i++) {
      const r = 34 + Math.random() * 92;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      bgPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgPos[i * 3 + 1] = r * Math.cos(phi);
      bgPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const tint = starTints[i % starTints.length];
      const lum = 0.78 + Math.random() * 0.22;
      bgCol[i * 3] = tint.r * lum;
      bgCol[i * 3 + 1] = tint.g * lum;
      bgCol[i * 3 + 2] = tint.b * lum;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('color', new THREE.BufferAttribute(bgCol, 3));
    const bgMat = new THREE.PointsMaterial({
      size: 0.78,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);
    disposables.push(bgGeo, bgMat);

    // 1B. Twinkling 4-Point Hero Sparkle Stars framing the Galaxy Heart
    const heroStarCount = Math.round(240 * scaleDensity);
    const heroPos = new Float32Array(heroStarCount * 3);
    const heroCol = new Float32Array(heroStarCount * 3);
    for (let i = 0; i < heroStarCount; i++) {
      const r = 22 + Math.random() * 44;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      heroPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      heroPos[i * 3 + 1] = r * Math.cos(phi);
      heroPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const tint = starTints[(i * 3) % starTints.length];
      heroCol[i * 3] = tint.r;
      heroCol[i * 3 + 1] = tint.g;
      heroCol[i * 3 + 2] = tint.b;
    }
    const heroGeo = new THREE.BufferGeometry();
    heroGeo.setAttribute('position', new THREE.BufferAttribute(heroPos, 3));
    heroGeo.setAttribute('color', new THREE.BufferAttribute(heroCol, 3));
    const heroMat = new THREE.PointsMaterial({
      size: 1.65,
      map: starFlareTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const heroStars = new THREE.Points(heroGeo, heroMat);
    scene.add(heroStars);
    disposables.push(heroGeo, heroMat);

    // 1C. 3D Shooting Stars Streaking Around the Galaxy Heart
    const shootingStarCount = 14;
    const trailSteps = 10;
    const shootTrailPos = new Float32Array(shootingStarCount * trailSteps * 6);
    const shootTrailCol = new Float32Array(shootingStarCount * trailSteps * 6);
    const shootHeadPos = new Float32Array(shootingStarCount * 3);
    const shootHeadCol = new Float32Array(shootingStarCount * 3);

    interface ShootingStarState {
      origin: THREE.Vector3;
      dir: THREE.Vector3;
      color: THREE.Color;
      age: number;
      duration: number;
      wait: number;
      speed: number;
      tailLen: number;
    }

    const shootPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#fde047'),
      new THREE.Color('#ff85c0'),
      new THREE.Color('#7dd3fc'),
    ];
    const shootingStars: ShootingStarState[] = [];

    const resetShootingStar = (s: ShootingStarState, initialDelay: number) => {
      const r = 28 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      s.origin.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.72 + 4,
        r * Math.sin(phi) * Math.sin(theta)
      );

      _v1.copy(s.origin).normalize();
      _v2.set(Math.random() - 0.5, -0.35 - Math.random() * 0.45, Math.random() - 0.5).normalize();
      _v3.crossVectors(_v1, _v2);
      if (_v3.lengthSq() < 0.01) _v3.set(1, -0.4, 0.3);
      _v3.addScaledVector(_v2, 0.55).normalize();
      s.dir.copy(_v3);

      s.duration = 1.0 + Math.random() * 0.65;
      s.age = 0;
      s.wait = initialDelay;
      s.speed = 30 + Math.random() * 22;
      s.tailLen = 5.5 + Math.random() * 5.0;
    };

    for (let i = 0; i < shootingStarCount; i++) {
      const s: ShootingStarState = {
        origin: new THREE.Vector3(),
        dir: new THREE.Vector3(),
        color: shootPalette[i % shootPalette.length],
        age: 0,
        duration: 1.2,
        wait: 0,
        speed: 36,
        tailLen: 7,
      };
      resetShootingStar(s, 0.35 + (i % 5) * 0.55 + Math.random() * 0.6);
      shootingStars.push(s);
    }

    const shootTrailGeo = new THREE.BufferGeometry();
    shootTrailGeo.setAttribute('position', new THREE.BufferAttribute(shootTrailPos, 3));
    shootTrailGeo.setAttribute('color', new THREE.BufferAttribute(shootTrailCol, 3));
    const shootTrailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const shootTrailLines = new THREE.LineSegments(shootTrailGeo, shootTrailMat);
    shootTrailLines.frustumCulled = false;
    shootTrailLines.visible = false;
    scene.add(shootTrailLines);
    disposables.push(shootTrailGeo, shootTrailMat);

    const shootHeadGeo = new THREE.BufferGeometry();
    shootHeadGeo.setAttribute('position', new THREE.BufferAttribute(shootHeadPos, 3));
    shootHeadGeo.setAttribute('color', new THREE.BufferAttribute(shootHeadCol, 3));
    const shootHeadMat = new THREE.PointsMaterial({
      size: 2.35,
      map: starFlareTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const shootHeadPoints = new THREE.Points(shootHeadGeo, shootHeadMat);
    shootHeadPoints.frustumCulled = false;
    shootHeadPoints.visible = false;
    scene.add(shootHeadPoints);
    disposables.push(shootHeadGeo, shootHeadMat);

    // 2A. 3D Curved Spiral Wormhole Vortex Tunnel (Stage 1: 0s .. 3.6s)
    const wormholeCount = Math.round(3200 * scaleDensity);
    const whPos = new Float32Array(wormholeCount * 3);
    const whCol = new Float32Array(wormholeCount * 3);
    const whAngle = new Float32Array(wormholeCount);
    const whRadiusBase = new Float32Array(wormholeCount);
    const whSpeed = new Float32Array(wormholeCount);
    const whSpin = new Float32Array(wormholeCount);

    const whPalette = [
      new THREE.Color('#22d3ee'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#fde047'),
      new THREE.Color('#ff69b4'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < wormholeCount; i++) {
      const z = -6 + Math.random() * 70; // -6 .. 64
      const zNorm = Math.max(0, (z + 6) / 70);
      const streamArm = i % 8;
      const baseAngle = (streamArm / 8) * Math.PI * 2 + z * 0.14 + (Math.random() - 0.5) * 0.4;
      const rFactor = 0.72 + Math.random() * 0.54;

      whAngle[i] = baseAngle;
      whRadiusBase[i] = rFactor;
      whSpeed[i] = 28 + Math.random() * 24;
      whSpin[i] = (i % 2 === 0 ? 1 : 0.74) * (1.25 + Math.random() * 0.75);

      const radius = (1.65 + Math.pow(zNorm, 1.08) * 15.5) * rFactor;
      whPos[i * 3] = Math.cos(baseAngle) * radius;
      whPos[i * 3 + 1] = Math.sin(baseAngle) * radius;
      whPos[i * 3 + 2] = z;

      const c = whPalette[i % whPalette.length];
      whCol[i * 3] = c.r;
      whCol[i * 3 + 1] = c.g;
      whCol[i * 3 + 2] = c.b;
    }

    const whGeo = new THREE.BufferGeometry();
    whGeo.setAttribute('position', new THREE.BufferAttribute(whPos, 3));
    whGeo.setAttribute('color', new THREE.BufferAttribute(whCol, 3));
    const whMat = new THREE.PointsMaterial({
      size: 0.72,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const wormholePoints = new THREE.Points(whGeo, whMat);
    scene.add(wormholePoints);
    disposables.push(whGeo, whMat);

    // 2B. Light-Speed Axial Warp Streak Lines
    const streakCount = Math.round(240 * scaleDensity);
    const streakPos = new Float32Array(streakCount * 6);
    const streakCol = new Float32Array(streakCount * 6);
    const streakData: Array<{ angle: number; r: number; z: number; len: number; speed: number }> = [];
    for (let i = 0; i < streakCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3.2 + Math.random() * 14.0;
      const z = -6 + Math.random() * 68;
      const len = 3.8 + Math.random() * 5.2;
      const speed = 42 + Math.random() * 34;
      streakData.push({ angle, r, z, len, speed });

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      streakPos[i * 6] = x;
      streakPos[i * 6 + 1] = y;
      streakPos[i * 6 + 2] = z;
      streakPos[i * 6 + 3] = x;
      streakPos[i * 6 + 4] = y;
      streakPos[i * 6 + 5] = z - len;

      const c = whPalette[i % 4];
      streakCol[i * 6] = c.r;
      streakCol[i * 6 + 1] = c.g;
      streakCol[i * 6 + 2] = c.b;
      streakCol[i * 6 + 3] = c.r * 0.2;
      streakCol[i * 6 + 4] = c.g * 0.2;
      streakCol[i * 6 + 5] = c.b * 0.2;
    }
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
    streakGeo.setAttribute('color', new THREE.BufferAttribute(streakCol, 3));
    const streakMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const warpStreaks = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(warpStreaks);
    disposables.push(streakGeo, streakMat);

    // 2C. 14 Glowing 3D Portal Tunnel Rings rushing smoothly past the camera
    const portalRingCount = 14;
    const portalRings: Array<{ mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; z: number; speed: number }> = [];
    const portalRingColors = [0x22d3ee, 0xec4899, 0xfde047, 0xff69b4];
    const sharedRingGeo = new THREE.TorusGeometry(1, 0.024, 10, 64);
    disposables.push(sharedRingGeo);
    for (let i = 0; i < portalRingCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: portalRingColors[i % portalRingColors.length],
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(sharedRingGeo, mat);
      const z = 3 + (i / portalRingCount) * 52;
      mesh.position.z = z;
      const zNorm = Math.max(0, (z + 6) / 70);
      const radius = 2.6 + Math.pow(zNorm, 1.08) * 12.2;
      mesh.scale.setScalar(radius);
      scene.add(mesh);
      disposables.push(mat);
      portalRings.push({ mesh, mat, z, speed: 34 });
    }

    // 2D. Swirling Portal Vortex Ring at (0,0,0) -> morphs directly into Black Hole Accretion Disk
    const portalGeo = new THREE.PlaneGeometry(14.5, 14.5);
    const portalMat = new THREE.MeshBasicMaterial({
      map: portalTex,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const portalVortex = new THREE.Mesh(portalGeo, portalMat);
    scene.add(portalVortex);
    disposables.push(portalGeo, portalMat);

    // 2E. Portal Breakthrough Shockwave Ring expanding on the galactic plane
    const shockwaveGeo = new THREE.PlaneGeometry(48, 48);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      map: shockwaveTex,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const portalShockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    portalShockwave.rotation.x = -Math.PI / 2;
    portalShockwave.scale.setScalar(0.08);
    portalShockwave.visible = false;
    scene.add(portalShockwave);
    disposables.push(shockwaveGeo, shockwaveMat);

    // 3. Galaxy Core (hidden during initial wormhole frames so GPU stays 100% locked at 60 FPS!)
    const galaxyGroup = new THREE.Group();
    galaxyGroup.scale.setScalar(0.01);
    galaxyGroup.visible = false;
    scene.add(galaxyGroup);

    // Black Hole Sphere at singularity center
    const bhGeo = new THREE.SphereGeometry(1.55, 36, 28);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(bhGeo, bhMat);
    scene.add(blackHole);
    disposables.push(bhGeo, bhMat);

    // Golden Accretion Corona Disc
    const coronaGeo = new THREE.PlaneGeometry(10.5, 10.5);
    const coronaMat = new THREE.MeshBasicMaterial({
      map: coronaTex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const coronaDisc = new THREE.Mesh(coronaGeo, coronaMat);
    coronaDisc.rotation.x = -Math.PI / 2;
    galaxyGroup.add(coronaDisc);
    disposables.push(coronaGeo, coronaMat);

    const haloSpriteMat = new THREE.SpriteMaterial({
      map: coronaTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const haloSprite = new THREE.Sprite(haloSpriteMat);
    haloSprite.scale.set(6.8, 5.4, 1);
    galaxyGroup.add(haloSprite);
    disposables.push(haloSpriteMat);

    const goldInner = new THREE.Color('#fff7cc');
    const goldMid = new THREE.Color('#fbbf24');
    const goldOuter = new THREE.Color('#fb7185');

    // Accretion Ring Particles
    const ringCount = Math.round(2200 * scaleDensity);
    const ringPos = new Float32Array(ringCount * 3);
    const ringCol = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const t = Math.random();
      const radius = 1.65 + t * 2.35;
      ringPos[i * 3] = Math.cos(angle) * radius;
      ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.22 * (1 - t * 0.5);
      ringPos[i * 3 + 2] = Math.sin(angle) * radius;

      tmpColor.copy(goldInner).lerp(t < 0.6 ? goldMid : goldOuter, t);
      ringCol[i * 3] = tmpColor.r;
      ringCol[i * 3 + 1] = tmpColor.g;
      ringCol[i * 3 + 2] = tmpColor.b;
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
    ringGeo.setAttribute('color', new THREE.BufferAttribute(ringCol, 3));
    const ringMat = new THREE.PointsMaterial({
      size: 0.34,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const accretionRing = new THREE.Points(ringGeo, ringMat);
    galaxyGroup.add(accretionRing);
    disposables.push(ringGeo, ringMat);

    // Spiral Galaxy Arms
    const galaxyCount = Math.round(12500 * scaleDensity);
    const galPos = new Float32Array(galaxyCount * 3);
    const galCol = new Float32Array(galaxyCount * 3);
    const armCount = 4;
    const innerColor = new THREE.Color('#fda4af');
    const midColor = new THREE.Color('#ec4899');
    const outerColor = new THREE.Color('#a855f7');
    const starWhite = new THREE.Color('#fff1f2');

    for (let i = 0; i < galaxyCount; i++) {
      const rNorm = Math.pow(Math.random(), 0.78);
      const radius = 3.2 + rNorm * 23;
      const armIndex = i % armCount;
      const branchAngle = (armIndex / armCount) * Math.PI * 2;
      const spinAngle = radius * 0.36;
      const spread = (0.28 + rNorm * 0.95) * (Math.random() - 0.5) * 2;
      const angle = branchAngle + spinAngle + spread * 0.55;

      galPos[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * (0.6 + rNorm * 1.6);
      galPos[i * 3 + 1] = (Math.random() - 0.5) * (1.2 - rNorm * 0.85) * 1.3;
      galPos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * (0.6 + rNorm * 1.6);

      if (i % 9 === 0) {
        tmpColor.copy(starWhite);
      } else if (rNorm < 0.35) {
        tmpColor.copy(goldMid).lerp(innerColor, rNorm / 0.35);
      } else if (rNorm < 0.72) {
        tmpColor.copy(innerColor).lerp(midColor, (rNorm - 0.35) / 0.37);
      } else {
        tmpColor.copy(midColor).lerp(outerColor, (rNorm - 0.72) / 0.28);
      }

      galCol[i * 3] = tmpColor.r;
      galCol[i * 3 + 1] = tmpColor.g;
      galCol[i * 3 + 2] = tmpColor.b;
    }
    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute('position', new THREE.BufferAttribute(galPos, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(galCol, 3));
    const galMat = new THREE.PointsMaterial({
      size: 0.36,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const spiralGalaxy = new THREE.Points(galGeo, galMat);
    galaxyGroup.add(spiralGalaxy);
    disposables.push(galGeo, galMat);

    // 4. Rising Energy Stream + Volumetric 3D Pink Particle Heart
    const heartGroup = new THREE.Group();
    heartGroup.scale.setScalar(0.01);
    heartGroup.visible = false;
    scene.add(heartGroup);

    const beamCount = Math.round(800 * scaleDensity);
    const beamPos = new Float32Array(beamCount * 3);
    const beamCol = new Float32Array(beamCount * 3);
    const beamPink = new THREE.Color('#ff1493');
    const beamLight = new THREE.Color('#fbcfe8');
    for (let i = 0; i < beamCount; i++) {
      const h = Math.random();
      const y = 1.3 + h * 4.4;
      const spreadR = (0.15 + Math.pow(h, 1.4) * 0.75) * Math.random();
      const ang = Math.random() * Math.PI * 2;
      beamPos[i * 3] = Math.cos(ang) * spreadR;
      beamPos[i * 3 + 1] = y;
      beamPos[i * 3 + 2] = Math.sin(ang) * spreadR;

      tmpColor.copy(beamPink).lerp(beamLight, Math.random() * 0.45);
      beamCol[i * 3] = tmpColor.r;
      beamCol[i * 3 + 1] = tmpColor.g;
      beamCol[i * 3 + 2] = tmpColor.b;
    }
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.BufferAttribute(beamPos, 3));
    beamGeo.setAttribute('color', new THREE.BufferAttribute(beamCol, 3));
    const beamMat = new THREE.PointsMaterial({
      size: 0.36,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const energyBeam = new THREE.Points(beamGeo, beamMat);
    heartGroup.add(energyBeam);
    disposables.push(beamGeo, beamMat);

    const heartCount = Math.round(5200 * scaleDensity);
    const hPos = new Float32Array(heartCount * 3);
    const hCol = new Float32Array(heartCount * 3);
    const heartColors = [
      new THREE.Color('#ff1493'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#ff69b4'),
      new THREE.Color('#f472b6'),
      new THREE.Color('#fbcfe8'),
    ];
    let filled = 0;
    while (filled < heartCount) {
      const x = (Math.random() - 0.5) * 2.6;
      const y = (Math.random() - 0.5) * 2.6;
      const z = (Math.random() - 0.5) * 1.7;
      const a = x * x + 2.25 * z * z + y * y - 1;
      const val = a * a * a - x * x * y * y * y - 0.1125 * z * z * y * y * y;
      if (val <= 0) {
        const shellBias = Math.random() > 0.35 ? 1 : 0.72 + Math.random() * 0.28;
        const scaleHeart = 4.35 * shellBias;
        hPos[filled * 3] = x * scaleHeart;
        hPos[filled * 3 + 1] = 10.2 + y * scaleHeart;
        hPos[filled * 3 + 2] = z * scaleHeart;

        const base = heartColors[filled % heartColors.length];
        hCol[filled * 3] = base.r;
        hCol[filled * 3 + 1] = base.g;
        hCol[filled * 3 + 2] = base.b;
        filled++;
      }
    }
    const heartGeo = new THREE.BufferGeometry();
    heartGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    heartGeo.setAttribute('color', new THREE.BufferAttribute(hCol, 3));
    const heartMat = new THREE.PointsMaterial({
      size: 0.38,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const heartMesh = new THREE.Points(heartGeo, heartMat);
    heartGroup.add(heartMesh);
    disposables.push(heartGeo, heartMat);

    // 5. Orbiters Group — created progressively during wormhole frames so frame 0 launches in <15ms!
    const orbitersGroup = new THREE.Group();
    orbitersGroup.scale.setScalar(0.01);
    orbitersGroup.visible = false;
    scene.add(orbitersGroup);

    interface OrbitItem {
      sprite: THREE.Sprite;
      radius: number;
      angle: number;
      speed: number;
      baseY: number;
      bobAmp: number;
      bobSpeed: number;
    }
    const orbitItems: OrbitItem[] = [];

    // Floating Pink Heart Orbs (lightweight, shared texture)
    for (let i = 0; i < 10; i++) {
      const mat = new THREE.SpriteMaterial({
        map: heartOrbTex,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const s = 1.25 + (i % 3) * 0.45;
      sprite.scale.set(s, s, 1);
      orbitersGroup.add(sprite);
      disposables.push(mat);

      orbitItems.push({
        sprite,
        radius: 7.5 + (i % 4) * 3.4,
        angle: (i / 10) * Math.PI * 2 + 0.2,
        speed: 0.22 + (i % 3) * 0.04,
        baseY: 1.4 + (i % 4) * 1.35,
        bobAmp: 0.85,
        bobSpeed: 2.0 + (i % 3) * 0.35,
      });
    }

    // Staggered builders for 58 Multilingual Phrases + 35 Circular Photo Medallions
    const ringRadii = [9.8, 14.2, 19.0, 24.4];
    const ringSpeeds = [0.2, 0.155, 0.12, 0.095];
    const phraseRingCount = ringRadii.length;
    const countPerRing = Math.ceil(COSMIC_PHRASES.length / phraseRingCount);
    let nextPhraseIdx = 0;

    const photoPool = Array.from(new Set(photos.filter(Boolean)));
    const medallionSlotCount = Math.min(12, photoPool.length);
    interface PhotoMedallionSlot {
      slotIdx: number;
      sprite: THREE.Sprite;
      mat: THREE.SpriteMaterial;
      baseSize: number;
      activePhotoIdx: number;
    }
    const photoMedallions: PhotoMedallionSlot[] = [];
    const photoSlots: Array<{ texture: THREE.CanvasTexture; loadSrc: (s: string) => void }> = [];
    for (let i = 0; i < photoPool.length; i++) {
      const slot = createCircularPhotoTexture(null, renderer);
      photoSlots.push(slot);
      disposables.push(slot.texture);
    }

    for (let idx = 0; idx < medallionSlotCount; idx++) {
      const mat = new THREE.SpriteMaterial({
        map: photoSlots[idx].texture,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      const cardSize = idx % 2 === 0 ? 2.85 : 2.45;
      sprite.scale.set(cardSize, cardSize, 1);
      orbitersGroup.add(sprite);
      disposables.push(mat);

      photoMedallions.push({
        slotIdx: idx,
        sprite,
        mat,
        baseSize: cardSize,
        activePhotoIdx: idx,
      });

      orbitItems.push({
        sprite,
        radius: 9.4 + (idx % 4) * 3.2,
        angle: (idx / Math.max(1, medallionSlotCount)) * Math.PI * 2 + 0.32,
        speed: 0.165 + (idx % 3) * 0.035,
        baseY: 2.3 + (idx % 4) * 1.05,
        bobAmp: 0.65,
        bobSpeed: 1.55 + (idx % 4) * 0.22,
      });
    }
    let nextInitialPhotoIdx = 0;
    let nextExtraPhotoIdx = medallionSlotCount;
    let extraPhotoTimer = 0;

    const addNextPhraseBatch = (count: number) => {
      const end = Math.min(COSMIC_PHRASES.length, nextPhraseIdx + count);
      for (let idx = nextPhraseIdx; idx < end; idx++) {
        const phrase = COSMIC_PHRASES[idx];
        const ring = idx % phraseRingCount;
        const slotInRing = Math.floor(idx / phraseRingCount);
        const goldAccent = idx % 5 === 2;

        const tex = createGlowPhraseTexture(phrase, renderer, goldAccent);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          opacity: 0.96,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(mat);
        const scaleW = ring === 3 ? 6.4 : ring === 2 ? 5.9 : ring === 1 ? 5.2 : 4.6;
        sprite.scale.set(scaleW, scaleW * 0.25, 1);
        orbitersGroup.add(sprite);
        disposables.push(tex, mat);

        orbitItems.push({
          sprite,
          radius: ringRadii[ring] + ((slotInRing % 2) * 0.85 - 0.42),
          angle: (slotInRing / countPerRing) * Math.PI * 2 + ring * 0.37,
          speed: ringSpeeds[ring],
          baseY: 1.0 + ring * 1.15 + (slotInRing % 3) * 0.58,
          bobAmp: 0.4,
          bobSpeed: 1.25 + (idx % 4) * 0.24,
        });
      }
      nextPhraseIdx = end;
    };

    // Clamped dt-accumulated timeline (starts strictly AFTER first frame renders so nothing skips!)
    let rafId = 0;
    let disposed = false;
    let frameIndex = 0;
    let elapsed = 0;
    let lastTime = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      // Clamp dt <= 33ms so any single browser hitch NEVER jumps past the wormhole!
      const dt = frameIndex === 0 ? 0.016 : Math.min(0.033, Math.max(0.001, rawDt));
      if (frameIndex > 0) {
        elapsed += dt;
      }
      frameIndex++;

      // Progressive non-blocking asset warm-up across frames 2..20 while wormhole plays smoothly
      if (frameIndex >= 2) {
        if (nextPhraseIdx < COSMIC_PHRASES.length) {
          addNextPhraseBatch(4);
        } else if (nextInitialPhotoIdx < medallionSlotCount) {
          const batchEnd = Math.min(medallionSlotCount, nextInitialPhotoIdx + 2);
          for (let p = nextInitialPhotoIdx; p < batchEnd; p++) {
            photoSlots[p].loadSrc(photoPool[p]);
          }
          nextInitialPhotoIdx = batchEnd;
        } else if (elapsed > 3.5 && nextExtraPhotoIdx < photoPool.length) {
          extraPhotoTimer += dt;
          if (extraPhotoTimer >= 0.1) {
            extraPhotoTimer = 0;
            photoSlots[nextExtraPhotoIdx].loadSrc(photoPool[nextExtraPhotoIdx]);
            nextExtraPhotoIdx++;
          }
        }
      }

      // Stage 1: Curved 3D Wormhole Tunnel, 14 Portal Rings & Warp Streaks (0.0s .. 3.7s)
      if (elapsed < 3.7) {
        wormholePoints.visible = true;
        warpStreaks.visible = true;

        const tunnelSwayX = Math.sin(elapsed * 2.1) * 0.55;
        const tunnelSwayY = Math.cos(elapsed * 1.7) * 0.35;

        const whAttr = whGeo.getAttribute('position') as THREE.BufferAttribute;
        const whArr = whAttr.array as Float32Array;
        for (let i = 0; i < wormholeCount; i++) {
          const ix = i * 3;
          let z = whArr[ix + 2] + whSpeed[i] * dt;
          if (z > 64 && elapsed < 2.2) {
            z = -6 + (z - 64);
          }
          whAngle[i] += whSpin[i] * dt;
          const zNorm = Math.max(0, (z + 6) / 70);
          const curveBias = Math.pow(zNorm, 1.08);
          const radius = (1.65 + curveBias * 15.5) * whRadiusBase[i];
          whArr[ix] = Math.cos(whAngle[i]) * radius + tunnelSwayX * curveBias;
          whArr[ix + 1] = Math.sin(whAngle[i]) * radius + tunnelSwayY * curveBias;
          whArr[ix + 2] = z;
        }
        whAttr.needsUpdate = true;

        const stAttr = streakGeo.getAttribute('position') as THREE.BufferAttribute;
        const stArr = stAttr.array as Float32Array;
        for (let i = 0; i < streakCount; i++) {
          const d = streakData[i];
          d.z += d.speed * dt;
          if (d.z > 64 && elapsed < 2.2) {
            d.z = -6;
          }
          d.angle += 0.62 * dt;
          const x = Math.cos(d.angle) * d.r;
          const y = Math.sin(d.angle) * d.r;
          const i6 = i * 6;
          stArr[i6] = x;
          stArr[i6 + 1] = y;
          stArr[i6 + 2] = d.z;
          stArr[i6 + 3] = x;
          stArr[i6 + 4] = y;
          stArr[i6 + 5] = d.z - d.len;
        }
        stAttr.needsUpdate = true;

        const whFade = elapsed < 2.35 ? 1 : Math.max(0, 1 - (elapsed - 2.35) / 1.15);
        whMat.opacity = 0.96 * whFade;
        streakMat.opacity = 0.9 * whFade;

        for (let i = 0; i < portalRings.length; i++) {
          const ring = portalRings[i];
          ring.z += ring.speed * dt;
          if (ring.z > camera.position.z + 3 && elapsed < 2.15) {
            ring.z = 0;
          }
          const zNorm = Math.max(0, (ring.z + 6) / 70);
          const rScale = 2.6 + Math.pow(zNorm, 1.08) * 12.2;
          ring.mesh.visible = true;
          ring.mesh.position.set(
            tunnelSwayX * zNorm * 0.75,
            tunnelSwayY * zNorm * 0.75,
            ring.z
          );
          ring.mesh.scale.setScalar(rScale);
          ring.mesh.rotation.z += dt * (i % 2 === 0 ? 1.6 : -1.35);
          ring.mat.opacity = 0.78 * whFade;
        }
      } else {
        wormholePoints.visible = false;
        warpStreaks.visible = false;
        for (let i = 0; i < portalRings.length; i++) {
          portalRings[i].mesh.visible = false;
        }
      }

      // Portal Vortex Morph -> tilts smoothly onto XZ plane to birth the Black Hole Accretion Disk (0s .. 3.8s)
      if (elapsed < 3.85) {
        portalVortex.visible = true;
        const tiltT = elapsed < 2.3 ? 0 : Math.min(1, (elapsed - 2.3) / 1.15);
        const tiltEase = 1 - Math.pow(1 - tiltT, 3);
        portalVortex.rotation.x = -tiltEase * (Math.PI / 2);
        portalVortex.rotation.z -= dt * (3.1 - tiltEase * 2.1);
        const portalScale =
          elapsed < 2.5
            ? 0.44 + (elapsed / 2.5) * 1.02
            : 1.46 - tiltEase * 0.45;
        portalVortex.scale.setScalar(portalScale);
        portalMat.opacity = elapsed < 2.6 ? 0.98 : Math.max(0, 0.98 * (1 - (elapsed - 2.6) / 1.15));
      } else {
        portalVortex.visible = false;
      }

      // Portal Breakthrough Shockwave expanding across the galactic plane
      if (elapsed >= 2.25 && elapsed < 4.35) {
        const swT = Math.min(1, (elapsed - 2.25) / 1.9);
        const swEase = 1 - Math.pow(1 - swT, 3);
        portalShockwave.visible = true;
        portalShockwave.scale.setScalar(0.08 + swEase * 1.35);
        portalShockwave.rotation.z += dt * 0.78;
        shockwaveMat.opacity =
          swT < 0.24 ? (swT / 0.24) * 0.95 : Math.max(0, 0.95 * (1 - (swT - 0.24) / 0.76));
      } else {
        portalShockwave.visible = false;
      }

      // Scripted Seamless Camera Flight: Wormhole Tunnel -> Portal Breakthrough -> Galaxy Overlook
      if (cameraIntroActive) {
        if (elapsed < 2.6) {
          const p = elapsed / 2.6;
          const ease = p * p * (3 - 2 * p);
          camera.position.set(
            Math.sin(elapsed * 2.1) * 0.4 * (1 - ease),
            0.4 + ease * 0.45,
            58 - ease * 48.0
          );
          controls.target.set(0, 0, 0);
          const warpSurge = Math.sin(p * Math.PI) * 12;
          camera.fov = 72 + warpSurge - ease * 6;
          camera.updateProjectionMatrix();
        } else if (elapsed < 4.75) {
          const p = (elapsed - 2.6) / 2.15;
          const ease = 1 - Math.pow(1 - p, 3);
          camera.position.set(
            0,
            0.85 + ease * (12.8 - 0.85),
            10.0 + ease * (34.5 - 10.0)
          );
          controls.target.set(0, ease * 4.3, 0);
          camera.fov = 66 - ease * (66 - 56);
          camera.updateProjectionMatrix();
        } else {
          camera.fov = 56;
          camera.updateProjectionMatrix();
          cameraIntroActive = false;
          controls.autoRotate = true;
          controls.update();
        }
      }

      // Stage 2: Spiral Galaxy bloom emerging synchronously inside the Portal Shockwave (2.35s .. 4.25s)
      if (elapsed >= 2.3) {
        galaxyGroup.visible = true;
        const galTarget = Math.min(1, (elapsed - 2.3) / 1.9);
        const galEase = 1 - Math.pow(1 - galTarget, 3);
        galaxyGroup.scale.setScalar(Math.max(0.03, galEase));
        spiralGalaxy.rotation.y += dt * 0.14;
        accretionRing.rotation.y += dt * 0.65;
      }

      // Stage 3: 3D Particle Heart rising & pulsing (2.75s .. 4.6s)
      if (elapsed >= 2.75) {
        heartGroup.visible = true;
        const heartTarget = Math.min(1, (elapsed - 2.75) / 1.8);
        const heartEase = 1 - Math.pow(1 - heartTarget, 3);
        const pulse = 1 + 0.045 * Math.sin(elapsed * 2.5);
        heartMesh.scale.setScalar(pulse);
        heartGroup.scale.setScalar(Math.max(0.03, heartEase));
        heartMesh.rotation.y = Math.sin(elapsed * 0.45) * 0.35 + elapsed * 0.22;
        energyBeam.rotation.y -= dt * 0.85;
      }

      // Stage 4: Orbiting Multilingual Phrases, Rotating 35 Photos & Floating Pink Hearts
      if (elapsed >= 3.15) {
        orbitersGroup.visible = true;
        const orbTarget = Math.min(1, (elapsed - 3.15) / 1.75);
        const orbEase = 1 - Math.pow(1 - orbTarget, 3);
        orbitersGroup.scale.setScalar(Math.max(0.03, orbEase));
        for (let i = 0; i < orbitItems.length; i++) {
          const item = orbitItems[i];
          const ang = item.angle + elapsed * item.speed;
          _v1.set(
            Math.cos(ang) * item.radius,
            item.baseY + Math.sin(elapsed * item.bobSpeed + i) * item.bobAmp,
            Math.sin(ang) * item.radius
          );
          item.sprite.position.copy(_v1);
        }
      }

      // Periodically swap the orbiting medallions so all 35 photos rotate through seamlessly
      if (photoSlots.length > medallionSlotCount && elapsed > 5.2) {
        const swapPeriod = 4.4;
        const transitionDur = 0.72;
        const swapStep = medallionSlotCount;
        const timeSinceStart = elapsed - 5.2;

        for (let i = 0; i < photoMedallions.length; i++) {
          const slot = photoMedallions[i];
          const localTime = Math.max(0, timeSinceStart - i * 0.035);
          const cycle = Math.floor(localTime / swapPeriod);
          const phaseInPeriod = localTime - cycle * swapPeriod;

          let targetBatch = cycle;
          let pulseFactor = 1;

          if (cycle > 0 && phaseInPeriod < transitionDur) {
            const half = transitionDur * 0.5;
            if (phaseInPeriod < half) {
              targetBatch = cycle - 1;
              pulseFactor = 1 - phaseInPeriod / half;
            } else {
              targetBatch = cycle;
              pulseFactor = (phaseInPeriod - half) / half;
            }
          }

          const desiredIdx = (slot.slotIdx + targetBatch * swapStep) % photoSlots.length;
          if (slot.activePhotoIdx !== desiredIdx) {
            photoSlots[desiredIdx].loadSrc(photoPool[desiredIdx]);
            slot.activePhotoIdx = desiredIdx;
            slot.mat.map = photoSlots[desiredIdx].texture;
          }

          const easedPulse = 0.12 + 0.88 * (pulseFactor * pulseFactor * (3 - 2 * pulseFactor));
          const s = slot.baseSize * easedPulse;
          slot.sprite.scale.set(s, s, 1);
          slot.mat.opacity = 0.2 + 0.78 * pulseFactor;
        }
      }

      // Deep Stars + Twinkling Hero Stars + 3D Shooting Stars around the Galaxy Heart
      const starReveal =
        elapsed < 2.0 ? 0.25 + (elapsed / 2.0) * 0.3 : Math.min(1, 0.55 + (elapsed - 2.0) * 0.45);
      bgMat.opacity = 0.96 * starReveal;
      heroMat.opacity = (0.72 + 0.26 * Math.sin(elapsed * 2.4)) * starReveal;
      heroMat.size = 1.55 + 0.22 * Math.sin(elapsed * 3.1);
      bgStars.rotation.y += dt * 0.012;
      heroStars.rotation.y -= dt * 0.008;

      const shootingActive = elapsed > 2.25;
      shootTrailLines.visible = shootingActive;
      shootHeadPoints.visible = shootingActive;

      if (shootingActive) {
        const sTrailAttr = shootTrailGeo.getAttribute('position') as THREE.BufferAttribute;
        const sTrailColAttr = shootTrailGeo.getAttribute('color') as THREE.BufferAttribute;
        const sHeadAttr = shootHeadGeo.getAttribute('position') as THREE.BufferAttribute;
        const sHeadColAttr = shootHeadGeo.getAttribute('color') as THREE.BufferAttribute;
        const tPos = sTrailAttr.array as Float32Array;
        const tCol = sTrailColAttr.array as Float32Array;
        const hPos = sHeadAttr.array as Float32Array;
        const hCol = sHeadColAttr.array as Float32Array;

        for (let i = 0; i < shootingStarCount; i++) {
          const s = shootingStars[i];
          if (s.wait > 0) {
            s.wait -= dt;
            const segBase = i * trailSteps * 6;
            for (let k = 0; k < trailSteps * 6; k++) {
              tCol[segBase + k] = 0;
            }
            hCol[i * 3] = 0;
            hCol[i * 3 + 1] = 0;
            hCol[i * 3 + 2] = 0;
            continue;
          }

          s.age += dt;
          if (s.age >= s.duration) {
            resetShootingStar(s, 0.7 + Math.random() * 2.1);
            continue;
          }

          const p = s.age / s.duration;
          const env = p < 0.18 ? p / 0.18 : Math.max(0, 1 - (p - 0.18) / 0.82);
          const headDist = s.age * s.speed;

          _v1.copy(s.origin).addScaledVector(s.dir, headDist);
          hPos[i * 3] = _v1.x;
          hPos[i * 3 + 1] = _v1.y;
          hPos[i * 3 + 2] = _v1.z;
          hCol[i * 3] = s.color.r * env;
          hCol[i * 3 + 1] = s.color.g * env;
          hCol[i * 3 + 2] = s.color.b * env;

          const activeTailLen = Math.min(headDist, s.tailLen);
          const segBase = i * trailSteps * 6;
          for (let seg = 0; seg < trailSteps; seg++) {
            const f0 = seg / trailSteps;
            const f1 = (seg + 1) / trailSteps;
            const i6 = segBase + seg * 6;

            tPos[i6] = _v1.x - s.dir.x * activeTailLen * f0;
            tPos[i6 + 1] = _v1.y - s.dir.y * activeTailLen * f0;
            tPos[i6 + 2] = _v1.z - s.dir.z * activeTailLen * f0;
            tPos[i6 + 3] = _v1.x - s.dir.x * activeTailLen * f1;
            tPos[i6 + 4] = _v1.y - s.dir.y * activeTailLen * f1;
            tPos[i6 + 5] = _v1.z - s.dir.z * activeTailLen * f1;

            const b0 = Math.pow(1 - f0, 1.6) * env;
            const b1 = Math.pow(1 - f1, 1.6) * env;
            tCol[i6] = s.color.r * b0;
            tCol[i6 + 1] = s.color.g * b0;
            tCol[i6 + 2] = s.color.b * b0;
            tCol[i6 + 3] = s.color.r * b1;
            tCol[i6 + 4] = s.color.g * b1;
            tCol[i6 + 5] = s.color.b * b1;
          }
        }

        sTrailAttr.needsUpdate = true;
        sTrailColAttr.needsUpdate = true;
        sHeadAttr.needsUpdate = true;
        sHeadColAttr.needsUpdate = true;
      }

      if (cameraIntroActive) {
        camera.lookAt(controls.target);
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(320, container.clientWidth || window.innerWidth);
      const h = Math.max(320, container.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', cancelIntroCamera);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [visible, photos, replayNonce]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[36] overflow-hidden bg-[#020107] transition-opacity duration-200 ease-out ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Isolated WebGL Mount Container */}
      <div
        ref={mountRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top-Left Minimal Cosmic Label */}
      <div className="pointer-events-none fixed top-4 left-4 z-[45] rounded-full border border-pink-300/20 bg-[#0a0814]/80 px-3.5 py-1.5 text-xs font-medium tracking-wide text-pink-100/90 shadow-lg">
        Drag to rotate • Scroll to zoom
      </div>

      {/* Unified Bottom Control Dock */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[45] flex items-center gap-2 rounded-full border border-pink-300/25 bg-[#0a0814]/88 px-3 py-1.5 text-xs sm:text-sm text-white/90 shadow-[0_8px_30px_rgba(236,72,153,0.28)]">
        <button
          type="button"
          onClick={onBackToHeart}
          className="flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-pink-300" />
          <span>Back to Photos</span>
        </button>

        <span aria-hidden="true" className="h-4 w-px bg-white/15" />

        <button
          type="button"
          onClick={() => setReplayNonce((n) => n + 1)}
          className="flex min-h-[36px] items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium text-pink-300 transition hover:bg-pink-500/20 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Replay Galaxy</span>
        </button>
      </div>
    </div>
  );
}
