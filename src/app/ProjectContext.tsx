import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { addImportedAssets, applyAssignment, type AssignmentCommand, type CommandResult } from '../domain/assignment.ts';
import { createEmptyProject, type CalendarProject, type CropState, type HexColor, type PhotoAsset, type ProjectState, type TextScale, type TypographyPresetId, type ImportantMarkStyle } from '../domain/project.ts';
import type { Location } from './navigation.ts';
import type { MonthNumber } from '../domain/calendar.ts';
import { updateMonthCrop } from '../domain/crop.ts';
import { canonicalHex } from '../domain/color.ts';
import { isTextureId, type TextureId } from '../domain/texture.ts';
import { isImportantMarkStyle, toggleImportantDay } from '../domain/importantDates.ts';
import { isPhotoEffect, type PhotoEffect } from '../domain/photoEffect.ts';
import { applyColorBatch, restoreColorBatch } from '../domain/batchColors.ts';
import { commitProject, loadProject, replaceProject, StaleProjectError, type ExpectedRevision } from '../persistence/indexedDb.ts';

type Action =
  | { type: 'start-empty'; id: string }
  | { type: 'start-import'; id: string; assets: PhotoAsset[]; itemIds: string[] }
  | { type: 'import'; assets: PhotoAsset[]; itemIds: string[]; target?: MonthNumber }
  | { type: 'command'; command: AssignmentCommand }
  | { type: 'location'; location: Location }
  | { type: 'set-crop'; month: MonthNumber; crop: CropState }
  | { type: 'set-photo-effect'; month: MonthNumber; effect: PhotoEffect }
  | { type: 'set-background'; month: MonthNumber; color: HexColor }
  | { type: 'set-texture'; month: MonthNumber; texture: TextureId }
  | { type: 'apply-color-batch'; colors: Partial<Record<MonthNumber, HexColor>> }
  | { type: 'restore-color-batch' }
  | { type: 'toggle-important-day'; month: MonthNumber; day: number }
  | { type: 'set-important-mark-style'; style: ImportantMarkStyle }
  | { type: 'set-ink'; month: MonthNumber; mode: 'auto' | 'custom'; color?: HexColor }
  | { type: 'set-typography'; presetId?: TypographyPresetId; scale?: TextScale };
