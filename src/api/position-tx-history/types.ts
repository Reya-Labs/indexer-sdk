export type PortfolioPosition = {
    chainId: number;
    vammAddress: string;
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;
    
    type: 'mint';
}