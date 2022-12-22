import { createVNode, defineComponent, reactive, render } from "vue";
import { ElButton, ElDialog, ElInput } from "element-plus";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      },
    });
    const cancel = () => {
      state.isShow = false;
    };
    const confirm = () => {
      state.isShow = false;
      state.option.confirm && state.option.confirm(state.option.content);
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.content}
                rows={10}
              ></ElInput>
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={cancel}>取消</ElButton>
                  <ElButton onClick={confirm}>确认</ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});
let vm;
export function $dialog(option) {
  if (!vm) {
    //单例模式，dialog只创建一次
    let el = document.createElement("div");
    vm = createVNode(DialogComponent, { option }); //将组件渲染成虚拟节点
    //需要将el渲染到页面中
    console.log(vm);
    document.body.appendChild((render(vm, el), el)); //渲染成真实节点
  }
  let { showDialog } = vm.component.exposed;
  showDialog(option);
}
