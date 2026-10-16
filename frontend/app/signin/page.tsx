import Logo from "@/components/logo";
import AuthForm from "@/components/login/auth-form";

const page = () => {
  return (
    <div className="h-screen w-screen flex">
      <div className="flex-1 bg-background">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <AuthForm />
        </div>
      </div>
      <div className="relative flex-1 bg-sidebar flex items-center justify-center border-l border-border overflow-hidden">
        {/* hairline console grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(to right, #232A33 1px, transparent 1px), linear-gradient(to bottom, #232A33 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
          }}
          aria-hidden
        />
        {/* faint indigo glow behind the mark */}
        <div
          className="pointer-events-none absolute left-1/2 top-[42%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(109,139,255,0.18), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center text-center gap-5 max-w-xl px-6">
          <Logo iconSize={64} textSize="text-5xl" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Skip the SQL. Ask your database in plain English and get
            answers instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
