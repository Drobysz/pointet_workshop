"use client";

import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, Group, MathUtils, Vector3 } from "three";
import { StudioEnvironment } from "./StudioEnvironment";
import { useObjectDragRotation } from "./useObjectDragRotation";
import { useSectionScrollRotation } from "./useSectionScrollRotation";
import { clamp, inertiaStep, MAX_TILT } from "./rotationMath";
import { modelLoaders } from "./modelLoaders";
import type { ObjectSceneProps } from "./types";
import s from "./ObjectSection.module.scss";

const models = {
    curated: lazy(modelLoaders.curated),
    bag: lazy(modelLoaders.bag),
    dress: lazy(modelLoaders.dress),
};
// Reflections borrow a little of each section's backdrop so objects sit in their scene.
const studioTint = { curated: "#f2a7b8", bag: "#8fb2f4", dress: "#c4aef0" } as const;
const CAMERA_DISTANCE = 9;
const FIELD_OF_VIEW = 32;
const verticalTangent = Math.tan(MathUtils.degToRad(FIELD_OF_VIEW / 2));

function RotatingObject({
    kind,
    sectionRef,
    active,
    reducedMotion,
    idleMotion,
}: Omit<ObjectSceneProps, "fallbackText">) {
    const Model = models[kind];
    const rotationGroup = useRef<Group>(null);
    const modelGroup = useRef<Group>(null);
    const fit = useRef({ corners: [] as Vector3[], point: new Vector3(), ready: false });
    const idleTime = useRef(0);
    const invalidate = useThree((state) => state.invalidate);
    const size = useThree((state) => state.size);
    const motionRef = useObjectDragRotation(sectionRef, invalidate);
    const scrollRotation = useSectionScrollRotation(sectionRef, active, reducedMotion, invalidate);
    const portrait = size.width < size.height * 0.85;

    useLayoutEffect(() => {
        const model = modelGroup.current;
        if (!model) return;
        rotationGroup.current?.scale.setScalar(1);
        rotationGroup.current?.rotation.set(0, 0, 0);
        model.position.set(0, 0, 0);
        model.updateWorldMatrix(true, true);
        const bounds = new Box3().setFromObject(model);
        const center = bounds.getCenter(new Vector3());
        model.position.copy(center).negate();
        bounds.translate(center.negate());
        const corners: Vector3[] = [];
        for (const x of [bounds.min.x, bounds.max.x]) {
            for (const y of [bounds.min.y, bounds.max.y]) {
                for (const z of [bounds.min.z, bounds.max.z]) corners.push(new Vector3(x, y, z));
            }
        }
        fit.current.corners = corners;
        fit.current.ready = false;
        invalidate();
    }, [invalidate, portrait]);

    useEffect(() => { invalidate(); }, [active, reducedMotion, idleMotion, size, invalidate]);

    useFrame((_, frameDelta) => {
        const group = rotationGroup.current;
        if (!group || !fit.current.corners.length) return;
        const delta = Math.min(frameDelta, 0.05);
        const state = motionRef.current;
        if (!state.dragging) {
            const x = inertiaStep(reducedMotion ? 0 : state.vx, delta);
            const y = inertiaStep(reducedMotion ? 0 : state.vy, delta);
            state.x = clamp(state.x + x.distance, -MAX_TILT, MAX_TILT);
            state.y += y.distance;
            state.vx = Math.abs(state.x) >= MAX_TILT ? 0 : x.velocity;
            state.vy = y.velocity;
        }
        const idle = active && idleMotion && !reducedMotion && !state.interacted;
        if (idle) idleTime.current += delta;
        const targetX = state.x + (reducedMotion ? 0 : scrollRotation.current.rotationX);
        const targetY = state.y + (reducedMotion ? 0 : scrollRotation.current.rotationY)
            + (idle ? Math.sin(idleTime.current * 0.18) * 0.025 : 0);
        group.rotation.x = MathUtils.damp(group.rotation.x, targetX, 11, delta);
        group.rotation.y = MathUtils.damp(group.rotation.y, targetY, 11, delta);

        // Fit the eight rotated bounds corners, including perspective depth. Tall
        // objects can use the screen height without cropping when turned sideways.
        const horizontalTangent = verticalTangent * size.width / Math.max(size.height, 1);
        const horizontalBudget = CAMERA_DISTANCE * horizontalTangent * 0.76;
        const verticalBudget = CAMERA_DISTANCE * verticalTangent * 0.76;
        let fittedScale = Infinity;
        for (const corner of fit.current.corners) {
            const point = fit.current.point.copy(corner).applyEuler(group.rotation);
            const horizontal = Math.abs(point.x) + point.z * horizontalTangent * 0.76;
            const vertical = Math.abs(point.y) + point.z * verticalTangent * 0.76;
            if (horizontal > 0) fittedScale = Math.min(fittedScale, horizontalBudget / horizontal);
            if (vertical > 0) fittedScale = Math.min(fittedScale, verticalBudget / vertical);
        }
        const scale = !fit.current.ready || fittedScale < group.scale.x
            ? fittedScale
            : MathUtils.damp(group.scale.x, fittedScale, 9, delta);
        group.scale.setScalar(scale);
        fit.current.ready = true;

        const settling = Math.abs(targetX - group.rotation.x) + Math.abs(targetY - group.rotation.y)
            + Math.abs(state.vx) + Math.abs(state.vy) + Math.abs(fittedScale - scale) > 0.0001;
        if (active && (idle || settling)) invalidate();
    });

    return (
        <group ref={rotationGroup}>
            <group ref={modelGroup}>
                <Model active={active} reducedMotion={reducedMotion} portrait={portrait} />
            </group>
        </group>
    );
}

export default function InteractiveObjectScene(props: ObjectSceneProps) {
    return (
        <Canvas
            className={s.canvas}
            // Measure layout pixels, not the gallery's animated CSS scale. Using
            // transformed bounds scales the canvas twice and offsets its center.
            // Drag events are handled on the section, so scroll remeasurement is unnecessary.
            resize={{ offsetSize: true, scroll: false, debounce: 0 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            camera={{ position: [0, 0, CAMERA_DISTANCE], fov: FIELD_OF_VIEW, near: 0.1, far: 40 }}
            gl={{ alpha: true, premultipliedAlpha: false, antialias: true, powerPreference: "default" }}
            onCreated={({ gl }) => {
                gl.domElement.setAttribute("aria-hidden", "true");
                gl.setClearColor(0x000000, 0);
                gl.toneMappingExposure = 1.05;
            }}
            fallback={<p className={s.fallback} role="status">{props.fallbackText}</p>}
        >
            <Suspense fallback={null}>
                <StudioEnvironment tint={studioTint[props.kind]} />
                <RotatingObject {...props} />
            </Suspense>
        </Canvas>
    );
}
