"""Builds the developer room in Blender and exports public/room.glb.
Run:  blender -b -P blender/build_room.py
Coordinates below are given in three.js space (Y up, -Z into the room) and converted,
so they match the positions used by Monitor.jsx / App.jsx lights.
"""
import math, os, bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, 'blender', 'tex')  # source textures stay out of public/ so they are not deployed
TEX_SIZE = 1024  # the room is viewed from 1.5m+; 2k sources only cost download time
OUT = os.path.join(ROOT, 'public', 'room.glb')

bpy.ops.wm.read_factory_settings(use_empty=True)

def P(x, y, z):  # three.js -> Blender (Z up)
    return (x, -z, y)

# ---------- materials ----------
_mats = {}
def mat(name, color=(0.8, 0.8, 0.8), rough=0.7, metal=0.0, emit=None, strength=1.0, tex=None, repeat=(1, 1)):
    if name in _mats: return _mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if emit:
        bsdf.inputs['Emission Color'].default_value = (*emit, 1)
        bsdf.inputs['Emission Strength'].default_value = strength
    if tex:
        coord = nt.nodes.new('ShaderNodeTexCoord'); mapping = nt.nodes.new('ShaderNodeMapping')
        mapping.inputs['Scale'].default_value = (repeat[0], repeat[1], 1)
        nt.links.new(coord.outputs['UV'], mapping.inputs['Vector'])
        for suffix, sock, cs in (('diff', 'Base Color', 'sRGB'), ('rough', 'Roughness', 'Non-Color')):
            img = nt.nodes.new('ShaderNodeTexImage')
            img.image = bpy.data.images.load(os.path.join(TEX, f'{tex}_{suffix}.jpg'))
            img.image.scale(TEX_SIZE, TEX_SIZE)
            img.image.colorspace_settings.name = cs
            nt.links.new(mapping.outputs['Vector'], img.inputs['Vector'])
            nt.links.new(img.outputs['Color'], bsdf.inputs[sock])
        img = nt.nodes.new('ShaderNodeTexImage')
        img.image = bpy.data.images.load(os.path.join(TEX, f'{tex}_nor_gl.jpg'))
        img.image.scale(TEX_SIZE, TEX_SIZE)
        img.image.colorspace_settings.name = 'Non-Color'
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(mapping.outputs['Vector'], img.inputs['Vector'])
        nt.links.new(img.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    _mats[name] = m
    return m

# ---------- primitives ----------
def finish(obj, name, m, bevel=0.0, smooth=False):
    obj.name = name
    obj.data.materials.append(m)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = obj.modifiers.new('Bevel', 'BEVEL'); b.width = bevel; b.segments = 3
    if smooth: bpy.ops.object.shade_smooth()
    return obj

def box(name, pos, size, m, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=P(*pos))
    o = bpy.context.object
    o.scale = (size[0] / 2, size[2] / 2, size[1] / 2)
    o.rotation_euler = (rot[0], -rot[2], rot[1])
    return finish(o, name, m, bevel)

def cyl(name, pos, r, h, m, r2=None, bevel=0.0, rot=(0, 0, 0), verts=32):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r2 if r2 is not None else r, radius2=r, depth=h, location=P(*pos))
    o = bpy.context.object
    o.rotation_euler = (rot[0], -rot[2], rot[1])
    return finish(o, name, m, bevel, smooth=True)

def sphere(name, pos, r, m):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=P(*pos), segments=24, ring_count=16)
    return finish(bpy.context.object, name, m, smooth=True)

def plane(name, pos, w, h, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=P(*pos))
    o = bpy.context.object
    o.scale = (w, h, 1)
    o.rotation_euler = rot
    return finish(o, name, m)

def cable(name, points, r, m):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 4
    sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(points) - 1)
    for bp, p in zip(sp.bezier_points, points):
        bp.co = P(*p); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o)
    o.data.materials.append(m)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target='MESH'); bpy.ops.object.shade_smooth()
    return o

