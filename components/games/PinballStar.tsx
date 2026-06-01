"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Vector = {
  x: number;
  y: number;
};

type GamePhase = "ready" | "charging" | "playing" | "life-lost" | "gameover";

type Ball = {
  pos: Vector;
  vel: Vector;
  radius: number;
  inLaunchLane: boolean;
  trail: Vector[];
};

type Bumper = {
  id: string;
  pos: Vector;
  radius: number;
  value: number;
  color: string;
  label: string;
  hitTimer: number;
};

type Target = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
  label: string;
  lit: boolean;
  hitTimer: number;
};

type FlipperSide = "left" | "right";

type Flipper = {
  side: FlipperSide;
  pivot: Vector;
  length: number;
  angle: number;
  previousAngle: number;
  restAngle: number;
  activeAngle: number;
};

type Particle = {
  pos: Vector;
  vel: Vector;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
};

type FloatingText = {
  text: string;
  pos: Vector;
  vel: Vector;
  color: string;
  life: number;
  maxLife: number;
};

type Controls = {
  left: boolean;
  right: boolean;
  launch: boolean;
  launchRequested: boolean;
};

type GameRuntime = {
  ball: Ball;
  bumpers: Bumper[];
  targets: Target[];
  flippers: Record<FlipperSide, Flipper>;
  particles: Particle[];
  floatingTexts: FloatingText[];
  score: number;
  highScore: number;
  lives: number;
  phase: GamePhase;
  message: string;
  launchPower: number;
  combo: number;
  comboTimer: number;
  shake: number;
  flash: number;
  lostTimer: number;
  time: number;
  highScoreDirty: boolean;
};

type HudState = {
  score: number;
  highScore: number;
  lives: number;
  phase: GamePhase;
  message: string;
};

type Segment = {
  a: Vector;
  b: Vector;
  radius: number;
  color: string;
};

type CollisionResult = {
  point: Vector;
  normal: Vector;
};

const TABLE_WIDTH = 460;
const TABLE_HEIGHT = 720;
const BALL_RADIUS = 8.6;
const GRAVITY = 690;
const MAX_SPEED = 1320;
const WALL_RESTITUTION = 0.84;
const HIGH_SCORE_KEY = "pinball-star-high-score";

const LANE = {
  left: 366,
  right: 428,
  top: 76,
  bottom: 650,
  startX: 398,
  startY: 625,
};

const RAIL_SEGMENTS: Segment[] = [
  { a: { x: 42, y: 92 }, b: { x: 84, y: 50 }, radius: 7, color: "#03e9f4" },
  { a: { x: 84, y: 50 }, b: { x: 238, y: 34 }, radius: 7, color: "#a855f7" },
  { a: { x: 238, y: 34 }, b: { x: 344, y: 78 }, radius: 7, color: "#03e9f4" },
  { a: { x: 42, y: 555 }, b: { x: 128, y: 674 }, radius: 8, color: "#03e9f4" },
  { a: { x: 418, y: 555 }, b: { x: 332, y: 674 }, radius: 8, color: "#a855f7" },
  { a: { x: 366, y: 128 }, b: { x: 366, y: 622 }, radius: 6, color: "#03e9f4" },
  { a: { x: 90, y: 455 }, b: { x: 154, y: 536 }, radius: 6, color: "#ff2bd6" },
  { a: { x: 310, y: 536 }, b: { x: 352, y: 456 }, radius: 6, color: "#ff2bd6" },
];

const INITIAL_HUD: HudState = {
  score: 0,
  highScore: 0,
  lives: 3,
  phase: "ready",
  message: "Segure Espaço ou o botão Launch para carregar.",
};

