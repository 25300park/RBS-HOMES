

export const useUploadToS3 = (file: File, index: number, setUploadProgress: any) => {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("files", file);

    xhr.open("POST", "/api/image-upload/unit");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress((prev:any) => {
          const updatedProgress = [...prev];
          updatedProgress[index] = progress;
          return updatedProgress;
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.uploadedUrls[0]); // 업로드된 첫 번째 URL 반환
      } else {
        reject("Upload failed");
      }
    };

    xhr.onerror = () => reject("Upload failed");
    xhr.send(formData);
  });
};