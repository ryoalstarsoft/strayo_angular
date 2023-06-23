import { InMemoryDbService } from 'angular-in-memory-web-api';

import * as moment from 'moment';

import projectList from './projectlist';

import { getFullUrl } from '../util/getApiUrl';
import { Status } from '../util/status';


export class InMemoryDataService implements InMemoryDbService {
    constructor() {}
    createDb() {
        const idNameArr = projectList.split(/[\n|]/);
        // console.log('idNameArr', idNameArr);
        const idNamePairs = [];
        for (let i = 0; i < idNameArr.length; i += 2) {
            idNamePairs.push([idNameArr[i], idNameArr[i + 1]]);
        }
        // console.log('idNamePairs', idNamePairs);
        const idNameMap: Object = idNamePairs.reduce((acc, pair) => {
            acc[+pair[0]] = pair[1].trim();
            return acc;
        }, {});
        // console.log('idNameMap', idNameMap);
        const oldCastleDatasetIds = Object.keys(idNameMap).map(Number);
        oldCastleDatasetIds.unshift(1111);
        console.log('ids', oldCastleDatasetIds);
        const chicoDatasetIds = [
            6, 7, 8, 9
        ];

        const siteIds = [
            1, 2
        ];

        // Every dataset gets two annotations, one for phantom, one for ortho one for stereo
        const annotationsPerDataSet = 3;

        // Every annotation has up to 20 resources (safe number)
        const resourcesPerDataSet = 20;

        const sites = siteIds.map((id, i) => {
            let name;
            let datasets;
            let location;
            let status;
            let created_at;
            switch (i) {
                case 1:
                    name = 'Chico Muckpile';
                    datasets = chicoDatasetIds;
                    location = 'Texas';
                    status = 'Processing';
                    created_at = moment('20170101', 'YYYYMMDD').toISOString();
                    break;
                default:
                    name = 'Old Castle';
                    location = 'USA';
                    status = 'Completed';
                    created_at = moment('20170201', 'YYYYMMDD').toISOString();
                    datasets = oldCastleDatasetIds;
            }
            return {
                created_at,
                id,
                name,
                location,
                status,
                datasets: datasets.map(i => getFullUrl(`datasets/${i}`)),
            };
        });

        const datasets = [...oldCastleDatasetIds, ...chicoDatasetIds].map((id, i) => {
            let long;
            let lat;
            let site;
            let name;
            const fromOldCastle = oldCastleDatasetIds.indexOf(id);
            const fromChico = chicoDatasetIds.indexOf(id);
            if (fromOldCastle !== -1) {
                site = sites[0];
                long = -98.24911215720812;
                lat = 30.637198979781587;
                name = idNameMap[id];
            } else {
                site = sites[1];
                long = -97.82245148335487;
                lat = 33.27900215766894;
                name = `${site.name} ${fromOldCastle + fromChico + 1}`;
            }
            const created_at = moment(site.created_at).add(i, 'days').toISOString();
            const status = 'Completed';
            const is_phantom = (fromOldCastle === 0 || fromChico === 0);
            // Two annotations, one for orthophoto, one for stereoscope
            const urls = (new Array(annotationsPerDataSet)).fill(1).map((_, index) => {
                return getFullUrl(`annotations/${id * annotationsPerDataSet + index}`);
            });
            return {
                annotations: urls,
                created_at,
                id,
                is_phantom,
                lat,
                long,
                name,
                status,
                updated_at: created_at,
            };
        });
        const resources = [];
        const annotations = [].concat(...datasets.map((dataset) => {
            return (new Array(annotationsPerDataSet)).fill(1).map((_, index) => {
                let type;
                let is_phantom = true;
                let meta;
                let data;
                const urls = [];
                const id = dataset.id * annotationsPerDataSet + index;
                let resourceID;
                switch (id % annotationsPerDataSet) {
                    default:
                        type = 'mapdata';
                        is_phantom = false;
                        meta = '{}';
                        data = '{}';
                        const mapdataResource: any = {
                            type: 'mapdata',
                            status: Status.COMPLETED,
                            url: `https://s3aws.blob.core.windows.net/output/buckley/output/${dataset.id}/orthophoto/tiles/mapdata.json`
                        };
                        resourceID = resources.push(mapdataResource);
                        mapdataResource.id = resourceID - 1;
                        urls.push(getFullUrl(`/resources/${resourceID - 1}`));

                        break;
                    case 1:
                        type = 'orthophoto';
                        meta = '{}';
                        data = '{}';
                        const tilesResource: any = {
                            type: 'tiles',
                            status: Status.COMPLETED,
                            url: `https://s3aws.blob.core.windows.net/output/buckley/output/${dataset.id}/orthophoto/tiles/{z}/{x}/{-y}.png`
                        };
                        resourceID = resources.push(tilesResource);
                        tilesResource.id = resourceID - 1;
                        urls.push(getFullUrl(`/resources/${resourceID - 1}`));

                        break;
                    case 2:
                        type = 'stereoscope';
                        meta = '{}';
                        data = '{}';
                        const mtljsResource: any = {
                            type: 'mtljs',
                            status: Status.COMPLETED,
                            url: `https://s3aws.blob.core.windows.net/output/buckley/output/${dataset.id}/textured/100/_mtljs`
                        };
                        resourceID = resources.push(mtljsResource);
                        mtljsResource.id = resourceID - 1;
                        urls.push(getFullUrl(`/resources/${resourceID - 1}`));
                        const smdjsResource: any = {
                            type: 'smdjs',
                            status: Status.COMPLETED,
                            url: `https://s3aws.blob.core.windows.net/output/buckley/output/${dataset.id}/textured/100/_smdjs`
                        };
                        resourceID = resources.push(smdjsResource);
                        smdjsResource.id = resourceID - 1;
                        urls.push(getFullUrl(`/resources/${resourceID - 1}`));
                }
                return {
                    id,
                    data,
                    is_phantom,
                    meta,
                    resources: urls,
                    type,
                };
            });
        }));
        const toReturn =  {
            sites,
            datasets,
            annotations,
            resources,
        };
        console.log('database', toReturn);
        return toReturn;
    }
};
