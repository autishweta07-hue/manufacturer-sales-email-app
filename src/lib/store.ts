import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AppState } from './types';
import { newId } from './id';

export { newId } from './id';

const DEFAULT_STATE: AppState = {
  version: 1,
  imports: [],
  activeImportId: null,
  campaigns: [],
  optOuts: [],
  decks: []
};

function dataDir(): string {
  const configured = process.env.DATA_DIR || './data';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

export function storagePaths() {
  const root = dataDir();
  return {
    root,
    state: path.join(root, 'state.json'),
    uploads: path.join(root, 'uploads'),
    decks: path.join(root, 'decks')
  };
}

async function ensureDirs() {
  const paths = storagePaths();
  await mkdir(paths.root, { recursive: true });
  await mkdir(paths.uploads, { recursive: true });
  await mkdir(paths.decks, { recursive: true });
}

type Queue = Promise<unknown>;
const globalStore = globalThis as unknown as { __emailAppQueue?: Queue };
if (!globalStore.__emailAppQueue) globalStore.__emailAppQueue = Promise.resolve();

export async function readState(): Promise<AppState> {
  await ensureDirs();
  const { state: statePath } = storagePaths();
  try {
    const raw = await readFile(statePath, 'utf8');
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.campaigns)) return { ...DEFAULT_STATE };
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { ...DEFAULT_STATE };
    throw error;
  }
}

export async function mutateState<T>(mutator: (state: AppState) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const state = await readState();
    const result = await mutator(state);
    const { state: statePath } = storagePaths();
    const tempPath = `${statePath}.${newId()}.tmp`;
    await writeFile(tempPath, JSON.stringify(state, null, 2), 'utf8');
    await rename(tempPath, statePath);
    return result;
  };
  const next = globalStore.__emailAppQueue!.then(run, run);
  globalStore.__emailAppQueue = next.catch(() => undefined);
  return next;
}

export async function saveUpload(bytes: Buffer, originalName: string): Promise<string> {
  await ensureDirs();
  const storedName = `${newId()}-${path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  await writeFile(path.join(storagePaths().uploads, storedName), bytes);
  return storedName;
}

export function uploadPath(storedName: string): string {
  return path.join(storagePaths().uploads, path.basename(storedName));
}

export async function saveDeck(bytes: Buffer, originalName: string): Promise<{ storedName: string; mimeType: string }> {
  await ensureDirs();
  const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storedName = `${newId()}-${safeName}`;
  await writeFile(path.join(storagePaths().decks, storedName), bytes);
  const ext = path.extname(safeName).toLowerCase();
  const mimeType =
    ext === '.pdf'
      ? 'application/pdf'
      : ext === '.pptx'
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : ext === '.ppt'
          ? 'application/vnd.ms-powerpoint'
          : 'application/octet-stream';
  return { storedName, mimeType };
}

export function deckPath(storedName: string): string {
  return path.join(storagePaths().decks, path.basename(storedName));
}

export async function removeStoredFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