function deg(value: number) {
  return (value * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function length(vector: Vector) {
  return Math.hypot(vector.x, vector.y);
}

function normalize(vector: Vector): Vector {
  const magnitude = length(vector);
  if (magnitude < 0.0001) return { x: 0, y: -1 };
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

function dot(a: Vector, b: Vector) {
  return a.x * b.x + a.y * b.y;
}

function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y };
}

function multiply(vector: Vector, scalar: number): Vector {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

function closestPointOnSegment(point: Vector, a: Vector, b: Vector): Vector {
  const ab = subtract(b, a);
  const denominator = dot(ab, ab);
  if (denominator <= 0.0001) return { ...a };
  const t = clamp(dot(subtract(point, a), ab) / denominator, 0, 1);
  return add(a, multiply(ab, t));
}

function reflectVelocity(velocity: Vector, normal: Vector, restitution: number): Vector {
  const velocityAlongNormal = dot(velocity, normal);
  if (velocityAlongNormal >= 0) return velocity;
  return subtract(velocity, multiply(normal, (1 + restitution) * velocityAlongNormal));
}

function limitSpeed(velocity: Vector, max: number): Vector {
  const speed = length(velocity);
  if (speed <= max) return velocity;
  return multiply(normalize(velocity), max);
}

function lerpAngle(current: number, target: number, amount: number) {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * clamp(amount, 0, 1);
}

function flipperTip(flipper: Flipper): Vector {
  return {
    x: flipper.pivot.x + Math.cos(flipper.angle) * flipper.length,
    y: flipper.pivot.y + Math.sin(flipper.angle) * flipper.length,
  };
}

function createBumpers(): Bumper[] {
  return [
    {
      id: "nova",
      pos: { x: 142, y: 192 },
      radius: 30,
      value: 500,
      color: "#03e9f4",
      label: "NOVA",
      hitTimer: 0,
    },
    {
      id: "pulse",
      pos: { x: 270, y: 214 },
      radius: 31,
      value: 500,
      color: "#ff2bd6",
      label: "PULSE",
      hitTimer: 0,
    },
    {
      id: "core",
      pos: { x: 205, y: 318 },
      radius: 28,
      value: 650,
      color: "#7cff6b",
      label: "CORE",
      hitTimer: 0,
    },
  ];
}

function createTargets(): Target[] {
  return [
    { id: "s", x: 78, y: 278, width: 17, height: 56, value: 220, color: "#ffd166", label: "S", lit: false, hitTimer: 0 },
    { id: "t", x: 103, y: 346, width: 17, height: 56, value: 220, color: "#ffd166", label: "T", lit: false, hitTimer: 0 },
    { id: "a", x: 314, y: 292, width: 17, height: 56, value: 220, color: "#03e9f4", label: "A", lit: false, hitTimer: 0 },
    { id: "r", x: 334, y: 374, width: 17, height: 56, value: 220, color: "#03e9f4", label: "R", lit: false, hitTimer: 0 },
    { id: "star-left", x: 132, y: 114, width: 46, height: 13, value: 180, color: "#ff2bd6", label: "STAR", lit: false, hitTimer: 0 },
    { id: "star-right", x: 236, y: 120, width: 52, height: 13, value: 180, color: "#7cff6b", label: "MODE", lit: false, hitTimer: 0 },
  ];
}

function createRuntime(highScore: number): GameRuntime {
  return {
    ball: {
      pos: { x: LANE.startX, y: LANE.startY },
      vel: { x: 0, y: 0 },
      radius: BALL_RADIUS,
      inLaunchLane: true,
      trail: [],
    },
    bumpers: createBumpers(),
    targets: createTargets(),
    flippers: {
      left: {
        side: "left",
        pivot: { x: 184, y: 604 },
        length: 94,
        angle: deg(160),
        previousAngle: deg(160),
        restAngle: deg(160),
        activeAngle: deg(205),
      },
      right: {
        side: "right",
        pivot: { x: 276, y: 604 },
        length: 94,
        angle: deg(20),
        previousAngle: deg(20),
        restAngle: deg(20),
        activeAngle: deg(-25),
      },
    },
    particles: [],
    floatingTexts: [],
    score: 0,
    highScore,
    lives: 3,
    phase: "ready",
    message: "Segure Espaço ou Launch para carregar.",
    launchPower: 0,
    combo: 0,
    comboTimer: 0,
    shake: 0,
    flash: 0,
    lostTimer: 0,
    time: 0,
    highScoreDirty: false,
  };
}

function lockBallInLaunchLane(runtime: GameRuntime) {
  runtime.ball.pos = { x: LANE.startX, y: LANE.startY };
  runtime.ball.vel = { x: 0, y: 0 };
  runtime.ball.inLaunchLane = true;
  runtime.ball.trail = [];
}

function resetBallForLaunch(runtime: GameRuntime) {
  lockBallInLaunchLane(runtime);
  runtime.launchPower = 0;
}

function addFloatingText(runtime: GameRuntime, text: string, pos: Vector, color: string) {
  runtime.floatingTexts.push({
    text,
    pos: { ...pos },
    vel: { x: (Math.random() - 0.5) * 20, y: -42 },
    color,
    life: 0.85,
    maxLife: 0.85,
  });
}

function burst(runtime: GameRuntime, pos: Vector, color: string, count = 16, force = 240) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = force * (0.35 + Math.random() * 0.8);
    runtime.particles.push({
      pos: { ...pos },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      radius: 1.8 + Math.random() * 3,
      color,
      life: 0.35 + Math.random() * 0.45,
      maxLife: 0.8,
    });
  }

  if (runtime.particles.length > 160) {
    runtime.particles.splice(0, runtime.particles.length - 160);
  }
}

function addScore(runtime: GameRuntime, points: number, pos: Vector, label: string, color: string) {
  const multiplier = runtime.combo >= 6 ? 3 : runtime.combo >= 3 ? 2 : 1;
  const scored = points * multiplier;

  runtime.score += scored;
  runtime.combo += 1;
  runtime.comboTimer = 2.15;
  runtime.message = multiplier > 1 ? `${label} x${multiplier} +${scored}` : `${label} +${scored}`;
  runtime.shake = Math.max(runtime.shake, multiplier > 1 ? 7.5 : 4.5);
  runtime.flash = Math.max(runtime.flash, 0.16);

  addFloatingText(runtime, `+${scored}`, pos, color);

  if (runtime.score > runtime.highScore) {
    runtime.highScore = runtime.score;
    runtime.highScoreDirty = true;
  }
}

function resolveCircleSegment(
  ball: Ball,
  a: Vector,
  b: Vector,
  railRadius: number,
  restitution: number,
): CollisionResult | null {
  const closest = closestPointOnSegment(ball.pos, a, b);
  const offset = subtract(ball.pos, closest);
  const distance = length(offset);
  const minimumDistance = ball.radius + railRadius;

  if (distance >= minimumDistance) return null;

  const normal = distance > 0.0001 ? multiply(offset, 1 / distance) : { x: 0, y: -1 };
  ball.pos = add(ball.pos, multiply(normal, minimumDistance - distance + 0.02));
  ball.vel = reflectVelocity(ball.vel, normal, restitution);
  ball.vel = limitSpeed(ball.vel, MAX_SPEED);

  return { point: closest, normal };
}

