import * as ol from 'openlayers';
import { WebMercator } from '../projections/index';

export type GetWorldPoint = (point: ol.Coordinate, proj?: ol.ProjectionLike) => [number, number, number];
export type Point = ol.Coordinate;
export type Triangle = [Point, Point, Point];
export type Edge = [Point, Point];
export interface FacesAndEdges {
    points: Triangle[];
    edges: [Point, Point][];
}
export interface CutMesh {
    cut: FacesAndEdges;
    fill: FacesAndEdges;
}

export function calcNormal(face): Point {
    const U = osg.Vec3.sub(face[0], face[1], []);
    const V = osg.Vec3.sub(face[2], face[1], []);
    return osg.Vec3.cross(U, V, []);
}

export function clockwise(faces: Triangle[]): Triangle[] {
    return faces.map((face) => {
        if (!isClockwise(face)) return ([...face].reverse() as Triangle);
        return ([...face] as Triangle);
    });
}

export function createColorsArray(size: number): Float32Array {
    const array = new Float32Array(size * 3);
    for (let i = 0; i < size; i++) {
        array[i * 3 + 0] = 1.0;
        array[i * 3 + 1] = 1.0;
        array[i * 3 + 2] = 1.0;
    }
    return array;
}

export function createNormalArray(size: number, x: number, y: number, z: number): Float32Array {
    const array = new Float32Array(size * 3);
    for (let i = 0; i < size; i++) {
        array[i * 3 + 0] = x;
        array[i * 3 + 1] = y;
        array[i * 3 + 2] = z;
    }
    return array;
}

export function cutMesh(mesh: FacesAndEdges, elevation?: number) {
    if (elevation === null || elevation === undefined) {
        return { cut: mesh, fill: null };
    }

    const above: FacesAndEdges = { points: [], edges: [] };
    const below: FacesAndEdges = { points: [], edges: [] };
    const intersected: FacesAndEdges = { points: [], edges: [] };

    const points = mesh.points;

    points.forEach((tri, i) => {
        let aboveCount = 0;
        let belowCount = 0;

        for (let j = 0; j < tri.length; j++) {
            // Have to negate because most of our models are upside down
            // TODO: longterm fix this.
            if (-(tri[j][2]) >= elevation) {
                aboveCount += 1;
            } else {
                belowCount += 1;
            }
        }

        if (aboveCount === 3) {
            above.points.push(tri);
        } else if (belowCount === 3) {
            below.points.push(tri);
        } else {
            // Words from the immortal Alex Snardle Martinowski
            // Things get a little complicated here as the cutting plane splits this triangle in half.
            // Bisecting an arbitrary triangle along a purely horizontal line is fairly trivial, though the code doesn't necessarily bear that out.
            // Four smaller triangles are formed from the current triangle. Essentially it's a sheared Sierpinski triangle.
            // Calculate the points of intersection with the line, and make 4 triangles along those intersections.

            // We also need to ensure the new triangles have the same normal vector as the source triangle

            const vecA = osg.Vec3.sub(tri[1], tri[0], []);
            const vecB = osg.Vec3.sub(tri[2], tri[0], []);
            const norm = osg.Vec3.normalize(osg.Vec3.cross(vecA, vecB, []), []);

            const a = tri.filter(p => -(p[2]) >= elevation);
            const b = tri.filter(p => -(p[2]) < elevation);

            let v1, v2, v3;
            if (a.length == 1) {
                v1 = a[0];
                v2 = b[0];
                v3 = b[1];
            } else {
                v1 = b[0];
                v2 = a[0];
                v3 = a[1];
            }

            const v1diff = -v1[2] - elevation;
            const v1v2 = osg.Vec3.normalize(osg.Vec3.sub(v2, v1, []), []);
            const v1v3 = osg.Vec3.normalize(osg.Vec3.sub(v3, v1, []), []);
            const v12s = v1diff / v1v2[2];
            const v13s = v1diff / v1v3[1];

            const v1a = osg.Vec3.add(v1, osg.Vec3.mult(v1v2, v12s, []), []);
            const v1b = osg.Vec3.add(v1, osg.Vec3.mult(v1v3, v13s, []), []);
            const v23mid = osg.Vec3.mult(osg.Vec3.add(v2, v3, []), 0.5, []);

            const tempAbove = [];
            const tempBelow = [];
            if (-v1[2] > elevation) {
                tempAbove.push([v1, v1a, v1b]);

                tempBelow.push([v1a, v2, v23mid]);
                tempBelow.push([v1b, v23mid, v3]);
                tempBelow.push([v1a, v23mid, v1b]);
            } else {
                tempBelow.push([v1, v1a, v1b]);

                tempAbove.push([v1a, v2, v23mid]);
                tempAbove.push([v1b, v23mid, v3]);
                tempAbove.push([v1a, v23mid, v1b]);
            }

            for (let j = 0; j < tempAbove.length; j++) {
                const vec = tempAbove[j];
                const u = osg.Vec3.sub(vec[1], vec[0], []);
                const v = osg.Vec3.sub(vec[2], vec[0], []);
                const n = osg.Vec3.normalize(osg.Vec3.cross(u, v, []), []);

                if (osg.Vec3.dot(norm, n) < 0.9) tempAbove[j].reverse();
            }

            for (let j = 0; j < tempBelow.length; j++) {
                const vec = tempBelow[j];
                const u = osg.Vec3.sub(vec[1], vec[0], []);
                const v = osg.Vec3.sub(vec[2], vec[0], []);
                const n = osg.Vec3.normalize(osg.Vec3.cross(u, v, []), []);

                if (osg.Vec3.dot(norm, n) < 0.9) tempBelow[j].reverse();
            }

            above.points.push(...tempAbove);
            below.points.push(...tempBelow);
        }
    });

    below.points.forEach(p => p.reverse());

    const edges = mesh.edges;
    edges.forEach((edge, i) => {
        let counter = 0;

        for (let j = 0; j < edge.length; j++) {
            if (edge[j] && -edge[j][2] >= elevation) counter++;
            else counter--;
        }

        if (counter === edge.length) above.edges.push(edge);
        else if (counter === -edge.length) below.edges.push(edge);
        else {
            // As above, so below. Intersecting edges need to be divided just as intersecting triangles did.
            // Fortunately, line-line intersection is much easier.

            const a = edge.filter(p => -p[2] >= elevation)[0];
            const b = edge.filter(p => -p[2] < elevation)[0];

            const diff = -a[2] - elevation;
            const abnorm = osg.Vec3.normalize(osg.Vec3.sub(b, a, []), []);
            const scalar = diff / abnorm[2];

            const intersect = osg.Vec3.add(a, osg.Vec3.mult(abnorm, scalar, []), []);

            above.edges.push([a, intersect]);
            below.edges.push([intersect, b]);
        }
    });

    return { cut: above, fill: below };
}

