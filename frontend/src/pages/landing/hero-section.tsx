import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "./header";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { getUnsplashImage } from "@/lib/unsplash";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const [heroImage, setHeroImage] = useState<string>("");

  useEffect(() => {
    getUnsplashImage("coding", "landscape").then(setHeroImage);
  }, []);

  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            {heroImage && (
              <img
                src={heroImage}
                alt="AI coding background"
                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block opacity-20"
                width="3276"
                height="4095"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
            />
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <Link
                  to="#features"
                  className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                >
                  <span className="text-foreground text-sm">
                    ✨ AI-Powered Test Generation for Developers
                  </span>
                  <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                  <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                <h1 className="mx-auto mt-8 max-w-4xl text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Generate AI Tests for Your Code
                </h1>
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground">
                  Transform your development workflow with intelligent test generation. 
                  Connect your GitHub repository and let AI create comprehensive unit and integration tests automatically.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  {isAuthenticated ? (
                    <>
                      <div
                        key={1}
                        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                      >
                        <Button
                          asChild
                          size="lg"
                          className="rounded-xl px-5 text-base"
                        >
                          <Link to="/home">
                            <span className="text-nowrap">Go to Dashboard</span>
                          </Link>
                        </Button>
                      </div>
                      <Button
                        key={2}
                        asChild
                        size="lg"
                        variant="ghost"
                        className="h-10.5 rounded-xl px-5"
                      >
                        <Link to="/home">
                          <span className="text-nowrap">View Your Projects</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        key={1}
                        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                      >
                        <Button
                          size="lg"
                          className="rounded-xl px-5 text-base"
                          onClick={() => {/* Handle GitHub sign in */}}
                        >
                          <span className="text-nowrap">Start Generating Tests</span>
                        </Button>
                      </div>
                      <Button
                        key={2}
                        asChild
                        size="lg"
                        variant="ghost"
                        className="h-10.5 rounded-xl px-5"
                      >
                        <Link to="#demo">
                          <span className="text-nowrap">See Demo</span>
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-background pb-16 pt-16 md:pb-32">
          <div className="group relative m-auto max-w-5xl px-6">
            <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
              <Link
                to="#testimonials"
                className="block text-sm duration-150 hover:opacity-75"
              >
                <span>Trusted by Developers</span>
                <ChevronRight className="ml-1 inline-block size-3" />
              </Link>
            </div>
            <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                  alt="React"
                  height="20"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                  alt="Node.js"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/github.svg"
                  alt="GitHub Logo"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
                  alt="TypeScript"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-5 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg"
                  alt="Jest"
                  height="20"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-4 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"
                  alt="Python"
                  height="16"
                  width="auto"
                />
              </div>
              <div className="flex">
                <img
                  className="mx-auto h-7 w-fit dark:invert"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg"
                  alt="Vue.js"
                  height="28"
                  width="auto"
                />
              </div>

              <div className="flex">
                <img
                  className="mx-auto h-6 w-fit dark:invert"
                  src="https://html.tailus.io/blocks/customers/openai.svg"
                  alt="OpenAI Logo"
                  height="24"
                  width="auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
