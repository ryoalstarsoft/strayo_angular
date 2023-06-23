import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { graphql, buildSchema } from 'graphql';
import { print } from 'graphql/language/printer';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { ApolloLink, from, Observable } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';

// import { InMemoryDataService } from '../mocks/inMemoryData.service';

import { makeExecutableSchema } from 'graphql-tools';

import { schema } from './schema';
import { getResolvers } from './resolvers';
import { API_URL, BACKEND_URL, GRAPHQL_URL } from '../util/getApiUrl';

@NgModule({
  imports: [
    HttpClientModule,
    // HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService),
  ],
  exports: [
    ApolloModule,
    HttpLinkModule,
  ]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {
    apollo.create({
      link: httpLink.create({ uri: GRAPHQL_URL }),
      cache: new InMemoryCache()
    });
  }
}

// /**
//  * Use when you need to mock with in memory database
//  *
//  * @export
//  * @class GraphQLMockModule
//  */
// @NgModule({
//   imports: [
//     HttpClientModule,
//     // HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService),
//   ],
//   exports: [
//     ApolloModule,
//     HttpLinkModule,
//   ]
// })
// export class GraphQLMockModule {
//   constructor(apollo: Apollo, httpLink: HttpLink, http: HttpClient) {
//     const uri = API_URL;
//     // const resolvers = getResolvers(http);
//     const restMiddleware = new ApolloLink((operation, forward) => {
//       const { operationName, query, variables = {} } = operation;
//       // console.log('operation', operation, print(query));
//       return new Observable(observer => {
//         graphql(schema, print(query), null, { client: http }, variables, operationName )
//         // graphql(schema, '{ sites { id name } }', null, null, variables, operationName)
//         .then(data => {
//           console.log('got data', data);
//           observer.next(data);
//           observer.complete();
//         },
//           console.error,
//         )
//         .catch((err) => {
//           console.error(err);
//           observer.error(err);
//         });
//       });
//     });
//     apollo.create({
//       link: restMiddleware,
//       cache: new InMemoryCache(),
//     });
//   }
// }