function updateFlippers(runtime: GameRuntime, controls: Controls, dt: number) {
  const flippers = [runtime.flippers.left, runtime.flippers.right];

  for (const flipper of flippers) {
    flipper.previousAngle = flipper.angle;
    const isActive = flipper.side === "left" ? controls.left : controls.right;
    const targetAngle = isActive ? flipper.activeAngle : flipper.restAngle;
    flipper.angle = lerpAngle(flipper.angle, targetAngle, Math.min(1, dt * 18));
  }
}

function resolveFlipperCollisions(runtime: GameRuntime, controls: Controls, dt: number) {
  const flippers = [runtime.flippers.left, runtime.flippers.right];

  for (const flipper of flippers) {
    const tip = flipperTip(flipper);
    const collision = resolveCircleSegment(runtime.ball, flipper.pivot, tip, 11, 0.78);
    if (!collision) continue;

    const active = flipper.side === "left" ? controls.left : controls.right;
    const angularSpeed = Math.abs(flipper.angle - flipper.previousAngle) / Math.max(dt, 0.001);
    const launchDirection = flipper.side === "left" ? 1 : -1;
    const impulse = active ? 230 + Math.min(420, angularSpeed * 22) : 70;

    runtime.ball.vel.x += launchDirection * (80 + impulse * 0.28);
    runtime.ball.vel.y -= impulse;
    runtime.ball.vel = limitSpeed(runtime.ball.vel, MAX_SPEED);

    burst(runtime, collision.point, flipper.side === "left" ? "#03e9f4" : "#ff2bd6", active ? 18 : 8, active ? 250 : 130);
    runtime.shake = Math.max(runtime.shake, active ? 5.5 : 2.5);
  }
}

function resolveWallCollisions(runtime: GameRuntime) {
  const ball = runtime.ball;
  const radius = ball.radius;

  if (ball.inLaunchLane) {
    if (ball.pos.x < LANE.left + radius) {
      ball.pos.x = LANE.left + radius;
      ball.vel.x = Math.abs(ball.vel.x) * WALL_RESTITUTION;
    }

    if (ball.pos.x > LANE.right - radius) {
      ball.pos.x = LANE.right - radius;
      ball.vel.x = -Math.abs(ball.vel.x) * WALL_RESTITUTION;
    }

    if (ball.pos.y < 30 + radius) {
      ball.pos.y = 30 + radius;
      ball.vel.y = Math.abs(ball.vel.y) * WALL_RESTITUTION;
    }

    if (ball.pos.y <= LANE.top + 8 && ball.vel.y < 0) {
      ball.inLaunchLane = false;
      ball.pos.x = LANE.left - radius - 2;
      ball.pos.y = LANE.top + 10;
      ball.vel.x = -245 - runtime.launchPower * 95;
      ball.vel.y = 115 + runtime.launchPower * 45;
      runtime.message = runtime.launchPower > 0.82 ? "Skill shot na órbita!" : "Bola em jogo!";
      burst(runtime, ball.pos, "#03e9f4", 20, 210);
      if (runtime.launchPower > 0.82) {
        addScore(runtime, 750, ball.pos, "Skill shot", "#03e9f4");
      }
    }

    return;
  }

  if (ball.pos.x < 28 + radius) {
    ball.pos.x = 28 + radius;
    ball.vel.x = Math.abs(ball.vel.x) * WALL_RESTITUTION;
  }

  if (ball.pos.x > TABLE_WIDTH - 28 - radius) {
    ball.pos.x = TABLE_WIDTH - 28 - radius;
    ball.vel.x = -Math.abs(ball.vel.x) * WALL_RESTITUTION;
  }

  if (ball.pos.y < 28 + radius) {
    ball.pos.y = 28 + radius;
    ball.vel.y = Math.abs(ball.vel.y) * WALL_RESTITUTION;
  }

  for (const segment of RAIL_SEGMENTS) {
    const collision = resolveCircleSegment(ball, segment.a, segment.b, segment.radius, WALL_RESTITUTION);
    if (collision) {
      burst(runtime, collision.point, segment.color, 5, 95);
    }
  }
}

function resolveBumperCollisions(runtime: GameRuntime, dt: number) {
  for (const bumper of runtime.bumpers) {
    bumper.hitTimer = Math.max(0, bumper.hitTimer - dt);

    const offset = subtract(runtime.ball.pos, bumper.pos);
    const distance = length(offset);
    const minimumDistance = runtime.ball.radius + bumper.radius;

    if (distance >= minimumDistance) continue;

    const normal = distance > 0.001 ? multiply(offset, 1 / distance) : { x: 0, y: -1 };
    runtime.ball.pos = add(bumper.pos, multiply(normal, minimumDistance + 0.2));

    const incomingSpeed = Math.max(length(runtime.ball.vel), 520);
    runtime.ball.vel = multiply(normal, Math.min(MAX_SPEED, incomingSpeed * 1.08 + 120));

    if (bumper.hitTimer <= 0) {
      bumper.hitTimer = 0.28;
      addScore(runtime, bumper.value, bumper.pos, bumper.label, bumper.color);
      burst(runtime, bumper.pos, bumper.color, 26, 320);
    }
  }
}

