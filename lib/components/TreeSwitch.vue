<template>
  <div style="display: flex; align-items: center">
    <em
      v-for="item in switchData"
      :key="item.id"
      class="tree-switch"
      :class="[item.switchButton, item.url, item.canSwitch ? expandType : '']"
      @click.stop="expand(item.canSwitch)"
    />
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { joinTypeEnum } from '../utils/enums'
export default {
  name: 'TreeSwitch',
  props: {
    item: {
      type: Object,
      required: true,
    },
    idKey: {
      type: String,
      default: 'id',
    },
  },
  computed: {
    switchData() {
      const result = []
      for (let i = 0; i < this.item.deep; i++) {
        const item = {
          id: nanoid(),
          switchButton: '',
          canSwitch: false,
          url: '',
        }
        if (i === this.item.deep - 1) {
          // 大于1是枝节点
          if (this.item.rNode - this.item.lNode > 1) {
            item.switchButton = 'switch-button'
            item.canSwitch = true
            if (this.item.joinType === joinTypeEnum.start) {
              item.url = this.item.lNode === 0 ? 'button-top' : 'button-join'
            } else if (this.item.joinType === joinTypeEnum.center) {
              item.url = 'button-join'
            } else {
              item.url = 'button-bottom'
            }
          } else {
            item.switchButton = ''
            item.canSwitch = false
            // 其他是叶节点
            if (this.item.joinType === joinTypeEnum.start) {
              item.url = this.item.lNode === 0 ? 'line-top' : 'line-join'
            } else if (this.item.joinType === joinTypeEnum.center) {
              item.url = 'line-join'
            } else {
              item.url = 'line-bottom'
            }
          }
        } else {
          const hole = this.item.hole
          if (hole.indexOf(`[${i + 1}]`) !== -1) {
            item.url = ''
          } else {
            item.url = 'line'
          }
        }
        result.push(item)
      }
      return result
    },
    expandType() {
      return this.item.expand ? 'expand' : ''
    },
  },
  methods: {
    expand(canSwitch) {
      const that = this
      if (canSwitch) {
        // this.expandType = !this.item.expand ? 'active' : ''
        that.$emit('expand', { item: this.item })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.tree-switch {
  height: 23px;
  width: 23px;
  object-fit: cover;

  &.switch-button {
    cursor: pointer;
    &.button-top {
      background: url('../images/tree_expandtop.svg') no-repeat;
      background-size: contain;
      transition: transform 0.3s;

      &.expand {
        transform: rotate(90deg);
        background: url('../images/tree_collapsetop.svg') no-repeat;
        background-size: contain;
      }
    }
    &.button-join {
      background: url('../images/tree_expandjoin.svg') no-repeat;
      background-size: contain;
      transition: transform 0.3s;
      &.expand {
        transform: rotate(90deg);
        background: url('../images/tree_collapsejoin.svg') no-repeat;
        background-size: contain;
      }
    }
    &.button-bottom {
      background: url('../images/tree_expandbottom.svg') no-repeat;
      background-size: contain;
      transition: transform 0.3s;
      &.expand {
        transform: rotate(90deg);
        background: url('../images/tree_collapsebottom.svg') no-repeat;
        background-size: contain;
      }
    }
  }

  &.line {
    background: url('../images/tree_line.svg') no-repeat;
    background-size: contain;
  }
  &.line-bottom {
    background: url('../images/tree_linebottom.svg') no-repeat;
    background-size: contain;
  }
  &.line-join {
    background: url('../images/tree_linejoin.svg') no-repeat;
    background-size: contain;
  }
  &.line-top {
    background: url('../images/tree_linetop.svg') no-repeat;
    background-size: contain;
  }
}
</style>
