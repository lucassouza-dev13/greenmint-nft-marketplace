
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '../lib/socket'

type NFTUpdatedEvent = {
  nftId: string
  version: number
}

type OrderUpdatedEvent = {
  orderId: string
  status: string
}

export function SocketManager() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleConnect() {
      console.log('[Socket.IO] Conectado:', socket.id)

      // Atualiza os dados após uma reconexão.
      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
    }

    function handleDisconnect(reason: string) {
      console.log('[Socket.IO] Desconectado:', reason)
    }

    function handleNFTUpdated(event: NFTUpdatedEvent) {
      console.log('[Socket.IO] NFT atualizado:', event)

      queryClient.invalidateQueries({ queryKey: ['nfts'] })
      queryClient.invalidateQueries({
        queryKey: ['nft', event.nftId],
      })
    }

    function handleOrderUpdated(event: OrderUpdatedEvent) {
      console.log('[Socket.IO] Pedido atualizado:', event)

      queryClient.invalidateQueries({
        queryKey: ['order', event.orderId],
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('nft.updated', handleNFTUpdated)
    socket.on('order.updated', handleOrderUpdated)

    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('nft.updated', handleNFTUpdated)
      socket.off('order.updated', handleOrderUpdated)
      socket.disconnect()
    }
  }, [queryClient])

  return null
}
