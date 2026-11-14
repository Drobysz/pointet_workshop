"""Podium fashion motion reference for Seedance.

Builds a self-contained scene "PodiumFashionRef": room, podium, static camera,
a rigged placeholder mannequin, a walk-on entrance, and N clockwise spins with a
hard pose cut at the 180-degree point of every spin.

Run inside Blender (Text editor > Run Script, or exec from the MCP bridge).
Re-running rebuilds the scene from scratch; nothing outside it is touched.
"""
import bpy
import bmesh
from math import sin, cos, pi, sqrt, exp, radians as rad
from mathutils import Vector, Matrix

PFX = "PFR_"
SCENE_NAME = "PodiumFashionRef"

# ---------------------------------------------------------------- timing (30 fps)
FPS = 30
ENTR_END = 90        # 0:00-0:03 walk on + settle into the pointing pose
ROT_START = 105      # short hold so the first pose reads, then spins start
REV = 30             # frames per 360 degrees  (1 s per revolution)
TAIL = 15            # hold on the last pose

# ---------------------------------------------------------------- room / camera
POD_R, POD_H = 0.26, 0.13
WALL_Y, CEIL_Z = 3.76, 3.07
ROOM_X = 3.2
CAM_POS = (0.0, -5.0, 1.45)
CAM_LENS = 59.7              # mm on a 36 mm tall sensor (portrait)
HORIZON_FROM_BOTTOM = 0.5804  # horizon row measured in reference image 1
RES = (1080, 1920)

UP = Vector((0, 0, 1))
FWD = Vector((0, -1, 0))     # character faces -Y (toward the camera); her left is +X

# ---------------------------------------------------------------- skeleton sizes
L_UA, L_FA = 0.27, 0.24
L_TH, L_SH = 0.42, 0.40
ANKLE_H, BALL, HEEL = 0.08, 0.165, 0.05   # BALL = toe pivot used for heel lifts
SH_X, SH_Z = 0.17, 1.39
HIP_X, HIP_Z = 0.09, 0.90


def lerp(a, b, t):
    return a + (b - a) * t


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def smooth(x):
    x = clamp(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


def frame(y, zhint):
    """3x3 rotation whose Y axis is `y` and whose Z axis leans toward `zhint`."""
    y = Vector(y).normalized()
    x = y.cross(Vector(zhint))
    if x.length < 1e-5:
        x = y.cross(Vector((1, 0, 0)))
        if x.length < 1e-5:
            x = y.cross(Vector((0, 1, 0)))
    x.normalize()
    z = x.cross(y)
    return Matrix((x, y, z)).transposed()


def body_rot(yaw, roll, pitch):
    """Degrees. +yaw turns to her left, +roll leans to her left, +pitch leans forward."""
    return (Matrix.Rotation(rad(yaw), 3, 'Z') @ Matrix.Rotation(rad(roll), 3, 'Y')
            @ Matrix.Rotation(rad(pitch), 3, 'X'))


def mslerp(a, b, t):
    return a.to_quaternion().slerp(b.to_quaternion(), t).to_matrix()


def ik2(a, t, l1, l2, pole):
    v = t - a
    d = clamp(v.length, abs(l1 - l2) + 1e-4, (l1 + l2) * 0.999)
    dr = v.normalized()
    ca = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    sa = sqrt(max(0.0, 1 - ca * ca))
    pole = Vector(pole)
    pp = pole - dr * pole.dot(dr)
    if pp.length < 1e-5:
        pp = dr.orthogonal()
    pp.normalize()
    e = a + dr * (l1 * ca) + pp * (l1 * sa)
    w = a + dr * d
    return (e - a).normalized(), (w - e).normalized()


# ================================================================ scene plumbing
def reset_scene():
    sc = bpy.data.scenes.get(SCENE_NAME)
    if sc is None:
        sc = bpy.data.scenes.new(SCENE_NAME)
    for o in list(sc.collection.all_objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(sc.collection.children):
        bpy.data.collections.remove(c)
    for m in list(sc.timeline_markers):
        sc.timeline_markers.remove(m)
    for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials, bpy.data.actions,
                 bpy.data.cameras, bpy.data.lights, bpy.data.worlds, bpy.data.collections):
        for d in list(coll):
            if d.name.startswith(PFX) and d.users == 0:
                coll.remove(d)
    win = bpy.context.window or bpy.context.window_manager.windows[0]
    win.scene = sc
    return sc, win


def new_coll(sc, name):
    c = bpy.data.collections.new(PFX + name)
    sc.collection.children.link(c)
    return c


def principled(m):
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            return n
    return None


def make_mat(name, color, rough=0.5, emit=None):
    m = bpy.data.materials.new(PFX + name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = principled(m)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit[0], 1)
        b.inputs["Emission Strength"].default_value = emit[1]
    m.diffuse_color = (*color, 1)
    return m


def make_wood():
    m = make_mat("Floor_Wood", (0.56, 0.42, 0.30), 0.42)
    nt = m.node_tree
    b = principled(m)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.offset = 0.37
    br.inputs["Color1"].default_value = (0.62, 0.47, 0.34, 1)
    br.inputs["Color2"].default_value = (0.53, 0.39, 0.28, 1)
    br.inputs["Mortar"].default_value = (0.30, 0.21, 0.14, 1)
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Mortar Size"].default_value = 0.004
    br.inputs["Brick Width"].default_value = 1.35
    br.inputs["Row Height"].default_value = 0.19
    nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
    nt.links.new(br.outputs["Color"], b.inputs["Base Color"])
    return m


def add_obj(coll, name, me, mat=None):
    ob = bpy.data.objects.new(PFX + name, me)
    coll.objects.link(ob)
    if mat:
        me.materials.append(mat)
    return ob


def boxes(coll, name, specs, mat, bevel=0.0):
    """One mesh made of axis-aligned boxes; specs = [((x0,y0,z0),(x1,y1,z1)), ...]."""
    me = bpy.data.meshes.new(PFX + name)
    bm = bmesh.new()
    for mn, mx in specs:
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r["verts"]:
            v.co = Vector([(mn[i] + mx[i]) / 2 + v.co[i] * (mx[i] - mn[i]) for i in range(3)])
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=3,
                        affect='EDGES', profile=0.5)
    bm.to_mesh(me)
    bm.free()
    return add_obj(coll, name, me, mat)


