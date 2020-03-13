import { Injectable, } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpResponse, HttpHandler, HttpRequest, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import 'rxjs/add/operator/do';
import { tap } from 'rxjs/operators';
import { ConstService } from './const.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs/internal/Observable';

declare var SiteJS: any;
@Injectable()
export class AccountService {

    authStorage = new AuthStorage();
    helper = new JwtHelperService();

    constructor(private http: HttpClient, private constService: ConstService) {}

    isAuthorized() {
        const authData = this.authStorage.getAuthData();
        let isexpire = true;

        if (authData && authData.data) {
            isexpire = this.helper.isTokenExpired(authData.data.token);
        }

        if (isexpire) {
            return false;
        } else {
            return true;
        }
    }

    previlege() {
        const authData = this.helper.decodeToken(this.authStorage.getAuthData().data.token);
        return authData.id;
    }

    login(loginData) {
        return this.http.post(this.constService.baseUrl + 'account/login', loginData);
    }

    register(userData) {
        return this.http.post(this.constService.baseUrl + 'account/register', userData);
    }

    createUser(userdetail) {
        return this.http.post(this.constService.baseUrl + 'user/', userdetail);
    }

    update(userData, id) {
        return this.http.put(`${this.constService.baseUrl}user/${id}`, userData);
    }

    delete(id) {
        return this.http.delete(this.constService.baseUrl + 'user/' + id);
    }

    getRoles() {
        return this.http.get(this.constService.baseUrl + 'user/getroles');
    }

    getUsers() {
        return this.http.get(this.constService.baseUrl + 'user/');
    }

    getUserById(id) {
        return this.http.get(this.constService.baseUrl + 'user/' + id);
    }

    getAllUsers(filter) {
        return this.http.get(this.constService.baseUrl + 'user/', filter);
    }

    logout() {
        this.authStorage.setAuthorizationHeader(null);
    }

    setAuthorizationHeader(authResponse) {
        this.authStorage.setAuthorizationHeader(authResponse);
    }

    verifyOtp(otp) {
        return this.http.get(this.constService.baseUrl + 'user/otpverification/' + otp);
    }

    resetPassword(password) {
        return this.http.post(this.constService.baseUrl + 'user/resetpassword/', password);
    }

    forgetPassword(email) {
        return this.http.post(this.constService.baseUrl + 'account/forget/', email);
    }

}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private accountService: AccountService) { }
    // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //     // logged in so return true
    //     if (this.AccountService.isAuthorized()) {
    //         return true;
    //     }
    //     // not logged in so redirect to login page with the return url
    //     this.router.navigate(['/login']);
    //     return false;
    // }
    canActivate() {
        // logged in so return true
        if (this.accountService.isAuthorized()) {
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    authStorage = new AuthStorage();

    constructor(private router: Router) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth header from the service.
        const authHeader = this.authStorage.getAuthorizationHeader();
        // Clone the request to add the new header.
        const authReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + authHeader) });
        // Pass on the cloned request instead of the original request.
        SiteJS.startLoader();
        return next.handle(authReq).pipe(
            tap((event: HttpEvent<any>) => {
              if (event instanceof HttpResponse) {
                 SiteJS.stopLoader();
                //
              }
            }, (err: any) => {
              if (err instanceof HttpErrorResponse) {
                if (err.status === 401 || err.status === 403) {
                    this.authStorage.setAuthorizationHeader(null);
                    this.router.navigate(['login']);
                    SiteJS.stopLoader();
                }
              }
            })
        );
        // return next.handle(authReq).do(event => {
        //     /* If something needs to be handled when response returned */
        // }).catch((e) => {
        //     if (e.status === 401 || e.status === 403) {
        //         SiteJS.notifyDanger('You are not allowed');
        //         this.authStorage.setAuthorizationHeader(null);
        //         this.router.navigate(['/login']);
        //     }
        //     return Observable.throw(new Error(`${e.status} ${e.statusText}`));
        // }).finally(() => { /* Loader will be hidden here*/ });
    }
}

export class AuthStorage {

    getAuthData() {
        const authData = window.localStorage.getItem('auth_data');
        if (authData && authData.length > 0 && authData !== '{}') {
            return JSON.parse(authData);
        }
        return null;
    }

    getAuthorizationHeader() {
        const authData = this.getAuthData();
        if (authData) {
            return authData.data.token;
        }
    }

    setAuthorizationHeader(authResponse) {
        window.localStorage.setItem('auth_data', JSON.stringify(authResponse));
    }

}
