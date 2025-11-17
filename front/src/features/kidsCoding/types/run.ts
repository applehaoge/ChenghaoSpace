export interface RunFileDTO {
  path: string;
  content: string;
}

export interface RunJobDTO {
  protocolVersion: 1;
  files: RunFileDTO[];
  entryPath: string;
}
