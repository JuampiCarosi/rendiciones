// import { useCallback, useRef, useState } from "react";
// import { z } from "zod";
// import { FilePond, registerPlugin } from "react-filepond";
// import FilePondPluginImagePreview from "filepond-plugin-image-preview";
// import "filepond/dist/filepond.min.css";
// import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";

// registerPlugin(FilePondPluginImagePreview);

// export const useFileUpload = <T extends boolean = false>({
//   bucket,
//   allowMultiple,
//   required = true,
//   onSuccess,
//   onError,
//   hash = true,
// }: {
//   allowMultiple?: T;
//   required?: boolean;
//   bucket: string;
//   path?: string;
//   hash?: boolean;
//   onSuccess?: (values: T extends true ? R2File[] : R2File) => void;
//   onError?: (error: unknown) => void;
// }) => {
//   const filePond = useRef<FilePond>(null);
//   const [error, setError] = useState<string | null>(null);
//   const uploader = api.fileManager.upload.useMutation();

//   const upload = useCallback(
//     async (options: {
//       onSuccess?: typeof onSuccess;
//       onError?: (error: unknown) => void;
//       filename?: string | ((name: string) => string);
//       metadata?: Record<string, unknown>;
//       comitenteId?: number;
//       replace?: boolean;
//     }) => {
//       const files = filePond.current?.getFiles() ?? [];
//       if (files?.length === 0) {
//         setError("Debe seleccionar un archivo");
//         options.onError?.(new Error("Debe seleccionar un archivo"));
//         onError?.(new Error("Debe seleccionar un archivo"));
//         return;
//       }

//       const uploads = await Promise.allSettled(
//         files?.map(async (file) => {
//           const newFile = await uploader.mutateAsync({
//             bucket,
//             filename:
//               (typeof options.filename === "function"
//                 ? options.filename(file.filenameWithoutExtension)
//                 : options.filename) ?? file.filenameWithoutExtension,
//             fileExtension: file.fileExtension.toLowerCase(),
//             type: file.fileType,
//             comitenteId: options.comitenteId,
//             metadata: options.metadata,
//             hash,
//             replace: options.replace ?? false,
//           });

//           await fetch(newFile.uploadUrl, { body: file.file, method: "PUT" });

//           return newFile;
//         })
//       );

//       const errors = uploads.filter((upload) => upload.status === "rejected");

//       if (errors.length > 0) {
//         if (allowMultiple) {
//           options.onError?.(errors as never);
//           onError?.(errors as never);
//         } else {
//           options.onError?.(errors[0] as never);
//           onError?.(errors[0] as never);
//         }
//         setError("Error en la subida del archivo a R2");
//       } else {
//         if (allowMultiple) {
//           const uploadsData = uploads.map((r) => (r.status === "fulfilled" ? r.value : null));
//           options.onSuccess?.(uploadsData as never);
//           onSuccess?.(uploadsData as never);
//         } else {
//           if (!uploads[0]) return;
//           const uploadData = uploads[0].status === "fulfilled" ? uploads[0].value : null;
//           options.onSuccess?.(uploadData as never);
//           onSuccess?.(uploadData as never);
//         }
//         filePond.current?.removeFiles();
//       }
//     },
//     [allowMultiple, bucket, hash, onError, onSuccess, uploader]
//   );

//   const FileUpload = useCallback(
//     () => (
//       <>
//         <FilePond
//           credits={false}
//           allowReorder
//           allowBrowse
//           allowDrop
//           allowPaste
//           labelIdle={`Arrastre un archivo o <span class="filepond--label-action">abrir archivos</span>`}
//           ref={filePond}
//           allowMultiple={allowMultiple}
//           required={required}
//         />
//         {error ? <p className="text-red-500">{error}</p> : null}
//       </>
//     ),
//     [allowMultiple, error, required]
//   );
//   return { FileUpload, upload, error };
// };

export default () => null;
