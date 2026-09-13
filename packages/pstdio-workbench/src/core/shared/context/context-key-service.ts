import type { Disposable } from "../disposable";
import { createWorkbenchStore, type WorkbenchStore } from "../store/workbench-store";

export type ContextKeyValue = boolean | number | string | undefined;

export interface ContextKeyStoreState {
  values: Record<string, ContextKeyValue>;
}

export interface ContextKeyScope extends Disposable {
  ownerId: string;
  set(key: string, value: ContextKeyValue): void;
  get(key: string): ContextKeyValue;
  delete(key: string): void;
}

export interface ContextKeyService {
  store: WorkbenchStore<ContextKeyStoreState>;
  set(key: string, value: ContextKeyValue): void;
  get(key: string): ContextKeyValue;
  delete(key: string): void;
  /** Each scope has its own lifetime, including scopes with the same owner. */
  createScope(ownerId: string): ContextKeyScope;
  deleteOwner(ownerId: string): void;
  snapshot(): Record<string, ContextKeyValue>;
  matches(expression?: string): boolean;
}

const readComparisonValue = (value: string) => value.replace(/^['"]|['"]$/g, "");

const matchesTerm = (values: Record<string, ContextKeyValue>, term: string) => {
  const trimmed = term.trim();
  if (trimmed.length === 0) return true;

  const comparison = trimmed.match(/^([A-Za-z0-9_.-]+)\s*(==|!=)\s*(.+)$/);
  if (comparison) {
    const [, key, operator, rawValue] = comparison;
    const actual = values[key ?? ""];
    const expected = readComparisonValue(rawValue ?? "");
    return operator === "==" ? String(actual) === expected : String(actual) !== expected;
  }

  if (trimmed.startsWith("!")) return !values[trimmed.slice(1)];

  return Boolean(values[trimmed]);
};

export const matchesContextExpression = (values: Record<string, ContextKeyValue>, expression?: string) => {
  if (!expression) return true;
  return expression.split("||").some((orClause) => orClause.split("&&").every((term) => matchesTerm(values, term)));
};

export const createContextKeyService = (): ContextKeyService => {
  const store = createWorkbenchStore<ContextKeyStoreState>({
    name: "workbench.context",
    initialState: { values: {} },
  });

  let globalValues: Record<string, ContextKeyValue> = {};
  const scopes = new Set<{ ownerId: string; values: Record<string, ContextKeyValue> }>();

  const buildValues = () => {
    const values = { ...globalValues };
    for (const scope of scopes) Object.assign(values, scope.values);
    return values;
  };

  const publish = (action: string) => {
    store.setState({ values: buildValues() }, false, action);
  };

  return {
    store,

    set(key, value) {
      if (globalValues[key] === value) return;
      globalValues = { ...globalValues, [key]: value };
      publish("setContextKey");
    },

    get(key) {
      return store.getState().values[key];
    },

    delete(key) {
      if (!(key in globalValues)) return;
      const { [key]: _removed, ...rest } = globalValues;
      globalValues = rest;
      publish("deleteContextKey");
    },

    createScope(ownerId) {
      const scope = { ownerId, values: {} as Record<string, ContextKeyValue> };
      scopes.add(scope);
      let disposed = false;

      const assertActive = () => {
        if (disposed) throw new Error(`Context key scope disposed: ${ownerId}`);
      };

      return {
        ownerId,

        set(key, value) {
          assertActive();
          const values = scope.values;
          if (values[key] === value) return;
          scope.values = { ...values, [key]: value };
          scopes.add(scope);
          publish("setScopedContextKey");
        },

        get(key) {
          assertActive();
          return scope.values[key];
        },

        delete(key) {
          assertActive();
          const values = scope.values;
          if (!(key in values)) return;
          const { [key]: _removed, ...rest } = values;
          scope.values = rest;
          publish("deleteScopedContextKey");
        },

        dispose() {
          if (disposed) return;
          disposed = true;
          if (!scopes.delete(scope)) return;
          publish("disposeContextKeyScope");
        },
      };
    },

    deleteOwner(ownerId) {
      const ownedScopes = [...scopes].filter((scope) => scope.ownerId === ownerId);
      if (ownedScopes.length === 0) return;
      for (const scope of ownedScopes) {
        scope.values = {};
        scopes.delete(scope);
      }
      publish("deleteContextKeyOwner");
    },

    snapshot() {
      return { ...store.getState().values };
    },

    matches(expression) {
      return matchesContextExpression(store.getState().values, expression);
    },
  };
};
