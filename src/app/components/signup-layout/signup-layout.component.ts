import { Component } from '@angular/core';

import { UsersService } from '../../users/users.service';

@Component({
  selector: 'app-signup-layout',
  templateUrl: './signup-layout.component.html',
  styleUrls: ['./signup-layout.component.css'],
})
export class SignUpLayoutComponent {
  user = {
    firstName: '',
    lastName: '',
    industry: '',
    email: '',
    password: '',
    isPolicyAccepted: false,
  };

  constructor (
    private usersService: UsersService,
  ) {}

  onSubmit() {
    this.usersService.makeSignUp(this.user);
  }
}