import { computed, ref } from "vue";

export function useFocus(data, previewRef, callback) {
  const selectIndex = ref(-1);
  const lastSelectBlock = computed(() => {
    return data.value.blocks[selectIndex.value];
  });
  const focusData = computed(() => {
    // console.log("最后的焦点", lastSelectBlock);
    //获取焦点
    let focus = [];
    let unfocus = [];
    data.value.blocks.forEach((block) => {
      (block.focus ? focus : unfocus).push(block);
    });
    return { focus, unfocus };
  });
  const blockMousedown = (e, block, index) => {
    if (previewRef.value) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      console.log(data);
      if (focusData.value.focus.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        data.value.blocks.forEach((block) => (block.focus = false)); //清除所有标记
        block.focus = true;
      }
    }
    selectIndex.value = index; //选中组件的id
    callback(e);
  };
  const containerMousedown = () => {
    if (previewRef.value) return;
    data.value.blocks.forEach((block) => (block.focus = false)); //清除所有标记
    selectIndex.value = -1;
  };

  return {
    blockMousedown,
    containerMousedown,
    focusData,
    lastSelectBlock,
  };
}
