export class ConstService {
    baseUrl: string;
    publicUrl: string;
    pyUrl: string;
    roles = [];

    constructor() {
        this.publicUrl = window.location.protocol + '//' + window.location.hostname + '/';
        this.baseUrl = '/api/';
        this.pyUrl = '/api/engine/';
        this.roles = ['admin', 'user', 'hr'];
    }
}
