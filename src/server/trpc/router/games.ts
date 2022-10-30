import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { GameRating, GameRecord, GameRecordResult, type Game } from "@prisma/client";

export const gamesRouter = router({

    findSingle: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.game.findUniqueOrThrow({ 
                where: {
                    id: input.id
                }
            })
        }),

    findSingleWithNodes: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.game.findUniqueOrThrow({ 
                where: {
                    id: input.id
                },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    nodes: true,
                }
            })
        }),
        
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            description: z.string(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.game.create({
                data: {
                    name: input.name,
                    description: input.description,
                    authorId: ctx.session.user.id,
                } as Game
            })
        }),

    createGameRecord: protectedProcedure
        .input(z.object({
            gameId: z.string(),
            result: z.nativeEnum(GameRecordResult),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.gameRecord.create({
                data: {
                    gameId: input.gameId,
                    result: input.result,
                    playerId: ctx.session.user.id
                } as GameRecord
            })
        }),

    createGameRating: protectedProcedure
        .input(z.object({
            gameId: z.string(),
            rating: z.number(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.gameRating.create({
                data: {
                    gameId: input.gameId,
                    rating: input.rating,
                    playerId: ctx.session.user.id
                } as GameRating
            })
        }),
    
    updateSingle: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            isPublic: z.boolean().optional(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.game.update({
                where: { id: input.id },
                data: input
            })
        }),

        updateSingleWithNodes: protectedProcedure
        .input(z.object({
            id: z.string(),
            // TODO: ???? Don't want ANY.
            nodes: z.any(),
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.game.update({
                where: { id: input.id },
                data: {
                    nodes: {
                        // TODO: ?? What about UPDATES, MAN?
                        createMany: {
                            data: input.nodes
                        }
                    }
                }
            })         
        }),

    paginatedSearch: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.number().nullish(),
            gameNameFilter: z.string().nullish(),
            authorNameFilter: z.string().nullish(),
        }).required())
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor } = input;

            const filters = { author: {}, name: {} };

            if (input.authorNameFilter)
                filters.author = { is: { name: { contains: input.authorNameFilter } } };

            if (input.gameNameFilter)
                filters.name = { contains: input.gameNameFilter };

            const items = await ctx.prisma.game.findMany({
                take: limit,
                where: filters,
                // TODO: Probably doesnt work
                //cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    name: 'asc',
                },
                include: {
                    author: {
                        select: {
                            name: true
                        }
                    },
                    ratings: true
                }
            })

            const nextCursor: typeof cursor | undefined = undefined;

            if (items.length > limit) {
                const nextItem = items.pop()
                // nextCursor = nextItem.myCursor;
            }

            return {
                items,
                nextCursor,
            };
        }),
});