# ---------- materials ----------
M_FLOOR = mat('floor', tex='wood_floor_deck', repeat=(3, 3), rough=0.9)
M_WALL = mat('wall', color=(0.54, 0.58, 0.66), tex='painted_plaster_wall', repeat=(3, 1.5))
M_DESK = mat('desk', tex='wood_table_001', repeat=(2, 1), rough=0.6)
M_CEIL = mat('ceiling', (0.85, 0.83, 0.8))
M_TRIM = mat('trim', (0.91, 0.89, 0.86), rough=0.5)
M_BLACK = mat('black_plastic', (0.08, 0.08, 0.08), rough=0.5)
M_DARK = mat('dark_plastic', (0.17, 0.17, 0.17), rough=0.6)
M_KEY = mat('keycap', (0.23, 0.23, 0.23), rough=0.8)
M_STEEL = mat('steel', (0.6, 0.6, 0.62), rough=0.3, metal=0.9)
M_CUSHION = mat('cushion', (0.09, 0.09, 0.1), rough=0.9)
M_WOOD = mat('shelf_wood', (0.42, 0.29, 0.18), rough=0.7)
M_LED = mat('led', (0.49, 0.23, 0.93), emit=(0.49, 0.23, 0.93), strength=6)
M_LAMP = mat('lamp_bulb', (1, 0.96, 0.9), emit=(1, 0.91, 0.81), strength=2)
M_SKY = mat('sky', (0.02, 0.04, 0.12), emit=(0.05, 0.09, 0.25), strength=0.35)
M_GLOW = mat('tower_glow', (0, 0, 0), emit=(0.13, 0.83, 0.93), strength=0.5)
M_RUG = mat('rug', (0.29, 0.2, 0.31), rough=1.0)
M_POSTER = mat('poster', (0.3, 0.11, 0.58), rough=0.9)
M_MUG = mat('mug', (0.96, 0.96, 0.95), rough=0.3)
M_POT = mat('pot', (0.6, 0.42, 0.31), rough=0.9)
M_LEAF = mat('leaf', (0.12, 0.48, 0.23), rough=0.8)
M_CABLE = mat('cable', (0.05, 0.05, 0.05), rough=0.6)
BOOKS = [(0.73, 0.11, 0.11), (0.11, 0.31, 0.85), (0.08, 0.5, 0.24), (0.85, 0.47, 0.02), (0.22, 0.25, 0.32)]

# ---------- room shell ----------
plane('floor', (0, 0, 0.5), 6, 6, M_FLOOR)
plane('ceiling', (0, 3, 0.5), 6, 6, M_CEIL, rot=(math.pi, 0, 0))
plane('wall_back', (0, 1.5, -2.5), 6, 3, M_WALL, rot=(math.pi / 2, 0, 0))
plane('wall_left', (-3, 1.5, 0.5), 6, 3, M_WALL, rot=(math.pi / 2, 0, math.pi / 2))
plane('wall_right', (3, 1.5, 0.5), 6, 3, M_WALL, rot=(math.pi / 2, 0, -math.pi / 2))
box('skirting_back', (0, 0.05, -2.48), (6, 0.1, 0.03), M_TRIM)
box('skirting_left', (-2.98, 0.05, 0.5), (0.03, 0.1, 6), M_TRIM)
box('skirting_right', (2.98, 0.05, 0.5), (0.03, 0.1, 6), M_TRIM)
cyl('ceiling_lamp', (0, 2.95, 0), 0.18, 0.06, M_LAMP)
cyl('ceiling_lamp_cord', (0, 2.99, 0), 0.01, 0.04, M_BLACK, verts=8)

# window on the left wall
box('window_frame', (-2.95, 1.7, -0.6), (0.08, 1.5, 1.8), M_TRIM, bevel=0.005)
plane('window_sky', (-2.905, 1.7, -0.6), 1.6, 1.3, M_SKY, rot=(math.pi / 2, 0, math.pi / 2))
box('window_mullion_v', (-2.9, 1.7, -0.6), (0.02, 1.3, 0.04), M_TRIM)
box('window_mullion_h', (-2.9, 1.7, -0.6), (0.02, 0.04, 1.6), M_TRIM)
box('window_sill', (-2.88, 0.93, -0.6), (0.18, 0.04, 1.9), M_TRIM, bevel=0.005)

# ---------- desk ----------
box('desk_top', (0, 0.75, -1.6), (2.4, 0.05, 1), M_DESK, bevel=0.012)
for i, x in enumerate((-1.1, 1.1)):
    box(f'desk_leg_{i}', (x, 0.37, -1.6), (0.06, 0.74, 0.9), M_BLACK, bevel=0.005)
box('desk_beam', (0, 0.1, -1.95), (2.2, 0.05, 0.05), M_BLACK)
box('led_strip', (0, 0.78, -2.08), (2.3, 0.01, 0.01), M_LED)

# PC tower with glass side, mesh front and glow
box('pc_tower', (0.95, 0.98, -1.75), (0.22, 0.42, 0.45), M_BLACK, bevel=0.008)
plane('pc_front', (0.95, 0.98, -1.522), 0.16, 0.36, M_DARK, rot=(math.pi / 2, 0, 0))
plane('pc_glow', (0.95, 0.98, -1.521), 0.12, 0.3, M_GLOW, rot=(math.pi / 2, 0, 0))

# keyboard, keys, mouse
box('keyboard', (0, 0.79, -1.3), (0.46, 0.025, 0.16), M_DARK, bevel=0.006)
for r, zz in enumerate((-1.345, -1.315, -1.285, -1.255)):
    for i in range(15 - r % 2):
        box(f'key_{r}_{i}', (-0.21 + (r % 2) * 0.015 + i * 0.03, 0.806, zz), (0.024, 0.008, 0.024), M_KEY, bevel=0.002)
box('spacebar', (0.0, 0.806, -1.225), (0.16, 0.008, 0.024), M_KEY, bevel=0.002)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=P(0.4, 0.79, -1.3)); o = bpy.context.object
o.scale = (0.033, 0.055, 0.02); finish(o, 'mouse', M_DARK, smooth=True)

