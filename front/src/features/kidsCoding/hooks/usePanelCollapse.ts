import { useCallback, useState } from 'react';

export type LearningPanelKey = 'mission' | 'results';

type PanelCollapseState = Record<LearningPanelKey, boolean>;

const DEFAULT_STATE: PanelCollapseState = {
  mission: false,
  results: false,
};

export function usePanelCollapse(initialState?: Partial<PanelCollapseState>) {
  const [collapsed, setCollapsed] = useState<PanelCollapseState>(() => ({
    ...DEFAULT_STATE,
    ...initialState,
  }));

  const togglePanel = useCallback((key: LearningPanelKey) => {
    setCollapsed(previous => ({
      ...previous,
      [key]: !previous[key],
    }));
  }, []);

  const setPanelCollapsed = useCallback((key: LearningPanelKey, value: boolean) => {
    setCollapsed(previous => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  return { collapsed, togglePanel, setPanelCollapsed };
}
