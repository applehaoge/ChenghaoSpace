export interface RunFileDTOV1 {
  path: string;
  content: string;
}

export interface RunJobDTOV1 {
  protocolVersion: 1;
  files: RunFileDTOV1[];
  entryPath: string;
}

export type RunFileEncoding = 'utf8' | 'base64';

export interface RunFileDTO {
  path: string;
  content: string;
  encoding: RunFileEncoding;
}

export interface RunJobDTO {
  protocolVersion: 2;
  language: 'python';
  files: RunFileDTO[];
  entryPath: string;
}
