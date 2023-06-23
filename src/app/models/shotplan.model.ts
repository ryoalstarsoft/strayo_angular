import * as ol from 'openlayers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import uuid from 'uuid/v4';
import calculateAzimuth from 'azimuth';
import { TerrainProvider } from './terrainProvider.model';
import { Annotation, IAnnotation } from './annotation.model';
import { listenOn } from '../util/listenOn';
import { vectorProjection, scalarProjection, vectorRejection } from '../util/osgjsUtil/index';
import { WebMercator, LonLat } from '../util/projections/index';

export class ShotplanRowFeature extends ol.Feature {
    static SHOTPLAN_TYPE = 'shotplan_row_feature';
    private holesSource = new BehaviorSubject<ShotplanHole[]>(null);
    public holes$ = this.holesSource.asObservable();

    constructor(props) {
        super(props);
        this.setId(this.getId() || uuid());
        listenOn(this.getGeometry(), 'change', (evt) => {
            const geometries: Array<ShotplanHole | ShotplanRow> = (this.getGeometry() as ol.geom.GeometryCollection).getGeometries() as any;
            console.log('geometries changed', evt, geometries);
            if (!geometries) {
                console.warn('no geometries');
                return;
            }
            const holeGeometries: ShotplanHole[] = geometries.filter((g) => g.shotplanType() === ShotplanHole.SHOTPLAN_TYPE) as any;
            holeGeometries.sort((a, b) => {
                const [aAlong, aAway] = a.alongAway(this.getRow());
                const [bAlong, bAway] = b.alongAway(this.getRow());
                return aAlong - bAlong;
            });
            this.holesSource.next(holeGeometries);
        });
    }

    public rowUpdate$(): Observable<ShotplanRow> {
        return this.getRow().update$;
    }

    public addHole(hole: ol.Coordinate, toe?: ol.Coordinate) {
        toe = toe || ([...hole] as ol.Coordinate);
        const points = [hole, toe];
        points.forEach((p) => {
            if (!p[2]) {
                const worldPoint = this.terrainProvider().getWorldPoint(p);
                if (!worldPoint[2]) console.warn('point has NaN depth');
                p[2] = worldPoint[2];
            }
        });
        const shotplanHole = new ShotplanHole([hole, toe]);
        shotplanHole.terrainProvider(this.terrainProvider());
        const col = this.getGeometry() as ol.geom.GeometryCollection;
        col.setGeometries([...col.getGeometries(), shotplanHole]);
    }

    public getRow(): ShotplanRow {
        const col = this.getGeometry() as ol.geom.GeometryCollection;
        return col.getGeometries().find((g: ShotplanRow | ShotplanHole) => {
            console.log('g', g.getProperties());
            return g.shotplanType() === ShotplanRow.SHOTPLAN_TYPE;
        }) as ShotplanRow;
    }

    public terrainProvider(): TerrainProvider;
    public terrainProvider(terrainProvider: TerrainProvider): this;
    public terrainProvider(terrainProvider?: TerrainProvider): TerrainProvider | this {
        if (terrainProvider !== undefined) {
            this.set('terrain_provider', terrainProvider);
            const dataset = terrainProvider.dataset();
            this.set('color', dataset.color());
            console.log('set color', this.get('color'));
            return this;
        }
        return this.get('terrain_provider');
    }
}

export class ShotplanRow extends ol.geom.LineString {
    static SHOTPLAN_TYPE = 'shotplan_row';
    private updateSource = new BehaviorSubject<ShotplanRow>(this);
    public update$ = this.updateSource.asObservable();

    private azimuthSource = new BehaviorSubject<number>(0);
    public azimuth$ = this.azimuthSource.asObservable();

    constructor(coordinates: [ol.Coordinate, ol.Coordinate], layout: ol.geom.GeometryLayout = 'XYZ') {
        super(coordinates, layout);
        this.shotplanType(ShotplanRow.SHOTPLAN_TYPE);
        this.id(this.id() || uuid());
        console.log('coords', this.getCoordinates());
        this.recalculate();
        listenOn(this, 'change', () => {
            console.log('changing row', this.id());
            this.updateSource.next(this);
            this.recalculate();
        });
        this.updateSource.next(this);
    }

    public id(): string;
    public id(id: string): this;
    public id(id?: string): string | this {
        if (id !== undefined) {
            this.set('id', id);
            return this;
        }
        return this.get('id');
    }