export function featureToNode(feature: ol.Feature, getPoint: GetWorldPoint, proj?: ol.ProjectionLike) {
    const type = feature.getGeometry().getType();
    console.log('making geo', feature.getGeometry().getType());
    if (type === 'Circle') {
        const geometry = (feature.getGeometry() as ol.geom.Circle);
        const point = getPoint(geometry.getCenter(), proj);
        const root = new osg.MatrixTransform();
        const subroot = new osg.MatrixTransform();
        const sphere = osg.createTexturedSphere(0.2, 10, 10);
        osg.Matrix.setTrans(subroot.getMatrix(), ...point);
        subroot.addChild(sphere);
        root.addChild(subroot);
        return root;
    } else if (type === 'LineString') {
        const geometry = (feature.getGeometry() as ol.geom.LineString);
        const points = geometry.getCoordinates().map(coord => getPoint(coord, proj));
        const geo = lineFromPoints(points);
        const node = new osg.MatrixTransform();
        node.addChild(geo);
        return null;
    } else {
        throw new Error(`Geometry Type ${feature.getGeometry().getType()} is not supported please do`);
    }
}

export function scalarProjection(a: Point, b: Point): number {
    return osg.Vec2.dot(a, b) / osg.Vec2.length(b);
}

export function vectorProjection(a: Point, b: Point): Point {
    return osg.Vec2.mult(
        b,
        (osg.Vec2.dot(a, b) / (osg.Vec2.length(b) ** 2)),
        []
    );
}

