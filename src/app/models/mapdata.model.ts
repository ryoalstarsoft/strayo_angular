import * as ol from 'openlayers';
export interface MapData {
    BoundingBox: ol.Extent; // in LatLong
    Center: ol.Coordinate; // In Custom projection
    ODMCenter: ol.Coordinate; // In Custom projection
    Projection: ol.ProjectionLike;
    ZoomLevels: number[];
}