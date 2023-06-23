import { Record, List } from 'immutable';
import { User } from '../models/user.model';

const userRecord = Record({
  users: List([]),
  currentUser: null,
  loggedIn: false,
  pending: false,
  error: null,
});

export class UsersState extends userRecord {
  users: List<User>;
  currentUser: User;
  loggedIn: boolean;
  pending: boolean;
  error: Error;

  constructor(props) {
    super(props);
    console.log('here in creation', this.toJS());
  }

  public getUsers(): UsersState {
    return this.set('error', null).set('pending', true) as UsersState;
  }

  public getUsersError(error: Error): UsersState {
    return this.set('error', error).set('pending', false) as UsersState;
  }

  public getUsersSuccess(users: User[]): UsersState {
    return this.set('error', null).set('pending', true).set('users', List(users)) as UsersState;
  }

  public signIn(): UsersState {
    return this.set('error', null).set('pending', true) as UsersState;
  }

  public signInSuccess(user: User): UsersState {
    return this.set('error', null).set('pending', true).set('loggedIn', true).set('currentUser', user) as UsersState;
  }

  public signInError(error: Error): UsersState {
    return this.set('error', error).set('pending', false) as UsersState;
  }

  public signUp(): UsersState {
    return this.set('error', null).set('pending', true) as UsersState;
  }

  public signUpSuccess(users: User[]): UsersState {
    return this.set('error', null).set('pending', true) as UsersState;
  }

  public signUpError(error: Error): UsersState {
    return this.set('error', error).set('pending', false) as UsersState;
  }

  public setCurrentUser(user: User): UsersState {
    return this.set('currentUser', user) as UsersState;
  }

  public setUsers(users: User[]): UsersState {
    return this.set('users', List(users)) as UsersState;
  }
}

export const getInitialState = () => new UsersState({ error: true });