    public shotplanType(): string;
    public shotplanType(shotplanType: string): this;
    public shotplanType(shotplanType?: string): string | this {
        if (shotplanType !== undefined) {
            this.set('shotplan_type', shotplanType);
            return this;
        }
        return this.get('shotplan_type');
    }

    public terrainProvider(): TerrainProvider;
    public terrainProvider(terrainProvider: TerrainProvider): this;
    public terrainProvider(terrainProvider?: TerrainProvider): TerrainProvider | this {
        if (terrainProvider !== undefined) {
            this.set('terrain_provider', terrainProvider);
            return this;
        }
        return this.get('terrain_provider');
    }
    /**
     * Required by openlayers https://github.com/openlayers/openlayers/blob/v4.6.4/src/ol/geom/multipoint.js
     *
     * @returns {ShotplanRow}
     * @memberof ShotplanRow
     */
    public clone(): ShotplanRow {
        const layout = this.getLayout();
        const clone = new ShotplanRow([this.getFirstCoordinate(), this.getLastCoordinate()], layout)
            .id(this.id())
            .terrainProvider(this.terrainProvider());
        return clone;
    }

    public recalculate() {
        // Calculate azimuth;
        const points = this.getCoordinates().map((c) => {
            const longLat = ol.proj.transform(c, WebMercator, LonLat);
            const toReturn = [longLat[0], longLat[1], c[2]];
            console.log('toReturn', toReturn);
            return toReturn;
        });
        const newAzimuth = calculateAzimuth.azimuth(
            {
                long: points[0][0],
                lat: points[0][1],
                elv: points[0][2],
            },
            {
                long: points[0][0],
                lat: points[0][1],
                elv: points[0][2],
            }
        );
        this.azimuthSource.next(newAzimuth.azimuth);
    }
}

export class ShotplanHole extends ol.geom.MultiPoint {
    static SHOTPLAN_TYPE = 'shotplan_hole';
    private updateSource = new BehaviorSubject<ShotplanHole>(null);
    public update = this.updateSource.asObservable();
    constructor(coordinates: [ol.Coordinate, ol.Coordinate], layout: ol.geom.GeometryLayout = 'XYZ') {
        super(coordinates, layout);
        this.shotplanType(ShotplanHole.SHOTPLAN_TYPE);
        this.id(this.id() || uuid());
        listenOn(this, 'change', () => {
            console.log('changing hole', this.id());
            this.updateSource.next(this);
        });
        this.updateSource.next(this);
    }

    public id(): string;
    public id(id: string): this;
    public id(id?: string): string | this {
        if (id !== undefined) {
            this.set('id', id);
            return this;
        }
        return this.get('id');
    }

    public shotplanType(): string;
    public shotplanType(shotplanType: string): this;
    public shotplanType(shotplanType?: string): string | this {
        if (shotplanType !== undefined) {
            this.set('shotplan_type', shotplanType);
            return this;
        }
        return this.get('shotplan_type');
    }

    public terrainProvider(): TerrainProvider;
    public terrainProvider(terrainProvider: TerrainProvider): this;
    public terrainProvider(terrainProvider?: TerrainProvider): TerrainProvider | this {
        if (terrainProvider !== undefined) {
            this.set('terrain_provider', terrainProvider);
            return this;
        }
        return this.get('terrain_provider');
    }
    // Actual functions

    public alongAway(row: ShotplanRow): [number, number] {
        const rowVec = osg.Vec2.sub(row.getLastCoordinate(), row.getFirstCoordinate(), []);
        const holeVec = osg.Vec2.sub(this.getHoleCoord(), row.getFirstCoordinate(), []);

        const alongVec = vectorProjection(holeVec, rowVec);
        const awayVec = vectorRejection(holeVec, rowVec);

        const alongGeom = new ol.geom.LineString([
            row.getFirstCoordinate(),
            osg.Vec2.add(row.getFirstCoordinate(), alongVec, []),
        ]);

        const awayGeom = new ol.geom.LineString([
            row.getFirstCoordinate(),
            osg.Vec2.add(row.getFirstCoordinate(), awayVec, []),
        ]);

        return [alongGeom.getLength(), awayGeom.getLength()];
    }

    public clone() {
        const clone = new ShotplanHole([this.getHoleCoord(), this.getToeCoord()], this.getLayout())
            .id(this.id())
            .terrainProvider(this.terrainProvider());
        return clone;
    }

    public getHoleCoord(): ol.Coordinate {
        return this.getFirstCoordinate();
    }

    public getToeCoord(): ol.Coordinate {
        return this.getLastCoordinate();
    }
}

