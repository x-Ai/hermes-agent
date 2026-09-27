import { createContext, useContext } from 'react'

import type { ProfileScope } from '@/api/client'

// The slash-output preview (system message → WisdomCommandOutput) queries the
// wisdom skill/version endpoints. It must use the thread's own profile scope:
// the ambient active profile is the wrong backend in Bot Mode and in
// background-profile tiles. The thread provides it here so the deeply nested
// message component does not have to be threaded through the memo'd list.
const ThreadWisdomProfileContext = createContext<ProfileScope>(undefined)

export const ThreadWisdomProfileProvider = ThreadWisdomProfileContext.Provider

export function useThreadWisdomProfile(): ProfileScope {
  return useContext(ThreadWisdomProfileContext)
}
