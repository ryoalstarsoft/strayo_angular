import {
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLFloat,
} from 'graphql';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { getFullUrl } from '../util/getApiUrl';

export const SiteType = new GraphQLObjectType({
  name: 'Site',
  description: 'A site contains many datasets',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt)},
    name: { type: GraphQLString},
    location: { type: GraphQLString},
    created_at: { type: GraphQLString},
    status: { type: GraphQLString},
    datasets: {
      type: new GraphQLList(DatasetType),
      resolve: (site, args, context) => {
        // console.log('site', site);
        return Promise.all(site.datasets.map(url => context.client.get(url).toPromise()));
      },
    },
  }),
});

export const DatasetType = new GraphQLObjectType({
  name: 'Dataset',
  description: 'A Dataset has many annotations',
  fields: () => ({
    annotations: {
      type: new GraphQLList(AnnotationType),
      resolve: (dataset, args, context) => {
        console.log('fetching dataset', dataset);
        return Observable.forkJoin(...dataset.annotations.map(url => context.client.get(url)))
          .toPromise()
          .catch(err => console.log('my error', err));
      },
    },
    created_at: { type: GraphQLString },
    id: { type: new GraphQLNonNull(GraphQLInt) },
    is_phantom: { type: GraphQLBoolean },
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    long: { type: new GraphQLNonNull(GraphQLFloat) },
    name: { type: GraphQLString },
    status: { type: GraphQLString },
    updated_at: { type: GraphQLString },
  }),
});

export const AnnotationType = new GraphQLObjectType({
  name: 'Annotation',
  description: 'An Annotation has many resources and a geojson',
  fields: () => ({
    id: { type: GraphQLString },
    is_phantom: { type: GraphQLBoolean },
    type: { type: GraphQLString },
    meta: { type: GraphQLString },
    data: { type: GraphQLString },
    resources: {
      type: new GraphQLList(ResourceType),
      resolve: (anno, args, context) => Observable.forkJoin(...anno.resources.map(url => context.client.get(url)))
        .toPromise()
        .catch(err => console.log('my error', err)),
    },
  }),
});

export const ResourceType = new GraphQLObjectType({
  name: 'Resource',
  description: 'An Resource is the location to some resource',
  fields: () => ({
    id: { type: GraphQLString },
    type: { type: GraphQLString },
    url: { type: GraphQLString},
    status: { type: GraphQLString },
  }),
});

export const QueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'The root of all... queries',
  fields: () => ({
    sites: {
      type: new GraphQLList(SiteType),
      resolve: (root, args, context) => context.client.get(getFullUrl('sites/')).toPromise(),
    },
    site: {
      type: SiteType,
      args: {
        id: { type: GraphQLString},
      },
      resolve: (root, args, context) => context.client.get(getFullUrl(`sites/${args.id}/`)).toPromise(),
    },
    dataset: {
      type: DatasetType,
      args: {
        id: { type: GraphQLString},
      },
      resolve: (root, args, context) => context.client.get(getFullUrl(`datasets/${args.id}/`)).toPromise(),
    },
    annotation: {
      type: AnnotationType,
      args: {
        id: { type: GraphQLString},
      },
      resolve: (root, args, context) => context.client.get(getFullUrl(`annotations/${args.id}/`)).toPromise(),
    },
    resource: {
      type: ResourceType,
      args: {
        id: { type: GraphQLString},
      },
      resolve: (root, args, context) => context.client.get(getFullUrl(`resources/${args.id}/`)).toPromise(),
    },
  }),
});