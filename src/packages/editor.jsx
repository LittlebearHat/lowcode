import { computed, defineComponent, inject, ref, withCtx } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import { useMenuDragger } from "@/utils/useMenuDragger";
import { useFocus } from "@/utils/useFocus";
import { useBlockDragger } from "@/utils/useBlockDragger";
import { useCommand } from "@/utils/useCommand";
import { $dialog } from "@/components/Dialog";
import { $dropdown, DropdownItem } from "@/components/Dropdown";
import deepcopy from "deepcopy";
import { ElButton } from "element-plus";
import EditorOperator from "./editor-operator";
export default defineComponent({
  props: {
    modelValue: { type: Object }, //传入state值
    formData: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const previewRef = ref(false);
    const editorRef = ref(true);
    const data = computed({
      get() {
        console.log("props值", props.modelValue);
        return props.modelValue;
      },
      set(newValue) {
        // console.log("newvalue", newValue);
        ctx.emit("update:modelValue", deepcopy(newValue)); //操作拦截，将更新后的data向父传参更新
        console.log("newValue", newValue);
      },
    });
    const containerStyles = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    })); //括号为直接默认return
    const config = inject("config");

    const containerRef = ref(null);

    //从菜单拖拽功能
    const { dragstart, dragend } = useMenuDragger(containerRef, data);

    //
    const { blockMousedown, focusData, containerMousedown, lastSelectBlock } =
      useFocus(data, previewRef, (e) => {
        mousedown(e); //此为回调函数，因此先执行下方代码再执行该函数
        // console.log("focusdata", focusData.value);
        console.log("e", e);
      });
    //展示框内选中组件拖拽
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );
    const { commands } = useCommand(data, focusData);
    const buttons = [
      { label: "撤销", icon: "icon-back", handler: () => commands.undo() },
      { label: "重做", icon: "icon-back", handler: () => commands.redo() },
      {
        label: "导出",
        icon: "icon-back",
        handler: () => {
          $dialog({
            title: "开导",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        icon: "icon-back",
        handler: () => {
          $dialog({
            title: "导入",
            content: "",
            footer: true,
            confirm(text) {
              console.log(text);
              data.value = JSON.parse(text);
            },
          });
        },
      },
      { label: "置顶", icon: "icon-back", handler: () => commands.placeTop() },
      {
        label: "置底",
        icon: "icon-back",
        handler: () => commands.placeBottom(),
      },
      {
        label: "删除",
        icon: "icon-back",
        handler: () => commands.delete(),
      },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: "111",
        handler: () => {
          previewRef.value = !previewRef.value;
        },
      },
      {
        label: "关闭",
        icon: "111",
        handler: () => {
          editorRef.value = !editorRef.value;
          data.value.blocks.forEach((block) => (block.focus = false)); //清除所有标记
        },
      },
    ];
    const command = useCommand;
    const onContextMenuBlock = (e, block) => {
      // console.log("右键");
      e.preventDefault();
      $dropdown({
        el: e.target,
        content: () => (
          <>
            <DropdownItem
              label="删除"
              onClick={() => commands.delete()}
            ></DropdownItem>
            <DropdownItem
              label="置顶"
              onClick={() => commands.placeTop()}
            ></DropdownItem>
            <DropdownItem
              label="置底"
              onClick={() => commands.placeBottom()}
            ></DropdownItem>
            <DropdownItem
              label="查看"
              onClick={() => {
                $dialog({
                  title: "选中节点数据",
                  content: JSON.stringify(block),
                });
              }}
            ></DropdownItem>
            <DropdownItem
              label="导入"
              onClick={() => {
                $dialog({
                  title: "导入节点数据",
                  content: "",
                  footer: true,
                  confirm(text) {
                    text = JSON.parse(text);
                    commands.updateBlock(text, block);
                  },
                });
              }}
            ></DropdownItem>
          </>
        ),
      });
    };

    return () =>
      !editorRef.value ? (
        <div class="content-preview">
          <div
            class="editor-container-canvas__content"
            style={containerStyles.value}
          >
            {data.value.blocks.map((block, index) => {
              return (
                <EditorBlock
                  block={block}
                  class="editor-block-preview"
                  formData={props.formData}
                ></EditorBlock>
              );
            })}
          </div>
          <div>
            <ElButton onClick={() => (editorRef.value = !editorRef.value)}>
              返回
            </ElButton>
          </div>
        </div>
      ) : (
        <div class="editor">
          <div class="editor-left">
            {config.componentList.map((component) => (
              <div
                class="editor-left-item"
                onDragstart={(e) => dragstart(e, component)}
                draggable="true"
                onDragend={dragend}
              >
                <span>{component.label}</span>
                <div>{component.preview()}</div>
              </div>
            ))}
          </div>
          <div class="editor-top">
            {buttons.map((btn, index) => {
              return (
                <div class="editor-top-button" onClick={btn.handler}>
                  <span>
                    {typeof btn.label == "function" ? btn.label() : btn.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div class="editor-right">
            <EditorOperator
              block={lastSelectBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            ></EditorOperator>
          </div>
          <div class="editor-container">
            <div class="editor-container-canvas">
              <div
                class="editor-container-canvas__content"
                style={containerStyles.value}
                ref={containerRef}
                onMousedown={containerMousedown} //在容器内部点击清除所有标记
              >
                {data.value.blocks.map((block, index) => {
                  return (
                    <EditorBlock
                      class={block.focus ? "editor-block-focus" : ""}
                      class={previewRef.value ? "editor-block-preview" : ""}
                      block={block}
                      onMousedown={(e) => {
                        blockMousedown(e, block, index);
                      }}
                      onContextmenu={(e) => onContextMenuBlock(e, block)}
                      formData={props.formData}
                    ></EditorBlock>
                  );
                })}
                {markLine.y != null && (
                  <div class="line-y" style={{ top: markLine.y + "px" }}></div>
                )}
                {markLine.x != null && (
                  <div class="line-x" style={{ left: markLine.x + "px" }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
  },
});
