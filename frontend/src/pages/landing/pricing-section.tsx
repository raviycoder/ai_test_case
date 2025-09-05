import {Link} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Rocket } from 'lucide-react'

export default function Pricing() {
    return (
        <section className="py-16 md:py-32" id="pricing">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <Badge variant="outline" className="mb-4">
                        Pricing
                    </Badge>
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">
                        Simple, Transparent{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Choose the perfect plan for your team size and testing needs. Start free and scale as you grow.
                    </p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
                    <Card className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-blue-600" />
                                <CardTitle className="font-medium">Free</CardTitle>
                            </div>
                            <span className="my-3 block text-2xl font-semibold">$0 <span className="text-sm font-normal text-muted-foreground">/ month</span></span>
                            <CardDescription className="text-sm">Perfect for trying out AI test generation</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '50 test generations per month',
                                    'Basic testing frameworks',
                                    'GitHub integration',
                                    'Community support',
                                    'Up to 3 repositories'
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3 text-green-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link to="/home">Get Started Free</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="relative border-2 border-primary/20 hover:shadow-xl transition-shadow">
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600">
                            Most Popular
                        </Badge>

                        <div className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-5 h-5 text-yellow-600" />
                                    <CardTitle className="font-medium">Pro</CardTitle>
                                </div>
                                <span className="my-3 block text-2xl font-semibold">$29 <span className="text-sm font-normal text-muted-foreground">/ month</span></span>
                                <CardDescription className="text-sm">Best for small to medium teams</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <hr className="border-dashed" />
                                <ul className="list-outside space-y-3 text-sm">
                                    {[
                                        'Unlimited test generations',
                                        'All testing frameworks',
                                        'Real-time test generation',
                                        'Advanced code analysis',
                                        'Priority support',
                                        'Up to 50 repositories',
                                        'Team collaboration tools',
                                        'Custom test templates',
                                        'API access',
                                        'Analytics dashboard'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3 text-green-600" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    asChild
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                    <Link to="/home">Start Pro Trial</Link>
                                </Button>
                            </CardFooter>
                        </div>
                    </Card>

                    <Card className="flex flex-col hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <Rocket className="w-5 h-5 text-purple-600" />
                                <CardTitle className="font-medium">Enterprise</CardTitle>
                            </div>
                            <span className="my-3 block text-2xl font-semibold">Custom <span className="text-sm font-normal text-muted-foreground">pricing</span></span>
                            <CardDescription className="text-sm">For large teams and organizations</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    'Everything in Pro',
                                    'Unlimited repositories',
                                    'On-premise deployment',
                                    'Custom AI model training',
                                    'Dedicated support manager',
                                    'SLA guarantee',
                                    'Advanced security features',
                                    'Custom integrations'
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3 text-green-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link to="/contact">Contact Sales</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        All plans include a 14-day free trial. No credit card required. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    )
}