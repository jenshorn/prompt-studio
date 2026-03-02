type DocFile = {
  path: string;
  content: string;
};

type PullDocsResult = {
  files: DocFile[];
};

export const pullDocs = async (baseUrl: string, projectId: string) => {
  const res = await fetch(`${baseUrl}/v1/projects/${projectId}/docs`);

  if (!res.ok) {
    throw new Error(`Failed to pull docs: ${res.status}`);
  }

  return (await res.json()) as PullDocsResult;
};
