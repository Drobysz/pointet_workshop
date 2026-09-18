# Interactive tableware

```tsx
import { WineGlass3D, SilverPlate3D, SilverFork3D } from "@/components/3dObjects";

export default function Page() {
    return (
        <main>
            <WineGlass3D />
            <SilverPlate3D />
            <SilverFork3D />
        </main>
    );
}
```

Each export is a client entry point that can be imported into a server page. A section
reserves its full height during loading: `width: 100%`, `100vh` with a `100svh` override
for stable mobile browser chrome. The canvas is transparent. Apply a background to the
section or an ancestor. The storefront uses these components in the home page's
tableware gallery.

Optional props: `id`, `className`, `style`, `label`, `instructions`, `fallbackText`, and
`idleMotion`. Translate the last three text props as appropriate. Idle motion defaults
to `false`; enabling it adds a slow, bounded 0.025-radian oscillation until the first
manual interaction. It never spins continuously.

## Models and materials

The models are authored procedurally and prebuilt into compressed, indexed geometry
in `public/3d`. There are no external texture or HDRI service dependencies.
The supplied attachment contained the written brief but no reference
images, so the shapes follow the described proportions and details.

| Model | Geometry | Approximate triangles |
| --- | --- | ---: |
| Wine glass | Hollow lathed bowl, sixteen tapered crystal cuts, stem, base, rolled lip, separate closed wine volume | 9,816 |
| Silver plate | Closed shallow lathed body, rolled rim, 64 chased loops | 14,432 |
| Silver fork | Three separated tines, beveled body tessellated before bending, raised ornaments on both faces, small gold accents | 11,998 |

The wine reaches about 40% of the bowl height and has a flat top with a small meniscus.
It rotates with the object; there is no gravity solver or liquid simulation. Crystal
uses `MeshPhysicalMaterial`, transmission 0.99, IOR 1.52, and thin-wall absorption.
The wine uses a glossy ruby material with explicit alpha blending in the opaque render
queue. This allows Three's glass transmission capture to see the slightly translucent
liquid, avoiding nested transmission passes and stochastic transparency noise.

`glassMaterial.ts` adds reflection coverage to the standard physical shader's alpha
output for compositing over CSS backgrounds. The renderer uses straight alpha. Actual
refraction of DOM content behind a canvas is not possible with this renderer; glass
refracts scene content and composites over the site's background. This is a deliberate
web rendering approximation, not a physically exact nested dielectric simulation.

Silver uses full metalness and roughness of roughly 0.18–0.29. The plate's decoration
is geometric; it needs no normal or roughness textures. The fork is visibly curved in
depth, with rounded edges rather than a flat silhouette.

## Shared behavior

- `ObjectSection` owns stable layout, accessible descriptions, reduced-motion
  detection, visibility tracking, lazy scene loading, and a rendering error fallback.
- `InteractiveObjectScene` configures the canvas and camera. It centers the actual
  model bounds and fits their eight rotated corners inside the perspective view,
  with 24% framing space. Models shrink immediately to stay in view and expand smoothly.
- `StudioEnvironment` bakes a local studio reflection environment once at 128 pixels
  per cube face using seven Three.js light panels. It never becomes the visible background.
- `useObjectDragRotation` uses pointer capture, relative drag sensitivity, bounded X
  rotation (±0.48 radians), unrestricted Y rotation, damped response, and brief
  frame-rate-independent inertia. No zoom, pan, wheel listener, or OrbitControls.
- `useSectionScrollRotation` measures the individual section's bounding rectangle,
  mapping entry through exit to ±0.3 radians of X rotation and ±0.45 radians of Y
  rotation. Objects rotate in place around their centered pivot, with no scroll-driven
  translation. Scroll angles are added to manual angles, preserving drag sensitivity,
  damping, and release inertia. Measurements
  are coalesced into animation frames and also respond to nested scrolling and resizing.
- `useGeometry` reads prebuilt geometry, owns per-viewer GPU resources, and releases
  them on unmount. Downloaded buffers are shared between instances.

Desktop drags can rotate on both axes. Touch uses `touch-action: pan-y pinch-zoom`:
vertical swipes belong to native page scrolling, while horizontally initiated swipes
rotate the model (with vertical adjustment possible as that drag continues). The
browser can cancel a gesture when it takes over scrolling; cancellation clears inertia.
Arrow keys rotate a focused section; Home resets its manual rotation.

Reduced motion disables scroll and idle motion, and removes release inertia. Manual
rotation remains available with short damping. Per-frame values live in refs, not
React state.

## Performance and loading

- Three, Fiber, model code, and geometry preload during browser idle time after
  hydration. Canvases mount two viewport heights ahead (at least 1,200 pixels),
  preparing their GPU buffers and studio reflections before entering view.
- Browser startup no longer runs extrusion, tessellation, lathe construction, or
  decoration merging. Indexed geometry reduces stored vertices from 93,922 to
  22,418 (76%) while preserving triangles and normals. The three gzip assets total
  about 386 KiB and decode with the browser's native `DecompressionStream` API.
- Canvas dimensions use untransformed layout measurements, so an ancestor's CSS
  scale does not enlarge the drawing buffer twice or shift the object's center.
  Scrolling does not trigger canvas remeasurement; actual layout resizing still does.
- Studio lighting uses Three.js directly, avoiding Drei's environment-loader
  dependency graph, including HDR, EXR, and gain-map loaders.
- DPR is capped at 1.5. Glass transmission uses a half-resolution render target.
- Demand rendering stops after motion settles, while offscreen or background-tab
  sections do not schedule continuous frames. Already loaded viewers stay mounted.
- Each model uses two material meshes, excluding the glass transmission pass and the
  one-time studio bake. No shadows, post-processing, downloaded textures, or fluids.
- Each mounted model wraps cached arrays in its own geometry. R3F manages declarative
  material lifetime; the studio component disposes its render target on unmount.

After changing a procedural shape, run `npm run build:3d` and commit the generated
`public/3d` files and `shared/geometryAssets.ts`. The generator verifies that indexing
preserves every triangle's position and normal within 0.000001 model units. Asset
names contain content hashes. Source geometry builders are excluded from the browser
import graph. Asset generation requires Node 22.12 or newer.

Viewer runtime dependencies: `three`, `@react-three/fiber`.
Added development dependency: `@types/three`. The existing npm lockfile was updated.

## Validation

Lint and a focused TypeScript check cover the new components and preview page. Geometry
checks cover finite vertices/normals, the triangle budget, and ray intersections proving
three distinct fork tines. Rotation checks cover section entry/center/exit, clamping,
and equivalent inertia across time steps. Browser checks cover desktop/mobile framing,
manual drag, keyboard rotation, and section scrolling.

The full Next.js build compiles the bundle, then stops on existing TypeScript errors in
`GridContainer` and `NotificationPopUp` (including its missing context import). Those
unrelated files are outside this change. Physical-device GPU performance has not been
benchmarked.
