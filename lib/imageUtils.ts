import EXIF from "exif-js";

export async function fixImageOrientation(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        EXIF.getData(img as HTMLImageElement, () => {
          const orientationRaw = EXIF.getTag(img, "Orientation");
          const orientation = typeof orientationRaw === "number" ? orientationRaw : 1;
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          const width = img.width;
          const height = img.height;

          if (orientation > 4 && orientation < 9) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          switch (orientation) {
            case 2:
              ctx.translate(width, 0);
              ctx.scale(-1, 1);
              break;
            case 3:
              ctx.translate(width, height);
              ctx.rotate(Math.PI);
              break;
            case 4:
              ctx.translate(0, height);
              ctx.scale(1, -1);
              break;
            case 5:
              ctx.rotate(0.5 * Math.PI);
              ctx.scale(1, -1);
              break;
            case 6:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(0, -height);
              break;
            case 7:
              ctx.rotate(0.5 * Math.PI);
              ctx.translate(width, -height);
              ctx.scale(-1, 1);
              break;
            case 8:
              ctx.rotate(-0.5 * Math.PI);
              ctx.translate(-width, 0);
              break;
            default:
              break;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob!), file.type);
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
