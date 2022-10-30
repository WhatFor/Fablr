import Tippy from "@tippyjs/react";
import React, { type MouseEvent } from "react";
import type { MarkerType, Position } from "reactflow";
import { getSmoothStepPath, getBezierPath, getMarkerEnd } from "reactflow";

interface RichGameEdgeData {
    sourceId: number,
    targetId: number,
    edgeText: string,
    onClickDelete: (edgeId: string) => void,
    onClickEdit: (edgeId: string) => void,
}

interface Props {
    id: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourcePosition: Position | undefined,
    targetPosition: Position | undefined,
    pathStyle?: Record<string, unknown>,
    data: RichGameEdgeData,
    arrowHeadType: MarkerType | undefined,
    markerEndId: string,
}

const labelWidth = 400;
const labelHeight = 125;

const RichGameEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    pathStyle = {},
    data,
    arrowHeadType,
    markerEndId,
}: Props) => {

    const truncate = (str: string, len: number) => {
        return (str.length > len) ? str.substring(0, len - 1) + "..." : str;
    }

    const onEdgeClickEdit = (evt: MouseEvent, edgeId: string) => {
        evt.stopPropagation();
        data.onClickEdit(edgeId);
    };

    const onEdgeClickRemove = (evt: MouseEvent, edgeId: string) => {
        evt.stopPropagation();
        data.onClickDelete(edgeId);
    };

    
    const [ edgePath ] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 0,
    });

    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    const isValid = () => (data.edgeText);

    const [path, edgeCenterX, edgeCenterY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    return (
        <>
            <path
                id={id}
                style={pathStyle}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={labelWidth}
                height={labelHeight}
                x={edgeCenterX - labelWidth / 2}
                y={edgeCenterY - labelHeight / 2}
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <body style={{ maxHeight: "125px" }}>

                    {!isValid() && (
                        <Tippy
                            delay={[0, 0]}
                            content={(
                                <div className="bg-black border-4 border-white uppercase font-mono text-white text-sm pt-1 pb-2 px-3">
                                    <p className="leading-3 my-2">
                                        Text cannot be empty
                                    </p>
                                </div>
                            )}>
                            <div className="absolute top-2 left-2 bg-red-700 w-8 h-8 text-red-600 font-mono text-base">
                                <p className="text-white ml-2.5" style={{ lineHeight: "1.4rem" }}>!</p>
                            </div>
                        </Tippy>
                    )}

                    <div className="px-3 bg-black border-white border-4">

                        {data.edgeText ? (
                            <p className="font-mono text-sm text-white uppercase text-center">
                                {truncate(data.edgeText, 30)}
                            </p>
                        ) : (
                            <p className="font-mono text-sm text-red-700 uppercase text-center">
                                No Text!
                            </p>
                        )}

                        <div className="flex justify-between">
                            <button
                                className="w-32 border-4 px-6 leading-8 pb-1 mb-2 text-white font-mono text-sm uppercase hover:text-red-700 hover:cursor-pointer"
                                onClick={(event) => onEdgeClickRemove(event, id)}>
                                Remove
                            </button>
                            <button
                                className="w-32 border-4 px-6 leading-8 pb-1 mb-2 text-white font-mono text-sm uppercase hover:text-gray-300 hover:cursor-pointer"
                                onClick={(event) => onEdgeClickEdit(event, id)}>
                                Edit
                            </button>
                        </div>

                    </div>

                </body>
            </foreignObject>
        </>
    );
};

export default RichGameEdge;