import {Injectable,} from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpHandler,
    HttpRequest,
    HttpClient,
    HttpErrorResponse
} from '@angular/common/http';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
// import 'rxjs/add/operator/do';
import {tap} from 'rxjs/operators';
import {ConstService} from './const.service';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Observable} from 'rxjs/internal/Observable';

declare var SiteJS: any;

@Injectable()
export class AccountService {

    authStorage = new AuthStorage();
    helper = new JwtHelperService();

    constructor(private http: HttpClient, private constService: ConstService) {
    }

    isAuthorized() {
        const authData = this.authStorage.getAuthData();
        let isexpire = true;
        let authorization: any;
        if (authData && authData.data) {
            isexpire = this.helper.isTokenExpired(authData.data.token);
        }

        if (isexpire) {
            return {isAuthorized: false, role: null};
        } else {
            const tokenPayload = this.helper.decodeToken(authData.data.token);
            if (this.constService.roles.indexOf(tokenPayload.roles[0] !== -1)) {
                authorization = {isAuthorized: true, role: tokenPayload.roles[0]};
            } else {
                authorization = {isAuthorized: false, role: tokenPayload.roles[0]};
            }
            return authorization;
        }
    }

    getRole() {
        const payload = this.helper.decodeToken(this.authStorage.getAuthData().data.token);
        if (payload) {
            return payload.roles.length ? payload.roles[0] : null;
        } else {
            return null;
        }
    }

    getToken() {
        return this.authStorage.getAuthData().data.token;
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

    updateUserData(userData) {
        return this.http.put(`${this.constService.baseUrl}user`, userData);
    }

    delete(id) {
        return this.http.delete(this.constService.baseUrl + 'user/' + id);
    }

    getRoles() {
        return this.http.get(this.constService.baseUrl + 'user/roles');
    }

    updateUser(body) {
        return this.http.put(this.constService.baseUrl + 'user', body);
    }

    getProfile() {
        return this.http.get(this.constService.baseUrl + 'user/profile');
    }

    getUsers() {
        return this.http.get(this.constService.baseUrl + 'user/');
    }

    getUser() {
        return this.http.get(this.constService.baseUrl + 'user?single=true');
    }

    getUserById(id) {
        return this.http.get(this.constService.baseUrl + 'user/' + id);
    }

    getAllUsers(filter) {
        return this.http.get(`${this.constService.baseUrl}user?limit=${filter.pageSize}&offset=${filter.offset}&search=${filter.searchText}&all=${filter.all}`);
    }

    logout() {
        this.authStorage.setAuthorizationHeader(null);
    }

    setAuthorizationHeader(authResponse) {
        this.authStorage.setAuthorizationHeader(authResponse);
    }

    verifyOtp(otp) {
        return this.http.get(this.constService.baseUrl + 'account/verify/' + otp);
    }

    resetPassword(password) {
        return this.http.post(this.constService.baseUrl + 'account/resetpassword/', password);
    }

    forgetPassword(email) {
        return this.http.post(this.constService.baseUrl + 'account/forget/', email);
    }

}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private accountService: AccountService) {
    }

    canActivate() {
        // logged in so return true
        let user = this.accountService.isAuthorized();
        if (user && user.isAuthorized) {
            return true;
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}

@Injectable()
export class RoleGuardService implements CanActivate {
    authStorage = new AuthStorage();
    helper = new JwtHelperService();

    constructor(private accountService: AccountService, private router: Router) {
    }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const authData = this.authStorage.getAuthData();
        if (!this.accountService.isAuthorized()) {
            this.router.navigate(['/login']);
            return false;
        } else {
            // decode the token to get its payload
            const tokenPayload = this.helper.decodeToken(authData.data.token);
            if (next.data.expectedRole.indexOf(tokenPayload.roles[0]) === -1) {
                this.router.navigate(['/login']);
                return false;
            }
            return true;
        }
    }

}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    authStorage = new AuthStorage();

    constructor(private router: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the auth header from the service.
        const authHeader = this.authStorage.getAuthorizationHeader();
        // Clone the request to add the new header.
        const authReq = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + authHeader)});
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
                    } else {
                        SiteJS.stopLoader();
                    }
                }
            })
        );
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
