import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map, take } from 'rxjs/operators';

import * as Users from './actions/actions';
import * as fromAuth from './reducers/reducer';
import { UsersState } from './state';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private store: Store<UsersState>) {}

  canActivate(): Observable<boolean> {
    return this.store
      .select(fromAuth.getLoggedIn)
      .map(isAuthenticated => {
        if (!isAuthenticated) {
          this.store.dispatch(new Users.SignInRedirect({}));
          return false;
        }

        return true;
      });
  }
}