
import { Link } from '@tanstack/react-router'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#49352b] bg-[#1a110d]">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-8 md:py-20">
        <div>
          <span className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.3em] text-[#e49a55]">
            Explore o universo NFT
          </span>

          <h1 className="max-w-xl text-4xl font-black uppercase leading-tight tracking-tight text-[#f5f0e8] md:text-6xl">
            Seja dono do futuro da
            <span className="block text-[#e49a55]">
              arte digital.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#b9a89b]">
            Descubra obras digitais exclusivas, explore coleções
            e encontre seu próximo NFT favorito.
          </p>

          <Link
            to="/"
            hash="catalogo"
            className="mt-8 inline-flex rounded-lg bg-[#e49a55] px-7 py-3 font-bold text-[#120d0a] transition hover:bg-[#f0ad70]"
          >
            Explorar coleção
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-4 rounded-full bg-[#e49a55]/10 blur-3xl" />

          <img
            src="/nfts/emerald-ape.png"
            alt="Emerald Ape, arte digital em destaque"
            className="relative aspect-square w-full rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
