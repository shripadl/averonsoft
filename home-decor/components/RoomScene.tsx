"use client";

import { Component, useMemo, type ReactNode } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Grid,
  Html,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import {
  getCatalogItem,
  type CatalogItem,
} from "@homedecor/lib/furniture-catalog";
import {
  aabbFullyInside,
  aabbOverlap,
  polygonBounds,
  rotatedFootprintAabb,
  type PlacedItem,
  type RoomSpec,
  type Vec2,
} from "@homedecor/lib/room";
import { formatLength, type LengthUnit } from "@homedecor/lib/units";
import type { FloorPlanCalibration } from "@homedecor/lib/floor-plan";
import { imageWorldSize } from "@homedecor/lib/floor-plan";

class SceneErrorBoundary extends Component<
  { children: ReactNode; onReset?: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="homedecor-canvas-loading" role="alert">
          <p>3D view hit an error and was reset.</p>
          <button
            type="button"
            className="homedecor-btn homedecor-btn--primary"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset?.();
            }}
          >
            Reload view
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type RoomSceneProps = {
  room: RoomSpec;
  items: PlacedItem[];
  selectedId: string | null;
  placingCatalogId: string | null;
  unit: LengthUnit;
  showGrid: boolean;
  floorPlan: FloorPlanCalibration | null;
  onSelect: (id: string | null) => void;
  onPlace: (x: number, z: number) => void;
  onMoveSelected: (x: number, z: number) => void;
};

function outlineShape(outline: Vec2[]): THREE.Shape {
  const shape = new THREE.Shape();
  const first = outline[0]!;
  // Shape is XY; mesh rotates -90° about X so shape Y → world −Z. Negate Z.
  shape.moveTo(first.x, -first.z);
  for (let i = 1; i < outline.length; i++) {
    const p = outline[i]!;
    shape.lineTo(p.x, -p.z);
  }
  shape.closePath();
  return shape;
}

