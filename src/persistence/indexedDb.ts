import type { CalendarProject, PhotoAsset, ProjectState } from '../domain/project.ts';
import { referencedAssetIds, savedAssets, validateProjectState } from './serialization.ts';

const DB_NAME = 'calendar-design-studio-v1';
const DB_VERSION = 1;
export interface ExpectedRevision { id: string; revision: number }
export class StaleProjectError extends Error {
  constructor() { super('此项目已在其他标签页更新。请刷新页面，避免覆盖较新的内容。'); this.name = 'StaleProjectError'; }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(Error('此浏览器无法使用本地项目存储。')); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('project')) db.createObjectStore('project');
      if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? Error('无法打开本地项目存储。'));
    request.onblocked = () => reject(Error('本地项目存储被其他标签页占用，请关闭旧标签页后重试。'));
  });
}
function matches(stored: CalendarProject | undefined, expected: ExpectedRevision | null): boolean {
  return expected === null ? !stored : !!stored && stored.id === expected.id && stored.revision === expected.revision;
}

export async function loadProject(): Promise<ProjectState | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let project: CalendarProject | undefined;
    const assets: Record<string, PhotoAsset> = {};
    const tx = db.transaction(['project', 'assets'], 'readonly');
    tx.oncomplete = () => {
      db.close();
      if (!project) { resolve(null); return; }
      try { resolve(validateProjectState({ project, assets })); } catch (error) { reject(error); }
    };
    tx.onabort = () => { db.close(); reject(tx.error ?? Error('无法读取已保存的项目。')); };
    const request = tx.objectStore('project').get('active');
    request.onsuccess = () => {
      project = request.result as CalendarProject | undefined;
      if (!project) return;
      const assetStore = tx.objectStore('assets');
      for (const id of referencedAssetIds(project)) {
        const assetRequest = assetStore.get(id);
        assetRequest.onsuccess = () => { if (assetRequest.result) assets[id] = assetRequest.result as PhotoAsset; };
      }
    };
  });
}

export async function commitProject(state: ProjectState, expected: ExpectedRevision | null, options?: { injectAbort?: boolean }): Promise<CalendarProject> {
  validateProjectState(state);
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let stale = false;
    let next: CalendarProject | null = null;
    const tx = db.transaction(['project', 'assets'], 'readwrite');
    tx.oncomplete = () => { db.close(); if (!next) reject(Error('保存未写入项目。')); else resolve(next); };
    tx.onabort = () => { db.close(); reject(stale ? new StaleProjectError() : tx.error ?? Error('本地保存失败，请重试。')); };
    const projectStore = tx.objectStore('project');
    const assetStore = tx.objectStore('assets');
    const current = projectStore.get('active');
    current.onsuccess = () => {
      const stored = current.result as CalendarProject | undefined;
      if (!matches(stored, expected)) { stale = true; tx.abort(); return; }
      next = { ...state.project, revision: (stored?.revision ?? 0) + 1, updatedAt: new Date().toISOString() };
      const allKeys = assetStore.getAllKeys();
      allKeys.onsuccess = () => {
        const currentIds = new Set(allKeys.result.map(String));
        const wantedIds = referencedAssetIds(state.project);
        for (const id of currentIds) if (!wantedIds.has(id)) assetStore.delete(id);
        for (const asset of savedAssets(state)) if (!currentIds.has(asset.id)) assetStore.put(asset);
        projectStore.put(next!, 'active');
        if (options?.injectAbort) tx.abort();
      };
    };
  });
}

export async function replaceProject(expected: ExpectedRevision | null, options?: { injectAbort?: boolean }): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let stale = false;
    const tx = db.transaction(['project', 'assets'], 'readwrite');
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(stale ? new StaleProjectError() : tx.error ?? Error('无法新建日历，原项目仍已保留。')); };
    const projectStore = tx.objectStore('project');
    const current = projectStore.get('active');
    current.onsuccess = () => {
      if (!matches(current.result as CalendarProject | undefined, expected)) { stale = true; tx.abort(); return; }
      projectStore.delete('active');
      tx.objectStore('assets').clear();
      if (options?.injectAbort) tx.abort();
    };
  });
}
