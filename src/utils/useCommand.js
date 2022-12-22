import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "./events";

export function useCommand(data, focusData) {
  const state = {
    current: -1, //撤回索引
    queue: [],
    commands: {}, //命令的映射表
    commandArray: [],
    destoryArray: [], //销毁
  };
  const register = (commands) => {
    state.commandArray.push(commands),
      (state.commands[commands.name] = (...args) => {
        // debugger;
        const { redo, undo } = commands.execute(...args);
        redo();
        if (!commands.pushQueue) {
          //判断是否执行push队列
          return;
        }
        let { queue, current } = state;
        // debugger;
        if (queue.length > 0) {
          queue = queue.slice(0, current + 1);
          state.queue = queue;
        }
        queue.push({ redo, undo });
        state.current = current + 1;
        // console.log("current", current, "queue", queue);
      });
  };
  register({
    name: "redo",
    keyboard: "ctrl+y",
    init() {},
    execute() {
      return {
        redo() {
          // console.log("重做");
          // debugger;
          let item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  register({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          // console.log("撤销");
          // debugger;
          if (state.current == -1) {
            //无操作跳过
            return;
          }
          let item = state.queue[state.current];
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });
  register({
    name: "drag",
    pushQueue: true,
    init() {
      //初始化
      this.before = null;
      const start = () => (this.before = deepcopy(data.value.blocks)); //拖拽之前的组件
      const end = () => state.commands.drag();
      events.on("start", start);
      events.on("end", end);
      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      let before = this.before;
      let after = data.value.blocks;
      return {
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  register({
    name: "updateContainer",
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue,
      };
      return {
        redo: () => {
          data.value = state.after;
        },
        undo: () => {
          data.value = state.before;
        },
      };
    },
  });

  register({
    name: "placeTop",
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        let { focus, unfocus } = focusData.value;
        let maxZIndex = unfocus.reduce((prev, block) => {
          return Math.max(prev, block.zIndex);
        }, -Infinity); //遍历未被选中的元素的值，得出最大的并且让选中组件+1
        focus.forEach((block) => (block.zIndex = maxZIndex + 1));
        return data.value.blocks;
      })();
      return {
        undo: () => {
          data.value = { ...data.value, blocks: before };
        },
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
      };
    },
  });
  register({
    name: "placeBottom",
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks);
      let after = (() => {
        let { focus, unfocus } = focusData.value;
        let minZIndex =
          unfocus.reduce((prev, block) => {
            return Math.min(prev, block.zIndex);
          }, Infinity) - 1;
        if (minZIndex < 0) {
          //如若为负值则令未选中+1
          minZIndex = 0;
          unfocus.forEach((block) => (block.zIndex += 1));
        }
        focus.forEach((block) => (block.zIndex = minZIndex));
        return data.value.blocks;
      })();
      return {
        undo: () => {
          data.value = { ...data.value, blocks: before };
        },
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
      };
    },
  });
  register({
    name: "delete",
    pushQueue: true,
    execute() {
      let state = {
        before: data.value.blocks,
        after: focusData.value.unfocus,
      };
      return {
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
      };
    },
  });
  register({
    name: "updateBlock",
    pushQueue: true,
    execute(newValue, oldValue) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks];
          const index = data.value.blocks.indexOf(oldValue);
          if (index > -1) {
            blocks.splice(index, 1, newValue);
          }
          return blocks;
        })(),
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  const KeyboardEvent = (() => {
    const keyCodes = {
      90: "z",
      89: "y",
    };
    const onKeydown = (e) => {
      console.log("键盘", e);
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) {
        keyString.push("ctrl");
      }
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) {
          return;
        }
        if (keyboard == keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onKeydown);
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    };
    return init;
  })();

  (() => {
    state.destoryArray.push(KeyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destoryArray.push(command.init())
    );
  })();
  onUnmounted(() => {
    //销毁事件
    state.destoryArray.forEach((fn) => fn && fn());
  });
  return state;
}
