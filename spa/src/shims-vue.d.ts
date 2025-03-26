declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'vue/types/vue' {
    import type { Router, RouteLocationNormalized } from 'vue-router'

    interface Vue {
        $router: Router,
        $route: RouteLocationNormalized
    }
}

