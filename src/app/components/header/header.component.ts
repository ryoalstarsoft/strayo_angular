import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Logout } from '../../users/actions/actions';
import * as fromUsers from '../../users/reducers/reducer';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<Object>;

  constructor (private store: Store<Object>) {
    this.isAuthenticated$ = store.select(fromUsers.getLoggedIn);
    this.currentUser$ = store.select(fromUsers.getCurrentUser);
  }

  logout () {
    this.store.dispatch(new Logout({}));
  }
}