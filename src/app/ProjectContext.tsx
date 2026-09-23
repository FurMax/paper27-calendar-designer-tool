import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { addImportedAssets, applyAssignment, type AssignmentCommand, type CommandResult } from '../domain/assignment.ts';
import { createEmptyProject, type PhotoAsset, type ProjectState } from '../domain/project.ts';
import type { Location } from './navigation.ts';
import type { MonthNumber } from '../domain/calendar.ts';

type Action =
  | { type: 'start-empty'; id: string }
  | { type: 'start-import'; id: string; assets: PhotoAsset[]; itemIds: string[] }
  | { type: 'import'; assets: PhotoAsset[]; itemIds: string[]; target?: MonthNumber }
  | { type: 'command'; command: AssignmentCommand }
  | { type: 'location'; location: Location };

interface RuntimeState { projectState: ProjectState | null; affectedMonths: MonthNumber[] }

function reducer(runtime: RuntimeState, action: Action): RuntimeState {
  if (action.type === 'start-empty') return { projectState: createEmptyProject(action.id), affectedMonths: [] };
  if (action.type === 'start-import') {
    const result = addImportedAssets(createEmptyProject(action.id), action.assets, action.itemIds);
    return { projectState: result.state, affectedMonths: result.affectedMonths };
  }
  if (!runtime.projectState) return runtime;
  if (action.type === 'location') {
    if (action.location.screen === 'entry') return runtime;
    return { ...runtime, projectState: { ...runtime.projectState, project: { ...runtime.projectState.project,
      lastLocation: action.location.screen === 'editor' ? { screen: 'editor', month: action.location.month } : { screen: action.location.screen } } } };
  }
  let result: CommandResult;
  if (action.type === 'command') result = applyAssignment(runtime.projectState, action.command);
  else {
    const occupiedTarget = action.target && runtime.projectState.project.months[action.target].photoItemId;
    result = addImportedAssets(runtime.projectState, action.assets, action.itemIds, occupiedTarget ? null : action.target);
    if (occupiedTarget && action.target) {
      result = applyAssignment(result.state, { type: 'replace', target: action.target, itemId: action.itemIds[0] });
    }
  }
  return { projectState: result.state, affectedMonths: result.affectedMonths };
}

interface ProjectController {
  state: ProjectState | null;
  affectedMonths: MonthNumber[];
  dispatch: React.Dispatch<Action>;
}
const Context = createContext<ProjectController | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [runtime, dispatch] = useReducer(reducer, { projectState: null, affectedMonths: [] });
  return <Context.Provider value={{ state: runtime.projectState, affectedMonths: runtime.affectedMonths, dispatch }}>{children}</Context.Provider>;
}

export function useProject(): ProjectController {
  const value = useContext(Context);
  if (!value) throw new Error('ProjectProvider missing');
  return value;
}
