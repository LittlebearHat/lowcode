import TableEditor from "@/components/table-editor";
import deepcopy from "deepcopy";
import {
  ElButton,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
    data: { type: Object },
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },
  setup(props, ctx) {
    const config = inject("config");
    const state = reactive({
      editData: {},
    });
    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data.container);
        //  console.log("状态", state.editData);
      } else {
        state.editData = deepcopy(props.block);
        //console.log("状态", state.editData);
      }
    };
    const apply = () => {
      if (!props.block) {
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        props.updateBlock(state.editData, props.block);
      }
    };
    watch(() => props.block, reset, { immediate: true });
    return () => {
      // console.log("全图框");
      //console.log("局部", props.block);
      let content = [];
      if (!props.block) {
        //console.log("caonima");
        content.push(
          <div>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </div>
        );
      } else {
        let component = config.componentMap[props.block.key];
        //console.log("com", component);
        if (component && component.props) {
          // console.log("局部11", component.props);
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              //console.log("名字", propName, "config", propConfig);
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => (
                      <ElInput
                        v-model={state.editData.props[propName]}
                      ></ElInput>
                    ),
                    color: () => (
                      <ElColorPicker
                        v-model={state.editData.props[propName]}
                      ></ElColorPicker>
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((opt) => {
                          return (
                            <ElOption
                              label={opt.label}
                              value={opt.value}
                            ></ElOption>
                          );
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <TableEditor
                        propConfig={propConfig}
                        v-model={state.editData.props[propName]}
                        onUpdate:modelValue={(newValue) => {
                          state.editData;
                        }}
                      ></TableEditor>
                    ),
                  }[propConfig.type]()}
                </ElFormItem>
              );
            })
          );
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              );
            })
          );
        }
      }
      return (
        <ElForm labelPosition="top">
          {content}
          <ElFormItem>
            <ElButton type="primary" plain onClick={apply}>
              应用
            </ElButton>
            <ElButton plain onClick={reset}>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
