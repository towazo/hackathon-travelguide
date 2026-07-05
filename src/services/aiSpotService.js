export async function getSpots(searchParams) {
  const response = await fetch("/api/spots", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(searchParams),
  });

  if (!response.ok) {
    throw new Error("寄り道スポットの取得に失敗しました。");
  }

  return response.json();
}