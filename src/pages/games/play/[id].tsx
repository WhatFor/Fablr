import React, { useState } from "react";
import { useRouter } from "next/router";
import { GameRecordResult} from "@prisma/client";
import { NodeType, type Node as GameNode } from "@prisma/client";
import { trpc } from "utils/trpc";
import { useSession } from "next-auth/react";

interface GameEngineProps { 
    gameId: string,
    isOwnGame: boolean,
    nodes: GameNode[]
}

const GamePlayEngine = ({ gameId, nodes, isOwnGame }: GameEngineProps) => {

    const [result, setResult] = useState<GameRecordResult | null>(null);
    const [currentNode, setCurrentNode] = useState<GameNode | undefined>(nodes.filter(x => x.parentNodeId === null)[0]);
    const [rated, setRated] = useState<boolean>(false);

    const recordGameMutation = trpc.games.createGameRecord.useMutation();
    const rateGameMutation = trpc.games.createGameRating.useMutation();

    const lose = async () => {
        setResult(GameRecordResult.Lose);
        await recordGameMutation.mutateAsync({
            gameId,
            result: GameRecordResult.Lose
        });
    }

    const win = async () => {
        setResult(GameRecordResult.Win);
        await recordGameMutation.mutateAsync({
            gameId,
            result: GameRecordResult.Win
        });
    }

    const rateGame = async (rating: number) => {
        if (rated || isOwnGame) return;

        await rateGameMutation.mutateAsync({
            gameId,
            rating
        });

        setRated(true);
    }

    const selectBranch = (selectionId: string) => {
        const selected = nodes.filter(x => x.id === selectionId)[0];

        if (selected) {
            if (selected.type === NodeType.Lose)
                lose();

            if (selected.type === NodeType.Win)
                win();

            setCurrentNode(selected);
        } else {
            // TODO: Else?
        }
    }

    if (!currentNode) {
        return (
            <p className="text-sm text-red-600 w-full text-center mb-3">
                Uh oh. We can&apos;t find any data.
            </p>
        )
    }

    return (
        <div>
            {currentNode && (
                <div className="">
                    <p className="text-white font-mono uppercase text-base w-1/2 mx-auto border-b-4 border-white">
                        {currentNode.titleText}
                    </p>
                    <p className="text-gray-300 font-mono uppercase text-sm w-1/2 mx-auto my-4">
                        {currentNode.bodyText}
                    </p>
                    <div className="flex flex-row justify-around mt-8 mb-12">
                        {nodes.filter(x => x.parentNodeId === currentNode.id).map(branch => (
                            <p
                                key={branch.id}
                                className="text-gray-300 border-4 px-5 border-white font-mono uppercase text-sm hover:text-red-700 hover:cursor-pointer"
                                onClick={() => selectBranch(branch.id)}>{branch.parentNodeLinkText}
                            </p>
                        ))}
                    </div>
                </div>
            )}
            {result && (
                <div className="w-full flex flex-col items-center pb-4">
                    {result === GameRecordResult.Win && (
                        <div className="text-green-700 font-mono uppercase text-base border-green-700 p-3">
                            Congratulations, you&apos;ve won.
                        </div>
                    )}
                    {result === GameRecordResult.Lose && (
                        <div className="text-red-800 font-mono uppercase text-base border-red-800 p-3">
                            Sorry, you&apos;ve lost.
                        </div>
                    )}
                    {!rated && !isOwnGame ? (
                        <div>
                            <p className="text-white font-mono text-base uppercase">
                                Do you want to rate this game?
                            </p>
                            <div className="rating-group text-white uppercase font-mono text-sm flex justify-around mb-6">
                                <span className="border-b-4 p-1 px-3 cursor-pointer hover:text-gray-300 hover:border-gray-300" onClick={() => rateGame(1)}>1</span>
                                <span className="border-b-4 p-1 px-3 cursor-pointer hover:text-gray-300 hover:border-gray-300" onClick={() => rateGame(2)}>2</span>
                                <span className="border-b-4 p-1 px-3 cursor-pointer hover:text-gray-300 hover:border-gray-300" onClick={() => rateGame(3)}>3</span>
                                <span className="border-b-4 p-1 px-3 cursor-pointer hover:text-gray-300 hover:border-gray-300" onClick={() => rateGame(4)}>4</span>
                                <span className="border-b-4 p-1 px-3 cursor-pointer hover:text-gray-300 hover:border-gray-300" onClick={() => rateGame(5)}>5</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-white font-mono text-base uppercase">
                            Thank you!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const PlayGamePage = () => {

    const session = useSession();
    const router = useRouter();
    const { data: game, isLoading } = trpc.games.findSingleWithNodes.useQuery({ id: router.query.id as string });

    if (isLoading) return (
        <>...</>
    )

    return (
        <div className="flex flex-col px-2">
            {game && (
                <>
                    <div className="flex flex-col border-b-4 border-white mb-3 w-full">
                        <p className="text-base">{game.name}</p>
                        <div className="flex justify-between">
                            <p className="text-gray-300 text-sm -mt-2">{game.description}</p>
                            <p className="text-gray-300 text-sm -mt-2">{game.author.name}</p>
                        </div>
                    </div>
                    <div>
                        <GamePlayEngine
                            gameId={game.id}
                            nodes={game.nodes}
                            isOwnGame={game.authorId === session.data?.user?.id} />
                    </div>
                </>
            )}
        </div>
    );
};

export default PlayGamePage;