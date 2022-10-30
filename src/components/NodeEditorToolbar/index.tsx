import { NodeType } from "@prisma/client";
import React from "react";

const NodeEditorToolbar = () => {

    // TODO: What type for event?
    const onDragStart = (event: any, gameNodeType: NodeType) => {
        event.dataTransfer.setData("application/reactflow/gameNodeType", gameNodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <aside className="absolute top-14 font-mono text-sm text-white uppercase inline-flex flex-row space-x-1 mt-1 bg-none z-50">
            <div
                className="bg-black border-4 border-white px-3 leading-8 pb-1"
                onDragStart={(event) => onDragStart(event, NodeType.Start)}
                draggable>
                Start Node
            </div>
            <div
                className="bg-black border-4 border-white px-3 leading-8 pb-1"
                onDragStart={(event) => onDragStart(event, NodeType.Standard)}
                draggable>
                Default Node
            </div>
            <div
                className="bg-black border-4 border-white px-3 leading-8 pb-1"
                onDragStart={(event) => onDragStart(event, NodeType.Win)}
                draggable>
                Win Node
            </div>
            <div
                className="bg-black border-4 border-white px-3 leading-8 pb-1"
                onDragStart={(event) => onDragStart(event, NodeType.Lose)}
                draggable>
                Lose Node
            </div>
        </aside>
    );
};

export default NodeEditorToolbar;