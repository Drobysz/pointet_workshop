type PageItem = number | "start-ellipsis" | "end-ellipsis";

export const getPageItems = (
  currentPage: number, 
  lastPage: number,
  isLimitLong: boolean
): PageItem[] => {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, lastPage]);
  const range = isLimitLong ? 2 : 1;

  for (let page = currentPage - range; page <= currentPage + range; page += 1) {
    if (page > 1 && page < lastPage) {
      pages.add(page);
    }
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const items: PageItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push(previousPage === 1 ? "start-ellipsis" : "end-ellipsis");
    }

    items.push(page);
  });

  return items;
};