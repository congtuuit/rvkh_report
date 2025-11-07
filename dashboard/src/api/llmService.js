// llmService.js
/**
 * Gửi truy vấn đến API
 * @param {string} query - Câu hỏi muốn gửi
 * @param {number} top_k - Số kết quả trả về
 */
export async function askQueryAsync(query, top_k = 20) {
  const url = 'https://services.reviewkhoahoc.net/ask';
  const data = { query, top_k };
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': '_wpid=1; cfwp=5c'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Response:', result);
    return result;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}
