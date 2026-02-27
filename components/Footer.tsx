import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-backlot-bg">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/brand/logo.jpg" alt="BACKLOT" width={32} height={32} className="rounded-full" />
              <span className="font-serif text-lg tracking-wider text-backlot-gold">BACKLOT</span>
            </div>
            <p className="mt-3 text-sm text-backlot-muted">
              An on-chain reality docu-series where a meme token + community fund and document ambitious founders and projects in public.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-backlot-text">Platform</h4>
              <div className="mt-2 flex flex-col gap-1.5">
                <Link href="/episodes" className="text-sm text-backlot-muted hover:text-backlot-lavender">Episodes</Link>
                <Link href="/live" className="text-sm text-backlot-muted hover:text-backlot-lavender">Livestream</Link>
                <Link href="/vote" className="text-sm text-backlot-muted hover:text-backlot-lavender">Vote</Link>
                <Link href="/backstage" className="text-sm text-backlot-muted hover:text-backlot-lavender">Backstage</Link>
                <a href="https://github.com/ShdwSpde/backlot/wiki" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">About</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-backlot-text">Community</h4>
              <div className="mt-2 flex flex-col gap-1.5">
                <a href="https://x.com/backlot876" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Twitter/X</a>
                <a href="https://t.me/+Kxu0L6zKjY5kZjcx" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Telegram</a>
                <a href="https://pump.fun/coin/DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Buy $BACKLOT</a>
                <a href="https://linktr.ee/Backlot876" target="_blank" rel="noopener noreferrer" className="text-sm text-backlot-muted hover:text-backlot-lavender">Linktree</a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-backlot-text">Disclaimer</h4>
            <p className="mt-2 text-xs text-backlot-muted">
              $BACKLOT is not equity, doesn&apos;t promise returns, and doesn&apos;t give ownership of The Complex or any project we document. It&apos;s a way to participate in and be recognized inside the social experiment and docu-series.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 pb-4 text-center text-xs text-backlot-muted">
          &copy; {new Date().getFullYear()} Backlot. The Social Experiment.
        </div>
      </div>
    </footer>
  );
}
