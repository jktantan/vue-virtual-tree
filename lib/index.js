import VueVirtualTree from './VueVirtualTree.vue'

VueVirtualTree.install = function install(Vue) {
  Vue.component(VueVirtualTree.name, VueVirtualTree)
}

export default VueVirtualTree