type InternalAction = Action | { type: 'restore'; state: ProjectState | null } | { type: 'clear' } | { type: 'save-ack'; project: CalendarProject };
interface RuntimeState { projectState: ProjectState | null; affectedMonths: MonthNumber[]; changeId: number }
const INITIAL: RuntimeState = { projectState: null, affectedMonths: [], changeId: 0 };
function changed(runtime: RuntimeState, projectState: ProjectState, affectedMonths = runtime.affectedMonths): RuntimeState {
  return { projectState, affectedMonths, changeId: runtime.changeId + 1 };
}
function reducer(runtime: RuntimeState, action: InternalAction): RuntimeState {
  if (action.type === 'restore') return { projectState: action.state, affectedMonths: [], changeId: 0 };
  if (action.type === 'clear') return INITIAL;
  if (action.type === 'save-ack') {
    if (!runtime.projectState || runtime.projectState.project.id !== action.project.id) return runtime;
    return { ...runtime, projectState: { ...runtime.projectState, project: { ...runtime.projectState.project, revision: action.project.revision, updatedAt: action.project.updatedAt } } };
  }
  if (action.type === 'start-empty') return changed(runtime, createEmptyProject(action.id), []);
  if (action.type === 'start-import') {
    const result = addImportedAssets(createEmptyProject(action.id), action.assets, action.itemIds);
    return changed(runtime, result.state, result.affectedMonths);
  }
  if (!runtime.projectState) return runtime;
  if (action.type === 'apply-color-batch' || action.type === 'restore-color-batch') {
    const current = runtime.projectState.project;
    const project = action.type === 'apply-color-batch' ? applyColorBatch(current, action.colors) : restoreColorBatch(current);
    return project === current ? runtime : changed(runtime, { ...runtime.projectState, project });
  }
  if (action.type === 'set-important-mark-style') {
    if (!isImportantMarkStyle(action.style) || runtime.projectState.project.importantMarkStyle === action.style) return runtime;
    return changed(runtime, { ...runtime.projectState, project: { ...runtime.projectState.project, importantMarkStyle: action.style } });
  }
  if (action.type === 'toggle-important-day') {
    const current = runtime.projectState.project;
    const slot = current.months[action.month];
    const next = toggleImportantDay(slot, action.day);
    if (next === slot) return runtime;
    return changed(runtime, { ...runtime.projectState, project: { ...current, months: { ...current.months, [action.month]: next } } });
  }
  if (action.type === 'set-texture') {
    if (!isTextureId(action.texture)) return runtime;
    const current = runtime.projectState.project;
    const slot = current.months[action.month];
    if ((slot.style.texture ?? 'none') === action.texture) return runtime;
    const style = { ...slot.style, texture: action.texture };
    return changed(runtime, { ...runtime.projectState, project: { ...current, months: { ...current.months, [action.month]: { ...slot, style } } } });
  }
  if (action.type === 'set-crop') return changed(runtime, updateMonthCrop(runtime.projectState, action.month, action.crop));
  if (action.type === 'set-photo-effect') {
    if (!isPhotoEffect(action.effect)) return runtime;
    const project = runtime.projectState.project;
    const slot = project.months[action.month];
    if (slot.photoEffect?.id === action.effect.id && slot.photoEffect.duotone === action.effect.duotone && !!slot.photoEffect.swapped === !!action.effect.swapped) return runtime;
    return changed(runtime, { ...runtime.projectState, project: { ...project, months: { ...project.months, [action.month]: { ...slot, photoEffect: action.effect } } } });
  }
  if (action.type === 'set-background' || action.type === 'set-ink') {
    const color = action.type === 'set-background' ? canonicalHex(action.color) : action.mode === 'custom' ? canonicalHex(action.color ?? '') : null;
    if ((action.type === 'set-background' || action.mode === 'custom') && !color) return runtime;
    const slot = runtime.projectState.project.months[action.month];
    const style = action.type === 'set-background' ? { ...slot.style, background: color! } :
      { ...slot.style, text: action.mode === 'auto' ? { mode: 'auto' as const } : { mode: 'custom' as const, color: color! } };
    return changed(runtime, { ...runtime.projectState, project: { ...runtime.projectState.project, months: { ...runtime.projectState.project.months, [action.month]: { ...slot, style } }, ...(action.type === 'set-background' ? { colorBatchUndo: undefined } : {}) } });
  }
  if (action.type === 'set-typography') return changed(runtime, { ...runtime.projectState, project: { ...runtime.projectState.project, typography: { ...runtime.projectState.project.typography, ...(action.presetId ? { presetId: action.presetId } : {}), ...(action.scale ? { scale: action.scale } : {}) } } });
  if (action.type === 'location') {
    if (action.location.screen === 'entry') return runtime;
    return changed(runtime, { ...runtime.projectState, project: { ...runtime.projectState.project,
      lastLocation: action.location.screen === 'editor' ? { screen: 'editor', month: action.location.month } : { screen: action.location.screen } } });
  }
  let result: CommandResult;
  if (action.type === 'command') result = applyAssignment(runtime.projectState, action.command);
  else {
    const occupiedTarget = action.target && runtime.projectState.project.months[action.target].photoItemId;
    result = addImportedAssets(runtime.projectState, action.assets, action.itemIds, occupiedTarget ? null : action.target);
    if (occupiedTarget && action.target) result = applyAssignment(result.state, { type: 'replace', target: action.target, itemId: action.itemIds[0] });
  }
  return changed(runtime, result.state, result.affectedMonths);
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'conflict';
interface ProjectController {
  state: ProjectState | null;
  affectedMonths: MonthNumber[];
  hydrated: boolean;
  restoreError: string;
  retryRestore: () => void;
  saveStatus: SaveStatus;
  saveError: string;
  retrySave: () => void;
  replaceActive: () => Promise<boolean>;
  dispatch: (action: Action) => void;
}
const Context = createContext<ProjectController | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [runtime, innerDispatch] = useReducer(reducer, INITIAL);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');
  const expectedRef = useRef<ExpectedRevision | null>(null);
  const savedChangeRef = useRef(0);
  const latestRef = useRef<{ state: ProjectState; changeId: number } | null>(null);
  const saveTaskRef = useRef<Promise<void> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replacingRef = useRef(false);
  const statusRef = useRef<SaveStatus>('idle');
  const runtimeRef = useRef(runtime);
  const channelRef = useRef<BroadcastChannel | null>(null);
  runtimeRef.current = runtime;
  function status(next: SaveStatus) { statusRef.current = next; setSaveStatus(next); }

  useEffect(() => {
    let active = true;
    setHydrated(false);
    loadProject().then(saved => {
      if (!active) return;
      expectedRef.current = saved ? { id: saved.project.id, revision: saved.project.revision } : null;
      savedChangeRef.current = 0;
      innerDispatch({ type: 'restore', state: saved });
      setRestoreError(''); setHydrated(true); status(saved ? 'saved' : 'idle');
    }).catch(error => { if (active) { setRestoreError(error instanceof Error ? error.message : '无法读取已保存的项目。'); setHydrated(false); } });
    return () => { active = false; };
  }, [restoreAttempt]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('calendar-studio-project-v1');
    channelRef.current = channel;
    channel.onmessage = event => {
      const message = event.data as { id: string | null; revision: number } | null;
      if (!message || !runtimeRef.current.projectState) return;
      const expected = expectedRef.current;
      if (!expected || message.id !== expected.id || message.revision > expected.revision) {
        status('conflict'); setSaveError('此项目已在其他标签页更新。请刷新页面，避免覆盖较新的内容。');
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };
    return () => { channel.close(); channelRef.current = null; };
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (saveTaskRef.current) return saveTaskRef.current;
    const task = (async () => {
      while (!replacingRef.current && statusRef.current !== 'conflict' && latestRef.current && latestRef.current.changeId > savedChangeRef.current) {
        const snapshot = latestRef.current;
        try {
          const saved = await commitProject(snapshot.state, expectedRef.current);
          expectedRef.current = { id: saved.id, revision: saved.revision };
          savedChangeRef.current = snapshot.changeId;
          innerDispatch({ type: 'save-ack', project: saved });
          channelRef.current?.postMessage({ id: saved.id, revision: saved.revision });
          setSaveError('');
        } catch (error) {
          status(error instanceof StaleProjectError ? 'conflict' : 'failed');
          setSaveError(error instanceof Error ? error.message : '本地保存失败，请重试。');
          return;
        }
      }
      if (!replacingRef.current && statusRef.current !== 'conflict') status('saved');
    })();
    saveTaskRef.current = task.finally(() => { saveTaskRef.current = null; });
    return saveTaskRef.current;
  }, []);

  useEffect(() => {
    if (!hydrated || !runtime.projectState || runtime.changeId <= savedChangeRef.current || statusRef.current === 'conflict' || replacingRef.current) return;
    latestRef.current = { state: runtime.projectState, changeId: runtime.changeId };
    status('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { timerRef.current = null; void flush(); }, 350);
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [hydrated, runtime.changeId, flush]);

  const dispatch = useCallback((action: Action) => {
    if (statusRef.current === 'conflict' || replacingRef.current) return;
    innerDispatch(action);
  }, []);
  const retrySave = useCallback(() => {
    if (statusRef.current === 'conflict') return;
    status('saving'); void flush();
  }, [flush]);
  const retryRestore = useCallback(() => setRestoreAttempt(value => value + 1), []);
  const replaceActive = useCallback(async (): Promise<boolean> => {
    if (replacingRef.current || statusRef.current === 'conflict') return false;
    replacingRef.current = true;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (saveTaskRef.current) await saveTaskRef.current;
    try {
      await replaceProject(expectedRef.current);
      expectedRef.current = null; savedChangeRef.current = 0; latestRef.current = null;
      innerDispatch({ type: 'clear' });
      channelRef.current?.postMessage({ id: null, revision: 0 });
      setSaveError(''); status('idle');
      return true;
    } catch (error) {
      status(error instanceof StaleProjectError ? 'conflict' : 'failed');
      setSaveError(error instanceof Error ? error.message : '无法新建日历，原项目仍已保留。');
      return false;
    } finally { replacingRef.current = false; }
  }, []);
  return <Context.Provider value={{ state: runtime.projectState, affectedMonths: runtime.affectedMonths, hydrated, restoreError, retryRestore, saveStatus, saveError, retrySave, replaceActive, dispatch }}>{children}</Context.Provider>;
}
export function useProject(): ProjectController {
  const value = useContext(Context);
  if (!value) throw new Error('ProjectProvider missing');
  return value;
}
