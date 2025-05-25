// lib/geoapify.ts

export async function fetchGeoapifyData(user_input: string) {
  console.log('User Input: ', user_input);

  const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/us-public-schools/records?select=name%2C%20address&where=search("${user_input}")&limit=4`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`opendatasoft error: ${response.status}`);
    }

    const data = await response.json();
    console.log('opendatasoft data:', data);
    return data;
  } catch (error) {
    console.error('opendatasoft fetch error:', error);
    return null;
  }
}
