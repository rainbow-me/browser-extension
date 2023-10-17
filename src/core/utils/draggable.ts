import {
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

export function reorder<T>(
  list: Iterable<T>,
  startIndex: number,
  endIndex: number,
) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export const getDraggableItemStyle = (
  style: DraggingStyle | NotDraggingStyle | undefined,
  { dropAnimation }: Pick<DraggableStateSnapshot, 'dropAnimation'>,
) => {
  if (!dropAnimation) return style;
  const { moveTo, curve } = dropAnimation;
  return {
    ...style,
    transform: `translate(${moveTo.x}px, ${moveTo.y}px) scale(1)`,
    transition: `all ${curve} .5s`,
  };
};
