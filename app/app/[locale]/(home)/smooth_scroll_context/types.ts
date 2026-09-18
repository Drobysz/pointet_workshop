export type ScrollToOptions = {
    block?: 'start' | 'center' | 'end';
    immediate?: boolean;
};

export type SmoothScrollContextValue = {
    scrollTo: (target: HTMLElement, options?: ScrollToOptions) => void;
    scrollToTop: () => void;
};
