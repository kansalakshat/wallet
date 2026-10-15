import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [sepolia],
  transports: {
    // viem's default Sepolia RPC (thirdweb) returns 429 without a client ID
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
