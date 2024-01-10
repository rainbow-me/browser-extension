/* eslint-disable react/jsx-props-no-spreading */
import { CSSProperties, ReactElement } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import { getDraggableItemStyle } from '~/core/utils/draggable';
import { Box } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

import { dragabbleItem } from './draggableItem.css';

export const DraggableItem = ({
  borderRadius,
  id,
  index,
  isDragDisabled,
  children,
  padding,
}: {
  borderRadius?: number;
  id: string;
  index: number;
  isDragDisabled?: boolean;
  children: ReactElement;
  padding?: BoxStyles['padding'];
}) => {
  return (
    <Draggable draggableId={id} index={index} isDragDisabled={isDragDisabled}>
      {(
        { innerRef, draggableProps, dragHandleProps },
        { dropAnimation, isDragging },
      ) => (
        <Box
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
          style={getDraggableItemStyle(draggableProps.style, {
            dropAnimation,
          })}
          tabIndex={-1}
          padding={padding}
        >
          <Box
            className={
              dragabbleItem[isDragging && !dropAnimation ? 'dragging' : 'idle']
            }
            style={borderRadius ? { borderRadius } : undefined}
          >
            {children}
          </Box>
        </Box>
      )}
    </Draggable>
  );
};

export const DraggableContext = ({
  children,
  onDragEnd,
  height,
}: {
  children: ReactElement;
  onDragEnd: (result: DropResult) => void;
  height?: CSSProperties['height'];
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {({ droppableProps, innerRef, placeholder }) => (
          <Box
            {...droppableProps}
            ref={innerRef}
            style={{ overflowY: 'scroll', height }}
          >
            {children}
            {placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};
