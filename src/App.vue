<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <div>数量：{{ addSize }}，加载时间:{{ addTime }}毫秒</div>
    <div><input v-model="searchValue" type="text" /></div>
    <div style="display: flex; justify-content: center">
      <VueVirtualTree
        ref="vtree"
        :tree="tree"
        :root-id="pid"
        type="radio"
        titleKey="name"
        :search-key="searchValue"
        @onLoad="onLoad"
      />
    </div>
  </div>
</template>

<script>
import VueVirtualTree from '../lib'
// import treeList from "../data/tree.json"
import { nanoid } from 'nanoid'

export default {
  name: 'App',
  components: {
    VueVirtualTree,
  },
  data() {
    return {
      tree: [],
      pid: '',
      addTime: 0,
      addSize: 0,
      searchValue: '',
    }
  },
  mounted() {
    let testData = []
    const rootId = nanoid()
    this.pid = rootId
    for (let i = 0; i < 50; i++) {
      const id1 = nanoid()
      let level1 = {
        id: id1,
        pid: rootId,
        name: id1,
      }
      testData.push(level1)

      for (let j = 0; j < 50; j++) {
        const id2 = nanoid()
        let level2 = {
          id: id2,
          pid: id1,
          name: id2,
        }
        testData.push(level2)

        for (let z = 0; z < 50; z++) {
          const id3 = nanoid()
          let level3 = {
            id: id3,
            pid: id2,
            name: id3,
          }
          testData.push(level3)
        }
      }
    }
    this.addSize = testData.length
    this.$nextTick(() => {
      this.tree = testData
    })
  },
  methods: {
    onLoad() {
      console.log(this.$refs.vtree.getAllNode())
      const item = this.$refs.vtree.getAllNode()[10]
      let startTime = new Date().getTime()
      this.$refs.vtree.check(item.data.id, true)
      let endTime = new Date().getTime()
      console.log(this.$refs.vtree.getAllNode())
      console.log(endTime - startTime)
      this.addTime = endTime - startTime
      console.log(this.$refs.vtree.getChecked())
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  align-items: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
