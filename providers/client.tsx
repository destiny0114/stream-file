"use client";

import { createContext, useContext } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
type ClientContextType = [];

const ClientContext = createContext<ClientContextType>([]);

export const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClientContext.Provider value={[]}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools buttonPosition={"bottom-left"} />
      </QueryClientProvider>
    </ClientContext.Provider>
  );
};

export const useClientContext = () => useContext(ClientContext);
