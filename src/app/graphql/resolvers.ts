import { API_URL, getFullUrl } from '../util/getApiUrl';

import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators/tap';

export function getResolvers(client: HttpClient) {
  return {
    hello: () => 'helloworld',
    annotations: () => getAsJson('annotations/'),
    annotation: (root, { id }) => getAsJson(`annotations/${id}/`),
    datasets: () => getAsJson('datasets/'),
    dataset: (root, { id }) => getAsJson(`datasets/${id}/`),
    resources: () => getAsJson('resources/'),
    resource: (root, { id }) => getAsJson(`resources/${id}/`),
    sites: () => getAsJson('sites/'),
    site: (root, { id }) => getAsJson(`sites/${id}/`),
  };

  function getAsJson(relativeURL: string) {
    const fullURL = getFullUrl(relativeURL);
    console.log('fetching', fullURL);
    return client.get(fullURL).toPromise().then(data => {
      console.log('data', data);
      return data;
    }, console.error);
  }
}