function resolveTargetCollisions(runtime: GameRuntime, dt: number) {
  for (const target of runtime.targets) {
    target.hitTimer = Math.max(0, target.hitTimer - dt);

    const closest: Vector = {
      x: clamp(runtime.ball.pos.x, target.x, target.x + target.width),
      y: clamp(runtime.ball.pos.y, target.y, target.y + target.height),
    };
    const offset = subtract(runtime.ball.pos, closest);
    const distance = length(offset);

    if (distance >= runtime.ball.radius + 1) continue;

    const center = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
    const normal = distance > 0.001 ? multiply(offset, 1 / distance) : normalize(subtract(runtime.ball.pos, center));
    runtime.ball.pos = add(runtime.ball.pos, multiply(normal, runtime.ball.radius + 1 - distance + 0.2));
    runtime.ball.vel = reflectVelocity(runtime.ball.vel, normal, 0.96);
    runtime.ball.vel.x += normal.x * 90;
    runtime.ball.vel.y += normal.y * 90;

    if (target.hitTimer <= 0) {
      target.hitTimer = 0.34;
      target.lit = true;
      addScore(runtime, target.value, center, `Target ${target.label}`, target.color);
      burst(runtime, center, target.color, 18, 250);

      if (runtime.targets.every((item) => item.lit)) {
        for (const item of runtime.targets) item.lit = false;
        addScore(runtime, 1200, { x: TABLE_WIDTH / 2, y: 92 }, "Star bank completo", "#ffffff");
        burst(runtime, { x: TABLE_WIDTH / 2, y: 92 }, "#ffffff", 42, 370);
      }
    }
  }
}

function updateParticles(runtime: GameRuntime, dt: number) {
  for (const particle of runtime.particles) {
    particle.life -= dt;
    particle.pos.x += particle.vel.x * dt;
    particle.pos.y += particle.vel.y * dt;
    particle.vel.x *= 0.985;
    particle.vel.y = particle.vel.y * 0.985 + GRAVITY * 0.08 * dt;
  }

  runtime.particles = runtime.particles.filter((particle) => particle.life > 0);

  for (const text of runtime.floatingTexts) {
    text.life -= dt;
    text.pos.x += text.vel.x * dt;
    text.pos.y += text.vel.y * dt;
    text.vel.y -= 4 * dt;
  }

  runtime.floatingTexts = runtime.floatingTexts.filter((text) => text.life > 0);
}

function launchBall(runtime: GameRuntime) {
  const power = Math.max(0.46, runtime.launchPower);

  runtime.phase = "playing";
  runtime.ball.inLaunchLane = true;
  runtime.ball.pos = { x: LANE.startX, y: LANE.startY };
  runtime.ball.vel = {
    x: -28 - power * 36,
    y: -700 - power * 430,
  };
  runtime.message = "Bola lançada!";
  runtime.launchPower = power;
  runtime.shake = Math.max(runtime.shake, 4);
  burst(runtime, runtime.ball.pos, "#ff2bd6", 18, 260);
}

function loseLife(runtime: GameRuntime) {
  runtime.lives -= 1;
  runtime.combo = 0;
  runtime.comboTimer = 0;
  runtime.shake = Math.max(runtime.shake, 10);
  runtime.flash = Math.max(runtime.flash, 0.28);

  if (runtime.lives <= 0) {
    runtime.phase = "gameover";
    runtime.message = "Game over. Reinicie para tentar bater o recorde.";
    runtime.ball.vel = { x: 0, y: 0 };
    return;
  }

  runtime.phase = "life-lost";
  runtime.lostTimer = 1.15;
  runtime.message = `Vida perdida. ${runtime.lives} ${runtime.lives === 1 ? "vida restante" : "vidas restantes"}.`;
  runtime.ball.vel = { x: 0, y: 0 };
  burst(runtime, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 70 }, "#ff2bd6", 28, 310);
}

