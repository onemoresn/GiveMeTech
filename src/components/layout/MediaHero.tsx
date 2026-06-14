interface MediaHeroProps {
  image: string
  alt: string
  video?: string
  videoPoster?: string
}

export function MediaHero({ image, alt, video, videoPoster }: MediaHeroProps) {
  const poster = videoPoster || image

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="w-full h-full object-cover object-center"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : (
        <img
          src={image}
          alt={alt}
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/50 to-void" />
      <div className="absolute inset-0 bg-void/20" />
    </div>
  )
}
