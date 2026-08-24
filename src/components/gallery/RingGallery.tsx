"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, invalidate } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scrollSignal } from "@/lib/scroll-signal";
import { spring } from "@/lib/motion";
import { clamp, pad } from "@/lib/utils";
import type { Photo } from "@content/types";

/**
 * Scroll-driven cylindrical gallery.
 *
 * Geometry: photographs sit at even angles around a cylinder and face outward,
 * with the camera parked outside the front of the ring. The whole ring is then
 * tilted on its Z axis, which turns each photograph's circular path into an
 * ellipse running from lower-right to upper-left — a shallow helix rather than a
 * flat carousel. A small per-photo vertical stagger keeps them from reading as
 * one rigid plane. The tilt leaves the front position at dead centre, so the
 * photograph you are looking at is never thrown off-axis.
 *
 * Direction: scrolling down turns the ring so photographs travel *up* that
 * ellipse — in from the lower right, across the centre, out at the upper left.
 * That is the whole point of tilting it, so the sign of the scroll term is not
 * cosmetic: negate it and the helix runs backwards down the same path.
 *
 * Rotation is driven by scroll progress through a tall sticky track, so wheel,
 * trackpad and touch all work without the page ever trapping the scroll — and
 * dragging adds direct manipulation on top, at roughly 1:1 with the pointer.
 *
 * The infinite-wrap idea (recompute an item's offset once it leaves the valid
 * range so it re-enters seamlessly) is taken from Codrops' wavy R3F carousel
 * article; here the range is angular rather than linear, and the whole thing runs
 * on the CPU — v1 needs no shader for this. See REFERENCES.md.
 *
 * Performance:
 *  - `frameloop="demand"`: the canvas only renders while something is moving.
 *    When the ring is at rest the GPU is idle.
 *  - Planes outside the front arc are culled with `visible={false}`, so a
 *    fourteen-photo ring draws about six.
 *  - Textures load through drei's cache and are colour-space corrected once.
 */

const TAU = Math.PI * 2;
/** Full turns of the ring across the whole scroll track. */
const TURNS = 1.15;
const PLANE_HEIGHT = 2.6;
const GAP = 1.0;
/** Beyond this angle from the front, a plane is not drawn at all. */
const CULL_ANGLE = Math.PI * 0.62;
const FADE_ANGLE = Math.PI * 0.42;

export type FocusPayload = {
  index: number;
  /** Screen-space rect of the plane, for the FLIP into fullscreen. */
  rect: { left: number; top: number; width: number; height: number };
};

type RingProps = {
  photos: Photo[];
  progress: React.RefObject<number>;
  drag: React.RefObject<number>;
  dragging: React.RefObject<boolean>;
  onFocus: (payload: FocusPayload) => void;
  onNearest: (index: number) => void;
  /** Hands the parent a way to request a frame, without it importing R3F. */
  onInvalidate?: (request: () => void) => void;
};