export function vectorRejection(a: Point, b: Point): Point {
    return osg.Vec2.sub(
        vectorProjection(a, b),
        a,
        []
    );
}
export function filterVertices(points: Point[], model: osg.Node): FacesAndEdges {
    const center = osg.Vec3.create();
    model.getBoundingBox().center(center);

    const extent = ol.extent.boundingExtent(points as any);
    const maxZ = Math.max(...points.map(p => p[2]));
    const minZ = Math.min(...points.map(p => p[2]));
    const bounds = new osg.BoundingBox();
    bounds._min = osg.Vec3.createAndSet(extent[0], extent[1], minZ);
    bounds._max = osg.Vec3.createAndSet(extent[2], extent[3], maxZ);

    const bounded = { points: [], edges: [] };
    // collects bounded points and edges.
    console.log('model', model, model.getChildren());
    model.getChildren().forEach((node, i) => {
        console.log('node', node, i);
        const geometry = node.getChildren()[0] as osg.Geometry;
        console.log('geometry', geometry);
        const attributes = geometry.getAttributes();
        const vertex = attributes.Vertex;
        const normal = attributes.Normal;

        // TODO: Use appropriate getters here
        const vertices = vertex._elements;
        const normals = normal._elements;
        const primitives = geometry.primitives;

        primitives.forEach((primitive) => {
            if (checkBoundsForPrimitive[primitive.mode]) {
                const result = checkBoundsForPrimitive[primitive.mode](primitive, geometry, bounds, points, true);
                if (result) {
                    console.log('got bounds', result, bounded)
                    bounded.points = bounded.points.concat(result.points);
                    bounded.edges = bounded.edges.concat(result.edges);
                }
            }
        });
    });
    bounded.edges = bounded.edges.filter(e => e && e.length && e[0] && e[0].length === 3);
    console.log('BOUNDED', bounded.edges.map(e => e[0]));
    const backup = bounded.edges.slice();
    let edge = 0;
    let point = 0;
    let selected = bounded.edges[edge][point];
    console.log('before selected', selected);
    for (var x = 0; x < bounded.edges.length; x++) {
        for (var y = 0; y < bounded.edges[x].length; y++) {
            var current = bounded.edges[x][y];
            if ((selected[2] < current[2]) || (selected[2] == current[2] && selected[0] < current[0])) {
                edge = x;
                point = y;
                selected = current;
            }
        }
    }
    console.log('after selected', selected);
    const neighbor = bounded.edges[edge][(point + 1) % 2];

    const sorted = [selected.slice(0), neighbor.slice(0)];
    delete bounded.edges[edge][point];
    delete bounded.edges[edge][(point + 1) % 2];
    let found = false;
    console.log('before sorted', sorted);
    for (let z = 1; sorted.length < (bounded.edges.length * 2); z += 2) {
        found = false;
        const last = sorted[z];
        for (var x = 0; x < bounded.edges.length && !found; x++) {
            for (var y = 0; y < bounded.edges[x].length && !found; y++) {
                let current = bounded.edges[x][y];
                if (current === undefined) continue;

                if (last[0] == current[0] && last[2] == current[2]) {
                    sorted.push(bounded.edges[x][y].slice(0));
                    sorted.push(bounded.edges[x][(y + 1) % 2].slice(0));

                    delete bounded.edges[x][y];
                    delete bounded.edges[x][(y + 1) % 2];

                    found = true;
                }
            }
        }

        if (!found) {
            console.warn("ERROR: Couldn't string edges together");
            bounded.edges = backup;
            break;
        }
    }

    console.log('after sorted', sorted);

    if (sorted.length == (bounded.edges.length * 2)) {
        bounded.edges = [];
        for (var x = 0; x < sorted.length; x += 2) {
            bounded.edges.push([sorted[x], sorted[x + 1]]);
        }
    }

    // console.log(bounded);
    return bounded;
}

/**
 * Gets the vertices that are in bounds.
 *
 * @export
 * @param {Triangle[]} faces
 * @param {osg.BoundingBox} bounds
 * @returns {{ bounded: Triangle[], unbounded: Traingle[] }}
 */
export function getBoundedVertices(faces: Triangle[], bounds: osg.BoundingBox): { bounded: Point[], unbounded: Point[] } {
    const vertices: Point[] = [].concat(...faces);
    const bounded = vertices.filter((v) => isBounded(v, bounds));
    const unbounded = vertices.filter((v) => !isBounded(v, bounds));
    return {
        bounded, unbounded
    };
}

