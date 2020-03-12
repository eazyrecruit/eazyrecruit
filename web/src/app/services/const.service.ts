export class ConstService {
    baseUrl: string;
    publicUrl: string;
    pyUrl: string;
    constructor() {
        if (window.location.hostname === 'dev.eazyrecruit.in') {
            this.baseUrl = 'https://dev-api.eazyrecruit.in/api/';
            this.publicUrl = 'https://dev.eazyrecruit.in/onboarding/job/';
            this.pyUrl = 'https://devengine.eazyrecruit.in/';
        } else if (window.location.hostname === 'web.eazyrecruit.in') {
            this.baseUrl = 'https://app.eazyrecruit.in/api/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        } else {
            this.publicUrl = 'http://localhost:4200/onboarding/job/';
            this.baseUrl = '/api/';
            this.pyUrl = '/api/engine/';
        }

    }
}