function Ring({ photos, progress, drag, dragging, onFocus, onNearest, onInvalidate }: RingProps) {
  const group = useRef<THREE.Group>(null);
  const textures = useTexture(photos.map((photo) => photo.src));
  const { camera, gl } = useThree();

  useEffect(() => {
    onInvalidate?.(() => invalidate());
  }, [onInvalidate]);

  const items = useMemo(() => {
    const list = Array.isArray(textures) ? textures : [textures];
    return photos.map((photo, index) => {
      const texture = list[index] as THREE.Texture;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      const aspect = photo.width / photo.height;
      // A deterministic wave rather than random, so the stagger reads as rhythm.
      const offsetY = Math.sin(index * 1.9) * spring.ring.stagger;

      return { photo, texture, width: PLANE_HEIGHT * aspect, height: PLANE_HEIGHT, offsetY };
    });
  }, [photos, textures]);

  const radius = useMemo(() => {
    const circumference = items.reduce((total, item) => total + item.width + GAP, 0);
    return circumference / TAU;
  }, [items]);

  const step = TAU / items.length;

  const state = useRef({ current: 0, previous: 0, snap: 0, nearest: -1 });
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const s = state.current;

    // Negative: φ = base + rotation, and x = r·sin φ, y = −sin φ·amplitude. A
    // *decreasing* φ therefore carries a plane leftward and upward at the same
    // time, which is the lower-right → upper-left travel the helix is for.
    const target = -progress.current * TURNS * TAU + drag.current + s.snap;

    // Inertia: the ring chases the target rather than tracking it exactly, which
    // is what makes a flick coast.
    s.previous = s.current;
    s.current += (target - s.current) * spring.ring.follow;

    const velocity = s.current - s.previous;

    // Soft snap: once the ring has all but stopped and nobody is dragging, nudge
    // the nearest photo onto the front axis. It is a pull, not a lock.
    if (!dragging.current && Math.abs(velocity) < spring.ring.snapThreshold) {
      const desired = Math.round(s.current / step) * step;
      s.snap += (desired - s.current) * spring.ring.snapStrength;
    }

    // Scroll speed leaks a little extra rotation in, so the ring feels attached
    // to the same physics as the rest of the site. Same sign as the scroll term
    // above, or the leak fights the rotation it is supposed to exaggerate.
    const extra = -scrollSignal.velocity * spring.ring.drive * 0.06;

    if (group.current) group.current.rotation.y = s.current + extra;

    // Per-plane visibility and fade, computed from the front-facing angle.
    let closest = 0;
    let closestAngle = Infinity;

    for (let i = 0; i < items.length; i += 1) {
      const mesh = meshes.current[i];
      if (!mesh) continue;

      // Signed angle of this plane from the front of the ring, wrapped to -π…π.
      // This wrap is what makes the ring infinite in both directions.
      let angle = (i * step + s.current + extra) % TAU;
      if (angle > Math.PI) angle -= TAU;
      if (angle < -Math.PI) angle += TAU;

      const magnitude = Math.abs(angle);
      if (magnitude < closestAngle) {
        closestAngle = magnitude;
        closest = i;
      }

      const visible = magnitude < CULL_ANGLE;
      mesh.visible = visible;
      if (!visible) continue;

      const fade = 1 - clamp((magnitude - FADE_ANGLE) / (CULL_ANGLE - FADE_ANGLE), 0, 1);
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = fade;

      // The helix. `sin(angle)` is +1 on the right of the ring and -1 on the
      // left, so subtracting it drops the right and lifts the left: the path is
      // a shallow diagonal from lower-right to upper-left, and the photo at the
      // front (angle 0) stays exactly on the centre line. Which way a plane
      // *travels* along that diagonal is set by the sign of the scroll term.
      const swing = Math.sin(angle);
      mesh.position.y = items[i].offsetY - swing * spring.ring.verticalAmplitude;
      mesh.rotation.z = -swing * spring.ring.lean;
    }

    if (closest !== s.nearest) {
      s.nearest = closest;
      onNearest(closest);
    }

    // Keep rendering only while something is actually happening.
    const settled =
      Math.abs(velocity) < 0.00005 && Math.abs(extra) < 0.00005 && !dragging.current;
    if (!settled) invalidate();
  });

  /** Projects a plane's corners to CSS pixels, for the fullscreen FLIP. */
  const rectOf = useCallback(
    (mesh: THREE.Mesh, width: number, height: number) => {
      const canvasRect = gl.domElement.getBoundingClientRect();
      const corners = [
        new THREE.Vector3(-width / 2, -height / 2, 0),
        new THREE.Vector3(width / 2, -height / 2, 0),
        new THREE.Vector3(-width / 2, height / 2, 0),
        new THREE.Vector3(width / 2, height / 2, 0),
      ];

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      mesh.updateWorldMatrix(true, false);

      for (const corner of corners) {
        const projected = corner.applyMatrix4(mesh.matrixWorld).project(camera);
        const x = (projected.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
        const y = (-projected.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
    },
    [camera, gl],
  );

  return (
    <group ref={group}>
      {items.map((item, index) => {
        const angle = index * step;
        return (
          <mesh
            key={item.photo.id}
            ref={(mesh) => {
              meshes.current[index] = mesh;
            }}
            position={[Math.sin(angle) * radius, item.offsetY, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
            onClick={(event) => {
              event.stopPropagation();
              const mesh = meshes.current[index];
              if (!mesh) return;
              onFocus({ index, rect: rectOf(mesh, item.width, item.height) });
            }}
            onPointerOver={() => {
              gl.domElement.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              gl.domElement.style.cursor = "";
            }}
          >
            <planeGeometry args={[item.width, item.height]} />
            <meshBasicMaterial map={item.texture} transparent toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function RingScene({
  photos,
  progress,
  drag,
  dragging,
  onFocus,
  onNearest,
  onInvalidate,
}: RingProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 38, position: [0, 0, 0], near: 0.1, far: 200 }}
      onCreated={({ camera, scene }) => {
        // Park the camera just outside the front of the ring. The radius depends
        // on the photo set, so it is set here rather than in the camera prop.
        const circumference = photos.reduce(
          (total, photo) => total + PLANE_HEIGHT * (photo.width / photo.height) + GAP,
          0,
        );
        const radius = circumference / TAU;
        camera.position.set(0, 0, radius + 7.4);
        camera.lookAt(0, 0, 0);
        scene.background = null;
      }}
    >
      <Suspense fallback={null}>
        <Ring
          photos={photos}
          progress={progress}
          drag={drag}
          dragging={dragging}
          onFocus={onFocus}
          onNearest={onNearest}
          onInvalidate={onInvalidate}
        />
      </Suspense>
    </Canvas>
  );
}

/** Exported for the overlay's counter. */
export const formatIndex = (index: number, total: number) =>
  `${pad(index + 1)} / ${pad(total)}`;