export function getCenter(points: Point[]): Point {
    let center = points.reduce((c, point) => {
        return osg.Vec2.add(c, point, []);
    }, [0, 0]);
    center = osg.Vec2.mult(center, 1 / points.length, []);
    return center;
}

export function getCrossingNumber(point: Point, shape: Point[]): number {
    let cn = 0;

    const P = { x: point[0], y: point[1] };
    const V = [];
    shape.forEach((edge) => { V.push({ x: edge[0], y: edge[1] }); });

    for (let i = 0; i < shape.length - 1; i++) {
        if (((V[i].y <= P.y) && (V[i + 1].y > P.y)) || ((V[i].y > P.y) && (V[i + 1].y <= P.y))) {
            const vt = (P.y - V[i].y) / (V[i + 1].y - V[i].y);
            if (P.x < V[i].x + vt * (V[i + 1].x - V[i].x))++cn;
        }
    }
    return (cn % 2);
}

export const checkBoundsForTriangle = checkBoundsForTriVariant(2, 3);
export const checkBoundsForTriStrips = checkBoundsForTriVariant(2, 1);
export const checkBoundsForPrimitive = [
    null,                       // osg.PrimitiveSet.POINTS
    null,                       // osg.PrimitiveSet.LINES
    null,                       // osg.PrimitiveSet.LINE_LOOP
    null,                       // osg.PrimitiveSet.LINE_STRIP
    checkBoundsForTriangle, // osg.PrimitiveSet.TRIANGLES
    checkBoundsForTriStrips,    // osg.PrimitiveSet.TRIANGLE_STRIP
    null,                       // osg.PrimitiveSet.TRIANGLE_FAN
];

export type BoundsChecker = (primitive: osg.DrawElements, geometry: osg.Geometry, bounds: osg.BoundingBox, shape: Point[], isXZY?: boolean) => FacesAndEdges;

export function checkBoundsForTriVariant(start: number, increment: number): BoundsChecker {
    return (primitive, geometry: osg.Geometry, bounds: osg.BoundingBox, shape: Point[], isXZY?: boolean) => {
        console.log('SHAPE', shape);
        const toReturn = {
            points: [],
            edges: [],
        };
        const indices = primitive.indices._elements;
        const vertices = geometry.getAttributes().Vertex._elements;
        const max = Math.max(...indices)
        const min = Math.min(...indices);
        console.log('boundsCheck', bounds.getMax(), bounds.getMin(), shape, max, min)

        for (let i = start; i < indices.length; i += increment) {
            const faceIndices = [indices[i], indices[i - 1], indices[i - 2]];
            const face: Triangle = faceIndices.map((j) => {
                const toReturn = [
                    vertices[(j * 3) + 0],
                    vertices[(j * 3) + 1],
                    vertices[(j * 3) + 2]
                ];
                if (isXZY) {
                    const swap = toReturn[2];
                    toReturn[2] = toReturn[1];
                    toReturn[1] = swap;
                }
                return toReturn;
            }) as Triangle;
            const { bounded, unbounded } = getBoundedVertices([face], bounds)
            if (i % 10000 === 2) console.log('face', face);
            if (bounded.length > 0) {
                const truncated = truncateToShape(face, shape);
                if (truncated) {
                    toReturn.points = toReturn.points.concat(truncated.points);
                    toReturn.edges = toReturn.edges.concat(truncated.edges);
                    // console.log('\t Bounded, Unbounded', bounded, unbounded, truncated, toReturn);
                }
            }
        }
        return toReturn;
    };
}

export function lineFromPoints(points, fill?): osg.Geometry {
    const vertices = new Float32Array(2 * points.length * 3);
    for (let i = 0; i < points.length; i++) {
        vertices[3 * i] = points[i][0];
        vertices[3 * i + 1] = points[i][1];
        vertices[3 * i + 2] = points[i][2];
    }

    const geom = new osg.Geometry();
    console.log('geom', geom, points);

    const normals = createNormalArray(points.length, 0, -1, 0);
    const colors = createColorsArray(points.length);

    geom.setVertexAttribArray('Vertex', new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, vertices, 3));
    geom.setVertexAttribArray('Normal', new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, normals, 3));
    geom.setVertexAttribArray('Color', new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, colors, 3));

    geom.getPrimitiveSetList()
        .push(new osg.DrawArrays(osg.PrimitiveSet.LINE_STRIP, 0, points.length));
    return geom;
}

