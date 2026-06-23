/** Ícone da moeda do jogo (substitui o antigo 💎). */
export function CoinIcon({ className = 'inline-block w-3.5 h-3.5 object-contain align-[-2px]' }: { className?: string }) {
  return <img src="/assets/items/moeda.png" alt="Moedas" className={className} />
}
