/// <reference path="../node_modules/@types/jquery/index.d.ts" />

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var jquery: any;
declare var initStrayosJquery: any;

declare module 'pouchdb' {
	var PouchDB: any;
	export default PouchDB;
}
// Bluebird
declare var P: any;

declare var OSG: OSGModule;
interface OSGModule {
  globalify: () => void;
}

declare module osg {
  // vec3 is an object, not a class
	export var Vec2;
	export interface Vec2 {
		create(): osg.Vec2;
		createAndSet(x, y): osg.Vec2;
		set(x, y, z, result: osg.Vec2): osg.Vec2;
		length(): number;
	}

	// vec3 is an object, not a class
	export var Vec3;
	export interface Vec3 {
		copy(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
		create(): osg.Vec3;
		createAndSet(x, y, z): osg.Vec3;
		set(x, y, z, result: osg.Vec3): osg.Vec3;

		distance(a: osg.Vec3, b: osg.Vec3): number;
		length(): number;

		add(a: osg.Vec3, b: osg.Vec3, result: osg.Vec3): osg.Vec3;
		sub(a: osg.Vec3, b: osg.Vec3, result: osg.Vec3): osg.Vec3;		// note:  a - b = result
		mult(a: osg.Vec3, b: number, result: osg.Vec3): osg.Vec3;
		normalize(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
		neg(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
	}


	export var Vec4;
	export interface Vec4 {
		//createAndSet(x, y, z, w): osg.Vec4;
		fromValues(x, y, z, w): osg.Vec4;
	}

	/*
	export class Vec4 {
		constructor(x, y, z, w);
	}
	*/

	// Matrix is an object, not a class
	export var Matrix;
	export interface Matrix {
		create(): osg.Matrix;

		setTrans(m: osg.Matrix, x: number, y: number, z: number): osg.Matrix;
		getTrans(m: osg.Matrix, result: osg.Vec3): osg.Matrix;
		makeTranslate(x, y, z, matrix);

		getRotate(m: osg.Matrix, result: osg.Quat): osg.Quat;
		setRotateFromQuat(m: osg.Matrix, q: osg.Quat): osg.Matrix;

		makeOrtho(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number, result: osg.Matrix);

		makeScale(x, y, z, result?: osg.Matrix): osg.Matrix;
		preMultScale(m: osg.Matrix, scale: osg.Vec3): osg.Matrix;

		mult(a: osg.Matrix, b: osg.Matrix, result: osg.Matrix): osg.Matrix;				// arrrg,.. it is doing b * a (opposite of everything else)
		inverse(m: osg.Matrix, result: osg.Matrix): osg.Matrix;
		transformVec3(m: osg.Matrix, v: osg.Vec3, result: osg.Vec3): osg.Vec3;
	}

	export var Quat;
	export interface Quat {
		create(): osg.Quat;
		transformVec3(q: osg.Quat, a: osg.Vec3, result: osg.Vec3): osg.Vec3;
		makeRotateFromTo( from:osg.Vec3, to:osg.Vec3, out:osg.Quat) : osg.Quat;
	}


	export var Plane;
	export interface Plane extends osg.Vec4 {
		create(): osg.Vec4;
		//createAndSet(a, b, c, d): osg.Vec4;
		setNormal(plane: osg.Plane, n: osg.Vec3);
		setDistance(plane: osg.Plane, d: number);
	}

	/*
	export class Plane {
		//constructor(p:osg.Vec4);
		setNormal(plane: osg.Plane, n: osg.Vec3);
		setDistance(plane: osg.Plane, d: number);
	}
	*/

	export class BoundingBox {
		_min: Vec3;
		_max: Vec3;

		// Sets min to infinity and max to negative infinity
		init(): void;

		copy(bbox: BoundingBox): void;

		valid(): boolean;

		center(result: Vec3): Vec3;

		getMin(): Vec3;
		getMax(): Vec3;
		setMin(): Vec3;
		setMax(): Vec3;

		xMax(): number;
		yMax(): number;
		zMax(): number;
		xMin(): number;
		yMin(): number;
		zMin(): number;
	}

	export class StateAttribute {
	}

	export type RenderingHint = 'TRANSPARENT_BIN';
	export class StateSet {
		setAttributeAndModes(attribute: StateAttribute, mode?);
		setRenderingHint(hint: RenderingHint)
	}

	export class CullFace extends StateAttribute {
		static DISABLE: number;
		static FRONT: number;
		static BACK: number;
		static FRONT_AND_BACK: number;

		constructor( mode );
	}

	export type BlendFuncType =
		'DISABLE' |
		'ZERO' |
		'ONE' |
		'SRC_COLOR' |
		'ONE_MINUS_SRC_COLOR' |
		'SRC_ALPHA' |
		'ONE_MINUS_SRC_ALPHA' |
		'DST_ALPHA' |
		'ONE_MINUS_DST_ALPHA' |
		'SRC_ALPHA_SATURATE';

	export class BlendFunc extends StateAttribute {
		constructor(sourceRBG?: BlendFuncType, destinationRGB?: BlendFuncType, sourceAlpha?: BlendFuncType, destinationAlpha?: BlendFuncType)
		static DISABLE: number;
		static ZERO: number;
		static ONE: number;
		static SRC_COLOR: number;
		static ONE_MINUS_SRC_COLOR: number;
		static SRC_ALPHA: number;
		static ONE_MINUS_SRC_ALPHA: number;
		static DST_ALPHA: number;
		static ONE_MINUS_DST_ALPHA: number;
		static DST_COLOR: number;
		static ONE_MINUS_DST_COLOR: number;
		static SRC_ALPHA_SATURATE: number;
	}

	export enum PrimitiveSet {
		POINTS = 0,
		LINES = 1,
		LINE_LOOP = 2,
		LINE_STRIP = 3,
		TRIANGLES = 4,
		TRIANGLE_STRIP = 5,
		TRIANGLE_FAN = 6,
	}

	export class DrawElements {
		constructor(mode: PrimitiveSet, indices: number[]);
		mode: PrimitiveSet;
		count: number;
		offset: number;
		indices: BufferArray;
	}

	export class DrawArrays {
		constructor(mode, first, count);
	}

	export class BufferArray extends Array<number>{

		_elements: number[];

		static ELEMENT_ARRAY_BUFFER: number;
		static ARRAY_BUFFER:number;

		constructor(target, elements, itemSize, preserveArrayType?);
	}

	export class Utils {
	}


	export class Node extends PrototypeObject {
		children: osg.Node[];
		addChild(node: osg.Node);
		removeChildren();
		removeChild(node: osg.Node);

		getBoundingBox(): BoundingBox;

		getOrCreateStateSet(): StateSet;

        addUpdateCallback(cb) : boolean;

		dirtyBound();
		accept(NodeVisitor)
	}
	export type NodePath = Node[];
	export class NodeVisitor {

	}

	export class Transform extends Node {
		static RELATIVE_RF: number;
		static ABSOLUTE_RF: number;
	}

	export class Viewport {
		constructor(x: number, y: number, w: number, h: number);
	}

	export class CullSettings {
	}

	export class Material {
		setDiffuse(color: [number, number, number, number]);
		setAmbient(color: [number, number, number, number]);
		setSpecular(color: [number, number, number, number]);
		setEmission(color: [number, number, number, number]);
	}

	class PrototypeObject {
		getInstanceID();
		setName(name: string);
		getName(): string;
		setUserData(data: any);
		getUserData(): any;
	}

	export class Camera extends osg.Transform {		// typescript does not allow multiple class; missing osg.CullSettings
		static PRE_RENDER: number;
		static NESTED_RENDER: number;
		static POST_RENDER: number;

		addChild(node: osg.Node);
		setName(name: string);
		getProjectionMatrix(): osg.Matrix;
		setRenderOrder(order, orderNum: number);
		setReferenceFrame(value);
		setViewport(vp);
		attachTexture(bufferComponent, texture, textureTarget?);
		getViewMatrix() : osg.Matrix;
	}

	export class MatrixTransform extends Transform {
		getMatrix(): osg.Matrix;
		setMatrix(mat: osg.Matrix);
	}

	export class Texture {

		static createFromURL(url: string);

		setTextureSize(w: number, h: number);

		setMinFilter(value: number | string);

		setMagFilter(value: number | string);
	}

	export class FrameBufferObject {

		static COLOR_ATTACHMENT0;
		static DEPTH_ATTACHMENT;
		static DEPTH_COMPONENT16;
	}

	export interface AttributeSet {
		Vertex: BufferArray;
		Normal: BufferArray;
		[k: string]: BufferArray;
	}

	export class Geometry extends osg.Node {
		getAttributes(): AttributeSet;
		getPrimitives();
		dirty();
		setVertexAttribArray(attribute: string, array: BufferArray);
		getPrimitiveSetList(): DrawArrays[];
		getVertexAttributeList();

		primitives: DrawElements[];
	}

	// shapes
	export function createAxisGeometry(size:number) : osg.Geometry;
	export function createTexturedQuadGeometry(cornerx, cornery, cornerz, wx, wy, wz, hx, hy, hz, l?: number, b?: number, r?: number, t?: number): osg.Geometry;
	export function createGridGeometry(cx, cy, cz, wx, wy, wz, hx, hy, hz, res1, res2): osg.Geometry;
	export function createTexturedSphereGeometry(radius, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number): osg.Geometry;
	export function createTexturedSphere(radius, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number);
	//KdTree
	export interface KdTreeBuilderOptions {
		_numVerticesProcessed: number;
		_targetNumTrianglesPerLeaf: number;
		_maxNumLevels: number;
	}
	export class KdTreeBuilder {
		constructor(options: KdTreeBuilderOptions);
		apply(Node);
	}

	export class MatrixMemoryPool {
		reset(): void;
	}
	export function computeLocalToWorld(local: NodePath, bool: boolean, pool: MatrixMemoryPool): osg.Matrix;
}

declare module osgAnimation {

}

declare module osgDB {
	export function parseSceneGraph(node: {}, options?: {}): Promise<osg.Node>;
}

declare module osgGA {
	export class Manipulator {
		computeHomePosition();
	}
}

declare module osgShader {

}

declare module osgShadow {

}

declare module osgText {

}

declare module osgUtil {
	interface Hit {
		nodepath: osg.NodePath;
		point: osg.Vec3;
	}
	export class LineSegmentIntersector {
		set(top: osg.Vec2, bottom: osg.Vec3): void;
		getIntersections(): Hit[];
	}

	export class IntersectionVisitor extends osg.NodeVisitor {
		setIntersector(lsi: LineSegmentIntersector): void;
	}
}

declare module osgViewer {
  export class View {

		getCamera(): osg.Camera;  // this does not follow the original OpenSceneGraph inheritance diagram ( the getCamera should be in the osg.View but that does not exist in osgjs )
	}

	export class Viewer extends osgViewer.View {
		_useVR: boolean;
		_requestID: number;
		_hmd: any;
		_eventProxy: any;

		constructor(canvas: HTMLElement);

		init();
		// Essentially stops the rendering
		contextLost(): void;

		setSceneData(node: osg.Node);

		setupManipulator();

		getManipulator();

		getGraphicContext();

		done() : boolean;
		frame();
		run();
	}
}

declare module osgWrappers {

}