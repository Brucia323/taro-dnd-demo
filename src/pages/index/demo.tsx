import { ScrollView, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import './demo.css';

//滑块移动标记
let swap = false;
let scrollTop = 0;
const editMemoryBox = {
  editing: false,
  showEditMemoryBoxAnimation: false,
};
// 容器内高度
const itemsHeight = 60;
// 间距
const itemsDistance = 12;
// z轴偏移量
const dragZ = 100;

export default function Demo() {
  const [memoryItems, setMemoryItems] = useState([
    {
      _id: '0',
      translateY: 0,
    },
    {
      _id: '1',
      translateY: itemsHeight + itemsDistance,
    },
    {
      _id: '2',
      translateY: (itemsHeight + itemsDistance) * 2,
    },
    {
      _id: '3',
      translateY: (itemsHeight + itemsDistance) * 3,
    },
    {
      _id: '4',
      translateY: (itemsHeight + itemsDistance) * 4,
    },
    {
      _id: '5',
      translateY: (itemsHeight + itemsDistance) * 5,
    },
    {
      _id: '6',
      translateY: (itemsHeight + itemsDistance) * 6,
    },
    {
      _id: '7',
      translateY: (itemsHeight + itemsDistance) * 7,
    },
    {
      _id: '8',
      translateY: (itemsHeight + itemsDistance) * 8,
    },
  ]);
  // 拖动标记
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragIndex, setDragIndex] = useState<number>();
  const [device, setDevice] = useState(Taro.getSystemInfoSync);

  Taro.useLaunch(() => {
    setDevice(Taro.getSystemInfoSync());
  });

  /**
   * 页面滚动事件
   * @param e
   */
  const memoryBoxScrollHandler = (e: { detail: { scrollTop: number } }) => {
    scrollTop = e.detail.scrollTop;
  };

  const longPressHandler = (e: any, index: number) => {
    console.log('长按=>', e);
    const changedTouches = e.changedTouches;
    if (changedTouches?.length !== 1) {
      console.log('非单指长按，结束');
      return;
    }
    const y = calculateDragTranYHandler(e);
    setDragY(y);
    setDragging(true);
    setDragIndex(index);
  };

  const touchMoveHandler = (e: any) => {
    if (dragging) {
      const y = calculateDragTranYHandler(e);
      setDragY(y);
      swapItemHandler(e);
    } else {
      console.log('没有长按，结束');
    }
  };

  const touchEndHandler = () => {
    if (dragging) {
      adjustOrderHandler();
      setDragging(false);
      setDragIndex(-1);
      return false;
    } else {
      console.log('没有长按，结束');
    }
  };

  const calculateDragTranYHandler = (e: any): number => {
    const { pageY: y } = e.changedTouches[0];
    //拖动时的偏移坐标
    return y + scrollTop - device.statusBarHeight! - itemsHeight / 2;
  };

  /**
   * 交换方块
   * @param e
   */
  const swapItemHandler = (e: { changedTouches: { pageY: any }[] }) => {
    const { pageY: y } = e.changedTouches[0];
    const locateY = y + scrollTop - device.statusBarHeight!;

    const locateIndex = memoryItems.findIndex(
      (item) =>
        item.translateY <= locateY && item.translateY + itemsHeight >= locateY,
    );
    if (locateIndex === -1) {
      //没有落在指定区域，不交换方块
      return;
    }
    const locateItem = memoryItems[locateIndex];
    const dragItem = memoryItems[dragIndex!];
    if (!dragging) {
      //已经释放拖动方块了，结束
      return;
    }
    if (swap) {
      console.log('正在移动中');
      return;
    }
    if (locateItem.translateY === dragItem.translateY) {
      //拖动方块还落在自己区域，不交换方块
      return;
    }
    const locateItemTranslateY = locateItem.translateY;

    //判断是当前拖动的方块是向前移动还是向后移动
    let moveBackward = false;
    if (dragItem.translateY < locateItem.translateY) {
      moveBackward = true;
    }

    //要移动调整的方块
    let moveItems: {
      _id: string;
      translateY: number;
    }[];
    if (moveBackward) {
      //dragItem向后移动，dragItem和locateItem之间的方块都要向前移动
      moveItems = memoryItems.filter(
        (item) =>
          //在locateItem和dragItem之间的方块需要向前移动
          item.translateY > dragItem.translateY &&
          item.translateY <= locateItem.translateY,
      );
    } else {
      //dragItem向前移动，dragItem和locateItem之间的方块都要向后移动
      moveItems = memoryItems.filter(
        (item) =>
          //在locateItem和dragItem之间的方块需要向后移动
          item.translateY < dragItem.translateY &&
          item.translateY >= locateItem.translateY,
      );
    }

    if (moveItems.length === 0) {
      //没有需要移动的方块，结束
      return;
    }

    //开始准备移动
    swap = true;

    console.log(
      moveBackward,
      dragItem.translateY,
      '<-调整偏移坐标->',
      locateItemTranslateY,
      JSON.stringify(moveItems),
    );

    dragItem.translateY = locateItemTranslateY;

    moveItems.forEach((item) => {
      if (moveBackward) {
        //拖动方块向后移动，其他方块向前移动
        if (item.translateY === 0) {
          //第一个方块，无法再往前移动
        } else {
          item.translateY = item.translateY - itemsHeight - itemsDistance;
        }
      } else {
        //拖动方块向前移动，其他方块向后移动
        item.translateY = item.translateY + itemsHeight + itemsDistance;
      }
    });

    setMemoryItems(memoryItems);
    swap = false;
  };

  /**
   * 调整顺序
   */
  const adjustOrderHandler = () => {
    const singleTranslateY = itemsHeight + itemsDistance;

    const adjustList: any[] = [];
    for (let index in memoryItems) {
      const memoryItem = memoryItems[index];
      const yIndex = memoryItem.translateY / singleTranslateY;
      adjustList.push({
        _id: memoryItem._id,
        index: yIndex + 1,
      });
    }
    console.log('调整结果：{}', adjustList);
  };

  return (
    <View className={`container ${editMemoryBox.editing ? 'blur' : ''}`}>
      <ScrollView
        scrollY={!dragging}
        onScroll={memoryBoxScrollHandler}
        style={{
          height: '100%',
          boxSizing: 'border-box',
        }}
        enableBackToTop
      >
        <View
          className="memory-box"
          style={{
            padding: '12px',
            height: `${
              (memoryItems.length / 2) * (itemsHeight + itemsDistance) +
              (memoryItems.length % 2) * itemsHeight +
              50
            }px`,
          }}
        >
          {memoryItems.map((item, index) => (
            <View
              className={`memory-item flex-column ${
                dragging && index == dragIndex
                  ? 'active-item'
                  : 'transition-item'
              }`}
              onLongPress={(e) => longPressHandler(e, index)}
              onTouchMove={(e) => touchMoveHandler(e)}
              onTouchEnd={touchEndHandler}
              style={{
                transform: `translate3d(0px, ${
                  dragging && index == dragIndex ? dragY : item.translateY
                }px, ${dragging && index == dragIndex ? dragZ : 0}px)`,
                width: `${device.screenWidth - 24}px`,
                height: `${itemsHeight}px`,
              }}
            >
              {item._id}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
