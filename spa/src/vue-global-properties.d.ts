// Augments (and doesn't replace) vue types: this file must stay a module
export {};

declare module 'vue' {
    interface ComponentCustomProperties {
        $CDN_BASE_URL: string
    }

    // registered in app.ts
    interface GlobalComponents {
        VueFlag: typeof import('./components/Utils/VueFlag.vue')['default']
    }
}
