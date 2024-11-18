'use client';
import type { Agency, Contact, User } from '@prisma/client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// import type { PricesList, TicketDetails } from '@/lib/types';

type ModalProviderProps = {
  children: React.ReactNode;
};

export type ModalData = {
  user?: User;
  agency?: Agency;
  // ticket?: TicketDetails[0];
  contact?: Contact;
  // plans?: {
  //   defaultPriceId: Plan;
  //   plans: PricesList['data'];
  // };
};
type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (_modal: React.ReactNode, _fetchData?: () => Promise<any>) => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = useCallback(async (
    modal: React.ReactNode,
    fetchData?: () => Promise<any>,
  ) => {
    if (modal) {
      if (fetchData) {
        const fetchedData = await fetchData();
        setData(prevData => ({ ...prevData, ...(fetchedData || {}) }));
      }
      setShowingModal(modal);
      setIsOpen(true);
    }
  }, []);

  const setClose = useCallback(() => {
    setIsOpen(false);
    setData({});
  }, []);

  const contextValue = useMemo(() => ({ data, setOpen, setClose, isOpen }), [data, setOpen, setClose, isOpen]);

  if (!isMounted) {
    return null;
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within the modal provider');
  }
  return context;
};

export default ModalProvider;
