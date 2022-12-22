import {
  computed,
  defineComponent,
  inject,
  onMounted,
  onUpdated,
  ref,
} from "vue";
import BlockResize from "./block-resize";

export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object },
  },

  setup(props) {
    // console.log("props", props);
    const blockStyles = computed(() => {
      return {
        top: `${props.block.top}px`,
        left: `${props.block.left}px`,
        zIndex: `${props.block.zIndex}`,
      };
    });
    const config = inject("config");
    const blockRef = ref(null);
    onMounted(() => {
      let { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        props.block.left = props.block.left - offsetWidth / 2;
        props.block.top = props.block.top - offsetHeight / 2; //居中对齐
        props.block.alignCenter = false;
      }
      props.block.width = offsetWidth;
      props.block.height = offsetHeight; //获取组件的宽高属性
    });
    return () => {
      //通过block的key来调出对象
      const component = config.componentMap[props.block.key];
      //console.log(props.block.props);
      const RenderComponent = component.render({
        size: props.block.hasResize
          ? { width: props.block.width, height: props.block.height }
          : {},
        props: props.block.props,
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          console.log("model", modelName);
          let propName = props.block.model[modelName];
          console.log(propName);
          prev[modelName] = {
            modelValue: props.formData[propName],
            "onUpdate:modelValue": (v) => (props.formData[propName] = v),
          };
          return prev;
        }, {}),
      });
      const { width, height } = component.resize || {};
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
          {props.block.focus && (width || height) && (
            <BlockResize
              block={props.block}
              component={component}
            ></BlockResize>
          )}
        </div>
      );
    };
  },
});