export interface IShotplan extends IAnnotation {
    terrain_provider: TerrainProvider;
}

export class Shotplan extends Annotation {
    static ANNOTATION_TYPE = 'shotplan';
    private rowsSource = new BehaviorSubject<ShotplanRowFeature[]>(null);
    public rows$ = this.rowsSource.asObservable();

    private offData: Function;
    static fromABLine(terrainProvider: TerrainProvider, points: [ol.Coordinate, ol.Coordinate]): Shotplan {
        const shotplan = new Shotplan({
            created_at: new Date(),
            data: new ol.Collection([]),
            id: 0,
            meta: {},
            resources: [],
            type: Shotplan.ANNOTATION_TYPE,
            updated_at: new Date(),
            terrain_provider: terrainProvider,
        });

        const row = shotplan.addRow(points);
        row.addHole(points[0]);
        return shotplan;
    }

    constructor(props: IShotplan) {
        super(props);
    }

    public data(): ol.Collection<ShotplanRowFeature>;
    public data(data: string | ol.Collection<ol.Feature>): this;
    public data(data?: string | ol.Collection<ol.Feature>): ol.Collection<ShotplanRowFeature> | this {
        if (data !== undefined) {
            if (data === 'string') {
                data = new ol.Collection((new ol.format.GeoJSON()).readFeatures(data as string));
            }
            this.init();
            return this;
        }
        return this.get('data');
    }

    public terrainProvider(): TerrainProvider;
    public terrainProvider(terrainProvider: TerrainProvider): this;
    public terrainProvider(terrainProvider?: TerrainProvider): TerrainProvider | this {
        if (terrainProvider !== undefined) {
            // TODO: Propegate to rows and holes
            this.set('terrain_provider', terrainProvider);
            return this;
        }
        return this.get('terrain_provider');
    }

    private init() {
        // Convert geojson to shotplan specific versions
        const terrainProvider = this.terrainProvider();
        const rowFeatures = this.data().getArray().map((feature) => {
            const geometries = feature.getGeometry() as ol.geom.GeometryCollection;
            const transformedGeometries: Array<ShotplanHole | ShotplanRow> =
                geometries.getGeometries().map((geom: ShotplanHole | ShotplanRow) => {
                    const [p1, p2] = geom.getCoordinates().map((p) => {
                        if (!p[2]) {
                            const worldPoint = terrainProvider.getWorldPoint(p);
                            if (!worldPoint[2]) console.warn('point has NaN elevation');
                            p[2] = worldPoint[2];
                        }
                        return p;
                    });
                    if (geom.getType() === 'LineString') {
                        return new ShotplanRow([p1, p2])
                            .terrainProvider(this.terrainProvider());
                    } else if (geom.getType() === 'MultiPoint') {
                        return new ShotplanHole([p1, p2])
                            .terrainProvider(this.terrainProvider());
                    } else {
                        console.warn('Unexpected geometry in shotplan', geom.getProperties());
                    }
                });

            const rowFeature = new ShotplanRowFeature({
                ...feature.getProperties(),
                geometry: new ol.geom.GeometryCollection([])
            }).terrainProvider(this.terrainProvider());
            // Do this here to invoke event listenr
            console.log('transformed', transformedGeometries);
            (rowFeature.getGeometry() as ol.geom.GeometryCollection).setGeometries(transformedGeometries);
            return rowFeature;
        });

        this.set('data', new ol.Collection<ShotplanRowFeature>(rowFeatures));
        console.log('Setting rows', rowFeatures);
        this.rowsSource.next(this.data().getArray());
        // Listen for the rest
        if (this.offData) this.offData();
        this.offData = listenOn(this.data(), 'change:length', () => {
            this.rowsSource.next(this.data().getArray());
        });
    }

    public addRow(points: [ol.Coordinate, ol.Coordinate]): ShotplanRowFeature {
        const terrainProvider = this.terrainProvider();
        points.forEach((p) => {
            if (!p[2]) {
                const worldPoint = terrainProvider.getWorldPoint(p);
                if (!worldPoint[2]) console.warn('point has NaN elevation');
                p[2] = worldPoint[2];
            }
        });
        console.log('points', points);
        const rowGeom = new ShotplanRow(points);
        const rowFeature = new ShotplanRowFeature({
            geometry: new ol.geom.GeometryCollection([
                rowGeom
            ])
        });
        rowGeom.terrainProvider(terrainProvider);

        const data = this.data();
        data.push(rowFeature);
        return rowFeature;
    }
}