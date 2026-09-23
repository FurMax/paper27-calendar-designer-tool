import { ALL_MONTHS, type MonthNumber } from './calendar.ts';
import { assertProjectInvariants, DEFAULT_CROP, type CalendarProject, type MonthState, type PhotoAsset, type ProjectPhotoItem, type ProjectState } from './project.ts';

export type AssignmentCommand =
  | { type: 'add'; target: MonthNumber; itemId: string }
  | { type: 'move'; source: MonthNumber; target: MonthNumber }
  | { type: 'swap'; source: MonthNumber; target: MonthNumber }
  | { type: 'replace'; target: MonthNumber; itemId: string }
  | { type: 'remove'; source: MonthNumber }
  | { type: 'reuse'; source: MonthNumber; target: MonthNumber; newItemId: string; createdAt: string; replace: boolean }
  | { type: 'delete-unassigned'; itemId: string };

export interface CommandResult {
  state: ProjectState;
  affectedMonths: MonthNumber[];
  deletedAssetIds: string[];
}

function required(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assignedMonth(project: CalendarProject, itemId: string): MonthNumber | undefined {
  return ALL_MONTHS.find(month => project.months[month].photoItemId === itemId);
}

function pair(slot: MonthState, itemId: string | null): MonthState {
  return { ...slot, photoItemId: itemId, crop: itemId ? { ...DEFAULT_CROP } : null };
}

export function applyAssignment(input: ProjectState, command: AssignmentCommand): CommandResult {
  assertProjectInvariants(input);
  const project: CalendarProject = { ...input.project, months: { ...input.project.months }, photoItems: { ...input.project.photoItems } };
  const assets = { ...input.assets };
  const affectedMonths: MonthNumber[] = [];
  const deletedAssetIds: string[] = [];
  const put = (month: MonthNumber, itemId: string | null) => { project.months[month] = pair(project.months[month], itemId); affectedMonths.push(month); };
  const freeItem = (itemId: string) => {
    required(project.photoItems[itemId], 'Unknown photo item');
    required(assignedMonth(project, itemId) === undefined, 'Photo item already assigned');
  };
  switch (command.type) {
    case 'add':
      required(project.months[command.target].photoItemId === null, 'Target is occupied');
      freeItem(command.itemId);
      put(command.target, command.itemId);
      break;
    case 'move': {
      required(command.source !== command.target, 'Same month');
      const itemId = project.months[command.source].photoItemId;
      required(itemId && project.months[command.target].photoItemId === null, 'Move needs occupied source and empty target');
      put(command.source, null);
      put(command.target, itemId);
      break;
    }
    case 'swap': {
      required(command.source !== command.target, 'Same month');
      const left = project.months[command.source].photoItemId;
      const right = project.months[command.target].photoItemId;
      required(left && right, 'Swap needs two occupied months');
      put(command.source, right);
      put(command.target, left);
      break;
    }
    case 'replace':
      required(project.months[command.target].photoItemId, 'Replace needs occupied target');
      freeItem(command.itemId);
      put(command.target, command.itemId);
      break;
    case 'remove':
      required(project.months[command.source].photoItemId, 'Source is empty');
      put(command.source, null);
      break;
    case 'reuse': {
      required(command.source !== command.target, 'Same month');
      const sourceItemId = project.months[command.source].photoItemId;
      required(sourceItemId, 'Source is empty');
      required(!project.photoItems[command.newItemId], 'Duplicate item ID');
      const occupied = !!project.months[command.target].photoItemId;
      required(occupied === command.replace, 'Occupied target needs explicit replace');
      project.photoItems[command.newItemId] = { id: command.newItemId, assetId: project.photoItems[sourceItemId].assetId, createdAt: command.createdAt };
      put(command.target, command.newItemId);
      break;
    }
    case 'delete-unassigned': {
      freeItem(command.itemId);
      const assetId = project.photoItems[command.itemId].assetId;
      delete project.photoItems[command.itemId];
      if (!Object.values(project.photoItems).some(item => item.assetId === assetId)) {
        delete assets[assetId];
        deletedAssetIds.push(assetId);
      }
      break;
    }
  }
  const state = { project, assets };
  assertProjectInvariants(state);
  return { state, affectedMonths, deletedAssetIds };
}

export function addImportedAssets(input: ProjectState, incoming: readonly PhotoAsset[], itemIds: readonly string[], assignFrom?: MonthNumber | null): CommandResult {
  required(incoming.length >= 1 && incoming.length <= 12 && incoming.length === itemIds.length, 'Bulk selection must contain 1–12 photos');
  assertProjectInvariants(input);
  const project = { ...input.project, months: { ...input.project.months }, photoItems: { ...input.project.photoItems } };
  const assets = { ...input.assets };
  const affectedMonths: MonthNumber[] = [];
  const startIndex = assignFrom ? assignFrom - 1 : 0;
  let next = startIndex;
  for (let index = 0; index < incoming.length; index++) {
    const asset = incoming[index];
    const itemId = itemIds[index];
    required(asset.decodedWidth > 0 && asset.decodedHeight > 0 && !assets[asset.id] && !project.photoItems[itemId], 'Invalid imported photo');
    assets[asset.id] = asset;
    const item: ProjectPhotoItem = { id: itemId, assetId: asset.id, createdAt: asset.importedAt };
    project.photoItems[itemId] = item;
    while (next < 12 && project.months[ALL_MONTHS[next]].photoItemId) next++;
    if (assignFrom !== null && next < 12) {
      const month = ALL_MONTHS[next];
      project.months[month] = pair(project.months[month], itemId);
      affectedMonths.push(month);
      next++;
    }
  }
  const state = { project, assets };
  assertProjectInvariants(state);
  return { state, affectedMonths, deletedAssetIds: [] };
}
