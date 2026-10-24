import Image from 'next/image';

/**
 * A project screenshot that fills its (sized) parent.
 * Cover images crop to fill; the rest sit centred on the dark backdrop.
 */
export default function ProjectMedia({ project, sizes, priority = false, alt, className = '' }) {
  const { image } = project;
  return (
    <div className={`ol-media${project.cover ? '' : ' ol-media--contain'}${className ? ` ${className}` : ''}`}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt ?? `${project.name} preview`}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
