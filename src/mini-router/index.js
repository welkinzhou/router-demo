let _Vue = null

export default class VueRouter {
    static install(Vue) {
        //  判断当前插件是否安装
        if (VueRouter.install.installed) {
            return
        }
        VueRouter.install.installed = true
        // 记录 Vue 的构造函数
        _Vue = Vue
        // 将router对象注入Vue实例
        // 这里需要获取 Vue 的 $options, 所以需要使用 mixin
        _Vue.mixin({
            beforeCreate() {
                // 这里需要判断是否是 Vue 实例，如果是组件没有必要挂载
                // 组件的 $options 上并没有 router 属性
                if (this.$options.router) {
                    _Vue.prototype.$router = this.$options.router
                }
            }
        })
    }

    constructor(options) {
        this.options = options
        this.routeMap = {}
        // 创建响应式数据
        this.data = _Vue.observable({
            currentRoute: '/'
        })
        this.init()
    }

    init(){
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent()
    }

    createRouteMap() {
        // 遍历传入的 route， 建立映射关系
        this.options.routes.forEach(route => {
            // path 对应 组件
            this.routeMap[route.path] = route.component
        })
    }

    initComponents(Vue) {
        Vue.component('router-link', {
            props: {
                to: String
            },
            // 使用 h 函数创建组件模板
            render(h) {
                return h('a', {
                    attrs: {
                        href: '#' + this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler(e) {
                    // 改变 Vue 构造函数中data，触发监听
                    this.$router.data.currentRoute = this.to
                    e.preventDefault()
                }
            }
        })

        const self = this
        Vue.component('router-view', {
            render(h) {
                const currentComponet = self.routeMap[self.data.currentRoute]
                return h(currentComponet)
            }
        })
    }

    initEvent() {
        window.addEventListener('hashchange', () => {
            this.data.currentRoute = window.location.pathname
        })
    }
}