export function makeEdges(edges: Edge[], drop: number, center): Point[] {
    let center2 = [0, 0, 0];
    const tris = [];
    edges.forEach((edge, i) => {
        if (!edge || edge.length < 2 || !edge[0] || !edge[1]) {
            return;
        }

        center2 = osg.Vec3.add(center2, edge[0], []);
        center2 = osg.Vec3.add(center2, edge[1], []);

        const p1 = edge[0];
        const p2 = edge[1];

        const p3 = [p1[0], p1[1], drop];
        const p4 = [p2[0], p2[1], drop];

        tris.push([p1, p2, p4]);
        tris.push([p4, p3, p1]);
    });
    center2 = osg.Vec3.mult(center2, 1 / tris.length, []);
    center[1] = center[2];
    center[2] = 0;

    let away = 0;
    tris.forEach((tri, i) => {
        const lineCenter = [
            (tri[0][0] + tri[1][0]) / 2,
            (tri[0][1] + tri[1][1]) / 2,
            (tri[0][2] + tri[1][2]) / 2,
        ];

        let n = calcNormal(tri);
        let v = osg.Vec3.sub(center, lineCenter, []);

        n = osg.Vec3.normalize(n, []);
        v = osg.Vec3.normalize(v, []);

        const proj = osg.Vec3.dot(v, n, []);
        away += Math.sign(proj);
    });

    for (let i = 0; i < tris.length && away < 0; i++) {
        tris[i].reverse();
    }

    return [].concat(...tris);

}

/**
 * Creates a prism geometry from the points (shooting strait up)
 *
 * Assumes points are in xyz where y represense the height rather
 * than osgjs usual z.
 *
 * Previously named Create selection model
 *
 * @export
 * @param {ol.Coordinate[]} points
 * @param {number} top
 * @param {number} bottom
 * @returns {osg.MatrixTransform}
 */
export function makePrismSlice(points: ol.Coordinate[], top: number, bottom: number): osg.MatrixTransform {
    const root = new osg.MatrixTransform();
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const nextPoint = points[(i + 1) % points.length];
        // Create a rectangular face for every side
        const bottomLeft = [point[0], point[1], bottom];
        const widthVec = [nextPoint[0] - point[0], nextPoint[1] - point[1], 0];
        const heightVec = [0, 0, (top - bottom)];
        const args = [
            ...bottomLeft,
            ...widthVec,
            ...heightVec,
        ];
        console.log('args', args);
        const quad = (osg as any).createTexturedQuadGeometry(...args);
        root.addChild(quad);
    }
    const material = new osg.Material();
    material.setDiffuse([0.0, 0.0, 1.0, 0.5]);
    material.setAmbient([1.0, 1.0, 1.0, 1.0]);
    material.setSpecular([1.0, 1.0, 1.0, 0.0]);
    material.setEmission([0.0, 0.0, 0.0, 0.5]);

    root.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
    root.getOrCreateStateSet().setAttributeAndModes(new osg.BlendFunc('SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'));
    root.getOrCreateStateSet().setAttributeAndModes(new osg.CullFace('DISABLE'));
    root.getOrCreateStateSet().setAttributeAndModes(material);
    return root;
}

/**
 * Takes a list of faces (2D or 1D) and creates a geometry after them.
 * If more than 2 ** 16 - 1 vertices are passed, creates several geometries.
 *
 * @export
 * @param {(Point[] | number[])} points
 * @returns
 */
