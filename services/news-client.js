export async function fetchTrendingNews() {
  const response = await fetch(`${process.env.NEWS_API_URL}/news?limit=8`, {
    headers: {
      "x-api-key": process.env.NEWS_API_KEY,
    },
  });

  return response.json();
}
