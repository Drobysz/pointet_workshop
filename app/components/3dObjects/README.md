# Interactive homepage objects

```tsx
import { CuratedObjects3D, SilverBag3D, SatinDress3D } from "@/components/3dObjects";

export default function Page() {
    return (
        <main>
            <CuratedObjects3D />
            <SilverBag3D />
            <SatinDress3D />
        </main>
    );
}
```

Each export is a client entry point that can be imported into a server page. A section
reserves its full height during loading: `width: 100%`, `100vh` with a `100svh` override
for stable mobile browser chrome. The canvas is transparent. Apply a background to the
section or an ancestor. The storefront uses these components in the home page's
3D gallery (`ThreeDGlassGallery`).

Optional props: `id`, `className`, `style`, `label`, `instructions`, `fallbackText`, and
`idleMotion`. The three text props default to the localized `home.objects` messages
(next-intl); pass them only to override that wording. Idle motion defaults
to `false`; enabling it adds a slow, bounded 0.025-radian oscillation until the first
manual interaction.

## Models and materials

All models are original and authored procedurally in this repository (no third-party
meshes, scans, textures or HDRIs), then prebuilt into compressed, indexed geometry in
`public/3d`. The handbag follows the general shape language of a supplied product
photo (inverted-egg body rising into the handle, egg-shaped opening, pebble dome) but
is modelled from scratch with its own proportions and carries no logo or brand mark.

| Model | Construction | Triangles | Download |
| --- | --- | ---: | ---: |
| Curated objects | Half-moon bag (signed-distance field, surface nets) with gold tube handle and turn-lock; white satin corset (parametric: sweetheart neckline, cinched waist, basque point, fourteen puffed panels with boning cords, edge piping, laced back with eyelets); three-strand twisted bangle (parametric torus) | 36,784 | 335 KiB |
| Silver handbag | One signed-distance surface: inverted-egg silhouette (hull of two circles, flattened base) pierced by an egg-shaped opening; elliptical rounding from the outer edge gives the pebble dome, a tighter rounding from the opening gives the mouth lip and the narrow, deep handle band; a faint low-frequency undulation, as on hand-polished metal | 28,540 | 294 KiB |
| Satin dress | Parametric ghost-mannequin surface: sweetheart neckline, cinched waist, flared bias skirt with two-frequency drifting folds, high-low hem and short train; piping at neckline, waist and hem; spaghetti straps | 25,872 | 243 KiB |

- The **composition** uses three materials: white duchess satin (sheen, light clear coat,
  double sided), cherry lacquer (clear coat) and polished gold. Each piece floats and turns on
  its own slow, bounded cycle; the bangle turns about its own axis. Viewports narrower
  than 0.85:1 use a stacked arrangement so the group stays legible on phones.
- The **handbag** is polished silver: metalness 1, roughness 0.045, no clear coat (a
  coat over metal reads as plastic), shown almost front-on. It is lit by the `product`
  studio preset and rendered with neutral tone mapping, which keeps mirror whites white. A slow ±0.16-radian turn lets reflections travel over the surface.
- The **dress** is wine satin: physical material with sheen, light clear coat, double
  sided so the interior reads at the hem. A vertex-shader sway (no cloth solver) moves
  the skirt slightly, growing toward the hem; the bodice is untouched.

Ambient motion runs only while a section is visible and never with reduced motion; it
adds to the scroll and drag rotation below rather than replacing it.

## Shared behavior

- `ObjectSection` owns stable layout, accessible descriptions, reduced-motion
  detection, visibility tracking, lazy scene loading, and a rendering error fallback.
- `InteractiveObjectScene` configures the canvas and camera. It centers the actual
  model bounds and fits their eight rotated corners inside the perspective view,
  with 24% framing space. Models shrink immediately to stay in view and expand smoothly.
- `StudioEnvironment` bakes a local studio reflection environment once, from a preset:
  - `studio` (composition, dress; 256 px per face): dark ground, tinted horizon, pale
    sky and eight feathered softboxes, including a floor sweep and a split front pair.
  - `product` (handbag; 512 px per face): a product-photography set for mirror metal,
    with a pale seamless sweep, a dark far-wall band at eye level, large soft sources
    and two broad hard-edged black flags beside the lens. Flags write depth first and
    mask softboxes behind them.
  The horizon borrows a little of each section's backdrop colour (`studioTint`) so chrome
  and gold sit in their scene. It never becomes the visible background.
- `useObjectDragRotation` uses pointer capture, relative drag sensitivity, bounded X
  rotation (±0.48 radians), unrestricted Y rotation, damped response, and brief
  frame-rate-independent inertia. No zoom, pan, wheel listener, or OrbitControls.
- `useSectionScrollRotation` measures the individual section's bounding rectangle,
  mapping entry through exit to ±0.3 radians of X rotation and ±0.45 radians of Y
  rotation. Objects rotate in place around their centered pivot, with no scroll-driven
  translation. Scroll angles are added to manual angles, preserving drag sensitivity,
  damping, and release inertia. Measurements
  are coalesced into animation frames and also respond to nested scrolling and resizing.
- `useGeometry` reads prebuilt geometry, expands its 16-bit quantized positions and
  normals to floats, owns per-viewer GPU resources, and releases them on unmount.
  Downloaded buffers are shared between instances.

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
- Browser startup runs no field sampling, surface extraction or lathe construction.
  Positions are quantized to 16 bits over each mesh's bounds (sub-0.1 mm error at
  model scale) and normals to 16 bits. The three gzip assets total about 870 KiB
  and decode with the browser's native `DecompressionStream` API.
- Canvas dimensions use untransformed layout measurements, so an ancestor's CSS
  scale does not enlarge the drawing buffer twice or shift the object's center.
  Scrolling does not trigger canvas remeasurement; actual layout resizing still does.
- Studio lighting uses Three.js directly, avoiding Drei's environment-loader
  dependency graph, including HDR, EXR, and gain-map loaders.
- DPR is capped at 1.5.
- Demand rendering stops after motion settles, while offscreen or background-tab
  sections do not schedule continuous frames. Already loaded viewers stay mounted.
- Draw calls: four for the composition, one each for the handbag and the dress,
  excluding the one-time studio bake. No shadows, post-processing, downloaded textures,
  or cloth simulation.
- Each mounted model wraps cached arrays in its own geometry. R3F manages declarative
  material lifetime; the studio component disposes its render target on unmount.

After changing a procedural shape, run `npm run build:3d` and commit the generated
`public/3d` files and `shared/geometryAssets.ts`. The generator verifies that indexing
preserves every triangle's position and normal within 0.000001 model units and that
all values are finite, then reports triangle counts and download size. Modelling helpers
(surface nets, smooth union, parametric surfaces) live in `shared/sdf.ts`. Asset
names contain content hashes. Source geometry builders are excluded from the browser
import graph. Asset generation requires Node 22.12 or newer.

Viewer runtime dependencies: `three`, `@react-three/fiber`.
Added development dependency: `@types/three`. The existing npm lockfile was updated.

## Validation

Lint and TypeScript are clean for these components and the gallery section. Browser
checks cover desktop (800×600), tablet (768×1024) and phone (375×812) framing, the
stacked composition layout, heading fit, and scroll-linked rotation. The full Next.js
build compiles, then stops on pre-existing TypeScript errors in unrelated files
(`app/[locale]/(main)/test/page.tsx`, `ImagesSliderBackground`, `TabList.props`).
Physical-device GPU performance has not been benchmarked.