def quad(coll, name, pts, mat):
    me = bpy.data.meshes.new(PFX + name)
    me.from_pydata([Vector(p) for p in pts], [], [tuple(range(len(pts)))])
    return add_obj(coll, name, me, mat)


def cylinder(coll, name, r1, r2, depth, loc, mat, seg=64, bevel=0.0):
    me = bpy.data.meshes.new(PFX + name)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r1, radius2=r2, depth=depth)
    if bevel:
        top = [e for e in bm.edges if all(v.co.z > 0 for v in e.verts)]
        bmesh.ops.bevel(bm, geom=top, offset=bevel, segments=3, affect='EDGES', profile=0.5)
    for f in bm.faces:
        f.smooth = abs(f.normal.z) < 0.9
    bm.to_mesh(me)
    bm.free()
    ob = add_obj(coll, name, me, mat)
    ob.location = (loc[0], loc[1], loc[2] + depth / 2)
    return ob


# ================================================================ environment
def build_environment(sc):
    env = new_coll(sc, "Environment")
    wall_m = make_mat("Wall", (0.80, 0.78, 0.76), 0.6)
    trim_m = make_mat("Trim", (0.86, 0.85, 0.83), 0.45)
    ceil_m = make_mat("Ceiling", (0.84, 0.83, 0.82), 0.7)
    pod_m = make_mat("Podium", (0.90, 0.90, 0.89), 0.35)
    sofa_m = make_mat("Sofa", (0.50, 0.42, 0.33), 0.9)
    pillow_m = make_mat("Pillow", (0.78, 0.74, 0.68), 0.9)
    dark_m = make_mat("Dark", (0.08, 0.06, 0.05), 0.5)
    pot_m = make_mat("Pot", (0.82, 0.79, 0.74), 0.6)
    leaf_m = make_mat("Leaf", (0.07, 0.24, 0.07), 0.4)
    lamp_m = make_mat("CeilingLamp", (1, 1, 1), 0.3, emit=((1.0, 0.93, 0.82), 6.0))
    wood_m = make_wood()

    X, Y0 = ROOM_X, -7.0
    quad(env, "Floor", [(-X, Y0, 0), (X, Y0, 0), (X, WALL_Y, 0), (-X, WALL_Y, 0)], wood_m)
    quad(env, "Ceiling", [(-X, Y0, CEIL_Z), (-X, WALL_Y, CEIL_Z), (X, WALL_Y, CEIL_Z),
                          (X, Y0, CEIL_Z)], ceil_m)
    quad(env, "Wall_Back", [(-X, WALL_Y, 0), (X, WALL_Y, 0), (X, WALL_Y, CEIL_Z),
                            (-X, WALL_Y, CEIL_Z)], wall_m)
    quad(env, "Wall_Left", [(-X, Y0, 0), (-X, WALL_Y, 0), (-X, WALL_Y, CEIL_Z),
                            (-X, Y0, CEIL_Z)], wall_m)

    # right wall with a window opening (off camera) so the sun paints the back wall
    wy0, wy1, wz0, wz1 = 2.04, 3.01, 1.90, 3.00
    for i, (a, b, c, d) in enumerate([
            (Y0, WALL_Y, 0, wz0), (Y0, WALL_Y, wz1, CEIL_Z), (Y0, wy0, wz0, wz1),
            (wy1, WALL_Y, wz0, wz1), (2.50, 2.55, wz0, wz1),
            (wy0, wy1, 2.25, 2.30), (wy0, wy1, 2.62, 2.67)]):
        quad(env, "Wall_Right_%d" % i, [(X, a, c), (X, b, c), (X, b, d), (X, a, d)], wall_m)

    # back wall mouldings
    t, w = 0.022, 0.04
    y0, y1 = WALL_Y - t, WALL_Y
    strips = []

    def rect(x0, x1, z0, z1):
        strips.extend([((x0, y0, z0), (x1, y1, z0 + w)), ((x0, y0, z1 - w), (x1, y1, z1)),
                       ((x0, y0, z0), (x0 + w, y1, z1)), ((x1 - w, y0, z0), (x1, y1, z1))])

    for x0, x1 in ((-1.22, 1.19), (-3.05, -1.38), (1.35, 3.05)):
        rect(x0, x1, 1.00, 2.845)
        rect(x0, x1, 0.22, 0.83)
    strips.append(((-X, WALL_Y - 0.035, 0.885), (X, WALL_Y, 0.945)))       # chair rail
    strips.append(((-X, WALL_Y - 0.025, 0.0), (X, WALL_Y, 0.125)))         # baseboard
    strips.append(((-X, WALL_Y - 0.07, 2.97), (X, WALL_Y, CEIL_Z)))        # crown
    strips.append(((-X, WALL_Y - 0.035, 2.91), (X, WALL_Y, 2.97)))
    boxes(env, "Wall_Mouldings", strips, trim_m)

    for i, lx in enumerate((-0.87, 0.38)):
        cylinder(env, "CeilingSpot_Ring_%d" % i, 0.085, 0.085, 0.012,
                 (lx, 2.34, CEIL_Z - 0.012), trim_m, seg=32)
        cylinder(env, "CeilingSpot_%d" % i, 0.06, 0.06, 0.006,
                 (lx, 2.34, CEIL_Z - 0.018), lamp_m, seg=32)

    cylinder(env, "Podium", POD_R, POD_R, POD_H, (0, 0, 0), pod_m, seg=72, bevel=0.012)

    # sofa, left edge of frame
    boxes(env, "Sofa", [((-2.60, 1.80, 0.08), (-0.82, 2.75, 0.42)),
                        ((-1.10, 1.78, 0.08), (-0.82, 2.75, 0.64)),
                        ((-2.60, 2.50, 0.08), (-0.82, 2.80, 0.88)),
                        ((-2.60, 1.80, 0.42), (-1.11, 2.50, 0.54))], sofa_m, bevel=0.03)
    boxes(env, "Sofa_Pillow", [((-1.60, 2.30, 0.55), (-1.14, 2.47, 0.93))], pillow_m, bevel=0.05)
    boxes(env, "Sofa_Feet", [((-1.02, 1.84, 0.0), (-0.92, 1.94, 0.08)),
                             ((-1.02, 2.62, 0.0), (-0.92, 2.72, 0.08))], dark_m)

    # plant, right edge of frame
    px, py = 1.42, 3.18
    cylinder(env, "Plant_Pot", 0.13, 0.175, 0.42, (px, py, 0), pot_m, seg=40)
    verts, faces = [], []
    leaves = [(200, 14, 1.45, 0.17, 28), (165, 24, 1.25, 0.15, 40), (235, 20, 1.30, 0.16, 36),
              (120, 30, 1.05, 0.13, 45), (270, 30, 1.10, 0.14, 40), (20, 22, 1.20, 0.15, 30),
              (320, 28, 1.00, 0.13, 42)]
    n = 14
    for az, tilt, length, width, bend in leaves:
        a = rad(az)
        side = Vector((-sin(a), cos(a), 0))
        base = len(verts)
        p = Vector((px, py, 0.40))
        for i in range(n + 1):
            u = i / n
            th = rad(tilt + bend * u * u)
            d = Vector((sin(th) * cos(a), sin(th) * sin(a), cos(th)))
            if i:
                p = p + d * (length / n)
            hw = 0.006 if u < 0.38 else 0.006 + width * sin(pi * (u - 0.38) / 0.62) ** 0.7
            verts.extend([p - side * hw, p + side * hw])
        for i in range(n):
            k = base + 2 * i
            faces.append((k, k + 1, k + 3, k + 2))
    me = bpy.data.meshes.new(PFX + "Plant_Leaves")
    me.from_pydata(verts, [], faces)
    add_obj(env, "Plant_Leaves", me, leaf_m)
    return env


