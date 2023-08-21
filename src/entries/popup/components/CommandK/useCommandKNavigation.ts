import * as React from 'react';

import { SearchItem } from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { SCROLL_TO_BEHAVIOR } from './utils';

export interface CommandKPageState {
  scrollPosition: number | undefined;
  searchQuery: string;
  selectedCommand: SearchItem | null;
}

const defaultPageState: CommandKPageState = {
  scrollPosition: undefined,
  searchQuery: '',
  selectedCommand: null,
};

interface NavigationStackItem {
  page: CommandKPage;
  pageState: CommandKPageState;
}

interface UseCommandKNavigationOptions {
  clearSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCommand: React.Dispatch<React.SetStateAction<SearchItem | null>>;
}

export const useCommandKNavigation = ({
  clearSearch,
  inputRef,
  listRef,
  searchQuery,
  setSearchQuery,
  setSelectedCommand,
}: UseCommandKNavigationOptions) => {
  const [navigationStack, setNavigationStack] = React.useState<
    NavigationStackItem[]
  >([
    {
      page: PAGES.HOME,
      pageState: defaultPageState,
    },
  ]);
  const [lastDirection, setLastDirection] = React.useState<
    'back' | 'forward' | null
  >(null);

  const clearPageState = React.useCallback(() => {
    setNavigationStack([
      {
        page: PAGES.HOME,
        pageState: defaultPageState,
      },
    ]);
  }, []);

  const goBack = React.useCallback(() => {
    if (navigationStack.length > 1) {
      const prevState = navigationStack[navigationStack.length - 1].pageState;

      setSearchQuery(prevState.searchQuery);
      setSelectedCommand(prevState.selectedCommand);

      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: prevState.scrollPosition,
          behavior: SCROLL_TO_BEHAVIOR,
        });
        inputRef.current?.select();
      });

      setLastDirection('back');
      setNavigationStack((prevStack) => prevStack.slice(0, -1));
    }
  }, [inputRef, listRef, navigationStack, setSearchQuery, setSelectedCommand]);

  const navigateTo = React.useCallback(
    (page: CommandKPage, triggeredCommand: SearchItem) => {
      const departingPageState = {
        searchQuery: searchQuery,
        selectedCommand: triggeredCommand,
        scrollPosition: listRef.current?.scrollTop ?? 0,
      };

      setLastDirection('forward');
      setNavigationStack((prevStack) => [
        ...prevStack,
        {
          page,
          pageState: departingPageState,
        },
      ]);

      clearSearch();
    },
    [clearSearch, listRef, searchQuery],
  );

  return {
    clearPageState,
    currentPage: navigationStack[navigationStack.length - 1].page,
    goBack,
    lastDirection,
    navigateTo,
    previousPageState: navigationStack[navigationStack.length - 1].pageState,
  };
};
