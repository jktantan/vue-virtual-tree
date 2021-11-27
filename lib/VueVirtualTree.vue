<template>
  <div
    class="vue-virtual-tree tree-container"
    :style="{ width: width, height: height }"
    @scroll="scrollEvent"
  >
    <div
      class="infinite-list-phantom"
      :style="{ height: listHeight + 'px' }"
    ></div>
    <div class="infinite-list" :style="{ transform: transformOffset }">
      <template v-for="item in currentTreeList">
        <tree-item :key="item.id" :item="item" :type="type" @expand="expand" />
      </template>
    </div>
  </div>
</template>

<script>
import { MpttOperator } from './mixins/MpttOperator'
import { treeType } from './utils/enums'
import { throttle, debounce } from 'throttle-debounce'
import TreeItem from './components/TreeItem'
import { eventBus } from './utils/EventBus'

export default {
  name: 'VueVirtualTree',
  components: {
    TreeItem,
  },
  mixins: [MpttOperator],
  model: {
    prop: 'model',
    event: 'change',
  },
  props: {
    // 返回结果
    model: {
      type: [Array, Object, String, Number],
      default: '',
    },
    // 平板树数组
    tree: {
      type: Array,
      default: () => [],
    },
    // 父键默认值
    rootId: {
      type: [String, Number],
      default: '0',
    },
    /**
     * 树类型
     * select: 选择（单选可以随便选择）
     * radio: 单选（可以指定哪些可选）
     * checkbox: 多选（可以指定哪些可选以及最后返回哪些数据）
     */
    type: {
      type: String,
      default: treeType.select,
    },
    width: {
      type: String,
      default: '200px',
    },
    height: {
      type: String,
      default: '400px',
    },
    searchKey: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      currentTreeList: [],
      scrollTop: 0,
      startOffset: 0,
      isSearch: false,
    }
  },
  computed: {
    //偏移量对应的style
    transformOffset() {
      return `translate3d(0,${this.startOffset}px,0)`
    },
    factorHeight() {
      return this.listHeight > parseFloat(this.height)
        ? parseFloat(this.height)
        : this.listHeight
    },
  },
  watch: {
    tree() {
      const that = this
      // const height = parseFloat(this.height)
      this._convert(that.tree, that.rootId).then(() => {
        this.currentTreeList = this._getVisableItems(
          this.scrollTop,
          this.scrollTop + this.factorHeight
        )
        for (const item of this.currentTreeList) {
          item.collapseOnly = false
        }
        this.$emit('onLoad')
      })
    },
    searchKey() {
      this.fuzzySearch(this.searchKey)
    },
  },
  created() {
    const that = this
    eventBus.$on('check', ({ id, checked }) => {
      that.check(id, checked)
    })
    eventBus.$on('afterTransition', () => {
      that.afterTransition()
    })
  },
  methods: {
    check(id, checked) {
      if (this.type !== treeType.select) {
        this._check(id, checked, this.type === treeType.checkbox)
      }
    },
    expand({ item }) {
      // const height = parseFloat(this.height)
      // 取消删除
      this._recursiveDelete(this.currentTreeList)
      this.resetRemovable()

      item.expand = !item.expand

      if (item.expand) {
        this._expand(item.id, item.lNode, item.rNode, item.expand)
        this._recursiveDeleteMark(this.currentTreeList)
        // 获取子元素
        const addChildren = this._getVisableItems(
          item.bottom,
          this.startOffset + this.factorHeight,
          item.id
        )

        // 子元素加入children里面
        item.collapseOnly = false
        item.children.push(...addChildren)
        // this.$nextTick(() => {
        //   this._recursiveDelete(this.currentTreeList)
        // })
      } else {
        this._expand(item.id, item.lNode, item.rNode, item.expand)
        // 收缩
        let lastItem = null
        // let startPos = Number.MAX_VALUE
        // let endPos = Number.MIN_VALUE
        // let childrenResult = []
        item.collapseOnly = true
        // 查出出父元素下children中的子元素
        const children = this._recursiveGetChildren(
          item.pid,
          item.lNode,
          item.rNode,
          this.currentTreeList
        )
        const addPos = children.length
        for (let i = this.currentTreeList.length - 1; i >= 0; i--) {
          const treeItem = this.currentTreeList[i]
          if (treeItem.lNode > item.lNode && treeItem.rNode < item.rNode) {
            children.splice(addPos, 0, treeItem)
            this.currentTreeList.splice(i, 1)
          }
        }
        item.children.push(...children)

        lastItem = this._recursiveGetLastItem(item.id, this.currentTreeList)

        const addItem = this._getVisableItems(
          lastItem.bottom,
          this.startOffset + this.factorHeight
        )
        this.currentTreeList.push(...addItem)

        this.$nextTick(() => {
          item.children.splice(0)
          this._removeChildren(item)
        })
      }
    },
    _recursiveGetLastItem(id, items) {
      let result = null
      for (const item of items) {
        if (item.children.length > 0 && item.id !== id) {
          result = this._recursiveGetLastItem(id, item.children)
        } else {
          result = item
        }
      }
      return result
    },
    // 递归获取子元素
    _recursiveGetChildren(pid, lNode, rNode, items) {
      let result = []
      for (const item of items) {
        if (item.id === pid) {
          for (let i = item.children.length - 1; i >= 0; i--) {
            if (
              item.children[i].lNode > lNode &&
              item.children[i].rNode < rNode
            ) {
              result.splice(0, 0, item.children[i])
              item.children.splice(i, 1)
            }
          }
          result.push(
            ...this._recursiveGetChildren(item.pid, lNode, rNode, items)
          )
          break
        }
      }
      return result
    },
    /**
     * 标记需要删除的对象
     * @param items
     * @private
     */
    _recursiveDeleteMark(items) {
      for (const cItem of items) {
        if (cItem.children.length > 0) {
          this._recursiveDeleteMark(cItem.children)
        }
        if (cItem.top >= this.scrollTop + parseFloat(this.height)) {
          cItem.removable = true
        }
      }
    },
    // 递归删除不显示的元素
    _recursiveDelete(items) {
      for (let i = items.length - 1; i >= 0; i--) {
        const cItem = items[i]
        if (cItem.children.length > 0) {
          this._recursiveDelete(cItem.children)
        }
        if (cItem.removable) {
          items.splice(i, 1)
        }
      }
    },
    fuzzySearch: debounce(250, function (value) {
      console.log(value)
    }),
    scrollEvent: throttle(200, function ($event) {
      this.scrollTop = $event.target.scrollTop
      //此时的偏移量
      this.startOffset = this.scrollTop - (this.scrollTop % this.itemSize)
      const results = this._getVisableItems(
        this.startOffset,
        this.startOffset + this.factorHeight
      )

      for (const item of results) {
        item.children.splice(0)
        item.collapseOnly = false
      }
      this.currentTreeList = results
    }),
    afterTransition() {
      this.$nextTick(() => {
        this._recursiveDelete(this.currentTreeList)
        this.resetRemovable()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.vue-virtual-tree {
  &.tree-container {
    margin: 5px;
    overflow: auto;
    position: relative;

    .infinite-list-phantom {
      z-index: -1;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
    }
    .infinite-list {
      display: grid;
      position: absolute;
      white-space: nowrap;
    }
  }
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.1);
  -webkit-box-shadow: rgba(0, 0, 0, 0.5);
}
//::-webkit-scrollbar-thumb:window-inactive {
//  background: rgba(255, 0, 0, 0.4);
//}
</style>
