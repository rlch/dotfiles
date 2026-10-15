// What replay uses of rrweb-player 2.1.7.
export default class Player {
  constructor(options: {
    target: HTMLElement;
    props: { events: unknown[]; width?: number; height?: number; autoPlay?: boolean; skipInactive?: boolean; showController?: boolean; speedOption?: number[] };
  });
  $destroy(): void;
  triggerResize(): void;
  goto(timeOffset: number, play?: boolean): void;
}
