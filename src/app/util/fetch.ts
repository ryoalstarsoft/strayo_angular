import { API_URL, getFullUrl } from './getApiUrl';

export function fetchResponseByURL(relativeURL): Promise<Response> {
  // Replace double //
  const fullURL = getFullUrl(relativeURL);
  return fetch(fullURL);
}

export function fetchResponseByURLAsJSON(relativeURL): Promise<any> {
  return fetchResponseByURL(relativeURL).then(r => r.json());
}