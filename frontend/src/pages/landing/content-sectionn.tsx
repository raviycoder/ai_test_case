import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, CheckCircle, GitBranch, FileCode, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUnsplashImage } from '@/lib/unsplash';

export default function ContentSection() {
  const [demoImage, setDemoImage] = useState<string>("");

  useEffect(() => {
    getUnsplashImage("developer coding", "landscape").then(setDemoImage);
  }, []);

  const steps = [
    {
      icon: GitBranch,
      title: "Connect Repository",
      description: "Link your GitHub repository in seconds",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
    },
    {
      icon: FileCode,
      title: "Select Files",
      description: "Choose the files you want to test",
      color: "text-green-600 bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: TestTube,
      title: "Generate Tests",
      description: "AI creates comprehensive test suites",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20"
    }
  ];

  const features = [
    "Real-time test generation",
    "Multiple testing frameworks",
    "Smart dependency detection",
    "Edge case coverage",
    "Code quality validation",
    "GitHub integration"
  ];

  return (
    <section className="py-16 md:py-32" id="demo">
      <div className="mx-auto max-w-7xl px-6">
        {/* How it works */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            How it works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From Code to Tests in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Three Simple Steps
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform makes test generation effortless. Connect, select, and generate - it's that simple.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
              <Card className="relative z-10 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Demo showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-4">
              ✨ Live Demo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              See AI Test Generation in Action
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Watch as our AI analyzes your code and generates comprehensive test suites that cover edge cases, 
              validate business logic, and ensure your code works as expected.
            </p>
            
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/home">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
            <Card className="relative overflow-hidden">
              <CardContent className="p-0">
                {demoImage ? (
                  <img
                    src={demoImage}
                    alt="AI test generation in action"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Loading demo preview...</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button size="lg" variant="secondary">
                    <Play className="mr-2 w-5 h-5" />
                    Play Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}