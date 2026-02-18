interface Window {
  twttr?: {
    widgets: {
      createTweet: (
        tweetId: string,
        container: HTMLElement,
        options?: Record<string, unknown>
      ) => Promise<HTMLElement>;
    };
  };
}
