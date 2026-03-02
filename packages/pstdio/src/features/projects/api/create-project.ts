type Project = {
  id: string;
  name: string;
};

export const createProject = async (baseUrl: string, name: string) => {
  const res = await fetch(`${baseUrl}/v1/projects`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create project: ${res.status}`);
  }

  return (await res.json()) as Project;
};
