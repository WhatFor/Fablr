import classNames from "classnames";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import type { Game } from "@prisma/client";
import { trpc } from "utils/trpc";

const EditGamePage = () => {
    const router = useRouter();

    const {data: gameQuery, isLoading } = trpc.games.findSingle.useQuery({ id: router.query.id as string });
    const gameMutation = trpc.games.updateSingle.useMutation();

    const [game, setGame] = useState<Game>();
    const [dirty, setDirty] = useState<boolean>(false);
    const [updated, setUpdated] = useState<boolean>(false);

    const handleGameNameChange = (evt: React.FormEvent<HTMLInputElement>) => {
        if (game) {
            setDirty(true);
            setUpdated(false);
            setGame({
                ...game,
                name: evt.currentTarget.value,
            });
        }
    };

    const handleGameDescriptionChange = (evt: React.FormEvent<HTMLTextAreaElement>) => {
        if (game) {
            setDirty(true);
            setUpdated(false);
            setGame({
                ...game,
                description: evt.currentTarget.value,
            });
        }
    };

    useEffect(() => {
        if (gameQuery)
            setGame(gameQuery);
    }, [ gameQuery ]);

    const handleSubmit = async () => {
        if (game) {
            if (!dirty) return;

            try {
                await gameMutation.mutateAsync({
                    id: game.id,
                    name: game.name,
                    description: game.description
                });

                setDirty(false);
                setUpdated(true);

            } catch (error) {
                toast.error("Something went wrong.");
            }
        }
    };

    const handlePublish = async () => {
        if (game) {
            try {
                const updated = await gameMutation.mutateAsync({
                    id: game.id,
                    isPublic: true
                });

                setGame(updated);

            } catch (error) {
                toast.error("Something went wrong.");
            }
        }
    };

    const handleUnpublish = async () => {
        if (game) {
            try {
                const updated = await gameMutation.mutateAsync({
                    id: game.id,
                    isPublic: false
                });

                setGame(updated);

            } catch (error) {
                toast.error("Something went wrong.");
            }
        }
    };
    
    return (
        <>
            {game && (

                <div className="flex flex-col px-3 max-w-2xl mx-auto">
                    <div className="flex flex-row justify-between">
                        <span className="text-gray-400 mr-5 text-base">
                            Editing Game
                        </span>
                        <span className="text-base">
                            {game.isPublic ? (
                                <span className="text-green-600">Public</span>
                            ) : (
                                <span className="text-yellow-600">Unpublished</span>
                            )}
                        </span>
                    </div>

                    {dirty && (
                        <p className="text-sm text-yellow-600 -mt-2">Unsaved Changes...</p>
                    )}

                    {updated && (
                        <p className="text-sm text-green-600 -mt-2">Changes Saved.</p>
                    )}

                    <label htmlFor="game-name" className="text-sm">Game Name</label>
                    <input
                        id="game-name"
                        autoComplete="off"
                        onChange={handleGameNameChange}
                        value={game.name}
                        className="mb-6 border-4 border-white px-3 text-sm" />

                    <label htmlFor="desc" className="text-sm">Description</label>
                    <textarea
                        title="description"
                        id="desc"
                        autoComplete="off"
                        value={game.description}
                        className="text-sm border-4 border-white px-3 mb-6"
                        onChange={handleGameDescriptionChange} />

                    <p className="text-sm">Stats</p>
                    <div className="border-4 border-white px-3 mb-6">
                        <p className="text-sm text-gray-400">
                            Rating:
                            {/* TODO: Calculated columns */}
                            {/* <span className="ml-2 text-white">{game.rating ?? "UNRATED"}</span> */}
                        </p>
                        <p className="text-sm text-gray-400">
                            Wins:
                            {/* <span className="ml-2 text-white">{game.totalPlaysWin}</span> */}
                        </p>
                        <p className="text-sm text-gray-400">
                            Losses:
                            {/* <span className="ml-2 text-white">{game.totalPlaysLose}</span> */}
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!dirty || isLoading}
                        className={classNames(
                            "disabled:opacity-40 mx-auto mb-4 w-1/2 text-sm border-4",
                            "text-green-700 hover:text-green-600 rounded-none uppercase px-4 pb-1",
                        )}>
                        Save Changes
                    </button>

                    {game.isPublic === false ? (
                        <button
                            onClick={handlePublish}
                            disabled={isLoading}
                            className={classNames(
                                "disabled:opacity-40 mx-auto mb-6 w-1/2 text-sm border-4",
                                "text-green-700 hover:text-green-600 rounded-none uppercase px-4 pb-1",
                            )}>
                            Publish Game
                        </button>
                    ) : (
                        <button
                            onClick={handleUnpublish}
                            disabled={isLoading}
                            className={classNames(
                                "disabled:opacity-40 mx-auto mb-6 w-1/2 text-sm border-4",
                                "text-yellow-600 hover:text-yellow-500 rounded-none uppercase px-4 pb-1",
                            )}>
                            Unpublish Game
                        </button>
                    )}

                    <Link
                        href={`/games/edit/${game.id}/node-editor`}
                        className="text-center mx-auto mb-6 w-1/2 text-sm border-4 hover:text-gray-400 rounded-none uppercase px-4 pb-1">
                        Node Editor
                    </Link>
                </div>
            )}
        </>
    );
};

export default EditGamePage;