export type AnnotationToolType = 'Polygon' | 'LineString' | 'Selection' | 'Height';


export const ToolToType = {
    LineString: 'LineString',
    Polygon: 'Polygon',
};

export const ToolToThumbnail = {
    LineString: 'horizontalLength',
    Polygon: 'polygon',
};