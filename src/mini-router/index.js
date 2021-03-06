let _Vue = null;

export default class VueRouter {
  static install(Vue) {
    //  判断当前插件是否安装
    if (VueRouter.install.installed) {
      return;
    }
    VueRouter.install.installed = true;
    // 记录 Vue 的构造函数
    _Vue = Vue;
    // 将router对象注入Vue实例
    // 这里需要获取 Vue 的 $options, 所以需要使用 mixin
    _Vue.mixin({
      beforeCreate() {
        // 这里需要判断是否是 Vue 根实例，如果是组件没有必要挂载
        // 组件的 $options 上并没有 router 属性
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router;
        }
      },
    });
  }

  // 传入路由的描述对象
  constructor(options) {
    // 保存描述对象
    this.options = options;
    // 创建路由和组件的映射关系对象
    this.routeMap = {};
    // 创建响应式数据，更改后自动渲染对应组件
    this.data = _Vue.observable({
      currentRoute: "/",
    });
    this.init();
  }

  init() {
    this.createRouteMap();
    this.initComponents(_Vue);
    this.initEvent();
    // 首次打开地址没有 #，需要手动添加
    if (!location.hash) {
      window.location = "#/";
    } else {
      // 刷新页面时候不会触发事件
      // 需要手动调用
      this.chnageHashState();
    }
  }

  // 遍历传入的 route， 建立映射关系
  createRouteMap() {
    this.options.routes.forEach((route) => {
      // path 对应 组件
      this.routeMap[route.path] = route.component;
    });
  }

  // 构建 router-link 和 router-view 组建
  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // 使用 h 函数创建组件模板
      render(h) {
        return h(
          "a",
          {
            attrs: {
              href: "#" + this.to,
            },
            on: {
              click: this.clickHandler,
            },
          },
          [this.$slots.default]
        );
      },
      methods: {
        clickHandler() {
          // 改变 Vue 构造函数中data，触发监听
          this.$router.data.currentRoute = this.to;
        },
      },
    });

    const self = this;
    Vue.component("router-view", {
      render(h) {
        const currentComponet = self.routeMap[self.data.currentRoute];
        return h(currentComponet);
      },
    });
  }

  // 绑定事件，拦截前进和后退操作
  initEvent() {
    // 需要绑定 this 为当前 router 实例
    window.addEventListener("hashchange", this.chnageHashState.bind(this));
  }
  // 地址变化触发
  chnageHashState() {
    const hashStr = location.hash;
    const hashIndex = hashStr.indexOf("#");
    const curr = hashStr.substring(hashIndex + 1);
    this.data.currentRoute = curr;
  }
}