function updateRuntime(runtime: GameRuntime, controls: Controls, dt: number) {
  runtime.time += dt;
  runtime.shake = Math.max(0, runtime.shake - dt * 22);
  runtime.flash = Math.max(0, runtime.flash - dt * 1.9);

  if (runtime.comboTimer > 0) {
    runtime.comboTimer -= dt;
    if (runtime.comboTimer <= 0) runtime.combo = 0;
  }

  updateFlippers(runtime, controls, dt);
  updateParticles(runtime, dt);

  if (runtime.phase === "gameover") {
    controls.launchRequested = false;
    return;
  }

  if (runtime.phase === "life-lost") {
    runtime.lostTimer -= dt;
    if (runtime.lostTimer <= 0) {
      resetBallForLaunch(runtime);
      runtime.phase = "ready";
      runtime.message = "Segure Launch e solte no timing.";
    }
    return;
  }

  if (runtime.phase === "ready" || runtime.phase === "charging") {
    lockBallInLaunchLane(runtime);

    if (runtime.phase === "ready" && !controls.launch) {
      runtime.launchPower = 0;
    }

    if (controls.launch) {
      runtime.phase = "charging";
      runtime.launchPower += dt * 0.9;
      if (runtime.launchPower > 1) {
        runtime.launchPower = 0.42;
      }
      runtime.message = "Solte para lançar.";
    }

    if (controls.launchRequested || (runtime.phase === "charging" && !controls.launch && runtime.launchPower > 0)) {
      controls.launchRequested = false;
      launchBall(runtime);
    }

    return;
  }

  controls.launchRequested = false;

  const ball = runtime.ball;
  ball.vel.y += GRAVITY * dt;
  ball.vel.x *= 0.999;
  ball.vel.y *= 0.999;
  ball.vel = limitSpeed(ball.vel, MAX_SPEED);

  ball.pos.x += ball.vel.x * dt;
  ball.pos.y += ball.vel.y * dt;

  ball.trail.push({ ...ball.pos });
  if (ball.trail.length > 13) ball.trail.shift();

  resolveWallCollisions(runtime);
  resolveBumperCollisions(runtime, dt);
  resolveTargetCollisions(runtime, dt);
  resolveFlipperCollisions(runtime, controls, dt);

  if (runtime.ball.pos.y > TABLE_HEIGHT + 36) {
    loseLife(runtime);
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawNeonLine(ctx: CanvasRenderingContext2D, a: Vector, b: Vector, color: string, width: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(1, width * 0.24);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawTable(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  const gradient = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
  gradient.addColorStop(0, "#061025");
  gradient.addColorStop(0.48, "#08081a");
  gradient.addColorStop(1, "#040711");

  ctx.save();
  roundedRect(ctx, 12, 12, TABLE_WIDTH - 24, TABLE_HEIGHT - 24, 18);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.stroke();

  const innerGlow = ctx.createRadialGradient(150, 160, 20, 230, 280, 410);
  innerGlow.addColorStop(0, "rgba(3,233,244,0.18)");
  innerGlow.addColorStop(0.35, "rgba(255,43,214,0.1)");
  innerGlow.addColorStop(1, "rgba(3,7,18,0)");
  ctx.fillStyle = innerGlow;
  roundedRect(ctx, 20, 20, TABLE_WIDTH - 40, TABLE_HEIGHT - 40, 14);
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#03e9f4";
  ctx.lineWidth = 0.8;
  for (let x = 38; x < TABLE_WIDTH - 38; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 38);
    ctx.lineTo(x - 48, TABLE_HEIGHT - 40);
    ctx.stroke();
  }
  for (let y = 50; y < TABLE_HEIGHT - 38; y += 30) {
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(TABLE_WIDTH - 34, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.11)";
  ctx.lineWidth = 1;
  for (let y = (runtime.time * 18) % 22; y < TABLE_HEIGHT; y += 22) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(TABLE_WIDTH - 18, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLaunchLane(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  ctx.save();
  roundedRect(ctx, LANE.left, LANE.top, LANE.right - LANE.left, LANE.bottom - LANE.top, 18);
  ctx.fillStyle = "rgba(1,10,24,0.62)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#03e9f4";
  ctx.shadowColor = "#03e9f4";
  ctx.shadowBlur = 18;
  ctx.stroke();

  const meterHeight = 132;
  const meterX = LANE.right + 6;
  const meterY = LANE.bottom - meterHeight;
  ctx.shadowBlur = 0;
  roundedRect(ctx, meterX, meterY, 8, meterHeight, 4);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();

  const powerHeight = meterHeight * runtime.launchPower;
  const powerGradient = ctx.createLinearGradient(0, meterY + meterHeight, 0, meterY);
  powerGradient.addColorStop(0, "#03e9f4");
  powerGradient.addColorStop(0.6, "#ff2bd6");
  powerGradient.addColorStop(1, "#ffffff");
  roundedRect(ctx, meterX, meterY + meterHeight - powerHeight, 8, powerHeight, 4);
  ctx.fillStyle = powerGradient;
  ctx.shadowColor = "#ff2bd6";
  ctx.shadowBlur = 16;
  ctx.fill();

  ctx.translate(LANE.right - 10, LANE.bottom - 48);
  ctx.rotate(-Math.PI / 2);
  ctx.font = "800 10px Space Grotesk, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.fillText("LAUNCH", 0, 0);
  ctx.restore();
}

function drawBumpers(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  for (const bumper of runtime.bumpers) {
    const pulse = bumper.hitTimer > 0 ? 1 + bumper.hitTimer * 1.25 : 1 + Math.sin(runtime.time * 4 + bumper.pos.x) * 0.035;

    ctx.save();
    ctx.translate(bumper.pos.x, bumper.pos.y);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = bumper.color;
    ctx.shadowBlur = bumper.hitTimer > 0 ? 36 : 22;

    const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, bumper.radius + 16);
    glow.addColorStop(0, "#ffffff");
    glow.addColorStop(0.28, bumper.color);
    glow.addColorStop(0.74, "rgba(255,255,255,0.08)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, bumper.radius + 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 12;
    ctx.fillStyle = "#06101d";
    ctx.beginPath();
    ctx.arc(0, 0, bumper.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = bumper.color;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = "900 9px Space Grotesk, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(bumper.label, 0, 0);
    ctx.restore();
  }
}

function drawTargets(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  for (const target of runtime.targets) {
    const center = { x: target.x + target.width / 2, y: target.y + target.height / 2 };
    const alpha = target.lit ? 1 : 0.52;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = target.color;
    ctx.shadowBlur = target.lit || target.hitTimer > 0 ? 20 : 7;
    roundedRect(ctx, target.x, target.y, target.width, target.height, 5);
    ctx.fillStyle = target.lit ? target.color : "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = target.color;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = target.lit ? "#02050b" : "rgba(255,255,255,0.78)";
    ctx.font = "900 8px Space Grotesk, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (target.height > target.width * 2) {
      ctx.translate(center.x, center.y);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(target.label, 0, 0);
    } else {
      ctx.fillText(target.label, center.x, center.y);
    }

    ctx.restore();
  }
}

function drawFlippers(ctx: CanvasRenderingContext2D, runtime: GameRuntime, controls: Controls) {
  for (const flipper of [runtime.flippers.left, runtime.flippers.right]) {
    const tip = flipperTip(flipper);
    const active = flipper.side === "left" ? controls.left : controls.right;
    const color = flipper.side === "left" ? "#03e9f4" : "#ff2bd6";

    ctx.save();
    drawNeonLine(ctx, flipper.pivot, tip, color, active ? 22 : 18);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(flipper.pivot.x, flipper.pivot.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawRails(ctx: CanvasRenderingContext2D) {
  for (const segment of RAIL_SEGMENTS) {
    drawNeonLine(ctx, segment.a, segment.b, segment.color, segment.radius * 1.4);
  }

  drawNeonLine(ctx, { x: 28, y: 84 }, { x: 28, y: 566 }, "#03e9f4", 10);
  drawNeonLine(ctx, { x: 432, y: 84 }, { x: 432, y: 570 }, "#a855f7", 10);
  drawNeonLine(ctx, { x: 34, y: 690 }, { x: 138, y: 690 }, "#03e9f4", 8);
  drawNeonLine(ctx, { x: 322, y: 690 }, { x: 426, y: 690 }, "#a855f7", 8);
}

function drawBall(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  const { ball } = runtime;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let index = 0; index < ball.trail.length; index += 1) {
    const point = ball.trail[index];
    const alpha = index / ball.trail.length;
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = "#03e9f4";
    ctx.beginPath();
    ctx.arc(point.x, point.y, ball.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 20;
  const gradient = ctx.createRadialGradient(ball.pos.x - 3, ball.pos.y - 4, 2, ball.pos.x, ball.pos.y, ball.radius + 3);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.28, "#b9fbff");
  gradient.addColorStop(0.68, "#03e9f4");
  gradient.addColorStop(1, "#1967ff");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, runtime: GameRuntime) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const particle of runtime.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(particle.pos.x, particle.pos.y, particle.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 15px Space Grotesk, sans-serif";
  for (const text of runtime.floatingTexts) {
    const alpha = clamp(text.life / text.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = text.color;
    ctx.shadowColor = text.color;
    ctx.shadowBlur = 14;
    ctx.fillText(text.text, text.pos.x, text.pos.y);
  }
  ctx.restore();
}

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  runtime: GameRuntime,
  controls: Controls,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(canvas.width / TABLE_WIDTH, 0, 0, canvas.height / TABLE_HEIGHT, 0, 0);

  const shakeX = runtime.shake > 0 ? (Math.random() - 0.5) * runtime.shake : 0;
  const shakeY = runtime.shake > 0 ? (Math.random() - 0.5) * runtime.shake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawTable(ctx, runtime);
  drawLaunchLane(ctx, runtime);
  drawRails(ctx);
  drawTargets(ctx, runtime);
  drawBumpers(ctx, runtime);
  drawFlippers(ctx, runtime, controls);
  drawParticles(ctx, runtime);
  drawBall(ctx, runtime);

  ctx.save();
  ctx.font = "900 23px Space Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = "#03e9f4";
  ctx.shadowBlur = 18;
  ctx.fillText("PINBALL STAR", TABLE_WIDTH / 2, 74);
  ctx.restore();

  if (runtime.phase === "ready" || runtime.phase === "charging") {
    ctx.save();
    ctx.font = "800 12px Space Grotesk, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(runtime.phase === "charging" ? "SOLTE PARA LANÇAR" : "CARREGUE O LANÇADOR", 230, 656);
    ctx.restore();
  }

  ctx.restore();

  if (runtime.flash > 0) {
    ctx.save();
    ctx.setTransform(canvas.width / TABLE_WIDTH, 0, 0, canvas.height / TABLE_HEIGHT, 0, 0);
    ctx.globalAlpha = runtime.flash * 0.32;
    ctx.fillStyle = "#ffffff";
    roundedRect(ctx, 12, 12, TABLE_WIDTH - 24, TABLE_HEIGHT - 24, 18);
    ctx.fill();
    ctx.restore();
  }
}

function readHighScore() {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
  const parsed = Number.parseInt(stored ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function persistHighScore(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
}

function isKeyboardControl(event: KeyboardEvent) {
  return event.code === "ArrowLeft" || event.code === "ArrowRight" || event.code === "Space";
}

export function PinballStar() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const controlsRef = useRef<Controls>({ left: false, right: false, launch: false, launchRequested: false });
  const highScoreRef = useRef(0);
  const lastHudRef = useRef(0);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [charge, setCharge] = useState(0);

  const syncHud = useCallback((runtime: GameRuntime) => {
    setHud((current) => {
      if (
        current.score === runtime.score &&
        current.highScore === runtime.highScore &&
        current.lives === runtime.lives &&
        current.phase === runtime.phase &&
        current.message === runtime.message
      ) {
        return current;
      }

      return {
        score: runtime.score,
        highScore: runtime.highScore,
        lives: runtime.lives,
        phase: runtime.phase,
        message: runtime.message,
      };
    });
  }, []);

  const restartGame = useCallback(() => {
    const highScore = Math.max(highScoreRef.current, runtimeRef.current?.highScore ?? 0);
    controlsRef.current = { left: false, right: false, launch: false, launchRequested: false };
    runtimeRef.current = createRuntime(highScore);
    syncHud(runtimeRef.current);
    setCharge(0);
  }, [syncHud]);

  useEffect(() => {
    highScoreRef.current = readHighScore();
    runtimeRef.current = createRuntime(highScoreRef.current);
    syncHud(runtimeRef.current);

    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;
    const drawingCanvas = canvas;
    const canvasParent = parent;

    const context = drawingCanvas.getContext("2d");
    if (!context) return undefined;
    const drawingContext = context;

    function resizeCanvas() {
      const bounds = canvasParent.getBoundingClientRect();
      const styles = window.getComputedStyle(canvasParent);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const cssWidth = clamp(bounds.width - horizontalPadding, 290, 544);
      const cssHeight = cssWidth * (TABLE_HEIGHT / TABLE_WIDTH);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      drawingCanvas.style.width = `${cssWidth}px`;
      drawingCanvas.style.height = `${cssHeight}px`;
      drawingCanvas.width = Math.floor(cssWidth * dpr);
      drawingCanvas.height = Math.floor(cssHeight * dpr);
    }

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvasParent);

    let lastTime = performance.now();

    function loop(now: number) {
      const runtime = runtimeRef.current;
      if (!runtime) return;

      const rawDelta = Math.min(0.032, (now - lastTime) / 1000);
      lastTime = now;
      const dt = Number.isFinite(rawDelta) && rawDelta > 0 ? rawDelta : 0.016;

      updateRuntime(runtime, controlsRef.current, dt);

      if (runtime.highScoreDirty) {
        persistHighScore(runtime.highScore);
        highScoreRef.current = runtime.highScore;
        runtime.highScoreDirty = false;
      }

      drawCanvas(drawingContext, drawingCanvas, runtime, controlsRef.current);

      if (now - lastHudRef.current > 80 || runtime.phase === "gameover") {
        lastHudRef.current = now;
        syncHud(runtime);
      }

      setCharge((current) => {
        const next = runtime.launchPower;
        return Math.abs(current - next) > 0.015 ? next : current;
      });

      frameRef.current = window.requestAnimationFrame(loop);
    }

    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [syncHud]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isKeyboardControl(event)) return;
      event.preventDefault();

      if (event.code === "ArrowLeft") controlsRef.current.left = true;
      if (event.code === "ArrowRight") controlsRef.current.right = true;
      if (event.code === "Space" && !event.repeat) controlsRef.current.launch = true;
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!isKeyboardControl(event)) return;
      event.preventDefault();

      if (event.code === "ArrowLeft") controlsRef.current.left = false;
      if (event.code === "ArrowRight") controlsRef.current.right = false;
      if (event.code === "Space") {
        controlsRef.current.launch = false;
        controlsRef.current.launchRequested = true;
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const setControl = useCallback((control: keyof Controls, active: boolean) => {
    controlsRef.current[control] = active;
  }, []);

  const handleLaunchPointer = useCallback((event: ReactPointerEvent<HTMLButtonElement>, active: boolean) => {
    event.preventDefault();
    if (active) {
      event.currentTarget.setPointerCapture(event.pointerId);
      controlsRef.current.launch = true;
      return;
    }

    controlsRef.current.launch = false;
    controlsRef.current.launchRequested = true;
  }, []);

  const handleFlipperPointer = useCallback((
    event: ReactPointerEvent<HTMLButtonElement>,
    side: FlipperSide,
    active: boolean,
  ) => {
    event.preventDefault();
    if (active) event.currentTarget.setPointerCapture(event.pointerId);
    setControl(side, active);
  }, [setControl]);

  const formattedScore = hud.score.toLocaleString("pt-BR");
  const formattedHighScore = hud.highScore.toLocaleString("pt-BR");

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#02050b] px-4 pb-10 pt-24 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(3,233,244,0.22),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(255,43,214,0.2),transparent_26%),linear-gradient(180deg,#02050b_0%,#081121_52%,#02050b_100%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(3,233,244,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(3,233,244,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 xl:grid xl:grid-cols-[280px_560px_280px] xl:items-start xl:justify-center">
        <div className="order-1 xl:order-none">
          <div className="rounded-[8px] border border-white/12 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">Arcade Canvas</p>
            <h1 className="mt-3 font-display text-4xl font-black leading-none tracking-normal text-white sm:text-5xl">
              Pinball <span className="text-cyan-300">Star</span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/66">
              Lance a bola, acerte bumpers, complete os targets STAR e use os flippers no timing para manter o combo vivo.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/70">Score</p>
                <p className="mt-1 font-display text-xl font-black text-white">{formattedScore}</p>
              </div>
              <div className="rounded-[8px] border border-pink-300/20 bg-pink-300/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-100/70">Vidas</p>
                <p className="mt-1 font-display text-xl font-black text-white">{"★".repeat(hud.lives)}</p>
              </div>
              <div className="rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/70">Recorde</p>
                <p className="mt-1 font-display text-xl font-black text-white">{formattedHighScore}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-2 flex flex-col items-center xl:order-none">
          <div className="relative w-full max-w-[560px] rounded-[8px] border border-cyan-200/20 bg-black/40 p-2 shadow-[0_0_60px_rgba(3,233,244,0.22),0_30px_90px_rgba(0,0,0,0.42)]">
            <canvas
              ref={canvasRef}
              aria-label="Mesa de pinball Pinball Star"
              className="block touch-none rounded-[8px] bg-[#02050b]"
            />

            {hud.phase === "gameover" ? (
              <div className="absolute inset-2 grid place-items-center rounded-[8px] bg-black/72 p-6 backdrop-blur-sm">
                <div className="max-w-sm text-center">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200/90">Game Over</p>
                  <h2 className="mt-3 font-display text-4xl font-black tracking-normal text-white">Fim de jogo</h2>
                  <p className="mt-3 text-sm leading-6 text-white/68">
                    Score final: <strong className="text-cyan-200">{formattedScore}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={restartGame}
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[8px] border border-cyan-200/35 bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 shadow-[0_0_26px_rgba(3,233,244,0.38)] transition hover:scale-[1.02] hover:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 w-full max-w-[560px] rounded-[8px] border border-white/12 bg-white/[0.055] p-3 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p aria-live="polite" className="min-w-0 flex-1 truncate text-sm font-bold text-white/78">
                {hud.message}
              </p>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-cyan-300 via-pink-400 to-white shadow-[0_0_18px_rgba(255,43,214,0.55)] transition-transform duration-75"
                  style={{ transform: `scaleX(${clamp(charge, 0, 1)})` }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
              <button
                type="button"
                aria-label="Acionar flipper esquerdo"
                onPointerDown={(event) => handleFlipperPointer(event, "left", true)}
                onPointerUp={(event) => handleFlipperPointer(event, "left", false)}
                onPointerCancel={(event) => handleFlipperPointer(event, "left", false)}
                className="min-h-16 rounded-[8px] border border-cyan-200/25 bg-cyan-300/14 px-3 py-2 text-lg font-black text-cyan-100 shadow-[inset_0_0_20px_rgba(3,233,244,0.14)]"
              >
                ◀
              </button>
              <button
                type="button"
                aria-label="Carregar e lançar bola"
                onPointerDown={(event) => handleLaunchPointer(event, true)}
                onPointerUp={(event) => handleLaunchPointer(event, false)}
                onPointerCancel={(event) => handleLaunchPointer(event, false)}
                className="min-h-16 rounded-[8px] border border-pink-200/30 bg-pink-300/16 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-pink-100 shadow-[inset_0_0_20px_rgba(255,43,214,0.14)]"
              >
                Launch
              </button>
              <button
                type="button"
                aria-label="Acionar flipper direito"
                onPointerDown={(event) => handleFlipperPointer(event, "right", true)}
                onPointerUp={(event) => handleFlipperPointer(event, "right", false)}
                onPointerCancel={(event) => handleFlipperPointer(event, "right", false)}
                className="min-h-16 rounded-[8px] border border-pink-200/25 bg-pink-300/14 px-3 py-2 text-lg font-black text-pink-100 shadow-[inset_0_0_20px_rgba(255,43,214,0.14)]"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="order-3 xl:order-none">
          <div className="rounded-[8px] border border-white/12 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-200/80">Controles</p>
            <div className="mt-4 space-y-3 text-sm text-white/66">
              <div className="flex items-center justify-between gap-3 rounded-[8px] bg-white/[0.06] px-3 py-2">
                <span>Flipper esquerdo</span>
                <kbd className="rounded bg-cyan-300/16 px-2 py-1 font-mono text-xs font-bold text-cyan-100">←</kbd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[8px] bg-white/[0.06] px-3 py-2">
                <span>Flipper direito</span>
                <kbd className="rounded bg-pink-300/16 px-2 py-1 font-mono text-xs font-bold text-pink-100">→</kbd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[8px] bg-white/[0.06] px-3 py-2">
                <span>Lançador</span>
                <kbd className="rounded bg-white/12 px-2 py-1 font-mono text-xs font-bold text-white">Space</kbd>
              </div>
            </div>

            <button
              type="button"
              onPointerDown={(event) => handleLaunchPointer(event, true)}
              onPointerUp={(event) => handleLaunchPointer(event, false)}
              onPointerCancel={(event) => handleLaunchPointer(event, false)}
              className="mt-5 hidden w-full min-h-12 rounded-[8px] border border-cyan-200/35 bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_0_28px_rgba(3,233,244,0.32)] transition hover:scale-[1.02] hover:bg-white md:inline-flex md:items-center md:justify-center"
            >
              Launch
            </button>

            <button
              type="button"
              onClick={restartGame}
              className="mt-3 inline-flex w-full min-h-12 items-center justify-center rounded-[8px] border border-white/15 bg-white/[0.08] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-pink-200/45 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
              Reiniciar partida
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
