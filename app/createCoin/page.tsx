'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCoinsPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // 파일 업로드용 state
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      alert('Please select an image file.');
      return;
    }

    try {
      // 1) FormData 생성
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', file); // 필드명 'image'로 서버에 전송

      // 2) fetch로 전송 (headers에 Content-Type 설정 X)
      const res = await fetch('/api/coins', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // 성공 시 다른 페이지로 이동
        router.push('/getCoins');
      } else {
        console.error('Failed to create coin');
      }
    } catch (error) {
      console.error('Error creating coin:', error);
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Coin (File Upload)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter coin title"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border border-gray-300 rounded p-2"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter coin description"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
            className="file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Coin
        </button>
      </form>
    </main>
  );
}
