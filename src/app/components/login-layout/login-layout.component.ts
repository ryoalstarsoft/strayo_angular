import { Component } from '@angular/core';

import { UsersService } from '../../users.service';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.less'],
})
export class LoginLayoutComponent {
  user = {
    email: '',
    password: '',
  };

  constructor (
    private usersService: UsersService,
  ) {}

  onSubmit() {
    this.usersService.makeSignIn(this.user);
  }
}