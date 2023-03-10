import { ElButton, ElInput, ElOption, ElSelect } from "element-plus";
import Range from "@/components/Range";
function createEditorConfig() {
  const componentList = [];
  const componentMap = {};
  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}
export let registerConfig = createEditorConfig();

const createInputProp = (label) => ({ type: "input", label });
const createColorProp = (label) => ({ type: "color", label });
const createSelectProp = (label, options) => ({
  type: "select",
  label,
  options,
});
const createTableProp = (label, table) => ({ type: "table", label, table });
registerConfig.register({
  label: "文本",
  preview: () => "预览文本",
  render: ({ props }) => (
    <span style={{ color: props.color, fontSize: props.size }}>
      {props.text || "渲染文本"}
    </span>
  ),
  key: "text",
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      { label: "14px", value: "14px" },
      { label: "20px", value: "20px" },
      { label: "24px", value: "24px" },
    ]),
  },
});
registerConfig.register({
  label: "按钮",
  resize: {
    width: true,
    height: true,
  },
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ props, size }) => (
    <ElButton
      type={props.type}
      size={props.size}
      style={{ height: size.height + "px", width: size.width + "px" }}
    >
      {props.text || "渲染按钮"}
    </ElButton>
  ),
  key: "button",
  props: {
    text: createInputProp("按钮内容"),
    type: createSelectProp("按钮类型", [
      { label: "标准", value: "primary" },
      { label: "成功", value: "success" },
      { label: "文本", value: "text" },
      { label: "危险", value: "danger" },
      { label: "警告", value: "warning" },
    ]),
    size: createSelectProp("按钮尺寸", [
      { label: "默认", value: "" },
      { label: "偏小", value: "small" },
      { label: "偏大", value: "large" },
    ]),
  },
});
registerConfig.register({
  label: "输入栏",
  resize: {
    width: true,
    height: false,
  },
  preview: () => <ElInput placeholder="预览输入栏">预览文本</ElInput>,
  render: ({ props, size }) => (
    <ElInput
      placeholder="渲染输入栏"
      v-model={props.text}
      style={{ width: size.width + "px" }}
    ></ElInput>
  ),
  key: "input",
  props: {
    text: createInputProp("绑定字段"),
  },
  // model: {
  //   default: "绑定字段",
  // },
});
registerConfig.register({
  label: "范围选择器",
  preview: () => <Range placeholder="预览输入框"></Range>,
  render: ({ props }) => {
    console.log("范围选择器", props);
    // console.log(model, "范围选择器", props);
    return (
      <Range
        {...{
          start: props.start,
          // "onUpdate:start": props.start["onUpdate:modelValue"],
          end: props.end,
          //  "onUpdate:end": props.end["onUpdate:modelValue"],
        }}
      ></Range>
    );
  },
  props: {
    start: createInputProp("开始范围"),
    end: createInputProp("结束范围"),
  },
  // model: {
  //   start: "开始范围",
  //   end: "结束范围",
  // },
  key: "range",
});
registerConfig.register({
  label: "下拉框",
  preview: () => <ElSelect></ElSelect>,
  render: ({ props }) => (
    <ElSelect v-model={props.text}>
      {(props.options || []).map((opt, index) => {
        return (
          <ElOption label={opt.label} value={opt.value} key={index}></ElOption>
        );
      })}
    </ElSelect>
  ),
  key: "select",
  props: {
    text: createInputProp("绑定字段"),
    options: createTableProp("下拉选项", {
      options: [
        { label: "显示值", field: "label" },
        { label: "绑定值", field: "value" },
      ],
      key: "label",
    }),
  },
  // model: {
  //   default: "绑定字段",
  // },
});

// model: {
//   start: "开始";
//   end: "结束";
// }
