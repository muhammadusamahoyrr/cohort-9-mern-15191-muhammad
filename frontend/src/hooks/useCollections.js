import { useContext } from 'react';
import { CollectionsContext } from '../context/CollectionsContext';

export default function useCollections() {
  const ctx = useContext(CollectionsContext);
  if (!ctx) {
    throw new Error('useCollections must be used inside a <CollectionsProvider>');
  }
  return ctx;
}
