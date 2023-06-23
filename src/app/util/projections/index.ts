import proj4 from 'proj4';
import * as ol from 'openlayers';
import './nad27defs';

export const WebMercator = ol.proj.get('EPSG:3857');
export const LonLat = ol.proj.get('EPSG:4326');

export async function loadProjections() {
    // Utm
    for (let x = 1; x <= 60; x += 1)    {
        proj4.defs(`EPSG:${32600 + x}`, `+proj=utm +zone=${x} +datum=WGS84 +units=m +no_defs`);
        proj4.defs(`WGS84 UTM ${x}N`, `+proj=utm +zone=${x} +datum=WGS84 +units=m +no_defs`);
        proj4.defs(`EPSG:${32700 + x}`, `+proj=utm +zone=${x} +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs`);
        proj4.defs(`WGS84 UTM ${x}S`, `+proj=utm +zone=${x} +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs`);
        ol.proj.setProj4(proj4);
    }
}
