interface Window {
  twttr?: {
    ready: (fn: () => void) => void;
    widgets: {
      createTweet: (
        tweetId: string,
        container: HTMLElement,
        options?: Record<string, unknown>
      ) => Promise<HTMLElement>;
    };
  };
}
