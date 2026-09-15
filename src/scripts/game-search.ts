// Filters over every rendered card (full catalog), not just the default visible slice.
export function initGameSearch(): void {
    const searchInput = document.getElementById('game-search') as HTMLInputElement | null;
    const grid = document.getElementById('games-grid');
    const count = document.getElementById('game-count');
    const emptyState = document.getElementById('empty-search');

    if (!searchInput || !grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-game-card]'));
    const defaultStart = Number(grid.dataset.defaultStart ?? '0');
    const defaultEnd = Number(grid.dataset.defaultEnd ?? String(cards.length));

    const showDefault = () => {
        cards.forEach((card, index) => {
            card.hidden = index < defaultStart || index >= defaultEnd;
        });
        if (count) count.textContent = String(Math.max(0, defaultEnd - defaultStart));
        if (emptyState) emptyState.hidden = true;
    };

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            showDefault();
            return;
        }

        let visibleGames = 0;
        cards.forEach((card) => {
            const matches = card.dataset.search?.includes(query) ?? false;
            card.hidden = !matches;
            if (matches) visibleGames += 1;
        });

        if (count) count.textContent = String(visibleGames);
        if (emptyState) emptyState.hidden = visibleGames > 0;
    });
}
