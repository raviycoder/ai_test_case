import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Bot, Code, Zap, GitBranch, TestTube, Shield } from 'lucide-react'
import type { ReactNode }  from 'react'

export default function Features() {

    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent" id="features">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
                        Intelligent Test Generation for Modern Development
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Harness the power of AI to create comprehensive, reliable tests that improve your code quality and development speed.
                    </p>
                </div>
                <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Bot
                                    className="size-6 text-blue-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">AI-Powered Analysis</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Advanced AI analyzes your code structure, dependencies, and logic to generate intelligent, context-aware test cases that cover edge cases you might miss.
                            </p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/20 dark:hover:to-emerald-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <GitBranch
                                    className="size-6 text-green-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">GitHub Integration</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Seamlessly connect your GitHub repositories. Our platform understands your project structure and generates tests that fit your existing workflow perfectly.
                            </p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-950/20 dark:hover:to-violet-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <TestTube
                                    className="size-6 text-purple-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Multiple Test Types</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Generate unit tests, integration tests, and end-to-end tests. Support for Jest, Vitest, PyTest, and more testing frameworks across different languages.
                            </p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/20 dark:hover:to-red-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Zap
                                    className="size-6 text-orange-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Lightning Fast</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Generate comprehensive test suites in seconds, not hours. Real-time processing with instant feedback and progress tracking.
                            </p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-950/20 dark:hover:to-blue-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Code
                                    className="size-6 text-cyan-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Smart Code Understanding</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Deep analysis of function signatures, dependencies, and business logic to create meaningful tests that actually validate your code's behavior.
                            </p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all duration-300">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Shield
                                    className="size-6 text-emerald-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Quality Assurance</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Built-in validation ensures generated tests are syntactically correct, logically sound, and follow best practices for your chosen framework.
                            </p>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)