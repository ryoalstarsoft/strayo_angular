import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule, ActionReducer, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import { reducers } from './reducers/index';
import { AuthGuard } from './users/auth-guard.service';

import { SiteslayoutComponent } from './components/siteslayout/siteslayout.component';
import { SiteLayoutComponent } from './components/sitelayout/sitelayout.component';
import { DatasetLayoutComponent } from './components/dataset-layout/dataset-layout.component';

import { SigninSignupLayoutComponent } from './components/signin-signup-layout/signin-signup-layout.component';

export const localStorageSyncReducer = (reducer: ActionReducer<any>): ActionReducer<any> =>
  localStorageSync({
    keys: ['users'],
    rehydrate: true,
  })(reducer);
const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sites',
    pathMatch: 'full',
  },
  {
    path: 'sites',
    component: SiteslayoutComponent,
    data: { title: 'Sites' },
    canActivate: [AuthGuard],
  },
  {
    path: 'sites/:id',
    component: SiteLayoutComponent,
    data: { title: 'Site' },
    canActivate: [AuthGuard],
  },
  {
    path: 'sites/:site_id/datasets/:dataset_id',
    component: DatasetLayoutComponent,
    data: { title: 'Dataset' },
    canActivate: [AuthGuard],
  },
  {
    path: 'sign-in',
    component: SigninSignupLayoutComponent,
    data: { title: 'Login' },
  },
  {
    path: 'sign-up',
    component: SigninSignupLayoutComponent,
    data: { title: 'Sign Up' },
  },
];

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }