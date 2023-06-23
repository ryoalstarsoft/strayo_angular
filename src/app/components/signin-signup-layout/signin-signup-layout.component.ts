import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormGroup } from '@angular/forms';
import { FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { UsersService } from '../../users/users.service';

export type SignUpSignIn = 'sign-in' | 'sign-up';

function validateEqualValidator(field: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {

    const match = !control.parent || control.value === control.parent.get(field).value;
    // if (control.parent) console.log(control.parent.get(field).value);
    return match ? null : { 'validateEqual': control.value };
  };
}

@Component({
  selector: 'app-signin-signup-layout',
  templateUrl: './signin-signup-layout.component.html',
  styleUrls: ['./signin-signup-layout.component.css']
})
export class SigninSignupLayoutComponent implements OnInit, OnDestroy {

  page: SignUpSignIn = 'sign-in';
  off: Subscription;
  offUser: Subscription;

  signInForm: FormGroup;
  signUpForm: FormGroup;

  passwordMatch = true;
  constructor(private userService: UsersService, private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit() {
    initStrayosJquery($);
    this.createSignInFrom();
    this.createSignUpForm();
    this.off = this.route.url.subscribe((url) => {
      switch (true) {
        case /sign-up/.test(url.join('')):
          this.page = 'sign-up';
          break;
        default:
          this.page = 'sign-in';
      }
    });

    this.offUser = this.userService.currentUser.subscribe((user) => {
      if (user && user.authenticationToken() && user.email()) {
        console.log('got user', user);
      }
    });
  }

  createSignInFrom() {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(8)]],
    });
  }

  createSignUpForm() {
    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      industry: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      isPolicyAccepted: [false, Validators.required],
    });

    this.signUpForm.valueChanges.subscribe(value => {
      this.passwordMatch = value.password === value.confirmPassword;
    });
  }

  onSignIn() {
    const formModel = this.signInForm.value;
    if (this.signInForm.valid) {
      const user = {
        email: formModel.email,
        password: formModel.password,
      };
      this.userService.makeSignIn(user);
      console.log('sign in user', user);
    }
  }

  onSignUp() {
    const formModel = this.signUpForm.value;
    if (this.signUpForm.valid && formModel.isPolicyAccepted && this.passwordMatch) {
      const user = {
        first_name: formModel.firstName,
        last_name: formModel.lastName,
        email: formModel.email,
        industry: formModel.industry,
        password: formModel.password,
        password_confirmation: formModel.confirmPassword,
        type: 'Customer',
      };
      this.userService.makeSignUp(user);
      console.log('submited user', user);
    } else {
      console.warn('Invalid form');
    }
    console.log(this.signUpForm.value);
  }

  ngOnDestroy() {
    this.off.unsubscribe();
  }
}