# mug with handle
cyl('mug', (-0.7, 0.825, -1.35), 0.045, 0.1, M_MUG, r2=0.04)
bpy.ops.mesh.primitive_torus_add(location=P(-0.65, 0.83, -1.35), major_radius=0.03, minor_radius=0.007, rotation=(0, math.pi / 2, 0))
finish(bpy.context.object, 'mug_handle', M_MUG, smooth=True)

# desk lamp
cyl('lamp_base', (-0.95, 0.785, -1.85), 0.08, 0.02, M_STEEL)
cyl('lamp_arm', (-0.95, 1.02, -1.85), 0.01, 0.45, M_STEEL, verts=12)
cyl('lamp_shade', (-0.9, 1.25, -1.8), 0.1, 0.14, M_STEEL, r2=0.03, rot=(0, 0, 0.5))
sphere('lamp_bulb', (-0.88, 1.2, -1.78), 0.03, M_LAMP)

# cables: monitor + keyboard + lamp to floor behind the desk
cable('cable_monitor', [(0, 0.85, -1.55), (0.3, 0.76, -1.95), (0.6, 0.4, -2.05), (0.95, 0.05, -2.1)], 0.006, M_CABLE)
cable('cable_keyboard', [(0.2, 0.79, -1.38), (0.5, 0.77, -1.7), (0.85, 0.78, -1.98)], 0.004, M_CABLE)
cable('cable_lamp', [(-0.95, 0.78, -1.9), (-1.0, 0.5, -2.1), (-1.1, 0.05, -2.2)], 0.004, M_CABLE)

# ---------- shelf, books, poster, rug ----------
box('shelf', (-1.6, 1.9, -2.38), (1.2, 0.03, 0.24), M_WOOD, bevel=0.004)
for i, b in enumerate((-2.05, -1.92, -1.8, -1.68, -1.57)):
    box(f'book_{i}', (b, 2.04, -2.4), (0.09, 0.22 + (i % 2) * 0.04, 0.17), mat(f'book_{i}', BOOKS[i], rough=0.75), bevel=0.003)
box('book_lean', (-1.46, 2.02, -2.4), (0.08, 0.2, 0.15), mat('book_5', (0.9, 0.9, 0.88), rough=0.75), bevel=0.003, rot=(0, 0, -0.25))
box('poster_frame', (1.4, 1.9, -2.48), (0.8, 1.1, 0.02), M_BLACK)
plane('poster', (1.4, 1.9, -2.465), 0.72, 1.02, M_POSTER, rot=(math.pi / 2, 0, 0))
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=1.2, depth=0.01, location=P(0.2, 0.005, 0.4))
finish(bpy.context.object, 'rug', M_RUG, smooth=True)

# ---------- chair (cushioned, bevelled) ----------
seat = box('chair_seat', (0, 0.5, -0.4), (0.55, 0.09, 0.55), M_CUSHION, bevel=0.035)
back = box('chair_back', (0, 0.85, -0.15), (0.55, 0.62, 0.09), M_CUSHION, bevel=0.035)
for o in (seat, back):
    s = o.modifiers.new('Subd', 'SUBSURF'); s.levels = 1
box('chair_bracket', (0, 0.55, -0.2), (0.4, 0.05, 0.15), M_BLACK)
cyl('chair_post', (0, 0.25, -0.4), 0.03, 0.5, M_STEEL, verts=12)
for a in range(0, 360, 72):
    rad = math.radians(a)
    box(f'chair_leg_{a}', (math.cos(rad) * 0.15, 0.03, -0.4 + math.sin(rad) * 0.15), (0.3, 0.03, 0.04), M_DARK, bevel=0.008, rot=(0, -rad, 0))
    cyl(f'chair_wheel_{a}', (math.cos(rad) * 0.28, 0.025, -0.4 + math.sin(rad) * 0.28), 0.025, 0.02, M_BLACK, rot=(0, -rad, math.pi / 2), verts=16)
for x in (-0.3, 0.3):
    box(f'chair_arm_{x}', (x, 0.72, -0.35), (0.04, 0.03, 0.35), M_DARK, bevel=0.01)
    box(f'chair_arm_post_{x}', (x, 0.61, -0.25), (0.03, 0.2, 0.03), M_DARK)

# ---------- plant ----------
cyl('pot', (-2.5, 0.2, -2), 0.18, 0.4, M_POT, r2=0.14)
for i, (x, y, z) in enumerate(((0, 0.7, 0), (0.2, 0.6, 0.15), (-0.2, 0.62, -0.1), (0.05, 0.9, -0.15), (-0.1, 0.85, 0.15))):
    sphere(f'leaf_{i}', (-2.5 + x, y, -2 + z), 0.22, M_LEAF)

# ---------- export ----------
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_apply=True, export_yup=True,
                          export_image_format='WEBP', export_image_quality=80, export_texcoords=True, export_normals=True)
print('WROTE', OUT, os.path.getsize(OUT) // 1024, 'KB')
