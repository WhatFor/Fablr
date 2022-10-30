import React, { useState } from "react";
import Link from "next/link";
import { useDebounce } from "hooks/useDebouce";
import { trpc } from "utils/trpc";
import { useSession } from "next-auth/react";

const GamesPage = () => {
    const session = useSession();

    const [searchGameName, setSearchGameName] = useState<string>("");
    const deboucedGameName = useDebounce(searchGameName, 300);

    const [searchAuthor, setSearchAuthor] = useState<string>("");
    const debouceGameAuthor = useDebounce(searchAuthor, 300);

    const paginatedGamesQuery = trpc.games.paginatedSearch.useQuery(
        {
            limit: 10,
            authorNameFilter: debouceGameAuthor,
            gameNameFilter: deboucedGameName,
        },
        { getNextPageParam: (lastPage) => lastPage.nextCursor});

    const getRatingColor = (rating: number): string => 
        rating < 2
            ? "#B91C1C"
            : rating < 4
                ? "#D97706"
                : "#059669";

    const truncate = (str: string, len: number) => {
        return (str.length > len) ? str.substring(0, len - 1) + "..." : str;
    }

    return (
        <div className="px-2 py-6 space-y-3">
            <div className="flex justify-between">
                <div className="flex space-x-6">
                    <input
                        type="text"
                        className="bg-black text-sm px-3 py-0 rounded-none border-4"
                        placeholder="GAME NAME..."
                        onChange={(evt) => setSearchGameName(evt.currentTarget.value)}
                    />
                    <input
                        type="text"
                        className="bg-black text-sm px-3 py-0 rounded-none border-4"
                        placeholder="AUTHOR NAME..."
                        onChange={(evt) => setSearchAuthor(evt.currentTarget.value)}
                    />
                </div>
                <div>
                    <Link
                        className="text-sm border-4 text-green-700 hover:text-green-600 rounded-none px-4 pt-3 pb-4" 
                        href="games/new">
                        Create a Game
                    </Link>
                </div>
            </div>
            <div className="flex">
                {paginatedGamesQuery.isFetching && (
                    <p className="text-white font-mono text-sm uppercase">...</p>
                )}
            </div>
            <div className="flex">
                {paginatedGamesQuery.data?.items && paginatedGamesQuery.data.items.length > 0 ? (
                    <table className="min-w-full">
                        <thead className="border-b-4 border-white">
                            <tr className="text-sm">
                                <td className="text-left pr-5">Name</td>
                                <td className="text-left pr-5">Description</td>
                                <td className="text-left pr-5">Rating</td>
                                <td className="text-left pr-5">Author</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {/* TODO: Pages??? */}
                            {paginatedGamesQuery.data.items.map(r => (
                                <tr key={r.id} className="text-sm">
                                    <td className="leading-5 pr-5" title={r.name}>{truncate(r.name, 30)}</td>
                                    <td className="leading-5 pr-5" title={r.description}>{truncate(r.description, 30)}</td>
                                    {/* TODO: No longer have ratings from server, yet */}
                                    {/* <td style={{ color: getRatingColor(r.ratings) }}>{r.rating}</td> */}
                                    <td className="pr-5">{r.author.name}</td>
                                    <td className="pr-5">
                                        {r.isPublic ? (
                                            <span className="text-green-600">Public</span>
                                        ) : (
                                            <span className="text-yellow-600">Private</span>
                                        )}
                                    </td>
                                    <td>
                                        <Link className="hover:text-green-500 hover:cursor-pointer pr-4" href={`games/play/${r.id}`}>
                                            Play
                                        </Link>
                                    </td>
                                    {r.authorId === session.data?.user?.id && (
                                        <td>
                                            <Link className="hover:text-yellow-600 hover:cursor-pointer" href={`games/edit/${r.id}`}>
                                                Edit
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm">No Results</p>
                )}
            </div>
        </div>
    );
};

export default GamesPage;