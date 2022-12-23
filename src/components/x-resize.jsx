import { defineComponent, onUnmounted, ref } from "vue";

export default defineComponent({
  props: {
    widthChange: { type: Function },
    showoutWidth: { type: Function },
    width: { type: Number },
    flag: { type: String },
  },
  setup(props) {
    const lastX = ref("");
    const mouseDown = (event) => {
      document.addEventListener("mousemove", mouseMove);
      lastX.value = event.screenX;
    };
    const mouseMove = (event) => {
      //console.log("监听鼠标拖拽事件");
      props.widthChange(lastX.value - event.screenX, props.width, props.flag);
      lastX.value = event.screenX;
      document.addEventListener("mouseup", mouseUp);
    };
    const mouseUp = () => {
      lastX.value = "";
      // console.log("销毁鼠标拖拽事件");
      document.removeEventListener("mousemove", mouseMove);
    };
    // const showout = () => {
    //   props.showoutWidth(0, props.width);
    // };
    () => {
      document.addEventListener("mouseup", mouseUp);
    };
    onUnmounted(() => {
      document.removeEventListener("mouseup", mouseUp);
    });
    return () => {
      return (
        <div
          class="x-handle"
          onMousedown={(event) => {
            mouseDown(event);
          }}
          onClick="showout"
          unselectable="on"
          onselectstart="return false"
          style="-moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;"
        ></div>
      );
    };
  },
});
