import clsx from "clsx";

type LogoProps = {
  iconSize?: number;
  textSize?: string;
  color?: string;
  gap?: string;
  className?: string;
  showText?: boolean;
};

const Logo = ({
  iconSize = 40,
  textSize = "text-3xl",
  gap = "gap-2.5",
  className,
  showText = true,
}: LogoProps) => {
  return (
    <div
      className={clsx(
        "flex items-center font-semibold select-none text-foreground",
        gap,
        className
      )}
    >
      <span
        className="grid place-items-center rounded-md border border-primary/40 bg-primary/10 font-mono text-primary leading-none"
        style={{ width: iconSize, height: iconSize, fontSize: iconSize * 0.42 }}
        aria-hidden
      >
        {">_"}
      </span>
      {showText && (
        <span className={clsx(textSize, "tracking-tight")}>askdb</span>
      )}
    </div>
  );
};

export default Logo;
