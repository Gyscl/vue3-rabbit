//封装购物车模块

import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useUserStore } from "./userStore";
import { insertCartAPI, findNewCartListAPI,delCartAPI } from "@/apis/cart";

export const useCartStore = defineStore(
  "cart",
  () => {
    const userStore = useUserStore();
    const isLogin = computed(() => userStore.userInfo.token);
    //1.定义state-cartList
    const cartList = ref([]);
    //2.定义action-加入购物车
    const addCart = async (goods) => {
      const { skuId, count } = goods;
      if (isLogin.value) {
        //登录后的加入购物车逻辑
        await insertCartAPI({ skuId, count });
        updateNewList()
      } else {
        // 未登录本地的添加购物车操作
        //已添加过- count+1；没有添加过- 直接push
        //思路：通过匹配传递过来的商品对象中skuId能不能在cartList中找到，找到就是添过
        const item = cartList.value.find((item) => goods.skuId === item.skuId);
        if (item) {
          item.count++;
        } else {
          cartList.value.push(goods);
        }
      }
    };
    //删除购物车
    const delCart = async (skuId) => {
      if (isLogin.value) {
        await delCartAPI([skuId])
        updateNewList()
      } else {
        //思路：找到要删除项的下标-splice; 使用数组过滤方法-filter
        const idx = cartList.value.findIndex((item) => skuId === item.skuId);
        cartList.value.splice(idx, 1);
      }
    };

    //清空购物车
    const clearCart=()=>{
      cartList.value=[]
    }

    //获取最新购物车列表action
    const updateNewList=async ()=>{
      const res = await findNewCartListAPI();
      cartList.value = res.result;
    }

    //单选功能
    const singleCheck = (skuId, selected) => {
      //通过skuId找到要修改的那一项，然后把它selected修改为传过来的selected
      const item = cartList.value.find((item) => item.skuId === skuId);
      item.selected = selected;
    };

    //全选功能
    const allCheck = (selected) => {
      cartList.value.forEach((item) => (item.selected = selected));
    };

    //计算属性
    //1.总数量
    const allCount = computed(() =>
      cartList.value.reduce((a, c) => a + c.count, 0)
    );
    //2.总价
    const allPrice = computed(() =>
      cartList.value.reduce((a, c) => a + c.count * c.price, 0)
    );
    //3.已选择数量
    const selectedCount = computed(() =>
      cartList.value
        .filter((item) => item.selected)
        .reduce((a, c) => a + c.count, 0)
    );
    //4.已选择商品价格合计
    const selectedPrice = computed(() =>
      cartList.value
        .filter((item) => item.selected)
        .reduce((a, c) => a + c.count * c.price, 0)
    );

    //是否全选
    const isAll = computed(() => cartList.value.every((item) => item.selected));
    return {
      cartList,
      allCount,
      allPrice,
      isAll,
      selectedCount,
      selectedPrice,
      clearCart,
      addCart,
      delCart,
      singleCheck,
      allCheck,
      updateNewList
    };
  },
  {
    persist: true,
  }
);
