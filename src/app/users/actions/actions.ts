import { Action } from '@ngrx/store';

import { User } from '../../models/user.model';

export enum UsersActionsType {
  GET_USERS = '[User] Get',
  GET_USERS_SUCCESS = '[User] Get Success',
  GET_USERS_ERROR = '[User] Get Error',
  SET_CURRENT_USER = '[User] Set Main',
  SET_USERS = '[User] Set',
  // Sign In
  SIGN_IN = '[User] Sign In',
  SIGN_IN_SUCCESS = '[User] Sign In Success',
  SIGN_IN_ERROR = '[User] Sign In Error',
  SIGN_IN_REDIRECT = '[Auth] Sign In Redirect',
  // Sign Up
  SIGN_UP = '[User] Sign Up',
  SIGN_UP_SUCCESS = '[User] Sign Up Success',
  SIGN_UP_ERROR = '[User] Sign Up Error',
  // Reset
  RESET = '[User] Reset',
  // Logout
  LOGOUT = '[User] Logout',
}

export class GetUsers implements Action {
  type = UsersActionsType.GET_USERS;
  constructor(public payload?) {}
}

export class GetUsersSuccess implements Action {
  type = UsersActionsType.GET_USERS_SUCCESS;
  constructor(public payload: User[]) {}
}

export class GetUsersError implements Action {
  type = UsersActionsType.GET_USERS_ERROR;
  constructor(public payload: Error) {}
}

export class SetCurrentUser implements Action {
  type = UsersActionsType.SET_CURRENT_USER;
  constructor(public payload: User) {}
}

export class SetUsers implements Action {
  type = UsersActionsType.SET_USERS;
  constructor(public payload: User[]) {}
}

export class ResetState implements Action {
  type = UsersActionsType.RESET;
  constructor(public payload) {}
}

export class SignIn implements Action {
  type = UsersActionsType.SIGN_IN;
  constructor(public payload?) {}
}

export class SignInSuccess implements Action {
  type = UsersActionsType.SIGN_IN_SUCCESS;
  constructor(public payload: Object) {}
}

export class SignInError implements Action {
  type = UsersActionsType.SIGN_IN_ERROR;
  constructor(public payload) {}
}

export class SignInRedirect implements Action {
  type = UsersActionsType.SIGN_IN_REDIRECT;
  constructor(public payload) {}
}

export class SignUp implements Action {
  type = UsersActionsType.SIGN_UP;
  constructor(public payload?) {}
}

export class SignUpSuccess implements Action {
  type = UsersActionsType.SIGN_UP_SUCCESS;
  constructor(public payload: Object) {}
}

export class SignUpError implements Action {
  type = UsersActionsType.SIGN_UP_ERROR;
  constructor(public payload) {}
}

export class Logout implements Action {
  type = UsersActionsType.LOGOUT;
  constructor(public payload) {}
}

export type UsersActions = GetUsers
| GetUsersSuccess
| GetUsersError
| SetCurrentUser
| SetUsers
| ResetState
| SignIn
| SignInSuccess
| SignInError
| SignInRedirect
| SignUp
| SignUpSuccess
| SignUpError
| Logout;