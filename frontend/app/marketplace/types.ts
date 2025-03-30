export interface FilterOption {
  id: string;
  label: string;
  description?: string;
}

export interface Chain {
  id: string;
  name: string;
  logo: string;
}

export interface MemeToken {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  price: string;
  marketCap: string;
  priceChange: number;
  chain: string;
}
