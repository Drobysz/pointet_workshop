import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import ts from "typescript";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "components/3dObjects");
const temporary = mkdtempSync(join(root, ".3d-build-"));
const require = createRequire(import.meta.url);
const models = {
    curated: ["CuratedObjects3D/curatedGeometry", "createCuratedGeometry"],
    bag: ["SilverBag3D/bagGeometry", "createBagGeometry"],
    dress: ["SatinDress3D/dressGeometry", "createDressGeometry"],
};
const assets = {};

try {
    for (const file of ["shared/geometry", "shared/sdf", ...Object.values(models).map(([file]) => file)]) {
        const output = ts.transpileModule(readFileSync(join(source, `${file}.ts`), "utf8"), {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
        }).outputText;
        const destination = join(temporary, `${file}.js`);
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, output);
    }
    mkdirSync(join(root, "public/3d"), { recursive: true });
    for (const [kind, [file, factory]] of Object.entries(models)) {
        const started = performance.now();
        const geometries = require(join(temporary, `${file}.js`))[factory]();
        const buildMs = performance.now() - started;
        const meshes = {};
        const chunks = [];
        let offset = 0;
        let originalVertices = 0;
        let indexedVertices = 0;
        let triangles = 0;
        for (const [name, original] of Object.entries(geometries)) {
            // No material uses UVs. Retain positions and normals, including hard edges.
            original.deleteAttribute("uv");
            const geometry = mergeVertices(original, 1e-7);
            originalVertices += original.getAttribute("position").count;
            indexedVertices += geometry.getAttribute("position").count;
            // Verify that indexing retains every triangle and its shading normals.
            const count = original.index?.count ?? original.getAttribute("position").count;
            if (geometry.index.count !== count) throw new Error(`${kind}: triangle count changed`);
            triangles += count / 3;
            for (const attribute of ["position", "normal"]) {
                if (!geometry.getAttribute(attribute).array.every(Number.isFinite)) {
                    throw new Error(`${kind}.${name}: non-finite ${attribute}`);
                }
            }
            for (const attribute of ["position", "normal"]) {
                const before = original.getAttribute(attribute);
                const after = geometry.getAttribute(attribute);
                for (let i = 0; i < count; i++) {
                    const a = original.index?.getX(i) ?? i;
                    const b = geometry.index.getX(i);
                    for (let component = 0; component < 3; component++) {
                        if (Math.abs(before.array[a * 3 + component] - after.array[b * 3 + component]) > 1e-6) {
                            throw new Error(`${kind}: ${attribute} changed`);
                        }
                    }
                }
            }
            // Quantize to 16 bits: positions over the mesh bounds (sub-0.1 mm at model
            // scale), normals over [-1, 1]. Halves the payload and gzips much better.
            const position = geometry.getAttribute("position").array;
            const normal = geometry.getAttribute("normal").array;
            const min = [0, 1, 2].map((axis) => position.filter((_, i) => i % 3 === axis).reduce((a, b) => Math.min(a, b), Infinity));
            const max = [0, 1, 2].map((axis) => position.filter((_, i) => i % 3 === axis).reduce((a, b) => Math.max(a, b), -Infinity));
            const extent = max.map((value, axis) => Math.max(value - min[axis], 1e-6));
            const quantizedPosition = Uint16Array.from(position, (value, i) => Math.round((value - min[i % 3]) / extent[i % 3] * 65535));
            const quantizedNormal = Int16Array.from(normal, (value) => Math.round(Math.max(-1, Math.min(1, value)) * 32767));
            meshes[name] = {};
            for (const [attribute, array] of Object.entries({
                position: quantizedPosition,
                normal: quantizedNormal,
                index: geometry.index.array,
            })) {
                const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
                meshes[name][attribute] = { offset, count: array.length, type: array.constructor.name };
                if (attribute === "position") Object.assign(meshes[name][attribute], { min, extent });
                chunks.push(bytes);
                offset += bytes.length;
                const padding = (4 - offset % 4) % 4;
                chunks.push(Buffer.alloc(padding));
                offset += padding;
            }
            geometry.dispose();
            original.dispose();
        }
        const header = Buffer.from(JSON.stringify(meshes));
        const headerSize = Math.ceil((header.length + 4) / 4) * 4;
        const prefix = Buffer.alloc(headerSize);
        prefix.writeUInt32LE(header.length);
        header.copy(prefix, 4);
        const data = gzipSync(Buffer.concat([prefix, ...chunks]), { level: 9 });
        const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
        const filename = `${kind}-${hash}.bin.gz`;
        writeFileSync(join(root, "public/3d", filename), data);
        assets[kind] = `/3d/${filename}`;
        console.log(`${kind}: build ${buildMs.toFixed(1)} ms; vertices ${originalVertices} → ${indexedVertices}; triangles ${triangles}; download ${(data.length / 1024).toFixed(1)} KiB`);
    }
    writeFileSync(join(source, "shared/geometryAssets.ts"),
        `// Generated by npm run build:3d. Do not edit by hand.\nexport const geometryAssets = ${JSON.stringify(assets, null, 4)} as const;\n`);
} finally {
    rmSync(temporary, { recursive: true, force: true });
}
