// A lot of React Flow events don't have concrete types.
/* eslint-disable @typescript-eslint/no-explicit-any */

// Needed cos of g => setters, where g might be null but isn't
/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React, {
    useEffect,
    useState,
    type MouseEvent,
    type WheelEvent,
    useRef, 
    useCallback,
    useMemo} from "react";

import ReactFlow, {
    addEdge,
    type Node,
    type Edge,
    type Connection,
    ReactFlowProvider,
    applyNodeChanges,
    applyEdgeChanges} from "reactflow";

import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { type NodeType } from "@prisma/client";

import type { Node as GameNode} from "@prisma/client";
import RichGameNode from "components/ReactFlow/RichGameNode";
import NodeEditorFlyout from "components/NodeEditorFlyout";
import RichGameEdge from "components/ReactFlow/RichGameEdge";
import NodeEditorToolbar from "components/NodeEditorToolbar";
import EdgeEditorFlyout from "components/EdgeEditorFlyout";
import { trpc } from "utils/trpc";

const NodeEditorPage = () => {

    const router = useRouter();

    const updateMutation = trpc.games.updateSingleWithNodes.useMutation();
    const { data } = trpc.games.findSingleWithNodes.useQuery({ id: router.query.id as string });
    
    // TODO: Swap 'close' buttons for X icon in top
    // TODO: Feedback form
    
    const [game, setGame] = useState<typeof data>();
    const [editingNode, setEditingNode] = useState<GameNode>();
    const [editingEdge, setEditingEdge] = useState<GameNode>();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [isValidSave, setIsValidSave] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const reactFlowWrapper = useRef() as React.MutableRefObject<HTMLInputElement>;
    const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);

    useEffect(() => {
        if (data)
            setGame(data);
    }, [ data ]);

    const onNodeDragStart = (event: MouseEvent, node: Node) =>
        console.log("drag start", node, event);

    const onPaneClick = () => {
        setEditingNode(undefined);
        setEditingEdge(undefined);
    };

    const onPaneScroll = (event?: WheelEvent<Element>) =>
        console.log("onPaneScroll", event);

    const onPaneContextMenu = (event: MouseEvent) =>
        console.log("onPaneContextMenu", event);

    const onInit = (instance: any) => {
        instance.fitView({ padding: 0.2 });
        setReactFlowInstance(instance);
    };

    const onSave = async () => {
        if (game && isValidSave && isDirty) {

            setIsSaving(true);
            setEditingEdge(undefined);
            setEditingNode(undefined);

            try {
                await updateMutation.mutateAsync({
                    id: game.id,
                    nodes: game.nodes
                });

                toast.success("Game saved.");
                setIsDirty(false);
            }
            catch (error) {
                toast.error("Failed to save.")
            }
            finally {
                setIsSaving(false);
            }
        }
    };

    const onCloseNodeFlyout = () => setEditingNode(undefined);

    const onCloseEdgeFlyout = () => setEditingEdge(undefined);

    const addNewEdge = (edge: Connection) => {
        if (game) {

            const targetNode = game.nodes.find(x => x.id === edge.target);

            if (targetNode && edge.source) {
                targetNode.parentNodeId = edge.source;
            }

            setIsDirty(true);
        }
    };

    const onConnect = (params: Connection) => {
        addNewEdge(params);
        setIsDirty(true);
        setEdges((els) => addEdge({ ...params, type: "step" }, els));
    };

    const onNodesChange = useCallback(
        (changes: any) => setNodes((ns) => applyNodeChanges(changes, ns)),
        []
      );
      const onEdgesChange = useCallback(
        (changes: any) => setEdges((es) => applyEdgeChanges(changes, es)),
        []
      );

    // TODO: Type of event
    const onDragOver = (event: any) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const onClickEdit = (nodeId: string) => {
        if (game) {
            const clickedNode = game.nodes.find(x => x.id === nodeId);
            if (clickedNode) {
                setEditingEdge(undefined);
                setEditingNode(clickedNode);
            }
        }
    };

    const onClickEdgeEdit = (edgeId: string) => {
        if (game) {
            const targetId = edgeId.slice(0, 36);
            const node = game.nodes.find(x => x.id === targetId);

            if (node) {
                setEditingNode(undefined);
                setEditingEdge(node);
            }
        }
    };

    const onClickEdgeRemove = (edgeId: string) => {
        if (game) {

            const targetId = edgeId.slice(0, 36);
            const targetNode = game.nodes.find(x => x.id === targetId);

            if (targetNode) {
                targetNode.parentNodeId = null;
                targetNode.parentNodeLinkText = "";
                setIsDirty(true);
                setEditingEdge(undefined);
            }
        }
    };

    const addNewNode = (node: GameNode) => {
        if (game) {
            setIsDirty(true);

            setGame(g => {
                return {
                    ...g!!,
                    nodes: [
                        ...g!!.nodes,
                        node,
                    ],
                };
            });
        }
    };

    const onClickNodeRemove = (nodeId: string) => {
        if (game) {

            setIsDirty(true);
            setGame(g => {
                return {
                    ...g!!,
                    nodes: g!!.nodes.filter(x => x.id !== nodeId),
                };
            });

            if (editingNode?.id === nodeId) {
                setEditingNode(undefined);
                setEditingEdge(undefined);
            }
        }
    };

    // TODO: Event type?
    const onDrop = (event: any) => {
        event.preventDefault();

        if (reactFlowWrapper?.current && reactFlowInstance) {

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const gameNodeType = event.dataTransfer.getData("application/reactflow/gameNodeType") as NodeType;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            setIsDirty(true);
            addNewNode({
                bodyText: "",
                titleText: "",
                parentNodeId: null,
                parentNodeLinkText: "",
                id: uuidv4(),
                editorPositionX: position.x,
                editorPositionY: position.y,
                type: gameNodeType,
            } as GameNode);
        }
    };

    // TODO: Event type?
    const handleKeyDown = (evt: any) => {
        if (evt.key === "Escape") {
            setEditingEdge(undefined);
            setEditingNode(undefined);
            return;
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return (() => window.removeEventListener("keydown", handleKeyDown));
    }, []);

    useEffect(() => {
        if (game) {
            // Build nodes and edges, apply
            const nodes = game.nodes.map(n => (
                {
                    id: n.id.toString(),
                    data: {
                        id: n.id,
                        title: n.titleText,
                        body: n.bodyText,
                        type: n.type,
                        isTopLevelNode: !n.parentNodeId,
                        onClickEdit: onClickEdit,
                        onClickRemove: onClickNodeRemove,
                        onConnect: onConnect,
                    },
                    position: { x: n.editorPositionX, y: n.editorPositionY },
                } as Node
            ));

            const edges = game.nodes.filter(x => x.parentNodeId).map(n => (
                {
                    id: `${n.id}-${n.parentNodeId}`,
                    source: n.parentNodeId,
                    target: n.id.toString(),
                    type: "rich",
                    data: {
                        sourceId: n.parentNodeId,
                        targetId: n.id,
                        edgeText: n.parentNodeLinkText,
                        onClickEdit: onClickEdgeEdit,
                        onClickDelete: onClickEdgeRemove,
                    },
                } as Edge
            ));

            setNodes(nodes);
            setEdges(edges);

            // Determine validity for save
            const nodesValid = nodes.length === 0 || nodes.every(x => x.data.title && x.data.body);
            const edgesValid = edges.length === 0 || edges.every(x => x.data.edgeText);
            setIsValidSave(nodesValid && edgesValid);
        }
    }, [ game ]);

    const editNodeTitle = (nodeId: string, text: string) => {
        if (game) {
            setIsDirty(true);
            setGame(g => {
                const existing = g!!.nodes.find(x => x.id === nodeId);
                if (existing) {
                    const except = g!!.nodes.filter(x => x.id !== nodeId);
                    return {
                        ...g!!,
                        nodes: [
                            ...except,
                            { ...existing, titleText: text },
                        ],
                    };
                } else return g!!;
            });
        }
    };

    const editNodeBody = (nodeId: string, text: string) => {
        if (game) {
            setIsDirty(true);
            setGame(g => {
                const existing = g!!.nodes.find(x => x.id === nodeId);
                if (existing) {
                    const except = g!!.nodes.filter(x => x.id !== nodeId);
                    return {
                        ...g!!,
                        nodes: [
                            ...except,
                            { ...existing, bodyText: text },
                        ],
                    };
                } else return g!!;
            });
        }
    };

    const editNodePositionX = (nodeId: string, position: number) => {
        if (game) {
            setIsDirty(true);
            setGame(g => {
                const existing = g!!.nodes.find(x => x.id === nodeId);
                if (existing) {
                    const except = g!!.nodes.filter(x => x.id !== nodeId);
                    return {
                        ...g!!,
                        nodes: [
                            ...except,
                            { ...existing, editorPositionX: position },
                        ],
                    };
                } else return g!!;
            });
        }
    };

    const editNodePositionY = (nodeId: string, position: number) => {
        if (game) {
            setIsDirty(true);
            setGame(g => {
                const existing = g!!.nodes.find(x => x.id === nodeId);
                if (existing) {
                    const except = g!!.nodes.filter(x => x.id !== nodeId);
                    return {
                        ...g!!,
                        nodes: [
                            ...except,
                            { ...existing, editorPositionY: position },
                        ],
                    };
                } else return g!!;
            });
        }
    };

    const editEdgeText = (nodeId: string, text: string) => {
        if (game) {
            setIsDirty(true);
            setGame(g => {
                const existing = g!!.nodes.find(x => x.id === nodeId);
                if (existing) {
                    const except = g!!.nodes.filter(x => x.id !== nodeId);
                    return {
                        ...g!!,
                        nodes: [
                            ...except,
                            { ...existing, parentNodeLinkText: text },
                        ],
                    };
                } else return g!!;
            });
        }
    };

    const onNodeDragStop = (_event: MouseEvent, node: Node) => {
        setIsDirty(true);
        editNodePositionX(node.data.id, node.position.x);
        editNodePositionY(node.data.id, node.position.y);
    };

    const NodeTypes = useMemo(() => ({ default: RichGameNode }), []);
    const EdgeTypes = useMemo(() => ({ rich: RichGameEdge }), []);

    return (
        <>
            {editingNode && (
                <NodeEditorFlyout
                    body={editingNode?.bodyText}
                    title={editingNode?.titleText}
                    onBodyTextChange={editNodeBody}
                    onTitleTextChange={editNodeTitle}
                    onCloseFlyout={onCloseNodeFlyout}
                    id={editingNode?.id} />
            )}

            {editingEdge && (
                <EdgeEditorFlyout
                    text={editingEdge?.parentNodeLinkText}
                    onTextChange={editEdgeText}
                    onCloseFlyout={onCloseEdgeFlyout}
                    id={editingEdge?.id} />
            )}

            <div className="flex flex-col relative" style={{ height: "calc(100vh - 155px)" }}>
                <div className="flex flex-row justify-between border-b-4 border-white">
                    <p>
                        <span className="text-gray-400 text-sm mr-4">Editing</span>
                        <span className="text-base">{game?.name}</span>
                    </p>
                    <div className="my-1">
                        <button
                            disabled={!isValidSave || isSaving || !isDirty}
                            onClick={onSave}
                            className="border-4 px-5 leading-8 pb-1 text-green-700 font-mono text-sm uppercase hover:text-green-600 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-50">
                            {isSaving ? "Saving..." : isValidSave ? isDirty ? "Save *" : "Save" : "Cannot save"}
                        </button>
                    </div>
                </div>
                <ReactFlowProvider>
                    <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                        <NodeEditorToolbar />
                        <ReactFlow
                            edges={edges}
                            nodes={nodes}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={NodeTypes}
                            edgeTypes={EdgeTypes as any} // TODO: How do make happy????
                            elementsSelectable={true}
                            nodesConnectable={true}
                            nodesDraggable={true}
                            zoomOnScroll={true}
                            panOnScroll={false}
                            onNodeDragStart={onNodeDragStart}
                            onNodeDragStop={onNodeDragStop}
                            panOnDrag={true}
                            onPaneClick={onPaneClick}
                            onPaneScroll={onPaneScroll}
                            snapToGrid={true}
                            onPaneContextMenu={onPaneContextMenu}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onInit={onInit} />
                    </div>
                </ReactFlowProvider>
            </div>
        </>
    );
};

export default NodeEditorPage;