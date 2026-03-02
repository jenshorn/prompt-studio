type DocFile = {
  path: string;
  content: string;
};

type SaveDocsResult = {
  updatedCount: number;
  removedCount: number;
};

export const saveDocs = async (baseUrl: string, projectId: string, files: DocFile[]) => {
  const res = await fetch(`${baseUrl}/v1/projects/${projectId}/docs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ files }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save docs: ${res.status}`);
  }

  return (await res.json()) as SaveDocsResult;
};
