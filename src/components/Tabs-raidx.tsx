import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { cn } from "../utils/cn";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { useContext, createContext } from "react";

type TabsContextType = {
  selectedTab: string | null;
  hoveredTab: string | null;
  setSelectedTab: (index: string) => void;
  onTabChange?: (index: string) => void;
  setHoveredTab: (index: string | null, keyboard?: boolean) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

const useTabsContext = () => useContext(TabsContext) as TabsContextType;

const Tab = ({ children, value }: { children: ReactNode; value: string }) => {
  const { hoveredTab, onTabChange, selectedTab, setHoveredTab, setSelectedTab } = useTabsContext();

  const tabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const listenerFunc = () => {
      setHoveredTab(null);
      tabRef.current?.blur();
    };
    window.addEventListener("blur", listenerFunc);

    return () => window.removeEventListener("blur", listenerFunc);
  }, [setHoveredTab, value]);

  return (
    <ToggleGroup.ToggleGroupItem value={value} asChild>
      <motion.button
        ref={tabRef}
        className={cn(
          "relative flex cursor-pointer select-none items-center whitespace-nowrap rounded-md py-1.5 px-2.5 text-slate-500 transition-colors focus-visible:outline-none",
          {
            "a text-sky-700": hoveredTab === value,
            "text-sky-700": selectedTab === value,
          }
        )}
        onHoverStart={() => setHoveredTab(value)}
        onFocus={() => setHoveredTab(value, true)}
        onClick={() => {
          setSelectedTab(value);
          onTabChange?.(value);
        }}
      >
        <span className="z-20">{children}</span>
        {value === selectedTab ? (
          <motion.div
            transition={transition}
            layoutId="underline"
            className={"absolute left-2 right-2 -bottom-2 z-10 h-0.5 bg-sky-600"}
          />
        ) : null}
        <AnimatePresence>
          {value === hoveredTab ? (
            <motion.div
              className="absolute bottom-0 left-0 right-0 top-0 z-10 rounded-md bg-sky-100"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={transition}
              layoutId="hover"
            />
          ) : null}
        </AnimatePresence>
      </motion.button>
    </ToggleGroup.ToggleGroupItem>
  );
};

const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

type TabsProps = {
  children: ReactNode;
  onTabChange?: (value: string) => void;
  defaultValue?: string | null;
};

export const Tabs = ({ children, onTabChange, defaultValue = null }: TabsProps) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(() => defaultValue);
  const [keyboardHovered, setKeyboardHovered] = useState(false);

  useEffect(() => {
    setSelectedTab(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (selectedTab?.startsWith("/[") && !defaultValue?.startsWith("/[")) {
      setSelectedTab(defaultValue);
    }
  }, [defaultValue, selectedTab]);

  useEffect(() => {
    if (keyboardHovered) {
      const timeout = setTimeout(() => {
        setHoveredTab(null);
        setKeyboardHovered(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [keyboardHovered]);

  const handleHoveredTab = useCallback((val: string | null, keyboard = false) => {
    setHoveredTab(val);
    setKeyboardHovered(keyboard);
  }, []);

  return (
    <ToggleGroup.Root type="single" asChild>
      <motion.nav
        className="relative z-0 flex flex-shrink-0 items-center py-2"
        onHoverEnd={() => setHoveredTab(null)}
      >
        <LayoutGroup id="tabs">
          <TabsContext.Provider
            value={{ hoveredTab, selectedTab, onTabChange, setHoveredTab: handleHoveredTab, setSelectedTab }}
          >
            {children}
          </TabsContext.Provider>
        </LayoutGroup>
      </motion.nav>
    </ToggleGroup.Root>
  );
};

Tabs.Tab = Tab;

export const NavTabs = ({
  basePath = "/",
  onTabChange,
  ...tabProps
}: Omit<TabsProps, "defaultValue"> & { basePath?: string }) => {
  const router = useRouter();

  const url = router.asPath.startsWith(basePath) ? router.asPath.replace(basePath, "") : router.asPath;

  const redirect = (val: string) => {
    // const newUrl = val === "/" ? basePath : `${basePath}${val}`;
    const newUrl = `${basePath}${val}`;
    onTabChange?.(newUrl);
    return router.push(newUrl);
  };

  const defaultValue = `/${url.split("/")[1] ?? ""}`;

  return <Tabs {...tabProps} defaultValue={defaultValue} onTabChange={redirect} />;
};

NavTabs.Tab = Tab;
