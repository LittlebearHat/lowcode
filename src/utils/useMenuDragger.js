import { events } from "./events";

export function useMenuDragger(containerRef, data) {
  let currentComponent = null;
  //拖拽生命周期业务逻辑
  const dragenter = (e) => {
    // console.log("e", e);
    e.dataTransfer.dropEffect = "move";
  };
  const dragover = (e) => {
    e.preventDefault(); //阻止默认行为，否则无法触发drop
  };
  const dragleave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };
  const drop = (e) => {
    // console.log("currentComponent", currentComponent);
    let blocks = data.value.blocks; //已经有的组件对象
    data.value = {
      ...data.value, //已有组件对象外加新对象
      blocks: [
        ...blocks,
        {
          shabi: 1,
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true, //居中标记
          props: {},
          model: {},
        },
      ],
    };
    console.log("data.value", data.value);
    currentComponent = null;
  };
  const dragstart = (e, component) => {
    console.log("start e", e, component);
    console.log("组件", containerRef.value);
    containerRef.value.addEventListener("dragenter", dragenter); //进入元素中
    containerRef.value.addEventListener("dragover", dragover); //目标元素经过
    containerRef.value.addEventListener("dragleave", dragleave); //离开
    containerRef.value.addEventListener("drop", drop); //放下
    currentComponent = component;
    events.emit("start"); //发布start
  };
  const dragend = (e) => {
    containerRef.value.removeEventListener("dragenter", dragenter); //进入元素中
    containerRef.value.removeEventListener("dragover", dragover); //目标元素经过
    containerRef.value.removeEventListener("dragleave", dragleave); //离开
    containerRef.value.removeEventListener("drop", drop); //放下
    events.emit("end");
  };
  return {
    dragstart,
    dragend,
  };
}
