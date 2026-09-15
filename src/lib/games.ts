const GAME_FEED_URL = 'https://gamemonetize.com/feed.php?format=0';
const DEFAULT_GAME_LIMIT = 10000;

export interface Game {
    title: string;
    slug: string;
    description: string;
    thumb: string;
    instructions: string;
    tags: string;
    width: number;
    height: number;
    url: string;
    category: string;
}

interface RawGame {
    title?: string;
    description?: string;
    thumb?: string;
    instructions?: string;
    tags?: string;
    width?: number | string;
    height?: number | string;
    url?: string;
    category?: string;
}

const fallbackText = 'Play a fun free browser game online.';
let gamesCache = new Map<number, Promise<Game[]>>();

export function slugifyGameTitle(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/&amp;/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'game';
}

function toNumber(value: number | string | undefined): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeUrl(url: string | undefined): string {
    return (url || '').replace('gamemonetize.co', 'gamemonetize.games');
}

function normalizeGame(game: RawGame, usedSlugs: Map<string, number>): Game {
    const title = game.title?.trim() || 'Untitled Game';
    const baseSlug = slugifyGameTitle(title);
    const duplicateCount = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, duplicateCount + 1);

    const slug = duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount + 1}`;
    const description = game.description?.trim() || fallbackText;

    return {
        title,
        slug,
        description,
        thumb: game.thumb?.trim() || '/favicon.svg',
        instructions: game.instructions?.trim() || 'Start the game and follow the on-screen instructions.',
        tags: game.tags?.trim() || 'games, online games',
        width: toNumber(game.width),
        height: toNumber(game.height),
        url: normalizeUrl(game.url),
        category: game.category?.trim() || 'Arcade',
    };
}

export async function getGames(limit = DEFAULT_GAME_LIMIT): Promise<Game[]> {
    if (!gamesCache.has(limit)) {
        gamesCache.set(limit, fetchGames(limit));
    }

    return gamesCache.get(limit)!;
}

async function fetchGames(limit: number): Promise<Game[]> {
    const response = await fetch(`${GAME_FEED_URL}&num=${limit}`);

    if (!response.ok) {
        throw new Error(`Failed to load games feed: ${response.status}`);
    }

    const data = await response.json();
    const games = Array.isArray(data) ? data : [];
    const usedSlugs = new Map<string, number>();

    return games.map((game) => normalizeGame(game, usedSlugs));
}
