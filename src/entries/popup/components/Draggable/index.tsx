/* eslint-disable react/jsx-props-no-spreading */
import { ReactElement } from 'react';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd';

import { getDraggableItemStyle } from '~/core/utils/draggable';
import { Box } from '~/design-system';

import { dragabbleItem } from './draggableItem.css';

export const DraggableItem = ({
  id,
  index,
  isDragDisabled,
  children,
}: {
  id: string;
  index: number;
  isDragDisabled?: boolean;
  children: ReactElement;
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
        >
          <Box
            className={
              dragabbleItem[isDragging && !dropAnimation ? 'dragging' : 'idle']
            }
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
}: {
  children: ReactElement;
  onDragEnd: (result: DropResult) => void;
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {({ droppableProps, innerRef, placeholder }) => (
          <Box
            {...droppableProps}
            ref={innerRef}
            style={{ overflowY: 'scroll' }}
          >
            {children}
            {placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
};