export function makeSurface(points: Point[] | number[]) {
    const root = new osg.MatrixTransform();
    let vertices: number[] = (points as number[]);
    // Check if 2D array or not.
    if (Array.isArray(vertices[0])) {
        // Flatten
        vertices = [].concat(...vertices);
    }
    const MAX_SIZE = 2 ** 16 - 1;
    const TRIANGLE_COUNT = vertices.length / 3;
    for (let triangleIndex = 0; triangleIndex < TRIANGLE_COUNT; triangleIndex += MAX_SIZE) {
        const node = new osg.MatrixTransform();

        const cap = Math.min(MAX_SIZE, TRIANGLE_COUNT - triangleIndex);
        const vertexBuffer = new Float32Array(cap * 3);
        const indexBuffer = new Uint16Array(cap);

        for (let i = 0; i <= cap; i++) {
            indexBuffer[i] = i;
            // Set vertex buffer.
            vertexBuffer[(i * 3) + 0] = vertices[((triangleIndex + i) * 3) + 0];
            vertexBuffer[(i * 3) + 1] = vertices[((triangleIndex + i) * 3) + 1];
            vertexBuffer[(i * 3) + 2] = vertices[((triangleIndex + i) * 3) + 2];
        }
        console.log('vertexBufer', vertexBuffer);
        const g = new osg.Geometry();
        g.getAttributes().Vertex = new osg.BufferArray(osg.BufferArray.ARRAY_BUFFER, vertexBuffer, 3);
        g.getPrimitives()
            .push(
            new osg.DrawElements(osg.PrimitiveSet.TRIANGLES,
                new osg.BufferArray(osg.BufferArray.ELEMENT_ARRAY_BUFFER, indexBuffer, 1)));

        node.addChild(g);
        root.addChild(node);
    }
    return root;
}

export interface VolumeData {
    elevations: [number, number];
}

export function makeVolumeSurface(model: FacesAndEdges, center: Point, close: boolean, elevation: number) {
    const subRoot = new osg.MatrixTransform();
    const modelRoot = new osg.MatrixTransform();
    const wireRoot = new osg.MatrixTransform();

    const flattened = [].concat(...model.points);

    const topdown = topDown(model.points, true, elevation);

    if (elevation === null || elevation === undefined) elevation = -topdown.heights[1];
    const edges = makeEdges(model.edges, -elevation, center);

    modelRoot.addChild(makeSurface(flattened));
    if (close) {
        modelRoot.addChild(makeSurface(topdown.points));
        modelRoot.addChild(makeSurface(edges));
    }

    subRoot.addChild(modelRoot);
    subRoot.addChild(wireRoot);
    subRoot.setUserData({
        elevations: topdown.heights,
    });
    return subRoot;
}

export function makeTri(p1: Point, p2: Point, p3: Point) {
    const points = [
        p1, p2, p3
    ];
    return makeSurface(points);
}

/**
 * Checks if point is withing xy bounds. Does not check z.
 *
 * @export
 * @param {Point} point
 * @param {osg.BoundingBox} bounds
 * @returns {boolean}
 */
export function isBounded(point: Point, bounds: osg.BoundingBox, checkZ?: boolean): boolean {
    const min = bounds.getMin();
    const max = bounds.getMax();

    if (
        (point[0] >= min[0] && point[0] <= max[0]) &&
        (point[1] >= min[1] && point[1] <= max[1])
    ) {

        if (checkZ) {
            if (point[2] >= min[2] && point[2] <= max[2]) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
    return false;
}

export function isClockwise(face: Triangle) {
    return calcNormal(face)[2] >= 0;
}

export function isParallel(face: Triangle) {
    return osg.Vec3.length2(calcNormal(face)) === 0;
}

export function sampleHeightsAlong(coords: ol.Coordinate[], resolution: number, getPoint: GetWorldPoint,
    projection?: ol.ProjectionLike) {

    const points = coords.map((c) => getPoint(c, projection));
    const samples = [];
    for (let i = 0; i < points.length - 1; i += 1) {
        const start = [points[i][0], points[i][1]];
        const end = [points[i + 1][0], points[i + 1][1]];
        const slope = osg.Vec2.sub(end, start, []);
        const distance = osg.Vec2.length(slope);
        let incr = 0;
        samples.push(points[i]);
        while (incr < distance) {
            const point = getPoint(osg.Vec2.add(start, osg.Vec2.mult(slope, incr / distance, []), []), null);
            samples.push(point);
            incr += resolution;
        }
    }
    return samples;
}

export function topDown(points: Triangle[], flip: boolean, elevation: number) {
    const data = {
        heights: [points[0][0][2], points[0][0][2]],
        points: [],
    };

    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
            data.points.push([...(points[i][j] as any)]);
            data.heights = [
                Math.min(data.heights[0], points[i][j][2]),
                Math.max(data.heights[1], points[i][j][2]),
            ];
        }
    }

    if (elevation === null || elevation === undefined) elevation = -data.heights[1];

    for (let i = 0; i < data.points.length; i++) { data.points[i][2] = -elevation; }
    if (flip) data.points.reverse();

    return data;
}


