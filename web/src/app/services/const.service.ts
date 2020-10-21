export class ConstService {
    baseUrl: string;
    publicUrl: string;
    pyUrl: string;
    roles = [];

    constructor() {
        this.publicUrl = window.location.protocol + '//' + window.location.hostname + '/';
        if (window.location.hostname === 'localhost') {
            this.publicUrl = 'http://localhost:8082';
        }

        this.baseUrl = 'http://localhost:8082/api/';
        this.pyUrl = '/api/engine/';
        this.roles = ['admin', 'user', 'hr'];
    }
}
