declare module 'd3-cloud' {
  interface CloudWord {
    text: string;
    size: number;
    x: number;
    y: number;
    rotate: number;
  }

  interface CloudLayout {
    size: (size: [number, number]) => CloudLayout;
    words: (words: Array<{ text: string; value: number }>) => CloudLayout;
    padding: (padding: number) => CloudLayout;
    rotate: (rotate: () => number) => CloudLayout;
    font: (font: string) => CloudLayout;
    fontSize: (fontSize: (d: { value: number }) => number) => CloudLayout;
    on: (event: string, callback: (words: CloudWord[]) => void) => CloudLayout;
    start: () => void;
  }

  function cloud(): CloudLayout;
  export default cloud;
} 