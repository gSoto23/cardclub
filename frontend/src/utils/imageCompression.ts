/**
 * Comprime y redimensiona una imagen utilizando un Canvas HTML5.
 * 
 * @param file El archivo original (File)
 * @param maxWidth Ancho máximo permitido (por defecto 1200)
 * @param maxHeight Alto máximo permitido (por defecto 1200)
 * @param quality Calidad de la compresión (0 a 1)
 * @returns Promesa que resuelve en un objeto File optimizado
 */
export const compressImage = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Si el archivo no es una imagen o es un SVG, lo retornamos tal cual
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo el ratio de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Si no soporta canvas, retornar original
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Intentar usar WebP, si no, fallback a JPEG
        const mimeType = "image/webp"; // WebP suele comprimir mucho mejor
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Convertir el Blob en un File con el mismo nombre pero con la extensión correcta
              const originalName = file.name;
              const newName = originalName.replace(/\.[^/.]+$/, "") + ".webp";
              const optimizedFile = new File([blob], newName, {
                type: mimeType,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file); // Fallback
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = (error) => {
        console.error("Error cargando imagen para compresión:", error);
        resolve(file); // Fallback en caso de error
      };
    };

    reader.onerror = (error) => {
      console.error("Error leyendo archivo:", error);
      reject(error);
    };
  });
};
