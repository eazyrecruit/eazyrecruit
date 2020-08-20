export class ConstService {
    baseUrl: string;
    publicUrl: string;
    pyUrl: string;
    roles = [];
    constructor() {
        if (window.location.hostname === 'dev.eazyrecruit.in') {
            this.baseUrl = '/api/';
            this.publicUrl = 'https://dev.eazyrecruit.in/';
            this.pyUrl = '/api/engine/';
        } else if (window.location.hostname === 'web.eazyrecruit.in') {
            this.publicUrl = 'https://web.eazyrecruit.in/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        } else {
            this.publicUrl = window.location.protocol + '//' + window.location.hostname + '/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        }
        this.roles = ['admin', 'user', 'hr'];
    }
}
