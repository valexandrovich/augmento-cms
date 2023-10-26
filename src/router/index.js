import {createRouter, createWebHistory} from 'vue-router'


import LoginView from "@/views/LoginView.vue";
import SignUpView from "@/views/SignUpView.vue";
import AccountView from "@/views/AccountView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ProductView from "@/views/ProductView.vue";
import ProjectView from "@/views/ProjectView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [

        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/sign-up',
            name: 'sign-up',
            component: SignUpView
        },
        {
            path: '/account',
            name: 'account',
            component: AccountView,
            meta: {requiresAuth: true}
        },
        {
            path: '/project/:id',
            name: 'project',
            component: ProjectView
        },
        {
            path: '/project',
            name: 'project-create',
            component: ProjectView
        },
        {
            path: '/product/:id',
            name: 'product',
            component: ProductView,
            meta: {requiresAuth: true}
        },
        {
            path: '/product',
            name: 'product-create',
            component: ProductView,
            meta: {requiresAuth: true}
        },
        {
            path: '/',
            name: 'dashboard',
            component: DashboardView,
            meta: {requiresAuth: true}
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        // alert('require auth')
        if (!localStorage.getItem('jwt')) {
            // alert(localStorage.getItem('jwt'))
            // alert('Redirect from beforeEach()')
            next({path: '/login', query: {redirect: to.fullPath}});
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router
