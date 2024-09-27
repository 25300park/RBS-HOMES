import { initIndexedDB } from "@/provider/idb-provider";

export async function saveImageToDB(image: File) {
  const db = await initIndexedDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  
  const id = await store.add({
    name: image.name,
    type: image.type,
    size: image.size,
    lastModified: image.lastModified,
    data: await image.arrayBuffer(), // 이미지 데이터를 저장
  });
  
  await tx.done;
  console.log(`Image saved with ID: ${id}`);
}

export async function getAllImagesFromDB() {
  const db = await initIndexedDB();
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  const allImages = await store.getAll();
  await tx.done;
  return allImages;
}
