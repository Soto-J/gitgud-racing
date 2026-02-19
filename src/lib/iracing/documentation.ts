import { getAccessToken } from "./helpers/access-token";
import { fetchData } from "./helpers/fetch-data";

export async function fetchDocumentation() {
  const accessToken = await getAccessToken();

  const data = await fetchData(`/data/doc`, accessToken);

  if (!data.ok) {
    return;
  }

  return data.data;
}
