import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, TestTube } from 'lucide-react'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div className="mx-auto max-w-4xl px-6">
                <div className="text-center relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
                    </div>

                    <Badge variant="outline" className="mb-6 bg-white/50 backdrop-blur">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Ready to transform your testing?
                    </Badge>
                    
                    <h2 className="text-balance text-4xl font-bold lg:text-6xl mb-6">
                        Start Building{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Smarter Tests
                        </span>{" "}
                        Today
                    </h2>
                    
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Join thousands of developers who've already revolutionized their testing workflow. 
                        Start your free trial and experience the future of test generation.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <Link to="/home">
                                <TestTube className="mr-2 w-5 h-5" />
                                Start Free Trial
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="bg-white/50 backdrop-blur hover:bg-white/70 transition-all duration-300">
                            <Link to="#demo">
                                <span>Watch Demo</span>
                            </Link>
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>✨ No credit card required • 🚀 Set up in under 2 minutes • 💯 14-day free trial</p>
                    </div>
                </div>
            </div>
        </section>
    )
}