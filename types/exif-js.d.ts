declare module "exif-js" {
  export function getData(img: HTMLImageElement, callback: () => void): void;
  export function getTag(img: HTMLImageElement, tag: string): unknown;
}