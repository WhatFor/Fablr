import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { trpc } from "utils/trpc";
import classNames from "classnames";

const NewGamePage = () => {
    const router = useRouter();
    const createGame = trpc.games.create.useMutation();

    const [gameName, setGameName] = useState<string>();
    const [gameDesc, setGameDesc] = useState<string>();
    
    const handleSubmit = async () => {
        if (isValid) {
            try {
                const game = await createGame.mutateAsync({ name: gameName, description: gameDesc });
                toast.success("Game created.");
                router.push("/games/edit/" + game.id);
            } catch (error) {
                toast.error("Something went wrong");
            }
            
        }
    };

    const isValid = gameName && gameDesc;

    return (
        <div className="flex flex-col px-2 py-6 max-w-2xl mx-auto">
            <p className="text-base leading-none mb-3">Create a new Game</p>

            <label htmlFor="game-name" className="text-sm">Game Name *</label>
            <input
                id="game-name"
                autoComplete="off"
                className="bg-black text-sm uppercase mb-3 border-4 border-white px-4"
                onChange={(evt) => setGameName(evt.currentTarget.value)} />

            <label htmlFor="desc" className="text-sm">Description *</label>
            <textarea
                title="description"
                id="desc"
                autoComplete="off"
                className="bg-black text-sm uppercase border-4 border-white px-3 mb-6"
                onChange={(evt) => setGameDesc(evt.currentTarget.value)} />

            <button
                disabled={!isValid}
                onClick={handleSubmit}
                className={classNames(
                    "mx-auto w-1/2 text-sm border-4 text-green-700 hover:text-green-600",
                    "rounded-none uppercase px-4 pb-1 disabled:cursor-not-allowed",
                    "disabled:opacity-50")}>
                Create Game
            </button>
            
        </div>
    );
};

export default NewGamePage;