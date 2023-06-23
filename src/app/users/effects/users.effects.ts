import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { Router } from '@angular/router';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';

import {
  UsersActionsType,
  GetUsersSuccess, GetUsers,
  SignIn, SignInSuccess, SignInError,
  SignUp, SignUpSuccess, SignUpError,
  SetCurrentUser,
} from '../actions/actions';
import { UsersService } from '../users.service';

@Injectable()
export class UsersEffects {
  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private router: Router,
  ) { }

  @Effect()
  getUsers$ = this.actions$
    .ofType(UsersActionsType.GET_USERS)
    .map((action: GetUsers) => action.payload)
    .mergeMap(action => this.usersService.getUsers().map(users => new GetUsersSuccess(users)));

  @Effect()
  signIn$ = this.actions$
    .ofType(UsersActionsType.SIGN_IN)
    .map((action: SignIn) => action.payload)
    .switchMap((payload) => this.usersService.signIn(payload)
      .map(user => new SignInSuccess(user))
      .catch(err => of(new SignInError(err)))
    );

  @Effect({ dispatch: false })
  signInSuccess$ = this.actions$
    .ofType(UsersActionsType.SIGN_IN_SUCCESS)
    .map(() => this.router.navigate(['/']));

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$
    .ofType(UsersActionsType.SIGN_IN_REDIRECT, UsersActionsType.LOGOUT)
    .map(() => this.router.navigate(['/sign-in']));

  @Effect()
  signUp$ = this.actions$
    .ofType(UsersActionsType.SIGN_UP)
    .map((action: SignUp) => action.payload)
    .switchMap((payload) => this.usersService.signUp(payload)
      .map(user => new SignUpSuccess(user))
      .catch(err => of(new SignUpError(err)))
    );

  @Effect({ dispatch: false })
  signUpSuccess$ = this.actions$
    .ofType(UsersActionsType.SIGN_UP_SUCCESS)
    .map(() => this.router.navigate(['/']));

}