declare module 'wordcloud2' {
  interface WordCloudOptions {
    list: [string, number][];
    gridSize?: number;
    weightFactor?: number;
    fontFamily?: string;
    color?: string | ((word: string, weight: number) => string);
    hover?: ((item: any, dimension: any) => void) | null;
    click?: ((item: any) => void) | null;
    minSize?: number;
    backgroundColor?: string;
    drawOutOfBound?: boolean;
    shrinkToFit?: boolean;
    shuffle?: boolean;
    rotateRatio?: number;
    shape?: 'circle' | 'cardioid' | 'diamond' | 'square' | 'triangle' | 'triangle-forward' | 'triangle-upright' | 'pentagon' | 'star';
    ellipticity?: number;
    classes?: string | null;
    minRotation?: number;
    maxRotation?: number;
    padding?: number;
    width?: number;
    height?: number;
  }

  function WordCloud(canvas: HTMLCanvasElement | any, options: WordCloudOptions): void;
  export default WordCloud;
} 