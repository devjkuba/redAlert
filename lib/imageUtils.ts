export async function compressImage(file: File, maxSizeMB = 5): Promise<Blob> {
  const maxFileSize = maxSizeMB * 1024 * 1024;
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Nepovolit extrémní rozměry
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height *= maxDim / width;
            width = maxDim;
          } else {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject("Nelze převést na blob");
              if (blob.size <= maxFileSize) {
                resolve(blob);
              } else if (quality > 0.1) {
                tryCompress(quality - 0.1); // sníží kvalitu a zkusí znovu
              } else {
                resolve(blob); // když už jsme na limitu, vrátíme to
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress(0.9); // Startovací kvalita
      };

      img.onerror = reject;
      img.src = reader.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
