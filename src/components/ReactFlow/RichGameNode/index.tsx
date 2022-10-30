import React, { memo } from "react";
import type { Connection} from "reactflow";
import { Handle, Position } from "reactflow";
import Tippy from "@tippyjs/react";
import { NodeType } from "@prisma/client";

interface Props {
    isConnectable: boolean | undefined,
    data: RichGameNodeData
}

interface RichGameNodeData {
    id: string,
    title: string,
    body: string,
    type: NodeType,
    parentNodeId: string,
    onClickEdit: (id: string) => void,
    onClickRemove: (id: string) => void,
    onConnect: (conn: Connection) => void,
}

// TODO: What does this eslint warning mean?
// eslint-disable-next-line react/display-name
const RichGameNode = memo(({ data, isConnectable }: Props) => {

    const truncate = (str: string, len: number) =>
        (str.length > len) ? str.substring(0, len - 1) + "..." : str;

    const isValid = () => (data.title && data.body);

    console.log(data);

    return (
        <>
            {!isValid() && (
                <Tippy
                    delay={[0, 0]}
                    content={(
                        <div className="bg-black border-4 border-white text-sm pt-1 pb-2 px-3">
                            {!data.body && (
                                <p className="leading-3 my-2 text-center">
                                    Body cannot be empty
                                </p>
                            )}
                            {!data.title && (
                                <p className="leading-3 my-2 text-center">
                                    Title cannot be empty
                                </p>
                            )}
                        </div>
                    )}>
                    <div className="absolute top-1 left-1 bg-red-700 w-8 h-8 text-red-600">
                        <p className="text-white ml-2.5" style={{ lineHeight: "1.4rem" }}>!</p>
                    </div>
                </Tippy>
            )}

            {data.type !== NodeType.Start && (
                <Handle
                    type="target"
                    position={Position.Top}
                    onConnect={data.onConnect}
                    isConnectable={isConnectable}
                    style={{ background: data.type === NodeType.Lose
                        ? "#B91C1C" // Red
                        : data.type === NodeType.Win
                            ? "#047857" // Green
                            : "#000",
                    }}
                />
            )}

            {data.title ? (
                <div className="text-center border-b-4 border-white">
                    {data.title}
                </div>
            ) : (
                <div className="text-center border-b-4 border-white text-red-700">
                    No Title!
                </div>
            )}

            {data.body ? (
                <div className="text-sm border-white leading-6 mt-3 pb-3 -mb-1">
                    {truncate(data.body, 100)}
                </div>
            ) : (
                <div className="text-center text-sm border-white text-red-700 leading-6 mt-3 pb-3 -mb-1">
                    No Text!
                </div>
            )}

            <div className="flex justify-between mb-1 mt-3 space-x-3">
                <button
                    onClick={() => data.onClickRemove(data.id)}
                    className="w-32 border-4 px-6 leading-8 pb-1 mb-6 text-sm uppercase hover:text-red-700 hover:cursor-pointer">
                    Remove
                </button>

                <button
                    onClick={() => data.onClickEdit(data.id)}
                    className="w-32 border-4 px-6 leading-8 pb-1 mb-6 text-sm uppercase hover:text-gray-300 hover:cursor-pointer">
                    Edit
                </button>
            </div>

            {data.type === NodeType.Standard || data.type === NodeType.Start && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    style={{ 
                        bottom: -4,
                        top: "auto",
                        background: data.type === NodeType.Start ? "#047857" : "000",
                    }}
                    isConnectable={isConnectable}
                    onConnect={data.onConnect}
                />
            )}
        </>
    );
});

export default RichGameNode;