function RoomMesh({
  room,
  floorPlan,
}: {
  room: RoomSpec;
  floorPlan: FloorPlanCalibration | null;
}) {
  const floorGeo = useMemo(() => {
    const shape = outlineShape(room.outline);
    return new THREE.ShapeGeometry(shape);
  }, [room.outline]);

  const wallMeshes = useMemo(() => {
    const h = room.ceilingHeight;
    const thickness = 0.08;
    const segments: {
      key: string;
      position: [number, number, number];
      args: [number, number, number];
      rotation: [number, number, number];
    }[] = [];

    for (let i = 0; i < room.outline.length; i++) {
      const a = room.outline[i]!;
      const b = room.outline[(i + 1) % room.outline.length]!;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.01) continue;
      const midX = (a.x + b.x) / 2;
      const midZ = (a.z + b.z) / 2;
      const yaw = Math.atan2(dx, dz);
      segments.push({
        key: `wall-${i}`,
        position: [midX, h / 2, midZ],
        args: [thickness, h, len],
        rotation: [0, yaw, 0],
      });
    }
    return segments;
  }, [room.outline, room.ceilingHeight]);

  const bounds = useMemo(() => polygonBounds(room.outline), [room.outline]);
  const planSize = floorPlan ? imageWorldSize(floorPlan) : null;

  return (
    <group>
      <mesh
        geometry={floorGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#cfd8e3" roughness={0.92} metalness={0.02} />
      </mesh>

      {floorPlan?.imageUrl && planSize ? (
        <FloorPlanDecal
          url={floorPlan.imageUrl}
          width={planSize.width}
          depth={planSize.depth}
        />
      ) : null}

      {wallMeshes.map((w) => (
        <mesh
          key={w.key}
          position={w.position}
          rotation={w.rotation}
          castShadow
          receiveShadow
        >
          <boxGeometry args={w.args} />
          <meshStandardMaterial color="#e8eef5" roughness={0.85} />
        </mesh>
      ))}

      <mesh
        position={[
          (bounds.minX + bounds.maxX) / 2,
          room.ceilingHeight,
          (bounds.minZ + bounds.maxZ) / 2,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry
          args={[
            Math.max(1, bounds.maxX - bounds.minX) * 1.15,
            Math.max(1, bounds.maxZ - bounds.minZ) * 1.15,
          ]}
        />
        <meshStandardMaterial
          color="#f4f7fb"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function FloorPlanDecal({
  url,
  width,
  depth,
}: {
  url: string;
  width: number;
  depth: number;
}) {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [url]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={texture} transparent opacity={0.55} />
    </mesh>
  );
}

function FurnitureMesh({
  item,
  catalog,
  selected,
  invalid,
  unit,
  onSelect,
}: {
  item: PlacedItem;
  catalog: CatalogItem;
  selected: boolean;
  invalid: boolean;
  unit: LengthUnit;
  onSelect: () => void;
}) {
  const color = invalid ? "#b33b2e" : catalog.color;
  const label = `${catalog.name} · ${formatLength(catalog.width, unit)} x ${formatLength(catalog.depth, unit)} x ${formatLength(catalog.height, unit)}`;

  return (
    <group
      position={[item.x, catalog.height / 2, item.z]}
      rotation={[0, (item.rotationY * Math.PI) / 180, 0]}
    >
      <mesh
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerDown={(e: ThreeEvent<PointerEvent>) => e.stopPropagation()}
      >
        <boxGeometry args={[catalog.width, catalog.height, catalog.depth]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.05}
          emissive={selected ? "#1e5a8a" : "#000000"}
          emissiveIntensity={selected ? 0.28 : 0}
        />
      </mesh>

      {/* Footprint outline */}
      <mesh
        position={[0, -catalog.height / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[catalog.width + 0.02, catalog.depth + 0.02]} />
        <meshBasicMaterial
          color={invalid ? "#b33b2e" : selected ? "#1e5a8a" : "#334155"}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {selected ? (
        <Html
          position={[0, catalog.height / 2 + 0.12, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <div className="homedecor-item-label">{label}</div>
        </Html>
      ) : null}
    </group>
  );
}

function FloorClickPlane({
  room,
  placing,
  onPlace,
  onMoveSelected,
  hasSelection,
}: {
  room: RoomSpec;
  placing: boolean;
  onPlace: (x: number, z: number) => void;
  onMoveSelected: (x: number, z: number) => void;
  hasSelection: boolean;
}) {
  const bounds = polygonBounds(room.outline);
  const w = Math.max(1, bounds.maxX - bounds.minX) + 2;
  const d = Math.max(1, bounds.maxZ - bounds.minZ) + 2;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.003, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const p = e.point;
        if (placing) onPlace(p.x, p.z);
        else if (hasSelection) onMoveSelected(p.x, p.z);
      }}
    >
      <planeGeometry args={[w * 2, d * 2]} />
      {/* Transparent hit target — must stay visible for reliable raycasts */}
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function SceneContents(props: RoomSceneProps) {
  const {
    room,
    items,
    selectedId,
    placingCatalogId,
    unit,
    showGrid,
    floorPlan,
    onSelect,
    onPlace,
    onMoveSelected,
  } = props;

  const validity = useMemo(() => {
    const map = new Map<string, boolean>();
    const aabbs = items.map((item) => {
      const cat = getCatalogItem(item.catalogId);
      if (!cat) return null;
      return {
        id: item.id,
        aabb: rotatedFootprintAabb(
          item.x,
          item.z,
          cat.width,
          cat.depth,
          item.rotationY,
        ),
      };
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const entry = aabbs[i];
      if (!entry) {
        map.set(item.id, true);
        continue;
      }
      let bad =
        !aabbFullyInside(entry.aabb, room.outline) ||
        aabbs.some(
          (other, j) =>
            j !== i && other != null && aabbOverlap(entry.aabb, other.aabb),
        );
      map.set(item.id, bad);
    }
    return map;
  }, [items, room.outline]);

  const bounds = polygonBounds(room.outline);
  const span = Math.max(
    bounds.maxX - bounds.minX,
    bounds.maxZ - bounds.minZ,
    4,
  );

  return (
    <>
      <color attach="background" args={["#d5e0ec"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[6, 10, 4]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#e8f0f8", "#9aa8b5", 0.35]} />

      <RoomMesh room={room} floorPlan={floorPlan} />

      {showGrid ? (
        <Grid
          position={[0, 0.01, 0]}
          args={[span + 4, span + 4]}
          cellSize={0.1}
          cellThickness={0.6}
          cellColor="#9eb0c2"
          sectionSize={1}
          sectionThickness={1.2}
          sectionColor="#1e5a8a"
          fadeDistance={span + 6}
          infiniteGrid={false}
        />
      ) : null}

      <FloorClickPlane
        room={room}
        placing={placingCatalogId != null}
        onPlace={onPlace}
        onMoveSelected={onMoveSelected}
        hasSelection={selectedId != null}
      />

      {items.map((item) => {
        const cat = getCatalogItem(item.catalogId);
        if (!cat) return null;
        return (
          <FurnitureMesh
            key={item.id}
            item={item}
            catalog={cat}
            selected={item.id === selectedId}
            invalid={validity.get(item.id) === true}
            unit={unit}
            onSelect={() => onSelect(item.id)}
          />
        );
      })}

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.35}
        scale={span + 4}
        blur={2.2}
      />

      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.05}
        minDistance={1.5}
        maxDistance={span * 3}
        target={[0, 0.4, 0]}
      />
    </>
  );
}

export function RoomScene(props: RoomSceneProps) {
  return (
    <SceneErrorBoundary>
      <Canvas
        shadows
        camera={{ position: [5.5, 4.5, 5.5], fov: 45, near: 0.1, far: 200 }}
        onPointerMissed={() => {
          if (!props.placingCatalogId) props.onSelect(null);
        }}
        gl={{ antialias: true }}
      >
        <SceneContents {...props} />
      </Canvas>
    </SceneErrorBoundary>
  );
}