// Todo figure out what this does
export function transformMat4(out: osg.Vec3, a: osg.Vec3, m: osg.Matrix) {
    let x = a[0],
        y = a[1],
        z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];

    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}

/**
 * Return scalar multiplier that will keep a vector from start going to heading
 * on the shape. 2 DIMENSIONAL TRUNCATION
 *
 * @export
 * @param {Point} start
 * @param {Point} heading
 * @param {any} shape
 * @returns {number}
 */
export function truncateToEdge(start: Point, heading: Point, shape: Point[]): number {
    const p = start;
    const r = heading;

    for (let x = 1; x < shape.length; x++) {
        const q = shape[x - 1];
        const s = osg.Vec2.sub(shape[x], shape[x - 1], []);

        const tNum = v2Cross(osg.Vec2.sub(q, p, []), s);
        const tDen = v2Cross(r, s);

        if (tDen != 0 && tNum != 0) {
            const t = tNum / tDen;
            if (t >= 0 && t <= 1) return t;
        }
    }

    return 1;
}

export function truncateToShape(points: Triangle, shape: Point[]): FacesAndEdges {
    const info = {
        pts2d: { inside: [], outside: [] },
        pts3d: { inside: [], outside: [] },
    };

    const retval = { points: [], edges: [] };

    let v1 = osg.Vec3.sub(points[0], points[1], []);
    let v2 = osg.Vec3.sub(points[2], points[1], []);
    const cross = osg.Vec3.cross(v1, v2, []);
    if (osg.Vec3.length2(cross) <= 0) return;
    points.forEach((point) => {
        const pt2d = [point[0], point[1]];
        switch (getCrossingNumber(pt2d as any, shape)) {
            case 1:
                info.pts2d.inside.push(pt2d);
                info.pts3d.inside.push(point);
                break;
            case 0:
                info.pts2d.outside.push(pt2d);
                info.pts3d.outside.push(point);
                break;
        }
    });
    if (info.pts2d.inside.length === 3) {
        retval.points = clockwise([points]);
        // console.warn('NO EDGES');
    } else if (info.pts2d.inside.length === 2) {
        v1 = osg.Vec2.sub(info.pts2d.outside[0], info.pts2d.inside[0], []);
        v2 = osg.Vec2.sub(info.pts2d.outside[0], info.pts2d.inside[1], []);

        const w1 = osg.Vec3.sub(info.pts3d.outside[0], info.pts3d.inside[0], []);
        const w2 = osg.Vec3.sub(info.pts3d.outside[0], info.pts3d.inside[1], []);

        const t1 = truncateToEdge(info.pts2d.inside[0], v1, shape);
        const t2 = truncateToEdge(info.pts2d.inside[1], v2, shape);

        v1 = osg.Vec3.add(osg.Vec3.mult(w1, t1, []), info.pts3d.inside[0], []);
        v2 = osg.Vec3.add(osg.Vec3.mult(w2, t2, []), info.pts3d.inside[1], []);

        retval.points = clockwise([
            [info.pts3d.inside[0], info.pts3d.inside[1], v2],
            [info.pts3d.inside[0], v1, v2],
        ]);
        retval.edges = [[v1.slice(), v2.slice()]];

    } else if (info.pts2d.inside.length === 1) {
        v1 = osg.Vec2.sub(info.pts2d.outside[0], info.pts2d.inside[0], []);
        v2 = osg.Vec2.sub(info.pts2d.outside[1], info.pts2d.inside[0], []);

        const w1 = osg.Vec3.sub(info.pts3d.outside[0], info.pts3d.inside[0], []);
        const w2 = osg.Vec3.sub(info.pts3d.outside[1], info.pts3d.inside[0], []);

        const t1 = truncateToEdge(info.pts2d.inside[0], v1, shape);
        const t2 = truncateToEdge(info.pts2d.inside[0], v2, shape);

        v1 = osg.Vec3.add(osg.Vec3.mult(w1, t1, []), info.pts3d.inside[0], []);
        v2 = osg.Vec3.add(osg.Vec3.mult(w2, t2, []), info.pts3d.inside[0], []);
        retval.points = clockwise([[info.pts3d.inside[0], v1, v2]]);
        retval.edges = [[v1.slice(), v2.slice()]];

    }

    return retval;
}

export function v2Cross(v1: Point, v2: Point) {
    return (v1[0] * v2[1]) - (v1[1] * v2[0]);
}