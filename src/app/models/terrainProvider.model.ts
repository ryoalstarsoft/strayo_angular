import * as ol from 'openlayers';
import proj4 from 'proj4';
import { Dataset } from './dataset.model';
import { WebMercator } from '../util/projections/index';
import { transformMat4 } from '../util/osgjsUtil';


export class TerrainProvider extends ol.Object {
    private reserveMatrixStack;
    constructor(props?: {}) {
        super(props);
        this.rootNode(new osg.Node());
    }

    public dataset(): Dataset;
    public dataset(dataset: Dataset): this;
    public dataset(dataset?: Dataset): Dataset | this {
        if (dataset !== undefined) {
            this.set('dataset', dataset);
            const mapData = this.dataset().mapData();
            return this;
        }
        return this.get('dataset');

    }

    public modelNode(): osg.Node;
    public modelNode(modelNode: osg.Node): this;
    public modelNode(modelNode?: osg.Node): osg.Node | this {
        if (modelNode !== undefined) {
            const current = this.modelNode();
            if (current) {
                this.rootNode().removeChild(current);
            }
            this.rootNode().addChild(modelNode);
            this.set('model_node', modelNode);
            return this;
        }
        return this.get('model_node');
    }

    public quality(): number;
    public quality(quality: number): this;
    public quality(quality?: number): number | this {
        if (quality !== undefined) {
            this.set('quality', quality);
            return this;
        }
        return this.get('quality');
    }

    public rootNode(): osg.Node;
    public rootNode(rootNode: osg.Node): this;
    public rootNode(rootNode?: osg.Node): osg.Node | this {
        if (rootNode !== undefined) {
            this.set('root_node', rootNode);
            return this;
        }
        return this.get('root_node');
    }

    /**
     * Converts a coordinate to model position.
     * Assumes WebMercator (openlayer defaults to it) if no projection given
     * If null is given, assumes coordinates are in local coordinates
     *
     * @param {ol.Coordinate} point
     * @param {ol.ProjectionLike} [proj]
     * @returns {ol.Coordinate}
     * @memberof TerrainProvider
     */
    public getWorldPoint(point: ol.Coordinate, proj: ol.ProjectionLike = WebMercator): ol.Coordinate {
        const xy = (proj !== null) ? ol.proj.transform(point, proj, this.dataset().projection()) : point;
        const bounds = this.rootNode().getBoundingBox();
        const min = bounds.getMin();
        const max = bounds.getMax();
        const top = max[2];
        const bottom = min[2];
        const v1 = osg.Vec3.createAndSet(...xy, top);
        const v2 = osg.Vec3.createAndSet(...xy, bottom);

        const lsi = new osgUtil.LineSegmentIntersector();
        const iv = new osgUtil.IntersectionVisitor();
        lsi.set(v1, v2);
        iv.setIntersector(lsi);
        this.rootNode().accept(iv);

        const hits = lsi.getIntersections();
        if (hits.length === 0) return null;

        const hit = hits[0];
        const worldPoint = osg.Vec3.create();
        if (!this.reserveMatrixStack) {
            this.reserveMatrixStack = new osg.MatrixMemoryPool();
        }
        this.reserveMatrixStack.reset();
        transformMat4(worldPoint, hit.point, osg.computeLocalToWorld(hit.nodepath.slice(0), true, this.reserveMatrixStack.get()));
        // For OSGJS only. Switch y and z positions negate height.
        return [hit.point[0], hit.point[2], -hit.point[1]];
    }

    /**
     * Returns the node that contains all child nodes that make up provider
     * EX.
     * Node
     *  -> _0
     *      -> geometry
     *  -> _1
     *      -> geometry
     *  ...
     *
     * @returns
     * @memberof TerrainProvider
     */
    public getGeometries(): osg.Node {
        // Technically cheating but who cares?
        return this.modelNode().children[0].children[0].children[0];
    }
}