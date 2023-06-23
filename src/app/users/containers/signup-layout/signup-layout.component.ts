import { Component } from '@angular/core';

import { UsersService } from '../../users.service';

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
    this.usersService.makeSignUp({
      first_name: this.user.firstName,
      last_name: this.user.lastName,
      email: this.user.email,
      industry: this.user.industry,
      password: this.user.password,
      password_confirmation: this.user.password,
      type: 'Customer',
    });
  }
}