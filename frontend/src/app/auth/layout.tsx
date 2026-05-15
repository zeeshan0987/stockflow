export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">StockFlow</span>
        </div>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "The simplest way to keep track of what you have — and what you're running low on."
          </blockquote>
          <div className="flex flex-col gap-4">
            {[
              ["📦", "Real-time inventory tracking"],
              ["⚠️", "Low stock alerts at a glance"],
              ["🏢", "Multi-tenant, one account per org"],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-primary-foreground/80">
                <span className="text-lg">{icon}</span>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">© 2024 StockFlow MVP</p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
