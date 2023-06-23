import { environment as e } from '../../environments/environment';

export const BACKEND_URL = `${e.http}://${e.be_host}:${e.be_port}`;
export const GRAPHQL_URL = `${BACKEND_URL}/graphql`;
export const API_URL = `${BACKEND_URL}/${e.api_prefix}`;
console.log('urls', BACKEND_URL, GRAPHQL_URL, API_URL);

export const SITE_URL = 'sites';
export const DATASET_URL = 'datasets';
export const ANNOTATIONS_URL = 'annotations';
export const RESOURCE_RUL = 'resources';

export const getApiUrl = () => API_URL;

export const getFullUrl = (relativeURL) => `${API_URL}/${relativeURL}`.replace(/[^:](\/{2,})/, (match, p1) => {
  return '/';
});