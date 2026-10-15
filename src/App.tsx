import { useState } from 'react'
import { formatEther, isAddress, parseEther } from 'viem'
import {
  useBalance,
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'

function toWei(amount: string) {
  try {
    const wei = parseEther(amount)
    return wei > 0n ? wei : undefined
  } catch {
    return undefined
  }
}

function App() {
  const connection = useConnection()
  const connect = useConnect()
  const connectors = useConnectors()
  const disconnect = useDisconnect()
  const switchChain = useSwitchChain()

  const [address, setAddress] = useState('')
  const balance = useBalance({
    address: isAddress(address) ? address : undefined,
    chainId: sepolia.id,
  })

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const wei = toWei(amount)
  const send = useSendTransaction()
  const receipt = useWaitForTransactionReceipt({
    hash: send.data,
    chainId: sepolia.id,
  })

  return (
    <>
      <h2>Wallet</h2>
      {connection.status === 'connected' ? (
        <div>
          {connection.address}{' '}
          <button type="button" onClick={() => disconnect.mutate({})}>
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          {connectors.length === 0 && 'No wallet found. Install MetaMask.'}
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => connect.mutate({ connector })}
            >
              {connector.name}
            </button>
          ))}
          <div>{connect.error?.message.split('\n')[0]}</div>
        </div>
      )}

      <h2>Check balance</h2>
      <label>
        Address{' '}
        <input
          size={46}
          value={address}
          onChange={(e) => setAddress(e.target.value.trim())}
        />
      </label>{' '}
      <button
        type="button"
        disabled={!isAddress(address)}
        onClick={() => balance.refetch()}
      >
        Refresh
      </button>
      <div>
        {address && !isAddress(address) && 'Invalid address'}
        {balance.isFetching && 'Loading... '}
        {balance.data &&
          `${formatEther(balance.data.value)} ${balance.data.symbol}`}
        {balance.error?.message.split('\n')[0]}
      </div>

      {connection.status === 'connected' && (
        <>
          <h2>Send Sepolia ETH</h2>
          {connection.chainId !== sepolia.id ? (
            <div>
              <button
                type="button"
                onClick={() => switchChain.mutate({ chainId: sepolia.id })}
              >
                Switch to Sepolia
              </button>
              <div>{switchChain.error?.message.split('\n')[0]}</div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!isAddress(to) || !wei) return
                send.mutate({ to, value: wei, chainId: sepolia.id })
              }}
            >
              <div>
                <label>
                  To{' '}
                  <input
                    size={46}
                    value={to}
                    onChange={(e) => setTo(e.target.value.trim())}
                  />
                </label>
              </div>
              <div>
                <label>
                  Amount (ETH){' '}
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.trim())}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={!isAddress(to) || !wei || send.isPending}
              >
                {send.isPending ? 'Confirm in wallet...' : 'Send'}
              </button>
            </form>
          )}
          <div>{send.error?.message.split('\n')[0]}</div>
          {send.data && (
            <div>
              <a
                href={`${sepolia.blockExplorers.default.url}/tx/${send.data}`}
                target="_blank"
                rel="noreferrer"
              >
                {send.data}
              </a>
              <div>
                {receipt.data?.status ?? (receipt.isLoading && 'Pending...')}
                {receipt.error?.message.split('\n')[0]}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default App
