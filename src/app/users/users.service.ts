import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, map } from 'rxjs/operators';

import { List } from 'immutable';

import * as moment from 'moment';

import * as fromRoot from '../reducers';

import { getFullUrl } from '../util/getApiUrl';

import { IUser, User } from '../models/user.model';
import { Dataset } from '../models/dataset.model';

import { UsersState } from '../users/state';
import * as usersActions from './actions/actions';
import { GetUsers, SetCurrentUser, SignIn, SignUp } from './actions/actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { getUsersState } from '../reducers';

@Injectable()
export class UsersService {
  private usersSource = new BehaviorSubject<List<User>>(List([]));
  users = this.usersSource.asObservable().pipe(distinctUntilChanged());

  private currentUserSource = new BehaviorSubject<User>(null);
  currentUser = this.currentUserSource.asObservable().pipe(distinctUntilChanged());

  constructor (private store: Store<fromRoot.State>, private http: HttpClient) {
    this.getState$().subscribe((state) => {
      if (!state) {
        return;
      }

      this.usersSource.next(state.users);
      this.currentUserSource.next(state.currentUser);
    });
  }

  public getState$() {
    return this.store.select<UsersState>(getUsersState);
  }

  public loadUsers() {
    this.store.dispatch(new GetUsers());
  }

  public setCurrentUser(user: User) {
    this.store.dispatch(new SetCurrentUser(user));
  }

  public getUsers(): Observable<User[]> {
    return of([]);
  }

  public makeSignIn(credentials) {
    this.store.dispatch(new SignIn(credentials));
  }

  public signIn(credentials) {
    return this.http.post<IUser>(getFullUrl('v1/sessions'), credentials).map(
      (user) => {
        return new User(user);
      }
    );
  }

  public makeSignUp(userData: IUser) {
    this.store.dispatch(new SignUp(userData));
  }

  public signUp(userData) {
    return this.http.post<IUser>(getFullUrl('v1/users'), { user: userData }).map(
      (user) => {
        return new User(user);
      }
    );
  }
}