import { useState } from "react";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CabinetCard } from "@/components/manage/development/CabinetCard";
import { ToggleButton } from "@/components/manage/development/ToggleButton";



export const CabinetOrganization = () => {
    const [isToggled, setIsToggled] = useState(false);
    
    const getItems = (count: number) => Array.from({ length: count }, (_v, k) => k).map(k => CabinetCard(k, isToggled));
    
    const [items, setItems] = useState(getItems(8));

    const handleClick = () => {
        setIsToggled(!isToggled);
    };


    type Item = ReturnType<typeof CabinetCard>;

    // a little function to help us with reordering the result
    const reorder = (list: Item[], startIndex: number, endIndex: number): Item[] => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    };

    const grid = 8;

    const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties | undefined): React.CSSProperties => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none' as const,
        padding: grid * 2,
        margin: `0 ${grid}px 0 0`,

        // change background colour if dragging
        background: isDragging ? 'lightgreen' : 'grey',

        // styles we need to apply on draggables
        ...draggableStyle,
    });

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? 'lightblue' : 'lightgrey',
        display: 'flex',
        padding: grid,
        overflow: 'auto',
    });

    const onDragEnd = (result: import("react-beautiful-dnd").DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const newItems = reorder(
            items,
            result.source.index,
            result.destination.index
        );

        setItems(newItems);
    };

    return (
        <div>
            <div className="container">
                <ToggleButton isToggled={isToggled} handleClick={handleClick} />
            </div>
            <div className="container">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                                {...provided.droppableProps}>
                                {items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isToggled}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                            >
                                                {item.content}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>

    );

};