def build_lights(sc):
    lc = new_coll(sc, "Lights")

    def light(name, kind, loc, target, energy, color, **kw):
        ld = bpy.data.lights.new(PFX + name, kind)
        ld.energy = energy
        ld.color = color
        for k, v in kw.items():
            setattr(ld, k, v)
        ob = bpy.data.objects.new(PFX + name, ld)
        lc.objects.link(ob)
        ob.location = loc
        d = Vector(target) - Vector(loc)
        ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        return ob

    sun_dir = Vector((-0.8, 0.5, -0.33))
    light("Sun_Window", 'SUN', (6, 0, 4), Vector((6, 0, 4)) + sun_dir, 6.0,
          (1.0, 0.88, 0.72), angle=rad(1.5))
    light("Key", 'AREA', (2.3, -3.2, 2.6), (0, 0, 1.1), 230, (1.0, 0.95, 0.88), size=2.0)
    light("Fill", 'AREA', (-2.4, -3.6, 1.9), (0, 0, 1.0), 70, (0.95, 0.97, 1.0), size=3.0)
    light("Top", 'AREA', (0, 0.6, 2.95), (0, 0.6, 0), 80, (1.0, 0.96, 0.9), size=3.0)
    light("WallWash", 'AREA', (-0.5, 1.2, 2.9), (0, WALL_Y, 1.6), 110, (1.0, 0.96, 0.9), size=3.5)

    w = bpy.data.worlds.new(PFX + "World")
    try:
        w.use_nodes = True
    except Exception:
        pass
    bg = next((n for n in w.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg:
        bg.inputs[0].default_value = (0.90, 0.88, 0.85, 1)
        bg.inputs[1].default_value = 0.30
    sc.world = w


def build_camera(sc):
    from bpy_extras.object_utils import world_to_camera_view
    cd = bpy.data.cameras.new(PFX + "Camera")
    cd.sensor_fit = 'VERTICAL'
    cd.sensor_height = 36.0
    cd.lens = CAM_LENS
    cd.clip_start, cd.clip_end = 0.1, 100
    ob = bpy.data.objects.new(PFX + "Camera_STATIC", cd)
    sc.collection.objects.link(ob)
    ob.location = CAM_POS
    ob.rotation_euler = (pi / 2, 0, 0)      # perfectly level: verticals stay vertical
    ob.lock_location = ob.lock_rotation = ob.lock_scale = (True, True, True)
    sc.camera = ob
    sc.render.resolution_x, sc.render.resolution_y = RES
    sc.render.resolution_percentage = 100
    sc.view_layers[0].update()

    def horizon():
        sc.view_layers[0].update()
        return world_to_camera_view(sc, ob, Vector((0, 1000, CAM_POS[2]))).y

    cd.shift_y = 0.0
    v0 = horizon()
    cd.shift_y = 0.1
    v1 = horizon()
    cd.shift_y = (HORIZON_FROM_BOTTOM - v0) / (v1 - v0) * 0.1
    return ob


# ================================================================ character rig
def bone_table():
    t = [("hips", None, (0, 0, 0.93), (0, 0, 1.08), FWD),
         ("spine", "hips", (0, 0, 1.08), (0, 0, 1.24), FWD),
         ("chest", "spine", (0, 0, 1.24), (0, 0, 1.44), FWD),
         ("neck", "chest", (0, 0, 1.44), (0, 0, 1.53), FWD),
         ("head", "neck", (0, 0, 1.53), (0, 0, 1.73), FWD)]
    for S, s in (("L", 1), ("R", -1)):
        x = SH_X * s
        out = (s, 0, 0)
        t += [("upper_arm." + S, "chest", (x, 0, SH_Z), (x, 0, SH_Z - L_UA), out),
              ("forearm." + S, "upper_arm." + S, (x, 0, 1.12), (x, 0, 0.88), out),
              ("hand." + S, "forearm." + S, (x, 0, 0.88), (x, 0, 0.795), out),
              ("index1." + S, "hand." + S, (x, -0.024, 0.795), (x, -0.024, 0.750), out),
              ("index2." + S, "index1." + S, (x, -0.024, 0.750), (x, -0.024, 0.710), out),
              ("mitt1." + S, "hand." + S, (x, 0.012, 0.795), (x, 0.012, 0.750), out),
              ("mitt2." + S, "mitt1." + S, (x, 0.012, 0.750), (x, 0.012, 0.710), out),
              ("thumb1." + S, "hand." + S, (x, -0.034, 0.865), (x, -0.034, 0.825), out),
              ("thumb2." + S, "thumb1." + S, (x, -0.034, 0.825), (x, -0.034, 0.792), out)]
        h = HIP_X * s
        t += [("thigh." + S, "hips", (h, 0, HIP_Z), (h, 0, HIP_Z - L_TH), FWD),
              ("shin." + S, "thigh." + S, (h, 0, 0.48), (h, 0, ANKLE_H), FWD),
              ("foot." + S, "shin." + S, (h, 0, ANKLE_H), (h, -0.15, ANKLE_H), UP)]
    return t


BONES = bone_table()
ORDER = [b[0] for b in BONES]
PARENT = {b[0]: b[1] for b in BONES}
HEAD = {b[0]: Vector(b[2]) for b in BONES}
REST = {}       # name -> 3x3 rest rotation (armature space), filled after the rig exists


class Builder:
    def __init__(self):
        self.verts, self.faces, self.fmat, self.vgrp = [], [], [], []

    def add(self, co, grp):
        self.verts.append(co)
        self.vgrp.append(grp)
        return len(self.verts) - 1

    def loft(self, M, stations, group, mat=0, seg=24):
        rings = []
        for s in stations:
            s = tuple(s) + (0, 0)
            y, rx, rz, ox, oz = s[:5]
            if rx == 0 and rz == 0:
                rings.append([self.add(M @ Vector((ox, y, oz)), group)])
            else:
                rings.append([self.add(M @ Vector((ox + rx * cos(2 * pi * i / seg), y,
                                                   oz + rz * sin(2 * pi * i / seg))), group)
                              for i in range(seg)])
        for a, b in zip(rings, rings[1:]):
            if len(a) == 1 and len(b) == 1:
                continue
            for i in range(seg):
                j = (i + 1) % seg
                if len(a) == 1:
                    f = (a[0], b[j], b[i])
                elif len(b) == 1:
                    f = (a[i], a[j], b[0])
                else:
                    f = (a[i], a[j], b[j], b[i])
                self.faces.append(f)
                self.fmat.append(mat)
        for ring in (rings[0], rings[-1]):
            if len(ring) > 1:
                self.faces.append(tuple(ring))
                self.fmat.append(mat)


def rounded(sts, start=True, end=True, k=1.0):
    sts = [(tuple(s) + (0, 0))[:5] for s in sts]
    out = []
    if start:
        y, rx, rz, ox, oz = sts[0]
        r = min(rx, rz) * k
        out.append((y - r, 0, 0, ox, oz))
        for a in (72, 48, 24):
            out.append((y - r * sin(rad(a)), rx * cos(rad(a)), rz * cos(rad(a)), ox, oz))
    out += sts
    if end:
        y, rx, rz, ox, oz = sts[-1]
        r = min(rx, rz) * k
        for a in (24, 48, 72):
            out.append((y + r * sin(rad(a)), rx * cos(rad(a)), rz * cos(rad(a)), ox, oz))
        out.append((y + r, 0, 0, ox, oz))
    return out


def ellipsoid(cx, cy, cz, rx, ry, rz):
    return rounded([(cy, rx, rz, cx, cz)], k=ry / min(rx, rz))


def build_character(sc, win):
    cc = new_coll(sc, "Character")
    arm = bpy.data.armatures.new(PFX + "Rig")
    ob = bpy.data.objects.new(PFX + "Model_Rig", arm)
    cc.objects.link(ob)
    vl = sc.view_layers[0]
    vl.update()
    vl.objects.active = ob
    ob.select_set(True)
    with bpy.context.temp_override(window=win, scene=sc, view_layer=vl, active_object=ob,
                                   object=ob, selected_objects=[ob]):
        bpy.ops.object.mode_set(mode='EDIT')
        for name, parent, head, tail, zh in BONES:
            eb = arm.edit_bones.new(name)
            eb.head, eb.tail = head, tail
            eb.align_roll(Vector(zh))
            if parent:
                eb.parent = arm.edit_bones[parent]
                eb.use_connect = False
        bpy.ops.object.mode_set(mode='OBJECT')
    arm.display_type = 'STICK'
    for name, parent, head, tail, zh in BONES:
        b = arm.bones[name]
        REST[name] = b.matrix_local.to_3x3()
        want = frame(Vector(tail) - Vector(head), zh)
        err = max(abs(REST[name][i][j] - want[i][j]) for i in range(3) for j in range(3))
        if err > 1e-3:
            raise RuntimeError("rest frame mismatch on %s (%.4f)" % (name, err))
    for pb in ob.pose.bones:
        pb.rotation_mode = 'QUATERNION'

    B = Builder()
    BODY, HAIR, EYE = 0, 1, 2

    def M(n):
        return arm.bones[n].matrix_local

    B.loft(M("hips"), [(-0.115, 0, 0, 0, -0.005), (-0.10, .07, .055, 0, -.005),
                       (-0.06, .15, .095, 0, -.012), (-0.01, .172, .105, 0, -.015),
                       (0.05, .16, .098, 0, -.01), (0.10, .14, .088, 0, -.004),
                       (0.155, .125, .08)], "hips")
    B.loft(M("spine"), [(-0.01, .125, .08), (0.05, .118, .076), (0.10, .12, .078),
                        (0.165, .133, .086)], "spine")
    B.loft(M("chest"), [(-0.01, .133, .086), (0.06, .148, .095), (0.12, .155, .097),
                        (0.165, .145, .088), (0.195, .10, .07), (0.215, .055, .05)], "chest")
    for s in (1, -1):
        B.loft(M("chest"), ellipsoid(s * 0.165, 0.15, 0.0, .052, .052, .052), "chest")
        B.loft(M("chest"), ellipsoid(s * 0.068, 0.075, 0.068, .058, .06, .05), "chest")
    B.loft(M("neck"), [(-0.03, .05, .048), (0.10, .043, .043)], "neck")
    B.loft(M("head"), ellipsoid(0, 0.105, 0.005, .074, .112, .092), "head")
    B.loft(M("head"), ellipsoid(0, 0.085, 0.094, .012, .02, .014), "head", seg=12)
    B.loft(M("head"), ellipsoid(0, 0.128, -0.022, .081, .106, .094), "head", HAIR)
    B.loft(M("head"), ellipsoid(0, 0.165, -0.118, .046, .046, .046), "head", HAIR)
    for s in (1, -1):
        B.loft(M("head"), ellipsoid(s * 0.03, 0.118, 0.083, .009, .007, .008), "head", EYE, seg=12)

    for S, ts in (("L", 1), ("R", -1)):
        B.loft(M("upper_arm." + S), rounded([(0, .046, .046), (0.12, .042, .042),
                                             (L_UA, .036, .036)]), "upper_arm." + S)
        B.loft(M("forearm." + S), rounded([(0, .036, .036), (0.07, .038, .036),
                                           (L_FA, .026, .024)]), "forearm." + S)
        B.loft(M("hand." + S), rounded([(0.0, .024, .014), (0.035, .037, .013),
                                        (0.085, .038, .011)], k=0.6), "hand." + S, seg=16)
        for nm, sts in (("index1", [(0, .0088, .0088), (0.045, .008, .008)]),
                        ("index2", [(0, .008, .008), (0.04, .007, .007)]),
                        ("mitt1", [(0, .024, .0088), (0.045, .023, .008)]),
                        ("mitt2", [(0, .023, .008), (0.04, .020, .007)]),
                        ("thumb1", [(0, .0105, .0105), (0.04, .0095, .0095)]),
                        ("thumb2", [(0, .0095, .0095), (0.033, .008, .008)])):
            B.loft(M(nm + "." + S), rounded(sts), nm + "." + S, seg=12)
        B.loft(M("thigh." + S), rounded([(0, .08, .085), (0.15, .075, .078),
                                         (L_TH, .052, .054)]), "thigh." + S)
        B.loft(M("shin." + S), rounded([(0, .052, .054), (0.11, .054, .056, 0, -.008),
                                        (0.26, .04, .042, 0, -.004), (L_SH, .033, .035)]),
               "shin." + S)
        B.loft(M("foot." + S), rounded([(-0.045, .028, .034, 0, -.046), (0.0, .034, .04, 0, -.04),
                                        (0.07, .04, .027, 0, -.053), (0.14, .04, .018, 0, -.062),
                                        (0.17, .032, .014, 0, -.066)], k=0.5), "foot." + S, seg=16)

    me = bpy.data.meshes.new(PFX + "Model")
    me.from_pydata(B.verts, [], B.faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set("material_index", B.fmat)
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    me.materials.append(make_mat("Model_Body", (0.40, 0.38, 0.37), 0.55))
    me.materials.append(make_mat("Model_Hair", (0.10, 0.07, 0.05), 0.5))
    me.materials.append(make_mat("Model_Eyes", (0.03, 0.03, 0.03), 0.3))
    me.update()
    mob = bpy.data.objects.new(PFX + "Model", me)
    cc.objects.link(mob)
    groups = {}
    for i, g in enumerate(B.vgrp):
        groups.setdefault(g, []).append(i)
    for g, idx in groups.items():
        mob.vertex_groups.new(name=g).add(idx, 1.0, 'REPLACE')
    mob.parent = ob
    mod = mob.modifiers.new("Armature", 'ARMATURE')
    mod.object = ob
    return ob, mob


# ================================================================ pose solving
def ankle_of(x, y, zg, yaw, pitch):
    f = Vector((sin(rad(yaw)), -cos(rad(yaw)), 0))
    a = rad(pitch)
    base = Vector((x, y, zg))
    if pitch >= 0:      # heel lifts, pivot on the ball of the foot
        return (base + f * BALL + f * (-BALL * cos(a) + ANKLE_H * sin(a))
                + UP * (BALL * sin(a) + ANKLE_H * cos(a)))
    b = -a              # toes lift, pivot on the heel
    return (base - f * HEEL + f * (HEEL * cos(b) - ANKLE_H * sin(b))
            + UP * (HEEL * sin(b) + ANKLE_H * cos(b)))


def torso(c, z):
    Rh, Rc, Rhd = body_rot(*c["hips"]), body_rot(*c["chest"]), body_rot(*c["head"])
    Rs, Rn = mslerp(Rh, Rc, 0.5), mslerp(Rc, Rhd, 0.5)
    pel = Vector((c["pelvis"][0], c["pelvis"][1], z))
    p_spine = pel + Rh @ (HEAD["spine"] - HEAD["hips"])
    p_chest = p_spine + Rs @ (HEAD["chest"] - HEAD["spine"])
    pts = {"pel": pel}
    for S in "LR":
        pts["sh" + S] = p_chest + Rc @ (HEAD["upper_arm." + S] - HEAD["chest"])
        pts["hj" + S] = pel + Rh @ (HEAD["thigh." + S] - HEAD["hips"])
    return (Rh, Rs, Rc, Rn, Rhd), pts


def auto_z(c):
    """Highest pelvis height at which both legs still reach their ankle targets."""
    Rh = body_rot(*c["hips"])
    lmax = (L_TH + L_SH) * 0.998
    best = 1e9
    for S in "LR":
        o = Rh @ (HEAD["thigh." + S] - HEAD["hips"])
        a = c["foot" + S]["ankle"]
        dx, dy = c["pelvis"][0] + o.x - a.x, c["pelvis"][1] + o.y - a.y
        dz = sqrt(max(0.0, lmax * lmax - dx * dx - dy * dy))
        best = min(best, a.z + dz - o.z + c["foot" + S].get("relax", 0.0))
    return best


def solve(c):
    (Rh, Rs, Rc, Rn, Rhd), pts = torso(c, c["z"])
    out = {"hips": Rh @ REST["hips"], "spine": Rs @ REST["spine"], "chest": Rc @ REST["chest"],
           "neck": Rn @ REST["neck"], "head": Rhd @ REST["head"]}
    RX = lambda a: Matrix.Rotation(a, 3, 'X')
    RZ = lambda a: Matrix.Rotation(a, 3, 'Z')
    for S, ts in (("L", 1), ("R", -1)):
        ft = c["foot" + S]
        ky = rad(ft["knee"])
        kd = Vector((sin(ky), -cos(ky), 0))
        d1, d2 = ik2(pts["hj" + S], ft["ankle"], L_TH, L_SH, kd)
        out["thigh." + S], out["shin." + S] = frame(d1, kd), frame(d2, kd)
        f = Vector((sin(rad(ft["yaw"])), -cos(rad(ft["yaw"])), 0))
        a = rad(ft["pitch"])
        out["foot." + S] = frame(f * cos(a) - UP * sin(a), UP * cos(a) + f * sin(a))

        ar = c["arm" + S]
        sh = pts["sh" + S]
        d1, d2 = ik2(sh, sh + Vector(ar["off"]), L_UA, L_FA, ar["pole"])
        out["upper_arm." + S], out["forearm." + S] = frame(d1, ar["pole"]), frame(d2, ar["pole"])
        Hm = frame(ar["hdir"], ar["hz"])
        out["hand." + S] = Hm
        i1, i2, m1, m2, ta, tf = [rad(v) for v in ar["f"]]
        out["index1." + S], out["index2." + S] = Hm @ RX(-i1), Hm @ RX(-(i1 + i2))
        out["mitt1." + S], out["mitt2." + S] = Hm @ RX(-m1), Hm @ RX(-(m1 + m2))
        T1 = Hm @ RZ(-ts * ta) @ RX(-tf * 0.5)
        out["thumb1." + S], out["thumb2." + S] = T1, T1 @ RX(-tf)
    return out, pts["pel"]


_prevq = {}


def apply_pose(ob, sol, pel):
    for name in ORDER:
        pb = ob.pose.bones[name]
        R, Pw = REST[name], sol[name]
        par = PARENT[name]
        if par:
            basis = (sol[par] @ REST[par].inverted() @ R).inverted() @ Pw
        else:
            basis = R.inverted() @ Pw
            pb.location = R.inverted() @ (pel - HEAD[name])
        q = basis.to_quaternion()
        if name in _prevq and _prevq[name].dot(q) < 0:
            q.negate()
        _prevq[name] = q.copy()
        pb.rotation_quaternion = q


def key_pose(ob, c, f):
    sol, pel = solve(c)
    apply_pose(ob, sol, pel)
    for name in ORDER:
        ob.pose.bones[name].keyframe_insert("rotation_quaternion", frame=f)
    ob.pose.bones["hips"].keyframe_insert("location", frame=f)


# ================================================================ poses
# finger presets: index (2 joints), other fingers (2 joints), thumb (spread, curl), degrees
RELAX = (15, 20, 25, 30, 25, 10)
OPEN = (5, 6, 7, 9, 38, 0)
POINT = (0, 0, 88, 95, 12, 55)
GRIP = (50, 65, 58, 72, 28, 22)
FLARE = (-4, 4, 14, 14, 48, 0)
PINCH = (45, 50, 35, 40, 10, 35)
ONHIP = (12, 14, 14, 18, 45, 0)


def arm(anchor, off, pole, hdir, hz, f):
    return dict(anchor=anchor, off=off, pole=pole, hdir=hdir, hz=hz, f=f)


def hang(s, f=RELAX, out=0.07):
    return arm("shoulder", (s * out, 0.01, -0.49 + 0.3 * (out - 0.07)), (s * 0.25, 1, 0),
               (s * 0.05, -0.1, -1), (s, 0, 0), f)


def on_hip(s, fwd=0.0):
    return arm("hip", (s * 0.075, 0.005 - fwd, 0.165), (s, 0.5, 0.1),
               (-s * 0.7, -0.6, -0.4), (s * 0.6, -0.75, 0.15), ONHIP)


def in_pocket(s):
    return arm("hip", (s * 0.097, -0.03, 0.05), (s * 0.8, 0.7, 0),
               (-s * 0.03, -0.2, -0.98), (s, -0.15, 0), RELAX)


# All left/right below are the CHARACTER's own left (+X) and right (-X).
# foot = (x, y, toe-out yaw, heel-lift pitch[, knee yaw])
POSES = [
    # 0  brief: weight on LEFT leg, right knee soft, LEFT hand on hip, RIGHT arm points at viewer
    dict(pelvis=(0.03, -0.02), hips=(-4, -6, 0), chest=(3, 4, 0), head=(0, -2, 0),
         footL=(0.05, 0.04, 8, 0), footR=(-0.115, 0.0, -18, 22, -10),
         armL=on_hip(1),
         armR=arm("shoulder", (0.05, -0.495, -0.02), (-0.4, 0, -1), (0.03, -1, -0.03),
                  (0, 0, 1), POINT)),
    # 1  ref image 2: right hand raised out to the side (holding papers), left arm down, legs together
    dict(pelvis=(0.0, -0.04), hips=(0, 0, 0), chest=(0, 1, 1), head=(0, 2, 14),
         footL=(0.05, 0.0, 4, 0), footR=(-0.05, 0.0, -4, 0),
         armL=hang(1),
         armR=arm("shoulder", (-0.20, -0.21, -0.05), (-1, 0, -0.5), (-0.3, -0.35, 0.88),
                  (-0.2, 0.9, 0.3), OPEN)),
    # 2  ref image 3: arms down and away from the body, left leg stepped out with toe turned out,
    #    head turned to her left
    dict(pelvis=(-0.02, 0.0), hips=(5, 3, 0), chest=(0, -2, 0), head=(24, 0, -2),
         footL=(0.10, -0.03, 30, 0), footR=(-0.085, 0.07, -6, 0),
         armL=hang(1, RELAX, 0.14), armR=hang(-1, GRIP, 0.14)),
    # 3  ref image 4: right forearm raised, palm up with flared fingers; left hand in pocket
    dict(pelvis=(0.0, -0.04), hips=(0, -2, 0), chest=(0, 2, 0), head=(0, -3, 11),
         footL=(0.07, 0.0, 6, 0), footR=(-0.07, 0.0, -6, 0),
         armL=in_pocket(1),
         armR=arm("shoulder", (-0.20, -0.03, 0.065), (-1, 0, -0.6), (-0.82, -0.1, 0.5),
                  (-0.5, 0, -0.85), FLARE)),
    # 4  ref image 5: right hand on hip with elbow wide, left forearm forward holding a clutch,
    #    left foot crossed in front
    dict(pelvis=(-0.03, -0.03), hips=(0, 5, 0), chest=(0, -3, 0), head=(0, -6, 4),
         footL=(0.04, -0.075, 6, 12, 0), footR=(-0.045, 0.05, -8, 0),
         armL=arm("shoulder", (0.06, -0.17, -0.36), (0.4, 1, -0.2), (-0.1, -0.75, -0.65),
                  (1, 0, 0), GRIP),
         armR=on_hip(-1)),
    # 5  ref image 6: right hand at the waist, left arm down with a clutch, right knee turned in,
    #    head tilted down toward her right shoulder
    dict(pelvis=(0.03, -0.02), hips=(0, -5, 0), chest=(-4, 5, 3), head=(-12, -14, 14),
         footL=(0.05, 0.02, 5, 0), footR=(-0.12, 0.0, 8, 26, 14),
         armL=hang(1, GRIP, 0.13), armR=on_hip(-1, 0.025)),
    # 6  ref image 7: right hand up beside the head holding a strand of hair, left hand in pocket
    dict(pelvis=(0.0, -0.04), hips=(0, 0, -3), chest=(0, 0, -2), head=(0, 3, 0),
         footL=(0.05, 0.0, 5, 0), footR=(-0.05, 0.0, -5, 0),
         armL=in_pocket(1),
         armR=arm("shoulder", (-0.14, -0.08, 0.07), (-1, 0.1, -0.7), (0.45, 0.05, 0.9),
                  (-0.7, -0.65, 0.35), PINCH)),
]


def foot_ctrl(spec, zg):
    x, y, yaw, pitch = spec[:4]
    knee = spec[4] if len(spec) > 4 else yaw
    return dict(ankle=ankle_of(x, y, zg, yaw, pitch), yaw=yaw, pitch=pitch, knee=knee, relax=0.0)


def pose_ctrl(p, zg=POD_H, drop=0.004):
    c = dict(pelvis=p["pelvis"], hips=p["hips"], chest=p["chest"], head=p["head"],
             footL=foot_ctrl(p["footL"], zg), footR=foot_ctrl(p["footR"], zg))
    c["z"] = auto_z(c) - drop
    _, pts = torso(c, c["z"])
    for S in "LR":
        a = dict(p["arm" + S])
        base = pts["hj" + S] if a.pop("anchor") == "hip" else pts["sh" + S]
        a["off"] = tuple(base + Vector(a["off"]) - pts["sh" + S])
        c["arm" + S] = a
    return c


def vlerp(a, b, t):
    return tuple(lerp(x, y, t) for x, y in zip(a, b))


def blend_ctrl(a, b, t):
    """a -> b for everything except the feet, which always come from a."""
    c = dict(a)
    for k in ("pelvis", "hips", "chest", "head"):
        c[k] = vlerp(a[k], b[k], t)
    for S in "LR":
        c["arm" + S] = {k: vlerp(a["arm" + S][k], b["arm" + S][k], t)
                        for k in ("off", "pole", "hdir", "hz", "f")}
        f = dict(a["foot" + S])
        f["knee"] = lerp(f["knee"], b["foot" + S]["knee"], t)
        c["foot" + S] = f
    return c


# ================================================================ entrance walk
def pchip(xs, ys):
    n = len(xs)
    h = [xs[i + 1] - xs[i] for i in range(n - 1)]
    d = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n
    for i in range(1, n - 1):
        m[i] = 0.0 if d[i - 1] * d[i] <= 0 else 2 * d[i - 1] * d[i] / (d[i - 1] + d[i])

    def f(x):
        x = clamp(x, xs[0], xs[-1])
        i = 0
        while i < n - 2 and x > xs[i + 1]:
            i += 1
        t = (x - xs[i]) / h[i]
        t2, t3 = t * t, t * t * t
        return ((2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i]
                + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1])
    return f


SW0, STEP, SWD = 4, 15, 12      # first toe-off, frames per step, swing duration
TOEOFF, PRE = 32.0, 6
START_Y = 2.05
BL0, BL1 = 62, 88               # blend from the walk into pose 0


def make_walk(pose0_spec):
    p0 = pose_ctrl(pose0_spec)
    fl, fr = pose0_spec["footL"], pose0_spec["footR"]
    # plant = (x, y, ground z, yaw, resting pitch, touchdown pitch)
    start = {"L": (0.07, START_Y, 0, 3, 0, 0), "R": (-0.07, START_Y, 0, -3, 0, 0)}
    steps = [("R", (-0.06, 1.75, 0, -3, 0, -12)),
             ("L", (0.06, 1.10, 0, 3, 0, -12)),
             ("R", (-0.06, 0.48, 0, -3, 0, -12)),
             ("L", (fl[0], fl[1], POD_H, fl[2], fl[3], -5)),
             ("R", (fr[0], fr[1], POD_H, fr[2], fr[3], fr[3]))]

    def foot(S, t):
        cur = start[S]
        landed = None           # (touchdown frame, touchdown pitch)
        for i, (s, pl) in enumerate(steps):
            if s != S:
                continue
            ts = SW0 + STEP * i
            te = ts + SWD
            if t < ts:
                pitch = cur[4]
                if landed:
                    pitch = lerp(landed[1], cur[4], clamp((t - landed[0]) / 3))
                pre = min(PRE, ts)
                u = clamp((t - (ts - pre)) / pre)
                pitch = lerp(pitch, TOEOFF, u * u)
                return dict(ankle=ankle_of(cur[0], cur[1], cur[2], cur[3], pitch),
                            yaw=cur[3], pitch=pitch, knee=cur[3], relax=0.0)
            if t <= te:
                s_ = (t - ts) / (te - ts)
                a0 = ankle_of(cur[0], cur[1], cur[2], cur[3], TOEOFF)
                a1 = ankle_of(pl[0], pl[1], pl[2], pl[3], pl[5])
                if pl[2] > cur[2]:      # stepping up: rise first, travel second
                    sh = smooth(clamp((s_ - 0.15) / 0.85))
                    sv = smooth(clamp(s_ * 2.2))
                    sp = smooth(clamp(s_ * 2.5))
                    lift = 0.10
                else:
                    sh = sv = sp = smooth(s_)
                    lift = 0.045
                pos = Vector((lerp(a0.x, a1.x, sh), lerp(a0.y, a1.y, sh),
                              lerp(a0.z, a1.z, sv) + lift * sin(pi * s_)))
                yaw = lerp(cur[3], pl[3], sh)
                return dict(ankle=pos, yaw=yaw, pitch=lerp(TOEOFF, pl[5], sp), knee=yaw,
                            relax=0.30 * sin(pi * s_))
            cur = pl
            landed = (te, pl[5])
        pitch = cur[4]
        if landed:
            pitch = lerp(landed[1], cur[4], clamp((t - landed[0]) / 3))
        return dict(ankle=ankle_of(cur[0], cur[1], cur[2], cur[3], pitch),
                    yaw=cur[3], pitch=pitch, knee=cur[3], relax=0.0)

    py_end = pose0_spec["pelvis"][1]
    pel_y = pchip([0, 10, 25, 40, 55, 70, 80, ENTR_END],
                  [2.00, 1.94, 1.70, 1.05, 0.43, 0.0, py_end, py_end])

    def ctrl(t):
        th = pi * (t - SW0) / STEP
        env = smooth(t / 8.0) * (1 - smooth((t - 58) / 14.0))
        c = dict(pelvis=(0.02 * sin(th) * env, pel_y(t)),
                 hips=(-6 * cos(th) * env, -3 * sin(th) * env, 2 * env),
                 chest=(4 * cos(th) * env, 1.5 * sin(th) * env, 2 * env),
                 head=(0, 0, 0),
                 footL=foot("L", t), footR=foot("R", t))
        for S, s in (("L", 1), ("R", -1)):
            ya = s * 0.13 * cos(th) * env        # arm opposite to the leg
            c["arm" + S] = dict(off=(s * 0.055, ya, -0.485), pole=(s * 0.2, 1, 0),
                                hdir=(s * 0.03, ya * 1.4 - 0.05, -1), hz=(s, 0, 0), f=RELAX)
        return c

    seq = []
    for t in range(ENTR_END + 1):
        w = smooth((t - BL0) / float(BL1 - BL0))
        seq.append((blend_ctrl(ctrl(t), p0, w), w))
    za = [auto_z(c) for c, _ in seq]
    z = [za[0]]
    for i in range(1, len(za)):
        z.append(min(za[i], z[-1] + 0.012))      # cap how fast the hips can rise
    sig = 1.5
    zs = []
    for i in range(len(z)):
        num = den = 0.0
        for j in range(max(0, i - 5), min(len(z), i + 6)):
            g = exp(-((i - j) ** 2) / (2 * sig * sig))
            num += g * z[j]
            den += g
        zs.append(num / den)
    out = []
    for i, (c, w) in enumerate(seq):
        c["z"] = min(za[i], lerp(min(zs[i], z[i]) - 0.003, p0["z"], w))
        out.append(c)
    out[-1] = p0
    return out, p0


# ================================================================ animation
def animate(sc, ob):
    n_rev = len(POSES) - 1
    rot_end = ROT_START + REV * n_rev
    end = rot_end + TAIL
    sc.frame_start, sc.frame_end = 0, end
    sc.render.fps = FPS

    walk, p0 = make_walk(POSES[0])
    for t, c in enumerate(walk):
        key_pose(ob, c, t)
    switches = []
    for k in range(n_rev):
        f = ROT_START + REV * k + REV // 2      # exactly 180 degrees: back to camera
        key_pose(ob, pose_ctrl(POSES[k + 1]), f)
        switches.append(f)

    # clockwise seen from above = negative rotation about +Z
    ob.rotation_mode = 'XYZ'
    for f, ang in ((0, 0.0), (ROT_START, 0.0), (rot_end, -2 * pi * n_rev), (end, -2 * pi * n_rev)):
        ob.rotation_euler = (0, 0, ang)
        ob.keyframe_insert("rotation_euler", index=2, frame=f)

    from bpy_extras import anim_utils
    ad = ob.animation_data
    ad.action.name = PFX + "Podium_Action"
    cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
    for fc in cb.fcurves:
        spin = fc.data_path == "rotation_euler"
        for kp in fc.keyframe_points:
            if spin:
                kp.interpolation = 'LINEAR'
            else:   # baked walk is per-frame; everything from pose 0 on is a hard cut
                kp.interpolation = 'CONSTANT' if kp.co.x >= ENTR_END else 'LINEAR'
        fc.update()

    sc.timeline_markers.new("walk_on", frame=0)
    sc.timeline_markers.new("pose_0_point", frame=ENTR_END)
    for k in range(n_rev):
        sc.timeline_markers.new("spin_%d" % (k + 1), frame=ROT_START + REV * k)
        sc.timeline_markers.new("CUT_pose_%d" % (k + 1), frame=switches[k])
    sc.timeline_markers.new("end_hold", frame=rot_end)
    sc.frame_set(0)
    return dict(frame_end=end, rot_start=ROT_START, rot_end=rot_end, switches=switches)


def render_settings(sc, out_path):
    r = sc.render
    r.engine = 'BLENDER_EEVEE'
    try:
        sc.eevee.taa_render_samples = 24
    except Exception:
        pass
    r.film_transparent = False
    r.use_motion_blur = False
    r.filepath = out_path
    try:
        r.image_settings.media_type = 'VIDEO'
    except Exception:
        pass
    r.image_settings.file_format = 'FFMPEG'
    r.ffmpeg.format = 'MPEG4'
    r.ffmpeg.codec = 'H264'
    r.ffmpeg.constant_rate_factor = 'HIGH'
    r.ffmpeg.gopsize = 15
    try:
        r.ffmpeg.audio_codec = 'NONE'
    except Exception:
        pass


def main(out_path="//podium_rotation_ref.mp4"):
    sc, win = reset_scene()
    build_environment(sc)
    build_lights(sc)
    cam = build_camera(sc)
    ob, mob = build_character(sc, win)
    info = animate(sc, ob)
    render_settings(sc, out_path)
    info.update(shift_y=round(cam.data.shift_y, 4), verts=len(mob.data.vertices),
                objects=len(sc.collection.all_objects))
    return info


RESULT = main()
