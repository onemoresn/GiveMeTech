interface SectionHeroProps {
  image: string
  alt: string
}

export function SectionHero({ image, alt }: SectionHeroProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/50 to-void" />
      <div className="absolute inset-0 bg-void/20" />
    </div>
  )
}
