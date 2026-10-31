
export interface CartItem {
  nftId: string
  quantity: number
  nft: {
    id: string
    name: string
    imageUrl: string
    priceEth: string
    network: 'ethereum' | 'polygon' | 'solana'
    availableQuantity: number
  }
}

export interface Cart {
  items: CartItem[]
  subtotalEth: string
  discountEth: string
  totalEth: string
  couponCode: string | null
}

export interface AddCartItemInput {
  nftId: string
  quantity: number
}

export interface UpdateCartItemInput {
  nftId: string
  quantity: number
}
