import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { Store } from '@ngrx/store';

import { authenticateSuccess, logout } from './store/auth.actions';
import { AppState } from '../store/app.reducer';

import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokeExpirationTimer: any;

  constructor(private store: Store<AppState>) {}

  autoLogin() {
    const loadedUser = localStorage.getItem('userData');
    if (!loadedUser) return;

    const userData: {
      id: string;
      email: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(loadedUser);

    const user = new User(
      userData.id,
      userData.email,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (user.token) {
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();

      this.store.dispatch(authenticateSuccess({ user: user }));
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.store.dispatch(logout());
    localStorage.removeItem('userData');

    if (this.tokeExpirationTimer) {
      clearTimeout(this.tokeExpirationTimer);
    }
  }

  autoLogout(expirationDuration: number) {
    this.tokeExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
