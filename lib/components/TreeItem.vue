<template>
  <div>
    <div class="tree-item" :class="{ selected: item.selected }">
      <tree-switch :item="item" @expand="expand" />
      <div class="tree-text-item">
        <em
          class="item-check"
          :class="checkButton(item.checked)"
          @click="
            item.checked === checkEnum.check
              ? check(item.id, checkEnum.uncheck)
              : check(item.id, checkEnum.check)
          "
        />
        <div class="item-text">
          {{ item.title }}
        </div>
      </div>
    </div>
    <CollapseTransition
      :duration="250"
      :collapse-only="item.collapseOnly"
      @after-enter="afterTransition"
    >
      <div v-if="item.children.length > 0">
        <template v-for="item in item.children">
          <tree-item
            :key="item.id"
            :item="item"
            :type="type"
            @expand="expand"
          />
        </template>
      </div>
    </CollapseTransition>
  </div>
</template>

<script>
import TreeSwitch from './TreeSwitch'
import { checkEnum } from '../utils/enums'
import { CollapseTransition } from './CollapseTransition'
import { eventBus } from '../utils/EventBus'

export default {
  name: 'TreeItem',
  components: { TreeSwitch, CollapseTransition },
  props: {
    item: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      checkEnum,
    }
  },
  methods: {
    check(id, checked) {
      eventBus.$emit('check', { id, checked })
    },
    checkButton(checked) {
      if (this.type === 'radio') {
        return checked === checkEnum.check ? 'radio-check' : 'radio-uncheck'
      }
      if (this.type === 'checkbox') {
        if (checked === checkEnum.check) {
          return 'check-check'
        }

        return checked === checkEnum.uncheck ? 'check-uncheck' : 'check-half'
      }
    },
    expand({ item }) {
      this.$emit('expand', { item })
    },
    afterTransition() {
      eventBus.$emit('afterTransition')
    },
  },
}
</script>

<style lang="scss" scoped>
.tree-item {
  display: flex;
  align-items: center;

  &:hover,
  &.selected {
    background: #42b983;
    color: white;
  }

  .tree-text-item {
    display: flex;
    flex: 1 1 0;
    padding: 5px;
    align-items: center;

    .item-check {
      padding-right: 5px;
      cursor: pointer;
      height: 15.5px;
      width: 15.5px;

      &.check-check {
        background: url('../images/checkCheck.svg') no-repeat;
        background-size: contain;
      }

      &.check-uncheck {
        background: url('../images/checkUncheck.svg') no-repeat;
        background-size: contain;
      }

      &.check-half {
        background: url('../images/checkHalfcheck.svg') no-repeat;
        background-size: contain;
      }

      &.radio-check {
        background: url('../images/radioCheck.svg') no-repeat;
        background-size: contain;
      }

      &.radio-uncheck {
        background: url('../images/radioUncheck.svg') no-repeat;
        background-size: contain;
      }
    }

    .item-text {
      flex: 1 1 0;
      text-align: start;
      cursor: pointer;
      font-size: 13px;
    }
  }
}
</style>
