import {Link} from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Github, Twitter, Linkedin, Mail, TestTube } from 'lucide-react'

const productLinks = [
    { title: 'Features', href: '#features' },
    { title: 'Demo', href: '#demo' },
    { title: 'Pricing', href: '#pricing' },
    { title: 'Documentation', href: '#' },
    { title: 'API Reference', href: '#' },
]

const companyLinks = [
    { title: 'About Us', href: '#' },
    { title: 'Blog', href: '#' },
    { title: 'Careers', href: '#' },
    { title: 'Contact', href: '#' },
    { title: 'Support', href: '#' },
]

const legalLinks = [
    { title: 'Privacy Policy', href: '#' },
    { title: 'Terms of Service', href: '#' },
    { title: 'Cookie Policy', href: '#' },
    { title: 'GDPR', href: '#' },
]

export default function FooterSection() {
    return (
        <footer className="border-t bg-background">
            <div className="mx-auto max-w-6xl px-6">
                {/* Newsletter Section */}
                <div className="py-12 border-b">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <Badge variant="outline" className="mb-4">
                                Newsletter
                            </Badge>
                            <h3 className="text-2xl font-semibold mb-2">
                                Stay Updated with AI Testing
                            </h3>
                            <p className="text-muted-foreground">
                                Get the latest updates on AI test generation, best practices, and product features.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Enter your email" 
                                type="email" 
                                className="flex-1"
                            />
                            <Button>Subscribe</Button>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="py-12 grid md:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <TestTube className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold">AI Test Gen</span>
                        </div>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Revolutionizing software testing with AI-powered test generation. 
                            Build better software faster with comprehensive, intelligent test suites.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon">
                                <Github className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Linkedin className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Mail className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {productLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors duration-150 text-sm">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors duration-150 text-sm">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-muted-foreground hover:text-primary transition-colors duration-150 text-sm">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="py-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-muted-foreground text-sm">
                        © {new Date().getFullYear()} AI Test Gen. All rights reserved.
                    </span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Made with ❤️ for developers</span>
                        <Badge variant="outline" className="text-xs">
                            Powered by AI
                        </Badge>
                    </div>
                </div>
            </div>
        </footer>
    )
}