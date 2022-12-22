import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false, //是否正在拖拽
  };
  let markLine = reactive({
    x: null,
    y: null,
  });
  //获取焦点并进行盒子内拖拽
  const mousedown = (e) => {
    // console.log("最后的焦点", lastSelectBlock.value);
    const { width: BWidth, height: BHeight } = lastSelectBlock.value; //被选择的组件的宽高
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        const { unfocus } = focusData.value;
        let lines = { x: [], y: [] }; //计算辅助线的位置
        // console.log("未被选中", unfocus);
        [
          ...unfocus,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;
          lines.y.push({ showTop: ATop, top: ATop }); //顶对顶
          lines.y.push({ showTop: ATop, top: ATop - BHeight }); //顶对底
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop - BHeight / 2 + AHeight / 2,
          }); //中对中
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); //底对顶
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          }); //底对底
          lines.x.push({ showLeft: ALeft, left: ALeft });
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          });
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          });
          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth });
        });
        return lines;
        // console.log("辅助线", lines);
      })(), //立即执行遍历未被选中的值
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };

  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("start"); //拖拽前的位置
    }
    let left = moveX - dragState.startX + dragState.startLeft;
    let top = moveY - dragState.startY + dragState.startTop;
    let y = null;
    let x = null;
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i];
      if (Math.abs(t - top) < 5) {
        y = s;
        moveY = dragState.startY - dragState.startTop + t;
        break;
      }
    }
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        x = s;
        moveX = dragState.startX - dragState.startLeft + l;
        break;
      }
    }
    markLine.x = x;
    markLine.y = y;
    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;
    focusData.value.focus.forEach((block, idx) => {
      //改变获取焦点的block的各个属性
      block.top = dragState.startPos[idx].top + durY;
      block.left = dragState.startPos[idx].left + durX;
    });
  };

  const mouseup = (e) => {
    markLine.x = null;
    markLine.y = null;
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    if (dragState.dragging) {
      events.emit("end");
    }
  };
  return {
    mousedown,
    markLine,
  };
}
