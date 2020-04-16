export class ConstService {
    baseUrl: string;
    publicUrl: string;
    pyUrl: string;
    constructor() {
        if (window.location.hostname === 'dev.eazyrecruit.in') {
            this.baseUrl = '/api/';
            this.publicUrl = 'https://dev.eazyrecruit.in/jobs/';
            this.pyUrl = '/api/engine/';
        } else if (window.location.hostname === 'web.eazyrecruit.in') {
            this.publicUrl = 'https://web.eazyrecruit.in/jobs/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        } else {
            this.publicUrl = 'http://localhost:8082/jobs/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        }

    }
}
