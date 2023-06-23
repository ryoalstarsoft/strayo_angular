import { GraphQLSchema } from 'graphql';
import { QueryType } from './queryType';

export const typeDefs = `
type Site {
    id: ID!
    name: String!
    datasets: [String]!
}

type Dataset {
    id: ID!
    name: String!
    created_at: String!
    annotations: [Annotation]!
}

type Annotation {
    id: ID!
    is_phantom: Boolean
    meta: String
    data: String
    resources: [Resource]!
    type: String!
}

type Resource {
    id: ID!
    url: String!
    meta: String
    type: String
}

type Query {
    hello: String
    annotations: [Annotation]
    annotation(id: ID!): Annotation
    datasets: [Dataset]
    dataset(id: ID!): Dataset
    resources: [Resource]
    resource(id: ID!): Resource,
    sites: [Site],
    site(id: ID!): Site,
}
`;

export const schema = new GraphQLSchema({
  query: QueryType,
});