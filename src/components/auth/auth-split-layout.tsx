import Image from "next/image";
import Link from "next/link";

export function AuthSplitLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          Mitram
        </Link>
        <div className="mt-8 max-w-sm">
          <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="/images/trips/sammed-shikharji-yatra.jpg"
          alt="Pilgrims ascending Sammed Shikharji at sunrise"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-heading text-xl font-bold text-white">
            A yatra with dignity, done safely.
          </p>
        </div>
      </div>
    </div>
  );
}
